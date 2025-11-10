import React, { useState, useEffect, useContext } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  CircularProgress,
  Typography,
  Alert,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { ContextoGeneral } from '../Contexto';
import {
  getAtributos,
  getDatosExtraTurno,
  saveDatosExtraTurno,
} from '../../lib/datos-extra-turnos-api';
import type { MaestroAtributo } from '../../types/datos-extra';
import { parseValueByType } from '../../utils/stringUtils';

interface DatosExtraTurnoDialogProps {
  open: boolean;
  onClose: () => void;
  turno: any;
  refreshTurnos?: () => void;
}

export const DatosExtraTurnoDialog: React.FC<DatosExtraTurnoDialogProps> = ({
  open,
  onClose,
  turno,
  refreshTurnos,
}) => {
  const { theme } = useContext(ContextoGeneral);
  
  const [atributos, setAtributos] = useState<MaestroAtributo[]>([]);
  const [valores, setValores] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const azulStyles = {
    '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: theme.colores.azul,
    },
    '& .MuiInputLabel-root.Mui-focused': {
      color: theme.colores.azul,
    },
  };

  useEffect(() => {
    if (open && turno) {
      loadData();
    }
  }, [open, turno]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Load attribute definitions
      const atributosData = await getAtributos();
      setAtributos(atributosData);

      // Load existing datos extra for this turno
      const datosExtra = await getDatosExtraTurno(turno.id);
      
      if (datosExtra && datosExtra.datos) {
        // Convert all values to strings for form inputs
        const valoresStr: Record<string, string> = {};
        Object.keys(datosExtra.datos).forEach((key) => {
          valoresStr[key] = String(datosExtra.datos[key] || '');
        });
        setValores(valoresStr);
      } else {
        setValores({});
      }
    } catch (err) {
      setError('Error al cargar los datos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleValueChange = (nombreAtributo: string, value: string) => {
    setValores((prev) => ({
      ...prev,
      [nombreAtributo]: value,
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      // Parse values according to their types
      const datosTyped: Record<string, string | number> = {};
      atributos.forEach((atributo) => {
        const valorStr = valores[atributo.nombre_atributo];
        if (valorStr !== undefined && valorStr !== '') {
          datosTyped[atributo.nombre_atributo] = parseValueByType(valorStr, atributo.tipo_dato);
        }
      });

      // Get CTG and empresa from turno
      const ctg = turno.cartaDePorte?.CTG || turno.ctg;
      const empresa = turno.empresa?.razonSocial || turno.empresaTitularCartaDePorte;

      await saveDatosExtraTurno(turno.id, ctg, empresa, datosTyped);
      
      if (refreshTurnos) {
        refreshTurnos();
      }
      
      onClose();
    } catch (err) {
      setError('Error al guardar los datos');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const renderInput = (atributo: MaestroAtributo) => {
    const value = valores[atributo.nombre_atributo] || '';

    switch (atributo.tipo_dato) {
      case 'number':
        return (
          <TextField
            fullWidth
            type="number"
            label={atributo.nombre_atributo}
            value={value}
            onChange={(e) => handleValueChange(atributo.nombre_atributo, e.target.value)}
            sx={azulStyles}
          />
        );
      case 'date':
        return (
          <TextField
            fullWidth
            type="date"
            label={atributo.nombre_atributo}
            value={value}
            onChange={(e) => handleValueChange(atributo.nombre_atributo, e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={azulStyles}
          />
        );
      case 'text':
      default:
        return (
          <TextField
            fullWidth
            label={atributo.nombre_atributo}
            value={value}
            onChange={(e) => handleValueChange(atributo.nombre_atributo, e.target.value)}
            sx={azulStyles}
          />
        );
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Datos Extra del Turno</Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
        {turno && (
          <Typography variant="body2" color="text.secondary">
            CTG: {turno.cartaDePorte?.CTG || turno.ctg || 'N/A'}
            {' | '}
            Empresa: {turno.empresa?.razonSocial || turno.empresaTitularCartaDePorte || 'N/A'}
          </Typography>
        )}
      </DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : atributos.length === 0 ? (
          <Alert severity="info">
            No hay atributos definidos. Por favor, defina atributos en el "Maestro de turnos" primero.
          </Alert>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            {atributos.map((atributo) => (
              <Box key={atributo.id}>
                {renderInput(atributo)}
              </Box>
            ))}
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button 
          onClick={onClose} 
          disabled={saving}
          sx={{ color: theme.colores.azul }}
        >
          Cancelar
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={saving || loading || atributos.length === 0}
          sx={{
            backgroundColor: theme.colores.azul,
            '&:hover': {
              backgroundColor: theme.colores.azulOscuro || '#163660',
            },
          }}
        >
          {saving ? <CircularProgress size={20} /> : 'Guardar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

