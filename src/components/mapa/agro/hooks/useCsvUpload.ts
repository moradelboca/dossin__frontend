import { useState } from 'react';
import { supabaseAgro } from '../../../../lib/supabase';
import { OrdenTrabajo } from '../components/ordenes-trabajo/types';
import { parseCsvContent, convertCsvToOrdenTrabajo } from '../components/ordenes-trabajo/csvParser';

export interface UploadResult {
  success: boolean;
  message: string;
  totalProcessed: number;
  newRecords: number;
  duplicates: number;
  errors: string[];
}

export const useCsvUpload = () => {
  const [isUploading, setIsUploading] = useState(false);

  /**
   * Procesa y carga un archivo CSV de órdenes de trabajo
   */
  const uploadCsvFile = async (file: File): Promise<UploadResult> => {
    setIsUploading(true);
    
    try {
      console.log('📁 Iniciando carga de archivo CSV:', file.name);
      
      // Leer contenido del archivo
      const csvContent = await readFileContent(file);
      console.log('📄 Contenido CSV leído, tamaño:', csvContent.length, 'caracteres');
      
      // Parsear CSV
      const parsedData = parseCsvContent(csvContent);
      console.log('📊 CSV parseado:', {
        totalRows: parsedData.totalRows,
        validRows: parsedData.rows.length,
        errors: parsedData.errors.length
      });
      
      if (parsedData.errors.length > 0) {
        console.warn('⚠️ Errores en el parseo del CSV:', parsedData.errors);
      }
      
      if (parsedData.rows.length === 0) {
        return {
          success: false,
          message: 'No se encontraron filas válidas en el archivo CSV',
          totalProcessed: parsedData.totalRows,
          newRecords: 0,
          duplicates: 0,
          errors: parsedData.errors
        };
      }
      
      // Convertir a formato OrdenTrabajo
      const ordenesTrabajo = convertCsvToOrdenTrabajo(parsedData.rows);
      console.log('🔄 Convertidas a OrdenTrabajo:', ordenesTrabajo.length, 'órdenes');
      
      // Detectar duplicados y procesar
      const result = await processOrdenesTrabajo(ordenesTrabajo);
      
      // Agregar errores de parseo a los errores del resultado
      result.errors = [...result.errors, ...parsedData.errors];
      
      console.log('✅ Procesamiento completado:', result);
      return result;
      
    } catch (error) {
      console.error('❌ Error en carga de CSV:', error);
      return {
        success: false,
        message: `Error procesando archivo: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        totalProcessed: 0,
        newRecords: 0,
        duplicates: 0,
        errors: [error instanceof Error ? error.message : 'Error desconocido']
      };
    } finally {
      setIsUploading(false);
    }
  };

  /**
   * Lee el contenido de un archivo como texto
   */
  const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const tryEncoding = (encoding: string): void => {
        const reader = new FileReader();
        
        reader.onload = (event) => {
          const content = event.target?.result as string;
          
          // Verificar si hay caracteres mal codificados
          if (content.includes('') || content.includes('?')) {
            // Si hay caracteres mal codificados, intentar con otra codificación
            if (encoding === 'UTF-8') {
              tryEncoding('Windows-1252');
              return;
            }
          }
          
          // Intentar corregir caracteres mal codificados
          const correctedContent = fixEncoding(content);
          resolve(correctedContent);
        };
        
        reader.onerror = () => {
          if (encoding === 'UTF-8') {
            // Si UTF-8 falla, intentar con Windows-1252
            tryEncoding('Windows-1252');
          } else {
            reject(new Error('Error leyendo el archivo con ambas codificaciones'));
          }
        };
        
        reader.readAsText(file, encoding);
      };
      
      // Empezar con UTF-8
      tryEncoding('UTF-8');
    });
  };

  /**
   * Corrige caracteres mal codificados comunes
   */
  const fixEncoding = (text: string): string => {
    // Mapeo de caracteres mal codificados comunes
    const encodingMap: { [key: string]: string } = {
      '': 'ó',
      '': 'á',
      '': 'é',
      '': 'í',
      '': 'ú',
      '': 'ñ',
      '': 'Ñ',
      '': 'Á',
      '': 'É',
      '': 'Í',
      '': 'Ó',
      '': 'Ú',
      '': 'ü',
      '': 'Ü',
      '': '¿',
      '': '¡',
      '': '°',
      '': '€',
      '': '£',
      '': '¥',
      // Caracteres específicos del problema - usar diferentes caracteres
      '¥2': '2',
      '¥0': '0',
      '¥1': '1',
      '¥4': '4',
      '¥5': '5',
      '¥3': '3',
      '¥6': '6',
      '¥7': '7',
      '¥8': '8',
      '¥9': '9',
      '¥-': '-'
    };

    let correctedText = text;
    
    // Reemplazar caracteres mal codificados
    Object.entries(encodingMap).forEach(([wrong, correct]) => {
      correctedText = correctedText.replace(new RegExp(wrong, 'g'), correct);
    });

    return correctedText;
  };

  /**
   * Procesa las órdenes de trabajo, detectando duplicados y guardando solo las nuevas
   */
  const processOrdenesTrabajo = async (ordenes: OrdenTrabajo[]): Promise<UploadResult> => {
    try {
      console.log('🔍 Procesando órdenes de trabajo...');
      
      // Obtener IDs de las órdenes a procesar
      const idsToCheck = ordenes
        .map(o => o.transaccionId)
        .filter(id => id !== undefined) as number[];
      
      if (idsToCheck.length === 0) {
        return {
          success: false,
          message: 'No se encontraron IDs válidos en las órdenes',
          totalProcessed: ordenes.length,
          newRecords: 0,
          duplicates: 0,
          errors: ['Todas las órdenes deben tener un ID válido']
        };
      }
      
      console.log('🔍 Verificando duplicados para', idsToCheck.length, 'IDs...');
      
      // Verificar cuáles ya existen en la base de datos
      const { data: existingOrdenes, error: queryError } = await supabaseAgro
        .from('OrdenTrabajo')
        .select('transaccionId')
        .in('transaccionId', idsToCheck);
      
      if (queryError) {
        console.error('❌ Error consultando duplicados:', queryError);
        throw new Error(`Error consultando duplicados: ${queryError.message}`);
      }
      
      const existingIds = new Set(existingOrdenes?.map(o => o.transaccionId) || []);
      console.log('📊 IDs existentes encontrados:', existingIds.size);
      console.log('📊 Primeros 10 IDs existentes:', Array.from(existingIds).slice(0, 10));
      console.log('📊 Primeros 10 IDs a verificar:', idsToCheck.slice(0, 10));
      
      // Separar nuevas y duplicadas
      const nuevasOrdenes = ordenes.filter(o => 
        o.transaccionId && !existingIds.has(o.transaccionId)
      );
      const duplicadas = ordenes.filter(o => 
        o.transaccionId && existingIds.has(o.transaccionId)
      );
      
      console.log('📊 Clasificación:', {
        nuevas: nuevasOrdenes.length,
        duplicadas: duplicadas.length,
        total: ordenes.length
      });
      
      // Debug: verificar algunos IDs específicos
      if (nuevasOrdenes.length > 0) {
        console.log('🔍 Primeros 5 IDs de nuevas órdenes:', nuevasOrdenes.slice(0, 5).map(o => o.transaccionId));
        console.log('🔍 ¿Están en existingIds?', nuevasOrdenes.slice(0, 5).map(o => existingIds.has(o.transaccionId!)));
      }
      
      // Guardar solo las nuevas órdenes
      let savedCount = 0;
      const errors: string[] = [];
      
      if (nuevasOrdenes.length > 0) {
        console.log('💾 Guardando', nuevasOrdenes.length, 'nuevas órdenes...');
        
        // Preparar datos para insertar
        const datosParaInsertar = nuevasOrdenes.map(orden => ({
          transaccionId: orden.transaccionId,
          establecimiento: orden.establecimiento || '',
          estado: orden.estado || 'pendiente',
          fecha: orden.fechaVencimiento ? new Date(orden.fechaVencimiento) : null,
          laboreo: orden.laboreo || '',
          laboreoId: orden.laboreoId || null,
          datos: orden.datos || {}
        }));
        
        // Insertar en lotes para evitar límites de tamaño
        const batchSize = 100;
        for (let i = 0; i < datosParaInsertar.length; i += batchSize) {
          const batch = datosParaInsertar.slice(i, i + batchSize);
          
          // Eliminar duplicados dentro del mismo lote
          const batchSinDuplicados = batch.reduce((acc, item) => {
            const existingIndex = acc.findIndex(existing => existing.transaccionId === item.transaccionId);
            if (existingIndex === -1) {
              acc.push(item);
            } else {
              // Si ya existe, actualizar con los datos más recientes
              acc[existingIndex] = item;
            }
            return acc;
          }, [] as typeof batch);
          
          console.log(`📦 Lote ${Math.floor(i/batchSize) + 1}: ${batch.length} originales → ${batchSinDuplicados.length} sin duplicados`);
          
          const { error: insertError } = await supabaseAgro
            .from('OrdenTrabajo')
            .upsert(batchSinDuplicados, {
              onConflict: 'transaccionId',
              ignoreDuplicates: false
            });
          
          if (insertError) {
            console.error(`❌ Error insertando lote ${Math.floor(i/batchSize) + 1}:`, insertError);
            errors.push(`Error insertando lote ${Math.floor(i/batchSize) + 1}: ${insertError.message}`);
          } else {
            savedCount += batch.length;
            console.log(`✅ Lote ${Math.floor(i/batchSize) + 1} guardado:`, batch.length, 'órdenes');
          }
        }
      }
      
      // Actualizar fecha de última actualización en la tabla de control
      await updateLastUpdateDate();
      
      const success = errors.length === 0;
      const message = success 
        ? `Carga completada: ${savedCount} nuevas órdenes guardadas, ${duplicadas.length} duplicadas omitidas`
        : `Carga completada con errores: ${savedCount} nuevas órdenes guardadas, ${duplicadas.length} duplicadas omitidas, ${errors.length} errores`;
      
      return {
        success,
        message,
        totalProcessed: ordenes.length,
        newRecords: savedCount,
        duplicates: duplicadas.length,
        errors
      };
      
    } catch (error) {
      console.error('❌ Error procesando órdenes:', error);
      return {
        success: false,
        message: `Error procesando órdenes: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        totalProcessed: ordenes.length,
        newRecords: 0,
        duplicates: 0,
        errors: [error instanceof Error ? error.message : 'Error desconocido']
      };
    }
  };

  /**
   * Actualiza la fecha de última actualización en la tabla de control
   */
  const updateLastUpdateDate = async () => {
    try {
      const { error } = await supabaseAgro
        .from('SyncControl')
        .upsert({
          entidad: 'ordenes_trabajo',
          ultima_sincronizacion: new Date().toISOString(),
          estado: 'idle',
          total_registros: null,
          error_message: null
        }, {
          onConflict: 'entidad'
        });
      
      if (error) {
        console.warn('⚠️ Error actualizando fecha de control:', error);
      } else {
        console.log('✅ Fecha de actualización actualizada');
      }
    } catch (error) {
      console.warn('⚠️ Error actualizando control de sincronización:', error);
    }
  };

  return {
    uploadCsvFile,
    isUploading
  };
};
