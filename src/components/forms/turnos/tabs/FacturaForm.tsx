import {
  Autocomplete,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import React, { useContext, useEffect, useState } from 'react';
import { ContextoGeneral } from '../../../Contexto';
import useValidation from '../../../hooks/useValidation';
import MainButton from '../../../botones/MainButtom';
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { Dialog as MuiDialog } from '@mui/material';
import { useNotificacion } from '../../../Notificaciones/NotificacionSnackbar';
import { axiosGet, axiosPut, axiosPost, axiosDelete } from '../../../../lib/axiosConfig';


interface TipoFactura {
  id: number;
  nombre: string;
}

interface Factura {
  id?: string;
  tipoFactura?: TipoFactura;
  valorIva?: number;
  total?: number;
  puntoDeVenta?: string;
  nroFactura?: string;
}

interface FacturaFormProps {
  cuitEmpresa: number | string;
  turnoId: number;
  initialFactura?: Factura | null;
  onSuccess: (updatedData: any) => void;
  onCancel: () => void;
}

const FacturaForm: React.FC<FacturaFormProps> = ({
  cuitEmpresa,
  turnoId,
  initialFactura,
  onSuccess,
  onCancel,
}) => {
  const { backendURL } = useContext(ContextoGeneral);
  const isUpdateMode = Boolean(initialFactura);
  const {theme} = useContext(ContextoGeneral);
  const tema = useTheme();
  const isMobile = useMediaQuery(tema.breakpoints.down("sm"));
  const { showNotificacion } = useNotificacion();

  // Estados para opciones (tipos de factura)
  const [tiposFacturaOptions, setTiposFacturaOptions] = useState<TipoFactura[]>([]);
  // Estado para el diálogo de eliminación
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [existsDialogOpen, setExistsDialogOpen] = useState(false);
  const [facturaExistente, setFacturaExistente] = useState<any>(null);
  const [pendingSubmit, setPendingSubmit] = useState(false);

  // Configuramos el estado inicial.
  const initialData = isUpdateMode
    ? {
        tipoFactura: initialFactura?.tipoFactura || null,
        puntoDeVenta: initialFactura?.puntoDeVenta || '',
        nroFactura: initialFactura?.nroFactura || '',
      }
    : {
        tipoFactura: null as TipoFactura | null,
        puntoDeVenta: '',
        nroFactura: '',
      };

  // Reglas de validación.
  const rules = {
        tipoFactura: (value: TipoFactura | null) =>
          value ? null : 'El tipo de factura es obligatorio',
        puntoDeVenta: (value: string) => {
          if (!value) return 'El número de punto de venta es obligatorio';
          if (value.length !== 4) return 'El punto de venta debe tener 4 dígitos';
          return null;
        },
        nroFactura: (value: string) => {
          if (!value) return 'El número de comprobante es obligatorio';
          if (value.length !== 8) return 'El número de factura debe tener 8 dígitos';
          return null;
        },
      };

  const { data, errors, validateAll, setData } = useValidation(initialData, rules);
  // const headers = {
  //   'Content-Type': 'application/json',
  //   'ngrok-skip-browser-warning': 'true',
  // };

  // Cargar tipos de factura
  useEffect(() => {
    const fetchTiposFactura = async () => {
      try {
        const data = await axiosGet<any[]>('facturas/tipos', backendURL);
        setTiposFacturaOptions(data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchTiposFactura();
  }, [backendURL]);

  // Actualizar el estado en update mode si cambia initialFactura
  useEffect(() => {
    if (initialFactura && isUpdateMode) {
      setData({
        tipoFactura: initialFactura.tipoFactura || null,
        puntoDeVenta: initialFactura.puntoDeVenta || '',
        nroFactura: initialFactura.nroFactura || '',
      });
    }
  }, [initialFactura, isUpdateMode, setData]);

  // En modo creación se calcula el total con IVA a partir de totalSinIva e ivaSeleccionado.

  // Funciones para el diálogo de eliminación.
  const handleOpenDeleteDialog = () => {
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
  };

  const handleDelete = async () => {
    try {
      // 1. Desasociar la factura del turno (sin idEstado)
      await axiosPut(`turnos/${turnoId}`, { factura: null }, backendURL);
      // 2. Eliminar la factura
      await axiosDelete(`facturas/${initialFactura?.id}`, backendURL);
      onSuccess(null);
      handleCloseDeleteDialog();
    } catch (error: any) {
      // Si el error es por que la factura tiene otros turnos asociados
      if (error && error.message && error.message.includes('Error al eliminar la factura')) {
        showNotificacion('La factura se desasoció del turno con éxito, pero no se pudo borrar porque tiene otros turnos asociados.', 'warning');
        onSuccess(null); // Recargar turnos
        handleCloseDeleteDialog();
      } else {
        console.error('Error al borrar la factura:', error);
        handleCloseDeleteDialog();
      }
    }
  };

  // Nueva función para asociar factura existente al turno
  const asociarFacturaATurno = async (facturaId: string) => {
    try {
      const updatedTurno = await axiosPut(`turnos/${turnoId}`, { idFactura: facturaId }, backendURL);
      onSuccess(updatedTurno);
    } catch (error) {
      console.error('Error al asociar la factura al turno:', error);
    }
  };

  // Manejo del submit (update o creación)
  const handleSubmit = async () => {
    if (!validateAll()) {
      // Forzar errores en los campos si no cumplen longitud
      const newErrors = { ...errors };
      if (!data.puntoDeVenta || data.puntoDeVenta.length !== 4) {
        newErrors.puntoDeVenta = !data.puntoDeVenta ? 'El número de punto de venta es obligatorio' : 'El punto de venta debe tener 4 dígitos';
      }
      if (!data.nroFactura || data.nroFactura.length !== 8) {
        newErrors.nroFactura = !data.nroFactura ? 'El número de comprobante es obligatorio' : 'El número de factura debe tener 8 dígitos';
      }
      setData((prev: any) => ({ ...prev })); // Forzar re-render
      return;
    }
    try {
      const nroFactura = data.nroFactura;
      const puntoDeVenta = data.puntoDeVenta;
      const tipoFacturaId = data.tipoFactura?.id;
      const cuitEmisor = cuitEmpresa;
      setPendingSubmit(true);

      // Then proceed with factura creation/association
      const facturas = await axiosGet<any[]>('facturas', backendURL);
      const existente = facturas.find((f: any) =>
        String(f.cuitEmisor) === String(cuitEmisor) &&
        String(f.nroFactura) === String(nroFactura) &&
        String(f.tipoFactura?.id) === String(tipoFacturaId) &&
        String(f.puntoDeVenta) === String(puntoDeVenta)
      );
      if (existente) {
        setFacturaExistente(existente);
        setExistsDialogOpen(true);
        setPendingSubmit(false);
        return;
      }
      // 2. Si no existe, crear la factura
      const payload = {
        cuitEmisor,
        nroFactura,
        idTipoFactura: Number(tipoFacturaId),
        puntoDeVenta,
      };
      const facturaCreada = await axiosPost('facturas/crear-factura', payload, backendURL);
      // Asociar la factura creada al turno
      await asociarFacturaATurno(facturaCreada.id);
      setPendingSubmit(false);
    } catch (error) {
      setPendingSubmit(false);
      console.error('Error al procesar la factura:', error);
    }
  };

  const handlePuntoDeVentaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 4);
    setData((prev: any) => ({ ...prev, puntoDeVenta: value }));
    rules.puntoDeVenta && rules.puntoDeVenta(value);
  };

  const handleNroFacturaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 8);
    setData((prev: any) => ({ ...prev, nroFactura: value }));
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      {/* Tipo de Factura */}
      <Autocomplete
        options={tiposFacturaOptions}
        getOptionLabel={(option) => option.nombre}
        value={isUpdateMode ? initialFactura?.tipoFactura || null : data.tipoFactura}
        onChange={(_e, newValue) =>
          setData((prev: any) => ({ ...prev, tipoFactura: newValue }))
        }
        renderInput={(params) => (
          <TextField
            {...params}
            label="Tipo de Factura"
            error={!!errors.tipoFactura}
            helperText={errors.tipoFactura}
            fullWidth
            sx={{
              mt: 2,
              '& .MuiInputLabel-root': {
                background: '#fff',
                px: 0.5,
                zIndex: 1,
              },
              '& .MuiOutlinedInput-root': {
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: theme.colores.azul,
                },
              },
              '& .MuiInputLabel-root.Mui-focused': {
                color: theme.colores.azul,
              },
            }}
          />
        )}
        disabled={isUpdateMode}
        fullWidth
      />
      <Stack direction="row" spacing={2}>
        <TextField
          label="Punto de Venta"
          type="text"
          value={data.puntoDeVenta}
          onChange={handlePuntoDeVentaChange}
          error={!!errors.puntoDeVenta}
          helperText={errors.puntoDeVenta}
          sx={{
            minWidth: 150,
            maxWidth: 200,
            '& .MuiOutlinedInput-root': {
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: theme.colores.azul,
              },
            },
            '& .MuiInputLabel-root.Mui-focused': {
              color: theme.colores.azul,
            },
          }}
          inputProps={{ maxLength: 4, inputMode: 'numeric', pattern: '[0-9]*' }}
        />
        <TextField
          label="Nro Factura"
          type="text"
          value={data.nroFactura}
          onChange={handleNroFacturaChange}
          error={!!errors.nroFactura}
          helperText={errors.nroFactura}
          fullWidth
          sx={{
            '& .MuiOutlinedInput-root': {
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: theme.colores.azul,
              },
            },
            '& .MuiInputLabel-root.Mui-focused': {
              color: theme.colores.azul,
            },
          }}
          inputProps={{ maxLength: 8, inputMode: 'numeric', pattern: '[0-9]*' }}
        />
      </Stack>
      <Box
        sx={{
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          gap: 1,
          justifyContent: "center",
          alignItems: "center",
          position: 'relative'
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
          text={isUpdateMode ? 'Actualizar' : 'Crear'}
          backgroundColor={theme.colores.azul}
          textColor="#fff"
          width={isMobile ? '100%' : 'auto'}
          borderRadius="8px"
          hoverBackgroundColor={theme.colores.azulOscuro}
          divWidth={isMobile ? '100%' : 'auto'}
          disabled={pendingSubmit}
        />
        {isUpdateMode && (
          <IconButton onClick={handleOpenDeleteDialog}>
          <DeleteOutlineIcon sx={{ fontSize: 20, color: "#d68384" }} />
        </IconButton>
        )}
      </Box>
      {/* Diálogo de confirmación para eliminar */}
      <Dialog open={deleteDialogOpen} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Eliminar Factura</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Está seguro de que quiere eliminar esta factura?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} variant="text" sx={{ color: theme.colores.azul }}>
            No
          </Button>
          <Button onClick={handleDelete} variant="text" color="error">
            Sí, eliminar
          </Button>
        </DialogActions>
      </Dialog>
      {/* Diálogo si la factura ya existe */}
      <MuiDialog open={existsDialogOpen} onClose={() => setExistsDialogOpen(false)}>
        <DialogTitle>Factura ya existe</DialogTitle>
        <DialogContent>
          <Typography>
            Esa factura ya existe y probablemente esté asociada a otros turnos. ¿Querés asociar este turno también?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', gap: 2, pb: 2 }}>
          <MainButton
            onClick={() => setExistsDialogOpen(false)}
            text="No"
            backgroundColor="transparent"
            textColor={theme.colores.azul}
            width="120px"
            borderRadius="8px"
            hoverBackgroundColor="rgba(22, 54, 96, 0.1)"
            divWidth="120px"
          />
          <MainButton
            onClick={async () => {
              setExistsDialogOpen(false);
              await asociarFacturaATurno(facturaExistente.id);
            }}
            text="Sí, asociar"
            backgroundColor={theme.colores.azul}
            textColor="#fff"
            width="120px"
            borderRadius="8px"
            hoverBackgroundColor={theme.colores.azulOscuro}
            divWidth="120px"
          />
        </DialogActions>
      </MuiDialog>
    </Box>
  );
};

export default FacturaForm;