// API functions for Parámetros de Calidad system using Dossin backend
// Endpoints: /parametros-calidad, /limites-contractuales/:idContrato/limites, /turnos/:idTurno/mediciones

import type {
  ParametroCalidad,
  ParametroCalidadCreate,
  ParametroCalidadUpdate,
  LimiteContractual,
  LimiteContractualCreate,
  LimiteContractualUpdate,
  MedicionParametro,
  MedicionParametroCreate,
  MedicionesLoteCreate,
} from '../types/parametros-calidad';
import { axiosRequest } from './axiosConfig';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

// Helper function to make API calls using axios
async function apiCall<T = any>(
  endpoint: string,
  options: {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    data?: any;
    headers?: Record<string, string>;
  } = {}
): Promise<T> {
  try {
    return await axiosRequest<T>(endpoint, BACKEND_URL, {
      method: options.method || 'GET',
      data: options.data,
      headers: options.headers,
    });
  } catch (error: any) {
    let errorDetails = '';
    if (error.response?.data) {
      errorDetails = typeof error.response.data === 'string' 
        ? error.response.data 
        : JSON.stringify(error.response.data);
    } else if (error.message) {
      errorDetails = error.message;
    }
    
    throw new Error(`API call failed: ${error.response?.status || 'Unknown'} ${error.response?.statusText || ''}. Details: ${errorDetails}`);
  }
}

// =====================================================
// PARÁMETROS DE CALIDAD - CRUD Operations
// =====================================================

/**
 * GET - Obtener todos los parámetros de calidad activos
 */
export async function getParametrosCalidad(): Promise<ParametroCalidad[]> {
  try {
    const data = await apiCall<ParametroCalidad[]>('/parametros-calidad');
    return data || [];
  } catch (error) {
    console.error('Error fetching parámetros de calidad:', error);
    return [];
  }
}

/**
 * POST - Crear un nuevo parámetro de calidad
 */
export async function createParametroCalidad(
  parametro: ParametroCalidadCreate
): Promise<ParametroCalidad | null> {
  try {
    const data = await apiCall<ParametroCalidad>('/parametros-calidad', {
      method: 'POST',
      data: parametro,
    });
    return data;
  } catch (error) {
    console.error('Error creating parámetro de calidad:', error);
    return null;
  }
}

/**
 * PUT - Actualizar un parámetro de calidad
 */
export async function updateParametroCalidad(
  id: number,
  updates: ParametroCalidadUpdate
): Promise<boolean> {
  try {
    await apiCall(`/parametros-calidad/${id}`, {
      method: 'PUT',
      data: updates,
    });
    return true;
  } catch (error) {
    console.error('Error updating parámetro de calidad:', error);
    return false;
  }
}

/**
 * DELETE - Eliminar (soft delete) un parámetro de calidad
 */
export async function deleteParametroCalidad(id: number): Promise<boolean> {
  try {
    await apiCall(`/parametros-calidad/${id}`, {
      method: 'DELETE',
    });
    return true;
  } catch (error) {
    console.error('Error deleting parámetro de calidad:', error);
    return false;
  }
}

// =====================================================
// LÍMITES CONTRACTUALES - CRUD Operations
// =====================================================

/**
 * GET - Obtener todos los límites contractuales activos de un contrato
 */
export async function getLimitesContractuales(
  idContrato: number
): Promise<LimiteContractual[]> {
  try {
    const data = await apiCall<LimiteContractual[]>(`/limites-contractuales/${idContrato}/limites`);
    return data || [];
  } catch (error) {
    console.error('Error fetching límites contractuales:', error);
    return [];
  }
}

/**
 * GET - Obtener todos los límites (activos e inactivos) de un contrato
 */
export async function getLimitesContractualesTodos(
  idContrato: number
): Promise<LimiteContractual[]> {
  try {
    const data = await apiCall<LimiteContractual[]>(`/limites-contractuales/${idContrato}/limites/todos`);
    return data || [];
  } catch (error) {
    console.error('Error fetching todos los límites contractuales:', error);
    return [];
  }
}

/**
 * POST - Crear un límite contractual individual
 */
export async function createLimiteContractual(
  idContrato: number,
  limite: LimiteContractualCreate
): Promise<LimiteContractual | null> {
  try {
    const data = await apiCall<LimiteContractual>(`/limites-contractuales/${idContrato}/limites/individual`, {
      method: 'POST',
      data: limite,
    });
    return data;
  } catch (error) {
    console.error('Error creating límite contractual:', error);
    return null;
  }
}

/**
 * POST - Configurar múltiples límites (reemplaza los existentes activos)
 */
export async function configurarLimitesContractuales(
  idContrato: number,
  limites: LimiteContractualCreate[]
): Promise<boolean> {
  try {
    await apiCall(`/limites-contractuales/${idContrato}/limites`, {
      method: 'POST',
      data: { limites },
    });
    return true;
  } catch (error) {
    console.error('Error configurando límites contractuales:', error);
    return false;
  }
}

