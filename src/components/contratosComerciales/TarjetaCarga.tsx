import React, { useContext } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  useTheme
} from '@mui/material';
import { ContextoGeneral } from '../Contexto';
import {
  DragIndicator as DragIcon,
  LocationOn as LocationIcon,
  AttachMoney as MoneyIcon,
  Directions as DirectionsIcon
} from '@mui/icons-material';
import { CargaDisponible } from '../../types/contratosComerciales';

interface TarjetaCargaProps {
  carga: CargaDisponible;
  isDragging?: boolean;
  isValidTarget?: boolean;
  isSelected?: boolean;
  onClick?: (carga: CargaDisponible) => void;
}

const TarjetaCarga: React.FC<TarjetaCargaProps> = ({
  carga,
  isDragging = false,
  isValidTarget = true,
  isSelected = false,
  onClick
}) => {
  const theme = useTheme();
  const { theme: customTheme } = useContext(ContextoGeneral);

  const getCardStyle = () => {
    if (isDragging) {
      return {
        opacity: 0.5,
        transform: 'rotate(5deg)',
        boxShadow: theme.shadows[8]
      };
    }

    if (!isValidTarget) {
      return {
        opacity: 0.6,
        backgroundColor: theme?.palette?.error?.light || '#ffebee',
        border: `2px solid ${theme?.palette?.error?.main || '#f44336'}`
      };
    }

    if (carga.asociada) {
      return {
        backgroundColor: customTheme?.colores?.azul ? `${customTheme.colores.azul}20` : '#e3f2fd',
        border: `2px solid ${customTheme?.colores?.azul || '#2196f3'}`
      };
    }

    if (isSelected) {
      return {
        backgroundColor: customTheme?.colores?.azul ? `${customTheme.colores.azul}20` : '#e3f2fd',
        border: `2px solid ${customTheme?.colores?.azul || '#1976d2'}`,
        cursor: 'pointer'
      };
    }

    return {
      backgroundColor: theme?.palette?.background?.paper || '#fff',
      border: `1px solid ${theme?.palette?.divider || '#e0e0e0'}`,
      cursor: 'grab',
      transition: 'all 0.2s ease-in-out',
      '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: theme.shadows[4]
      }
    };
  };

  const handleClick = () => {
    if (onClick) {
      onClick(carga);
    }
  };

  return (
    <Card
      sx={{
        mb: 1,
        transition: 'all 0.2s ease',
        ...getCardStyle(),
        '&:hover': !isDragging ? {
          transform: 'translateY(-2px)',
          boxShadow: theme.shadows[4]
        } : {}
      }}
      onClick={handleClick}
    >
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        {/* Header with drag handle and status */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <DragIcon sx={{ color: 'text.secondary', fontSize: 16 }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
              Carga #{carga.id}
            </Typography>
          </Box>
          {carga.asociada && (
            <Chip
              label="Asociada"
              size="small"
              sx={{
                backgroundColor: customTheme?.colores?.azul || '#2196f3',
                color: 'white',
                fontSize: '0.7rem'
              }}
            />
          )}
        </Box>

        {/* Origin and Destination */}
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <LocationIcon sx={{ fontSize: 16, color: theme?.palette?.success?.main || '#4caf50' }} />
            <Typography variant="body2" sx={{ fontWeight: 'bold', color: theme?.palette?.success?.main || '#4caf50' }}>
              Origen:
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ ml: 3, mb: 1 }}>
            {carga.ubicacionCarga?.localidad?.nombre || carga.ubicacionCarga?.nombre || 'N/A'}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ ml: 3, display: 'block' }}>
            {carga.ubicacionCarga?.localidad?.provincia?.nombre || ''} {carga.ubicacionCarga?.localidad?.provincia?.pais?.nombre || ''}
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, mt: 1 }}>
            <DirectionsIcon sx={{ fontSize: 16, color: theme?.palette?.error?.main || '#f44336' }} />
            <Typography variant="body2" sx={{ fontWeight: 'bold', color: theme?.palette?.error?.main || '#f44336' }}>
              Destino:
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ ml: 3, mb: 1 }}>
            {carga.ubicacionDescarga?.localidad?.nombre || carga.ubicacionDescarga?.nombre || 'N/A'}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ ml: 3, display: 'block' }}>
            {carga.ubicacionDescarga?.localidad?.provincia?.nombre || ''} {carga.ubicacionDescarga?.localidad?.provincia?.pais?.nombre || ''}
          </Typography>
        </Box>

        {/* Tariff and Distance */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <MoneyIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
              ${carga.tarifa || 0} / {carga.tipoTarifa?.nombre || 'N/A'}
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">
            {carga.cantidadKm || 0} km
          </Typography>
        </Box>

        {/* Removed weight and crop chip per request */}

        {/* Cargamento and Provider */}
        <Box sx={{ mb: 1 }}>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
            <strong>Cargamento:</strong> {carga.cargamento?.nombre || 'N/A'}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
            <strong>Proveedor:</strong> {carga.proveedor?.nombre || 'N/A'}
          </Typography>
        </Box>

        {/* Date */}
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
          {new Date(carga.fecha).toLocaleDateString()}
        </Typography>

        {/* Associated contract info */}
        {carga.contratoId && (
          <Box sx={{ mt: 1, p: 1, backgroundColor: customTheme?.colores?.azul ? `${customTheme.colores.azul}20` : '#e3f2fd', borderRadius: 1 }}>
            <Typography variant="caption" color="text.secondary">
              Contrato #{carga.contratoId}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default TarjetaCarga;
