import React, { useState, useEffect, useContext } from 'react';
import {
  Box,
  TextField,
  Typography,
  Divider,
  FormControlLabel,
  Checkbox,
  Alert,
} from '@mui/material';
import { ContextoGeneral } from '../../../Contexto';
import { getParametrosCalidad } from '../../../../lib/parametros-calidad-api';
import type { ParametroCalidad } from '../../../../types/parametros-calidad';

interface MedicionesCalidadFormProps {
  etapaMedicion: 'carga' | 'descarga';
  mediciones: Record<number, number | ''>; // idParametro -> valorMedido
  onMedicionesChange: (mediciones: Record<number, number | ''>) => void;
  errors?: Record<string, string>;
}

export const MedicionesCalidadForm: React.FC<MedicionesCalidadFormProps> = ({
  etapaMedicion,
  mediciones,
  onMedicionesChange,
  errors = {},
}) => {
  const { theme } = useContext(ContextoGeneral);
  const [parametros, setParametros] = useState<ParametroCalidad[]>([]);
  const [loading, setLoading] = useState(false);
  const [parametrosSeleccionados, setParametrosSeleccionados] = useState<Set<number>>(new Set());

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
    try {
      const data = await getParametrosCalidad();
      setParametros(data);
      // Inicializar parámetros seleccionados con los que ya tienen valores
      const seleccionados = new Set<number>();
      Object.keys(mediciones).forEach(id => {
        if (mediciones[Number(id)] !== '') {
          seleccionados.add(Number(id));
        }
      });
      setParametrosSeleccionados(seleccionados);
    } catch (error) {
      console.error('Error loading parámetros:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleParametro = (idParametro: number) => {
    const nuevosSeleccionados = new Set(parametrosSeleccionados);
    if (nuevosSeleccionados.has(idParametro)) {
      nuevosSeleccionados.delete(idParametro);
      // Remover el valor de las mediciones
      const nuevasMediciones: Record<number, number | ''> = {};
      Object.keys(mediciones).forEach(key => {
        const numKey = Number(key);
        if (numKey !== idParametro) {
          nuevasMediciones[numKey] = mediciones[numKey];
        }
      });
      onMedicionesChange(nuevasMediciones);
    } else {
      nuevosSeleccionados.add(idParametro);
      // Agregar valor vacío
      const nuevasMediciones: Record<number, number | ''> = { ...mediciones, [idParametro]: '' };
      onMedicionesChange(nuevasMediciones);
    }
    setParametrosSeleccionados(nuevosSeleccionados);
  };

  const handleValorChange = (idParametro: number, valor: string) => {
    const nuevasMediciones = { ...mediciones };
    if (valor === '' || (!isNaN(Number(valor)) && Number(valor) >= 0)) {
      nuevasMediciones[idParametro] = valor === '' ? '' : Number(valor);
      onMedicionesChange(nuevasMediciones);
    }
  };

  const getParametroError = (idParametro: number): string | undefined => {
    const errorKey = `parametro_${idParametro}`;
    return errors[errorKey];
  };

  const validateValor = (idParametro: number, valor: number | ''): string | undefined => {
    if (valor === '') return undefined;
    const parametro = parametros.find(p => p.id === idParametro);
    if (!parametro) return undefined;
    const numValor = Number(valor);
    if (numValor < parametro.valorMinimo || numValor > parametro.valorMaximo) {
      return `El valor debe estar entre ${parametro.valorMinimo} y ${parametro.valorMaximo} ${parametro.unidadMedida}`;
    }
    return undefined;
  };

  if (loading) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography>Cargando parámetros...</Typography>
      </Box>
    );
  }

  if (parametros.length === 0) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="info">
          No hay parámetros de calidad configurados. Configure parámetros en la sección "Parámetros de Calidad".
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
      <Divider />
      <Typography variant="h6" sx={{ color: theme.colores.azul }}>
        Mediciones de Calidad - {etapaMedicion === 'carga' ? 'Carga' : 'Descarga'}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Seleccione los parámetros que desea medir en esta etapa. Los valores son opcionales.
      </Typography>

      {parametros.map((parametro) => (
        <Box key={parametro.id} sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={parametrosSeleccionados.has(parametro.id)}
                onChange={() => handleToggleParametro(parametro.id)}
                sx={{
                  color: theme.colores.azul,
                  '&.Mui-checked': {
                    color: theme.colores.azul,
                  },
                }}
              />
            }
            label={
              <Box>
                <Typography variant="body1" fontWeight="medium">
                  {parametro.nombre}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Rango válido: {parametro.valorMinimo} - {parametro.valorMaximo} {parametro.unidadMedida}
                  {parametro.descripcion && ` • ${parametro.descripcion}`}
                </Typography>
              </Box>
            }
          />
          {parametrosSeleccionados.has(parametro.id) && (
            <TextField
              label={`Valor medido (${parametro.unidadMedida})`}
              type="number"
              value={mediciones[parametro.id] ?? ''}
              onChange={(e) => handleValorChange(parametro.id, e.target.value)}
              error={!!getParametroError(parametro.id) || !!validateValor(parametro.id, mediciones[parametro.id] ?? '')}
              helperText={
                getParametroError(parametro.id) ||
                validateValor(parametro.id, mediciones[parametro.id] ?? '') ||
                `Ingrese un valor entre ${parametro.valorMinimo} y ${parametro.valorMaximo} ${parametro.unidadMedida}`
              }
              fullWidth
              sx={azulStyles}
              inputProps={{
                step: 'any',
                min: parametro.valorMinimo,
                max: parametro.valorMaximo,
              }}
            />
          )}
        </Box>
      ))}
    </Box>
  );
};


