import Papa from 'papaparse';
import { DescargaRegistro } from '../../types/descargas';

/**
 * Normaliza un número removiendo puntos de miles y convirtiendo comas a puntos decimales
 */
function normalizarNumero(numeroStr: string): number {
  // Remover puntos de miles y convertir comas a puntos decimales
  const normalizado = numeroStr.replace(/\./g, '').replace(',', '.');
  return parseFloat(normalizado);
}

/**
 * Valida si una fecha está en formato dd/mm/yyyy
 */
function esFechaValida(fechaStr: string): boolean {
  const patronFecha = /^\d{2}\/\d{2}\/\d{4}$/;
  if (!patronFecha.test(fechaStr)) return false;
  
  const [dia, mes, año] = fechaStr.split('/').map(Number);
  const fecha = new Date(año, mes - 1, dia);
  
  return fecha.getDate() === dia && 
         fecha.getMonth() === mes - 1 && 
         fecha.getFullYear() === año;
}

/**
 * Parsea un CSV de descargas de AGD
 * Formato esperado: Fecha,NRO CP/CTG,Producto,Cosecha,Kg Entregados
 */
export function parseAgdDescargasCsv(csvText: string): DescargaRegistro[] {
  try {
    const resultado = Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim(),
    });

    if (resultado.errors.length > 0) {
      console.warn('Errores en parsing CSV AGD:', resultado.errors);
    }

    const registros: DescargaRegistro[] = [];

    for (const fila of resultado.data as any[]) {
      try {
        const fecha = fila['Fecha']?.trim();
        const numeroCTG = fila['NRO CP/CTG']?.trim();
        const grano = fila['Producto']?.trim();
        const kgStr = fila['Kg Entregados']?.trim();

        // Validaciones básicas
        if (!fecha || !numeroCTG || !grano || !kgStr) {
          continue;
        }

        if (!esFechaValida(fecha)) {
          console.warn(`Fecha inválida en línea AGD: ${fecha}`);
          continue;
        }

        const kgDescargados = normalizarNumero(kgStr);
        if (isNaN(kgDescargados) || kgDescargados <= 0) {
          console.warn(`Kg inválidos en línea AGD: ${kgStr}`);
          continue;
        }

        registros.push({
          fecha,
          grano,
          numeroCTG,
          kgDescargados,
          proveedor: 'AGD'
        });
      } catch (error) {
        console.warn('Error procesando línea AGD:', error, fila);
        continue;
      }
    }

    return registros;
  } catch (error) {
    console.error('Error parseando CSV AGD:', error);
    return [];
  }
}

/**
 * Parsea un archivo de descargas de Bunge
 * Formato: líneas con patrón "dd/mm/yyyy CTG Origen Cosecha Kg ..."
 * El grano se extrae de las primeras líneas del archivo
 */
export function parseBungeDescargasCsv(text: string): DescargaRegistro[] {
  const lineas = text.split('\n');
  const registros: DescargaRegistro[] = [];

  // Extraer el grano de las primeras líneas del archivo
  let grano = '';
  for (let i = 0; i < Math.min(10, lineas.length); i++) {
    const linea = lineas[i].trim();
    // Buscar patrón "Producto: GRANO" - capturar solo el nombre del grano
    const matchGrano = linea.match(/Producto:\s*([A-Z]+)/i);
    if (matchGrano) {
      grano = matchGrano[1].trim();
      break;
    }
  }

  // Si no se encontró el grano, usar un valor por defecto
  if (!grano) {
    console.warn('No se pudo extraer el grano del archivo Bunge, usando valor por defecto');
    grano = 'DESCONOCIDO';
  }

  // Patrón para extraer datos de líneas de Bunge
  // Formato: "19/03/2025 22189190 PEDERNERA 2025 28.700 ... 010121936102 ..."
  // Las líneas pueden estar entre comillas
  // El CTG está al final de la línea como un número de 12 dígitos (con 0 inicial)
  const patronBunge = /^"?(\d{2}\/\d{2}\/\d{4})\s+(\d+)\s+(\w+)\s+(\d{4})\s+([\d.,]+).*?0(\d{11})/;

  for (let i = 0; i < lineas.length; i++) {
    const linea = lineas[i].trim();
    
    // Saltar líneas vacías o de encabezado
    if (!linea || linea.includes('Fecha') || linea.includes('Kgs.') || linea.includes('Producto:')) {
      continue;
    }

    const match = linea.match(patronBunge);
    
    if (match) {
      try {
        const fecha = match[1];
        // const numeroRecibo = match[2]; // Número de recibo (no se usa)
        // const origen = match[3]; // En Bunge esto es la localidad/origen
        // const cosecha = match[4];
        const kgStr = match[5];
        const numeroCTG = match[6]; // CTG sin el 0 inicial (11 dígitos)

        // Validaciones
        if (!esFechaValida(fecha)) {
          console.warn(`Fecha inválida en línea Bunge ${i}: ${fecha}`);
          continue;
        }

        const kgDescargados = normalizarNumero(kgStr);
        if (isNaN(kgDescargados) || kgDescargados <= 0) {
          console.warn(`Kg inválidos en línea Bunge ${i}: ${kgStr}`);
          continue;
        }

        // Validar que el CTG tenga 11 dígitos (sin el 0 inicial)
        if (!numeroCTG || numeroCTG.length !== 11) {
          console.warn(`CTG inválido en línea Bunge ${i}: ${numeroCTG}`);
          continue;
        }

        registros.push({
          fecha,
          grano, // Usar el grano extraído de las primeras líneas
          numeroCTG,
          kgDescargados,
          proveedor: 'Bunge'
        });
      } catch (error) {
        console.warn(`Error procesando línea Bunge ${i}:`, error);
        continue;
      }
    }
  }

  return registros;
}

/**
 * Función principal que parsea según el proveedor
 */
export function parseDescargasCsv(csvText: string, proveedor: 'Bunge' | 'AGD'): DescargaRegistro[] {
  switch (proveedor) {
    case 'AGD':
      return parseAgdDescargasCsv(csvText);
    case 'Bunge':
      return parseBungeDescargasCsv(csvText);
    default:
      throw new Error(`Proveedor no soportado: ${proveedor}`);
  }
}
