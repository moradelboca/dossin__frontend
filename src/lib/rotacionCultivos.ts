// Reglas de rotación de cultivos y compatibilidad de insumos
// Basado en buenas prácticas agrícolas y manejo de residuos

export interface RecomendacionRotacion {
  esRecomendada: boolean;
  nivel: 'excelente' | 'buena' | 'regular' | 'desfavorable';
  razones: string[];
  advertencias: string[];
  sugerencias: string[];
}

export interface InsumoResidual {
  nombre: string;
  tiempoResidual: number; // días
  cultivosAfectados: number[]; // IDs de cultivos que pueden verse afectados
  efecto: 'positivo' | 'negativo' | 'neutro';
  descripcion: string;
}

export interface RotacionCultivo {
  excelentes: number[];
  buenas: number[];
  regulares: number[];
  desfavorables: number[];
}

// Mapeo de cultivos a sus características
export const CULTIVOS = {
  1: { nombre: 'Soja de Primera', familia: 'leguminosa', ciclo: 'corto' },
  2: { nombre: 'Soja de Segunda', familia: 'leguminosa', ciclo: 'corto' },
  3: { nombre: 'Maíz de Primera', familia: 'gramínea', ciclo: 'largo' },
  4: { nombre: 'Maíz de Segunda', familia: 'gramínea', ciclo: 'corto' },
  5: { nombre: 'Trigo', familia: 'gramínea', ciclo: 'largo' },
  6: { nombre: 'Girasol de Primera', familia: 'compuesta', ciclo: 'corto' },
  7: { nombre: 'Girasol de Segunda', familia: 'compuesta', ciclo: 'corto' },
  8: { nombre: 'Centeno', familia: 'gramínea', ciclo: 'largo' },
  9: { nombre: 'Sorgo', familia: 'gramínea', ciclo: 'corto' }
} as const;

// Insumos con efectos residuales
export const INSUMOS_RESIDUALES: InsumoResidual[] = [
  {
    nombre: 'Atrazina',
    tiempoResidual: 365, // 1 año
    cultivosAfectados: [1, 2, 6, 7], // Soja y Girasol sensibles
    efecto: 'negativo',
    descripcion: 'Herbicida residual que puede afectar cultivos sensibles'
  },
  {
    nombre: 'S-Metolacloro',
    tiempoResidual: 120, // 4 meses
    cultivosAfectados: [1, 2, 6, 7], // Soja y Girasol sensibles
    efecto: 'negativo',
    descripcion: 'Herbicida preemergente con residualidad moderada'
  },
  {
    nombre: 'Imazetapir',
    tiempoResidual: 180, // 6 meses
    cultivosAfectados: [3, 4, 5, 8, 9], // Maíz, Trigo, Centeno, Sorgo sensibles
    efecto: 'negativo',
    descripcion: 'Herbicida residual que afecta gramíneas'
  },
  {
    nombre: 'Imazamox',
    tiempoResidual: 150, // 5 meses
    cultivosAfectados: [3, 4, 5, 8, 9], // Gramíneas sensibles
    efecto: 'negativo',
    descripcion: 'Herbicida residual para control de gramíneas'
  },
  {
    nombre: 'Glifosato',
    tiempoResidual: 0, // Sin residualidad
    cultivosAfectados: [],
    efecto: 'neutro',
    descripcion: 'Herbicida sistémico sin residualidad en suelo'
  },
  {
    nombre: '2,4-D',
    tiempoResidual: 30, // 1 mes
    cultivosAfectados: [1, 2, 6, 7], // Cultivos de hoja ancha sensibles
    efecto: 'negativo',
    descripcion: 'Herbicida auxínico con residualidad corta'
  },
  {
    nombre: 'Urea',
    tiempoResidual: 0, // Sin residualidad
    cultivosAfectados: [],
    efecto: 'positivo',
    descripcion: 'Fertilizante nitrogenado, beneficia a cultivos siguientes'
  },
  {
    nombre: 'Fertilizante Fósforo',
    tiempoResidual: 0, // Sin residualidad
    cultivosAfectados: [],
    efecto: 'positivo',
    descripcion: 'Fósforo residual beneficia cultivos siguientes'
  }
];

