import React, { useState, useEffect, useContext } from 'react';
import {
  Box,
  // Typography,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  TextField,
  Button,
  IconButton,
  Chip,
  // Badge,
  InputAdornment,
  Alert,
  Snackbar,
  Stack,
  Tooltip
} from '@mui/material';
import {
  Search as SearchIcon,
  Info as InfoIcon,
  Chat as ChatIcon
} from '@mui/icons-material';
// import { useAuth } from '../autenticacion/ContextoAuth';
import { ContextoGeneral } from '../Contexto';
import { supabaseAgro } from '../../lib/supabase';

// Interfaces para el sistema de mensajería basado en Supabase
interface MensajeConversacion {
  id: string;
  numero_telefono: string;
  mensaje: string;
  rol: 'administrador' | 'bot' | 'usuario';
  enviado_en: string;
  metadata?: any;
  created_at: string;
}

interface Conversacion {
  numero_telefono: string;
  ultimoMensaje?: MensajeConversacion;
  fechaUltimoMensaje: Date;
  noLeidos: number;
  mensajes: MensajeConversacion[];
}

const Mensajes: React.FC = () => {
  // const { user } = useAuth();
  const { theme } = useContext(ContextoGeneral);
  const [conversaciones, setConversaciones] = useState<Conversacion[]>([]);
  const [conversacionActual, setConversacionActual] = useState<Conversacion | null>(null);
  const [mensajes, setMensajes] = useState<MensajeConversacion[]>([]);
  const [nuevoMensaje, setNuevoMensaje] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' | 'warning' | 'info' });
  // const [cargando, setCargando] = useState(false);

  // Cargar conversaciones desde Supabase
  const cargarConversaciones = async () => {
    try {
      // setCargando(true);
      const { data, error } = await supabaseAgro
        .from('mensajes_conversacion')
        .select('*')
        .order('enviado_en', { ascending: false });

      if (error) {
        console.error('Error cargando mensajes:', error);
        setSnackbar({ open: true, message: 'Error cargando mensajes', severity: 'error' });
        return;
      }

      // Agrupar mensajes por número de teléfono
      const conversacionesMap = new Map<string, Conversacion>();
      
      data?.forEach((mensaje: MensajeConversacion) => {
        const numero = mensaje.numero_telefono;
        
        if (!conversacionesMap.has(numero)) {
          conversacionesMap.set(numero, {
            numero_telefono: numero,
            ultimoMensaje: mensaje,
            fechaUltimoMensaje: new Date(mensaje.enviado_en),
            noLeidos: 0, // Por ahora no implementamos contador de no leídos
            mensajes: []
          });
        }
        
        const conversacion = conversacionesMap.get(numero)!;
        conversacion.mensajes.push(mensaje);
        
        // Actualizar último mensaje si es más reciente
        if (new Date(mensaje.enviado_en) > conversacion.fechaUltimoMensaje) {
          conversacion.ultimoMensaje = mensaje;
          conversacion.fechaUltimoMensaje = new Date(mensaje.enviado_en);
        }
      });

      // Convertir Map a Array y ordenar por fecha del último mensaje
      const conversacionesArray = Array.from(conversacionesMap.values())
        .sort((a, b) => b.fechaUltimoMensaje.getTime() - a.fechaUltimoMensaje.getTime());

      setConversaciones(conversacionesArray);
    } catch (error) {
      console.error('Error inesperado:', error);
      setSnackbar({ open: true, message: 'Error inesperado', severity: 'error' });
    } finally {
      // setCargando(false);
    }
  };

  // Cargar mensajes de una conversación específica
  const cargarMensajesConversacion = async (numeroTelefono: string) => {
    try {
      const { data, error } = await supabaseAgro
        .from('mensajes_conversacion')
        .select('*')
        .eq('numero_telefono', numeroTelefono)
        .order('enviado_en', { ascending: true });

      if (error) {
        console.error('Error cargando mensajes de conversación:', error);
        return;
      }

      setMensajes(data || []);
    } catch (error) {
      console.error('Error inesperado cargando mensajes:', error);
    }
  };

  // Enviar nuevo mensaje
  const enviarMensaje = async () => {
    if (!nuevoMensaje.trim() || !conversacionActual) return;

    try {
      const { error } = await supabaseAgro
        .from('mensajes_conversacion')
        .insert({
          numero_telefono: conversacionActual.numero_telefono,
          mensaje: nuevoMensaje,
          rol: 'administrador', // Asumimos que el usuario actual es administrador
          enviado_en: new Date().toISOString(),
          metadata: {}
        });

      if (error) {
        console.error('Error enviando mensaje:', error);
        setSnackbar({ open: true, message: 'Error enviando mensaje', severity: 'error' });
        return;
      }

      setNuevoMensaje('');
      // Recargar conversaciones y mensajes
      await cargarConversaciones();
      await cargarMensajesConversacion(conversacionActual.numero_telefono);
      
      setSnackbar({ open: true, message: 'Mensaje enviado', severity: 'success' });
    } catch (error) {
      console.error('Error inesperado enviando mensaje:', error);
      setSnackbar({ open: true, message: 'Error enviando mensaje', severity: 'error' });
    }
  };

  useEffect(() => {
    cargarConversaciones();
  }, []);

  const handleSeleccionarConversacion = async (conversacion: Conversacion) => {
    setConversacionActual(conversacion);
    await cargarMensajesConversacion(conversacion.numero_telefono);
  };

  const formatearFecha = (fecha: Date) => {
    const ahora = new Date();
    const diff = ahora.getTime() - fecha.getTime();
    const minutos = Math.floor(diff / (1000 * 60));
    const horas = Math.floor(diff / (1000 * 60 * 60));
    const dias = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutos < 1) return 'Ahora';
    if (minutos < 60) return `${minutos}m`;
    if (horas < 24) return `${horas}h`;
    if (dias < 7) return `${dias}d`;
    return fecha.toLocaleDateString();
  };

  const conversacionesFiltradas = conversaciones.filter(conv => {
    if (!busqueda) return true;
    return conv.numero_telefono.toLowerCase().includes(busqueda.toLowerCase());
  });

  return (
    <Box sx={{ 
      height: '100%', 
      display: 'flex', 
      backgroundColor: theme.colores.grisClaro,
      borderRadius: 2,
      overflow: 'hidden',
      boxShadow: 2
    }}>
      {/* Panel izquierdo - Lista de conversaciones */}
      <Box sx={{ 
        width: 350, 
        backgroundColor: 'white',
        borderRight: `1px solid ${theme.colores.gris}`,
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header del panel izquierdo */}
        <Box sx={{ 
          p: 2, 
          backgroundColor: theme.colores.azul,
          color: 'white'
        }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box 
              component="div"
              sx={{ 
                fontWeight: 600,
                fontSize: '1.25rem',
                color: 'white'
              }}
            >
              Mensajes
            </Box>
          </Box>
          
        </Box>

        {/* Barra de búsqueda */}
        <Box sx={{ p: 2, backgroundColor: 'white' }}>
          <TextField
            fullWidth
            placeholder="Buscar conversaciones..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: theme.colores.grisOscuro }} />
                </InputAdornment>
              ),
            }}
            size="small"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                backgroundColor: theme.colores.grisClaro,
                '& fieldset': {
                  borderColor: theme.colores.gris,
                },
                '&:hover fieldset': {
                  borderColor: theme.colores.azul,
                },
                '&.Mui-focused fieldset': {
                  borderColor: theme.colores.azul,
                },
              },
            }}
          />
        </Box>

        {/* Lista de conversaciones */}
        <Box sx={{ flex: 1, overflow: 'auto' }}>
          <List sx={{ p: 0 }}>
            {conversacionesFiltradas.map((conversacion) => {
              const estaSeleccionada = conversacionActual?.numero_telefono === conversacion.numero_telefono;

              return (
                <ListItem
                  key={conversacion.numero_telefono}
                  onClick={() => handleSeleccionarConversacion(conversacion)}
                  sx={{
                    cursor: 'pointer',
                    backgroundColor: estaSeleccionada ? theme.colores.grisClaro : 'transparent',
                    borderLeft: estaSeleccionada ? `4px solid ${theme.colores.azul}` : '4px solid transparent',
                    '&:hover': {
                      backgroundColor: theme.colores.grisClaro,
                    },
                    py: 1.5,
                    px: 2,
                  }}
                >
                  <ListItemAvatar>
                    <Avatar 
                      sx={{ 
                        width: 48, 
                        height: 48,
                        backgroundColor: theme.colores.azul,
                        color: 'white',
                        fontWeight: 600
                      }}
                    >
                      {conversacion.numero_telefono.charAt(0)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box component="span" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box 
                          component="span"
                          sx={{ 
                            fontWeight: estaSeleccionada ? 600 : 500,
                            color: theme.colores.azulOscuro,
                            fontSize: '0.95rem'
                          }}
                        >
                          {conversacion.numero_telefono}
                        </Box>
                        <Box 
                          component="span"
                          sx={{ 
                            color: theme.colores.grisOscuro,
                            fontSize: '0.75rem'
                          }}
                        >
                          {formatearFecha(conversacion.fechaUltimoMensaje)}
                        </Box>
                      </Box>
                    }
                    secondary={
                      <Box component="span" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.5 }}>
                        <Box
                          component="span"
                          sx={{ 
                            color: theme.colores.grisOscuro,
                            fontSize: '0.85rem',
                            flex: 1,
                            mr: 1,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {conversacion.ultimoMensaje?.mensaje || 'Sin mensajes'}
                        </Box>
                        {conversacion.noLeidos > 0 && (
                          <Chip
                            label={conversacion.noLeidos}
                            size="small"
                            sx={{ 
                              backgroundColor: theme.colores.azul,
                              color: 'white',
                              minWidth: 20, 
                              height: 20, 
                              fontSize: '0.7rem',
                              fontWeight: 600
                            }}
                          />
                        )}
                      </Box>
                    }
                  />
                </ListItem>
              );
            })}
          </List>
        </Box>
      </Box>

      {/* Panel derecho - Área de conversación */}
      <Box sx={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column',
        backgroundColor: 'white'
      }}>
        {conversacionActual ? (
          <>
            {/* Header de la conversación */}
            <Box sx={{ 
              p: 2, 
              backgroundColor: theme.colores.grisClaro,
              borderBottom: `1px solid ${theme.colores.gris}`,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar 
                  sx={{ 
                    mr: 2, 
                    width: 40, 
                    height: 40,
                    backgroundColor: theme.colores.azul,
                    color: 'white',
                    fontWeight: 600
                  }}
                >
                  {conversacionActual.numero_telefono.charAt(0)}
                </Avatar>
                <Box>
                  <Box 
                    component="div"
                    sx={{ 
                      color: theme.colores.azulOscuro,
                      fontWeight: 600,
                      fontSize: '1.1rem'
                    }}
                  >
                    {conversacionActual.numero_telefono}
                  </Box>
                  <Box 
                    component="div"
                    sx={{ 
                      color: theme.colores.grisOscuro,
                      fontSize: '0.8rem'
                    }}
                  >
                    Conversación activa
                  </Box>
                </Box>
              </Box>
              
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Tooltip title="Información">
                  <IconButton sx={{ color: theme.colores.azul }}>
                    <InfoIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>

            {/* Área de mensajes */}
            <Box sx={{ 
              flex: 1, 
              overflow: 'auto', 
              p: 2,
              backgroundColor: theme.colores.grisClaro,
            }}>
              {mensajes.length === 0 && (
                <Box
                  sx={{
                    display: 'inline-block',
                    backgroundColor: theme.colores.gris,
                    color: theme.colores.azulOscuro,
                    px: 2,
                    py: 1,
                    borderRadius: 2,
                    maxWidth: '100%',
                    wordBreak: 'break-word',
                    whiteSpace: 'pre-line',
                    fontSize: 15,
                    mb: 1,
                  }}
                >
                  <b>¡Hola!</b> Comenzá una conversación escribiendo un mensaje.
                </Box>
              )}
              <Stack spacing={1}>
                {mensajes.map((mensaje) => {
                  const esPropio = mensaje.rol === 'administrador' || mensaje.rol === 'bot';
                  const esBot = mensaje.rol === 'bot';
                  // const esAdmin = mensaje.rol === 'administrador';
                  return (
                    <Box
                      key={mensaje.id}
                      sx={{
                        mb: 1,
                        textAlign: esPropio ? 'right' : 'left',
                        ml: esPropio ? 6 : 0,
                        mr: esPropio ? 0 : 6,
                      }}
                    >
                      {/* Mostrar rol sobre el mensaje */}
                      <Box 
                        component="div"
                        sx={{ 
                          fontSize: '0.75rem',
                          color: theme.colores.grisOscuro,
                          mb: 0.5,
                          ml: esPropio ? 0 : 1,
                          mr: esPropio ? 1 : 0,
                          textAlign: esPropio ? 'right' : 'left',
                          fontWeight: 600,
                          textTransform: 'capitalize'
                        }}
                      >
                        {mensaje.rol}
                      </Box>
                      
                      <Box sx={{ 
                        display: 'inline-block', 
                        backgroundColor: esPropio ? theme.colores.azul : theme.colores.gris,
                        color: esPropio ? '#fff' : theme.colores.azulOscuro,
                        px: 2,
                        py: 1,
                        borderRadius: 2,
                        maxWidth: '100%',
                        wordBreak: 'break-word',
                        whiteSpace: 'pre-line',
                        fontSize: 15,
                        border: esBot ? `2px solid ${theme.colores.azul}` : 'none',
                        opacity: esBot ? 0.9 : 1,
                      }}>
                        {mensaje.mensaje}
                      </Box>
                      
                      {/* Mostrar timestamp */}
                      <Box 
                        component="div"
                        sx={{ 
                          fontSize: '0.7rem',
                          color: theme.colores.grisOscuro,
                          mt: 0.5,
                          ml: esPropio ? 0 : 1,
                          mr: esPropio ? 1 : 0,
                          textAlign: esPropio ? 'right' : 'left',
                        }}
                      >
                        {formatearFecha(new Date(mensaje.enviado_en))}
                      </Box>
                    </Box>
                  );
                })}
              </Stack>
            </Box>

            {/* Input para nuevo mensaje */}
            <Box sx={{ 
              display: 'flex', 
              p: 1, 
              borderTop: `1px solid ${theme.colores.azul}`,
              backgroundColor: theme.colores.grisClaro 
            }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Escribí tu mensaje..."
                value={nuevoMensaje}
                onChange={(e) => setNuevoMensaje(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    enviarMensaje();
                  }
                }}
                sx={{
                  mr: 1,
                  background: '#fff',
                  borderRadius: 1,
                  border: `1px solid ${theme.colores.azul}`,
                  '& .MuiOutlinedInput-root': {
                    '&.Mui-focused fieldset': {
                      borderColor: theme.colores.azul,
                    },
                  },
                }}
                InputProps={{
                  style: { color: theme.colores.azulOscuro },
                  sx: {
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: theme.colores.azul,
                    },
                  },
                }}
              />
              <Button 
                variant="contained" 
                onClick={enviarMensaje}
                disabled={!nuevoMensaje.trim()}
                sx={{ 
                  backgroundColor: theme.colores.azul, 
                  color: '#fff', 
                  fontWeight: 700, 
                  '&:hover': { 
                    backgroundColor: theme.colores.azulOscuro 
                  },
                  '&:disabled': {
                    backgroundColor: theme.colores.gris,
                    color: theme.colores.grisOscuro,
                  }
                }}
              >
                Enviar
              </Button>
            </Box>
          </>
        ) : (
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              color: theme.colores.grisOscuro,
              backgroundColor: 'white'
            }}
          >
            <ChatIcon sx={{ fontSize: 80, mb: 2, opacity: 0.3, color: theme.colores.azul }} />
            <Box 
              component="div"
              sx={{ 
                fontWeight: 500,
                fontSize: '1.5rem',
                color: theme.colores.grisOscuro,
                mb: 1
              }}
            >
              Selecciona una conversación
            </Box>
            <Box 
              component="div"
              sx={{ 
                opacity: 0.7,
                fontSize: '1rem',
                color: theme.colores.grisOscuro
              }}
            >
              Elige una conversación del panel izquierdo para comenzar a chatear
            </Box>
          </Box>
        )}
      </Box>


      {/* Snackbar para notificaciones */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Mensajes;
