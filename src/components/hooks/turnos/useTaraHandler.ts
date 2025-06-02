// hooks/useTaraHandler.ts
import { useContext } from "react";
import { ContextoGeneral } from "../../Contexto";

const useTaraHandler = () => {
  const { backendURL } = useContext(ContextoGeneral);

  const handleTaraSubmission = async (turnoId: string, payload: any) => {
    try {
      // PUT directo al turno con el payload completo
      const url = `${backendURL}/turnos/${turnoId}`;
      const response = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error(await response.text());
      const updatedTurno = await response.json();
      return updatedTurno;
    } catch (error) {
      console.error("Error en el proceso de Tara:", error);
      throw error;
    }
  };

  // Función para eliminar la Tara y actualizar el turno
  const handleTaraDeletion = async (turnoId: string, idTara: string) => {
    try {
      const turnoResponse = await fetch(`${backendURL}/turnos/${turnoId}`, {
        method: "PUT",
        headers: {
                "Content-Type": "application/json",
                "ngrok-skip-browser-warning": "true",
            },
        body: JSON.stringify({ tara: null }),
      });
      if (!turnoResponse.ok) throw new Error(await turnoResponse.text());
      const taraResponse = await fetch(`${backendURL}/taras/${idTara}`, {
        method: "DELETE",
        headers: {
                "Content-Type": "application/json",
            },
      });

      if (!taraResponse.ok) throw new Error(await taraResponse.text());

      return { deleted: true, idTara };
    } catch (error) {
      console.error("Error al eliminar la Tara:", error);
      throw error;
    }
  };

  return { handleTaraSubmission, handleTaraDeletion };
};

export default useTaraHandler;
