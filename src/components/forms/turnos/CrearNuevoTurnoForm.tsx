import React, { useContext, useState } from "react";
import { Box, Typography, useMediaQuery, useTheme } from "@mui/material";
import { ContextoGeneral } from "../../Contexto";
import AutocompleteColaboradores from "../autocompletes/AutocompleteColaboradores";
import AutocompleteEmpresas from "../autocompletes/AutocompleteEmpresas";
import AutocompleteCamiones from "../autocompletes/AutocompleteCamiones";
import AutocompleteAcoplados from "../autocompletes/AutocompleteAcoplados";
import useValidation from "../../hooks/useValidation";
import MainButton from "../../botones/MainButtom";
import { axiosPost } from "../../../lib/axiosConfig";

interface CrearNuevoTurnoFormProps {
  setDatos: (datos: any) => void;
  handleClose: () => void;
  idCarga: any;
  fechaCupo?: string;
  tieneBitren?: boolean | null;
  acopladoExtraRequired?: boolean;
  estadoTurno?: string;
}

const CrearNuevoTurnoForm: React.FC<CrearNuevoTurnoFormProps> = ({
  setDatos,
  handleClose,
  idCarga,
  fechaCupo,
  tieneBitren,
  acopladoExtraRequired = false,
  estadoTurno,
}) => {
  const { backendURL, theme } = useContext(ContextoGeneral);

  const tema = useTheme();
  const isMobile = useMediaQuery(tema.breakpoints.down("sm"));

  // Estados locales para los autocompletes.
  const [colaboradorSeleccionado, setColaboradorSeleccionado] = useState<any | null>(null);
  const [empresaTransportistaSeleccionada, setEmpresaTransportistaSeleccionada] = useState<any | null>(null);
  const [patenteCamionSeleccionada, setPatenteCamionSeleccionada] = useState<string | null>(null);
  const [patenteAcopladoSeleccionada, setPatenteAcopladoSeleccionada] = useState<any | null>(null);
  const [patenteAcopladoSeleccionadaExtra, setPatenteAcopladoSeleccionadaExtra] = useState<any | null>(null);

  const initialData = {
    cuilColaborador: null,
    cuitEmpresa: null,
    patenteCamion: "",
    patenteAcoplado: "",
    patenteAcopladoExtra: "",
  };

  const rules = {
    cuilColaborador: () =>
      !colaboradorSeleccionado ? "El colaborador es obligatorio" : null,
    cuitEmpresa: () =>
      !empresaTransportistaSeleccionada ? "La empresa es obligatoria" : null,
    patenteCamion: () =>
      !patenteCamionSeleccionada ? "La patente del camión es obligatoria" : null,
    patenteAcoplado: () =>
      !patenteAcopladoSeleccionada ? "La patente del acoplado es obligatoria" : null,
    patenteAcopladoExtra: () =>
      (!patenteAcopladoSeleccionadaExtra && tieneBitren && acopladoExtraRequired)
        ? "La patente del acoplado Extra es obligatoria"
        : null,
  };

  const {errors, validateAll} = useValidation(initialData, rules);

  const handleSubmit = async () => {
    if (!validateAll()) {
      return;
    }
    
    const payload = {
      cuilColaborador: colaboradorSeleccionado,
      cuitEmpresa: empresaTransportistaSeleccionada,
      patenteCamion: patenteCamionSeleccionada,
      patenteAcoplado: patenteAcopladoSeleccionada,
      patenteAcopladoExtra: patenteAcopladoSeleccionadaExtra,
    };

    try {
      const newData = await axiosPost(`cargas/${idCarga}/cupos/${fechaCupo}`, payload, backendURL);
      setDatos((prevDatos: any[]) => [...prevDatos, newData]);
      handleClose();
    } catch (error: any) {
      console.error(`Error: ${error.message}`);
    }
  };

  return (
    <Box sx={{ bgcolor: "background.paper", borderRadius: 2, p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Crear Turno
      </Typography>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
        {/* PRIMERO: EMPRESA TRANSPORTISTA */}
        <AutocompleteEmpresas
          value={empresaTransportistaSeleccionada}
          onChange={setEmpresaTransportistaSeleccionada}
          error={!!errors.cuitEmpresa}
          helperText={errors.cuitEmpresa}
          labelText="Empresa transportista"
          rolEmpresa="Empresa Transportista"
        />
        {/* SEGUNDO: COLABORADOR, deshabilitado si no hay empresa seleccionada y filtrado por empresa */}
        <AutocompleteColaboradores
          value={colaboradorSeleccionado}
          onChange={setColaboradorSeleccionado}
          error={!!errors.cuilColaborador}
          helperText={(!estadoTurno || estadoTurno === 'Validado')
            ? (empresaTransportistaSeleccionada ? errors.cuilColaborador : "Seleccione primero una empresa transportista")
            : errors.cuilColaborador}
          empresaSeleccionada={(!estadoTurno || estadoTurno === 'Validado') ? empresaTransportistaSeleccionada : undefined}
          disabled={(!estadoTurno || estadoTurno === 'Validado') ? !empresaTransportistaSeleccionada : false}
        />
        <AutocompleteCamiones
          value={patenteCamionSeleccionada}
          onChange={setPatenteCamionSeleccionada}
          error={!!errors.patenteCamion}
          helperText={errors.patenteCamion}
        />
        <AutocompleteAcoplados
          value={patenteAcopladoSeleccionada}
          onChange={setPatenteAcopladoSeleccionada}
          error={!!errors.patenteAcoplado}
          helperText={errors.patenteAcoplado}
        />
        {/* Solo mostrar si tieneBitren es true */}
        {tieneBitren && (
          <AutocompleteAcoplados
            value={patenteAcopladoSeleccionadaExtra}
            onChange={setPatenteAcopladoSeleccionadaExtra}
            tituloOpcional="Patente Acoplado Extra"
            error={!!errors.patenteAcopladoExtra}
            helperText={errors.patenteAcopladoExtra}
          />
        )}
      </Box>

      <Box
        sx={{
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          gap: 1,
          justifyContent: "center",
          alignItems: "center",
          position: 'relative',
          mt: 2
        }}
      >
        <MainButton
          onClick={handleClose}
          text="Cancelar"
          backgroundColor="transparent"
          textColor={theme.colores.azul}
          width={isMobile ? '100%' : 'auto'}
          borderRadius="8px"
          hoverBackgroundColor="rgba(22, 54, 96, 0.1)"
          divWidth={isMobile ? '100%' : 'auto'}
        />
        <MainButton
          onClick={handleSubmit}
          text='Guardar'
          backgroundColor={theme.colores.azul}
          textColor="#fff"
          width={isMobile ? '100%' : 'auto'}
          borderRadius="8px"
          hoverBackgroundColor={theme.colores.azulOscuro}
          divWidth={isMobile ? '100%' : 'auto'}
        />
      </Box>
    </Box>
  );
};

export default CrearNuevoTurnoForm;
