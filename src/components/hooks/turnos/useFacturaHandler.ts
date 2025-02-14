import { useContext } from 'react';
import { ContextoGeneral } from '../../Contexto';

interface FacturaPayload {
  idFactura?: string;
  tipoFactura: number;
  fecha: string;
  valorIva: number;
  total: number;
}

const useFacturaHandler = () => {
  const { backendURL } = useContext(ContextoGeneral);

  const handleFacturaSubmission = async (turnoId: string, payload: FacturaPayload) => {
    try {
      const isUpdating = Boolean(payload.idFactura);
      const url = isUpdating
        ? `${backendURL}/facturas/${payload.idFactura}`
        : `${backendURL}/facturas`;
      const method = isUpdating ? 'PUT' : 'POST';

      // 1. Crear/Actualizar Factura
      const facturaResponse = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipoFactura: payload.tipoFactura,
          fecha: payload.fecha,
          valorIva: payload.valorIva,
          total: payload.total,
        }),
      });

      if (!facturaResponse.ok) throw new Error(await facturaResponse.text());
      const facturaData = await facturaResponse.json();

      // 2. Si es una nueva factura, vincularla al turno
      if (!isUpdating) {
        const turnoResponse = await fetch(`${backendURL}/turnos/${turnoId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idFactura: facturaData.id }),
        });
        if (!turnoResponse.ok) throw new Error(await turnoResponse.text());
      }

      return facturaData;
    } catch (error) {
      console.error('Error en el proceso de Factura:', error);
      throw error;
    }
  };

  return { handleFacturaSubmission };
};

export default useFacturaHandler;
