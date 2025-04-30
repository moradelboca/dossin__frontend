import React, { useContext, useState } from "react";
import { 
  Button, 
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

const CamionForm: React.FC<FormularioProps> = ({
  seleccionado = {},
  datos, 
  setDatos,
  handleClose,
}) => {
  const { backendURL } = useContext(ContextoGeneral);
  const [openDialogDelete, setOpenDialogDelete] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
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

  return (
    <Box sx={{ p: isMobile ? 2 : 4 }}>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <TextField
          margin="dense"
          label="Patente"
          name="patente"
          variant="outlined"
          fullWidth
          value={data.patente}
          onChange={handleChange("patente")}
          error={!!errors.patente}
          helperText={errors.patente}
          disabled={!!seleccionado?.patente}
        />

        <TextField
          margin="dense"
          label="URL RTO"
          variant="outlined"
          fullWidth
          value={data.urlRTO}
          onChange={handleChange("urlRTO")}
          error={!!errors.urlRTO}
          helperText={errors.urlRTO}
        />

        <TextField
          label="URL Póliza de Seguro"
          variant="outlined"
          fullWidth
          value={data.urlPolizaSeguro}
          onChange={handleChange("urlPolizaSeguro")}
          error={!!errors.urlPolizaSeguro}
          helperText={errors.urlPolizaSeguro}
        />

        <TextField
          label="URL Ruta"
          variant="outlined"
          fullWidth
          value={data.urlRuta}
          onChange={handleChange("urlRuta")}
          error={!!errors.urlRuta}
          helperText={errors.urlRuta}
        />

        <Box
          sx={{
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            gap: isMobile ? 1 : 2,
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Button onClick={handleClose} color="primary" variant="outlined" fullWidth={isMobile}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} color="primary" variant="contained" fullWidth={isMobile}>
            Guardar
          </Button>
          {seleccionado && (
            <IconButton onClick={handleClickDeleteCarga}>
              <DeleteOutlineIcon sx={{ fontSize: 20, color: "#d68384" }} />
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