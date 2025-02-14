// hooks/useTaraHandler.ts
import { useContext } from "react";
import { ContextoGeneral } from "../../Contexto";

const useTaraHandler = () => {
  const { backendURL } = useContext(ContextoGeneral);

  const handleTaraSubmission = async (turnoId: string, payload: {
    idTara?: string;
    pesoTara: number;
    pesoBruto: number;
  }) => {
    try {
      let url: string;
      let method: string;
      
      if (payload.idTara) {
        // Actualizar tara existente
        url = `${backendURL}/taras/${payload.idTara}`;
        method = "PUT";
      } else {
        // Crear nueva tara
        url = `${backendURL}/taras`;
        method = "POST";
      }

      // 1. Crear/Actualizar Tara
      const taraResponse = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pesoTara: payload.pesoTara,
          pesoBruto: payload.pesoBruto
        }),
      });

      if (!taraResponse.ok) throw new Error(await taraResponse.text());
      const taraData = await taraResponse.json();

      // 2. Si es nueva tara, vincular al turno
      if (!payload.idTara) {
        const turnoResponse = await fetch(`${backendURL}/turnos/${turnoId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ idTara: taraData.id }),
        });
        if (!turnoResponse.ok) throw new Error(await turnoResponse.text());
      }

      return taraData;
    } catch (error) {
      console.error("Error en el proceso de Tara:", error);
      throw error;
    }
  };

  return { handleTaraSubmission };
};

export default useTaraHandler;