// Reglas de rotación recomendadas
export const ROTACIONES_RECOMENDADAS: Record<number, RotacionCultivo> = {
  // Soja de Primera -> Excelentes predecesores
  [1]: {
    excelentes: [5, 8], // Trigo, Centeno
    buenas: [3, 4, 9], // Maíz, Sorgo
    regulares: [6, 7], // Girasol
    desfavorables: [1, 2] // Soja (monocultivo)
  },
  // Soja de Segunda -> Excelentes predecesores
  [2]: {
    excelentes: [1, 5, 8], // Soja de Primera, Trigo, Centeno
    buenas: [3, 4, 6, 7, 9], // Maíz, Girasol, Sorgo
    regulares: [],
    desfavorables: [2] // Soja de Segunda (monocultivo)
  },
  // Maíz de Primera -> Excelentes predecesores
  [3]: {
    excelentes: [1, 2], // Soja
    buenas: [5, 8], // Trigo, Centeno
    regulares: [6, 7, 9], // Girasol, Sorgo
    desfavorables: [3, 4] // Maíz (monocultivo)
  },
  // Maíz de Segunda -> Excelentes predecesores
  [4]: {
    excelentes: [1, 2, 5, 8], // Soja, Trigo, Centeno
    buenas: [6, 7, 9], // Girasol, Sorgo
    regulares: [],
    desfavorables: [3, 4] // Maíz (monocultivo)
  },
  // Trigo -> Excelentes predecesores
  [5]: {
    excelentes: [1, 2], // Soja
    buenas: [3, 4, 6, 7, 9], // Maíz, Girasol, Sorgo
    regulares: [8], // Centeno
    desfavorables: [5] // Trigo (monocultivo)
  },
  // Girasol de Primera -> Excelentes predecesores
  [6]: {
    excelentes: [1, 2, 5, 8], // Soja, Trigo, Centeno
    buenas: [3, 4, 9], // Maíz, Sorgo
    regulares: [],
    desfavorables: [6, 7] // Girasol (monocultivo)
  },
  // Girasol de Segunda -> Excelentes predecesores
  [7]: {
    excelentes: [1, 2, 5, 8], // Soja, Trigo, Centeno
    buenas: [3, 4, 6, 9], // Maíz, Girasol de Primera, Sorgo
    regulares: [],
    desfavorables: [7] // Girasol de Segunda (monocultivo)
  },
  // Centeno -> Excelentes predecesores
  [8]: {
    excelentes: [1, 2], // Soja
    buenas: [3, 4, 6, 7, 9], // Maíz, Girasol, Sorgo
    regulares: [5], // Trigo
    desfavorables: [8] // Centeno (monocultivo)
  },
  // Sorgo -> Excelentes predecesores
  [9]: {
    excelentes: [1, 2, 5, 8], // Soja, Trigo, Centeno
    buenas: [3, 4, 6, 7], // Maíz, Girasol
    regulares: [],
    desfavorables: [9] // Sorgo (monocultivo)
  }
} as const;

