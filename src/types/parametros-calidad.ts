// TypeScript types for Parámetros de Calidad system

export interface ParametroCalidad {
  id: number;
  nombre: string;
  unidadMedida: string;
  valorMinimo: number;
  valorMaximo: number;
  descripcion?: string;
  activo: boolean;
  fechaCreacion?: string;
  fechaActualizacion?: string;
}

export interface ParametroCalidadCreate {
  nombre: string;
  unidadMedida: string;
  valorMinimo: number;
  valorMaximo: number;
  descripcion?: string;
}

export interface ParametroCalidadUpdate {
  nombre?: string;
  unidadMedida?: string;
  valorMinimo?: number;
  valorMaximo?: number;
  descripcion?: string;
  activo?: boolean;
}

export type TipoLimite = 'maximo' | 'minimo' | 'exacto';
export type TipoCalculo = 'fijo' | 'porcentual' | 'escalonado';

export interface EscalonCalculo {
  desde: number;
  hasta: number;
  valor: number;
  esPorcentual: boolean;
}

export interface LimiteContractual {
  id: number;
  idContratoComercial: number;
  idParametroCalidad: number;
  parametroCalidad?: ParametroCalidad;
  valorLimite: number;
  tipoLimite: TipoLimite;
  tipoCalculo: TipoCalculo;
  valorPenalizacion: number | null;
  aplicaBonificacion: boolean;
  detalleCalculo: string | null; // JSON string para escalonado
  activo: boolean;
  observaciones?: string;
  fechaCreacion?: string;
  fechaActualizacion?: string;
}

export interface LimiteContractualCreate {
  idParametroCalidad: number;
  valorLimite: number;
  tipoLimite: TipoLimite;
  tipoCalculo: TipoCalculo;
  valorPenalizacion?: number | null;
  aplicaBonificacion: boolean;
  detalleCalculo?: string | null;
  observaciones?: string;
}

export interface LimiteContractualUpdate {
  valorLimite?: number;
  tipoLimite?: TipoLimite;
  tipoCalculo?: TipoCalculo;
  valorPenalizacion?: number | null;
  aplicaBonificacion?: boolean;
  detalleCalculo?: string | null;
  observaciones?: string;
  activo?: boolean;
}

export type EtapaMedicion = 'carga' | 'descarga';

export interface MedicionParametro {
  id: number;
  idTurnoCarga: string;
  idParametroCalidad: number;
  parametroCalidad?: ParametroCalidad;
  valorMedido: number;
  etapaMedicion: EtapaMedicion;
  fechaCreacion?: string;
}

export interface MedicionParametroCreate {
  idParametroCalidad: number;
  valorMedido: number;
  etapaMedicion: EtapaMedicion;
}

export interface MedicionesLoteCreate {
  etapaMedicion: EtapaMedicion;
  mediciones: Array<{
    idParametroCalidad: number;
    valorMedido: number;
  }>;
}

export interface AjusteMerma {
  idParametroCalidad: number;
  nombreParametro: string;
  valorMedido: number;
  valorLimite: number;
  tipoLimite: TipoLimite;
  diferencia: number;
  tipoCalculo: TipoCalculo;
  valorPenalizacion: number | null;
  montoAjuste: number;
  tipoAjuste: 'descuento' | 'bonificacion';
  metodologia: string;
  etapaMedicion: EtapaMedicion;
}

export interface AjustesMermas {
  montoTotal: number;
  detalle: AjusteMerma[];
  mensaje?: string;
}


