// components/tabs/AdelantoGasoilForm.tsx
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
  useTheme,
  useMediaQuery,
  InputAdornment,
} from "@mui/material";
import { ContextoGeneral } from "../../../../Contexto";
import MainButton from "../../../../botones/MainButtom";
import { axiosGet, axiosPost, axiosPut, axiosDelete } from "../../../../../lib/axiosConfig";

interface TipoCombustible {
  id: number;
  nombre: string;
}

export interface AdelantoGasoil {
  id?: number;
  idTurnoDeCarga: string;
  idTipoCombustible: number;
  cantLitros: number;
  precioLitros: number;
  tipoCombustible?: { id: number; nombre: string };
  precio?: number;
}

interface AdelantoGasoilFormProps {
  turnoId: number | string;
  initialAdelanto?: AdelantoGasoil;
  onSuccess: (updatedData: any) => void;
  onCancel: () => void;
}

const AdelantoGasoilForm: React.FC<AdelantoGasoilFormProps> = ({
  turnoId,
  initialAdelanto,
  onSuccess,
  onCancel,
}) => {
  const { backendURL, theme } = useContext(ContextoGeneral);

  const tema = useTheme();
  const isMobile = useMediaQuery(tema.breakpoints.down("sm"));

  // Estado para el adelanto actualmente seleccionado
  const [adelanto, setAdelanto] = useState<AdelantoGasoil | undefined>(initialAdelanto);
  const [tipoCombustible, setTipoCombustible] = useState<TipoCombustible | null>(null);
  const [cantLitros, setCantLitros] = useState<number | "">("");
  const [precioLitros, setPrecioLitros] = useState<number | "">("");
  const [errors, setErrors] = useState<{
    tipoCombustible?: string;
    cantLitros?: string;
    precioLitros?: string;
    turnoId?: string;
  }>({});

  const [tiposCombustibleOptions, setTiposCombustibleOptions] = useState<
    TipoCombustible[]
  >([]);
  // Estado para controlar la apertura del dialog de eliminación
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

  // 1. Cargar las opciones para el autocomplete de tipos de combustible
  useEffect(() => {
    const fetchTiposCombustible = async () => {
      try {
        const data = await axiosGet<TipoCombustible[]>('adelantos/gasoil/tipos', backendURL);
        setTiposCombustibleOptions(data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchTiposCombustible();
  }, [backendURL]);

  // Precarga robusta: cuando initialAdelanto y las opciones están, setear todo
  useEffect(() => {
    if (initialAdelanto && tiposCombustibleOptions.length > 0) {
      // Permitir precarga tanto por idTipoCombustible como por tipoCombustible.id
      const idTipo = initialAdelanto.idTipoCombustible ?? initialAdelanto.tipoCombustible?.id;
      const foundTipo = tiposCombustibleOptions.find((tipo) => tipo.id === idTipo) || null;
      setTipoCombustible(foundTipo);
      setCantLitros(initialAdelanto.cantLitros ?? "");
      setPrecioLitros(initialAdelanto.precioLitros ?? initialAdelanto.precio ?? "");
      setAdelanto(initialAdelanto);
    }
    if (!initialAdelanto) {
      setTipoCombustible(null);
      setCantLitros("");
      setPrecioLitros("");
      setAdelanto(undefined);
    }
  }, [initialAdelanto, tiposCombustibleOptions]);

  // Validación simple
  const validate = () => {
    const newErrors: {
      tipoCombustible?: string;
      cantLitros?: string;
      precioLitros?: string;
    } = {};

    if (!tipoCombustible) {
      newErrors.tipoCombustible = "El tipo de combustible es obligatorio";
    }
    if (cantLitros === "" || Number(cantLitros) <= 0) {
      newErrors.cantLitros =
        "La cantidad de litros es obligatoria y debe ser mayor a 0";
    }
    if (precioLitros === "" || Number(precioLitros) <= 0) {
      newErrors.precioLitros =
        "El precio por litro es obligatorio y debe ser mayor a 0";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Función para crear o actualizar el adelanto
  const handleSubmit = async () => {
    if (!validate()) return;
    if (!tipoCombustible) return;

    if (!turnoId) {
      setErrors((prev) => ({ ...prev, turnoId: "El id del turno no está definido" }));
      return;
    }

    const payload = {
      idTurnoDeCarga: String(turnoId),
      idTipoCombustible: tipoCombustible.id,
      cantLitros: Number(cantLitros),
      precioLitros: Number(precioLitros),
    };

    try {
      const data = adelanto && adelanto.id
        ? await axiosPut(`adelantos/gasoil/${adelanto.id}`, payload, backendURL)
        : await axiosPost('adelantos/gasoil', payload, backendURL);
      onSuccess(data);
      // (Opcional) Actualizar la lista de adelantos tras el cambio
    } catch (error) {
      console.error("Error al procesar el adelanto de gasoil:", error);
    }
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
  };

  const handleDelete = async () => {
    if (!adelanto || !adelanto.id) return;
    try {
      await axiosDelete(`adelantos/gasoil/${adelanto.id}`, backendURL);
      // Se notifica al padre o se actualiza la lista local tras la eliminación
      onSuccess({ deleted: true, id: adelanto.id });
      // Limpiar el formulario
      setAdelanto(undefined);
      setCantLitros("");
      setPrecioLitros("");
      setTipoCombustible(null);
    } catch (error) {
      console.error("Error al eliminar el adelanto de gasoil:", error);
    }
    setOpenDeleteDialog(false);
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {/* Campos del formulario */}
      <Autocomplete
        options={tiposCombustibleOptions}
        getOptionLabel={(option) => option.nombre}
        value={tipoCombustible}
        onChange={(_event, newValue) => setTipoCombustible(newValue)}
        sx={{ ...azulStyles, mt: 2 }}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Tipo de Combustible"
            error={!!errors.tipoCombustible}
            helperText={errors.tipoCombustible}
            sx={azulStyles}
          />
        )}
      />
      <TextField
        label="Cantidad de Litros"
        type="number"
        value={cantLitros}
        onChange={(e) => {
          let val = e.target.value;
          // No permitir que empiece en 0 (excepto si es vacío)
          if (val.length > 1 && val.startsWith('0')) val = val.replace(/^0+/, '');
          // Limitar a 3 cifras
          if (val.length > 3) val = val.slice(0, 3);
          // Solo números positivos
          if (/^\d{0,3}$/.test(val)) setCantLitros(val === '' ? '' : Number(val));
        }}
        error={!!errors.cantLitros}
        helperText={errors.cantLitros}
        inputProps={{ maxLength: 3, inputMode: 'numeric', pattern: '[1-9][0-9]{0,2}' }}
        sx={azulStyles}
      />
      <TextField
        label="Precio por Litro"
        type="number"
        value={precioLitros}
        onChange={(e) => {
          let val = e.target.value;
          // No permitir que empiece en 0 (excepto si es vacío)
          if (val.length > 1 && val.startsWith('0')) val = val.replace(/^0+/, '');
          // Limitar a 4 cifras
          if (val.length > 4) val = val.slice(0, 4);
          // Solo números positivos
          if (/^\d{0,4}$/.test(val)) setPrecioLitros(val === '' ? '' : Number(val));
        }}
        error={!!errors.precioLitros}
        helperText={errors.precioLitros}
        inputProps={{ maxLength: 4, inputMode: 'numeric', pattern: '[1-9][0-9]{0,3}' }}
        sx={azulStyles}
        InputProps={{
          startAdornment: <InputAdornment position="start">$</InputAdornment>
        }}
      />

      {/* Botones de guardado */}
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

      {/* Dialog de confirmación para eliminar */}
      <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Eliminar Adelanto</DialogTitle>
        <DialogContent>
          ¿Está seguro de que desea eliminar este adelanto?
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

export default AdelantoGasoilForm;
