import { supabaseAgro } from '../lib/supabase';

export interface CambioEstadoHistorial {
  id?: number;
  turno_id: string;
  estado_anterior_id: number | null;
  estado_nuevo_id: number;
  fecha_cambio?: string;
  usuario_id?: number | null;
  observaciones?: string | null;
}

/**
 * Registra un cambio de estado de un turno en el historial
 * Esta función es no bloqueante - si falla, no afecta el flujo principal
 * 
 * @param turnoId - ID del turno (UUID como string)
 * @param estadoAnteriorId - ID del estado anterior (null si es creación)
 * @param estadoNuevoId - ID del nuevo estado
 * @param usuarioId - ID del usuario que realiza el cambio (opcional)
 * @param observaciones - Observaciones adicionales (opcional)
 */
export async function registrarCambioEstado(
  turnoId: number | string,
  estadoAnteriorId: number | null,
  estadoNuevoId: number,
  usuarioId?: number | null,
  observaciones?: string | null
): Promise<void> {
  try {
    // Convertir turnoId a string (puede ser número o UUID)
    const turnoIdString = String(turnoId);
    
    // Validar que turnoId no esté vacío
    if (!turnoIdString || turnoIdString.trim() === '') {
      console.warn('No se puede registrar historial: turnoId está vacío', turnoId);
      return;
    }
    
    const cambio: Omit<CambioEstadoHistorial, 'id' | 'fecha_cambio'> = {
      turno_id: turnoIdString,
      estado_anterior_id: estadoAnteriorId,
      estado_nuevo_id: estadoNuevoId,
      usuario_id: usuarioId || null,
      observaciones: observaciones || null,
    };

    const { error } = await supabaseAgro
      .from('turnos_estado_historial')
      .insert([cambio]);

    if (error) {
      // Log error but don't throw - this is non-blocking
      console.warn('Error al registrar cambio de estado en historial:', error);
    }
  } catch (error) {
    // Silently catch any errors - historial registration should not break the main flow
    console.warn('Error inesperado al registrar cambio de estado:', error);
  }
}

/**
 * Obtiene el historial completo de cambios de estado de un turno
 * 
 * @param turnoId - ID del turno (UUID como string)
 * @returns Array con el historial de cambios ordenado por fecha (más reciente primero)
 */
export async function obtenerHistorialTurno(
  turnoId: number | string
): Promise<CambioEstadoHistorial[]> {
  try {
    // Convertir turnoId a string (puede ser número o UUID)
    const turnoIdString = String(turnoId);
    
    // Validar que turnoId no esté vacío
    if (!turnoIdString || turnoIdString.trim() === '') {
      console.warn('No se puede obtener historial: turnoId está vacío', turnoId);
      return [];
    }
    
    const { data, error } = await supabaseAgro
      .from('turnos_estado_historial')
      .select('*')
      .eq('turno_id', turnoIdString)
      .order('fecha_cambio', { ascending: false });

    if (error) {
      console.error('Error al obtener historial del turno:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error inesperado al obtener historial del turno:', error);
    return [];
  }
}

/**
 * Obtiene el último cambio de estado de un turno
 * 
 * @param turnoId - ID del turno (UUID como string)
 * @returns El último cambio de estado o null si no existe
 */
export async function obtenerUltimoCambioEstado(
  turnoId: number | string
): Promise<CambioEstadoHistorial | null> {
  try {
    // Convertir turnoId a string (puede ser número o UUID)
    const turnoIdString = String(turnoId);
    
    // Validar que turnoId no esté vacío
    if (!turnoIdString || turnoIdString.trim() === '') {
      console.warn('No se puede obtener último cambio: turnoId está vacío', turnoId);
      return null;
    }
    
    const { data, error } = await supabaseAgro
      .from('turnos_estado_historial')
      .select('*')
      .eq('turno_id', turnoIdString)
      .order('fecha_cambio', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      // Si no hay registros, no es un error crítico
      if (error.code === 'PGRST116') {
        return null;
      }
      console.error('Error al obtener último cambio de estado:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error inesperado al obtener último cambio de estado:', error);
    return null;
  }
}

