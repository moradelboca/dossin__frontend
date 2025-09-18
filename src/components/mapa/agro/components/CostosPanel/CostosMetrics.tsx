import { Box, Typography, Paper } from '@mui/material';
import { ContextoGeneral } from '../../../../Contexto';
import { useContext } from 'react';
import { getIconForTipo } from '../../utils/iconUtils';

interface Categoria {
    nombre: string;
    tipo: string;
    total: number;
    porcentaje: number;
}

interface CostosMetricsProps {
    categorias: Categoria[];
}

export function CostosMetrics({ categorias }: CostosMetricsProps) {
    const { theme } = useContext(ContextoGeneral);

    return (
        <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: 2, 
            mb: 3 
        }}>
            {categorias.map((categoria) => (
                <Paper key={categoria.nombre} sx={{ p: 2, textAlign: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                        {getIconForTipo(categoria.tipo)}
                        <Typography variant="h6" sx={{ ml: 1 }}>
                            {categoria.nombre}
                        </Typography>
                    </Box>
                    <Typography variant="h5" sx={{ mb: 1, color: theme.colores.azul }}>
                        ${categoria.total.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} / ha
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {categoria.porcentaje.toFixed(1)}% del total
                    </Typography>
                </Paper>
            ))}
        </Box>
    );
}
