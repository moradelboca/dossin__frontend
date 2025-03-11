import React, { useContext, useEffect, useState } from "react";
import { Box } from "@mui/material";
import CrearNuevoTurnoForm from "./CrearNuevoTurnoForm";
import EditarTurnoForm from "./EditarTurnoForm";
import { ContextoGeneral } from "../../Contexto";

export interface TurnoFormProps {
  seleccionado?: any;
  datos: any;
  setDatos: any;
  handleClose: () => void;
  idCarga: any;
  fechaCupo?: string;
}

const TurnoForm: React.FC<TurnoFormProps> = (props) => {
  const { backendURL } = useContext(ContextoGeneral);
  const { seleccionado } = props;
  const [tieneBitren, setTieneBitren] = useState<boolean | null>(null);

  useEffect(() => {
    // Hacer el fetch al endpoint
    const fetchRequiereBitren = async () => {
      try {
        const response = await fetch(`${backendURL}/cargas/${props.idCarga}/requiere-bitren`, {
          method: "GET", // Utilizamos GET
          headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data) && data.length === 0) {
            setTieneBitren(false);
          } else {
            setTieneBitren(true);
          }
        } else {
          throw new Error("No se pudo obtener el estado de requiere-bitren");
        }
      } catch (error) {
        console.error("Error fetching requiere-bitren:", error);
        setTieneBitren(false);  // Asegúrate de poner un valor booleano en caso de error
      }
    };

    if (props.idCarga) {
      fetchRequiereBitren();
    }
  }, [backendURL, props.idCarga]);
  
  return (
    <Box
      sx={{
        bgcolor: "background.paper",
        p: 1,
        width: "100%",
        mx: "auto",
      }}
    >
      {(!seleccionado || !seleccionado.id) ? (
        <CrearNuevoTurnoForm {...props} tieneBitren={tieneBitren} />
      ) : (
        <EditarTurnoForm {...props} tieneBitren={tieneBitren} />
      )}
    </Box>
  );
};

export default TurnoForm;
