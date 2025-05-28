import { Inconveniente } from "./Inconvenientes";

export const inconvenientesPruebas: Inconveniente[] = [
  {
    id: 1,
    titulo: "Fuertes lluvias detectadas",
    descripcion: "Fuertes lluvias detectadas en la zona La Calera con una probabilidad del 94%",
    urgencia: { id: 2, nombre: "Media" },
    fechaCreacion: "2024-11-11",
    fechaResolucion: null,
    tipoInconveniente: { id: 1, nombre: "Lluvias" },
    creadoPor: {
      id: 5,
      email: "zullolau@gmail.com",
      imagen: "https://lh3.googleusercontent.com/a/ACg8ocLXi_TSo20Zq4M0Gt-iNU45V2bn32CL1IDasP0nyZIKm4Rv0V1i=s96-c"
    },
    asignadoA: {
      id: 6,
      email: "test@test.com",
      imagen: null
    },
    estado: { id: 2, nombre: "Resuelto" }
  },
  {
    id: 2,
    titulo: "Problemas con la carga de combustible",
    descripcion: "El chofer reportó inconvenientes al cargar combustible.",
    urgencia: { id: 1, nombre: "Alta" },
    fechaCreacion: "2024-12-12",
    fechaResolucion: null,
    tipoInconveniente: { id: 2, nombre: "Sistema" },
    creadoPor: {
      id: 7,
      email: "soporte@test.com",
      imagen: null
    },
    asignadoA: {
      id: 8,
      email: "admin@test.com",
      imagen: "https://lh3.googleusercontent.com/a/ACg8ocLXi_TSo20Zq4M0Gt-iNU45V2bn32CL1IDasP0nyZIKm4Rv0V1i=s96-c"
    },
    estado: { id: 1, nombre: "Pendiente" }
  },
  {
    id: 3,
    titulo: "Error de Cuil",
    descripcion: "No existe el cuil del chofer",
    urgencia: { id: 2, nombre: "Media" },
    fechaCreacion: "2024-11-11",
    fechaResolucion: null,
    tipoInconveniente: { id: 3, nombre: "Generado por chofer" },
    creadoPor: {
      id: 5,
      email: "zullolau@gmail.com",
      imagen: "https://lh3.googleusercontent.com/a/ACg8ocLXi_TSo20Zq4M0Gt-iNU45V2bn32CL1IDasP0nyZIKm4Rv0V1i=s96-c"
    },
    asignadoA: {
      id: 6,
      email: "test@test.com",
      imagen: null
    },
    estado: { id: 2, nombre: "Resuelto" }
  }
]; 