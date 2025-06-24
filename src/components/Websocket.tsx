import { useEffect, useRef, useContext } from "react";
import { ContextoGeneral } from "./Contexto";
import { io, Socket } from "socket.io-client";
import { useNotificacion } from "./Notificaciones/NotificacionSnackbar";

const WebSocketComponent = () => {
  const socketRef = useRef<Socket | null>(null);
  const { backendURL } = useContext(ContextoGeneral);
  const { showNotificacion } = useNotificacion();
  
  useEffect(() => {
    // Sacamos el /api del final
    socketRef.current = io(backendURL.slice(0, -4), {
      path: "/socket",
      transports: ["websocket"],
    });

    socketRef.current.on("connect", () => {
      console.log("Conectado a socket.io con ID:", socketRef.current?.id);
    });

    socketRef.current.on("nueva-alerta", () => {
      showNotificacion("Hay un nuevo inconveniente, por favor revisa la ventana de Inconvenietes", "warning");
    });

    socketRef.current.on("disconnect", () => {
      console.log("Socket desconectado");
      showNotificacion(
        "Se perdió la conexión con el servidor. Muchos datos no se actualizarán hasta que se recupere la conexión.",
        "error"
      );
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  return null;
};

export default WebSocketComponent;
