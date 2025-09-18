import { Box, Typography, Button } from '@mui/material';
import { Add } from '@mui/icons-material';

interface EmptyStateProps {
    onAddItem: () => void;
}

export function EmptyState({ onAddItem }: EmptyStateProps) {
    return (
        <Box sx={{ 
            p: 4, 
            textAlign: 'center', 
            bgcolor: 'grey.50', 
            borderRadius: 2,
            border: '2px dashed',
            borderColor: 'grey.300'
        }}>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                📊 No hay datos de costos disponibles
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Los costos se mostrarán aquí cuando agregues items a la planificación
            </Typography>
            <Button 
                variant="contained" 
                startIcon={<Add />}
                onClick={onAddItem}
            >
                Agregar Primer Item
            </Button>
        </Box>
    );
}
