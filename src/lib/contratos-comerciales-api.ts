// API functions for Contratos Comerciales using Dossin backend
// Endpoint: /contratos-comerciales

import { ContratoComercial } from '../types/contratosComerciales';

// Interface for the backend API request/response format
interface ContratoComercialBackend {
  id?: number;
  nombreContrato: string;
  fechaContrato: string;
  fechaInicio: string;
  fechaFin: string;
  idCargamento?: number;
  cargamento?: {
    id: number;
    nombre: string;
    tipoCargamento?: {
      id: number;
      nombre: string;
    };
  };
  productor?: {
    cuit: number;
    razonSocial: string;
    nombreFantasia?: string;
  };
  cliente?: {
    cuit: number;
    razonSocial: string;
    nombreFantasia?: string;
  };
  cuitProductor?: number; // Legacy support
  cuitCliente?: number; // Legacy support
  cantidadTotalKg: number;
  cantidadEntregadaKg: number;
  precioPorKg: number;
  moneda: string;
  estado: 'activo' | 'cumplido' | 'cancelado' | 'vencido';
  observaciones?: string;
  creadoPor: string;
  idCargas: number[];
}

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
    // Try to get error details from response body
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

// GET - Obtener todos los contratos comerciales
export async function getContratosComerciales(): Promise<ContratoComercial[]> {
  try {
    const response = await apiCall('/contratos-comerciales');
    const data = await response.json();
    // Convert backend format to frontend format
    return data.map(convertBackendToFrontend) || [];
  } catch (error) {
    console.error('Error fetching contratos comerciales:', error);
    return [];
  }
}

// GET - Obtener un contrato comercial por ID
export async function getContratoComercialById(id: number): Promise<ContratoComercial | null> {
  try {
    const response = await apiCall(`/contratos-comerciales/${id}`);
    const data = await response.json();
    return convertBackendToFrontend(data);
  } catch (error) {
    console.error('Error fetching contrato comercial:', error);
    return null;
  }
}

// Interface for form data (matches the form structure)
interface ContratoFormData {
  nombreContrato: string;
  fechaContrato: string;
  fechaInicio: string;
  fechaFin: string;
  idCargamento: number;
  cuitProductor: number;
  cuitCliente: number;
  cantidadTotalKg: number;
  cantidadEntregadaKg: number;
  precioPorKg: number;
  moneda: string;
  estado: string;
  observaciones: string;
  creadoPor: string;
  idCargas: number[];
}

// POST - Crear un nuevo contrato comercial (from form data)
export async function createContratoComercialFromForm(formData: ContratoFormData, userEmail?: string): Promise<ContratoComercial | null> {
  try {
    // Use user email or fallback to default
    const creadoPor = userEmail || 'admin@dossin.com.ar';
    const dataToSend = {
      ...formData,
      creadoPor
    };
    
    // Validate required fields
    const requiredFields = ['nombreContrato', 'fechaContrato', 'fechaInicio', 'fechaFin', 'idCargamento', 'cuitProductor', 'cuitCliente'];
    const missingFields = requiredFields.filter(field => !dataToSend[field as keyof ContratoFormData]);
    
    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }
    
    const response = await apiCall('/contratos-comerciales', {
      method: 'POST',
      body: JSON.stringify(dataToSend),
    });
    
    const data = await response.json();
    return convertBackendToFrontend(data);
  } catch (error) {
    console.error('Error creating contrato comercial:', error);
    return null;
  }
}

// PUT - Actualizar un contrato comercial
export async function updateContratoComercial(
  id: number, 
  updates: ContratoFormData
): Promise<boolean> {
  try {
    await apiCall(`/contratos-comerciales/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    return true;
  } catch (error) {
    console.error('Error updating contrato comercial:', error);
    return false;
  }
}

// DELETE - Eliminar un contrato comercial
export async function deleteContratoComercial(id: number): Promise<boolean> {
  try {
    await apiCall(`/contratos-comerciales/${id}`, {
      method: 'DELETE',
    });
    return true;
  } catch (error) {
    console.error('Error deleting contrato comercial:', error);
    return false;
  }
}

// PUT - Actualizar cargas asociadas a un contrato
export async function updateCargasAsociadas(
  contratoId: number, 
  cargasIds: number[]
): Promise<boolean> {
  try {
    await apiCall(`/contratos-comerciales/${contratoId}`, {
      method: 'PUT',
      body: JSON.stringify({ idCargas: cargasIds }),
    });
    
    return true;
  } catch (error) {
    console.error('Error updating cargas asociadas:', error);
    return false;
  }
}

// Helper functions to convert between frontend and backend formats
function convertBackendToFrontend(backend: ContratoComercialBackend): ContratoComercial {
  // Get idCargamento from either the nested cargamento object or idCargamento field
  const tipoGranoValue = backend.cargamento?.id ?? backend.idCargamento ?? 1;
  
  // Extract productor ID and name
  const productorId = backend.productor?.cuit ?? backend.cuitProductor ?? 0;
  const productorNombre = backend.productor?.razonSocial || backend.productor?.nombreFantasia || '';
  
  // Extract cliente (exportador) ID and name
  const exportadorId = backend.cliente?.cuit ?? backend.cuitCliente ?? 0;
  const exportadorNombre = backend.cliente?.razonSocial || backend.cliente?.nombreFantasia || '';
  
  return {
    id: backend.id || 0,
    numeroContrato: backend.nombreContrato,
    fechaContrato: backend.fechaContrato,
    fechaInicioEntrega: backend.fechaInicio,
    fechaFinEntrega: backend.fechaFin,
    productorId,
    productorNombre,
    exportadorId,
    exportadorNombre,
    tipoGrano: tipoGranoValue,
    tipoGranoNombre: backend.cargamento?.nombre || '',
    calidad: '',
    humedadMaxima: 0,
    impurezasMaximas: 0,
    cantidadTotalKg: backend.cantidadTotalKg,
    cantidadEntregadaKg: backend.cantidadEntregadaKg,
    precioPorKg: backend.precioPorKg,
    moneda: backend.moneda,
    condicionesPago: '',
    lugarEntrega: '',
    condicionesEntrega: '',
    estado: backend.estado,
    observaciones: backend.observaciones,
    cargasIds: backend.idCargas,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    created_by: undefined,
    updated_by: undefined
  };
}

// Function kept for potential future use
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function convertFrontendToBackend(frontend: Partial<ContratoComercial>): Partial<ContratoComercialBackend> {
  const result: Partial<ContratoComercialBackend> = {
    id: frontend.id,
    nombreContrato: frontend.numeroContrato || '',
    fechaContrato: frontend.fechaContrato || '',
    fechaInicio: frontend.fechaInicioEntrega || '',
    fechaFin: frontend.fechaFinEntrega || '',
    idCargamento: frontend.tipoGrano || 1,
    cantidadTotalKg: frontend.cantidadTotalKg || 0,
    cantidadEntregadaKg: frontend.cantidadEntregadaKg || 0,
    precioPorKg: frontend.precioPorKg || 0,
    moneda: frontend.moneda || 'ARS',
    estado: frontend.estado || 'activo',
    observaciones: frontend.observaciones,
    creadoPor: 'admin@dossin.com.ar', // Default value, should be passed from context
    idCargas: frontend.cargasIds || []
  };
  
  // Add legacy fields for backwards compatibility
  if (frontend.productorId) {
    result.cuitProductor = frontend.productorId;
  }
  if (frontend.exportadorId) {
    result.cuitCliente = frontend.exportadorId;
  }
  
  return result;
}
