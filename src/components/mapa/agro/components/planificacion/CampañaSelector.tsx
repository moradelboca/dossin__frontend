import React from 'react';
import {
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Box,
    Typography,
    Chip,
    CircularProgress,
    Alert
} from '@mui/material';
import {
    Campaign as CampaignIcon,
    CalendarToday as CalendarIcon
} from '@mui/icons-material';
import { useCampañas } from '../../hooks/useCampañas';

interface CampañaSelectorProps {
    campañaSeleccionada: string;
    onCampañaChange: (campaña: string) => void;
    disabled?: boolean;
    showLabel?: boolean;
    variant?: 'outlined' | 'filled' | 'standard';
    size?: 'small' | 'medium';
    fullWidth?: boolean;
}

export function CampañaSelector({
    campañaSeleccionada,
    onCampañaChange,
    disabled = false,
    showLabel = true,
    variant = 'outlined',
    size = 'medium',
    fullWidth = true
}: CampañaSelectorProps) {
    const { campañas, loading, error, getCampañaActual } = useCampañas();

    // Si no hay campaña seleccionada, usar la actual
    React.useEffect(() => {
        if (!campañaSeleccionada && campañas.length > 0) {
            const campañaActual = getCampañaActual();
            if (campañaActual) {
                onCampañaChange(campañaActual.id);
            }
        }
    }, [campañas, campañaSeleccionada, getCampañaActual, onCampañaChange]);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 2 }}>
                <CircularProgress size={20} />
                <Typography variant="body2" color="text.secondary">
                    Cargando campañas...
                </Typography>
            </Box>
        );
    }

    if (error) {
        return (
            <Alert severity="error" sx={{ mb: 2 }}>
                Error al cargar campañas: {error}
            </Alert>
        );
    }

    const campañaActual = getCampañaActual();

    return (
        <FormControl 
            fullWidth={fullWidth} 
            variant={variant} 
            size={size}
            disabled={disabled}
        >
            {showLabel && (
                <InputLabel id="campaña-selector-label">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CampaignIcon fontSize="small" />
                        Campaña
                    </Box>
                </InputLabel>
            )}
            
            <Select
                labelId="campaña-selector-label"
                value={campañaSeleccionada || ''}
                onChange={(e) => onCampañaChange(e.target.value)}
                label={showLabel ? "Campaña" : undefined}
                startAdornment={
                    !showLabel && (
                        <CampaignIcon 
                            sx={{ 
                                mr: 1, 
                                color: 'text.secondary',
                                fontSize: 20 
                            }} 
                        />
                    )
                }
                sx={{
                    '& .MuiSelect-select': {
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1
                    }
                }}
            >
                {campañas.map((campaña) => (
                    <MenuItem key={campaña.id} value={campaña.id}>
                        <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 1,
                            width: '100%',
                            justifyContent: 'space-between'
                        }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <CalendarIcon fontSize="small" color="action" />
                                <Typography variant="body2">
                                    {campaña.nombre}
                                </Typography>
                            </Box>
                            
                            <Box sx={{ display: 'flex', gap: 0.5 }}>
                                {campaña.activa && (
                                    <Chip 
                                        label="Actual" 
                                        size="small" 
                                        color="primary" 
                                        variant="outlined"
                                        sx={{ fontSize: '0.7rem', height: 20 }}
                                    />
                                )}
                                {campaña.id === campañaActual?.id && (
                                    <Chip 
                                        label="Recomendada" 
                                        size="small" 
                                        color="success" 
                                        variant="outlined"
                                        sx={{ fontSize: '0.7rem', height: 20 }}
                                    />
                                )}
                            </Box>
                        </Box>
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    );
}
