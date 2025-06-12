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

interface TipoFactura {
  id: number;
  nombre: string;
}

interface Factura {
  id?: string;
  tipoFactura?: TipoFactura;
  valorIva?: number;
  total?: number;
  nroPuntoVenta?: string;
  nroComprobante?: string;
}

interface FacturaFormProps {
  cuitEmpresa: number | string;
  initialFactura?: Factura | null;
  onSuccess: (updatedData: any) => void;
  onCancel: () => void;
}

const FacturaForm: React.FC<FacturaFormProps> = ({
  cuitEmpresa,
  initialFactura,
  onSuccess,
  onCancel,
}) => {
  const { backendURL } = useContext(ContextoGeneral);
  const isUpdateMode = Boolean(initialFactura);
  const {theme} = useContext(ContextoGeneral);

  const tema = useTheme();
  const isMobile = useMediaQuery(tema.breakpoints.down("sm"));

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
        valorIva: initialFactura?.valorIva ?? 21,
        total: initialFactura?.total ?? '',
        ivaSeleccionado: initialFactura?.valorIva ?? 21,
        nroPuntoVenta: initialFactura?.nroPuntoVenta || '',
        nroComprobante: initialFactura?.nroComprobante || '',
      }
    : {
        tipoFactura: null as TipoFactura | null,
        nroPuntoVenta: '',
        nroComprobante: '',
        ivaSeleccionado: 21,
      };

  // Reglas de validación.
  const rules = {
        ivaSeleccionado: (value: any) =>
          value === '' ? 'El IVA es obligatorio' : Number(value) < 0 ? 'Valor IVA inválido' : null,
        tipoFactura: (value: TipoFactura | null) =>
          value ? null : 'El tipo de factura es obligatorio',
        nroPuntoVenta: (value: string) =>
          value ? null : 'El número de punto de venta es obligatorio',
        nroComprobante: (value: string) =>
          value ? null : 'El número de comprobante es obligatorio',
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
        valorIva: initialFactura.valorIva ?? 21,
        total: initialFactura.total ?? '',
        ivaSeleccionado: initialFactura.valorIva ?? 21,
        nroPuntoVenta: initialFactura.nroPuntoVenta || '',
        nroComprobante: initialFactura.nroComprobante || '',
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
    } catch (error) {
      console.error('Error al borrar la factura:', error);
      handleCloseDeleteDialog();
    }
  };

  // Nueva función para asociar factura existente al turno
  const asociarFacturaATurno = async (facturaId: string) => {
    // Aquí deberías hacer el request para asociar la factura al turno
    // Por ejemplo, PUT /turnos/{turnoId} body: { factura: facturaId }
    // Como no tenemos el id del turno aquí, deberías pasarlo por props si es necesario
    // Por ahora, solo llamo onSuccess con el id de la factura
    onSuccess({ factura: facturaId });
  };

  // Manejo del submit (update o creación)
  const handleSubmit = async () => {
    if (!validateAll()) {
      console.log('Errores en la validación:', errors);
      return;
    }
    try {
      const nroFactura = data.nroComprobante;
      const puntoDeVenta = data.nroPuntoVenta;
      const tipoFacturaId = data.tipoFactura?.id;
      const cuitEmisor = cuitEmpresa;

      // 1. Buscar si existe la factura
      setPendingSubmit(true);
      const response = await fetch(`${backendURL}/facturas`, {
        method: 'GET',
        headers,
      });
      if (!response.ok) throw new Error('Error al buscar facturas');
      const facturas = await response.json();
      // Buscar coincidencia usando los campos correctos
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
      console.log('Payload a enviar a /facturas/crear-factura:', payload);
      const createResponse = await fetch(`${backendURL}/facturas/crear-factura`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });
      if (!createResponse.ok) throw new Error(await createResponse.text());
      const facturaCreada = await createResponse.json();
      // Asociar la factura creada al turno (esto depende de tu backend, aquí solo llamo onSuccess)
      onSuccess({ factura: facturaCreada.id });
      setPendingSubmit(false);
    } catch (error) {
      setPendingSubmit(false);
      console.error('Error al procesar la factura:', error);
    }
  };

  const handleNroPuntoVentaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 4);
    setData((prev: any) => ({ ...prev, nroPuntoVenta: value }));
    rules.nroPuntoVenta && rules.nroPuntoVenta(value);
  };

  const handleNroComprobanteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 8);
    setData((prev: any) => ({ ...prev, nroComprobante: value }));
    rules.nroComprobante && rules.nroComprobante(value);
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
          label="Nro Punto de Venta"
          type="text"
          value={data.nroPuntoVenta}
          onChange={handleNroPuntoVentaChange}
          error={!!errors.nroPuntoVenta}
          helperText={errors.nroPuntoVenta}
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
          label="Nro Comprobante"
          type="text"
          value={data.nroComprobante}
          onChange={handleNroComprobanteChange}
          error={!!errors.nroComprobante}
          helperText={errors.nroComprobante}
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
          <Button onClick={handleCloseDeleteDialog} variant="text">
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
