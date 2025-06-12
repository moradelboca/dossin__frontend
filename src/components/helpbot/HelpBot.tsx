import React, { useState, useRef, useEffect, useContext } from 'react';
import { Box, IconButton, Paper, Typography, TextField, Button, CircularProgress, Slide } from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import MinimizeIcon from '@mui/icons-material/Minimize';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import CloseIcon from '@mui/icons-material/Close';
import { useAuth } from '../autenticacion/ContextoAuth';
import { ContextoGeneral } from '../Contexto';
import {  useNavigate } from "react-router-dom";
import { HelpbotResponse } from '../../interfaces/HelpbotResponse';

const DIALOG_WIDTH = 370;
const DIALOG_HEIGHT = 420;

type MessageRole = 'user' | 'assistant';
interface ChatMessage {
  role: MessageRole;
  content: string;
  response?: HelpbotResponse;
}

const PAGINAS = [
  { label: "Dashboard", ruta: "/" },
  { label: "Cargas", ruta: "/cargas" },
  { label: "Contratos", ruta: "/contratos" },
  { label: "Choferes", ruta: "/colaboradores" },
  { label: "Ubicaciones", ruta: "/ubicaciones" },
  { label: "Empresas", ruta: "/empresas" },
  { label: "Camiones", ruta: "/camiones" },
  { label: "Inconvenientes", ruta: "/inconvenientes" },
  { label: "Clima", ruta: "/clima" },
  { label: "Calculadora", ruta: "/calculadora" },
  { label: "Administrador", ruta: "/admin" },
];

const MAX_HISTORY = 5;

// Helper para fetch con timeout
function fetchWithTimeout(resource: RequestInfo, options: RequestInit = {}, timeout = 120000): Promise<Response> {
  return Promise.race([
    fetch(resource, options),
    new Promise<Response>((_, reject) => setTimeout(() => reject(new Error('Timeout de la IA excedido.')), timeout))
  ]) as Promise<Response>;
}

