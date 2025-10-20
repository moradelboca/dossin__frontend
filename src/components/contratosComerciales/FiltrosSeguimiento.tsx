import React, { useState } from 'react';
import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  Typography,
  Button,
  Chip,
  useTheme,
  useMediaQuery,
  Collapse
} from '@mui/material';
import {
  FilterList as FilterIcon,
  Clear as ClearIcon,
  ExpandMore as ExpandMoreIcon
} from '@mui/icons-material';
import { FiltrosSeguimiento as FiltrosType } from '../../types/contratosComerciales';

interface FiltrosSeguimientoProps {
  filtros: FiltrosType;
  onFiltrosChange: (filtros: FiltrosType) => void;
  contratos: any[];
}

const FiltrosSeguimiento: React.FC<FiltrosSeguimientoProps> = ({
  filtros,
  onFiltrosChange,
  contratos
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [expanded, setExpanded] = useState(!isMobile);

  // Get unique values for filters
  const estados = [...new Set(contratos.map(c => c.estado))];
  const clientes = [...new Set([
    ...contratos.map(c => c.productorNombre).filter(Boolean),
    ...contratos.map(c => c.exportadorNombre).filter(Boolean)
  ])];

  // Calculate min/max kg values
  const kgValues = contratos.map(c => c.cantidadTotalKg).filter(kg => kg != null && !isNaN(kg));
  const minKg = kgValues.length > 0 ? Math.min(...kgValues) : 0;
  const maxKg = kgValues.length > 0 ? Math.max(...kgValues) : 100000;

  const handleEstadoChange = (event: any) => {
    onFiltrosChange({
      ...filtros,
      estado: event.target.value || undefined
    });
  };

  const handleClienteChange = (event: any) => {
    onFiltrosChange({
      ...filtros,
      cliente: event.target.value || undefined
    });
  };

  const handleKgRangeChange = (_event: Event, newValue: number | number[]) => {
    const [min, max] = newValue as number[];
    onFiltrosChange({
      ...filtros,
      kgMinimo: min,
      kgMaximo: max
    });
  };

  const handleFechaDesdeChange = (event: any) => {
    onFiltrosChange({
      ...filtros,
      fechaDesde: event.target.value || undefined
    });
  };

  const handleFechaHastaChange = (event: any) => {
    onFiltrosChange({
      ...filtros,
      fechaHasta: event.target.value || undefined
    });
  };

  const clearFiltros = () => {
    onFiltrosChange({});
  };

  const getActiveFiltersCount = (): number => {
    return Object.values(filtros).filter(value => value !== undefined && value !== '').length;
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <Box sx={{ mb: 3 }}>
      {/* Filter toggle button for mobile */}
      {isMobile && (
        <Button
          onClick={() => setExpanded(!expanded)}
          startIcon={<FilterIcon />}
          endIcon={<ExpandMoreIcon sx={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)' }} />}
          sx={{ mb: 2 }}
        >
          Filtros {activeFiltersCount > 0 && `(${activeFiltersCount})`}
        </Button>
      )}

      <Collapse in={expanded}>
        <Box
          sx={{
            p: 2,
            backgroundColor: theme?.palette?.background?.paper || '#fff',
            borderRadius: 2,
            border: `1px solid ${theme?.palette?.divider || '#e0e0e0'}`,
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            gap: 2,
            alignItems: isMobile ? 'stretch' : 'center',
            flexWrap: 'wrap'
          }}
        >
          {/* Estado filter */}
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Estado</InputLabel>
            <Select
              value={filtros.estado || ''}
              onChange={handleEstadoChange}
              label="Estado"
            >
              <MenuItem value="">Todos</MenuItem>
              {estados.map(estado => (
                <MenuItem key={estado} value={estado}>
                  {estado}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Cliente filter */}
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Cliente</InputLabel>
            <Select
              value={filtros.cliente || ''}
              onChange={handleClienteChange}
              label="Cliente"
            >
              <MenuItem value="">Todos</MenuItem>
              {clientes.map(cliente => (
                <MenuItem key={cliente} value={cliente}>
                  {cliente}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Kg range filter */}
          <Box sx={{ minWidth: 200, px: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Cantidad (kg)
            </Typography>
            <Slider
              value={[filtros.kgMinimo || minKg, filtros.kgMaximo || maxKg]}
              onChange={handleKgRangeChange}
              valueLabelDisplay="auto"
              min={minKg}
              max={maxKg}
              step={1000}
              valueLabelFormat={(value) => `${(value || 0).toLocaleString()} kg`}
              sx={{ mt: 1 }}
            />
          </Box>

          {/* Date filters */}
          <TextField
            size="small"
            type="date"
            label="Desde"
            value={filtros.fechaDesde || ''}
            onChange={handleFechaDesdeChange}
            InputLabelProps={{ shrink: true }}
            sx={{ minWidth: 150 }}
          />

          <TextField
            size="small"
            type="date"
            label="Hasta"
            value={filtros.fechaHasta || ''}
            onChange={handleFechaHastaChange}
            InputLabelProps={{ shrink: true }}
            sx={{ minWidth: 150 }}
          />

          {/* Clear filters button */}
          <Button
            onClick={clearFiltros}
            startIcon={<ClearIcon />}
            size="small"
            disabled={activeFiltersCount === 0}
            sx={{ ml: 'auto' }}
          >
            Limpiar
          </Button>
        </Box>

        {/* Active filters chips */}
        {activeFiltersCount > 0 && (
          <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {filtros.estado && (
              <Chip
                label={`Estado: ${filtros.estado}`}
                onDelete={() => onFiltrosChange({ ...filtros, estado: undefined })}
                size="small"
              />
            )}
            {filtros.cliente && (
              <Chip
                label={`Cliente: ${filtros.cliente}`}
                onDelete={() => onFiltrosChange({ ...filtros, cliente: undefined })}
                size="small"
              />
            )}
            {(filtros.kgMinimo || filtros.kgMaximo) && (
              <Chip
                label={`Kg: ${(filtros.kgMinimo || minKg).toLocaleString()} - ${(filtros.kgMaximo || maxKg).toLocaleString()}`}
                onDelete={() => onFiltrosChange({ ...filtros, kgMinimo: undefined, kgMaximo: undefined })}
                size="small"
              />
            )}
            {filtros.fechaDesde && (
              <Chip
                label={`Desde: ${new Date(filtros.fechaDesde).toLocaleDateString()}`}
                onDelete={() => onFiltrosChange({ ...filtros, fechaDesde: undefined })}
                size="small"
              />
            )}
            {filtros.fechaHasta && (
              <Chip
                label={`Hasta: ${new Date(filtros.fechaHasta).toLocaleDateString()}`}
                onDelete={() => onFiltrosChange({ ...filtros, fechaHasta: undefined })}
                size="small"
              />
            )}
          </Box>
        )}
      </Collapse>
    </Box>
  );
};

export default FiltrosSeguimiento;
