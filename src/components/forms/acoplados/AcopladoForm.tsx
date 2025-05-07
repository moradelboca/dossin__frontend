import React, { useContext, useEffect, useState } from "react";
import { 
  Dialog, 
  IconButton, 
  TextField, 
  Box, 
  Autocomplete,
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

const AcopladoForm: React.FC<FormularioProps> = ({
  seleccionado = {},
  datos,
  setDatos,
  handleClose,
}) => {
  const { backendURL, theme } = useContext(ContextoGeneral);
  const [openDialogDelete, setOpenDialogDelete] = useState(false);
  const [tiposAcoplados, setTiposAcoplados] = useState<any[]>([]);
  const [tipoSeleccionado, setTipoSeleccionado] = useState<string | null>(seleccionado?.tipoAcoplado || null);
  

  const tema = useTheme();
  const isMobile = useMediaQuery(tema.breakpoints.down("sm"));

  const { showNotificacion } = useNotificacion();

  const { data, errors, handleChange, validateAll } = useValidation(
    {
      patente: "",
      tipoAcoplado: "",
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
      tipoAcoplado: () => (!tipoSeleccionado ? "Debe seleccionar un tipo de acoplado" : null),
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

  useEffect(() => {
    fetch(`${backendURL}/acoplados/tiposacoplados`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true",
      },
    })
      .then((response) => response.json())
      .then((data) => setTiposAcoplados(data))
      .catch(() => console.error("Error al obtener los tipos de acoplados disponibles"));
  }, [backendURL]);

  const handleSubmit = async () => {
    // Si ya existe, notificar al usuario y detener el envío
    if (!validateAll()) {
      showNotificacion('Por favor corrija los errores en el formulario', 'error');
      return;
    }

    try {
      const metodo = seleccionado?.patente ? "PUT" : "POST";
      const url = seleccionado?.patente
        ? `${backendURL}/acoplados/${data.patente}`
        : `${backendURL}/acoplados`;
  
      const idTipoAcoplado = tiposAcoplados.find(
        (tipo) => tipo.nombre === tipoSeleccionado
      )?.id;
  
      const payload = {
        patente: data.patente,
        urlRTO: data.urlRTO,
        urlPolizaSeguro: data.urlPolizaSeguro,
        urlRuta: data.urlRuta,
        idTipoAcoplado,
      };
  
      const response = await fetch(url, {
        method: metodo,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
  
      if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(errorMessage);
      }
  
      const newData = await response.json();
      
      if (metodo === "POST") {
        setDatos([...datos, newData]);
        showNotificacion('Acoplado creado exitosamente', 'success');
      } else {
        setDatos(
          datos.map((acoplado: { patente: any }) =>
            acoplado.patente === data.patente ? newData : acoplado
        ));
        showNotificacion('Acoplado actualizado exitosamente', 'success');
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

        <Autocomplete
          disablePortal
          options={tiposAcoplados.map((tipo) => tipo.nombre)}
          value={tipoSeleccionado}
          onChange={(_, newValue) => setTipoSeleccionado(newValue)}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Tipo de Acoplado"
              variant="outlined"
              error={!!errors.tipoAcoplado}
              helperText={!tipoSeleccionado ? "Seleccione un tipo de acoplado" : ""}
            />
          )}
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
            <IconButton onClick={handleClickDeleteCarga}>
              <DeleteOutlineIcon sx={{ fontSize: 20, color: "#d68384" }} />
            </IconButton>
          )}
        </Box>
      </Box>

      <Dialog open={openDialogDelete} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DeleteEntidad
          idEntidad={data.patente}
          endpointEntidad="acoplados"
          handleCloseDialog={handleCloseDialog}
          handleClose={handleClose}
          datos={datos}
          setDatos={setDatos}
        />
      </Dialog>
    </Box>
  );
};

export default AcopladoForm;
