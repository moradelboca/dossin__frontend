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
  const nombreCampo = MAPEO_CAMPOS_CARTA_PORTE[label];
  if (!nombreCampo) return null;
  
  // Verificar que existe en los tipos de modificación
  const existe = tiposModificacion.some(tipo => tipo.nombreCampo === nombreCampo);
  return existe ? nombreCampo : null;
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
 * Verifica si un campo es editable (existe en tipos de modificación)
 */
export function esCampoEditable(label: string, tiposModificacion: TipoModificacionCampo[]): boolean {
  if (CAMPOS_TURNO_DIRECTO.includes(label)) return false;
  const nombreCampo = obtenerNombreCampo(label, tiposModificacion);
  return nombreCampo !== null;
}
