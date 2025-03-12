/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useContext, useEffect, useState } from "react";
import { 
  Button, 
  TextField, 
  Box, 
  Autocomplete, 
  FormControlLabel, 
  Switch 
} from "@mui/material";
import { ContextoGeneral } from "../../Contexto";
import useValidation from "../../hooks/useValidation";

interface UsuariosFormProps {
  seleccionado?: any;
  datos: any[];
  setDatos: (data: any) => void;
  handleClose: () => void;
  refreshUsers: () => void;
}

const UsuariosForm: React.FC<UsuariosFormProps> = ({
  seleccionado,
  datos,
  setDatos,
  handleClose,
  refreshUsers
}) => {
  const { pruebas } = useContext(ContextoGeneral);
  const [roles, setRoles] = useState<any[]>([]);
  const [rolSeleccionado, setRolSeleccionado] = useState<any>(null);
  const [activo, setActivo] = useState(seleccionado?.activo || false);

  const { data, errors, handleChange, validateAll } = useValidation(
    {
      id: seleccionado?.id || null,
      email: seleccionado?.email || "",
      nombre: seleccionado?.nombre || "",
      apellido: seleccionado?.apellido || "",
      nombreDeUsuario: seleccionado?.nombreDeUsuario || "",
      rolId: seleccionado?.rolId || null,
      activo: seleccionado?.activo || true,
    },
    {
      email: (value) => 
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? "Email inválido" : null,
      nombre: (value) => 
        value.length > 50 ? "Máximo 50 caracteres" : null,
      apellido: (value) => 
        value.length > 50 ? "Máximo 50 caracteres" : null,
      nombreDeUsuario: (value) => 
        value.length > 20 ? "Máximo 20 caracteres" : null,
      rolId: () => 
        !rolSeleccionado ? "Seleccione un rol" : null,
    }
  );

  useEffect(() => {
    fetch(`${pruebas}/auth/usuarios/roles`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true",
      },
    })
      .then((response) => response.json())
      .then((data) => setRoles(data))
      .catch(() => console.error("Error al obtener los roles"));
  }, [pruebas]);

  useEffect(() => {
    if (seleccionado && roles.length > 0) {
      const rolInicial = roles.find(r => r.id === seleccionado.rolId);
      setRolSeleccionado(rolInicial);
    }
  }, [seleccionado, roles]);

  const handleSubmit = () => {
    if (validateAll()) {
      const metodo = seleccionado?.id ? "PUT" : "POST";
      const url = seleccionado?.id 
        ? `${pruebas}/auth/usuarios/${data.id}`
        : `${pruebas}/auth/usuarios`;
  
      const payload = {
        ...data,
        rolId: rolSeleccionado?.id,
        activo: activo
      };
  
      fetch(url, {
        method: metodo,
        headers: { "Content-Type": "application/json" },
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
          if (seleccionado?.id) {
            // Actualiza el usuario existente en el array
            setDatos(
              datos.map((usuario) =>
                usuario.id === data.id ? newData : usuario
              )
            );
          } else {
            // Agrega el nuevo usuario al array
            setDatos([...datos, newData]);
          }
          refreshUsers();
          handleClose();
        })
        .catch((error) => console.error(`Error: ${error.message}`));
    }
  };
  
  const handleToggleActivo = () => {
    setActivo(!activo);
  };

  return (
    <>
      <TextField
        margin="dense"
        label="Email"
        name="email"
        variant="outlined"
        fullWidth
        value={data.email}
        onChange={handleChange("email")}
        error={!!errors.email}
        helperText={errors.email}
        disabled={!!seleccionado}
      />

      <TextField
        margin="dense"
        label="Nombre"
        name="nombre"
        variant="outlined"
        fullWidth
        value={data.nombre}
        onChange={handleChange("nombre")}
        error={!!errors.nombre}
        helperText={errors.nombre}
      />

      <TextField
        margin="dense"
        label="Apellido"
        name="apellido"
        variant="outlined"
        fullWidth
        value={data.apellido}
        onChange={handleChange("apellido")}
        error={!!errors.apellido}
        helperText={errors.apellido}
      />

      <TextField
        margin="dense"
        label="Nombre de Usuario"
        name="nombreDeUsuario"
        variant="outlined"
        fullWidth
        value={data.nombreDeUsuario}
        onChange={handleChange("nombreDeUsuario")}
        error={!!errors.nombreDeUsuario}
        helperText={errors.nombreDeUsuario}
      />

      <Autocomplete
        disablePortal
        options={roles}
        getOptionLabel={(option) => option.nombre}
        value={rolSeleccionado}
        onChange={(_e, newValue) => setRolSeleccionado(newValue)}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Rol"
            error={!!errors.rolId}
            helperText={errors.rolId}
          />
        )}
      />

      {seleccionado && (
        <FormControlLabel
          control={
            <Switch
              checked={activo}
              onChange={handleToggleActivo}
              color="primary"
            />
          }
          label={activo ? "Activo" : "Inactivo"}
        />
      )}

      <Box display="flex" justifyContent="space-between" mt={2}>
        <Button onClick={handleClose} color="primary">
          Cancelar
        </Button>
        <Button 
          onClick={handleSubmit} 
          color="primary"
          variant="contained"
        >
          Guardar
        </Button>
      </Box>
    </>
  );
};

export default UsuariosForm;