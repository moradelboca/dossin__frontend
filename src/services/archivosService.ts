import { Archivo, Usuario } from '../interfaces/archivo';

const API_BASE_URL = 'https://dev.dossin.com.ar/api';
const AUTH_URL = 'https://auth.dossin.com.ar';

export const archivosService = {
  async obtenerArchivos(): Promise<Archivo[]> {
    const response = await fetch(`${API_BASE_URL}/archivos`);
    if (!response.ok) {
      throw new Error('Error al obtener archivos');
    }
    return response.json();
  },

  obtenerUrlContenido(id: number): string {
    return `${API_BASE_URL}/archivos/${id}/contenido`;
  },

  async obtenerUsuarios(): Promise<Usuario[]> {
    const response = await fetch(`${AUTH_URL}/auth/usuarios`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
      },
      mode: 'cors',
    });
    if (!response.ok) {
      throw new Error('Error al obtener usuarios');
    }
    return response.json();
  },

  async compartirArchivo(id: number, emails: string[]): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/archivos/${id}/usuarios`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ emails }),
    });
    if (!response.ok) {
      throw new Error('Error al compartir archivo');
    }
  },

  async revocarAcceso(id: number, emails: string[]): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/archivos/${id}/usuarios`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ emails }),
    });
    if (!response.ok) {
      throw new Error('Error al revocar acceso');
    }
  },

  async eliminarArchivo(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/archivos/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Error al eliminar archivo');
    }
  },

  async crearArchivo(nombre: string, descripcion: string, archivo: File, creadoPor: string): Promise<Archivo> {
    const formData = new FormData();
    formData.append('nombre', nombre);
    formData.append('descripcion', descripcion);
    formData.append('archivo', archivo);
    formData.append('creadoPor', creadoPor);

    const response = await fetch(`${API_BASE_URL}/archivos`, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error('Error al crear archivo');
    }
    
    return response.json();
  }
};
