import { Dialog, DialogContent, DialogTitle } from "@mui/material";
import { useContext, useEffect, useState } from "react";
import CrearCargaStepper from "../cargas/creadores/CrearCargaStepper";
import { ContextoGeneral } from "../Contexto";

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
          const resCarga = await fetch(`${backendURL}/cargas`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "ngrok-skip-browser-warning": "true",
            },
            body: JSON.stringify(nuevaCarga.payload),
          });
          
          if (!resCarga.ok) throw new Error("Error creando carga");
          const cargaCreada = await resCarga.json();
      
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
          
          console.log("Payload actualizado:", JSON.stringify(payloadContrato));
          
          // 4. Actualizar contrato
          const resContrato = await fetch(`${backendURL}/contratos/${selectedContrato.id}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              "ngrok-skip-browser-warning": "true",
            },
            body: JSON.stringify(payloadContrato),
          });
          
          if (!resContrato.ok) throw new Error("Error actualizando contrato");
          
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
                  await fetch(`${backendURL}/cargas/${selectedCarga.id}`, {
                    method: "PUT",
                    headers: {
                      "Content-Type": "application/json",
                      "ngrok-skip-browser-warning": "true",
                    },
                    body: JSON.stringify(cargaActualizada.payload),
                  });
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