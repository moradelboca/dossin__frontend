import React, { useState, useContext } from "react";
import { Box, Button, Stack } from "@mui/material";
import { ContextoGeneral } from "../../../Contexto";
import AutocompleteColaboradores from "../../autocompletes/AutocompleteColaboradores";
import AutocompleteEmpresas from "../../autocompletes/AutocompleteEmpresas";
import AutocompleteCamiones from "../../autocompletes/AutocompleteCamiones";
import AutocompleteAcoplados from "../../autocompletes/AutocompleteAcoplados";
import useValidationStepper from "../../../hooks/useValidationStepper";

interface DatosPrincipalesFormProps {
  seleccionado?: any;
  datos: any;
  setDatos: any;
  handleClose: () => void;
  tieneBitren?: boolean | null;
}

const DatosPrincipalesForm: React.FC<DatosPrincipalesFormProps> = ({
  seleccionado,
  datos,
  setDatos,
  handleClose,
  tieneBitren,
}) => {
  const { backendURL } = useContext(ContextoGeneral);

  // Estados locales para cada uno de los campos
  const [colaboradorSeleccionado, setColaboradorSeleccionado] = useState<any | null>(
    seleccionado?.colaborador?.cuil || null
  );
  const [empresaTransportistaSeleccionada, setEmpresaTransportistaSeleccionada] = useState<any | null>(
    seleccionado?.empresa?.cuit || null
  );
  const [patenteCamionSeleccionada, setPatenteCamionSeleccionada] = useState<string | null>(
    seleccionado?.camion?.patente || null
  );
  const [patenteAcopladoSeleccionada, setPatenteAcopladoSeleccionada] = useState<any | null>(
    seleccionado?.acoplado?.patente || null
  );
  const [patenteAcopladoSeleccionadaExtra, setPatenteAcopladoSeleccionadaExtra] = useState<any | null>(
    seleccionado?.acopladoExtra?.patente || null
  );

  // Definición de reglas de validación para cada campo
  const rules = {
    cuilColaborador: () =>
      !colaboradorSeleccionado ? "El colaborador es obligatorio" : null,
    cuitEmpresa: () =>
      !empresaTransportistaSeleccionada ? "La empresa es obligatoria" : null,
    patenteCamion: () =>
      !patenteCamionSeleccionada ? "La patente del camión es obligatoria" : null,
    patenteAcoplado: () =>
      !patenteAcopladoSeleccionada ? "La patente del acoplado es obligatoria" : null,
  };

  // Se usa el hook useValidationStepper para validar los campos de esta sección
  const { errors, validateStep } = useValidationStepper(
    {
      cuilColaborador: null,
      cuitEmpresa: null,
      patenteCamion: "",
      patenteAcoplado: "",
      patenteAcopladoExtra: "",
    },
    rules,
    { 0: ["cuilColaborador", "cuitEmpresa", "patenteCamion", "patenteAcoplado"] }
  );

  // Función para realizar el PUT con los datos de la sección
  const handleSubmit = async () => {
    if (!validateStep(0)) {
      console.log("Errores en la validación", errors);
      return;
    }

    try {
      const payload = {
        cuilColaborador: colaboradorSeleccionado,
        cuitEmpresa: empresaTransportistaSeleccionada,
        patenteCamion: patenteCamionSeleccionada,
        patenteAcoplado: patenteAcopladoSeleccionada || null,
        patenteAcopladoExtra: patenteAcopladoSeleccionadaExtra || null,
      };

      const url = `${backendURL}/turnos/${seleccionado.id}`;
      const response = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error(await response.text());
      const updatedData = await response.json();

      // Actualiza el estado de "datos" y cierra el modal
      setDatos(
        datos.map((turno: { id: any }) =>
          turno.id === seleccionado.id ? updatedData : turno
        )
      );
      handleClose();
    } catch (error: any) {
      console.error(`Error: ${error.message}`);
    }
  };

  return (
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
      {tieneBitren && (
        <AutocompleteAcoplados
          value={patenteAcopladoSeleccionadaExtra}
          onChange={setPatenteAcopladoSeleccionadaExtra}
          tituloOpcional="Patente Acoplado Extra"
        />
      )}
      <Stack
        direction="row"
        spacing={2}
        justifyContent="flex-end"
        sx={{ marginTop: 2 }}
      >
        <Button color="secondary" onClick={handleClose}>
          Cancelar
        </Button>
        <Button color="primary" onClick={handleSubmit}>
          Guardar Datos Principales
        </Button>
      </Stack>
    </Box>
  );
};

export default DatosPrincipalesForm;
