import { Inconveniente } from "./Inconvenientes";

export const inconvenientesPruebas: Inconveniente[] = [
  {
    id: 1,
    titulo: "ssd",
    descripcion: "fsdf",
    urgencia: { id: 2, nombre: "Media" },
    fechaCreacion: "2025-05-27 00:04:16",
    fechaResolucion: null,
    tipoInconveniente: { id: 1, nombre: "Turno con errores" },
    creadoPor: "moradelboca@gmail.com",
    asignadoA: "fabriciosolisw@gmail.com",
    estado: { id: 3, nombre: "Resuelto" }
  },
  {
    id: 2,
    titulo: "Problema urgente",
    descripcion: "Algo muy urgente.",
    urgencia: { id: 1, nombre: "Alta" },
    fechaCreacion: "2025-05-26 10:00:00",
    fechaResolucion: null,
    tipoInconveniente: { id: 2, nombre: "Sistema" },
    creadoPor: "otro@ejemplo.com",
    asignadoA: "soporte@empresa.com",
    estado: { id: 2, nombre: "Activo" }
  },
  {
    id: 3,
    titulo: "Pendiente leve",
    descripcion: "No es urgente.",
    urgencia: { id: 3, nombre: "Leve" },
    fechaCreacion: "2025-05-25 08:30:00",
    fechaResolucion: null,
    tipoInconveniente: { id: 3, nombre: "Oficina" },
    creadoPor: "admin@empresa.com",
    asignadoA: null,
    estado: { id: 1, nombre: "Pendiente" }
  }
]