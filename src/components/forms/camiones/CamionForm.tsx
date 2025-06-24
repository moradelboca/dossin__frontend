import React, { useContext, useState } from "react";
import { 
  Dialog, 
  IconButton, 
  TextField, 
  Box, 
  useTheme, 
  useMediaQuery 
} from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import DeleteEntidad from "../../dialogs/DeleteEntidad";
import useValidation from "../../hooks/useValidation";
import { ContextoGeneral } from "../../Contexto";
import { FormularioProps } from "../../../interfaces/FormularioProps";
import { useNotificacion } from "../../Notificaciones/NotificacionSnackbar";
import MainButton from "../../botones/MainButtom";

const CamionForm: React.FC<FormularioProps> = ({
  seleccionado = {},
  datos, 
  setDatos,
  handleClose,
}) => {
  const { backendURL, theme } = useContext(ContextoGeneral);
  const [openDialogDelete, setOpenDialogDelete] = useState(false);
  const tema = useTheme();
  const isMobile = useMediaQuery(tema.breakpoints.down("sm"));
  const { showNotificacion } = useNotificacion();

  const { data, errors, handleChange, validateAll } = useValidation(
    {
      patente: "",
      urlRTO: "",
      urlPolizaSeguro: "",
      urlRuta: "",
      ...seleccionado,
    },
    {
      patente: (value) =>
        !/^([A-Za-z]{3}\d{3}|[A-Za-z]{2}\d{3}[A-Za-z]{2})$/.test(value)
          ? "La patente debe ser válida (LLLNNN o LLNNNLL)"
          : null,
      urlRTO: (value) =>
        value && !/^https?:\/\//.test(value)
          ? "Debe ser una URL válida"
          : null,
      urlPolizaSeguro: (value) =>
        value && !/^https?:\/\//.test(value)
          ? "Debe ser una URL válida"
          : null,
      urlRuta: (value) =>
        value && !/^https?:\/\//.test(value)
          ? "Debe ser una URL válida"
          : null,
    }
  );

  const handleSubmit = async () => {
    if (!validateAll()) {
      showNotificacion('Por favor corrija los errores en el formulario', 'error');
      return;
    }

    try {
      const metodo = seleccionado?.patente ? "PUT" : "POST";
      const url = seleccionado?.patente
        ? `${backendURL}/camiones/${data.patente}`
        : `${backendURL}/camiones`;

      const response = await fetch(url, {
        method: metodo,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(errorMessage);
      }

      const newData = await response.json();
      
      if (metodo === "POST") {
        setDatos([...datos, newData]);
        showNotificacion('Camión creado exitosamente', 'success');
      } else {
        const datosActualizados = datos.map((camion: { patente: string }) =>
          camion.patente === data.patente ? newData : camion
        );
        setDatos(datosActualizados);
        showNotificacion('Camión actualizado exitosamente', 'success');
      }
      
      handleClose();
    } catch (error) {
      console.error('Error:', error);
      showNotificacion(
        error instanceof Error 
          ? error.message 
          : 'Error al procesar la solicitud',
        'error'
      );
    }
  };

  const handleClickDeleteCarga = () => setOpenDialogDelete(true);
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
    <Box sx={{ p: isMobile ? 2 : 4 }}>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <TextField
          margin="dense"
          label="Patente"
          name="patente"
          variant="outlined"
          fullWidth
          value={data.patente ?? ""}
          onChange={handleChange("patente")}
          error={!!errors.patente}
          helperText={errors.patente}
          disabled={!!seleccionado?.patente}
          sx={azulStyles}
        />

        <TextField
          margin="dense"
          label="URL RTO"
          variant="outlined"
          fullWidth
          value={data.urlRTO ?? ""}
          onChange={handleChange("urlRTO")}
          error={!!errors.urlRTO}
          helperText={errors.urlRTO}
          sx={azulStyles}
        />

        <TextField
          label="URL Póliza de Seguro"
          variant="outlined"
          fullWidth
          value={data.urlPolizaSeguro ?? ""}
          onChange={handleChange("urlPolizaSeguro")}
          error={!!errors.urlPolizaSeguro}
          helperText={errors.urlPolizaSeguro}
          sx={azulStyles}
        />

        <TextField
          label="URL Ruta"
          variant="outlined"
          fullWidth
          value={data.urlRuta ?? ""}
          onChange={handleChange("urlRuta")}
          error={!!errors.urlRuta}
          helperText={errors.urlRuta}
          sx={azulStyles}
        />

        <Box
          sx={{
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            gap: 2,
            justifyContent: "flex-end",
            alignItems: "center",
            mt: 4,
            position: 'relative'
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
              text="Guardar"
              backgroundColor={theme.colores.azul}
              textColor="#fff"
              width={isMobile ? '100%' : 'auto'}
              borderRadius="8px"
              hoverBackgroundColor={theme.colores.azulOscuro}
              divWidth={isMobile ? '100%' : 'auto'}
            />
          {seleccionado && (
            <IconButton
              onClick={handleClickDeleteCarga}
              sx={{ ml: 1, width: 40, height: 40, borderRadius: '50%', background: 'transparent', transition: 'background 0.2s', '&:hover': { background: 'rgba(214, 131, 132, 0.12)' }, display: 'flex', alignItems: 'center', justifyContent: 'center', p: 0 }}
              title="Eliminar camión"
            >
              <DeleteOutlineIcon sx={{ fontSize: 20, color: '#d68384' }} />
            </IconButton>
          )}
        </Box>
      </Box>

      <Dialog open={openDialogDelete} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DeleteEntidad
          idEntidad={data.patente}
          endpointEntidad="camiones"
          handleCloseDialog={handleCloseDialog}
          handleClose={handleClose}
          datos={datos}
          setDatos={setDatos}
        />
      </Dialog>
    </Box>
  );
};

export default CamionForm;