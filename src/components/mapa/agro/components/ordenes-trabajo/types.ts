export interface OrdenTrabajo {
    id: string;
    titulo: string;
    descripcion: string;
    prioridad: 'baja' | 'media' | 'alta';
    estado: 'pendiente' | 'en_progreso' | 'completada';
    asignadoA?: string;
    fechaVencimiento?: string;
    ubicacionId?: string;
    creadoPor: string;
    creadoEn: string;
    actualizadoEn?: string;
    // Campos específicos de Finnegans
    codigoFinnegans?: string;
    activo?: boolean;
    situacion?: string;
    fechaCreacion?: string;
    // Campos adicionales de Finnegans
    laboreo?: string;
    codigo?: string;
    establecimiento?: string;
    laboreoId?: number;
    transaccionId?: number;
    // Datos completos de Finnegans
    datos?: any;
}

export interface OrdenesTrabajoPanelProps {
    ubicacion?: any;
    onClose?: () => void;
}
