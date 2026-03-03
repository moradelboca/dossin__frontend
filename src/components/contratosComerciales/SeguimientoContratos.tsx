import React, { useState, useMemo, useContext } from 'react';
import {
  Box,
  Chip,
  Typography,
  Grid,
  CircularProgress,
  Alert,
  useTheme,
  Button
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import HistoryIcon from '@mui/icons-material/History';
import { ContratoWithStats, FiltrosSeguimiento } from '../../types/contratosComerciales';
import TarjetaContrato from './TarjetaContrato';
import FiltrosSeguimientoComponent from './FiltrosSeguimiento';
import { ContextoGeneral } from '../Contexto';

const ESTADOS_HISTORICOS = ['cumplido', 'cancelado', 'vencido'];

interface SeguimientoContratosProps {
  contratos: ContratoWithStats[];
  loading: boolean;
  error: string | null;
  onEditContrato?: (contrato: ContratoWithStats) => void;
  onCreateContrato?: () => void;
}

const SeguimientoContratos: React.FC<SeguimientoContratosProps> = ({
  contratos,
  loading,
  error,
  onEditContrato,
  onCreateContrato
}) => {
  const theme = useTheme();
  const { theme: customTheme } = useContext(ContextoGeneral);
  // const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [filtros, setFiltros] = useState<FiltrosSeguimiento>({});
  const [mostrarHistoricos, setMostrarHistoricos] = useState(false);

  // Filter contracts based on current filters
  const contratosFiltrados = useMemo(() => {
    return contratos.filter(contrato => {
      // Modo histórico: solo mostrar cumplido/cancelado/vencido
      if (mostrarHistoricos) {
        if (!ESTADOS_HISTORICOS.includes(contrato.estado)) return false;
        // Dentro del modo histórico, se puede seguir filtrando por estado específico
        if (filtros.estado && contrato.estado !== filtros.estado) return false;
      } else {
        // Modo normal: solo activos
        if (contrato.estado !== 'activo') return false;
      }

      // Cliente filter (search in both productor and exportador names)
      if (filtros.cliente) {
        const clienteLower = filtros.cliente.toLowerCase();
        const matchesProductor = contrato.productorNombre?.toLowerCase().includes(clienteLower);
        const matchesExportador = contrato.exportadorNombre?.toLowerCase().includes(clienteLower);
        if (!matchesProductor && !matchesExportador) {
          return false;
        }
      }

      // Kg range filter
      if (filtros.kgMinimo && contrato.cantidadTotalKg < filtros.kgMinimo) {
        return false;
      }
      if (filtros.kgMaximo && contrato.cantidadTotalKg > filtros.kgMaximo) {
        return false;
      }

      // Date range filter
      if (filtros.fechaDesde) {
        const contratoFecha = new Date(contrato.fechaFinEntrega);
        const fechaDesde = new Date(filtros.fechaDesde);
        if (contratoFecha < fechaDesde) {
          return false;
        }
      }
      if (filtros.fechaHasta) {
        const contratoFecha = new Date(contrato.fechaFinEntrega);
        const fechaHasta = new Date(filtros.fechaHasta);
        if (contratoFecha > fechaHasta) {
          return false;
        }
      }

      return true;
    });
  }, [contratos, filtros]);

  // Calculate summary statistics
  const estadisticas = useMemo(() => {
    const total = contratosFiltrados.length;
    const activos = contratosFiltrados.filter(c => c.estado === 'activo').length;
    const cumplidos = contratosFiltrados.filter(c => c.estado === 'cumplido').length;
    const totalKg = contratosFiltrados.reduce((sum, c) => sum + c.cantidadTotalKg, 0);
    const entregadoKg = contratosFiltrados.reduce((sum, c) => sum + c.cantidadEntregadaKg, 0);
    const porcentajePromedio = totalKg > 0 ? Math.round((entregadoKg / totalKg) * 100) : 0;

    return {
      total,
      activos,
      cumplidos,
      totalKg,
      entregadoKg,
      porcentajePromedio
    };
  }, [contratosFiltrados]);

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '50vh',
        flexDirection: 'column',
        gap: 2
      }}>
        <CircularProgress size={40} />
        <Typography variant="h6" color="text.secondary">
          Cargando contratos...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      {/* Header with statistics */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, flexWrap: 'wrap' }}>
          <Typography
            variant="h4"
            sx={{
              color: customTheme?.colores?.azul || '#163660',
              fontWeight: 'bold',
            }}
          >
            Seguimiento de Contratos
          </Typography>
          <Chip
            icon={<HistoryIcon style={{ color: mostrarHistoricos ? '#fff' : (customTheme?.colores?.azul || '#163660') }} />}
            label={mostrarHistoricos ? 'Ver activos' : 'Ver históricos'}
            onClick={() => setMostrarHistoricos((prev) => !prev)}
            sx={{
              cursor: 'pointer',
              bgcolor: mostrarHistoricos ? (customTheme?.colores?.azul || '#163660') : 'transparent',
              color: mostrarHistoricos ? '#fff' : (customTheme?.colores?.azul || '#163660'),
              borderColor: customTheme?.colores?.azul || '#163660',
              border: '1px solid',
              '&:hover': {
                bgcolor: mostrarHistoricos
                  ? (customTheme?.colores?.azul || '#163660')
                  : `${customTheme?.colores?.azul || '#163660'}15`,
              },
            }}
          />
        </Box>
        
        {/* Summary cards */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={6} sm={3}>
            <Box sx={{ 
              p: 2, 
              backgroundColor: customTheme?.colores?.azul || '#163660', 
              color: 'white', 
              borderRadius: 2,
              textAlign: 'center'
            }}>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {estadisticas.total}
              </Typography>
              <Typography variant="body2">
                Total Contratos
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Box sx={{ 
              p: 2, 
              backgroundColor: theme?.palette?.success?.main || '#4caf50', 
              color: 'white', 
              borderRadius: 2,
              textAlign: 'center'
            }}>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {estadisticas.activos}
              </Typography>
              <Typography variant="body2">
                Activos
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Box sx={{ 
              p: 2, 
              backgroundColor: customTheme?.colores?.azul || '#2196f3', 
              color: 'white', 
              borderRadius: 2,
              textAlign: 'center'
            }}>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {estadisticas.cumplidos}
              </Typography>
              <Typography variant="body2">
                Cumplidos
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Box sx={{ 
              p: 2, 
              backgroundColor: theme?.palette?.warning?.main || '#ff9800', 
              color: 'white', 
              borderRadius: 2,
              textAlign: 'center'
            }}>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {estadisticas.porcentajePromedio}%
              </Typography>
              <Typography variant="body2">
                Cumplimiento
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* Filters */}
      <FiltrosSeguimientoComponent
        filtros={filtros}
        onFiltrosChange={setFiltros}
        contratos={contratos}
      />

      {/* Contracts grid */}
      {contratosFiltrados.length > 0 ? (
        <Grid container spacing={3}>
          {contratosFiltrados.map((contrato) => (
            <Grid 
              item 
              xs={12} 
              sm={6} 
              lg={4} 
              xl={3} 
              key={contrato.id}
            >
              <TarjetaContrato
                contrato={contrato}
                onEdit={onEditContrato}
              />
            </Grid>
          ))}
        </Grid>
      ) : (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '40vh',
            textAlign: 'center',
            p: 4
          }}
        >
          <Typography variant="h5" color="text.secondary" gutterBottom>
            {contratos.length > 0 ? 'No se encontraron contratos' : 'No hay contratos disponibles'}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            {contratos.length > 0 
              ? 'Intenta ajustar los filtros de búsqueda'
              : 'Los contratos comerciales aparecerán aquí una vez que se creen'
            }
          </Typography>
          {contratos.length === 0 && onCreateContrato && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={onCreateContrato}
              sx={{
                backgroundColor: customTheme?.colores?.azul || '#163660',
                '&:hover': {
                  backgroundColor: customTheme?.colores?.azulOscuro || '#0f2a4a'
                }
              }}
            >
              Crear Primer Contrato
            </Button>
          )}
        </Box>
      )}
    </Box>
  );
};

export default SeguimientoContratos;
