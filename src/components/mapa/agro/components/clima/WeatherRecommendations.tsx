import React from 'react';
import {
    Box,
    Typography,
    Card,
    CardContent,
    Chip,
    Alert,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Divider,
    Grid,
} from '@mui/material';
import {
    Agriculture,
    WaterDrop,
    PestControl,
    TrendingUp,
    Warning,
    CheckCircle,
    Schedule,
    LocalFlorist,
    Info,
} from '@mui/icons-material';
import { WeatherRecommendation, CropStage } from './types';

interface WeatherRecommendationsProps {
    recommendations: WeatherRecommendation[];
    currentStage?: CropStage;
    theme: any;
}

export function WeatherRecommendations({ recommendations, currentStage, theme }: WeatherRecommendationsProps) {
    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high':
                return '#d32f2f';
            case 'medium':
                return '#ed6c02';
            case 'low':
                return '#2e7d32';
            default:
                return theme.colores.azul;
        }
    };

    const getPriorityIcon = (priority: string) => {
        switch (priority) {
            case 'high':
                return <Warning />;
            case 'medium':
                return <Schedule />;
            case 'low':
                return <CheckCircle />;
            default:
                return <Info />;
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'sowing':
                return <Agriculture />;
            case 'harvest':
                return <LocalFlorist />;
            case 'fertilization':
                return <TrendingUp />;
            case 'irrigation':
                return <WaterDrop />;
            case 'pest_control':
                return <PestControl />;
            default:
                return <Info />;
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'sowing':
                return '#4caf50';
            case 'harvest':
                return '#ff9800';
            case 'fertilization':
                return '#2196f3';
            case 'irrigation':
                return '#00bcd4';
            case 'pest_control':
                return '#9c27b0';
            default:
                return theme.colores.azul;
        }
    };

    const getTypeText = (type: string) => {
        switch (type) {
            case 'sowing':
                return 'Siembra';
            case 'harvest':
                return 'Cosecha';
            case 'fertilization':
                return 'Fertilización';
            case 'irrigation':
                return 'Riego';
            case 'pest_control':
                return 'Control de Plagas';
            default:
                return 'General';
        }
    };

    const groupedRecommendations = recommendations.reduce((acc, rec) => {
        if (!acc[rec.type]) {
            acc[rec.type] = [];
        }
        acc[rec.type].push(rec);
        return acc;
    }, {} as Record<string, WeatherRecommendation[]>);

    return (
        <Box>
            <Typography variant="h6" sx={{ color: theme.colores.azul, mb: 2, display: 'flex', alignItems: 'center' }}>
                <Agriculture sx={{ mr: 1 }} />
                Recomendaciones Agrícolas
            </Typography>

            {currentStage && (
                <Alert severity="info" sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                        Etapa Actual: {currentStage.name}
                    </Typography>
                    <Typography variant="body2">
                        Sensibilidad climática: {currentStage.weatherSensitivity === 'high' ? 'Alta' : 
                                               currentStage.weatherSensitivity === 'medium' ? 'Media' : 'Baja'}
                    </Typography>
                </Alert>
            )}

            {Object.keys(groupedRecommendations).length === 0 ? (
                <Alert severity="info">
                    <Typography variant="body2">
                        No hay recomendaciones específicas para las condiciones climáticas actuales.
                    </Typography>
                </Alert>
            ) : (
                <Grid container spacing={2}>
                    {Object.entries(groupedRecommendations).map(([type, recs]) => (
                        <Grid item xs={12} md={6} key={type}>
                            <Card sx={{ height: '100%' }}>
                                <CardContent>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                        <Box
                                            sx={{
                                                backgroundColor: getTypeColor(type),
                                                color: 'white',
                                                borderRadius: '50%',
                                                width: 40,
                                                height: 40,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                mr: 2,
                                            }}
                                        >
                                            {getTypeIcon(type)}
                                        </Box>
                                        <Typography variant="h6" sx={{ color: theme.colores.azul }}>
                                            {getTypeText(type)}
                                        </Typography>
                                    </Box>

                                    <List dense>
                                        {recs.map((rec, index) => (
                                            <React.Fragment key={index}>
                                                <ListItem sx={{ px: 0 }}>
                                                    <ListItemIcon sx={{ minWidth: 40 }}>
                                                        <Box
                                                            sx={{
                                                                color: getPriorityColor(rec.priority),
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                            }}
                                                        >
                                                            {getPriorityIcon(rec.priority)}
                                                        </Box>
                                                    </ListItemIcon>
                                                    <ListItemText
                                                        primary={
                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                                                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                                                                    {rec.title}
                                                                </Typography>
                                                                <Chip
                                                                    label={rec.priority === 'high' ? 'Alta' : 
                                                                           rec.priority === 'medium' ? 'Media' : 'Baja'}
                                                                    size="small"
                                                                    sx={{
                                                                        backgroundColor: getPriorityColor(rec.priority),
                                                                        color: 'white',
                                                                        fontSize: '0.7rem',
                                                                        height: 20,
                                                                    }}
                                                                />
                                                            </Box>
                                                        }
                                                        secondary={
                                                            <Box>
                                                                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                                                    {rec.description}
                                                                </Typography>
                                                                {rec.action && (
                                                                    <Typography variant="body2" sx={{ 
                                                                        fontStyle: 'italic',
                                                                        color: theme.colores.azul,
                                                                        fontWeight: 'bold',
                                                                        display: 'block',
                                                                        mb: 0.5
                                                                    }}>
                                                                        💡 {rec.action}
                                                                    </Typography>
                                                                )}
                                                                {rec.timeframe && (
                                                                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                                                                        📅 {rec.timeframe}
                                                                    </Typography>
                                                                )}
                                                                {rec.conditions && rec.conditions.length > 0 && (
                                                                    <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                                        {rec.conditions.map((condition, condIndex) => (
                                                                            <Chip
                                                                                key={condIndex}
                                                                                label={condition}
                                                                                size="small"
                                                                                variant="outlined"
                                                                                sx={{ fontSize: '0.7rem' }}
                                                                            />
                                                                        ))}
                                                                    </Box>
                                                                )}
                                                            </Box>
                                                        }
                                                    />
                                                </ListItem>
                                                {index < recs.length - 1 && <Divider />}
                                            </React.Fragment>
                                        ))}
                                    </List>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}
        </Box>
    );
}
