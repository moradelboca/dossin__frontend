import { useState } from 'react';
import { supabaseAgro } from '../../../../lib/supabase';
import { finnegansApi } from '../components/finnegans/finnegansApi';
import { useSyncControl } from './useSyncControl';
import { OrdenTrabajo } from '../components/ordenes-trabajo/types';

interface SyncResult {
  success: boolean;
  message: string;
  data?: OrdenTrabajo[];
  totalProcessed?: number;
  isHistorical?: boolean;
}

export const useSyncOrdenesTrabajo = (establecimientoFiltro?: string) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncResult, setLastSyncResult] = useState<SyncResult | null>(null);
  
  const { 
    syncControl, 
    checkSyncNeeded, 
    updateSyncStatus, 
    getHistoricalStartDate
  } = useSyncControl('ordenes_trabajo');

  // Transformar datos de Finnegans a formato interno
  const transformFinnegansData = (finnegansData: any[]): OrdenTrabajo[] => {
    return finnegansData.map((item: any, index) => {
      const transaccionId = item.TRANSACCIONID || item.transaccionId || item.codigo || item.id;
      return {
        id: transaccionId?.toString() || `finnegans-${index}`,
        titulo: item.LABOREO || item.laboreo || item.titulo || item.nombre || `Orden ${transaccionId || index}`,
        descripcion: item.descripcion || item.detalle || '',
        prioridad: item.prioridad || 'media',
        estado: mapFinnegansEstado(item.ESTADO || item.estado || item.situacion),
        asignadoA: item.asignadoA || item.responsable,
        fechaVencimiento: item.FECHA || item.fecha || item.fechaVencimiento || item.fechaFin,
        ubicacionId: item.ESTABLECIMIENTO || item.establecimiento || item.ubicacionId,
        creadoPor: 'Finnegans API',
        creadoEn: item.fechaCreacion || new Date().toISOString(),
        actualizadoEn: new Date().toISOString(),
        codigoFinnegans: item.codigo || item.id,
        activo: item.activo !== false,
        situacion: item.situacion || item.ESTADO || item.estado,
        // Campos adicionales de Finnegans - usar nombres exactos de la API
        laboreo: item.LABOREO || item.laboreo,
        codigo: item.codigo,
        establecimiento: item.ESTABLECIMIENTO || item.establecimiento,
        laboreoId: item.LABOREOID || item.laboreoId,
        transaccionId: transaccionId
      };
    });
  };

  // Mapear estados de Finnegans a estados internos
  const mapFinnegansEstado = (estadoFinnegans: string): 'pendiente' | 'en_progreso' | 'completada' => {
    const estado = estadoFinnegans?.toLowerCase() || '';
    
    if (estado.includes('complet') || estado.includes('finaliz') || estado.includes('termin')) {
      return 'completada';
    }
    
    if (estado.includes('progreso') || estado.includes('ejecut') || estado.includes('trabaj')) {
      return 'en_progreso';
    }
    
    return 'pendiente';
  };

  // Obtener órdenes de trabajo desde Finnegans con paginación
  const fetchOrdenesFromFinnegans = async (fechaDesde?: Date, forceHistorical = false): Promise<any[]> => {
    try {
      // Obtener token
      const token = await finnegansApi.getAccessToken();
      
      let todasLasOrdenes: any[] = [];
      let offset = 0;
      const limit = 1000; // Límite por página
      let hasMoreData = true;
      let pageCount = 0;
      const maxPages = 50; // Límite de seguridad para evitar bucles infinitos
      
      console.log('🔄 Iniciando consulta paginada a Finnegans...');
      
      while (hasMoreData && pageCount < maxPages) {
        pageCount++;
        console.log(`📄 Consultando página ${pageCount} (offset: ${offset})...`);
        
        // Construir parámetros para la consulta
        const params = new URLSearchParams();
        
        // Solo aplicar filtro de fecha si NO es carga histórica forzada
        if (fechaDesde && !forceHistorical) {
          params.append('fechaDesde', fechaDesde.toISOString().split('T')[0]);
          console.log('📅 Aplicando filtro de fecha:', fechaDesde.toISOString().split('T')[0]);
        } else if (forceHistorical) {
          console.log('🔄 Carga histórica: sin filtro de fecha para obtener todos los registros');
        }
        
        // Agregar otros parámetros según la API de Finnegans
        params.append('activo', 'true');
        params.append('limit', limit.toString());
        params.append('offset', offset.toString());
        params.append('ACCESS_TOKEN', token);
        
        // Si hay filtro de establecimiento, agregarlo como parámetro de la API si es posible
        if (establecimientoFiltro) {
          params.append('establecimiento', establecimientoFiltro);
          console.log('🏢 Aplicando filtro de establecimiento en API:', establecimientoFiltro);
        }
        
        const url = `https://api.finneg.com/api/reports/InformeOrdenesTrabajoApi?${params.toString()}`;
        console.log(`🌐 URL de consulta página ${pageCount}:`, url);
        
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`Error de Finnegans en página ${pageCount}: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        const ordenesPagina = Array.isArray(data) ? data : data.data || [];
        
        console.log(`📊 Página ${pageCount}: ${ordenesPagina.length} órdenes obtenidas`);
        
        if (ordenesPagina.length === 0) {
          hasMoreData = false;
          console.log('📄 No hay más datos, finalizando paginación');
        } else {
          todasLasOrdenes = todasLasOrdenes.concat(ordenesPagina);
          offset += limit;
          
          // Si obtenemos menos registros que el límite, probablemente sea la última página
          if (ordenesPagina.length < limit) {
            hasMoreData = false;
            console.log('📄 Última página detectada (menos registros que el límite)');
          }
        }
        
        // Pequeña pausa entre consultas para no sobrecargar la API
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      console.log(`📊 Total de órdenes obtenidas de Finnegans (${pageCount} páginas): ${todasLasOrdenes.length}`);
      
      // Filtrar por establecimiento si se especifica (filtro adicional en caso de que la API no lo soporte)
      if (establecimientoFiltro) {
        const ordenesAntesFiltro = todasLasOrdenes.length;
        todasLasOrdenes = todasLasOrdenes.filter((orden: any) => {
          const establecimiento = orden.ESTABLECIMIENTO || orden.establecimiento || '';
          return establecimiento.toLowerCase().includes(establecimientoFiltro.toLowerCase());
        });
        console.log(`🔍 Filtro adicional por establecimiento: "${establecimientoFiltro}" - ${ordenesAntesFiltro} → ${todasLasOrdenes.length} órdenes`);
      }
      
      if (todasLasOrdenes.length > 0) {
        console.log('🔍 PRIMERA ORDEN DE FINNEGANS:', todasLasOrdenes[0]);
        console.log('🔍 ÚLTIMA ORDEN DE FINNEGANS:', todasLasOrdenes[todasLasOrdenes.length - 1]);
        
        // Mostrar rango de fechas
        const fechas = todasLasOrdenes
          .map(o => o.FECHA || o.fecha)
          .filter(f => f)
          .sort();
        if (fechas.length > 0) {
          console.log(`📅 Rango de fechas: ${fechas[0]} a ${fechas[fechas.length - 1]}`);
        }
      }
      
      return todasLasOrdenes;
    } catch (error) {
      console.error('Error fetching from Finnegans:', error);
      throw error;
    }
  };

  // Guardar datos de Finnegans directamente en Supabase (sin transformaciones)
  const saveFinnegansDataDirectly = async (finnegansData: any[]): Promise<void> => {
    try {
      if (finnegansData.length === 0) {
        console.warn('No hay datos de Finnegans para guardar');
        return;
      }

      // Filtrar datos que tengan TRANSACCIONID válido
      const datosValidos = finnegansData.filter(item => item.TRANSACCIONID || item.transaccionId);
      
      if (datosValidos.length === 0) {
        console.warn('No hay datos con TRANSACCIONID válido para guardar');
        return;
      }

      // Eliminar duplicados basado en transaccionId (mantener el último)
      const datosUnicos = datosValidos.reduce((acc, item) => {
        const transaccionId = item.TRANSACCIONID || item.transaccionId;
        acc[transaccionId] = item; // Esto sobrescribe duplicados, manteniendo el último
        return acc;
      }, {} as Record<string, any>);

      const datosSinDuplicados = Object.values(datosUnicos);
      
      console.log(`📊 Datos originales: ${datosValidos.length}, Sin duplicados: ${datosSinDuplicados.length}`);

      // Insertar/actualizar datos en lotes usando UPSERT
      const batchSize = 100;
      for (let i = 0; i < datosSinDuplicados.length; i += batchSize) {
        const batch = datosSinDuplicados.slice(i, i + batchSize);
        
        const datosParaUpsert = batch.map((item: any) => ({
            // Usar TRANSACCIONID como PK
            transaccionId: item.TRANSACCIONID || item.transaccionId,
            // Campos exactos de Finnegans
            establecimiento: item.ESTABLECIMIENTO || '',
            estado: item.ESTADO || '',
            fecha: item.FECHA ? new Date(item.FECHA) : null,
            laboreo: item.LABOREO || '',
            laboreoId: item.LABOREOID || null,
            // Guardar todos los datos originales en JSONB
            datos: item // Guardar el objeto completo tal como llega
          }));

         if (i === 0) { // Solo mostrar el primer lote
           console.log('💾 GUARDANDO DATOS DIRECTOS DE FINNEGANS:', datosParaUpsert[0]);
         }

         // Usar UPSERT (INSERT ... ON CONFLICT ... DO UPDATE)
         const { error } = await supabaseAgro
           .from('OrdenTrabajo')
           .upsert(datosParaUpsert, {
             onConflict: 'transaccionId',
             ignoreDuplicates: false
           });

         if (error) {
           console.error('❌ Error upserting datos de Finnegans:', error);
           throw error;
         }
         
         console.log(`✅ Lote ${Math.floor(i/batchSize) + 1} de datos de Finnegans guardado correctamente`);
      }
    } catch (error) {
      console.error('Error guardando datos de Finnegans:', error);
      throw error;
    }
  };


  // Sincronización principal
  const syncOrdenesTrabajo = async (forceRefresh = false): Promise<SyncResult> => {
    try {
      setIsSyncing(true);
      setLastSyncResult(null);

      // Verificar si necesita sincronización
      const syncDecision = checkSyncNeeded(forceRefresh);
      
      if (!syncDecision.shouldSync) {
        const result: SyncResult = {
          success: true,
          message: 'Datos actualizados, no se requiere sincronización',
          data: await getOrdenesFromSupabase()
        };
        setLastSyncResult(result);
        return result;
      }

      // Marcar como sincronizando
      await updateSyncStatus('syncing');

      let fechaDesde: Date | undefined;
      let isHistorical = false;

      if (syncDecision.needsHistoricalLoad) {
        // Carga histórica: 10 años atrás
        fechaDesde = getHistoricalStartDate();
        isHistorical = true;
        console.log('🔄 Iniciando carga histórica desde:', fechaDesde.toISOString());
      } else if (syncDecision.incrementalFrom) {
        // Sincronización incremental: desde última consulta
        fechaDesde = syncDecision.incrementalFrom;
        console.log('🔄 Iniciando sincronización incremental desde:', fechaDesde.toISOString());
      }

      // Obtener datos de Finnegans
      console.log('📡 Consultando Finnegans...');
      const finnegansData = await fetchOrdenesFromFinnegans(fechaDesde, forceRefresh);
      
      if (finnegansData.length === 0) {
        const result: SyncResult = {
          success: true,
          message: 'No hay nuevas órdenes de trabajo en Finnegans',
          data: [],
          totalProcessed: 0,
          isHistorical
        };
        
        await updateSyncStatus('idle', undefined, 0, new Date());
        setLastSyncResult(result);
        return result;
      }

      // Guardar datos directamente de Finnegans (sin transformaciones)
      console.log('💾 Guardando datos de Finnegans directamente...');
      await saveFinnegansDataDirectly(finnegansData);

      // Transformar datos para la respuesta (opcional)
      const transformedOrdenes = transformFinnegansData(finnegansData);

      // Actualizar control de sincronización
      await updateSyncStatus('idle', undefined, finnegansData.length, new Date());

      const result: SyncResult = {
        success: true,
        message: isHistorical 
          ? `Carga histórica completada: ${finnegansData.length} órdenes procesadas`
          : `Sincronización completada: ${finnegansData.length} órdenes procesadas`,
        data: transformedOrdenes,
        totalProcessed: finnegansData.length,
        isHistorical
      };

      setLastSyncResult(result);
      console.log('✅ Sincronización completada:', result.message);
      return result;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      console.error('❌ Error en sincronización:', errorMessage);
      
      await updateSyncStatus('error', errorMessage);
      
      const result: SyncResult = {
        success: false,
        message: `Error en sincronización: ${errorMessage}`,
        data: []
      };
      
      setLastSyncResult(result);
      return result;
    } finally {
      setIsSyncing(false);
    }
  };

   // Obtener órdenes desde Supabase
   const getOrdenesFromSupabase = async (): Promise<OrdenTrabajo[]> => {
     try {
       let query = supabaseAgro
         .from('OrdenTrabajo')
         .select('*')
         .order('created_at', { ascending: false });

       // Aplicar filtro por establecimiento si se proporciona
       if (establecimientoFiltro) {
         // Usar ilike para búsqueda case-insensitive con wildcards
         query = query.ilike('establecimiento', `%${establecimientoFiltro}%`);
         console.log(`🔍 Consultando Supabase con filtro de establecimiento: "${establecimientoFiltro}"`);
       }

       const { data, error } = await query;

       if (error) {
         console.error('❌ Error en consulta a Supabase:', error);
         throw error;
       }

       if (data && data.length > 0) {
         console.log('📖 LEYENDO DE SUPABASE:', data[0]);
       }

       const ordenesTransformadas = data?.map(item => {
         // Función para convertir fecha de formato DD-MM-YYYY a formato ISO
         const convertirFecha = (fecha: string) => {
           if (!fecha) return undefined;
           
           // Si es formato DD-MM-YYYY, convertir a YYYY-MM-DD
           if (fecha.includes('-') && fecha.length === 10 && !fecha.includes('T')) {
             const [dia, mes, año] = fecha.split('-');
             
             // Crear fecha usando el constructor Date(año, mes-1, dia)
             // Nota: mes-1 porque Date usa 0-11 para meses
             const fechaDate = new Date(parseInt(año), parseInt(mes) - 1, parseInt(dia));
             
             // Verificar si la fecha es válida
             if (isNaN(fechaDate.getTime())) {
               return undefined;
             }
             
             // Convertir a formato ISO YYYY-MM-DD
             const fechaConvertida = fechaDate.toISOString().split('T')[0];
             return fechaConvertida;
           }
           
           return fecha;
         };

         return {
           id: item.transaccionId?.toString() || 'sin-id',
           titulo: item.datos?.titulo || item.laboreo || 'Sin título',
           descripcion: item.datos?.descripcion || '',
           prioridad: item.datos?.prioridad || 'media',
           estado: item.estado as 'pendiente' | 'en_progreso' | 'completada',
           asignadoA: item.datos?.asignadoA,
           fechaVencimiento: item.fecha 
             ? new Date(item.fecha).toISOString() 
             : item.datos?.FECHA 
               ? convertirFecha(item.datos.FECHA)
               : undefined,
           ubicacionId: item.establecimiento,
           creadoPor: item.datos?.creadoPor || 'Sistema',
           creadoEn: item.created_at,
           actualizadoEn: item.updated_at,
           codigoFinnegans: item.datos?.codigoFinnegans,
           activo: item.datos?.activo !== false,
           situacion: item.datos?.situacion,
           // Campos adicionales
           laboreo: item.laboreo || item.datos?.laboreo,
           codigo: item.datos?.codigo,
           establecimiento: item.establecimiento || item.datos?.establecimiento,
           laboreoId: item.laboreoId || item.datos?.laboreoId,
           transaccionId: item.transaccionId || item.datos?.transaccionId,
           datos: item.datos // Guardar datos originales
         };
       }) || [];

       return ordenesTransformadas;
    } catch (error) {
      console.error('Error getting orders from Supabase:', error);
      return [];
    }
  };

  // Función para probar diferentes enfoques de la API
  const probarDiferentesEnfoquesAPI = async (): Promise<any[]> => {
    const token = await finnegansApi.getAccessToken();
    let todasLasOrdenes: any[] = [];
    
    console.log('🧪 Probando diferentes enfoques de la API...');
    
    // Enfoque 1: Sin filtros de fecha, con paginación
    console.log('📋 Enfoque 1: Sin filtros de fecha, con paginación');
    try {
      const params1 = new URLSearchParams();
      params1.append('activo', 'true');
      params1.append('limit', '1000');
      params1.append('offset', '0');
      params1.append('ACCESS_TOKEN', token);
      
      const url1 = `https://api.finneg.com/api/reports/InformeOrdenesTrabajoApi?${params1.toString()}`;
      console.log('🌐 URL Enfoque 1:', url1);
      
      const response1 = await fetch(url1);
      if (response1.ok) {
        const data1 = await response1.json();
        const ordenes1 = Array.isArray(data1) ? data1 : data1.data || [];
        console.log(`📊 Enfoque 1: ${ordenes1.length} órdenes`);
        todasLasOrdenes = [...new Set([...todasLasOrdenes, ...ordenes1])]; // Eliminar duplicados
      }
    } catch (error) {
      console.error('❌ Error en Enfoque 1:', error);
    }
    
    // Enfoque 2: Con fecha muy antigua
    console.log('📋 Enfoque 2: Con fecha muy antigua (2020)');
    try {
      const params2 = new URLSearchParams();
      params2.append('activo', 'true');
      params2.append('limit', '1000');
      params2.append('offset', '0');
      params2.append('fechaDesde', '2020-01-01');
      params2.append('ACCESS_TOKEN', token);
      
      const url2 = `https://api.finneg.com/api/reports/InformeOrdenesTrabajoApi?${params2.toString()}`;
      console.log('🌐 URL Enfoque 2:', url2);
      
      const response2 = await fetch(url2);
      if (response2.ok) {
        const data2 = await response2.json();
        const ordenes2 = Array.isArray(data2) ? data2 : data2.data || [];
        console.log(`📊 Enfoque 2: ${ordenes2.length} órdenes`);
        todasLasOrdenes = [...new Set([...todasLasOrdenes, ...ordenes2])]; // Eliminar duplicados
      }
    } catch (error) {
      console.error('❌ Error en Enfoque 2:', error);
    }
    
    // Enfoque 3: Sin parámetro 'activo'
    console.log('📋 Enfoque 3: Sin parámetro activo');
    try {
      const params3 = new URLSearchParams();
      params3.append('limit', '1000');
      params3.append('offset', '0');
      params3.append('ACCESS_TOKEN', token);
      
      const url3 = `https://api.finneg.com/api/reports/InformeOrdenesTrabajoApi?${params3.toString()}`;
      console.log('🌐 URL Enfoque 3:', url3);
      
      const response3 = await fetch(url3);
      if (response3.ok) {
        const data3 = await response3.json();
        const ordenes3 = Array.isArray(data3) ? data3 : data3.data || [];
        console.log(`📊 Enfoque 3: ${ordenes3.length} órdenes`);
        todasLasOrdenes = [...new Set([...todasLasOrdenes, ...ordenes3])]; // Eliminar duplicados
      }
    } catch (error) {
      console.error('❌ Error en Enfoque 3:', error);
    }
    
    // Enfoque 4: Con límite más alto
    console.log('📋 Enfoque 4: Con límite más alto (5000)');
    try {
      const params4 = new URLSearchParams();
      params4.append('activo', 'true');
      params4.append('limit', '5000');
      params4.append('offset', '0');
      params4.append('ACCESS_TOKEN', token);
      
      const url4 = `https://api.finneg.com/api/reports/InformeOrdenesTrabajoApi?${params4.toString()}`;
      console.log('🌐 URL Enfoque 4:', url4);
      
      const response4 = await fetch(url4);
      if (response4.ok) {
        const data4 = await response4.json();
        const ordenes4 = Array.isArray(data4) ? data4 : data4.data || [];
        console.log(`📊 Enfoque 4: ${ordenes4.length} órdenes`);
        todasLasOrdenes = [...new Set([...todasLasOrdenes, ...ordenes4])]; // Eliminar duplicados
      }
    } catch (error) {
      console.error('❌ Error en Enfoque 4:', error);
    }
    
    console.log(`🧪 Total de órdenes únicas obtenidas: ${todasLasOrdenes.length}`);
    return todasLasOrdenes;
  };

  // Función específica para obtener datos históricos completos
  const fetchDatosHistoricosCompletos = async (): Promise<SyncResult> => {
    try {
      setIsSyncing(true);
      setLastSyncResult(null);

      console.log('🔄 Iniciando carga histórica completa sin filtros...');
      
      // Probar diferentes enfoques de la API para obtener más datos
      const finnegansData = await probarDiferentesEnfoquesAPI();
      
      if (finnegansData.length === 0) {
        const result: SyncResult = {
          success: true,
          message: 'No hay órdenes de trabajo en Finnegans',
          data: [],
          totalProcessed: 0,
          isHistorical: true
        };
        
        setLastSyncResult(result);
        return result;
      }

      // Guardar datos directamente de Finnegans (sin transformaciones)
      console.log('💾 Guardando datos históricos completos de Finnegans...');
      await saveFinnegansDataDirectly(finnegansData);

      // Transformar datos para la respuesta
      const transformedOrdenes = transformFinnegansData(finnegansData);

      // Actualizar control de sincronización
      await updateSyncStatus('idle', undefined, finnegansData.length, new Date());

      const result: SyncResult = {
        success: true,
        message: `Carga histórica completa: ${finnegansData.length} órdenes procesadas`,
        data: transformedOrdenes,
        totalProcessed: finnegansData.length,
        isHistorical: true
      };

      setLastSyncResult(result);
      console.log('✅ Carga histórica completa finalizada:', result.message);
      return result;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      console.error('❌ Error en carga histórica completa:', errorMessage);
      
      await updateSyncStatus('error', errorMessage);
      
      const result: SyncResult = {
        success: false,
        message: `Error en carga histórica completa: ${errorMessage}`,
        data: []
      };
      
      setLastSyncResult(result);
      return result;
    } finally {
      setIsSyncing(false);
    }
  };

  return {
    syncOrdenesTrabajo,
    fetchDatosHistoricosCompletos,
    probarDiferentesEnfoquesAPI,
    isSyncing,
    lastSyncResult,
    syncControl,
    getOrdenesFromSupabase
  };
};
