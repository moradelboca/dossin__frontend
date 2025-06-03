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
} from "@mui/material";
import { ContextoGeneral } from "../../../../Contexto";
import MainButton from "../../../../botones/MainButtom";

interface TipoCombustible {
  id: number;
  nombre: string;
}

export interface AdelantoGasoil {
  id?: number;
  idTurnoDeCarga: number;
  idTipoCombustible: number;
  cantLitros: number;
  precioLitros: number;
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
  const { backendURL } = useContext(ContextoGeneral);
  const headers = {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
  };
  const { theme } = useContext(ContextoGeneral);

  const tema = useTheme();
  const isMobile = useMediaQuery(tema.breakpoints.down("sm"));

  // Estado para el adelanto actualmente seleccionado
  const [adelanto, setAdelanto] = useState<AdelantoGasoil | undefined>(
    initialAdelanto
  );
  // Estados para el formulario
  const [tipoCombustible, setTipoCombustible] =
    useState<TipoCombustible | null>(null);
  const [cantLitros, setCantLitros] = useState<number | "">(
    initialAdelanto?.cantLitros || ""
  );
  const [precioLitros, setPrecioLitros] = useState<number | "">(
    initialAdelanto?.precioLitros || ""
  );
  const [errors, setErrors] = useState<{
    tipoCombustible?: string;
    cantLitros?: string;
    precioLitros?: string;
  }>({});

  const [tiposCombustibleOptions, setTiposCombustibleOptions] = useState<
    TipoCombustible[]
  >([]);
  // Estado para controlar la apertura del dialog de eliminación
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  // 1. Cargar las opciones para el autocomplete de tipos de combustible
  useEffect(() => {
    const fetchTiposCombustible = async () => {
      try {
        const response = await fetch(`${backendURL}/adelantos/gasoil/tipos`, {
          method: "GET",
          headers,
        });
        if (!response.ok)
          throw new Error("Error al obtener los tipos de gasoil");
        const data = await response.json();
        setTiposCombustibleOptions(data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchTiposCombustible();
  }, [backendURL]);

  // 2. Obtener el listado de adelantos para el turno y filtrar por turnoId
  useEffect(() => {
    const fetchAdelantos = async () => {
      try {
        const response = await fetch(`${backendURL}/adelantos/gasoil`, {
          method: "GET",
          headers,
        });
        if (!response.ok)
          throw new Error("Error al obtener los adelantos de gasoil");
      
        if (initialAdelanto) {
          const transformed = transformAdelanto(initialAdelanto);
          setAdelanto(transformed);
          setCantLitros(transformed.cantLitros);
          setPrecioLitros(transformed.precioLitros);
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchAdelantos();
  }, [backendURL, turnoId, initialAdelanto]);

  // 3. Actualizar el tipo de combustible si ya hay un adelanto seleccionado
  useEffect(() => {
    if (adelanto && tiposCombustibleOptions.length > 0) {
      const foundTipo = tiposCombustibleOptions.find(
        (tipo) => tipo.id === adelanto.idTipoCombustible
      );
      if (foundTipo) {
        setTipoCombustible(foundTipo);
      }
    }
  }, [adelanto, tiposCombustibleOptions]);

  const transformAdelanto = (record: any): AdelantoGasoil => {
    return {
      id: record.id,
      idTurnoDeCarga: record.turnoDeCarga?.id,
      idTipoCombustible: record.tipoCombustible?.id,
      cantLitros: record.cantLitros,
      precioLitros: record.precio, // Si el backend lo llama 'precio'
    };
  };

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
      console.error("El id del turno no está definido");
      return;
    }

    const payload: AdelantoGasoil = {
      idTurnoDeCarga: Number(turnoId),
      idTipoCombustible: tipoCombustible.id,
      cantLitros: Number(cantLitros),
      precioLitros: Number(precioLitros),
    };

    try {
      let url = `${backendURL}/adelantos/gasoil`;
      let method = "POST";

      // Si ya existe un adelanto, se actualiza mediante PUT
      if (adelanto && adelanto.id) {
        url = `${backendURL}/adelantos/gasoil/${adelanto.id}`;
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
      const response = await fetch(
        `${backendURL}/adelantos/gasoil/${adelanto.id}`,
        {
          method: "DELETE",
          headers,
        }
      );
      if (!response.ok) {
        throw new Error(await response.text());
      }
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
        renderInput={(params) => (
          <TextField
            {...params}
            label="Tipo de Combustible"
            error={!!errors.tipoCombustible}
            helperText={errors.tipoCombustible}
          />
        )}
      />
      <TextField
        label="Cantidad de Litros"
        type="number"
        value={cantLitros}
        onChange={(e) =>
          setCantLitros(e.target.value ? Number(e.target.value) : "")
        }
        error={!!errors.cantLitros}
        helperText={errors.cantLitros}
      />
      <TextField
        label="Precio por Litro"
        type="number"
        value={precioLitros}
        onChange={(e) =>
          setPrecioLitros(e.target.value ? Number(e.target.value) : "")
        }
        error={!!errors.precioLitros}
        helperText={errors.precioLitros}
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
