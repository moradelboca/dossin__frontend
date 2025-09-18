import { useContext } from "react";
import { ContextoGeneral } from "../../Contexto";

const useCartaPorteHandler = () => {
  const { backendURL } = useContext(ContextoGeneral);

  const headers = {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
  };

  // Función para crear o actualizar la Carta de Porte
  const handleCartaPorteSubmission = async (
    turnoId: string,
    payload: { numeroCartaPorte: number; CTG: number; cuitTitular?: string },
    isUpdate: boolean
  ) => {
    const method = isUpdate ? "PUT" : "POST";
    const url = isUpdate
      ? `${backendURL}/cartasdeporte/${payload.numeroCartaPorte}`
      : `${backendURL}/cartasdeporte`;

    const cartaResponse = await fetch(url, {
      method,
      headers,
      body: JSON.stringify({
        numeroCartaPorte: payload.numeroCartaPorte,
        CTG: payload.CTG,
        cuitTitular: payload.cuitTitular,
        idTurno: turnoId,
      }),
    });
    if (!cartaResponse.ok) {
      throw new Error(await cartaResponse.text());
    }
    const data = await cartaResponse.json();

    // Actualizar el turno con idCartaDePorte y estado 8 (En Viaje)
    const turnoResponse = await fetch(`${backendURL}/turnos/${turnoId}`, {
      method: "PUT",
      headers,
      body: JSON.stringify({
        idCartaDePorte: data.id,
        idEstado: 8,
      }),
    });
    if (!turnoResponse.ok) {
      throw new Error(await turnoResponse.text());
    }
    return data;
  };

  // Función para eliminar la Carta de Porte
  const handleCartaPorteDeletion = async (numeroCartaPorte: number) => {
    if (!numeroCartaPorte) return;
    try {
      const response = await fetch(
        `${backendURL}/cartasdeporte/${numeroCartaPorte}`,
        { method: "DELETE", headers }
      );
      if (!response.ok) {
        throw new Error(await response.text());
      }
      return { deleted: true, numeroCartaPorte };
    } catch (error) {
      console.error("Error al eliminar la Carta de Porte:", error);
      throw error;
    }
  };

  return { handleCartaPorteSubmission, handleCartaPorteDeletion };
};

export default useCartaPorteHandler;