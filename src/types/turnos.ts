// TypeScript types for Turnos (Turns) system

export interface TipoModificacion {
  id: number;
  nombre: string;
  descripcion?: string;
  activo: boolean;
}

export interface TipoModificacionCampo {
  nombreCampo: string;
  entidad: 'Empresa' | 'Ubicacion' | 'Valor';
  nullable: boolean;
}

export interface ModificacionTurno {
  id: number;
  idTurno: string | number;
  tipoModificacion: TipoModificacion;
  descripcion?: string;
  fechaCreacion?: string;
  fechaActualizacion?: string;
}

export interface ModificacionTurnoCreate {
  idTipoModificacion?: number;
  nombreCampo?: string;
  valor?: any;
  descripcion?: string;
}

export interface TurnoDeCarga {
  id: number | string;
  estado: { id: number; nombre: string };
  colaborador?: {
    nombre?: string;
    apellido?: string;
    cuil?: string | number;
  };
  empresa?: {
    cuit?: string | number;
    razonSocial?: string;
  };
  camion?: {
    patente?: string;
  };
  acoplado?: {
    patente?: string;
  };
  acopladoExtra?: {
    patente?: string;
  };
  kgTara?: number;
  kgBruto?: number;
  kgNeto?: number;
  kgDescargados?: number;
  precioGrano?: number;
  factura?: any;
  numeroOrdenPago?: string;
  cartaDePorte?: any;
  modificaciones?: ModificacionTurno[];
  [key: string]: any;
}
