import { useContext } from "react";
import { ContextoGeneral } from "../../Contexto";

const useCartaPorteHandler = () => {
  const { backendURL } = useContext(ContextoGeneral);

  const headers = {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
  };

  // Función para crear o actualizar múltiples Cartas de Porte
  const handleMultipleCartaPorteSubmission = async (
    turnoId: string,
    cartasPorte: Array<{ numeroCartaPorte: number; CTG: number; cuitTitular?: string }>,
    isUpdate: boolean
  ) => {
    const results = [];
    
    for (let i = 0; i < cartasPorte.length; i++) {
      const carta = cartasPorte[i];
      const method = isUpdate && i === 0 ? "PUT" : "POST";
      const url = isUpdate && i === 0
        ? `${backendURL}/cartasdeporte/${carta.numeroCartaPorte}`
        : `${backendURL}/cartasdeporte`;

      const cartaResponse = await fetch(url, {
        method,
        headers,
        body: JSON.stringify({
          numeroCartaPorte: carta.numeroCartaPorte,
          CTG: carta.CTG,
          cuitTitular: carta.cuitTitular,
          idTurno: turnoId,
        }),
      });
      
      if (!cartaResponse.ok) {
        throw new Error(await cartaResponse.text());
      }
      
      const data = await cartaResponse.json();
      results.push(data);
    }

    // Actualizar el turno con la primera carta de porte y estado 8 (En Viaje)
    if (results.length > 0) {
      const turnoResponse = await fetch(`${backendURL}/turnos/${turnoId}`, {
        method: "PUT",
        headers,
        body: JSON.stringify({
          idCartaDePorte: results[0].id,
          idEstado: 8,
        }),
      });
      
      if (!turnoResponse.ok) {
        throw new Error(await turnoResponse.text());
      }
    }
    
    return results;
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

  // Función original para compatibilidad (mantener para no romper código existente)
  const handleCartaPorteSubmission = async (
    turnoId: string,
    payload: { numeroCartaPorte: number; CTG: number; cuitTitular?: string },
    isUpdate: boolean
  ) => {
    return handleMultipleCartaPorteSubmission(turnoId, [payload], isUpdate).then(results => results[0]);
  };

  return { 
    handleCartaPorteSubmission, 
    handleMultipleCartaPorteSubmission,
    handleCartaPorteDeletion 
  };
};

export default useCartaPorteHandler;