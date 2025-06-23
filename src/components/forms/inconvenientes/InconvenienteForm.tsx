/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useContext, useState, useEffect } from "react";
import { Button, TextField, Box, Autocomplete } from "@mui/material";
import useValidation from "../../hooks/useValidation";
import { ContextoGeneral } from "../../Contexto";
import { FormularioProps } from "../../../interfaces/FormularioProps";
import { useAuth } from "../../autenticacion/ContextoAuth";


const InconvenienteForm: React.FC<FormularioProps> = ({
  datos,
  setDatos,
  handleClose,
}) => {
  const { backendURL, authURL, theme } = useContext(ContextoGeneral);
  const { user } = useAuth();

  const [tipoInconveniente, setTipoInconveniente] = useState<string | null>(null);
  const [urgencia, setUrgencia] = useState<string | null>(null);
  const [asignadoA, setAsignadoA] = useState<any>(null);
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [tiposInconvenientes, setTiposInconvenientes] = useState<any[]>([]);
  const [nivelesUrgencia, setNivelesUrgencia] = useState<any[]>([]);

  // Fetch para obtener los usuarios
  console.log(`${authURL}/auth/usuarios`)
  useEffect(() => {
    fetch(`${authURL}/auth/usuarios`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true",
      },
    })
      .then((response) => response.json())
      .then((data) => setUsuarios(data))
      .catch(() => console.error("Error al obtener los usuarios"));
  }, [authURL]);

  // Si en datos ya viene asignadoA (por ejemplo en un PUT), autocompletamos el campo
  useEffect(() => {
    if (usuarios.length && datos.asignadoA) {
      const userFound = usuarios.find((usr) => usr.id === datos.asignadoA);
      if (userFound) {
        setAsignadoA(userFound);
      }
    }
  }, [usuarios, datos.asignadoA]);

  useEffect(() => {
    fetch(`${backendURL}/inconvenientes/tiposinconvenientes`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true",
      },
    })
      .then((response) => response.json())
      .then((data) => setTiposInconvenientes(data))
      .catch((error) => {console.error("Error al obtener los Tipos de Inconvenientes: \n", error);});
  }, [backendURL]);

  useEffect(() => {
    fetch(`${backendURL}/inconvenientes/urgenciainconvenientes`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true",
      },
    })
      .then((response) => response.json())
      .then((data) => setNivelesUrgencia(data))
      .catch((error) => {console.error("Error al obtener los Niveles de Urgencia: \n", error);});
  }, [backendURL]);

  const { data, errors, handleChange, validateAll } = useValidation(
    {
      titulo: "",
      descripcion: "",
      tipoInconveniente: "",
      urgencia: "",
      asignadoA: "",
    },
    {
      titulo: (value) => (!value ? "El título es obligatorio" : null),
      descripcion: (value) => (!value ? "La descripción es obligatoria" : null),
      tipoInconveniente: () =>
        !tipoInconveniente ? "Seleccione un tipo de inconveniente" : null,
      urgencia: () => (!urgencia ? "Seleccione el nivel de urgencia" : null),
      asignadoA: () => (!asignadoA ? "Seleccione a quien asignar el inconveniente" : null),
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
        creadoPor: user?.email,
        asignadoA: asignadoA?.email || null,
      };

      // Aquí podrías diferenciar entre POST y PUT según tus necesidades
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
      <TextField
        margin="dense"
        label="Creado Por"
        variant="outlined"
        fullWidth
        value={user?.email || ""}
        disabled
      />
      <Autocomplete
        options={usuarios}
        value={asignadoA}
        getOptionLabel={(option) => option.email}
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
      <Box display="flex" justifyContent="space-between" mt={2} gap={2}>
        <Button
          onClick={handleClose}
          sx={{
            backgroundColor: "transparent",
            color: theme.colores.azul,
            borderRadius: "8px",
            px: 3,
            py: 1,
            fontWeight: 500,
            textTransform: "none",
            '&:hover': {
              backgroundColor: 'rgba(22, 54, 96, 0.1)',
              color: theme.colores.azul,
            },
          }}
        >
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          sx={{
            backgroundColor: theme.colores.azul,
            color: '#fff',
            borderRadius: '8px',
            px: 3,
            py: 1,
            fontWeight: 500,
            textTransform: 'none',
            '&:hover': {
              backgroundColor: theme.colores.azulOscuro || theme.colores.azul,
              color: '#fff',
            },
          }}
        >
          Guardar
        </Button>
      </Box>
    </Box>
  );
};

export default InconvenienteForm;
