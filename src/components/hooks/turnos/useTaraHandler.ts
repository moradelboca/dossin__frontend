// hooks/useTaraHandler.ts
import { useContext } from "react";
import { ContextoGeneral } from "../../Contexto";
import { axiosPut, axiosDelete } from "../../../lib/axiosConfig";

const useTaraHandler = () => {
  const { backendURL } = useContext(ContextoGeneral);

  const handleTaraSubmission = async (turnoId: string, payload: any) => {
    try {
      // PUT directo al turno con el payload completo
      const updatedTurno = await axiosPut(`turnos/${turnoId}`, payload, backendURL);
      return updatedTurno;
    } catch (error) {
      console.error("Error en el proceso de Tara:", error);
      throw error;
    }
  };

  // Función para eliminar la Tara y actualizar el turno
  const handleTaraDeletion = async (turnoId: string, idTara: string) => {
    try {
      await axiosPut(`turnos/${turnoId}`, { tara: null }, backendURL);
      await axiosDelete(`taras/${idTara}`, backendURL);
      return { deleted: true, idTara };
    } catch (error) {
      console.error("Error al eliminar la Tara:", error);
      throw error;
    }
  };

  return { handleTaraSubmission, handleTaraDeletion };
};

export default useTaraHandler;
