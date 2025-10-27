import React, { useState, useContext } from 'react';
import {
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Box,
  Chip,
  IconButton,
  Collapse,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Business as BusinessIcon,
  Scale as ScaleIcon,
  CalendarToday as CalendarIcon
} from '@mui/icons-material';
import { ContratoWithStats, ESTADOS_MAP } from '../../types/contratosComerciales';
import { ContextoGeneral } from '../Contexto';

interface TarjetaContratoProps {
  contrato: ContratoWithStats;
  onEdit?: (contrato: ContratoWithStats) => void;
}

const TarjetaContrato: React.FC<TarjetaContratoProps> = ({ contrato, onEdit }) => {
  const theme = useTheme();
  const { theme: customTheme } = useContext(ContextoGeneral);
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [expanded, setExpanded] = useState(false);

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  const handleEditClick = () => {
    if (onEdit) {
      onEdit(contrato);
    }
  };

  // Calculate progress color based on percentage and deadline
  const getProgressColor = (): string => {
    const { porcentajeCumplimiento } = contrato;
    const today = new Date();
    const deliveryDate = new Date(contrato.fechaFinEntrega);
    const daysUntilDelivery = Math.ceil((deliveryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (porcentajeCumplimiento >= 80) return '#4caf50'; // Green
    if (porcentajeCumplimiento >= 50) return '#ff9800'; // Orange
    if (daysUntilDelivery <= 7 && porcentajeCumplimiento < 50) return '#f44336'; // Red
    return '#2196f3'; // Blue
  };

  const estadoInfo = ESTADOS_MAP[contrato.estado] || { label: contrato.estado, color: '#666' };

  return (
    <Card 
      sx={{ 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: theme.shadows[8]
        }
      }}
    >
      <CardContent sx={{ flexGrow: 1, p: 3 }}>
        {/* Header with company name and status */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{ flex: 1 }}>
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 'bold',
                color: customTheme?.colores?.azul || '#163660',
                mb: 0.5,
                lineHeight: 1.2
              }}
            >
              {contrato.exportadorNombre || `Exportador ${contrato.exportadorId}`}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Contrato #{contrato.numeroContrato}
            </Typography>
          </Box>
          <Chip
            label={estadoInfo.label}
            sx={{
              backgroundColor: estadoInfo.color,
              color: 'white',
              fontWeight: 'bold',
              fontSize: '0.75rem'
            }}
          />
        </Box>

        {/* Progress section */}
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Entregado
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
              {contrato.porcentajeCumplimiento}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={Math.min(contrato.porcentajeCumplimiento, 100)}
            sx={{
              height: 8,
              borderRadius: 4,
              backgroundColor: theme?.palette?.grey?.[200] || '#e0e0e0',
              '& .MuiLinearProgress-bar': {
                backgroundColor: getProgressColor(),
                borderRadius: 4
              }
            }}
          />
        </Box>

        {/* Stats */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ textAlign: 'center', flex: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: customTheme?.colores?.azul || '#163660' }}>
              {(contrato.cantidadEntregadaKg || 0).toLocaleString()}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              kg entregados
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'center', flex: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: theme?.palette?.text?.primary || '#000' }}>
              {(contrato.cantidadTotalKg || 0).toLocaleString()}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              kg totales
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'center', flex: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: theme?.palette?.warning?.main || '#ff9800' }}>
              {(contrato.kgPendientes || 0).toLocaleString()}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              kg pendientes
            </Typography>
          </Box>
        </Box>

        {/* Grain type and price */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ScaleIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary">
              {contrato.tipoGranoNombre}
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
            ${contrato.precioPorKg} {contrato.moneda}/kg
          </Typography>
        </Box>

        {/* Expand button */}
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <IconButton
            onClick={handleExpandClick}
            sx={{
              transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.3s ease'
            }}
          >
            <ExpandMoreIcon />
          </IconButton>
        </Box>
      </CardContent>

      {/* Expanded details */}
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <CardContent sx={{ pt: 0, borderTop: `1px solid ${theme?.palette?.divider || '#e0e0e0'}` }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 2, mb: 2 }}>
            <Box>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Productor
              </Typography>
              <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <BusinessIcon sx={{ fontSize: 16 }} />
                {contrato.productorNombre || `Productor ${contrato.productorId}`}
              </Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Fecha de entrega
              </Typography>
              <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CalendarIcon sx={{ fontSize: 16 }} />
                {new Date(contrato.fechaFinEntrega).toLocaleDateString()}
              </Typography>
            </Box>
          </Box>

          {contrato.observaciones && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Observaciones
              </Typography>
              <Typography variant="body2">
                {contrato.observaciones}
              </Typography>
            </Box>
          )}

          {contrato.cargas && contrato.cargas.length > 0 && (
            <Box>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Cargas asociadas ({contrato.cargas.length})
              </Typography>
              <Box sx={{ maxHeight: 120, overflowY: 'auto' }}>
                {contrato.cargas.map((carga) => (
                  <Box key={carga.id} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
                    <Typography variant="caption">
                      Carga #{carga.numeroCartaPorte}
                    </Typography>
                    <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                      {(carga.kgDescargadosTotales || 0).toLocaleString()} kg
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          )}

          {onEdit && (
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
              <IconButton 
                onClick={handleEditClick}
                size="small"
                sx={{ color: customTheme?.colores?.azul || '#163660' }}
              >
                Editar
              </IconButton>
            </Box>
          )}
        </CardContent>
      </Collapse>
    </Card>
  );
};

export default TarjetaContrato;
