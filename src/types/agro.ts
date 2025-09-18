// Tipos para el módulo de planificación agrícola

export interface ItemEstructura {
    id: string;
    nombre: string;
    tipo: 'labor' | 'insumo' | 'costo';
    fechaRelativa: number;
    duracion?: number; // Solo para labores
    costo: number;
    cantidad?: number; // Solo para insumos
    unidad?: string; // Solo para insumos
    dependencias?: string[]; // Solo para labores
    clasificacion?: 'labor' | 'insumo' | 'tierra' | 'estructura'; // Clasificación específica para costos
}

export interface EstructuraFechasCultivo {
    cultivo: number;
    items: ItemEstructura[]; // Nueva estructura JSONB
    created_at?: string;
    updated_at?: string;
}

export interface ItemPlanificacion {
    id: string;
    nombre: string;
    codigo?: number; // Código ERP si existe
    precio: number;
    fechaDeRealizacion: string;
    fechaHasta?: string; // Para labores que duran varios días
    clasificacion: 'labor' | 'insumo' | 'tierra' | 'estructura' | 'costo';
    custom?: boolean; // true para items personalizados
    superficie?: number; // Hectáreas específicas si es diferente al lote
    unidad?: string; // kg, l, ha, etc.
    cantidad?: number;
    costoTotal?: number;
    ot?: string; // Orden de Trabajo
    dependencias?: string[]; // IDs de las tareas de las que depende esta tarea
}

export interface RegistroLluvia {
    id: string;
    fecha: string;
    cantidad: number;
    unidad: string;
    observaciones?: string;
    registradoPor: string;
    registradoEn: string;
    fuente: 'manual' | 'api';
}

export interface DatosComerciales {
    venta: {
        moneda: string;
        fecha_venta: string;
        tipo_de_cambio: number | null;
        condiciones_pago: string;
        precio_venta_por_tn: number | null;
        rendimiento_estimado_tn_ha: number | null;
        ingreso_por_hectarea: number | null;
    };
    ubicacion_entrega: {
        distancia_km: number | null;
        idUbicacion: number | null;
    };
    flete: {
        costoFlete: number | null;
        contraflete: number | null;
        costo_por_tn: number | null;
        descuento_porcentaje: number | null;
    };
    titular_carta_porte: {
        cuit: string | null;
        razon_social: string | null;
        nombre_fantasia: string | null;
    };
}

// Interfaz para cálculos en tiempo real (no se guarda en BD)
export interface AnalisisMargen {
    costo_total_produccion: number;
    costo_logistico_total: number;
    costo_total_por_hectarea: number;
    ingreso_estimado_por_hectarea: number;
    margen_bruto_por_hectarea: number;
    margen_porcentual: number;
    punto_equilibrio_rinde: number;
    ganancia_estimada_rinde_objetivo: number;
    rinde_objetivo: number;
}

export interface ProyeccionMargen {
    rinde_escenario: number;
    produccion_total: number;
    ingreso_total: number;
    costo_total: number;
    margen_total: number;
    margen_porcentual: number;
}

export interface PlaneacionLote {
    campania: string;
    idLote: string;
    idUbicacion: number;
    linkKMZ?: string;
    cultivo: number;
    superficie: number;
    estructura: ItemPlanificacion[];
    extras: ItemPlanificacion[];
    lluvias: RegistroLluvia[];
    datos_comerciales?: DatosComerciales;
    fechaSiembra?: string;
    created_at?: string;
    updated_at?: string;
}

export interface Cultivo {
    id: number;
    nombre: string;
    nombreNormalizado: string; // Para uniformidad en la UI
    clasificacion: string;
    activo: boolean;
}

export interface LoteConPlanificacion {
    id: string;
    nombre: string;
    superficie: number;
    cultivo: string;
    estado: string;
    labores: string[];
    ordenesTrabajo: string[];
    kmzLayer?: any;
    visible: boolean;
    kmzFile?: {
        path: string;
        url: string;
        fileName: string;
    };
    planificacion?: PlaneacionLote;
}

// Tipos para React Flow
export interface PlanificacionNode {
    id: string;
    type: 'default' | 'labor' | 'insumo';
    position: { x: number; y: number };
    data: {
        label: string;
        item: ItemPlanificacion;
        fecha: string;
        color: string;
    };
}

export interface PlanificacionEdge {
    id: string;
    source: string;
    target: string;
    type: 'smoothstep';
    animated?: boolean;
}

// Tipos para costos
export interface CostoPorCategoria {
    categoria: string;
    total: number;
    porcentaje: number;
    items: ItemPlanificacion[];
    subcategorias?: CostoPorCategoria[];
}

export interface ResumenCostos {
    total: number;
    labores: CostoPorCategoria;
    insumos: CostoPorCategoria;
    agroquimicos?: CostoPorCategoria;
    fertilizantes?: CostoPorCategoria;
    semillas?: CostoPorCategoria;
}
