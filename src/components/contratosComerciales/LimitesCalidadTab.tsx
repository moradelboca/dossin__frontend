import React, { useState, useEffect, useContext } from 'react';
import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Typography,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Checkbox,
  FormControlLabel,
  CircularProgress,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { ContextoGeneral } from '../Contexto';
import {
  getLimitesContractuales,
  createLimiteContractual,
  updateLimiteContractual,
  deleteLimiteContractual,
} from '../../lib/parametros-calidad-api';
import { getParametrosCalidad } from '../../lib/parametros-calidad-api';
import type {
  LimiteContractual,
  LimiteContractualCreate,
  ParametroCalidad,
  TipoLimite,
  TipoCalculo,
} from '../../types/parametros-calidad';

interface LimitesCalidadTabProps {
  idContrato: number | null;
}

export const LimitesCalidadTab: React.FC<LimitesCalidadTabProps> = ({ idContrato }) => {
  const { theme } = useContext(ContextoGeneral);
  const [limites, setLimites] = useState<LimiteContractual[]>([]);
  const [parametros, setParametros] = useState<ParametroCalidad[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingLimite, setEditingLimite] = useState<LimiteContractual | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [idParametroCalidad, setIdParametroCalidad] = useState<number>(0);
  const [valorLimite, setValorLimite] = useState<number | ''>('');
  const [tipoLimite, setTipoLimite] = useState<TipoLimite>('maximo');
  const [tipoCalculo, setTipoCalculo] = useState<TipoCalculo>('porcentual');
  const [valorPenalizacion, setValorPenalizacion] = useState<number | ''>('');
  const [aplicaBonificacion, setAplicaBonificacion] = useState(false);
  const [detalleCalculo, setDetalleCalculo] = useState('');
  const [observaciones, setObservaciones] = useState('');

  const azulStyles = {
    '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: theme.colores.azul,
    },
    '& .MuiInputLabel-root.Mui-focused': {
      color: theme.colores.azul,
    },
  };

  useEffect(() => {
    if (idContrato) {
      loadLimites();
      loadParametros();
    }
  }, [idContrato]);

  const loadLimites = async () => {
    if (!idContrato) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getLimitesContractuales(idContrato);
      setLimites(data);
    } catch (err) {
      setError('Error al cargar los límites contractuales');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadParametros = async () => {
    try {
      const data = await getParametrosCalidad();
      setParametros(data);
    } catch (err) {
      console.error('Error loading parámetros:', err);
    }
  };

  const handleOpenDialog = (limite?: LimiteContractual) => {
    if (limite) {
      setEditingLimite(limite);
      setIdParametroCalidad(limite.idParametroCalidad);
      setValorLimite(limite.valorLimite);
      setTipoLimite(limite.tipoLimite);
      setTipoCalculo(limite.tipoCalculo);
      setValorPenalizacion(limite.valorPenalizacion || '');
      setAplicaBonificacion(limite.aplicaBonificacion);
      setDetalleCalculo(limite.detalleCalculo || '');
      setObservaciones(limite.observaciones || '');
    } else {
      setEditingLimite(null);
      setIdParametroCalidad(0);
      setValorLimite('');
      setTipoLimite('maximo');
      setTipoCalculo('porcentual');
      setValorPenalizacion('');
      setAplicaBonificacion(false);
      setDetalleCalculo('');
      setObservaciones('');
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingLimite(null);
    setError(null);
  };

  const validateForm = (): boolean => {
    if (!idParametroCalidad) {
      setError('Debe seleccionar un parámetro de calidad');
      return false;
    }
    if (valorLimite === '' || isNaN(Number(valorLimite))) {
      setError('El valor límite es requerido y debe ser un número');
      return false;
    }
    if (tipoCalculo !== 'escalonado' && (valorPenalizacion === '' || isNaN(Number(valorPenalizacion)))) {
      setError('El valor de penalización es requerido para este tipo de cálculo');
      return false;
    }
    if (tipoCalculo === 'escalonado' && !detalleCalculo.trim()) {
      setError('El detalle de cálculo es requerido para cálculos escalonados');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm() || !idContrato) return;

    setLoading(true);
    setError(null);
    try {
      const limiteData: LimiteContractualCreate = {
        idParametroCalidad,
        valorLimite: Number(valorLimite),
        tipoLimite,
        tipoCalculo,
        valorPenalizacion: tipoCalculo === 'escalonado' ? null : Number(valorPenalizacion),
        aplicaBonificacion,
        detalleCalculo: tipoCalculo === 'escalonado' ? detalleCalculo.trim() : null,
        observaciones: observaciones.trim() || undefined,
      };

      if (editingLimite) {
        const success = await updateLimiteContractual(idContrato, editingLimite.id, limiteData);
        if (success) {
          await loadLimites();
          handleCloseDialog();
        } else {
          setError('Error al actualizar el límite');
        }
      } else {
        const newLimite = await createLimiteContractual(idContrato, limiteData);
        if (newLimite) {
          await loadLimites();
          handleCloseDialog();
        } else {
          setError('Error al crear el límite');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Error al guardar el límite');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (idLimite: number) => {
    if (!idContrato) return;
    const limite = limites.find(l => l.id === idLimite);
    if (!limite) return;

    const mensaje = `¿Está seguro de que desea eliminar el límite para "${limite.parametroCalidad?.nombre || 'este parámetro'}"?`;

    if (!confirm(mensaje)) {
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const success = await deleteLimiteContractual(idContrato, idLimite);
      if (success) {
        await loadLimites();
      } else {
        setError('Error al eliminar el límite');
      }
    } catch (err) {
      setError('Error al eliminar el límite');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getTipoLimiteLabel = (tipo: TipoLimite): string => {
    const labels = {
      maximo: 'Máximo',
      minimo: 'Mínimo',
      exacto: 'Exacto',
    };
    return labels[tipo] || tipo;
  };

  const getTipoCalculoLabel = (tipo: TipoCalculo): string => {
    const labels = {
      fijo: 'Fijo',
      porcentual: 'Porcentual',
      escalonado: 'Escalonado',
    };
    return labels[tipo] || tipo;
  };

  if (!idContrato) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="info">
          Guarde el contrato primero para poder configurar límites de calidad.
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Límites de Calidad</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          sx={{
            backgroundColor: theme.colores.azul,
            '&:hover': {
              backgroundColor: theme.colores.azulOscuro || '#163660',
            },
          }}
        >
          Agregar Límite
        </Button>
      </Box>

      {error && !dialogOpen && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading && !dialogOpen ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Parámetro</strong></TableCell>
                <TableCell><strong>Valor Límite</strong></TableCell>
                <TableCell><strong>Tipo Límite</strong></TableCell>
                <TableCell><strong>Tipo Cálculo</strong></TableCell>
                <TableCell><strong>Valor Penalización</strong></TableCell>
                <TableCell><strong>Bonificación</strong></TableCell>
                <TableCell align="right"><strong>Acciones</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {limites.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography color="text.secondary">
                      No hay límites configurados. Haga clic en "Agregar Límite" para crear uno.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                limites.map((limite) => (
                  <TableRow key={limite.id}>
                    <TableCell>{limite.parametroCalidad?.nombre || `ID: ${limite.idParametroCalidad}`}</TableCell>
                    <TableCell>{limite.valorLimite}</TableCell>
                    <TableCell>{getTipoLimiteLabel(limite.tipoLimite)}</TableCell>
                    <TableCell>{getTipoCalculoLabel(limite.tipoCalculo)}</TableCell>
                    <TableCell>
                      {limite.tipoCalculo === 'escalonado' ? 'Escalonado' : limite.valorPenalizacion}
                    </TableCell>
                    <TableCell>{limite.aplicaBonificacion ? 'Sí' : 'No'}</TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog(limite)}
                        sx={{ color: theme.colores.azul }}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(limite.id)}
                        sx={{ color: 'error.main' }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Dialog for Add/Edit */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingLimite ? 'Editar Límite Contractual' : 'Agregar Límite Contractual'}
        </DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <FormControl fullWidth required sx={azulStyles}>
              <InputLabel>Parámetro de Calidad</InputLabel>
              <Select
                value={idParametroCalidad}
                label="Parámetro de Calidad"
                onChange={(e) => setIdParametroCalidad(e.target.value as number)}
                disabled={!!editingLimite}
              >
                {parametros.map((param) => (
                  <MenuItem key={param.id} value={param.id}>
                    {param.nombre} ({param.unidadMedida})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Valor Límite"
              type="number"
              value={valorLimite}
              onChange={(e) => {
                const val = e.target.value;
                if (val === '' || (!isNaN(Number(val)) && Number(val) >= 0)) {
                  setValorLimite(val === '' ? '' : Number(val));
                }
              }}
              required
              sx={azulStyles}
            />

            <FormControl fullWidth required sx={azulStyles}>
              <InputLabel>Tipo de Límite</InputLabel>
              <Select
                value={tipoLimite}
                label="Tipo de Límite"
                onChange={(e) => setTipoLimite(e.target.value as TipoLimite)}
              >
                <MenuItem value="maximo">Máximo</MenuItem>
                <MenuItem value="minimo">Mínimo</MenuItem>
                <MenuItem value="exacto">Exacto</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth required sx={azulStyles}>
              <InputLabel>Tipo de Cálculo</InputLabel>
              <Select
                value={tipoCalculo}
                label="Tipo de Cálculo"
                onChange={(e) => {
                  setTipoCalculo(e.target.value as TipoCalculo);
                  if (e.target.value === 'escalonado') {
                    setValorPenalizacion('');
                  }
                }}
              >
                <MenuItem value="fijo">Fijo</MenuItem>
                <MenuItem value="porcentual">Porcentual</MenuItem>
                <MenuItem value="escalonado">Escalonado</MenuItem>
              </Select>
            </FormControl>

            {tipoCalculo !== 'escalonado' && (
              <TextField
                fullWidth
                label={`Valor Penalización${tipoCalculo === 'porcentual' ? ' (%)' : ' ($)'}`}
                type="number"
                value={valorPenalizacion}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === '' || (!isNaN(Number(val)) && Number(val) >= 0)) {
                    setValorPenalizacion(val === '' ? '' : Number(val));
                  }
                }}
                required
                sx={azulStyles}
              />
            )}

            {tipoCalculo === 'escalonado' && (
              <TextField
                fullWidth
                label="Detalle de Cálculo (JSON)"
                value={detalleCalculo}
                onChange={(e) => setDetalleCalculo(e.target.value)}
                multiline
                rows={6}
                required
                helperText='Ingrese un array JSON con los escalones. Ejemplo: [{"desde": 0.0, "hasta": 0.5, "valor": 1.0, "esPorcentual": true}]'
                sx={azulStyles}
              />
            )}

            <FormControlLabel
              control={
                <Checkbox
                  checked={aplicaBonificacion}
                  onChange={(e) => setAplicaBonificacion(e.target.checked)}
                  sx={{
                    color: theme.colores.azul,
                    '&.Mui-checked': {
                      color: theme.colores.azul,
                    },
                  }}
                />
              }
              label="Aplica Bonificación (en lugar de penalización)"
            />

            <TextField
              fullWidth
              label="Observaciones"
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              multiline
              rows={2}
              sx={azulStyles}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={handleCloseDialog} 
            disabled={loading}
            sx={{ color: theme.colores.azul }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            variant="contained"
            disabled={loading}
            sx={{
              backgroundColor: theme.colores.azul,
              '&:hover': {
                backgroundColor: theme.colores.azulOscuro || '#163660',
              },
            }}
          >
            {loading ? <CircularProgress size={20} /> : 'Guardar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

