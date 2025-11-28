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

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

// Helper function to make API calls
async function apiCall(endpoint: string, options: RequestInit = {}): Promise<Response> {
  const url = `${BACKEND_URL}${endpoint}`;
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
  };

  const response = await fetch(url, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  });

  if (!response.ok) {
    let errorDetails = '';
    try {
      const errorText = await response.text();
      errorDetails = errorText;
    } catch (e) {
      // Could not read error response body
    }
    
    throw new Error(`API call failed: ${response.status} ${response.statusText}. Details: ${errorDetails}`);
  }

  return response;
}

// =====================================================
// PARÁMETROS DE CALIDAD - CRUD Operations
// =====================================================

/**
 * GET - Obtener todos los parámetros de calidad activos
 */
export async function getParametrosCalidad(): Promise<ParametroCalidad[]> {
  try {
    const response = await apiCall('/parametros-calidad');
    const data = await response.json();
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
    const response = await apiCall('/parametros-calidad', {
      method: 'POST',
      body: JSON.stringify(parametro),
    });
    const data = await response.json();
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
      body: JSON.stringify(updates),
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
    const response = await apiCall(`/limites-contractuales/${idContrato}/limites`);
    const data = await response.json();
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
    const response = await apiCall(`/limites-contractuales/${idContrato}/limites/todos`);
    const data = await response.json();
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
    const response = await apiCall(`/limites-contractuales/${idContrato}/limites/individual`, {
      method: 'POST',
      body: JSON.stringify(limite),
    });
    const data = await response.json();
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
      body: JSON.stringify({ limites }),
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
    const response = await apiCall(`/limites-contractuales/${idContrato}/limites/${idLimite}`);
    const data = await response.json();
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
      body: JSON.stringify(updates),
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
    const response = await apiCall(url);
    const data = await response.json();
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
    const response = await apiCall(`/turnos/${idTurno}/mediciones`, {
      method: 'POST',
      body: JSON.stringify(medicion),
    });
    const data = await response.json();
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
    const response = await apiCall(`/turnos/${idTurno}/mediciones/lote`, {
      method: 'POST',
      body: JSON.stringify(medicionesLote),
    });
    const data = await response.json();
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
    const response = await apiCall(`/turnos/${idTurno}/mediciones/${idMedicion}`);
    const data = await response.json();
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
      body: JSON.stringify(updates),
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

