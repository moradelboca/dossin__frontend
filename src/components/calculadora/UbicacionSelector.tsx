import { useState } from 'react';
import {
  Autocomplete,
  TextField,
  Box,
  Typography,
  Chip,
  Alert,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { ContextoGeneral } from '../Contexto';
import { useContext } from 'react';

interface Ubicacion {
  id: number;
  nombre: string;
  latitud: number;
  longitud: number;
  tipoUbicacion: {
    nombre: string;
    id: number;
  };
  localidad: {
    nombre: string;
    id: number;
    provincia: {
      nombre: string;
      id: number;
      pais: {
        nombre: string;
        id: number;
      };
    };
  };
}

interface UbicacionSelectorProps {
  ubicaciones: Ubicacion[];
  ubicacionSeleccionada: Ubicacion | null;
  onUbicacionChange: (ubicacion: Ubicacion | null) => void;
  label: string;
  tipoFiltro?: 'Carga' | 'Descarga' | 'Carga/Descarga';
  loading?: boolean;
  error?: string | null;
}

export function UbicacionSelector({
  ubicaciones,
  ubicacionSeleccionada,
  onUbicacionChange,
  label,
  tipoFiltro,
  loading = false,
  error = null,
}: UbicacionSelectorProps) {
  const { theme } = useContext(ContextoGeneral);
  const [inputValue, setInputValue] = useState('');

  // Filtrar ubicaciones por tipo
  const ubicacionesFiltradas = ubicaciones.filter((ubicacion) => {
    if (!tipoFiltro) return true;
    const nombreTipo = ubicacion.tipoUbicacion?.nombre;
    if (tipoFiltro === 'Carga/Descarga') {
      return nombreTipo === 'Carga/Descarga' || nombreTipo === 'Carga' || nombreTipo === 'Descarga';
    }
    return nombreTipo === tipoFiltro;
  });

  // Crear opciones para el autocompletar
  const opcionesUbicaciones = ubicacionesFiltradas.map(
    (ubicacion) =>
      `${ubicacion.nombre}, ${ubicacion.localidad.nombre}, ${ubicacion.localidad.provincia.nombre}`
  );

  // Opción especial para agregar ubicación
  const opciones = [...opcionesUbicaciones, "__add__"];

  // Manejar selección de ubicación
  const seleccionarUbicacion = (_event: any, seleccionado: string | null) => {
    if (seleccionado === "__add__") {
      // TODO: Implementar modal para agregar nueva ubicación
      console.log('Agregar nueva ubicación');
      return;
    }
    
    if (seleccionado) {
      const index = opcionesUbicaciones.indexOf(seleccionado);
      if (index !== -1) {
        const ubicacion = ubicacionesFiltradas[index];
        onUbicacionChange(ubicacion);
      }
    } else {
      onUbicacionChange(null);
    }
  };

  return (
    <Box>
      <Typography variant="subtitle2" sx={{ mb: 1, color: theme.colores.grisOscuro }}>
        {label}
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <Autocomplete
        disablePortal
        options={opciones}
        loading={loading}
        value={ubicacionSeleccionada ? 
          `${ubicacionSeleccionada.nombre}, ${ubicacionSeleccionada.localidad.nombre}, ${ubicacionSeleccionada.localidad.provincia.nombre}` 
          : null
        }
        inputValue={inputValue}
        onInputChange={(_, newInputValue) => setInputValue(newInputValue)}
        onChange={seleccionarUbicacion}
        sx={{
          width: '100%',
          '& .MuiAutocomplete-option': {
            fontWeight: 400,
          },
          '& .Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: theme.colores.azul,
          },
          '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: theme.colores.azul,
          },
        }}
        renderOption={(props, option) => {
          const { key, ...rest } = props;
          if (option === "__add__") {
            return (
              <li key={key} {...rest} style={{ 
                display: 'flex', 
                alignItems: 'center', 
                color: theme.colores.azul, 
                fontWeight: 600 
              }}>
                <AddIcon fontSize="small" style={{ marginRight: 8, color: theme.colores.azul }} />
                <span>Agregar una ubicación</span>
              </li>
            );
          }
          return <li key={key} {...rest}>{option}</li>;
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            label={label}
            variant="outlined"
            error={!!error}
            helperText={error ? 'Error al cargar ubicaciones' : `Selecciona una ubicación de ${tipoFiltro?.toLowerCase() || 'cualquier tipo'}`}
            sx={{
              '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: theme.colores.azul,
              },
              '& .MuiInputLabel-root.Mui-focused': {
                color: theme.colores.azul,
              },
            }}
          />
        )}
      />
      
      {ubicacionSeleccionada && (
        <Box sx={{ mt: 1 }}>
          <Chip
            label={`${ubicacionSeleccionada.latitud.toFixed(6)}, ${ubicacionSeleccionada.longitud.toFixed(6)}`}
            size="small"
            color="primary"
            variant="outlined"
          />
        </Box>
      )}
    </Box>
  );
}

