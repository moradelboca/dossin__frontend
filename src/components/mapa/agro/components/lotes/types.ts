import L from 'leaflet';

export interface Lote {
    id: string;
    nombre: string;
    superficie?: number;
    cultivo?: string;
    estado: string;
    campania?: string;
    planificacion?: any;
    labores?: string[];
    ordenesTrabajo?: string[];
    kmzLayer?: L.LayerGroup;
    visible: boolean;
    kmzFile?: {
        path: string;
        url: string;
        fileName: string;
    };
}

export interface Establecimiento {
    id: string;
    nombre: string;
    razonSocial: string;
    cuit: string;
    provincia: string;
    localidad: string;
}

export interface LotesPanelProps {
    ubicacion: any;
    map: L.Map | null;
    onClose: () => void;
    onTogglePins?: (show: boolean) => void;
    onLoteClick?: (lote: any) => void;
}
