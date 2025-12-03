import { Archivo } from '../interfaces/archivo';
import { axiosGet } from '../lib/axiosConfig';

const API_BASE_URL = 'https://dev.dossin.com.ar/api';

export const archivosService = {
  async obtenerArchivos(): Promise<Archivo[]> {
    try {
      return await axiosGet<Archivo[]>('archivos', API_BASE_URL);
    } catch (error) {
      throw new Error('Error al obtener archivos');
    }
  },

  obtenerUrlContenido(id: number): string {
    return `${API_BASE_URL}/archivos/${id}/contenido`;
  }
};
