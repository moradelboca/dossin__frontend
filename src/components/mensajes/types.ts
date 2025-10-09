// Interfaces para el sistema de mensajería

export interface Mensaje {
  id: string;
  contenido: string;
  remitenteId: string;
  remitenteNombre: string;
  destinatarioId: string;
  destinatarioNombre: string;
  fechaEnvio: Date;
  leido: boolean;
  tipo: 'texto' | 'imagen' | 'archivo' | 'video';
  adjuntos?: string[];
  conversacionId: string;
  mensajeRespuesta?: {
    id: string;
    contenido: string;
    remitenteNombre: string;
  };
}

export interface Conversacion {
  id: string;
  participantes: string[];
  ultimoMensaje?: Mensaje;
  fechaUltimoMensaje: Date;
  noLeidos: number;
  tipo: 'individual' | 'grupo';
  nombre?: string; // Para conversaciones grupales
  avatar?: string;
  archivada?: boolean;
  silenciada?: boolean;
}

export interface Usuario {
  id: string;
  nombre: string;
  email: string;
  avatar?: string;
  online: boolean;
  ultimaActividad: Date;
  rol?: {
    id: number;
    nombre: string;
  };
}

export interface NotificacionMensaje {
  id: string;
  mensajeId: string;
  conversacionId: string;
  usuarioId: string;
  leida: boolean;
  fechaCreacion: Date;
}

export interface EstadoMensajeria {
  conversaciones: Conversacion[];
  conversacionActual: Conversacion | null;
  mensajes: Mensaje[];
  usuarios: Usuario[];
  cargando: boolean;
  error?: string;
}

export interface AccionMensajeria {
  tipo: 'ENVIAR_MENSAJE' | 'MARCAR_LEIDO' | 'AGREGAR_CONVERSACION' | 'ELIMINAR_MENSAJE' | 'ARCHIVAR_CONVERSACION';
  payload: any;
}

// Tipos para eventos de WebSocket
export interface EventoMensaje {
  tipo: 'MENSAJE_NUEVO' | 'MENSAJE_LEIDO' | 'USUARIO_ONLINE' | 'USUARIO_OFFLINE';
  datos: any;
  timestamp: Date;
}

// Configuración del sistema de mensajería
export interface ConfiguracionMensajeria {
  maxArchivosAdjuntos: number;
  maxTamañoArchivo: number; // en bytes
  tiposArchivoPermitidos: string[];
  tiempoTimeoutConexion: number; // en milisegundos
  intervaloReconexion: number; // en milisegundos
}



