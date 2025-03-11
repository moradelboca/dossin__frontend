/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useContext, useState } from "react";
import { Button, TextField, Box, Autocomplete } from "@mui/material";
import useValidation from "../../hooks/useValidation";
import { ContextoGeneral } from "../../Contexto";
import { FormularioProps } from "../../../interfaces/FormularioProps";

const InconvenienteForm: React.FC<FormularioProps> = ({
  datos,
  setDatos,
  handleClose,
}) => {
  const { backendURL } = useContext(ContextoGeneral);

  const [tipoInconveniente, setTipoInconveniente] = useState<string | null>(null);
  const [urgencia, setUrgencia] = useState<string | null>(null);
  const [creadoPor, setCreadoPor] = useState<string | null>(null);
  const [asignadoA, setAsignadoA] = useState<string | null>(null);

  const tiposInconvenientes = [
    { id: 1, nombre: "Turno con errores" },
    { id: 2, nombre: "Generado por chofer" },
  ];
  const nivelesUrgencia = [
    { id: 1, nombre: "Leve" },
    { id: 2, nombre: "Media" },
    { id: 3, nombre: "Urgente" },
  ];

  const emails = ["zullolau@gmail.com", "maxirivadero2000@gmail.com"];

  const { data, errors, handleChange, validateAll } = useValidation(
    {
      titulo: "",
      descripcion: "",
      tipoInconveniente: "",
      urgencia: "",
      creadoPor: "",
      asignadoA: "",
    },
    {
      titulo: (value) => (!value ? "El título es obligatorio" : null),
      descripcion: (value) => (!value ? "La descripción es obligatoria" : null),
      tipoInconveniente: () => (!tipoInconveniente ? "Seleccione un tipo de inconveniente" : null),
      urgencia: () => (!urgencia ? "Seleccione el nivel de urgencia" : null),
      creadoPor: () => (!creadoPor ? "Seleccione quién lo creó" : null),
    }
  );

  const handleSubmit = () => {
    if (validateAll()) {
      const payload = {
        titulo: data.titulo,
        descripcion: data.descripcion,
        urgencia: nivelesUrgencia.find((nivel) => nivel.nombre === urgencia)?.id,
        tipoInconveniente: tiposInconvenientes.find(
          (tipo) => tipo.nombre === tipoInconveniente
        )?.id,
        creadoPor,
        asignadoA,
      };

      fetch(`${backendURL}/inconvenientes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify(payload),
      })
        .then(async (response) => {
          if (!response.ok) {
            const errorMessage = await response.text();
            throw new Error(`Error del servidor: ${errorMessage}`);
          }
          return response.json();
        })
        .then((newData) => {
          setDatos([...datos, newData]);
          handleClose();
        })
        .catch((error) => console.error(`Error: ${error.message}`));
    }
  };

  return (
    <Box>
      <TextField
        margin="dense"
        label="Título"
        name="titulo"
        variant="outlined"
        fullWidth
        value={data.titulo}
        onChange={handleChange("titulo")}
        error={!!errors.titulo}
        helperText={errors.titulo}
      />
      <TextField
        margin="dense"
        label="Descripción"
        name="descripcion"
        variant="outlined"
        fullWidth
        multiline
        rows={4}
        value={data.descripcion}
        onChange={handleChange("descripcion")}
        error={!!errors.descripcion}
        helperText={errors.descripcion}
      />
      <Autocomplete
        options={tiposInconvenientes.map((tipo) => tipo.nombre)}
        value={tipoInconveniente}
        onChange={(_, newValue) => setTipoInconveniente(newValue)}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Tipo de Inconveniente"
            variant="outlined"
            error={!!errors.tipoInconveniente}
            helperText={errors.tipoInconveniente}
          />
        )}
      />
      <Autocomplete
        options={nivelesUrgencia.map((nivel) => nivel.nombre)}
        value={urgencia}
        onChange={(_, newValue) => setUrgencia(newValue)}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Urgencia"
            variant="outlined"
            error={!!errors.urgencia}
            helperText={errors.urgencia}
          />
        )}
      />
      <Autocomplete
        options={emails}
        value={creadoPor}
        onChange={(_, newValue) => setCreadoPor(newValue)}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Creado Por"
            variant="outlined"
            error={!!errors.creadoPor}
            helperText={errors.creadoPor}
          />
        )}
      />
      <Autocomplete
        options={emails}
        value={asignadoA}
        onChange={(_, newValue) => setAsignadoA(newValue)}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Asignado A"
            variant="outlined"
            error={!!errors.asignadoA}
            helperText={errors.asignadoA}
          />
        )}
      />
      <Box display="flex" justifyContent="space-between" mt={2}>
        <Button onClick={handleClose} color="primary">
          Cancelar
        </Button>
        <Button onClick={handleSubmit} color="primary">
          Guardar
        </Button>
      </Box>
    </Box>
  );
};

export default InconvenienteForm;
