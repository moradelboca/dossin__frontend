import { Box, Typography, IconButton } from '@mui/material';
import { Close } from '@mui/icons-material';
import { ContextoGeneral } from '../../../../../Contexto';
import { useContext } from 'react';

interface PlanificacionFormHeaderProps {
    campania: string;
    ubicacion: any;
    onClose: () => void;
}

export function PlanificacionFormHeader({ campania, ubicacion, onClose }: PlanificacionFormHeaderProps) {
    const { theme } = useContext(ContextoGeneral);

    return (
        <>
            <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h6" sx={{ color: theme.colores.azul }}>
                    Planificar Campaña {campania}
                </Typography>
                <IconButton onClick={onClose} size="small">
                    <Close />
                </IconButton>
            </Box>
            <Box sx={{ mb: 3 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                    Ubicación: <strong>{ubicacion?.nombre || 'Sin ubicación'}</strong>
                </Typography>
            </Box>
        </>
    );
}

