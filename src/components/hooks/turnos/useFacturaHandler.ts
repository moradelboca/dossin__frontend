import { useContext } from 'react';
import { ContextoGeneral } from '../../Contexto';
import { axiosPost, axiosPut } from '../../../lib/axiosConfig';

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

      const facturaData = isUpdating
        ? await axiosPut<any>(`facturas/${payload.idFactura}`, body, backendURL)
        : await axiosPost<any>(`facturas/${cuitEmpresa}/crear-factura`, body, backendURL);
      
      return facturaData;
    } catch (error) {
      console.error('Error en el proceso de Factura:', error);
      throw error;
    }
  };

  return { handleFacturaSubmission };
};

export default useFacturaHandler;
