import React, { useContext, useState, useEffect } from "react";
import { Autocomplete, TextField, useTheme, useMediaQuery, Box, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, FormControlLabel, Radio, RadioGroup, Typography } from "@mui/material";
import { ContextoGeneral } from "../../../Contexto";
import MainButton from "../../../botones/MainButtom";
import { axiosGet, axiosPut } from "../../../../lib/axiosConfig";
import { registrarCambioEstado } from "../../../../services/turnosEstadoHistorialService";
import { useAuth } from "../../../autenticacion/ContextoAuth";

interface EstadoTurnoFormProps {
  turnoId: number | string;
  /** El estado actual del turno, por ejemplo: { id: 2, nombre: "Asignado" } */
  initialEstado: { id: number; nombre: string } | null;
  onSuccess: (updatedData: any) => void;
  onCancel: () => void;
}

const EstadoTurnoForm: React.FC<EstadoTurnoFormProps> = ({
  turnoId,
  initialEstado,
  onSuccess,
  onCancel,
}) => {
  const { backendURL } = useContext(ContextoGeneral);
  const { user } = useAuth();
  const [estados, setEstados] = useState<{ id: number; nombre: string }[]>([]);
  const [selectedEstado, setSelectedEstado] = useState<{ id: number; nombre: string } | null>(initialEstado);
  const [error, setError] = useState<string | null>(null);
  const [openEmitirCPEDialog, setOpenEmitirCPEDialog] = useState(false);
  const [emitirCPE, setEmitirCPE] = useState<boolean>(true);
  const {theme} = useContext(ContextoGeneral);
  
  const tema = useTheme();
  const isMobile = useMediaQuery(tema.breakpoints.down("sm"));

  useEffect(() => {
    axiosGet<{ id: number; nombre: string }[]>('turnos/estados', backendURL)
      .then(data => {
        setEstados(data);
        // Si no hay estado seleccionado, seteo el primero
        if (!selectedEstado && data.length > 0) setSelectedEstado(data[0]);
      })
      .catch(() => setEstados([]));
  }, [backendURL]);

  const handleSubmit = async () => {
    if (!selectedEstado) {
      setError("Debe seleccionar un estado.");
      return;
    }

    // Si el estado seleccionado es "En viaje" (id: 8), mostrar diálogo para emitir CPE
    if (selectedEstado.id === 8 && initialEstado?.id !== 8) {
      setOpenEmitirCPEDialog(true);
      return;
    }

    // Si no es cambio a "En viaje", proceder directamente
    await actualizarEstado();
  };

  const actualizarEstado = async () => {
    if (!selectedEstado) return;

    // Guardar el estado anterior antes de hacer el cambio
    const estadoAnteriorId = initialEstado?.id || null;

    try {
      const payload = {
        idEstado: selectedEstado.id,
      };
      
      // Si es cambio a "En viaje" (id: 8), agregar query parameter emitircpe
      let url = `turnos/${turnoId}`;
      if (selectedEstado.id === 8) {
        url += `?emitircpe=${emitirCPE}`;
      }
      
      const updatedData = await axiosPut(url, payload, backendURL);
      
      // Registrar el cambio de estado en el historial (no bloqueante)
      if (estadoAnteriorId !== selectedEstado.id) {
        registrarCambioEstado(
          turnoId,
          estadoAnteriorId,
          selectedEstado.id,
          user?.id,
          `Cambio manual de estado desde formulario`
        ).catch(() => {
          // Error silencioso - no debe afectar el flujo principal
        });
      }
      
      setOpenEmitirCPEDialog(false);
      onSuccess(updatedData);
    } catch (err: any) {
      console.error(`Error: ${err.message}`);
      setError(err.message || "Error al actualizar el estado");
      setOpenEmitirCPEDialog(false);
    }
  };

  const handleConfirmEmitirCPE = () => {
    actualizarEstado();
  };

  const handleCancelEmitirCPE = () => {
    setOpenEmitirCPEDialog(false);
    setSelectedEstado(initialEstado);
  };

  return (
    <Box p={2}>
      <Autocomplete
        options={estados}
        getOptionLabel={(option) => option.nombre}
        value={selectedEstado}
        onChange={(_event, newValue) => {
          if (newValue) {
            setSelectedEstado(newValue);
            setError(null);
          }
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Estado"
            variant="outlined"
            error={!!error}
            helperText={error}
          />
        )}
      />
      <Box
        sx={{
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          gap: 1,
          justifyContent: "center",
          alignItems: "center",
          position: 'relative',
          mt: 2
        }}
      >
        <MainButton
          onClick={onCancel}
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
          text='Actualizar'
          backgroundColor={theme.colores.azul}
          textColor="#fff"
          width={isMobile ? '100%' : 'auto'}
          borderRadius="8px"
          hoverBackgroundColor={theme.colores.azulOscuro}
          divWidth={isMobile ? '100%' : 'auto'}
        />
      </Box>

      {/* Diálogo para confirmar emisión de CPE */}
      <Dialog
        open={openEmitirCPEDialog}
        onClose={handleCancelEmitirCPE}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Cambiar estado a "En Viaje"</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Al cambiar el estado a "En Viaje", debe especificar si se emitirá una Carta de Porte (CPE) para este turno.
          </DialogContentText>
          <RadioGroup
            value={emitirCPE ? 'true' : 'false'}
            onChange={(e) => setEmitirCPE(e.target.value === 'true')}
          >
            <FormControlLabel
              value="true"
              control={<Radio sx={{ color: theme.colores.azul, '&.Mui-checked': { color: theme.colores.azul } }} />}
              label={
                <Box>
                  <Typography variant="body1" fontWeight="medium">
                    Sí, emitir CPE
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Se generará una Carta de Porte para este turno
                  </Typography>
                </Box>
              }
            />
            <FormControlLabel
              value="false"
              control={<Radio sx={{ color: theme.colores.azul, '&.Mui-checked': { color: theme.colores.azul } }} />}
              label={
                <Box>
                  <Typography variant="body1" fontWeight="medium">
                    No emitir CPE
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    No se generará una Carta de Porte para este turno
                  </Typography>
                </Box>
              }
            />
          </RadioGroup>
        </DialogContent>
        <DialogActions>
          <MainButton
            onClick={handleCancelEmitirCPE}
            text="Cancelar"
            backgroundColor="transparent"
            textColor={theme.colores.azul}
            borderRadius="8px"
            hoverBackgroundColor="rgba(22, 54, 96, 0.1)"
          />
          <MainButton
            onClick={handleConfirmEmitirCPE}
            text="Confirmar"
            backgroundColor={theme.colores.azul}
            textColor="#fff"
            borderRadius="8px"
            hoverBackgroundColor={theme.colores.azulOscuro}
          />
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EstadoTurnoForm;