/**
 * GET - Obtener un límite específico por su ID
 */
export async function getLimiteContractual(
  idContrato: number,
  idLimite: number
): Promise<LimiteContractual | null> {
  try {
    const data = await apiCall<LimiteContractual>(`/limites-contractuales/${idContrato}/limites/${idLimite}`);
    return data;
  } catch (error) {
    console.error('Error fetching límite contractual:', error);
    return null;
  }
}

/**
 * PUT - Actualizar un límite contractual
 */
export async function updateLimiteContractual(
  idContrato: number,
  idLimite: number,
  updates: LimiteContractualUpdate
): Promise<boolean> {
  try {
    await apiCall(`/limites-contractuales/${idContrato}/limites/${idLimite}`, {
      method: 'PUT',
      data: updates,
    });
    return true;
  } catch (error) {
    console.error('Error updating límite contractual:', error);
    return false;
  }
}

/**
 * DELETE - Eliminar (soft delete) un límite contractual
 */
export async function deleteLimiteContractual(
  idContrato: number,
  idLimite: number
): Promise<boolean> {
  try {
    await apiCall(`/limites-contractuales/${idContrato}/limites/${idLimite}`, {
      method: 'DELETE',
    });
    return true;
  } catch (error) {
    console.error('Error deleting límite contractual:', error);
    return false;
  }
}

// =====================================================
// MEDICIONES DE PARÁMETROS - CRUD Operations
// =====================================================

/**
 * GET - Obtener todas las mediciones de un turno
 * @param idTurno - ID del turno de carga
 * @param etapa - Opcional: filtrar por etapa ('carga' o 'descarga')
 */
export async function getMedicionesTurno(
  idTurno: string,
  etapa?: 'carga' | 'descarga'
): Promise<MedicionParametro[]> {
  try {
    const url = etapa
      ? `/turnos/${idTurno}/mediciones?etapa=${etapa}`
      : `/turnos/${idTurno}/mediciones`;
    const data = await apiCall<MedicionParametro[]>(url);
    return data || [];
  } catch (error) {
    console.error('Error fetching mediciones del turno:', error);
    return [];
  }
}

/**
 * POST - Registrar una medición individual
 */
export async function createMedicionParametro(
  idTurno: string,
  medicion: MedicionParametroCreate
): Promise<MedicionParametro | null> {
  try {
    const data = await apiCall<MedicionParametro>(`/turnos/${idTurno}/mediciones`, {
      method: 'POST',
      data: medicion,
    });
    return data;
  } catch (error) {
    console.error('Error creating medición:', error);
    return null;
  }
}

/**
 * POST - Registrar múltiples mediciones en lote
 */
export async function createMedicionesLote(
  idTurno: string,
  medicionesLote: MedicionesLoteCreate
): Promise<MedicionParametro[] | null> {
  try {
    const data = await apiCall<MedicionParametro[]>(`/turnos/${idTurno}/mediciones/lote`, {
      method: 'POST',
      data: medicionesLote,
    });
    return data || [];
  } catch (error) {
    console.error('Error creating mediciones en lote:', error);
    return null;
  }
}

/**
 * GET - Obtener una medición específica por su ID
 */
export async function getMedicionParametro(
  idTurno: string,
  idMedicion: number
): Promise<MedicionParametro | null> {
  try {
    const data = await apiCall<MedicionParametro>(`/turnos/${idTurno}/mediciones/${idMedicion}`);
    return data;
  } catch (error) {
    console.error('Error fetching medición:', error);
    return null;
  }
}

/**
 * PUT - Actualizar una medición existente
 */
export async function updateMedicionParametro(
  idTurno: string,
  idMedicion: number,
  updates: Partial<MedicionParametroCreate>
): Promise<boolean> {
  try {
    await apiCall(`/turnos/${idTurno}/mediciones/${idMedicion}`, {
      method: 'PUT',
      data: updates,
    });
    return true;
  } catch (error) {
    console.error('Error updating medición:', error);
    return false;
  }
}

/**
 * DELETE - Eliminar una medición específica
 */
export async function deleteMedicionParametro(
  idTurno: string,
  idMedicion: number
): Promise<boolean> {
  try {
    await apiCall(`/turnos/${idTurno}/mediciones/${idMedicion}`, {
      method: 'DELETE',
    });
    return true;
  } catch (error) {
    console.error('Error deleting medición:', error);
    return false;
  }
}

/**
 * DELETE - Eliminar todas las mediciones de un turno
 */
export async function deleteTodasMedicionesTurno(idTurno: string): Promise<boolean> {
  try {
    await apiCall(`/turnos/${idTurno}/mediciones`, {
      method: 'DELETE',
    });
    return true;
  } catch (error) {
    console.error('Error deleting todas las mediciones:', error);
    return false;
  }
}

