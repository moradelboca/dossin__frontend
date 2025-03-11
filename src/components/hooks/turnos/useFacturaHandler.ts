import { useContext } from 'react';
import { ContextoGeneral } from '../../Contexto';

interface FacturaPayload {
  idFactura?: string; // si es update
  // Campos para crear factura
  idsTurnos?: string[];
  nroFactura?: string;
  tipoFactura?: number;
  // Campos comunes
  fecha: string;
  valorIva: number;
  total: number;
}

const useFacturaHandler = () => {
  const { backendURL } = useContext(ContextoGeneral);

  const handleFacturaSubmission = async (cuitEmpresa: string | number, payload: FacturaPayload) => {
    try {
      const isUpdating = Boolean(payload.idFactura);
      const url = isUpdating
        ? `${backendURL}/facturas/${payload.idFactura}`
        : `${backendURL}/facturas/${cuitEmpresa}/crear-factura`;
      const method = isUpdating ? 'PUT' : 'POST';

      console.log("Metodo: \n", method);
      console.log("URL: \n", url);

      const body = isUpdating
        ? {
            fecha: payload.fecha,
            valorIva: payload.valorIva,
            total: payload.total,
          }
        : {
            idsTurnos: payload.idsTurnos,
            nroFactura: payload.nroFactura,
            tipoFactura: payload.tipoFactura,
            fecha: payload.fecha,
            valorIva: payload.valorIva,
            total: payload.total,
          };

      const facturaResponse = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify(body),
      });

      if (!facturaResponse.ok) throw new Error(await facturaResponse.text());
      const facturaData = await facturaResponse.json();
      return facturaData;
    } catch (error) {
      console.error('Error en el proceso de Factura:', error);
      throw error;
    }
  };

  return { handleFacturaSubmission };
};

export default useFacturaHandler;
