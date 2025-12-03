import React, { useContext, useEffect, useState } from "react";
import { Box } from "@mui/material";
import CrearNuevoTurnoForm from "./CrearNuevoTurnoForm";
import EditarTurnoForm from "./EditarTurnoForm";
import { ContextoGeneral } from "../../Contexto";
import { axiosGet } from "../../../lib/axiosConfig";

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
  const [acopladoExtraRequired, setAcopladoExtraRequired] = useState<boolean>(false);

  useEffect(() => {
    const fetchCarga = async () => {
      try {
        const carga = await axiosGet<any>(`cargas/${props.idCarga}`, backendURL);
        // Lógica para required
        const tipos = carga.tiposAcoplados || [];
        const tieneBitrenLocal = tipos.some((t: any) => t.nombre === "Bitren");
        setTieneBitren(tieneBitrenLocal);
        if (tieneBitrenLocal) {
          if (tipos.length === 1 && tipos[0].nombre === "Bitren") {
            setAcopladoExtraRequired(true);
          } else {
            setAcopladoExtraRequired(false);
          }
        } else {
          setAcopladoExtraRequired(false);
        }
      } catch (e) {
        setTieneBitren(false);
        setAcopladoExtraRequired(false);
      }
    };
    if (props.idCarga) {
      fetchCarga();
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
        <CrearNuevoTurnoForm {...props} tieneBitren={tieneBitren} acopladoExtraRequired={acopladoExtraRequired} estadoTurno={seleccionado?.estado?.nombre} />
      ) : (
        <EditarTurnoForm {...props} tieneBitren={tieneBitren} acopladoExtraRequired={acopladoExtraRequired} estadoTurno={seleccionado?.estado?.nombre} />
      )}
    </Box>
  );
};

export default TurnoForm;
