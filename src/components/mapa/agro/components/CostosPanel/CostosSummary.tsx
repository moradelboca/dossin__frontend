import { Box, Typography, Chip } from '@mui/material';
import { ContextoGeneral } from '../../../../Contexto';
import { useContext } from 'react';

interface Categoria {
    nombre: string;
    tipo: string;
    total: number;
    porcentaje: number;
}

interface CostosSummaryProps {
    costoPorHectarea: number;
    costoTotalReal: number;
    superficie: number;
    categorias: Categoria[];
}

export function CostosSummary({ costoPorHectarea, costoTotalReal, superficie, categorias }: CostosSummaryProps) {
    const { theme } = useContext(ContextoGeneral);

    const getColorForTipo = (tipo: string) => {
        switch (tipo) {
            case 'labor': return 'primary';
            case 'insumo': return 'secondary';
            case 'costo': return 'warning';
            case 'tierra': return 'success';
            default: return 'default';
        }
    };

    return (
        <Box sx={{ 
            p: 3, 
            bgcolor: 'grey.50', 
            borderRadius: 2, 
            mb: 3,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
        }}>
            <Box>
                <Typography variant="h4" color="success.main" sx={{ mb: 1 }}>
                    ${costoPorHectarea.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} / ha
                </Typography>
                <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                    Total: ${costoTotalReal.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ({superficie} ha)
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {categorias.slice(0, 3).map((cat) => (
                        <Chip 
                            key={cat.nombre}
                            label={`${cat.nombre}: ${cat.porcentaje.toFixed(1)}%`} 
                            sx={{
                                backgroundColor: getColorForTipo(cat.tipo),
                                color: 'white',
                                '&:hover': {
                                    backgroundColor: cat.tipo === 'labor' ? theme.colores.azulOscuro : getColorForTipo(cat.tipo)
                                }
                            }}
                            size="small"
                        />
                    ))}
                </Box>
            </Box>
            <Box sx={{ textAlign: 'right' }}>
                <Typography variant="h6" sx={{ mb: 1, color: theme.colores.azul }}>
                    Superficie Total
                </Typography>
                <Typography variant="h4" sx={{ color: theme.colores.azul }}>
                    {superficie} ha
                </Typography>
            </Box>
        </Box>
    );
}
