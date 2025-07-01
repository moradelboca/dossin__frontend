/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useContext, useState, useEffect } from "react";
import {  TextField, Box, Autocomplete } from "@mui/material";
import useValidation from "../../hooks/useValidation";
import { ContextoGeneral } from "../../Contexto";
import { FormularioProps } from "../../../interfaces/FormularioProps";
import { useAuth } from "../../autenticacion/ContextoAuth";
import MainButton from '../../botones/MainButtom';


const InconvenienteForm: React.FC<FormularioProps> = ({
  datos,
  setDatos,
  handleClose,
  seleccionado,
}) => {
  const { backendURL, authURL, theme } = useContext(ContextoGeneral);
  const { user } = useAuth();

  const [tipoInconveniente, setTipoInconveniente] = useState<string | null>(null);
  const [urgencia, setUrgencia] = useState<string | null>(null);
  const [asignadoA, setAsignadoA] = useState<any>(null);
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [tiposInconvenientes, setTiposInconvenientes] = useState<any[]>([]);
  const [nivelesUrgencia, setNivelesUrgencia] = useState<any[]>([]);
  const [descripcion, setDescripcion] = useState<string>("");

  // Estilos para azul en focus
  const azulStyles = {
    '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: theme.colores.azul,
    },
    '& .MuiInputLabel-root.Mui-focused': {
      color: theme.colores.azul,
    },
  };

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

  // Inicializar descripcion y asignadoA desde 'seleccionado' si está presente
  useEffect(() => {
    if (seleccionado && seleccionado.descripcion) {
      setDescripcion(seleccionado.descripcion);
    }
  }, [seleccionado]);

  useEffect(() => {
    if (usuarios.length && seleccionado && seleccionado.asignadoA) {
      // Buscar por id o por email
      let userFound = usuarios.find((usr) => usr.id === seleccionado.asignadoA?.id);
      if (!userFound && seleccionado.asignadoA?.email) {
        userFound = usuarios.find((usr) => usr.email === seleccionado.asignadoA.email);
      }
      if (userFound) {
        setAsignadoA(userFound);
      }
    }
  }, [usuarios, seleccionado]);

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

  const { data, errors, handleChange, validateAll, setData } = useValidation(
    {
      titulo: "",
      descripcion: descripcion,
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

  // Sincronizar el campo descripcion de useValidation cuando cambia descripcion local
  useEffect(() => {
    setData((prev: any) => ({ ...prev, descripcion }));
  }, [descripcion, setData]);

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
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, p: 1 }}>
        <TextField
          margin="dense"
          label="Título"
          name="titulo"
          variant="outlined"
          fullWidth
          value={data.titulo ?? ""}
          onChange={handleChange("titulo")}
          error={!!errors.titulo}
          helperText={errors.titulo}
          sx={azulStyles}
        />
        <TextField
          margin="dense"
          label="Descripción"
          name="descripcion"
          variant="outlined"
          fullWidth
          multiline
          rows={4}
          value={data.descripcion ?? ""}
          onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            const value = e.target.value;
            setDescripcion(value);
            handleChange("descripcion")({
              ...e,
              target: {
                ...e.target,
                value,
                name: "descripcion"
              }
            } as React.ChangeEvent<HTMLInputElement>);
          }}
          error={!!errors.descripcion}
          helperText={errors.descripcion}
          sx={azulStyles}
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
              sx={azulStyles}
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
              sx={azulStyles}
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
          sx={azulStyles}
        />
        <Autocomplete
          options={usuarios}
          value={asignadoA}
          getOptionLabel={(option) => option.email}
          onChange={(_, newValue) => setAsignadoA(newValue)}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Asignado a"
              variant="outlined"
              error={!!errors.asignadoA}
              helperText={errors.asignadoA}
              sx={azulStyles}
            />
          )}
        />
      </Box>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          gap: 2,
          justifyContent: 'flex-end',
          alignItems: 'center',
          mt: 4,
          position: 'relative',
        }}
      >
        <MainButton
          onClick={handleClose}
          text="Cancelar"
          backgroundColor="transparent"
          textColor={theme.colores.azul}
          borderRadius="8px"
          hoverBackgroundColor="rgba(22, 54, 96, 0.1)"
          width="120px"
          divWidth="120px"
        />
        <MainButton
          onClick={handleSubmit}
          text="Guardar"
          backgroundColor={theme.colores.azul}
          textColor="#fff"
          borderRadius="8px"
          hoverBackgroundColor={theme.colores.azulOscuro}
          width="120px"
          divWidth="120px"
        />
      </Box>
    </Box>
  );
};

export default InconvenienteForm;
