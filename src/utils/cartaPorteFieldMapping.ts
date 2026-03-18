// Mapeo de campos mostrados en el diálogo de Carta de Porte con los nombreCampo del backend

import type { TipoModificacionCampo } from '../types/turnos';

export interface CampoCartaPorte {
  label: string;
  nombreCampo?: string;
  esEditable: boolean;
  esCampoTurno?: boolean; // Si es true, se edita directamente en el turno, no como modificación
}

/**
 * Mapea el label del campo mostrado en el diálogo con el nombreCampo del backend
 */
export const MAPEO_CAMPOS_CARTA_PORTE: Record<string, string> = {
  'Titular Carta de Porte': 'titularCartaPorteCuit',
  'Remitente Comercial Productor': 'remitenteProductorCuit',
  'Rte. Comercial Venta Primaria': 'remitenteVentaPrimariaCuit',
  'Corredor Venta Primaria': 'corredorVentaPrimariaCuit',
  'Corredor Venta Secundaria': 'corredorVentaSecundariaCuit',
  'Destinatario': 'destinatarioCuit',
  'Destino': 'destinoCuit',
  'Flete pagador': 'fletePagadorCuit',
  'Representante entregador': 'representanteEntregadorCuit',
  'Representante recibidor': 'representanteRecibidorCuit',
  'Kilómetros del viaje': 'cantidadKm',
  'Tarifa': 'tarifa',
  'Rte. Comercial Venta secundaria': 'remitenteVentaSecundariaCuit',
  'Rte. Comercial Venta secundaria 2': 'remitenteVentaSecundaria2Cuit',
  'Intermediario de Flete': 'intermediarioDeFleteCuit',
  'Ubicación Descarga': 'idUbicacionDescarga',
  'Ubicación Balanza': 'idUbicacionBalanza',
};

/**
 * Campos que se editan directamente en el turno (no como modificaciones)
 */
export const CAMPOS_TURNO_DIRECTO = [
  'Empresa transportista',
  'Chofer',
  'Patente camión',
  'Patente acoplado',
  'Patente acoplado extra',
  'Kg tara',
  'Kg bruto',
  'Kg neto',
  'Kg cargados',
];

/**
 * Obtiene el nombreCampo para un label dado
 */
export function obtenerNombreCampo(label: string, tiposModificacion: TipoModificacionCampo[]): string | null {
  // Fallback: el mapeo del label es suficiente para saber qué campo intentar editar,
  // aunque el backend no devuelva el tipo en `tipos-modificacion`.
  return MAPEO_CAMPOS_CARTA_PORTE[label] ?? null;
}

/**
 * Obtiene el tipo de modificación para un campo dado
 */
export function obtenerTipoModificacion(
  nombreCampo: string,
  tiposModificacion: TipoModificacionCampo[]
): TipoModificacionCampo | null {
  return tiposModificacion.find(tipo => tipo.nombreCampo === nombreCampo) || null;
}

/**
 * Fallback para inferir `{ entidad, nullable }` cuando el backend no devuelve
 * el campo en `tipos-modificacion`.
 *
 * Reglas (según tu definición de campos modificables):
 * - No aceptan null: `tarifa`, `idUbicacionDescarga`
 * - Aceptan null: `cantidadKm`, `idUbicacionBalanza` y todos los `*Cuit` excepto titular
 * - Entidades:
 *   - `idUbicacion*` => `Ubicacion`
 *   - `*Cuit` => `Empresa`
 *   - `tarifa`/`cantidadKm` => `Valor`
 */
export function inferirTipoModificacionCampo(
  nombreCampo: string
): TipoModificacionCampo | null {
  if (!nombreCampo) return null;

  if (nombreCampo === 'tarifa') {
    return { nombreCampo, entidad: 'Valor', nullable: false };
  }

  if (nombreCampo === 'idUbicacionDescarga') {
    return { nombreCampo, entidad: 'Ubicacion', nullable: false };
  }

  if (nombreCampo === 'cantidadKm') {
    return { nombreCampo, entidad: 'Valor', nullable: true };
  }

  if (nombreCampo === 'idUbicacionBalanza') {
    return { nombreCampo, entidad: 'Ubicacion', nullable: true };
  }

  if (nombreCampo === 'titularCartaPorteCuit') {
    // En UI este campo se bloquea igualmente; dejamos nullable=false por seguridad.
    return { nombreCampo, entidad: 'Empresa', nullable: false };
  }

  if (nombreCampo.startsWith('idUbicacion')) {
    return { nombreCampo, entidad: 'Ubicacion', nullable: true };
  }

  if (nombreCampo.endsWith('Cuit')) {
    return { nombreCampo, entidad: 'Empresa', nullable: true };
  }

  return null;
}

/**
 * Verifica si un campo es editable (existe en tipos de modificación)
 */
export function esCampoEditable(label: string, tiposModificacion: TipoModificacionCampo[]): boolean {
  if (CAMPOS_TURNO_DIRECTO.includes(label)) return false;
  const nombreCampo = obtenerNombreCampo(label, tiposModificacion);
  return nombreCampo !== null;
}
