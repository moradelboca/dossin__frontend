import React, { useState, useEffect, useContext } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
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
  getAtributos,
  createAtributo,
  updateAtributo,
  deleteAtributo,
  checkAtributoEnUso,
} from '../../lib/datos-extra-turnos-api';
import type { MaestroAtributo, TipoDato } from '../../types/datos-extra';
import { toUpperCamelCase } from '../../utils/stringUtils';

export const MaestroAtributosTurnos: React.FC = () => {
  const { theme } = useContext(ContextoGeneral);
  
  const [atributos, setAtributos] = useState<MaestroAtributo[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAtributo, setEditingAtributo] = useState<MaestroAtributo | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Form state
  const [nombre, setNombre] = useState('');
  const [tipo, setTipo] = useState<TipoDato>('text');

  const azulStyles = {
    '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: theme.colores.azul,
    },
    '& .MuiInputLabel-root.Mui-focused': {
      color: theme.colores.azul,
    },
  };

  useEffect(() => {
    loadAtributos();
  }, []);

  const loadAtributos = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAtributos();
      setAtributos(data);
    } catch (err) {
      setError('Error al cargar los atributos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (atributo?: MaestroAtributo) => {
    if (atributo) {
      setEditingAtributo(atributo);
      setNombre(atributo.nombre_atributo);
      setTipo(atributo.tipo_dato);
    } else {
      setEditingAtributo(null);
      setNombre('');
      setTipo('text');
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingAtributo(null);
    setNombre('');
    setTipo('text');
    setError(null);
  };

  const handleSave = async () => {
    if (!nombre.trim()) {
      setError('El nombre del atributo es requerido');
      return;
    }

    // Convert to UpperCamelCase
    const nombreCamelCase = toUpperCamelCase(nombre);

    setLoading(true);
    setError(null);
    try {
      if (editingAtributo) {
        // Update
        const success = await updateAtributo(editingAtributo.id, {
          nombre_atributo: nombreCamelCase,
          tipo_dato: tipo,
        });
        if (success) {
          await loadAtributos();
          handleCloseDialog();
        } else {
          setError('Error al actualizar el atributo');
        }
      } else {
        // Create
        const newAtributo = await createAtributo({
          nombre_atributo: nombreCamelCase,
          tipo_dato: tipo,
        });
        if (newAtributo) {
          await loadAtributos();
          handleCloseDialog();
        } else {
          setError('Error al crear el atributo');
        }
      }
    } catch (err: any) {
      if (err.message && err.message.includes('duplicate')) {
        setError('Ya existe un atributo con ese nombre');
      } else {
        setError('Error al guardar el atributo');
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    const atributo = atributos.find(a => a.id === id);
    if (!atributo) return;

    // Check if attribute is being used in any turno
    let enUso = 0;
    try {
      enUso = await checkAtributoEnUso(atributo.nombre_atributo);
    } catch (err) {
      console.error('Error checking atributo usage:', err);
    }

    // Show informative message based on usage
    const mensaje = enUso > 0 
      ? `Este atributo está siendo usado en ${enUso} turno(s).\n\n` +
        `¿Desea continuar con el borrado lógico?\n\n` +
        `Los datos históricos se conservarán en los turnos existentes, pero el atributo ` +
        `ya no se mostrará en la interfaz ni estará disponible para nuevos turnos.`
      : `¿Está seguro de que desea eliminar el atributo "${atributo.nombre_atributo}"?\n\n` +
        `Se realizará un borrado lógico (el atributo se ocultará pero los datos se conservarán).`;

    if (!confirm(mensaje)) {
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const success = await deleteAtributo(id);
      if (success) {
        await loadAtributos();
      } else {
        setError('Error al eliminar el atributo');
      }
    } catch (err) {
      setError('Error al eliminar el atributo');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getTipoLabel = (tipo: TipoDato): string => {
    const labels = {
      text: 'Texto',
      number: 'Número',
      date: 'Fecha',
    };
    return labels[tipo] || tipo;
  };

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Maestro de Atributos de Turnos</Typography>
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
          Agregar Atributo
        </Button>
      </Box>

      {error && (
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
                <TableCell><strong>Nombre del Atributo</strong></TableCell>
                <TableCell><strong>Tipo de Dato</strong></TableCell>
                <TableCell align="right"><strong>Acciones</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {atributos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} align="center">
                    <Typography color="text.secondary">
                      No hay atributos definidos. Haga clic en "Agregar Atributo" para crear uno.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                atributos.map((atributo) => (
                  <TableRow key={atributo.id}>
                    <TableCell>{atributo.nombre_atributo}</TableCell>
                    <TableCell>{getTipoLabel(atributo.tipo_dato)}</TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog(atributo)}
                        sx={{ color: theme.colores.azul }}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(atributo.id)}
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
          {editingAtributo ? 'Editar Atributo' : 'Agregar Atributo'}
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
              label="Nombre del Atributo"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: customer name, order number"
              helperText="Se convertirá automáticamente a UpperCamelCase (CustomerName)"
              sx={azulStyles}
            />
            <FormControl fullWidth sx={azulStyles}>
              <InputLabel>Tipo de Dato</InputLabel>
              <Select
                value={tipo}
                label="Tipo de Dato"
                onChange={(e) => setTipo(e.target.value as TipoDato)}
              >
                <MenuItem value="text">Texto</MenuItem>
                <MenuItem value="number">Número</MenuItem>
                <MenuItem value="date">Fecha</MenuItem>
              </Select>
            </FormControl>
            {nombre && (
              <Typography variant="caption" color="text.secondary">
                Vista previa: <strong>{toUpperCamelCase(nombre)}</strong>
              </Typography>
            )}
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

