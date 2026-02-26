// API functions for Turnos Modificaciones (Turn Modifications) system
// Endpoints: /api/turnos/:idTurno/modificaciones, /api/turnos/modificaciones/tipos-modificacion

import type {
  ModificacionTurno,
  ModificacionTurnoCreate,
  TipoModificacionCampo,
} from '../types/turnos';
import { axiosGet, axiosPost, axiosDelete } from './axiosConfig';

/**
 * GET - Obtener todos los tipos de modificación disponibles (campos modificables)
 */
export async function getTiposModificacion(backendURL: string): Promise<TipoModificacionCampo[]> {
  try {
    const data = await axiosGet<TipoModificacionCampo[]>(
      'turnos/modificaciones/tipos-modificacion',
      backendURL
    );
    return data || [];
  } catch (error) {
    console.error('Error fetching tipos de modificación:', error);
    return [];
  }
}

/**
 * POST - Crear una nueva modificación para un turno
 * @param idTurno - ID del turno
 * @param modificacion - Datos de la modificación a crear
 * @param backendURL - URL del backend
 */
export async function createModificacionTurno(
  idTurno: string | number,
  modificacion: ModificacionTurnoCreate,
  backendURL: string
): Promise<ModificacionTurno | null> {
  try {
    const data = await axiosPost<ModificacionTurno>(
      `turnos/${idTurno}/modificaciones`,
      modificacion,
      backendURL
    );
    return data;
  } catch (error: any) {
    console.error('Error creating modificación:', error);
    throw error;
  }
}

/**
 * DELETE - Eliminar una modificación de un turno
 * @param idTurno - ID del turno
 * @param idModificacion - ID de la modificación a eliminar
 * @param backendURL - URL del backend
 */
export async function deleteModificacionTurno(
  idTurno: string | number,
  idModificacion: string | number,
  backendURL: string
): Promise<void> {
  try {
    await axiosDelete(`turnos/${idTurno}/modificaciones/${idModificacion}`, backendURL);
  } catch (error: any) {
    console.error('Error deleting modificación:', error);
    throw error;
  }
}
