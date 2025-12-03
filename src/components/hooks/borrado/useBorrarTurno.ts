// hooks/useTaraHandler.ts
import { useContext } from "react";
import { ContextoGeneral } from "../../Contexto";
import { axiosPut, axiosDelete, axiosGet } from "../../../lib/axiosConfig";



interface Turno {
  id: number;
  factura?: {
    id: number;
    nroFactura: string;
    // otros atributos si es necesario
  } | null;
  tara?: {
    id: number;
    // otros atributos si es necesario
  } | null;
  // ...otros atributos del turno
}

export const useBorrarTurno = () => {
  /**
   * Elimina la Tara asociada al turno:
   *  - Actualiza el turno para poner su idTara a null.
   *  - Elimina la Tara mediante su endpoint.
   */
  // Puedes obtener el backendURL de variables de entorno o definirlo directamente
  const { backendURL } = useContext(ContextoGeneral);
  const deleteTara = async (turnoId: number, idTara: number) => {
    // Actualizar turno: setear idTara a null
    await axiosPut(`turnos/${turnoId}`, { tara: null }, backendURL);

    // Eliminar la Tara
    await axiosDelete(`taras/${idTara}`, backendURL);

    return true;
  };

  /**
   * Elimina la Factura asociada al turno.
   */
  const deleteFactura = async (facturaId: number) => {
    await axiosDelete(`facturas/${facturaId}`, backendURL);
    return true;
  };

  /**
   * Elimina los adelantos de un tipo (efectivo o gasoil) asociados al turno.
   */
  const deleteAdelantosPorTipo = async (
    tipo: "efectivo" | "gasoil",
    turnoId: number
  ) => {
    const data = await axiosGet<any[]>(`adelantos/${tipo}`, backendURL);
    // Filtrar los adelantos que correspondan al turno
    const adelantos = data.filter((item: any) => item.turnoDeCarga?.id === turnoId);
    for (const adelanto of adelantos) {
      await axiosDelete(`adelantos/${tipo}/${adelanto.id}`, backendURL);
    }
    return true;
  };

  /**
   * Función principal que coordina el borrado del turno y sus entidades relacionadas.
   *
   * @param turno - Objeto turno con todos sus atributos.
   * @param confirmFacturaDeletion - Valor booleano que indica si se confirmó el borrado de la factura (en caso de existir).
   *
   * El proceso es secuencial: se chequea y borra cada entidad (tara, factura, adelantos) y solo al finalizar se elimina el turno.
   */
  const borrarTurno = async (turno: Turno, confirmFacturaDeletion: boolean) => {
    try {
      // 1. Si existe Tara, eliminarla
      if (turno.tara) {
        await deleteTara(turno.id, turno.tara.id);
      }

      // 2. Si existe Factura y se confirmó la eliminación, borrarla
      if (turno.factura && confirmFacturaDeletion) {
        await deleteFactura(turno.factura.id);
      }

      // 3. Eliminar adelantos de efectivo asociados al turno
      await deleteAdelantosPorTipo("efectivo", turno.id);

      // 4. Eliminar adelantos de gasoil asociados al turno
      await deleteAdelantosPorTipo("gasoil", turno.id);

      // 5. Finalmente, eliminar el turno
      await axiosDelete(`turnos/${turno.id}`, backendURL);

      return { deleted: true, turnoId: turno.id };
    } catch (error) {
      console.error("Error al borrar el turno y sus dependencias:", error);
      throw error;
    }
  };

  return { borrarTurno };
};

export default useBorrarTurno;