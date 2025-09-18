import { useContext } from 'react';
import {
    Box,
    Typography,
    IconButton,
} from '@mui/material';
import {
    Close,
    Business,
    LocationOn,
    Add,
} from '@mui/icons-material';
import { ContextoGeneral } from '../../../../Contexto';
import { Establecimiento } from './types';

interface LotesPanelHeaderProps {
    establecimiento: Establecimiento | null;
    onClose: () => void;
    onAddLote: () => void;
}

export function LotesPanelHeader({ establecimiento, onClose, onAddLote }: LotesPanelHeaderProps) {
    const { theme } = useContext(ContextoGeneral);

    return (
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="h6" sx={{ color: theme.colores.azul }}>
                    Lotes del Establecimiento
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton 
                        size="small" 
                        onClick={onAddLote}
                        sx={{ 
                            color: theme.colores.azul,
                            '&:hover': { backgroundColor: 'rgba(25, 118, 210, 0.04)' }
                        }}
                        title="Agregar nuevo lote"
                    >
                        <Add />
                    </IconButton>
                    <IconButton size="small" onClick={onClose}>
                        <Close />
                    </IconButton>
                </Box>
            </Box>
            
            {establecimiento && (
                <Box sx={{ mb: 2 }}>
                    <Box sx={{ fontSize: '1.25rem', fontWeight: 500, mb: 1, display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
                        <Business sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
                        {establecimiento.nombre}
                    </Box>
                    <Box sx={{ color: 'text.secondary', fontSize: '0.875rem', display: 'flex', alignItems: 'center' }}>
                        <LocationOn sx={{ fontSize: 14, mr: 0.5, verticalAlign: 'middle' }} />
                        {establecimiento.localidad}, {establecimiento.provincia}
                    </Box>
                </Box>
            )}
        </Box>
    );
}
