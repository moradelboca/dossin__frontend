import { useEffect, useRef, useContext } from "react";
import { ContextoGeneral } from "./Contexto";
import { io, Socket } from "socket.io-client";
import { useNotificacion } from "./Notificaciones/NotificacionSnackbar";
import { useAuth } from "./autenticacion/ContextoAuth";

const WebSocketComponent = () => {
  const socketRef = useRef<Socket | null>(null);
  const { backendURL } = useContext(ContextoGeneral);
  const { showNotificacion } = useNotificacion();
  const { user } = useAuth();

  useEffect(() => {
    // Si ya hay un socket y un usuario, no hagas nada.
    if (socketRef.current && user) {
      return;
    }

    // Si no hay usuario, desconecta y limpia.
    if (!user) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      return;
    }

    // Si hay un usuario pero no un socket, conecta.
    socketRef.current = io(backendURL.slice(0, -4), {
      path: "/socket",
      transports: ["websocket"],
    });

    socketRef.current.on("connect", () => {
      console.log("Conectado a socket.io con ID:", socketRef.current?.id);
    });

    socketRef.current.on("nueva-alerta", ({ payload }) => {
      if (payload?.asignadoA && user?.email && payload.asignadoA === user.email) {
        showNotificacion("Hay un nuevo inconveniente, por favor revisa la ventana de Inconvenietes", "warning");
      }
    });

    socketRef.current.on("disconnect", () => {
      console.log("Socket desconectado");
      showNotificacion(
        "Se perdió la conexión con el servidor. Muchos datos no se actualizarán hasta que se recupere la conexión.",
        "warning"
      );
    });

    // La función de limpieza solo se ejecutará al desmontar,
    // o si el usuario se vuelve nulo.
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [user]);

  return null;
};

export default WebSocketComponent;
