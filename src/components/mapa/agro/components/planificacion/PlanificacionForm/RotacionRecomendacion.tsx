// import React from 'react'; // No necesario en React 17+
import {
    Box,
    Card,
    CardContent,
    Typography,
    Chip,
    Alert,
    AlertTitle,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Divider,
} from '@mui/material';
import {
    CheckCircle,
    Warning,
    Error,
    Info,
    Agriculture,
    Timeline,
} from '@mui/icons-material';
import { ContextoGeneral } from '../../../../../Contexto';
import { useContext } from 'react';
import { RecomendacionRotacion } from '../../../../../../lib/rotacionCultivos';

interface RotacionRecomendacionProps {
    recomendacion: RecomendacionRotacion | null;
    cultivoAnterior: string | null;
    cultivoNuevo: string;
    loading?: boolean;
}

export function RotacionRecomendacion({
    recomendacion,
    cultivoAnterior,
    cultivoNuevo,
    loading = false
}: RotacionRecomendacionProps) {
    const { theme } = useContext(ContextoGeneral);

    if (loading) {
        return (
            <Card variant="outlined" sx={{ mb: 2 }}>
                <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Timeline color="primary" />
                        <Typography variant="body2" color="text.secondary">
                            Analizando rotación de cultivos...
                        </Typography>
                    </Box>
                </CardContent>
            </Card>
        );
    }

    if (!recomendacion) {
        return null;
    }

    const getSeverity = () => {
        switch (recomendacion.nivel) {
            case 'excelente':
                return 'success';
            case 'buena':
                return 'info';
            case 'regular':
                return 'warning';
            case 'desfavorable':
                return 'error';
            default:
                return 'info';
        }
    };

    const getIcon = () => {
        switch (recomendacion.nivel) {
            case 'excelente':
                return <CheckCircle />;
            case 'buena':
                return <CheckCircle />;
            case 'regular':
                return <Warning />;
            case 'desfavorable':
                return <Error />;
            default:
                return <Info />;
        }
    };

    const getNivelColor = () => {
        switch (recomendacion.nivel) {
            case 'excelente':
                return '#4caf50';
            case 'buena':
                return theme.colores.azul || '#2196f3';
            case 'regular':
                return '#ff9800';
            case 'desfavorable':
                return '#f44336';
            default:
                return theme.colores.azul || '#2196f3';
        }
    };

    return (
        <Card variant="outlined" sx={{ mb: 2 }}>
            <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Agriculture color="primary" />
                    <Typography variant="h6" sx={{ color: theme.colores.azul }}>
                        Recomendación de Rotación
                    </Typography>
                    <Chip
                        icon={getIcon()}
                        label={recomendacion.nivel.toUpperCase()}
                        color={getSeverity() as any}
                        size="small"
                        sx={{ 
                            fontWeight: 600,
                            backgroundColor: getNivelColor(),
                            color: 'white',
                            '& .MuiChip-icon': {
                                color: 'white'
                            }
                        }}
                    />
                </Box>

                {cultivoAnterior && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        <strong>Cultivo anterior:</strong> {cultivoAnterior} → <strong>Cultivo nuevo:</strong> {cultivoNuevo}
                    </Typography>
                )}

                <Alert 
                    severity={getSeverity() as any} 
                    icon={getIcon()}
                    sx={{ mb: 2 }}
                >
                    <AlertTitle>
                        {recomendacion.esRecomendada ? '✅ Rotación Recomendada' : '⚠️ Rotación No Recomendada'}
                    </AlertTitle>
                    {recomendacion.razones.length > 0 && (
                        <List dense>
                            {recomendacion.razones.map((razon, index) => (
                                <ListItem key={index} sx={{ py: 0.5 }}>
                                    <ListItemIcon sx={{ minWidth: 32 }}>
                                        <CheckCircle color="success" fontSize="small" />
                                    </ListItemIcon>
                                    <ListItemText 
                                        primary={razon}
                                        primaryTypographyProps={{ variant: 'body2' }}
                                    />
                                </ListItem>
                            ))}
                        </List>
                    )}
                </Alert>

                {recomendacion.advertencias.length > 0 && (
                    <Alert severity="warning" sx={{ mb: 2 }}>
                        <AlertTitle>Advertencias</AlertTitle>
                        <List dense>
                            {recomendacion.advertencias.map((advertencia, index) => (
                                <ListItem key={index} sx={{ py: 0.5 }}>
                                    <ListItemIcon sx={{ minWidth: 32 }}>
                                        <Warning color="warning" fontSize="small" />
                                    </ListItemIcon>
                                    <ListItemText 
                                        primary={advertencia}
                                        primaryTypographyProps={{ variant: 'body2' }}
                                    />
                                </ListItem>
                            ))}
                        </List>
                    </Alert>
                )}

                {recomendacion.sugerencias.length > 0 && (
                    <>
                        <Divider sx={{ my: 2 }} />
                        <Typography variant="subtitle2" sx={{ mb: 1, color: theme.colores.azul }}>
                            💡 Sugerencias
                        </Typography>
                        <List dense>
                            {recomendacion.sugerencias.map((sugerencia, index) => (
                                <ListItem key={index} sx={{ py: 0.5 }}>
                                    <ListItemIcon sx={{ minWidth: 32 }}>
                                        <Info color="info" fontSize="small" />
                                    </ListItemIcon>
                                    <ListItemText 
                                        primary={sugerencia}
                                        primaryTypographyProps={{ variant: 'body2' }}
                                    />
                                </ListItem>
                            ))}
                        </List>
                    </>
                )}
            </CardContent>
        </Card>
    );
}
