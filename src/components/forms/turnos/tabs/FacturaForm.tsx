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
  InputAdornment,
} from '@mui/material';
import React, { useContext, useEffect, useState } from 'react';
import { ContextoGeneral } from '../../../Contexto';
import useValidation from '../../../hooks/useValidation';
import MainButton from '../../../botones/MainButtom';
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { Dialog as MuiDialog } from '@mui/material';
import { useNotificacion } from '../../../Notificaciones/NotificacionSnackbar';


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
  precioGrano?: number;
}

const FacturaForm: React.FC<FacturaFormProps> = ({
  cuitEmpresa,
  turnoId,
  initialFactura,
  onSuccess,
  onCancel,
  precioGrano,
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
        precioGrano: precioGrano !== undefined && precioGrano !== null ? (Number(precioGrano) * 1000) : '',
      }
    : {
        tipoFactura: null as TipoFactura | null,
        puntoDeVenta: '',
        nroFactura: '',
        precioGrano: precioGrano !== undefined && precioGrano !== null ? (Number(precioGrano) * 1000) : ''
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
        precioGrano: (value: string | number) =>
          value ? null : 'El precio del grano es obligatorio',
      };

  const { data, errors, validateAll, setData } = useValidation(initialData, rules);
  const headers = {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
  };

  // Cargar tipos de factura
  useEffect(() => {
    const fetchTiposFactura = async () => {
      try {
        const response = await fetch(`${backendURL}/facturas/tipos`, { method: 'GET', headers });
        if (!response.ok) throw new Error('Error al obtener los tipos de factura');
        const data = await response.json();
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
        precioGrano: precioGrano !== undefined && precioGrano !== null ? (Number(precioGrano) * 1000) : '',
      });
    }
  }, [initialFactura, isUpdateMode, setData, precioGrano]);

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
      await fetch(`${backendURL}/turnos/${turnoId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
        body: JSON.stringify({ factura: null }),
      });
      // 2. Eliminar la factura
      const response = await fetch(`${backendURL}/facturas/${initialFactura?.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
      });
      if (!response.ok) throw new Error(await response.text());
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
      const response = await fetch(`${backendURL}/turnos/${turnoId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ idFactura: facturaId }),
      });
      if (!response.ok) throw new Error(await response.text());
      const updatedTurno = await response.json();
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
      // Convertir a precio por kg antes de enviar
      const precioGrano = data.precioGrano ? (Number(data.precioGrano) / 1000) : 0;
      setPendingSubmit(true);

      // First, update the Turno with precioGrano
      const turnoResponse = await fetch(`${backendURL}/turnos/${turnoId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ precioGrano: Number(precioGrano) }),
      });
      if (!turnoResponse.ok) throw new Error('Error al actualizar el precio del grano');

      // Then proceed with factura creation/association
      const response = await fetch(`${backendURL}/facturas`, {
        method: 'GET',
        headers,
      });
      if (!response.ok) throw new Error('Error al buscar facturas');
      const facturas = await response.json();
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
      const createResponse = await fetch(`${backendURL}/facturas/crear-factura`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });
      if (!createResponse.ok) throw new Error(await createResponse.text());
      const facturaCreada = await createResponse.json();
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
      <TextField
        label="Precio Grano"
        type="number"
        value={data.precioGrano}
        onChange={(e) => {
          let value = e.target.value.replace(/[^0-9.]/g, '');
          // Evitar que arranque con 0 salvo que sea '0.'
          if (value.startsWith('0') && value.length > 1 && value[1] !== '.') {
            value = value.replace(/^0+/, '');
          }
          // Limit to 7 digits before decimal point
          const parts = value.split('.');
          if (parts[0].length > 7) {
            parts[0] = parts[0].slice(0, 7);
          }
          const newValue = parts.join('.');
          setData((prev: any) => ({ ...prev, precioGrano: newValue }));
        }}
        error={!!errors.precioGrano}
        helperText={errors.precioGrano}
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
        inputProps={{ 
          step: "0.01",
          min: "0",
          max: "999999",
          inputMode: 'decimal'
        }}
        InputProps={{
          startAdornment: <InputAdornment position="start">$</InputAdornment>,
        }}
      />
      {/* ADVERTENCIA: precio por tonelada debajo y en gris */}
      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, ml: 0.5 }}>
        Ingrese el precio del grano por tonelada. El sistema lo convertirá automáticamente a precio por kg.
      </Typography>
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