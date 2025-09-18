// Utilidades para manejo de fechas en planificación agrícola
import { ItemEstructura, ItemPlanificacion } from '../../../../types/agro';

/**
 * Convierte items de estructura a items de planificación
 * @param items - Array de items de estructura
 * @param fechaSiembra - Fecha de siembra como string (YYYY-MM-DD)
 * @returns Array de items de planificación
 */
export const convertirItemsAItemsPlanificacion = (items: ItemEstructura[], fechaSiembra: string): ItemPlanificacion[] => {
    
    const itemsPlanificacion: ItemPlanificacion[] = [];
    const fechaSiembraDate = new Date(fechaSiembra);
    
    items.forEach((item) => {
        
        // Calcular fechas basadas en fechaRelativa
        const fechaInicio = new Date(fechaSiembraDate);
        fechaInicio.setDate(fechaInicio.getDate() + item.fechaRelativa);
        
        let fechaFin: Date;
        if (item.tipo === 'labor' && item.duracion) {
            fechaFin = new Date(fechaInicio);
            fechaFin.setDate(fechaFin.getDate() + item.duracion - 1);
        } else {
            fechaFin = fechaInicio;
        }
        
        // Determinar clasificación
        let clasificacion: 'labor' | 'insumo' | 'tierra' | 'estructura';
        if (item.tipo === 'labor') {
            clasificacion = 'labor';
        } else if (item.tipo === 'insumo') {
            clasificacion = 'insumo';
        } else if (item.tipo === 'costo') {
            // Usar la clasificación específica si existe, sino usar 'tierra' por defecto
            clasificacion = (item as any).clasificacion || 'tierra';
        } else {
            clasificacion = 'tierra'; // Fallback
        }
        
        const itemPlanificacion: ItemPlanificacion = {
            id: item.id,
            nombre: item.nombre,
            clasificacion: clasificacion,
            precio: item.costo,
            cantidad: item.cantidad || 1,
            unidad: item.unidad || 'ha',
            fechaDeRealizacion: fechaInicio.toISOString().split('T')[0],
            fechaHasta: item.tipo === 'labor' ? fechaFin.toISOString().split('T')[0] : undefined,
            dependencias: item.dependencias || []
        };
        
        itemsPlanificacion.push(itemPlanificacion);
    });

    return itemsPlanificacion;
};

/**
 * Convierte items de planificación a items de estructura
 * @param items - Array de items de planificación
 * @param fechaSiembra - Fecha de siembra como string (YYYY-MM-DD)
 * @returns Array de items de estructura
 */
export const convertirItemsAItemsEstructura = (items: ItemPlanificacion[], fechaSiembra: string): ItemEstructura[] => {
    const itemsEstructura: ItemEstructura[] = [];
    const fechaSiembraDate = new Date(fechaSiembra);
    
    items.forEach(item => {
        // Determinar tipo basado en clasificación
        let tipo: 'labor' | 'insumo' | 'costo';
        if (item.clasificacion === 'labor') {
            tipo = 'labor';
        } else if (item.clasificacion === 'insumo') {
            tipo = 'insumo';
        } else {
            tipo = 'costo'; // Para tierra y otros costos
        }
        
        // Calcular fechaRelativa basada en la fecha de realización
        const fechaItem = new Date(item.fechaDeRealizacion);
        const fechaRelativa = Math.floor((fechaItem.getTime() - fechaSiembraDate.getTime()) / (1000 * 60 * 60 * 24));
        
        // Calcular duración para labores
        let duracion: number | undefined;
        if (tipo === 'labor' && item.fechaHasta) {
            const fechaFin = new Date(item.fechaHasta);
            duracion = Math.ceil((fechaFin.getTime() - fechaItem.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        }
        
        const itemEstructura: ItemEstructura = {
            id: item.id,
            nombre: item.nombre,
            tipo: tipo,
            fechaRelativa: fechaRelativa,
            duracion: duracion,
            costo: item.precio,
            cantidad: item.cantidad,
            unidad: item.unidad,
            dependencias: item.dependencias,
            clasificacion: item.clasificacion === 'costo' ? 'estructura' : item.clasificacion // Mapear 'costo' a 'estructura'
        };
        
        itemsEstructura.push(itemEstructura);
    });
    
    return itemsEstructura;
};

/**
 * Convierte items de estructura a items de planificación para el editor de estructura maestras
 * NO calcula fechas, solo preserva fechaRelativa y duracion
 * @param items - Array de items de estructura
 * @returns Array de items de planificación sin fechas calculadas
 */
export const convertirItemsAItemsPlanificacionEditor = (items: ItemEstructura[]): ItemPlanificacion[] => {
    
    const itemsPlanificacion: ItemPlanificacion[] = [];
    
    items.forEach((item) => {
        
        // Determinar clasificación
        let clasificacion: 'labor' | 'insumo' | 'tierra' | 'estructura';
        if (item.tipo === 'labor') {
            clasificacion = 'labor';
        } else if (item.tipo === 'insumo') {
            clasificacion = 'insumo';
        } else if (item.tipo === 'costo') {
            // Usar la clasificación específica si existe, sino usar 'tierra' por defecto
            clasificacion = (item as any).clasificacion || 'tierra';
        } else {
            clasificacion = 'tierra'; // Fallback
        }
        
        const itemPlanificacion: ItemPlanificacion = {
            id: item.id,
            nombre: item.nombre,
            clasificacion: clasificacion,
            precio: item.costo,
            cantidad: item.cantidad || 1,
            unidad: item.unidad || 'ha',
            fechaDeRealizacion: '', // Valor por defecto ya que ItemEstructura no tiene esta propiedad
            // fechaRelativa: item.fechaRelativa || 0, // Propiedad no existe en ItemPlanificacion
            // duracion: item.duracion, // Propiedad no existe en ItemPlanificacion
            dependencias: item.dependencias || []
        };
        
        itemsPlanificacion.push(itemPlanificacion);
    });

    return itemsPlanificacion;
};

/**
 * Obtiene el nombre del cultivo basado en su ID
 * @param cultivo - ID del cultivo
 * @returns Nombre descriptivo del cultivo
 */
export const getNombreCultivo = (cultivo: number): string => {
    const nombres: Record<number, string> = {
        1: 'Soja de Primera',
        2: 'Soja de Segunda', 
        3: 'Maíz de Primera',
        4: 'Maíz de Segunda',
        5: 'Trigo',
        6: 'Girasol de Primera',
        7: 'Girasol de Segunda',
        8: 'Centeno',
        9: 'Sorgo'
    };
    return nombres[cultivo] || `Cultivo ${cultivo}`;
};

