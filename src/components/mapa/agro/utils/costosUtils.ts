// Utilidades para cálculos de costos
import { ItemPlanificacion } from '../../../../types/agro';

export interface CostoItem {
    id: string;
    nombre: string;
    tipo: 'labor' | 'insumo' | 'costo' | 'tierra' | 'estructura';
    categoria?: string;
    cantidad?: number;
    unidad?: string;
    costoUnitario?: number;
    costoTotal: number;
    fechaUso?: string;
    fechaDesde?: string;
    fechaHasta?: string;
    ot?: string; // Orden de Trabajo
    precioSoja?: number; // Precio de soja por tonelada
    monedaSoja?: 'ARS' | 'USD'; // Moneda del precio de soja
    tipoCambio?: number; // Tipo de cambio USD/ARS
    porcentaje?: number;
}

export interface CategoriaCostos {
    nombre: string;
    tipo: 'labor' | 'insumo' | 'costo' | 'tierra' | 'estructura';
    items: CostoItem[];
    total: number;
    porcentaje: number;
}

/**
 * Convierte la estructura de planificación a items de costo
 * @param planificacion - Planificación del lote
 * @returns Array de items de costo
 */
export const calcularCostos = (planificacion: { estructura: ItemPlanificacion[]; extras: ItemPlanificacion[] }): CostoItem[] => {
    const items: CostoItem[] = [];
    
    // Procesar estructura principal
    if (planificacion.estructura) {
        planificacion.estructura.forEach((item: any) => {
            // Calcular costo por hectárea: cantidad × costo unitario
            const costoPorHectarea = (item.cantidad || 1) * (item.precio || 0);
            
            const tipo = item.clasificacion === 'labor' ? 'labor' : 
                         item.clasificacion === 'tierra' ? 'tierra' : 
                         item.clasificacion === 'estructura' ? 'estructura' : 'insumo';
            const categoria = item.clasificacion === 'labor' ? 'Labores' : 
                             item.clasificacion === 'tierra' ? 'Tierra' : 
                             item.clasificacion === 'estructura' ? 'Estructura' : 'Insumos';
            
            items.push({
                id: item.id,
                nombre: item.nombre,
                tipo: tipo,
                categoria: categoria,
                cantidad: item.cantidad || 1,
                unidad: item.unidad || 'ha',
                costoUnitario: item.precio || 0,
                costoTotal: costoPorHectarea, // Esto es el costo por hectárea
                fechaUso: item.fechaDeRealizacion,
                ot: item.ot || '',
            });
        });
    }

    // Procesar extras
    if (planificacion.extras) {
        planificacion.extras.forEach((item: any, index: number) => {
            // Para extras, usar costoTotal si existe, sino calcular precio * cantidad
            const costoTotal = item.costoTotal || (item.precio * (item.cantidad || 1)) || 0;
            
            const tipo = item.clasificacion === 'labor' ? 'labor' : 
                         item.clasificacion === 'tierra' ? 'tierra' : 
                         item.clasificacion === 'estructura' ? 'estructura' : 'insumo';
            const categoria = item.clasificacion === 'labor' ? 'Labores' : 
                             item.clasificacion === 'tierra' ? 'Tierra' : 
                             item.clasificacion === 'estructura' ? 'Estructura' : 'Insumos';
            
            items.push({
                id: `extra-${index}`,
                nombre: item.nombre,
                tipo: tipo,
                categoria: categoria,
                cantidad: item.cantidad || 1,
                unidad: item.unidad || 'ha',
                costoUnitario: item.precio || 0,
                costoTotal: costoTotal,
                fechaUso: item.fechaDeRealizacion,
                ot: item.ot || '',
            });
        });
    }

    return items;
};

/**
 * Agrupa los costos por categorías
 * @param costos - Array de items de costo
 * @returns Array de categorías con sus costos
 */
export const agruparCostosPorCategoria = (costos: CostoItem[]): CategoriaCostos[] => {
    const categorias: { [key: string]: CategoriaCostos } = {};
    
    costos.forEach(item => {
        const categoriaKey = item.categoria || 'Otros';
        
        if (!categorias[categoriaKey]) {
            categorias[categoriaKey] = {
                nombre: categoriaKey,
                tipo: item.tipo,
                items: [],
                total: 0,
                porcentaje: 0,
            };
        }
        
        categorias[categoriaKey].items.push(item);
        categorias[categoriaKey].total += item.costoTotal;
    });

    const totalGeneral = Object.values(categorias).reduce((sum, cat) => sum + cat.total, 0);
    
    // Calcular porcentajes
    Object.values(categorias).forEach(cat => {
        cat.porcentaje = totalGeneral > 0 ? (cat.total / totalGeneral) * 100 : 0;
    });

    return Object.values(categorias).sort((a, b) => b.total - a.total);
};

/**
 * Calcula el precio por quintal en USD
 * @param precioSoja - Precio de soja por tonelada
 * @param moneda - Moneda del precio ('ARS' o 'USD')
 * @param tipoCambio - Tipo de cambio USD/ARS
 * @returns Precio por quintal en USD
 */
export const calcularPrecioPorQuintalUSD = (precioSoja: number, moneda: 'ARS' | 'USD', tipoCambio: number): number => {
    let precioEnPesos: number;
    
    if (moneda === 'USD') {
        precioEnPesos = precioSoja * tipoCambio;
    } else {
        precioEnPesos = precioSoja;
    }
    
    // Convertir de tonelada a quintal (1 tn = 10 qq) y luego a USD
    const precioPorQuintalPesos = precioEnPesos / 10;
    const precioPorQuintalUSD = precioPorQuintalPesos / tipoCambio;
    
    return precioPorQuintalUSD;
};

