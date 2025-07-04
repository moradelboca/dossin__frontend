// components/tabs/AdelantoEfectivoForm.tsx
import React, { useState, useEffect, useContext } from "react";
import {
  TextField,
  Button,
  Box,
  Autocomplete,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useMediaQuery,
  useTheme,
  InputAdornment,
} from "@mui/material";
import { ContextoGeneral } from "../../../../Contexto";
import MainButton from "../../../../botones/MainButtom";

interface TipoMedioPago {
  id: number;
  nombre: string;
}

export interface AdelantoEfectivo {
  id?: number;
  idTurnoDeCarga: number | string;
  idTipoMedioPago: number;
  montoAdelantado: number;
  // Permitir que venga como objeto para precarga robusta
  tipoMedioPago?: { id: number; nombre: string };
}

interface AdelantoEfectivoFormProps {
  turnoId: number | string;
  /** Si el turno ya tiene un adelanto efectivo creado, se puede pasar como initialAdelanto */
  initialAdelanto?: AdelantoEfectivo;
  onSuccess: (updatedData: any) => void;
  onCancel: () => void;
}

const AdelantoEfectivoForm: React.FC<AdelantoEfectivoFormProps> = ({
  turnoId,
  initialAdelanto,
  onSuccess,
  onCancel,
}) => {
  const { backendURL } = useContext(ContextoGeneral);
  const headers = {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
  };
  const { theme } = useContext(ContextoGeneral);

  const tema = useTheme();
  const isMobile = useMediaQuery(tema.breakpoints.down("sm"));

  // Estado para el adelanto efectivo seleccionado
  const [adelanto, setAdelanto] = useState<AdelantoEfectivo | undefined>(
    initialAdelanto
  );
  // Estados para los campos del formulario
  const [tipoMedioPago, setTipoMedioPago] = useState<TipoMedioPago | null>(
    null
  );
  const [montoAdelantado, setMontoAdelantado] = useState<number | "">(
    initialAdelanto?.montoAdelantado || ""
  );
  const [errors, setErrors] = useState<{
    tipoMedioPago?: string;
    montoAdelantado?: string;
  }>({});

  const [tiposMedioPagoOptions, setTiposMedioPagoOptions] = useState<
    TipoMedioPago[]
  >([]);
  // Estado para controlar la apertura del diálogo de eliminación
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  // Estilos para azul en focus
  const azulStyles = {
    '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: theme.colores.azul,
    },
    '& .MuiInputLabel-root.Mui-focused': {
      color: theme.colores.azul,
    },
  };

  // 1. Cargar las opciones para el autocomplete de tipos de medio de pago
  useEffect(() => {
    const fetchTiposMedioPago = async () => {
      try {
        const response = await fetch(`${backendURL}/adelantos/efectivo/tipos`, {
          method: "GET",
          headers,
        });
        if (!response.ok) throw new Error("Error al obtener los tipos de medio de pago");
        const data = await response.json();
        setTiposMedioPagoOptions(data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchTiposMedioPago();
  }, [backendURL]);

  // Precarga robusta: cuando initialAdelanto y las opciones están, setear todo
  useEffect(() => {
    if (initialAdelanto && tiposMedioPagoOptions.length > 0) {
      // Permitir precarga tanto por idTipoMedioPago como por tipoMedioPago.id
      const idTipo = initialAdelanto.idTipoMedioPago ?? initialAdelanto.tipoMedioPago?.id;
      const foundTipo = tiposMedioPagoOptions.find((tipo) => tipo.id === idTipo) || null;
      setTipoMedioPago(foundTipo);
      setMontoAdelantado(initialAdelanto.montoAdelantado ?? "");
      setAdelanto(initialAdelanto);
    }
    if (!initialAdelanto) {
      setTipoMedioPago(null);
      setMontoAdelantado("");
      setAdelanto(undefined);
    }
  }, [initialAdelanto, tiposMedioPagoOptions]);

  // Validación simple de los campos
  const validate = () => {
    const newErrors: { tipoMedioPago?: string; montoAdelantado?: string } = {};
    if (!tipoMedioPago) {
      newErrors.tipoMedioPago = "El tipo de medio de pago es obligatorio";
    }
    if (montoAdelantado === "" || Number(montoAdelantado) <= 0) {
      newErrors.montoAdelantado =
        "El monto adelantado es obligatorio y debe ser mayor a 0";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Función para crear o actualizar el adelanto efectivo
  const handleSubmit = async () => {
    if (!validate()) return;
    if (!tipoMedioPago) return;
    if (!turnoId) {
      console.error("El id del turno no está definido");
      return;
    }

    const payload: AdelantoEfectivo = {
      idTurnoDeCarga: String(turnoId),
      idTipoMedioPago: tipoMedioPago.id,
      montoAdelantado: Number(montoAdelantado),
    };

    try {
      let url = `${backendURL}/adelantos/efectivo`;
      let method = "POST";

      // Si ya existe un adelanto, se actualiza mediante PUT
      if (adelanto && adelanto.id) {
        url = `${backendURL}/adelantos/efectivo/${adelanto.id}`;
        method = "PUT";
      }

      const response = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        throw new Error(await response.text());
      }
      const data = await response.json();
      onSuccess(data);
    } catch (error) {
      console.error("Error al procesar el adelanto efectivo:", error);
    }
  };

  // Funciones para el diálogo de confirmación de eliminación


  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
  };

  const handleDelete = async () => {
    if (!adelanto || !adelanto.id) return;
    try {
      const response = await fetch(
        `${backendURL}/adelantos/efectivo/${adelanto.id}`,
        {
          method: "DELETE",
          headers,
        }
      );
      if (!response.ok) {
        throw new Error(await response.text());
      }
      // Notifica al padre o actualiza la lista tras la eliminación
      onSuccess({ deleted: true, id: adelanto.id });
      // Limpiar los campos del formulario
      setAdelanto(undefined);
      setMontoAdelantado("");
      setTipoMedioPago(null);
    } catch (error) {
      console.error("Error al eliminar el adelanto efectivo:", error);
    }
    setOpenDeleteDialog(false);
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {/* Campo para seleccionar el tipo de medio de pago */}
      <Autocomplete
        options={tiposMedioPagoOptions}
        getOptionLabel={(option) => option.nombre}
        value={tipoMedioPago}
        onChange={(_event, newValue) => setTipoMedioPago(newValue)}
        sx={{ ...azulStyles, mt: 2 }}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Tipo de Medio de Pago"
            error={!!errors.tipoMedioPago}
            helperText={errors.tipoMedioPago}
            sx={azulStyles}
          />
        )}
      />
      {/* Campo para el monto adelantado */}
      <TextField
        label="Monto Adelantado"
        type="number"
        value={montoAdelantado}
        onChange={(e) => {
          let val = e.target.value;
          // No permitir que empiece en 0 (excepto si es vacío)
          if (val.length > 1 && val.startsWith('0')) val = val.replace(/^0+/, '');
          // Limitar a 7 cifras
          if (val.length > 7) val = val.slice(0, 7);
          // Solo números positivos
          if (/^\d{0,7}$/.test(val)) setMontoAdelantado(val === '' ? '' : Number(val));
        }}
        error={!!errors.montoAdelantado}
        helperText={errors.montoAdelantado}
        inputProps={{ maxLength: 7, inputMode: 'numeric', pattern: '[1-9][0-9]{0,6}' }}
        sx={azulStyles}
        InputProps={{
          startAdornment: <InputAdornment position="start">$</InputAdornment>
        }}
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
          text={adelanto && adelanto.id ? "Actualizar Adelanto" : "Crear Adelanto"}
          backgroundColor={theme.colores.azul}
          textColor="#fff"
          width={isMobile ? '100%' : 'auto'}
          borderRadius="8px"
          hoverBackgroundColor={theme.colores.azulOscuro}
          divWidth={isMobile ? '100%' : 'auto'}
        />
      </Box>

      {/* Diálogo de confirmación para eliminar el adelanto */}
      <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Eliminar Adelanto</DialogTitle>
        <DialogContent>
          ¿Está seguro de que desea eliminar este adelanto efectivo?
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>No</Button>
          <Button onClick={handleDelete} color="error">
            Sí, eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdelantoEfectivoForm;
