import React, { useContext, useState } from "react";
import { Box, Button, Typography } from "@mui/material";
import { ContextoGeneral } from "../../Contexto";
import AutocompleteColaboradores from "../autocompletes/AutocompleteColaboradores";
import AutocompleteEmpresas from "../autocompletes/AutocompleteEmpresas";
import AutocompleteCamiones from "../autocompletes/AutocompleteCamiones";
import AutocompleteAcoplados from "../autocompletes/AutocompleteAcoplados";
import useValidation from "../../hooks/useValidation";

interface CrearNuevoTurnoFormProps {
  setDatos: (datos: any) => void;
  handleClose: () => void;
  idCarga: any;
  fechaCupo?: string;
  tieneBitren?: boolean | null;
}

const CrearNuevoTurnoForm: React.FC<CrearNuevoTurnoFormProps> = ({
  setDatos,
  handleClose,
  idCarga,
  fechaCupo,
  tieneBitren,  // Recibimos el prop
}) => {
  const { backendURL } = useContext(ContextoGeneral);

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
      (!patenteAcopladoSeleccionadaExtra && tieneBitren) ? "La patente del acoplado Extra es obligatoria" : null,
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
      const response = await fetch(`${backendURL}/cargas/${idCarga}/cupos/${fechaCupo}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(`Error del servidor: ${errorMessage}`);
      }

      const newData = await response.json();
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
        <AutocompleteColaboradores
          value={colaboradorSeleccionado}
          onChange={setColaboradorSeleccionado}
          error={!!errors.cuilColaborador}
          helperText={errors.cuilColaborador}
        />
        <AutocompleteEmpresas
          value={empresaTransportistaSeleccionada}
          onChange={setEmpresaTransportistaSeleccionada}
          error={!!errors.cuitEmpresa}
          helperText={errors.cuitEmpresa}
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

      <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1, mt: 2 }}>
        <Button color="secondary" onClick={handleClose}>
          Cancelar
        </Button>
        <Button color="primary" onClick={handleSubmit}>
          Guardar
        </Button>
      </Box>
    </Box>
  );
};

export default CrearNuevoTurnoForm;
