export interface Archivo {
  id: number;
  nombre: string;
  descripcion: string;
  creadoPor: string;
  fechaCreacion: string;
  fechaActualizacion: string;
  compartidoCon: string[];
}

export interface Usuario {
  id: number;
  email: string;
  nombreDeUsuario: string | null;
  nombre: string;
  apellido: string;
  imagen: string;
  activo: boolean;
  rol: {
    id: number;
    nombre: string;
  };
}
