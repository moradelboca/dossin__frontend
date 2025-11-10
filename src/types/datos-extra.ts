// TypeScript types for Datos Extra Turnos system

export type TipoDato = 'text' | 'number' | 'date';

export interface MaestroAtributo {
  id: number;
  nombre_atributo: string;
  tipo_dato: TipoDato;
  created_at?: string;
}

export interface DatosExtraTurno {
  id: number;
  turno_id: number;
  ctg: string | null;
  empresa_titular_carta_de_porte: string | null;
  datos: Record<string, string | number>;
  created_at?: string;
  updated_at?: string;
}

export interface DatosExtraTurnoCreate {
  turno_id: number;
  ctg?: string;
  empresa_titular_carta_de_porte?: string;
  datos: Record<string, string | number>;
}

export interface MaestroAtributoCreate {
  nombre_atributo: string;
  tipo_dato: TipoDato;
}

export interface MaestroAtributoUpdate {
  nombre_atributo?: string;
  tipo_dato?: TipoDato;
}

