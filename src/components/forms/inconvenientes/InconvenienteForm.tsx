/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useContext, useState, useEffect } from "react";
import { Button, TextField, Box, Autocomplete } from "@mui/material";
import useValidation from "../../hooks/useValidation";
import { ContextoGeneral } from "../../Contexto";
import { FormularioProps } from "../../../interfaces/FormularioProps";
import { useAuth } from "../../autenticacion/ContextoAuth";

interface Usuario {
  id: number;
  email: string;
  // Puedes agregar otros campos si los devuelven en el GET
}

const InconvenienteForm: React.FC<FormularioProps> = ({
  datos,
  setDatos,
  handleClose,
}) => {
  const { backendURL } = useContext(ContextoGeneral);
  const { user } = useAuth(); // Obtenemos el usuario del contexto

  const [tipoInconveniente, setTipoInconveniente] = useState<string | null>(null);
  const [urgencia, setUrgencia] = useState<string | null>(null);
  // Ahora "asignadoA" almacenará el objeto Usuario seleccionado o null
  const [asignadoA, setAsignadoA] = useState<Usuario | null>(null);
  // Estado para almacenar los usuarios (resultado del GET)
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);

  // Opciones fijas
  const tiposInconvenientes = [
    { id: 1, nombre: "Turno con errores" },
    { id: 2, nombre: "Generado por chofer" },
  ];
  const nivelesUrgencia = [
    { id: 1, nombre: "Leve" },
    { id: 2, nombre: "Media" },
    { id: 3, nombre: "Urgente" },
  ];

  // Fetch para obtener los usuarios
  useEffect(() => {
    fetch(`${backendURL}/auth/usuarios/roles`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true",
      },
    })
      .then((response) => response.json())
      .then((data: Usuario[]) => setUsuarios(data))
      .catch(() => console.error("Error al obtener los usuarios"));
  }, [backendURL]);

  // Si en datos ya viene asignadoA (por ejemplo en un PUT), autocompletamos el campo
  useEffect(() => {
    if (usuarios.length && datos.asignadoA) {
      const userFound = usuarios.find((usr) => usr.id === datos.asignadoA);
      if (userFound) {
        setAsignadoA(userFound);
      }
    }
  }, [usuarios, datos.asignadoA]);

  const { data, errors, handleChange, validateAll } = useValidation(
    {
      titulo: "",
      descripcion: "",
      tipoInconveniente: "",
      urgencia: "",
      // Se mantiene asignadoA en los datos para validación, aunque el valor real será el id
      asignadoA: "",
    },
    {
      titulo: (value) => (!value ? "El título es obligatorio" : null),
      descripcion: (value) => (!value ? "La descripción es obligatoria" : null),
      tipoInconveniente: () =>
        !tipoInconveniente ? "Seleccione un tipo de inconveniente" : null,
      urgencia: () => (!urgencia ? "Seleccione el nivel de urgencia" : null),
      // Puedes agregar validación para asignadoA si lo requieres
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
        creadoPor: user?.email, // Se asigna el email obtenido del token
        // Se envía el id del usuario seleccionado o null si no hay ninguno
        asignadoA: asignadoA?.id || null,
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
      {/* Campo "Creado Por" ya no es editable, se muestra el email del usuario */}
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
        // La propiedad "getOptionLabel" define que se muestre el email del usuario
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
