import { Archivo, Usuario } from '../interfaces/archivo';
import { axiosGet, axiosPost, axiosDelete, createAxiosInstance } from '../lib/axiosConfig';

const API_BASE_URL = 'https://api.dossin.com.ar/api';
const AUTH_URL = 'https://auth.dossin.com.ar';

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
  },

  async obtenerUsuarios(): Promise<Usuario[]> {
    try {
      return await axiosGet<Usuario[]>('/auth/usuarios', AUTH_URL);
    } catch (error) {
      throw new Error('Error al obtener usuarios');
    }
  },

  async compartirArchivo(id: number, emails: string[]): Promise<void> {
    try {
      await axiosPost(`archivos/${id}/usuarios`, { emails }, API_BASE_URL);
    } catch (error) {
      throw new Error('Error al compartir archivo');
    }
  },

  async revocarAcceso(id: number, emails: string[]): Promise<void> {
    try {
      await axiosDelete(`archivos/${id}/usuarios`, API_BASE_URL, {
        data: { emails }
      });
    } catch (error) {
      throw new Error('Error al revocar acceso');
    }
  },

  async eliminarArchivo(id: number): Promise<void> {
    try {
      await axiosDelete(`archivos/${id}`, API_BASE_URL);
    } catch (error) {
      throw new Error('Error al eliminar archivo');
    }
  },

  async crearArchivo(nombre: string, descripcion: string, archivo: File, creadoPor: string): Promise<Archivo> {
    try {
      const formData = new FormData();
      formData.append('nombre', nombre);
      formData.append('descripcion', descripcion);
      formData.append('archivo', archivo);
      formData.append('creadoPor', creadoPor);

      const instance = createAxiosInstance(API_BASE_URL);
      const response = await instance.post<Archivo>('archivos', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data;
    } catch (error) {
      throw new Error('Error al crear archivo');
    }
  }
};
