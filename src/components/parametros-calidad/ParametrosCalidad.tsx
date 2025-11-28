import React, { useState, useEffect, useContext } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  CircularProgress,
  Typography,
  Alert,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { ContextoGeneral } from '../Contexto';
import {
  getParametrosCalidad,
  createParametroCalidad,
  updateParametroCalidad,
  deleteParametroCalidad,
} from '../../lib/parametros-calidad-api';
import type {
  ParametroCalidad,
  ParametroCalidadCreate,
} from '../../types/parametros-calidad';

export const ParametrosCalidad: React.FC = () => {
  const { theme } = useContext(ContextoGeneral);
  
  const [parametros, setParametros] = useState<ParametroCalidad[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingParametro, setEditingParametro] = useState<ParametroCalidad | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Form state
  const [nombre, setNombre] = useState('');
  const [unidadMedida, setUnidadMedida] = useState('');
  const [valorMinimo, setValorMinimo] = useState<number | ''>('');
  const [valorMaximo, setValorMaximo] = useState<number | ''>('');
  const [descripcion, setDescripcion] = useState('');

  const azulStyles = {
    '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: theme.colores.azul,
    },
    '& .MuiInputLabel-root.Mui-focused': {
      color: theme.colores.azul,
    },
  };

  useEffect(() => {
    loadParametros();
  }, []);

  const loadParametros = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getParametrosCalidad();
      setParametros(data);
    } catch (err: any) {
      if (err.message && err.message.includes('404')) {
        setError('Los endpoints de parámetros de calidad aún no están disponibles en el backend. Por favor, contacte al equipo de backend para implementarlos.');
      } else {
        setError('Error al cargar los parámetros de calidad');
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (parametro?: ParametroCalidad) => {
    if (parametro) {
      setEditingParametro(parametro);
      setNombre(parametro.nombre);
      setUnidadMedida(parametro.unidadMedida);
      setValorMinimo(parametro.valorMinimo);
      setValorMaximo(parametro.valorMaximo);
      setDescripcion(parametro.descripcion || '');
    } else {
      setEditingParametro(null);
      setNombre('');
      setUnidadMedida('');
      setValorMinimo('');
      setValorMaximo('');
      setDescripcion('');
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingParametro(null);
    setNombre('');
    setUnidadMedida('');
    setValorMinimo('');
    setValorMaximo('');
    setDescripcion('');
    setError(null);
  };

  const validateForm = (): boolean => {
    if (!nombre.trim()) {
      setError('El nombre del parámetro es requerido');
      return false;
    }
    if (!unidadMedida.trim()) {
      setError('La unidad de medida es requerida');
      return false;
    }
    if (valorMinimo === '' || isNaN(Number(valorMinimo))) {
      setError('El valor mínimo es requerido y debe ser un número');
      return false;
    }
    if (valorMaximo === '' || isNaN(Number(valorMaximo))) {
      setError('El valor máximo es requerido y debe ser un número');
      return false;
    }
    if (Number(valorMinimo) >= Number(valorMaximo)) {
      setError('El valor mínimo debe ser menor que el valor máximo');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const parametroData: ParametroCalidadCreate = {
        nombre: nombre.trim(),
        unidadMedida: unidadMedida.trim(),
        valorMinimo: Number(valorMinimo),
        valorMaximo: Number(valorMaximo),
        descripcion: descripcion.trim() || undefined,
      };

      if (editingParametro) {
        // Update
        const success = await updateParametroCalidad(editingParametro.id, parametroData);
        if (success) {
          await loadParametros();
          handleCloseDialog();
        } else {
          setError('Error al actualizar el parámetro');
        }
      } else {
        // Create
        const newParametro = await createParametroCalidad(parametroData);
        if (newParametro) {
          await loadParametros();
          handleCloseDialog();
        } else {
          setError('Error al crear el parámetro');
        }
      }
    } catch (err: any) {
      if (err.message && err.message.includes('duplicate')) {
        setError('Ya existe un parámetro con ese nombre');
      } else {
        setError('Error al guardar el parámetro');
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    const parametro = parametros.find(p => p.id === id);
    if (!parametro) return;

    const mensaje = `¿Está seguro de que desea eliminar el parámetro "${parametro.nombre}"?\n\n` +
      `Se realizará un borrado lógico (el parámetro se ocultará pero los datos históricos se conservarán).`;

    if (!confirm(mensaje)) {
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const success = await deleteParametroCalidad(id);
      if (success) {
        await loadParametros();
      } else {
        setError('Error al eliminar el parámetro');
      }
    } catch (err) {
      setError('Error al eliminar el parámetro');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Parámetros de Calidad del Grano</Typography>
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
          Agregar Parámetro
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
                <TableCell><strong>Nombre</strong></TableCell>
                <TableCell><strong>Unidad de Medida</strong></TableCell>
                <TableCell><strong>Rango</strong></TableCell>
                <TableCell><strong>Descripción</strong></TableCell>
                <TableCell align="right"><strong>Acciones</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {parametros.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <Typography color="text.secondary">
                      No hay parámetros definidos. Haga clic en "Agregar Parámetro" para crear uno.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                parametros.map((parametro) => (
                  <TableRow key={parametro.id}>
                    <TableCell>{parametro.nombre}</TableCell>
                    <TableCell>{parametro.unidadMedida}</TableCell>
                    <TableCell>
                      {parametro.valorMinimo} - {parametro.valorMaximo} {parametro.unidadMedida}
                    </TableCell>
                    <TableCell>{parametro.descripcion || '-'}</TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog(parametro)}
                        sx={{ color: theme.colores.azul }}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(parametro.id)}
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
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingParametro ? 'Editar Parámetro de Calidad' : 'Agregar Parámetro de Calidad'}
        </DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              fullWidth
              label="Nombre del Parámetro"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: Humedad, Cuerpos Extraños, Proteína"
              required
              sx={azulStyles}
            />
            <TextField
              fullWidth
              label="Unidad de Medida"
              value={unidadMedida}
              onChange={(e) => setUnidadMedida(e.target.value)}
              placeholder="Ej: %, g/kg, ppm"
              required
              sx={azulStyles}
            />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                fullWidth
                label="Valor Mínimo"
                type="number"
                value={valorMinimo}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === '' || (!isNaN(Number(val)) && Number(val) >= 0)) {
                    setValorMinimo(val === '' ? '' : Number(val));
                  }
                }}
                required
                sx={azulStyles}
              />
              <TextField
                fullWidth
                label="Valor Máximo"
                type="number"
                value={valorMaximo}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === '' || (!isNaN(Number(val)) && Number(val) >= 0)) {
                    setValorMaximo(val === '' ? '' : Number(val));
                  }
                }}
                required
                sx={azulStyles}
              />
            </Box>
            <TextField
              fullWidth
              label="Descripción"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Descripción opcional del parámetro"
              multiline
              rows={3}
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

