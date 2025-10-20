// Types for Commercial Contracts (Contratos Comerciales)

export interface ContratoComercial {
  id: number;
  numeroContrato: string;
  fechaContrato: string; // fechaFirma in DB
  fechaInicioEntrega: string;
  fechaFinEntrega: string; // fechaEntrega in DB
  productorId: number;
  productorNombre: string;
  exportadorId: number;
  exportadorNombre: string;
  tipoGrano: number; // cultivo in DB, 1-9 matching existing system
  tipoGranoNombre: string; // cultivoNombre in DB
  calidad: string;
  humedadMaxima: number;
  impurezasMaximas: number;
  cantidadTotalKg: number; // cantidadTotal in DB, in kg
  cantidadEntregadaKg: number; // cantidadEntregada in DB, in kg
  precioPorKg: number;
  moneda: string; // USD by default
  condicionesPago: string; // condicionesComerciales in DB
  lugarEntrega: string;
  condicionesEntrega: string;
  estado: 'activo' | 'cumplido' | 'cancelado' | 'vencido';
  observaciones?: string;
  cargasIds: number[]; // Array of load IDs from backend
  created_at: string;
  updated_at: string;
  created_by?: number;
  updated_by?: number;
}

export interface ContratoWithStats extends ContratoComercial {
  // Calculated fields
  porcentajeCumplimiento: number;
  kgPendientes: number;
  // Associated loads data
  cargas?: CargaAsociada[];
}

export interface CargaAsociada {
  id: number;
  numeroCartaPorte: number;
  fecha: string;
  titular: {
    razonSocial: string;
  };
  destinatario: {
    razonSocial: string;
  };
  kgNeto: number;
  kgDescargadosTotales?: number; // NEW: actual kg downloaded
  cultivo: number;
  estado: string;
}

export interface CargaDisponible {
  id: number;
  numeroCartaPorte?: number;
  fecha: string;
  titular?: {
    razonSocial?: string;
    nombre?: string;
  };
  destinatario?: {
    razonSocial?: string;
    nombre?: string;
  };
  kgNeto?: number;
  kgDescargadosTotales?: number; // NEW: actual kg downloaded
  cultivo: number;
  estado: string;
  // Location data
  ubicacionCarga?: {
    nombre?: string;
    localidad?: {
      nombre?: string;
      provincia?: {
        nombre?: string;
        pais?: {
          nombre?: string;
        };
      };
    };
  };
  ubicacionDescarga?: {
    nombre?: string;
    localidad?: {
      nombre?: string;
      provincia?: {
        nombre?: string;
        pais?: {
          nombre?: string;
        };
      };
    };
  };
  // Tariff and distance
  tarifa?: number;
  tipoTarifa?: {
    nombre?: string;
  };
  cantidadKm?: number;
  // Cargamento and provider
  cargamento?: {
    nombre?: string;
  };
  proveedor?: {
    nombre?: string;
  };
  // Whether this load is already associated with a contract
  asociada: boolean;
  contratoId?: number;
}

// Filter interfaces
export interface FiltrosSeguimiento {
  estado?: string;
  cliente?: string;
  kgMinimo?: number;
  kgMaximo?: number;
  fechaDesde?: string;
  fechaHasta?: string;
}

// Grain mapping (1-9 from existing system)
export const CULTIVOS_MAP: Record<number, string> = {
  1: 'Soja',
  2: 'Maíz',
  3: 'Trigo',
  4: 'Girasol',
  5: 'Sorgo',
  6: 'Cebada',
  7: 'Avena',
  8: 'Centeno',
  9: 'Colza'
};

// Status mapping for display
export const ESTADOS_MAP: Record<string, { label: string; color: string }> = {
  activo: { label: 'Activo', color: '#4caf50' },
  cumplido: { label: 'Cumplido', color: '#2196f3' },
  cancelado: { label: 'Cancelado', color: '#f44336' },
  vencido: { label: 'Vencido', color: '#ff9800' }
};
