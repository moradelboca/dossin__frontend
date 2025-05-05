import {
  Autocomplete,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import React, { useContext, useEffect, useState } from 'react';
import { ContextoGeneral } from '../../../Contexto';
import useFacturaHandler from '../../../hooks/turnos/useFacturaHandler';
import useValidation from '../../../hooks/useValidation';

interface TipoFactura {
  id: number;
  nombre: string;
}

interface Turno {
  id: string;
  nombre?: string;
  factura?: any;
  empresa?: {
    cuit: number | string;
  };
}

interface Factura {
  id?: string;
  tipoFactura?: TipoFactura;
  fecha?: string;
  valorIva?: number;
  total?: number;
  // En update se espera que la factura tenga un array de IDs de turnos asociados
  idTurnos?: (string | number)[];
  nroPuntoVenta?: string;
  nroComprobante?: string;
}

interface FacturaFormProps {
  turnoId: string;
  cuitEmpresa: number | string;
  initialFactura?: Factura | null;
  onSuccess: (updatedData: any) => void;
  onCancel: () => void;
}

const FacturaForm: React.FC<FacturaFormProps> = ({
  turnoId,
  cuitEmpresa,
  initialFactura,
  onSuccess,
  onCancel,
}) => {
  const { backendURL } = useContext(ContextoGeneral);
  const isUpdateMode = Boolean(initialFactura);
  const {theme} = useContext(ContextoGeneral);

  // Estados para opciones (tipos de factura y, en creación, turnos disponibles)
  const [tiposFacturaOptions, setTiposFacturaOptions] = useState<TipoFactura[]>([]);
  const [turnosDisponibles, setTurnosDisponibles] = useState<Turno[]>([]);
  // Estado para el diálogo de eliminación
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Configuramos el estado inicial.
  // En update mode se autocompletan todos los campos, incluido el listado de turnos (a partir de initialFactura.idTurnos).
  const initialData = isUpdateMode
    ? {
        tipoFactura: initialFactura?.tipoFactura || null,
        fecha: initialFactura?.fecha || '',
        // Aunque se muestran IVA y total sin IVA, en update solo se podrán modificar los campos:
        // - IVA (como valor seleccionado) y total (ya calculado o ingresado)
        valorIva: initialFactura?.valorIva ?? 21,
        total: initialFactura?.total ?? '',
        ivaSeleccionado: initialFactura?.valorIva ?? 21,
        totalSinIva:
          initialFactura && initialFactura.total && initialFactura.valorIva
            ? Number(initialFactura.total) / (1 + Number(initialFactura.valorIva) / 100)
            : '',
        // Mapeamos el array idTurnos a objetos Turno para mostrarlos
        turnosSeleccionados: initialFactura?.idTurnos
          ? initialFactura.idTurnos.map((id: string | number) => ({
              id: String(id),
              nombre: `Turno ${id}`,
            }))
          : [],
        nroPuntoVenta: initialFactura?.nroPuntoVenta || '',
        nroComprobante: initialFactura?.nroComprobante || '',
      }
    : {
        tipoFactura: null as TipoFactura | null,
        fecha: '',
        turnosSeleccionados: [] as Turno[],
        nroPuntoVenta: '',
        nroComprobante: '',
        ivaSeleccionado: 21,
        totalSinIva: '',
      };

  // Reglas de validación.
  // En update mode se validan únicamente los campos editables.
  const rules = {
        ivaSeleccionado: (value: any) =>
          value === '' ? 'El IVA es obligatorio' : Number(value) < 0 ? 'Valor IVA inválido' : null,
        tipoFactura: (value: TipoFactura | null) =>
          value ? null : 'El tipo de factura es obligatorio',
        fecha: (value: string) => (value ? null : 'La fecha es obligatoria'),
        turnosSeleccionados: (value: Turno[]) =>
          value && value.length > 0 ? null : 'Debe seleccionar al menos un turno',
        nroPuntoVenta: (value: string) =>
          value ? null : 'El número de punto de venta es obligatorio',
        nroComprobante: (value: string) =>
          value ? null : 'El número de comprobante es obligatorio',
        totalSinIva: (value: any) =>
          value === ''
            ? 'El total sin IVA es obligatorio'
            : Number(value) < 0
            ? 'El total sin IVA no puede ser negativo'
            : null,
      };

  const { data, errors, handleChange, validateAll, setData } = useValidation(initialData, rules);
  const { handleFacturaSubmission } = useFacturaHandler();
  const headers = {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
  };

  // Cargar tipos de factura (para creación)
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

  // Obtener turnos disponibles solo en modo creación
  useEffect(() => {
    if (!isUpdateMode) {
      const fetchTurnos = async () => {
        try {
          const response = await fetch(`${backendURL}/turnos`, { method: 'GET', headers });
          if (!response.ok) throw new Error('Error al obtener los turnos');
          const data = await response.json();
          const disponibles = data.turnos.filter(
            (turno: Turno) =>
              turno.factura === null &&
              String(turno.empresa?.cuit) === String(cuitEmpresa)
          );
          setTurnosDisponibles(disponibles);
        } catch (error) {
          console.error(error);
        }
      };
      fetchTurnos();
    }
  }, [backendURL, isUpdateMode, cuitEmpresa]);

  // Actualizar el estado en update mode si cambia initialFactura
  useEffect(() => {
    if (initialFactura && isUpdateMode) {
      setData({
        tipoFactura: initialFactura.tipoFactura || null,
        fecha: initialFactura.fecha || '',
        valorIva: initialFactura.valorIva ?? 21,
        total: initialFactura.total ?? '',
        ivaSeleccionado: initialFactura.valorIva ?? 21,
        totalSinIva:
          initialFactura.total && initialFactura.valorIva
            ? Number(initialFactura.total) / (1 + Number(initialFactura.valorIva) / 100)
            : '',
        turnosSeleccionados: initialFactura.idTurnos
          ? initialFactura.idTurnos.map((id: string | number) => ({
              id: String(id),
              nombre: `Turno ${id}`,
            }))
          : [],
        nroPuntoVenta: initialFactura.nroPuntoVenta || '',
        nroComprobante: initialFactura.nroComprobante || '',
      });
    }
  }, [initialFactura, isUpdateMode, setData]);

  // En modo creación se calcula el total con IVA a partir de totalSinIva e ivaSeleccionado.
  const computedTotal =
    !isUpdateMode && data.totalSinIva !== ''
      ? Number(data.totalSinIva) +
        Number(data.totalSinIva) * (Number(data.ivaSeleccionado) / 100)
      : '';

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
      // Notificamos al padre; en este caso onSuccess podría actualizar el listado
      onSuccess(null);
      handleCloseDeleteDialog();
    } catch (error) {
      console.error('Error al borrar la factura:', error);
      handleCloseDeleteDialog();
    }
  };

  // Manejo del submit (update o creación)
  const handleSubmit = async () => {
    if (!validateAll()) {
      console.log('Errores en la validación:', errors);
      return;
    }
    try {
      if (isUpdateMode) {
        // En update mode se envían solo los campos editables
        const payload = {
          idFactura: initialFactura?.id,
          fecha: data.fecha,
          valorIva: Number(data.ivaSeleccionado),
          total: Number(computedTotal) || Number(data.total),
        };
        const result = await handleFacturaSubmission(cuitEmpresa, payload);
        onSuccess(result);
      } else {
        const nroFactura = `${data.nroPuntoVenta}-${data.nroComprobante}`;
        const payload = {
          idsTurnos: data.turnosSeleccionados.map((turno: Turno) => turno.id),
          nroFactura,
          tipoFactura: data.tipoFactura?.id,
          fecha: data.fecha,
          valorIva: data.ivaSeleccionado,
          total: Number(computedTotal),
        };
        const result = await handleFacturaSubmission(cuitEmpresa, payload);
        onSuccess(result);
      }
    } catch (error) {
      console.error('Error al procesar la factura:', error);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
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
          />
        )}
        disabled={isUpdateMode}
      />

      {/* Fecha */}
      <TextField
        label="Fecha"
        type="date"
        value={data.fecha}
        onChange={handleChange('fecha')}
        error={!!errors.fecha}
        helperText={errors.fecha}
        InputLabelProps={{ shrink: true }}
      />

      {isUpdateMode ? (
        <>
          {/* En update mode se muestran campos para IVA y Total sin IVA, editables */}
          <TextField
            select
            label="Valor IVA"
            value={data.ivaSeleccionado}
            onChange={(e) =>
              setData((prev: any) => ({ ...prev, ivaSeleccionado: Number(e.target.value) }))
            }
          >
            {[21, 10.5].map((option) => (
              <MenuItem key={option} value={option}>
                {option} %
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Total sin IVA"
            type="number"
            value={data.totalSinIva}
            onChange={handleChange('totalSinIva')}
            error={!!errors.totalSinIva}
            helperText={errors.totalSinIva}
          />

          <Typography variant="subtitle1">
            Total: {computedTotal !== '' ? computedTotal : '0'}
          </Typography>
        </>
      ) : (
        <>
          <Autocomplete
            multiple
            limitTags={2}
            id="turnos-autocomplete"
            options={turnosDisponibles}
            getOptionLabel={(option: Turno) => option.nombre || option.id.toString()}
            value={
              initialFactura === null
                ? [{ id: turnoId, nombre: `${turnoId}` }, ...data.turnosSeleccionados.filter((t: Turno) => t.id !== turnoId)]
                : data.turnosSeleccionados
            }
            onChange={(_event, newValue) => {
              if (initialFactura === null) {
                // Siempre se mantiene el turnoId en la selección
                setData((prev: any) => ({
                  ...prev,
                  turnosSeleccionados: [{ id: turnoId, nombre: `Turno ${turnoId}` }, ...newValue.filter(t => t.id !== turnoId)],
                }));
              } else {
                setData((prev: any) => ({ ...prev, turnosSeleccionados: newValue }));
              }
            }}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            disableClearable={initialFactura === null}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Turnos"
                placeholder="Selecciona turnos"
                error={!!errors.turnosSeleccionados}
                helperText={errors.turnosSeleccionados}
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {turnosDisponibles.length === 0 && <CircularProgress size={20} />}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
          />

          <Stack direction="row" spacing={2}>
            <TextField
              label="Nro Punto de Venta"
              type="text"
              value={data.nroPuntoVenta}
              onChange={handleChange('nroPuntoVenta')}
              error={!!errors.nroPuntoVenta}
              helperText={errors.nroPuntoVenta}
            />
            <TextField
              label="Nro Comprobante"
              type="text"
              value={data.nroComprobante}
              onChange={handleChange('nroComprobante')}
              error={!!errors.nroComprobante}
              helperText={errors.nroComprobante}
            />
          </Stack>

          <TextField
            select
            label="Valor IVA"
            value={data.ivaSeleccionado}
            onChange={(e) =>
              setData((prev: any) => ({ ...prev, ivaSeleccionado: Number(e.target.value) }))
            }
          >
            {[21, 10.5].map((option) => (
              <MenuItem key={option} value={option}>
                {option} %
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Total sin IVA"
            type="number"
            value={data.totalSinIva}
            onChange={handleChange('totalSinIva')}
            error={!!errors.totalSinIva}
            helperText={errors.totalSinIva}
          />

          <Typography variant="subtitle1">
            Total: {computedTotal !== '' ? computedTotal : '0'}
          </Typography>
        </>
      )}

      <Stack direction="row" spacing={2} justifyContent="flex-end">
        <Button onClick={onCancel} color="error" >Cancelar</Button>
        <Button onClick={handleSubmit} sx={{color:theme.colores.azul}} >
          {isUpdateMode ? 'Actualizar Factura' : 'Crear Factura'}
        </Button>
        {isUpdateMode && (
          <Button onClick={handleOpenDeleteDialog} color="error" >
            Eliminar Factura
          </Button>
        )}
      </Stack>

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
    </Box>
  );
};

export default FacturaForm;
