import { Dialog, DialogContent, DialogTitle } from "@mui/material";
import { useContext, useEffect, useState } from "react";
import CrearCargaStepper from "../cargas/creadores/CrearCargaStepper";
import { ContextoGeneral } from "../Contexto";
import { axiosPost, axiosPut } from "../../lib/axiosConfig";

interface DialogCargaProps {
  open: boolean;
  onClose: () => void;
  contrato: any;
  selectedCarga: any;
  refreshContratos: () => void;
}
  

export const DialogCarga = ({ open, onClose, contrato, selectedCarga, refreshContratos }: DialogCargaProps) => {
    const { backendURL } = useContext(ContextoGeneral);
    const [selectedContrato, setSelectedContrato] = useState(contrato);
  
    useEffect(() => {
      setSelectedContrato(contrato);
    }, [contrato]);
  
    const handleCargaCreated = async (nuevaCarga: any) => {
        try {
          // 1. Crear la carga
          const cargaCreada = await axiosPost('cargas', nuevaCarga.payload, backendURL);
      
          // 2. Obtener IDs existentes de las cargas del estado actual
          const idsExistentes = selectedContrato.cargas?.map((c: any) => c.id) || [];
          
          // 3. Preparar payload con TODOS los IDs
          const payloadContrato = {
            idsCargas: [
              ...(selectedContrato.idsCargas || []), // IDs directos del contrato
              ...idsExistentes, // IDs de cargas relacionadas
              cargaCreada.id
            ]
          };
          
          // 4. Actualizar contrato
          await axiosPut(`contratos/${selectedContrato.id}`, payloadContrato, backendURL);
          
          // 5. Actualizar estado global
          refreshContratos();
          onClose();
        } catch (error) {
          console.error("Error en el proceso:", error);
        }
      };
  
    return (
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
        <DialogTitle>
          {selectedCarga ? "Editar Carga" : "Crear Nueva Carga"}
        </DialogTitle>
        <DialogContent sx={{ height: "80vh" }}>
          <CrearCargaStepper
            datosCarga={selectedCarga || {}}
            creando={!selectedCarga}
            handleCloseDialog={onClose}
            onCargaCreated={handleCargaCreated}
            onCargaUpdated={async (cargaActualizada) => {
              if (selectedCarga?.id) {
                try {
                  await axiosPut(`cargas/${selectedCarga.id}`, cargaActualizada.payload, backendURL);
                  refreshContratos();
                  onClose();
                } catch (error) {
                  console.error("Error actualizando carga:", error);
                }
              }
            }}
          />
        </DialogContent>
      </Dialog>
    );
  };