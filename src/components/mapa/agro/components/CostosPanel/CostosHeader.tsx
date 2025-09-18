import { Box, Typography, Button } from '@mui/material';
import { Add, FileDownload } from '@mui/icons-material';
import { ContextoGeneral } from '../../../../Contexto';
import { useContext } from 'react';

interface CostosHeaderProps {
    onAddItem: () => void;
    onExport: () => void;
}

export function CostosHeader({ onAddItem, onExport }: CostosHeaderProps) {
    const { theme } = useContext(ContextoGeneral);

    return (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5" sx={{ color: theme.colores.azul }}>
                $ Análisis de Costos
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
                <Button 
                    variant="contained" 
                    startIcon={<Add />}
                    onClick={onAddItem}
                    sx={{
                        backgroundColor: theme.colores.azul,
                        '&:hover': { backgroundColor: theme.colores.azulOscuro }
                    }}
                >
                    + AGREGAR ITEM
                </Button>
                <Button 
                    variant="outlined" 
                    startIcon={<FileDownload />}
                    onClick={onExport}
                    sx={{
                        borderColor: theme.colores.azul,
                        color: theme.colores.azul,
                        '&:hover': { 
                            borderColor: theme.colores.azulOscuro,
                            backgroundColor: 'rgba(22, 54, 96, 0.04)'
                        }
                    }}
                >
                    EXPORTAR CSV
                </Button>
            </Box>
        </Box>
    );
}
