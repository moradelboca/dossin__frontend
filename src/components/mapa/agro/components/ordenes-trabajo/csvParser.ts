import { OrdenTrabajo } from './types';

export interface CsvRow {
  Documento: string;
  Fecha: string;
  'Doc.-nro. interno': string;
  Establecimiento: string;
  Labor: string;
  'Descripción': string;
  Fechaejecucion: string;
}

export interface ParsedCsvData {
  rows: CsvRow[];
  errors: string[];
  totalRows: number;
}

/**
 * Parsea el contenido CSV del reporte de órdenes de trabajo
 */
export function parseCsvContent(csvContent: string): ParsedCsvData {
  const errors: string[] = [];
  const rows: CsvRow[] = [];
  
  try {
    // Dividir por líneas y limpiar
    const lines = csvContent
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);

    if (lines.length < 2) {
      errors.push('El archivo CSV debe tener al menos una fila de encabezados y una fila de datos');
      return { rows, errors, totalRows: 0 };
    }

    // Obtener encabezados de la primera línea
    const headers = parseCsvLine(lines[0]);
    console.log('📋 Encabezados CSV detectados:', headers);

    // Validar que los encabezados esperados estén presentes
    const expectedHeaders = [
      'Documento',
      'Fecha', 
      'Doc.-nro. interno',
      'Establecimiento',
      'Labor',
      'Descripción',
      'Fechaejecucion'
    ];

    // Función para normalizar encabezados (remover caracteres especiales y espacios)
    const normalizeHeader = (header: string) => {
      return header
        .toLowerCase()
        .replace(/[^\w\s]/g, '') // Remover caracteres especiales
        .replace(/\s+/g, '') // Remover espacios
        .trim();
    };

    const missingHeaders = expectedHeaders.filter(expectedHeader => {
      const normalizedExpected = normalizeHeader(expectedHeader);
      return !headers.some(h => {
        const normalizedH = normalizeHeader(h);
        return normalizedH.includes(normalizedExpected) || normalizedExpected.includes(normalizedH);
      });
    });

    if (missingHeaders.length > 0) {
      errors.push(`Faltan encabezados requeridos: ${missingHeaders.join(', ')}`);
      console.warn('📋 Encabezados detectados:', headers);
      console.warn('📋 Encabezados esperados:', expectedHeaders);
    }

    // Procesar filas de datos
    for (let i = 1; i < lines.length; i++) {
      try {
        const values = parseCsvLine(lines[i]);
        
        if (values.length !== headers.length) {
          // Solo reportar error si la diferencia es significativa (más de 1 columna)
          if (Math.abs(values.length - headers.length) > 1) {
            errors.push(`Fila ${i + 1}: Número de columnas no coincide con los encabezados (${values.length} vs ${headers.length})`);
            console.warn(`⚠️ Fila ${i + 1} problemática:`, {
              line: lines[i].substring(0, 100) + '...',
              values: values,
              expectedColumns: headers.length,
              actualColumns: values.length
            });
          }
          // Si solo falta 1 columna, rellenar con string vacío
          if (values.length < headers.length) {
            while (values.length < headers.length) {
              values.push('');
            }
          }
          // Si hay columnas extra, truncar
          if (values.length > headers.length) {
            values.splice(headers.length);
          }
        }

        // Crear objeto de fila
        const row: CsvRow = {
          Documento: values[0] || '',
          Fecha: values[1] || '',
          'Doc.-nro. interno': values[2] || '',
          Establecimiento: values[3] || '',
          Labor: values[4] || '',
          'Descripción': values[5] || '',
          Fechaejecucion: values[6] || ''
        };

        // Validar datos requeridos
        if (!row['Doc.-nro. interno']) {
          errors.push(`Fila ${i + 1}: Falta el número interno de la orden`);
          continue;
        }

        if (!row.Establecimiento) {
          errors.push(`Fila ${i + 1}: Falta el establecimiento`);
          continue;
        }

        if (!row.Labor) {
          errors.push(`Fila ${i + 1}: Falta el tipo de labor`);
          continue;
        }

        rows.push(row);
      } catch (error) {
        errors.push(`Fila ${i + 1}: Error al procesar - ${error instanceof Error ? error.message : 'Error desconocido'}`);
      }
    }

    console.log(`📊 CSV parseado: ${rows.length} filas válidas, ${errors.length} errores`);
    
    return {
      rows,
      errors,
      totalRows: lines.length - 1
    };

  } catch (error) {
    errors.push(`Error general al parsear CSV: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    return { rows, errors, totalRows: 0 };
  }
}

/**
 * Parsea una línea CSV considerando comillas y separadores
 */
function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  let i = 0;

  while (i < line.length) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Comilla escapada
        current += '"';
        i += 2;
        continue;
      } else {
        // Inicio o fin de comillas
        inQuotes = !inQuotes;
      }
    } else if (char === ';' && !inQuotes) {
      // Separador fuera de comillas
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
    i++;
  }

  // Agregar el último campo
  result.push(current.trim());

  return result;
}

/**
 * Convierte los datos CSV parseados a formato de OrdenTrabajo
 */
export function convertCsvToOrdenTrabajo(csvRows: CsvRow[]): OrdenTrabajo[] {
  return csvRows.map((row, index) => {
    // Extraer ID de la orden del campo "Doc.-nro. interno"
    const otId = extractOtId(row['Doc.-nro. interno']);
    
    // Convertir fechas
    const fechaEjecucion = parseDate(row.Fechaejecucion);

    return {
      id: otId || `csv-${index}`,
      titulo: row.Labor || 'Sin título',
      descripcion: row['Descripción'] || '',
      prioridad: 'media' as const,
      estado: 'pendiente' as const,
      asignadoA: undefined,
      fechaVencimiento: fechaEjecucion ? fechaEjecucion.toISOString() : undefined,
      ubicacionId: row.Establecimiento,
      creadoPor: 'CSV Upload',
      creadoEn: new Date().toISOString(),
      actualizadoEn: new Date().toISOString(),
      codigoFinnegans: undefined,
      activo: true,
      situacion: row.Documento,
      // Campos específicos del CSV
      laboreo: row.Labor,
      codigo: row['Doc.-nro. interno'],
      establecimiento: row.Establecimiento,
      laboreoId: undefined,
      transaccionId: otId ? parseInt(otId) : undefined,
      // Datos originales del CSV
      datos: {
        documento: row.Documento,
        fecha: row.Fecha,
        numeroInterno: row['Doc.-nro. interno'],
        establecimiento: row.Establecimiento,
        labor: row.Labor,
        descripcion: row['Descripción'],
        fechaEjecucion: row.Fechaejecucion
      }
    };
  });
}

/**
 * Extrae el ID numérico de la orden del campo "Doc.-nro. interno"
 * Ejemplo: "OT - 3409" -> "3409"
 */
function extractOtId(numeroInterno: string): string | undefined {
  if (!numeroInterno) return undefined;
  
  // Limpiar caracteres mal codificados
  const cleaned = numeroInterno.replace(/[^\d\w\s-]/g, '');
  
  // Buscar números en el string
  const match = cleaned.match(/\d+/);
  const result = match ? match[0] : undefined;
  
  // Debug logging para los primeros 10 casos
  if (Math.random() < 0.01) { // Solo loggear 1% de los casos para no spamear
    console.log(`🔍 extractOtId: "${numeroInterno}" → "${cleaned}" → "${result}"`);
  }
  
  return result;
}

/**
 * Convierte una fecha en formato YYYY-MM-DD a Date
 */
function parseDate(dateString: string): Date | undefined {
  if (!dateString) return undefined;
  
  try {
    // Formato esperado: YYYY-MM-DD (ISO)
    if (dateString.includes('-') && dateString.length === 10) {
      const [año, mes, dia] = dateString.split('-');
      const fecha = new Date(parseInt(año), parseInt(mes) - 1, parseInt(dia));
      
      // Verificar si la fecha es válida
      if (isNaN(fecha.getTime())) {
        console.warn(`Fecha inválida: ${dateString}`);
        return undefined;
      }
      
      // Verificar que la fecha sea razonable (no muy antigua ni futura)
      const añoActual = new Date().getFullYear();
      const añoFecha = fecha.getFullYear();
      
      if (añoFecha < 2000 || añoFecha > añoActual + 5) {
        console.warn(`Fecha fuera de rango razonable: ${dateString} (año: ${añoFecha})`);
        return undefined;
      }
      
      return fecha;
    }
    
    // Intentar parsear como fecha ISO
    const fecha = new Date(dateString);
    if (isNaN(fecha.getTime())) {
      console.warn(`Fecha inválida: ${dateString}`);
      return undefined;
    }
    
    // Verificar que la fecha sea razonable
    const añoActual = new Date().getFullYear();
    const añoFecha = fecha.getFullYear();
    
    if (añoFecha < 2000 || añoFecha > añoActual + 5) {
      console.warn(`Fecha fuera de rango razonable: ${dateString} (año: ${añoFecha})`);
      return undefined;
    }
    
    return fecha;
  } catch (error) {
    console.warn(`Error parseando fecha ${dateString}:`, error);
    return undefined;
  }
}
