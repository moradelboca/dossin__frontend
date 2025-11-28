import { Archivo } from '../interfaces/archivo';

const API_BASE_URL = 'https://api.dossin.com.ar/api';

export const archivosService = {
  async obtenerArchivos(): Promise<Archivo[]> {
    const response = await fetch(`${API_BASE_URL}/archivos`/* , {
      credentials: "include" 
    } */);
    if (!response.ok) {
      throw new Error('Error al obtener archivos');
    }
    return response.json();
  },

  obtenerUrlContenido(id: number): string {
    return `${API_BASE_URL}/archivos/${id}/contenido`;
  }
};
