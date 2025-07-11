/* eslint-disable @typescript-eslint/no-explicit-any */ 
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import {
  Autocomplete,
  Box,
  Dialog,
  FormControlLabel,
  IconButton,
  Switch,
  TextField
} from "@mui/material";
import React, { useContext, useEffect, useState } from "react";
import { ContextoGeneral } from "../../Contexto";
import DeleteEntidad from "../../dialogs/DeleteEntidad";
import useValidation from "../../hooks/useValidation";
import MainButton from '../../botones/MainButtom';

interface UsuariosFormProps {
  seleccionado?: any;
  datos: any[];
  setDatos: (data: any) => void;
  handleClose: () => void;
}

const UsuariosForm: React.FC<UsuariosFormProps> = ({
  seleccionado,
  datos,
  setDatos,
  handleClose,
}) => {
  const { authURL, theme } = useContext(ContextoGeneral);
  const [roles, setRoles] = useState<any[]>([]);
  const [rolSeleccionado, setRolSeleccionado] = useState<any>(null);
  const [openDialogDelete, setOpenDialogDelete] = useState(false);

  const [activo, setActivo] = useState(() => {
    if (seleccionado?.activo !== undefined && seleccionado?.activo !== null) {
      if (typeof seleccionado.activo === 'boolean') return seleccionado.activo;
      if (typeof seleccionado.activo === 'string') {
        return seleccionado.activo.toLowerCase() === 'activo';
      }
    }
    return true;
  });

  const { data, errors, handleChange, validateAll } = useValidation(
    {
      id: seleccionado?.id || null,
      email: seleccionado?.email || "",
      rolId: seleccionado?.rol?.id || seleccionado?.rolId || null,
      activo: activo
    },
    {
      email: (value) => 
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? "Email inválido" : null,
      rolId: () => !rolSeleccionado ? "Seleccione un rol" : null,
    }
  );

  useEffect(() => {
    fetch(`${authURL}/auth/usuarios/roles`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true",
      },
    })
      .then((response) => response.json())
      .then((data) => setRoles(data))
      .catch(() => console.error("Error al obtener los roles"));
  }, [authURL]);

  useEffect(() => {
    if (seleccionado && roles.length > 0) {
      let rolInicial = null;
      
      if (seleccionado.rol && typeof seleccionado.rol === 'object') {
        rolInicial = roles.find(r => r.id === seleccionado.rol.id);
      }
      else if (typeof seleccionado.rol === 'string') {
        rolInicial = roles.find(r => 
          r.nombre.toLowerCase() === seleccionado.rol.toLowerCase()
        );
      }
      else if (seleccionado.rolId) {
        rolInicial = roles.find(r => r.id === seleccionado.rolId);
      }
      
      setRolSeleccionado(rolInicial || null);
    }
  }, [seleccionado, roles]);

  const handleSubmit = () => {
    if (validateAll()) {
      const isEdit = Boolean(seleccionado?.id);
      const metodo = isEdit ? "PUT" : "POST";
      const url = `${authURL}/auth/usuarios${isEdit ? `/${seleccionado?.id}` : ''}`;
      
      const payloadActivo = typeof activo === 'boolean' 
        ? activo 
        : activo === 'Activo';

      const payload = {
        email: data.email,
        rolId: rolSeleccionado?.id,
        ...(isEdit && { activo: payloadActivo })
      };

      fetch(url, {
        method: metodo,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(isEdit ? payload : { ...payload, activo: true }),
      })
        .then(async (response) => {
          if (!response.ok) throw new Error(await response.text());
          return response.json();
        })
        .then((newData) => {
          setDatos(isEdit
            ? datos.map(usuario => usuario.id === data.id ? newData : usuario)
            : [...datos, newData]
          );
          handleClose();
        })
        .catch((error) => console.error(`Error: ${error.message}`));
    }
  };

  const handleToggleActivo = () => setActivo(!activo);
  const handleClickDelete = () => setOpenDialogDelete(true);
  const handleCloseDialog = () => setOpenDialogDelete(false);

  // Estilos para azul en focus
  const azulStyles = {
    '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: theme.colores.azul,
    },
    '& .MuiInputLabel-root.Mui-focused': {
      color: theme.colores.azul,
    },
  };

  return (
    <>
      <Box sx={{ width: '100%' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <TextField
            margin="dense"
            label="Email"
            name="email"
            variant="outlined"
            fullWidth
            value={data.email ?? ""}
            onChange={handleChange("email")}
            error={!!errors.email}
            helperText={errors.email}
            sx={azulStyles}
          />
          <Autocomplete
            disablePortal
            options={roles}
            getOptionLabel={(option) => option.nombre}
            value={rolSeleccionado}
            onChange={(_e, newValue) => setRolSeleccionado(newValue)}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Rol"
                error={!!errors.rolId}
                helperText={errors.rolId}
                sx={azulStyles}
              />
            )}
          />
        </Box>
      </Box>

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
        {seleccionado && (
          <IconButton
            onClick={handleClickDelete}
            sx={{ ml: 1, width: 40, height: 40, borderRadius: '50%', background: 'transparent', transition: 'background 0.2s', '&:hover': { background: 'rgba(214, 131, 132, 0.12)' }, display: 'flex', alignItems: 'center', justifyContent: 'center', p: 0 }}
            title="Eliminar usuario"
          >
            <DeleteOutlineIcon sx={{ fontSize: 20, color: '#d68384' }} />
          </IconButton>
        )}
      </Box>

      <Dialog
        open={openDialogDelete}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DeleteEntidad
          idEntidad={data.id}
          endpointEntidad="auth/usuarios"
          handleCloseDialog={handleCloseDialog}
          handleClose={handleClose}
          datos={datos}
          setDatos={setDatos}
          usarAuthURL={true}
        />
      </Dialog>
    </>
  );
};

export default UsuariosForm;