// Función principal para evaluar la rotación
export function evaluarRotacionCultivo(
  cultivoAnterior: number | null,
  cultivoNuevo: number,
  insumosUtilizados: string[] = [],
  diasTranscurridos: number = 0
): RecomendacionRotacion {
  const recomendacion: RecomendacionRotacion = {
    esRecomendada: true,
    nivel: 'excelente',
    razones: [],
    advertencias: [],
    sugerencias: []
  };

  // Si no hay cultivo anterior, es la primera siembra
  if (!cultivoAnterior) {
    recomendacion.razones.push('Primera siembra en el lote');
    recomendacion.sugerencias.push('Considera realizar análisis de suelo antes de la siembra');
    return recomendacion;
  }

  // Evaluar compatibilidad de cultivos
  const rotacion = ROTACIONES_RECOMENDADAS[cultivoNuevo as keyof typeof ROTACIONES_RECOMENDADAS];
  if (!rotacion) {
    recomendacion.advertencias.push('Cultivo no reconocido en las reglas de rotación');
    return recomendacion;
  }

  // Verificar nivel de compatibilidad
  if (rotacion.excelentes.includes(cultivoAnterior)) {
    recomendacion.nivel = 'excelente';
    recomendacion.razones.push(`${CULTIVOS[cultivoAnterior as keyof typeof CULTIVOS]?.nombre} es un excelente predecesor para ${CULTIVOS[cultivoNuevo as keyof typeof CULTIVOS]?.nombre}`);
  } else if (rotacion.buenas.includes(cultivoAnterior)) {
    recomendacion.nivel = 'buena';
    recomendacion.razones.push(`${CULTIVOS[cultivoAnterior as keyof typeof CULTIVOS]?.nombre} es un buen predecesor para ${CULTIVOS[cultivoNuevo as keyof typeof CULTIVOS]?.nombre}`);
  } else if (rotacion.regulares.includes(cultivoAnterior)) {
    recomendacion.nivel = 'regular';
    recomendacion.razones.push(`${CULTIVOS[cultivoAnterior as keyof typeof CULTIVOS]?.nombre} es un predecesor regular para ${CULTIVOS[cultivoNuevo as keyof typeof CULTIVOS]?.nombre}`);
  } else if (rotacion.desfavorables.includes(cultivoAnterior)) {
    recomendacion.nivel = 'desfavorable';
    recomendacion.esRecomendada = false;
    recomendacion.advertencias.push(`Monocultivo de ${CULTIVOS[cultivoAnterior as keyof typeof CULTIVOS]?.nombre} - ${CULTIVOS[cultivoNuevo as keyof typeof CULTIVOS]?.nombre} no es recomendado`);
    recomendacion.sugerencias.push('Considera rotar con un cultivo diferente para mejorar la salud del suelo');
  }

  // Evaluar insumos residuales
  const insumosProblematicos = insumosUtilizados.filter(insumo => {
    const insumoResidual = INSUMOS_RESIDUALES.find(i => 
      insumo.toLowerCase().includes(i.nombre.toLowerCase())
    );
    return insumoResidual && 
           insumoResidual.tiempoResidual > diasTranscurridos &&
           insumoResidual.cultivosAfectados.includes(cultivoNuevo);
  });

  if (insumosProblematicos.length > 0) {
    recomendacion.esRecomendada = false;
    recomendacion.nivel = 'desfavorable';
    insumosProblematicos.forEach(insumo => {
      const insumoResidual = INSUMOS_RESIDUALES.find(i => 
        insumo.toLowerCase().includes(i.nombre.toLowerCase())
      );
      if (insumoResidual) {
        recomendacion.advertencias.push(
          `${insumoResidual.nombre} utilizado en campaña anterior puede afectar al cultivo (residualidad: ${insumoResidual.tiempoResidual} días)`
        );
      }
    });
  }

  // Evaluar beneficios de insumos positivos
  const insumosBeneficiosos = insumosUtilizados.filter(insumo => {
    const insumoResidual = INSUMOS_RESIDUALES.find(i => 
      insumo.toLowerCase().includes(i.nombre.toLowerCase())
    );
    return insumoResidual && insumoResidual.efecto === 'positivo';
  });

  if (insumosBeneficiosos.length > 0) {
    recomendacion.razones.push('Insumos beneficiosos de la campaña anterior pueden favorecer el cultivo');
  }

  // Sugerencias adicionales basadas en el análisis
  if (recomendacion.nivel === 'desfavorable') {
    recomendacion.sugerencias.push('Considera esperar más tiempo antes de sembrar este cultivo');
    recomendacion.sugerencias.push('Realiza análisis de residuos en suelo si es posible');
  } else if (recomendacion.nivel === 'regular') {
    recomendacion.sugerencias.push('Monitorea el desarrollo del cultivo de cerca');
    recomendacion.sugerencias.push('Considera aplicar enmiendas al suelo si es necesario');
  }

  return recomendacion;
}

// Función para obtener el cultivo anterior de una campaña
export async function obtenerCultivoAnterior(
  _idLote: string,
  _idUbicacion: number,
  _campaniaActual: string
): Promise<{ cultivo: number | null; insumos: string[]; diasTranscurridos: number }> {
  try {
    // Aquí implementarías la lógica para obtener el cultivo anterior
    // Por ahora retornamos datos de ejemplo
    return {
      cultivo: null,
      insumos: [],
      diasTranscurridos: 0
    };
  } catch (error) {
    console.error('Error obteniendo cultivo anterior:', error);
    return {
      cultivo: null,
      insumos: [],
      diasTranscurridos: 0
    };
  }
}
