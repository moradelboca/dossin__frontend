import { useContext } from "react";
import { ContextoGeneral } from "../../Contexto";
import { axiosPost, axiosPut, axiosDelete } from "../../../lib/axiosConfig";

const useCartaPorteHandler = () => {
  const { backendURL } = useContext(ContextoGeneral);

  // Función para crear o actualizar múltiples Cartas de Porte
  const handleMultipleCartaPorteSubmission = async (
    turnoId: string,
    cartasPorte: Array<{ numeroCartaPorte: number; CTG: number; cuitTitular?: string }>,
    isUpdate: boolean,
    emitirCPE: boolean = true
  ) => {
    const results = [];
    
    for (let i = 0; i < cartasPorte.length; i++) {
      const carta = cartasPorte[i];
      const isUpdating = isUpdate && i === 0;

      const cuitNum =
        carta.cuitTitular != null && String(carta.cuitTitular).trim() !== ""
          ? Number(String(carta.cuitTitular).replace(/\D/g, ""))
          : undefined;
      const payload = {
        numeroCartaPorte: carta.numeroCartaPorte,
        CTG: carta.CTG,
        ...(cuitNum != null && !isNaN(cuitNum) && { cuitTitular: cuitNum }),
        idTurno: turnoId,
      };
      
      const data = isUpdating
        ? await axiosPut<any>(`cartasdeporte/${carta.numeroCartaPorte}`, payload, backendURL)
        : await axiosPost<any>("cartasdeporte", payload, backendURL);
      
      results.push(data);
    }

    // Actualizar el turno con la primera carta de porte y estado 8 (En Viaje)
    if (results.length > 0 && emitirCPE) {
      await axiosPut(
        `turnos/${turnoId}`,
        {
          idCartaDePorte: results[0].id,
          idEstado: 8,
        },
        backendURL
      );
    }
    
    return results;
  };

  // Función para eliminar la Carta de Porte
  const handleCartaPorteDeletion = async (numeroCartaPorte: number) => {
    if (!numeroCartaPorte) return;
    try {
      await axiosDelete(`cartasdeporte/${numeroCartaPorte}`, backendURL);
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
    isUpdate: boolean,
    emitirCPE: boolean = true
  ) => {
    return handleMultipleCartaPorteSubmission(
      turnoId,
      [payload],
      isUpdate,
      emitirCPE
    ).then((results) => results[0]);
  };

  return { 
    handleCartaPorteSubmission, 
    handleMultipleCartaPorteSubmission,
    handleCartaPorteDeletion 
  };
};

export default useCartaPorteHandler;