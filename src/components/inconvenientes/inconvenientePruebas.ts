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
  },
  {
    id: 4,
    titulo: "Corte de energía en planta",
    descripcion: "Se cortó la energía en la planta principal.",
    urgencia: { id: 1, nombre: "Alta" },
    fechaCreacion: "2024-01-01",
    fechaResolucion: null,
    tipoInconveniente: { id: 4, nombre: "Sistema" },
    creadoPor: {
      id: 9,
      email: "planta@empresa.com",
      imagen: null
    },
    asignadoA: {
      id: 10,
      email: "tecnico@empresa.com",
      imagen: null
    },
    estado: { id: 3, nombre: "Atendiendo" }
  },
  {
    id: 5,
    titulo: "Fuga de gas detectada",
    descripcion: "Se detectó una fuga de gas en el sector 2.",
    urgencia: { id: 1, nombre: "Alta" },
    fechaCreacion: "2024-12-20",
    fechaResolucion: null,
    tipoInconveniente: { id: 5, nombre: "Seguridad" },
    creadoPor: {
      id: 11,
      email: "seguridad@empresa.com",
      imagen: null
    },
    asignadoA: {
      id: 12,
      email: "jefe@empresa.com",
      imagen: null
    },
    estado: { id: 1, nombre: "Pendiente" }
  },
  {
    id: 6,
    titulo: "Problema en sistema de turnos",
    descripcion: "El sistema de turnos no responde.",
    urgencia: { id: 2, nombre: "Media" },
    fechaCreacion: "2024-02-01",
    fechaResolucion: null,
    tipoInconveniente: { id: 2, nombre: "Sistema" },
    creadoPor: {
      id: 13,
      email: "usuario1@empresa.com",
      imagen: null
    },
    asignadoA: {
      id: 14,
      email: "soporte2@empresa.com",
      imagen: null
    },
    estado: { id: 3, nombre: "Atendiendo" }
  },
  {
    id: 7,
    titulo: "Falta de insumos de oficina",
    descripcion: "No hay hojas en la impresora.",
    urgencia: { id: 3, nombre: "Leve" },
    fechaCreacion: "2024-01-10",
    fechaResolucion: null,
    tipoInconveniente: { id: 6, nombre: "Oficina" },
    creadoPor: {
      id: 15,
      email: "oficina@empresa.com",
      imagen: null
    },
    asignadoA: {
      id: 16,
      email: "admin@empresa.com",
      imagen: null
    },
    estado: { id: 1, nombre: "Pendiente" }
  },
  {
    id: 8,
    titulo: "Demora en despacho de camiones",
    descripcion: "Los camiones están demorando más de lo habitual.",
    urgencia: { id: 2, nombre: "Media" },
    fechaCreacion: "2024-12-01",
    fechaResolucion: null,
    tipoInconveniente: { id: 7, nombre: "Logística" },
    creadoPor: {
      id: 17,
      email: "logistica@empresa.com",
      imagen: null
    },
    asignadoA: {
      id: 18,
      email: "coordinador@empresa.com",
      imagen: null
    },
    estado: { id: 3, nombre: "Atendiendo" }
  },
  {
    id: 9,
    titulo: "Incendio en depósito",
    descripcion: "Se reporta un principio de incendio en el depósito.",
    urgencia: { id: 1, nombre: "Alta" },
    fechaCreacion: "2024-12-25",
    fechaResolucion: null,
    tipoInconveniente: { id: 8, nombre: "Emergencia" },
    creadoPor: {
      id: 19,
      email: "emergencia@empresa.com",
      imagen: null
    },
    asignadoA: {
      id: 20,
      email: "bombero@empresa.com",
      imagen: null
    },
    estado: { id: 3, nombre: "Atendiendo" }
  },
  {
    id: 10,
    titulo: "Luz de pasillo quemada",
    descripcion: "La luz del pasillo principal está quemada.",
    urgencia: { id: 3, nombre: "Leve" },
    fechaCreacion: "2024-01-05",
    fechaResolucion: null,
    tipoInconveniente: { id: 9, nombre: "Mantenimiento" },
    creadoPor: {
      id: 21,
      email: "mantenimiento@empresa.com",
      imagen: null
    },
    asignadoA: {
      id: 22,
      email: "tecnico2@empresa.com",
      imagen: null
    },
    estado: { id: 3, nombre: "Atendiendo" }
  },
  {
    id: 11,
    titulo: "Demora en facturación",
    descripcion: "La facturación está tardando más de lo habitual.",
    urgencia: { id: 2, nombre: "Media" },
    fechaCreacion: "2024-12-10",
    fechaResolucion: null,
    tipoInconveniente: { id: 10, nombre: "Administración" },
    creadoPor: {
      id: 23,
      email: "admin2@empresa.com",
      imagen: null
    },
    asignadoA: {
      id: 24,
      email: "conta@empresa.com",
      imagen: null
    },
    estado: { id: 1, nombre: "Pendiente" }
  },
  {
    id: 12,
    titulo: "Corte de agua solucionado",
    descripcion: "El corte de agua fue resuelto por el personal.",
    urgencia: { id: 1, nombre: "Alta" },
    fechaCreacion: "2024-12-30",
    fechaResolucion: "2024-12-31",
    tipoInconveniente: { id: 11, nombre: "Mantenimiento" },
    creadoPor: {
      id: 25,
      email: "agua@empresa.com",
      imagen: null
    },
    asignadoA: {
      id: 26,
      email: "tecnico3@empresa.com",
      imagen: null
    },
    estado: { id: 2, nombre: "Resuelto" }
  },
  {
    id: 13,
    titulo: "Papelera vacía",
    descripcion: "La papelera fue vaciada correctamente.",
    urgencia: { id: 3, nombre: "Leve" },
    fechaCreacion: "2024-01-02",
    fechaResolucion: "2024-01-03",
    tipoInconveniente: { id: 12, nombre: "Oficina" },
    creadoPor: {
      id: 27,
      email: "limpieza@empresa.com",
      imagen: null
    },
    asignadoA: {
      id: 28,
      email: "admin3@empresa.com",
      imagen: null
    },
    estado: { id: 2, nombre: "Resuelto" }
  }
]; 