import React from "react";
import { Box } from "@mui/material";
import CrearNuevoTurnoForm from "./CrearNuevoTurnoForm";
import EditarTurnoForm from "./EditarTurnoForm";

export interface TurnoFormProps {
  seleccionado?: any; // Puedes tiparlo más estrictamente si lo deseas
  datos: any;
  setDatos: any;
  handleClose: () => void;
  idCarga: any;
  fechaCupo?: string;
}

const TurnoForm: React.FC<TurnoFormProps> = (props) => {
  const { seleccionado } = props;

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
        <CrearNuevoTurnoForm {...props} />
      ) : (
        <EditarTurnoForm {...props} />
      )}
    </Box>
  );
};

export default TurnoForm;