const HelpBot: React.FC = () => {
  const { user } = useAuth();
  const { theme } = useContext(ContextoGeneral);
  const azul = theme.colores.azul;
  const azulOscuro = theme.colores.azulOscuro;
  const grisClaro = theme.colores.grisClaro;
  const gris = theme.colores.gris;
  const grisOscuro = theme.colores.grisOscuro;
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const [pendingIntent, setPendingIntent] = useState<string | null>(null);

  useEffect(() => {
    if (!minimized && open && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, minimized, open]);

  const helpBotSystemPrompt = `DOCUMENTOS:
[fragmentos relevantes de la documentación, insertados por el sistema]

PREGUNTA:
[lo que pregunta el usuario]

INSTRUCCIONES:
1. Antes de responder, revisá primero la información de permisos. Si el usuario no tiene permiso para la acción, respondé solo eso y no sigas.
2. Si tiene permiso, explicá el flujo usando la documentación de pantallas, priorizando la pantalla relevante según la pregunta o el contexto.
3. Solo usá la documentación de acciones si el usuario pide detalles paso a paso o información muy específica sobre cómo realizar la acción.
Respondé de forma clara, cálida y paso a paso, usando solo la información de los DOCUMENTOS. Si hay acciones relacionadas, sugerilas al final. Si no sabés la respuesta, decí que no sabés.
Respondé siempre en formato JSON válido, exactamente como en el ejemplo:

EJEMPLO:
Pregunta: ¿Cómo puedo modificar un turno?
Respuesta:
{
  "permiso": true,
  "message": "No te preocupes, es fácil. Primero dirigite a Contratos, seleccioná un contrato y hacé clic en 'Crear carga +'. Una vez ahí, si querés sigo explicándote.",
  "pagina": "Contratos",
  "sugerencias": ["¿Querés saber cómo editar los datos del turno una vez que lo abriste?"]
}

Si no hay suficiente información en los DOCUMENTOS para responder, devolvé:
{
  "permiso": false,
  "message": null,
  "pagina": null,
  "sugerencias": null
}`;

  const handleSend = async () => {
    if (!input.trim()) return;
    // Solo las últimas MAX_HISTORY interacciones relevantes
    const lastMessages = messages.slice(-MAX_HISTORY);
    // Si hay intención pendiente, agregarla solo al mensaje enviado a la IA
    let inputWithIntent = input;
    if (pendingIntent) {
      inputWithIntent = `Nota: El usuario fue a la página actual para continuar con el objetivo de: ${pendingIntent}.\n${input}`;
      setPendingIntent(null);
    }
    // Guardar en el historial visual el mensaje original del usuario
    const newMessages: ChatMessage[] = [...lastMessages, { role: 'user', content: input }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    let aiContent = '';
    let aiResponse: HelpbotResponse | undefined = undefined;
    let errorFinal = '';
    let intentos = 0;
    while (intentos < 2) {
      try {
        // Armar historial resumido
        const historySummary = lastMessages
          .filter(m => m.role === 'user' || m.role === 'assistant')
          .map(m => `${m.role === 'user' ? 'Usuario' : 'IA'}: ${m.content}`)
          .join('\n');
        const userMessageText = `Rol: ${user?.rol?.nombre || user?.rol?.id}\nPágina: ${window.location.pathname}\nHistorial: ${historySummary}\nMensaje: ${inputWithIntent}`;
        const openaiPayload = {
          model: "gpt-4.1-nano",
          input: [
            {
              role: "system",
              content: [
                {
                  type: "input_text",
                  text: helpBotSystemPrompt
                }
              ]
            },
            {
              role: "user",
              content: [
                {
                  type: "input_text",
                  text: userMessageText
                }
              ]
            }
          ],
          text: {
            format: {
              type: "text"
            }
          },
          reasoning: {},
          tools: [
            {
              type: "file_search",
              vector_store_ids: [
               "vs_68484698d77481919b023232b0869517"
              ]
            }
          ],
          temperature: 0,
          max_output_tokens: 1024,
          top_p: 1,
          store: true
        };
        console.log('HelpBot: Payload enviado a la IA:', openaiPayload);
        const response: Response = await fetchWithTimeout('https://api.openai.com/v1/responses', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY || import.meta.env.OPENAI_API_KEY}`,
          },
          body: JSON.stringify(openaiPayload),
        }, 30000);
        const data = await response.json();
        console.log('HelpBot: Respuesta completa de la API:', data);
        let rawText = '';
        if (
          Array.isArray(data.output) &&
          data.output.length > 1 &&
          Array.isArray(data.output[1].content) &&
          data.output[1].content.length > 0 &&
          typeof data.output[1].content[0].text === 'string'
        ) {
          rawText = data.output[1].content[0].text;
        } else if (typeof data.output === 'string') {
          rawText = data.output;
        } else if (data.error && data.error.message) {
          rawText = `Error IA: ${data.error.message}`;
        } else {
          rawText = 'No se pudo obtener respuesta de la IA.';
          errorFinal = JSON.stringify(data);
        }
        console.log('HelpBot: Respuesta rawText de la IA:', rawText);
        // Intentar parsear JSON
        try {
          aiResponse = JSON.parse(rawText);
          console.log('HelpBot: Objeto parseado de la IA:', aiResponse);
          aiContent = aiResponse && typeof aiResponse === 'object' && 'message' in aiResponse ? aiResponse.message || '' : '';
        } catch (e) {
          aiContent = 'Error: la IA no devolvió un JSON válido.';
          aiResponse = undefined;
          console.error('HelpBot: Error parseando JSON de la IA:', e, rawText);
        }
        break;
      } catch (e) {
        aiContent = `Error de red o formato: ${e instanceof Error ? e.message : String(e)}`;
        errorFinal = aiContent;
        console.error('HelpBot: Error de red o formato:', e);
      }
      intentos++;
      if (intentos < 2) {
        await new Promise(res => setTimeout(res, 2000));
      }
    }
    if (intentos === 2 && errorFinal) {
      aiContent = 'La IA está tardando en responder. Por favor, intentá de nuevo en unos segundos.';
      aiResponse = undefined;
      console.error('Error IA tras reintentos:', errorFinal);
    }
    let aiMessage: ChatMessage;
    if (aiResponse !== undefined) {
      aiMessage = { role: 'assistant', content: aiContent, response: aiResponse };
    } else {
      aiMessage = { role: 'assistant', content: aiContent };
    }
    setMessages([...newMessages, aiMessage]);
    setLoading(false);
  };

  if (!user || user.rol?.id === 3) return null;

  const iconButton = (
    <Box
      sx={{
        position: 'fixed',
        right: 24,
        bottom: 24,
        zIndex: 2000,
        boxShadow: 3,
        borderRadius: '50%',
        bgcolor: azul,
      }}
    >
      <IconButton
        color="primary"
        onClick={() => setOpen(true)}
        sx={{ color: '#fff', width: 56, height: 56 }}
        aria-label="PromethIA"
      >
        <ChatIcon fontSize="large" />
      </IconButton>
    </Box>
  );

  const chatWidget = (
    <Slide direction="up" in={open} mountOnEnter unmountOnExit>
      <Paper
        elevation={8}
        sx={{
          position: 'fixed',
          right: 24,
          bottom: 16,
          m: 0,
          width: DIALOG_WIDTH,
          height: minimized ? 64 : DIALOG_HEIGHT,
          borderRadius: 4,
          boxShadow: 6,
          p: 0,
          overflow: 'hidden',
          zIndex: 2100,
          bgcolor: grisClaro,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: azul, color: '#fff', p: 1, height: 48 }}>
          <ChatIcon sx={{ mr: 1 }} />
          <Typography variant="subtitle1" sx={{ flexGrow: 1, fontWeight: 700, letterSpacing: 1 }}>PromethIA</Typography>
          <IconButton size="small" onClick={() => setMinimized(m => !m)} sx={{ color: '#fff' }}>
            {minimized ? <ExpandLessIcon /> : <MinimizeIcon />}
          </IconButton>
          <IconButton size="small" onClick={() => setOpen(false)} sx={{ color: '#fff' }}>
            <CloseIcon />
          </IconButton>
        </Box>
        {!minimized && (
          <Box sx={{ display: 'flex', flexDirection: 'column', height: DIALOG_HEIGHT - 48}}>
            {/* Aviso de beta/demo */}
            <Box sx={{ bgcolor: '#fff3cd', color: '#856404', px: 2, py: 1, borderBottom: '1px solid #ffeeba', fontWeight: 700, fontSize: 14, textAlign: 'center' }}>
              ⚠️ PromethIA está en versión beta/demo. Las respuestas pueden ser inexactas o incompletas.
            </Box>
            <Box sx={{ flex: 1, overflowY: 'auto', px: 2, py: 2, bgcolor: grisClaro, height: '100%' }}>
              {messages.length === 0 && (
                <Box
                  sx={{
                    display: 'inline-block',
                    bgcolor: gris,
                    color: azulOscuro,
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
                  <b>¡Hola! Soy PromethIA</b>, tu asistente inteligente. Podés preguntarme cómo usar el sistema, procesos de negocio, o dudas sobre tu rol.
                </Box>
              )}
              {messages.map((msg, i) => {
                if (msg.role === 'assistant' && msg.response !== undefined) {
                  const { permiso, message, pagina, sugerencias } = msg.response;
                  if (permiso === false) {
                    return (
                      <Box key={i} sx={{ mb: 1, textAlign: 'left', ml: 0, mr: 6 }}>
                        <Box sx={{ display: 'inline-block', bgcolor: gris, color: azulOscuro, px: 2, py: 1, borderRadius: 2, maxWidth: '100%', wordBreak: 'break-word', whiteSpace: 'pre-line', fontSize: 15 }}>
                          No tienes permisos para realizar eso. Contactate con un administrador.
                        </Box>
                      </Box>
                    );
                  }
                  // Buscar la ruta de la página sugerida si existe
                  let paginaObj = null;
                  let paginaNombre = typeof pagina === 'string' ? pagina : '';
                  if (pagina) {
                    // Si la IA devuelve 'pantalla_cargas.md', 'pantalla_contratos.md', etc., mapear al label correcto
                    const match = /^pantalla_(.+)\.md$/i.exec(pagina);
                    if (match) {
                      const label = match[1].charAt(0).toUpperCase() + match[1].slice(1);
                      paginaObj = PAGINAS.find(p => p.label.toLowerCase() === label.toLowerCase());
                      if (paginaObj) paginaNombre = paginaObj.label;
                    } else {
                      paginaObj = PAGINAS.find(p => p.label.toLowerCase() === pagina.toLowerCase());
                      if (paginaObj) paginaNombre = paginaObj.label;
                    }
                  }
                  // No mostrar sugerencia si la página sugerida es igual a la actual
                  let mostrarSugerencia = false;
                  if (paginaObj) {
                    mostrarSugerencia = paginaObj.ruta !== window.location.pathname;
                  } else if (pagina) {
                    mostrarSugerencia = paginaNombre.toLowerCase() !== window.location.pathname.replace(/^\//, '').toLowerCase();
                  }
                  // Si hay sugerencia, mostrar como botón que guarda la intención
                  const handleIntentRedirect = () => {
                    if (paginaObj) {
                      setPendingIntent(message || '');
                      navigate(paginaObj.ruta);
                    }
                  };
                  return (
                    <Box key={i} sx={{ mb: 1, textAlign: 'left', ml: 0, mr: 6 }}>
                      <Box sx={{ display: 'inline-block', bgcolor: gris, color: azulOscuro, px: 2, py: 1, borderRadius: 2, maxWidth: '100%', wordBreak: 'break-word', whiteSpace: 'pre-line', fontSize: 15 }}>
                        {message}
                        {pagina && mostrarSugerencia && paginaObj && (
                          <Box mt={1}>
                            <Button
                              variant="outlined"
                              size="small"
                              sx={{ textTransform: 'none', color: azulOscuro, borderColor: azulOscuro, fontWeight: 700, ml: 0.5 }}
                              onClick={handleIntentRedirect}
                            >
                              Sugerencia: Ir a la página {paginaNombre}
                            </Button>
                          </Box>
                        )}
                        {pagina && mostrarSugerencia && !paginaObj && (
                          <Box mt={1}>
                            <span style={{ textDecoration: 'underline', color: azulOscuro, fontWeight: 700 }}>
                              Sugerencia: Ir a la página {paginaNombre}
                            </span>
                          </Box>
                        )}
                        {sugerencias && sugerencias.length > 0 && (
                          <Box mt={1}>
                            <b>Otras sugerencias:</b>
                            <ul style={{ margin: 0, paddingLeft: 18 }}>
                              {sugerencias.map((s, idx) => <li key={idx}>{s}</li>)}
                            </ul>
                          </Box>
                        )}
                      </Box>
                    </Box>
                  );
                }
                // Mensaje de usuario
                if (msg.role === 'user') {
                  return (
                    <Box key={i} sx={{ mb: 1, textAlign: 'right', ml: 6, mr: 0 }}>
                      <Box sx={{ display: 'inline-block', bgcolor: azul, color: '#fff', px: 2, py: 1, borderRadius: 2, maxWidth: '100%', wordBreak: 'break-word', whiteSpace: 'pre-line', fontSize: 15 }}>
                        {msg.content}
                      </Box>
                    </Box>
                  );
                }
                // Fallback para otros casos
                return null;
              })}
              <div ref={messagesEndRef} />
              {loading && <CircularProgress size={24} sx={{ display: 'block', mx: 'auto', my: 2, color: azul }} />}
            </Box>
            <Box sx={{ display: 'flex', p: 1, borderTop: `1px solid ${azul}`, bgcolor: grisClaro }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Escribí tu pregunta..."
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleSend(); }}
                disabled={loading}
                sx={{ mr: 1, background: '#fff', borderRadius: 1, border: `1px solid ${azul}` }}
                InputProps={{ style: { color: azulOscuro } }}
              />
              <Button variant="contained" onClick={handleSend} disabled={loading || !input.trim()} sx={{ bgcolor: azul, color: '#fff', fontWeight: 700, '&:hover': { bgcolor: azulOscuro } }}>
                Enviar
              </Button>
            </Box>
            <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', mt: 1, mb: 1 }}>
              <Button
                variant="text"
                onClick={() => setMessages([])}
                sx={{
                  fontSize: 12,
                  color: grisOscuro,
                  bgcolor: grisClaro,
                  textDecoration: 'underline',
                  borderRadius: 1,
                  minWidth: 0,
                  px: 1.5,
                  py: 0.5,
                  '&:hover': {
                    bgcolor: grisClaro,
                    color: azulOscuro,
                    textDecoration: 'underline',
                  },
                }}
              >
                Reiniciar conversación
              </Button>
            </Box>
          </Box>
        )}
      </Paper>
    </Slide>
  );

  return (
    <>
      {iconButton}
      {chatWidget}
    </>
  );
};

export default HelpBot; 