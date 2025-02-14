import { useContext } from "react";
import { ContextoGeneral } from "../../Contexto";

const useCartaPorteHandler = () => {
  const { backendURL } = useContext(ContextoGeneral);

  const headers = {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
  };

  // Se añade el parámetro isUpdate para decidir el método.
  const handleCartaPorteSubmission = async (
    turnoId: string,
    payload: { numeroCartaPorte: number; CTG: number },
    isUpdate: boolean
  ) => {
    const method = isUpdate ? "PUT" : "POST";
    const url = isUpdate
      ? `${backendURL}/cartasdeporte/${payload.numeroCartaPorte}`
      : `${backendURL}/cartasdeporte`;

    // Realizar la operación en la carta de porte
    const cartaResponse = await fetch(url, {
      method,
      headers,
      body: JSON.stringify({
        numeroCartaPorte: payload.numeroCartaPorte,
        CTG: payload.CTG,
      }),
    });
    if (!cartaResponse.ok) {
      throw new Error(await cartaResponse.text());
    }
    const data = await cartaResponse.json();

    // Actualizar el turno (se asocia el número de carta guardado)
    const turnoResponse = await fetch(`${backendURL}/turnos/${turnoId}`, {
      method: "PUT",
      headers,
      body: JSON.stringify({ numeroCartaDePorte: data.numeroCartaPorte }),
    });
    if (!turnoResponse.ok) {
      throw new Error(await turnoResponse.text());
    }
    return data;
  };

  return { handleCartaPorteSubmission };
};

export default useCartaPorteHandler;
