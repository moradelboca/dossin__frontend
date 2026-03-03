import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  Autocomplete,
  Card,
  CardContent,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { useModificacionesTurno } from '../../../hooks/turnos/useModificacionesTurno';
import MainButton from '../../../botones/MainButtom';
import { useContext } from 'react';
import { ContextoGeneral } from '../../../Contexto';
import type { ModificacionTurnoCreate } from '../../../../types/turnos';

interface ModificacionesTurnoFormProps {
  turnoId: string | number;
  modificacionesIniciales?: any[];
  onSuccess?: () => void;
  onCancel?: () => void;
}

const ModificacionesTurnoForm: React.FC<ModificacionesTurnoFormProps> = ({
  turnoId,
  modificacionesIniciales,
  onSuccess,
  onCancel,
}) => {
  const { theme } = useContext(ContextoGeneral);

  const {
    modificaciones,
    tiposModificacion,
    loading,
    error,
    agregarModificacion,
    eliminarModificacion,
  } = useModificacionesTurno(turnoId, modificacionesIniciales);

  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [tipoSeleccionado, setTipoSeleccionado] = useState<any>(null);
  const [descripcion, setDescripcion] = useState('');
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [modificacionAEliminar, setModificacionAEliminar] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleAgregarModificacion = async () => {
    if (!tipoSeleccionado) {
      return;
    }

    setSubmitting(true);
    try {
      const nuevaModificacion: ModificacionTurnoCreate = {
        idTipoModificacion: tipoSeleccionado.id,
        descripcion: descripcion.trim() || undefined,
      };

      await agregarModificacion(nuevaModificacion);
      setTipoSeleccionado(null);
      setDescripcion('');
      setOpenAddDialog(false);
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      console.error('Error al agregar modificación:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEliminarClick = (modificacion: any) => {
    setModificacionAEliminar(modificacion);
    setOpenDeleteDialog(true);
  };

  const handleConfirmarEliminar = async () => {
    if (!modificacionAEliminar) return;

    try {
      await eliminarModificacion(modificacionAEliminar.id);
      setOpenDeleteDialog(false);
      setModificacionAEliminar(null);
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      console.error('Error al eliminar modificación:', err);
    }
  };

  return (
    <Box p={2}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2,
        }}
      >
        <Typography variant="h6">Modificaciones del Turno</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenAddDialog(true)}
          sx={{
            backgroundColor: theme.colores.azul,
            '&:hover': {
              backgroundColor: theme.colores.azulOscuro,
            },
          }}
        >
          Agregar Modificación
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading && modificaciones.length === 0 ? (
        <Box display="flex" justifyContent="center" p={3}>
          <CircularProgress />
        </Box>
      ) : modificaciones.length === 0 ? (
        <Box
          sx={{
            textAlign: 'center',
            p: 3,
            color: 'text.secondary',
          }}
        >
          <Typography variant="body2">
            No hay modificaciones registradas para este turno.
          </Typography>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {modificaciones.map((modificacion) => (
            <Card key={modificacion.id} variant="outlined">
              <CardContent>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                  }}
                >
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle1" fontWeight="medium">
                      {modificacion.tipoModificacion?.nombre || 'Tipo desconocido'}
                    </Typography>
                    {modificacion.descripcion && (
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        {modificacion.descripcion}
                      </Typography>
                    )}
                    {modificacion.fechaCreacion && (
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                        Creada: {new Date(modificacion.fechaCreacion).toLocaleDateString()}
                      </Typography>
                    )}
                  </Box>
                  <IconButton
                    color="error"
                    onClick={() => handleEliminarClick(modificacion)}
                    size="small"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      {/* Diálogo para agregar modificación */}
      <Dialog
        open={openAddDialog}
        onClose={() => {
          setOpenAddDialog(false);
          setTipoSeleccionado(null);
          setDescripcion('');
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Agregar Modificación</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <Autocomplete
              options={tiposModificacion}
              getOptionLabel={(option) => option.nombre}
              value={tipoSeleccionado}
              onChange={(_, newValue) => setTipoSeleccionado(newValue)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Tipo de Modificación"
                  variant="outlined"
                  required
                  error={!tipoSeleccionado}
                  helperText={!tipoSeleccionado ? 'Seleccione un tipo de modificación' : ''}
                />
              )}
            />
            <TextField
              label="Descripción (opcional)"
              multiline
              rows={3}
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              variant="outlined"
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <MainButton
            onClick={() => {
              setOpenAddDialog(false);
              setTipoSeleccionado(null);
              setDescripcion('');
            }}
            text="Cancelar"
            backgroundColor="transparent"
            textColor={theme.colores.azul}
            borderRadius="8px"
            hoverBackgroundColor="rgba(22, 54, 96, 0.1)"
          />
          <MainButton
            onClick={handleAgregarModificacion}
            text={submitting ? 'Guardando...' : 'Guardar'}
            backgroundColor={theme.colores.azul}
            textColor="#fff"
            borderRadius="8px"
            hoverBackgroundColor={theme.colores.azulOscuro}
            disabled={!tipoSeleccionado || submitting}
          />
        </DialogActions>
      </Dialog>

      {/* Diálogo de confirmación para eliminar */}
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle>Eliminar Modificación</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Está seguro que desea eliminar esta modificación? Esta acción no se puede deshacer.
          </Typography>
        </DialogContent>
        <DialogActions>
          <MainButton
            onClick={() => setOpenDeleteDialog(false)}
            text="Cancelar"
            backgroundColor="transparent"
            textColor={theme.colores.azul}
            borderRadius="8px"
            hoverBackgroundColor="rgba(22, 54, 96, 0.1)"
          />
          <MainButton
            onClick={handleConfirmarEliminar}
            text="Eliminar"
            backgroundColor="#d32f2f"
            textColor="#fff"
            borderRadius="8px"
            hoverBackgroundColor="#b71c1c"
          />
        </DialogActions>
      </Dialog>

      {onCancel && (
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <MainButton
            onClick={onCancel}
            text="Cerrar"
            backgroundColor="transparent"
            textColor={theme.colores.azul}
            borderRadius="8px"
            hoverBackgroundColor="rgba(22, 54, 96, 0.1)"
          />
        </Box>
      )}
    </Box>
  );
};

export default ModificacionesTurnoForm;
