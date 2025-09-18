import React, { useState } from 'react';
import {
    Box,
    Typography,
    Card,
    CardContent,
    Chip,
    LinearProgress,
    Alert,
    Grid,
    Tabs,
    Tab,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    // Divider, // No se usa
} from '@mui/material';
import {
    WaterDrop,
    Warning,
    CheckCircle,
    // Info, // No se usa
    TrendingUp,
    TrendingDown,
    CloudQueue,
    Person,
    Add as AddIcon,
} from '@mui/icons-material';
import { RainfallAnalysis as RainfallAnalysisType } from './types';
import { RegistroLluvia } from '../../../../../types/agro';
import { LluviaForm } from './LluviaForm';

interface RainfallAnalysisProps {
    analysis: RainfallAnalysisType;
    theme: any;
    periodDays?: number;
    lluviasManuales?: RegistroLluvia[];
    onAddLluvia?: (lluvia: Omit<RegistroLluvia, 'id' | 'registradoPor' | 'registradoEn' | 'fuente'>) => void;
    loading?: boolean;
}

export function RainfallAnalysis({ 
    analysis, 
    theme, 
    periodDays = 7, 
    lluviasManuales = [], 
    onAddLluvia,
    loading = false 
}: RainfallAnalysisProps) {
    const [activeTab, setActiveTab] = useState(0);

    const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
        setActiveTab(newValue);
    };

    const handleAddLluvia = (lluviaData: Omit<RegistroLluvia, 'id' | 'registradoPor' | 'registradoEn' | 'fuente'>) => {
        if (onAddLluvia) {
            onAddLluvia(lluviaData);
        }
    };

    // Calcular totales de lluvias manuales
    const totalLluviasManuales = lluviasManuales.reduce((sum, lluvia) => sum + lluvia.cantidad, 0);
    const promedioLluviasManuales = lluviasManuales.length > 0 ? totalLluviasManuales / lluviasManuales.length : 0;

    // const getSowingRecommendationColor = (recommendation: string) => { // No se usa
    //     switch (recommendation) {
    //         case 'excellent':
    //             return '#4caf50';
    //         case 'good':
    //             return '#8bc34a';
    //         case 'fair':
    //             return '#ff9800';
    //         case 'poor':
    //             return '#ff5722';
    //         case 'not_recommended':
    //             return '#f44336';
    //         default:
    //             return theme.colores.azul;
    //     }
    // };

    const getSowingRecommendationText = (recommendation: string) => {
        switch (recommendation) {
            case 'excellent':
                return 'Excelente para siembra';
            case 'good':
                return 'Buena para siembra';
            case 'fair':
                return 'Aceptable para siembra';
            case 'poor':
                return 'No recomendado para siembra';
            case 'not_recommended':
                return 'No sembrar';
            default:
                return 'Evaluando...';
        }
    };

    const getSoilMoistureColor = (level: string) => {
        switch (level) {
            case 'dry':
                return '#ff5722';
            case 'optimal':
                return '#4caf50';
            case 'wet':
                return '#2196f3';
            case 'saturated':
                return '#9c27b0';
            default:
                return theme.colores.azul;
        }
    };

    const getSoilMoistureText = (level: string) => {
        switch (level) {
            case 'dry':
                return 'Seco - Requiere riego';
            case 'optimal':
                return 'Óptimo - Condiciones ideales';
            case 'wet':
                return 'Húmedo - Monitorear drenaje';
            case 'saturated':
                return 'Saturado - Riesgo de encharcamiento';
            default:
                return 'Evaluando...';
        }
    };

    return (
        <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ color: theme.colores.azul, mb: 2, display: 'flex', alignItems: 'center' }}>
                <WaterDrop sx={{ mr: 1 }} />
                Análisis de Precipitaciones
            </Typography>

            {/* Tabs para diferentes vistas */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                <Tabs
                    value={activeTab}
                    onChange={handleTabChange}
                    sx={{
                        '& .MuiTab-root': {
                            color: 'text.secondary',
                            '&.Mui-selected': {
                                color: theme.colores.azul,
                            },
                        },
                        '& .MuiTabs-indicator': {
                            backgroundColor: theme.colores.azul,
                        },
                    }}
                >
                    <Tab icon={<CloudQueue />} label="Datos API" iconPosition="start" />
                    <Tab icon={<Person />} label="Registros Manuales" iconPosition="start" />
                    <Tab icon={<AddIcon />} label="Registrar Lluvia" iconPosition="start" />
                </Tabs>
            </Box>

            {/* Tab 1: Datos de la API */}
            {activeTab === 0 && (
                <Grid container spacing={2}>
                    {/* Resumen de Precipitaciones API */}
                    <Grid item xs={12} md={6}>
                        <Card sx={{ height: '100%' }}>
                            <CardContent>
                                <Typography variant="h6" sx={{ mb: 2, color: theme.colores.azul, display: 'flex', alignItems: 'center' }}>
                                    <CloudQueue sx={{ mr: 1 }} />
                                    Datos de OpenWeather
                                </Typography>
                                
                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="body2" color="text.secondary">
                                        Precipitación Total ({periodDays} días)
                                    </Typography>
                                    <Typography variant="h4" sx={{ color: theme.colores.azul }}>
                                        {analysis.totalRainfall.toFixed(1)} mm
                                    </Typography>
                                </Box>

                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="body2" color="text.secondary">
                                        Promedio Diario
                                    </Typography>
                                    <Typography variant="h6">
                                        {analysis.averageDaily.toFixed(1)} mm/día
                                    </Typography>
                                </Box>

                                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                    <Chip
                                        icon={<TrendingUp />}
                                        label={`${analysis.consecutiveWetDays} días húmedos consecutivos`}
                                        color="primary"
                                        variant="outlined"
                                        size="small"
                                    />
                                    <Chip
                                        icon={<TrendingDown />}
                                        label={`${analysis.consecutiveDryDays} días secos consecutivos`}
                                        color="secondary"
                                        variant="outlined"
                                        size="small"
                                    />
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Humedad del Suelo */}
                    <Grid item xs={12} md={6}>
                        <Card sx={{ height: '100%' }}>
                            <CardContent>
                                <Typography variant="h6" sx={{ mb: 2, color: theme.colores.azul }}>
                                    Humedad del Suelo
                                </Typography>
                                
                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                        Nivel Actual
                                    </Typography>
                                    <Chip
                                        label={getSoilMoistureText(analysis.soilMoistureLevel)}
                                        sx={{
                                            backgroundColor: getSoilMoistureColor(analysis.soilMoistureLevel),
                                            color: 'white',
                                            fontWeight: 'bold',
                                        }}
                                    />
                                </Box>

                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                        Progreso de Humedad
                                    </Typography>
                                    <LinearProgress
                                        variant="determinate"
                                        value={analysis.soilMoistureLevel === 'dry' ? 25 : 
                                               analysis.soilMoistureLevel === 'optimal' ? 75 :
                                               analysis.soilMoistureLevel === 'wet' ? 90 : 100}
                                        sx={{
                                            height: 8,
                                            borderRadius: 4,
                                            backgroundColor: 'rgba(0, 0, 0, 0.1)',
                                            '& .MuiLinearProgress-bar': {
                                                backgroundColor: getSoilMoistureColor(analysis.soilMoistureLevel),
                                            },
                                        }}
                                    />
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Recomendación de Siembra */}
                    <Grid item xs={12}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" sx={{ mb: 2, color: theme.colores.azul }}>
                                    Recomendación de Siembra
                                </Typography>
                                
                                <Alert
                                    severity={analysis.sowingRecommendation === 'excellent' || analysis.sowingRecommendation === 'good' ? 'success' :
                                             analysis.sowingRecommendation === 'fair' ? 'warning' : 'error'}
                                    icon={analysis.sowingRecommendation === 'excellent' || analysis.sowingRecommendation === 'good' ? <CheckCircle /> :
                                          analysis.sowingRecommendation === 'fair' ? <Warning /> : <Warning />}
                                    sx={{ mb: 2 }}
                                >
                                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                        {getSowingRecommendationText(analysis.sowingRecommendation)}
                                    </Typography>
                                </Alert>

                                {/* Factores de Riesgo */}
                                {analysis.riskFactors.length > 0 && (
                                    <Box sx={{ mb: 2 }}>
                                        <Typography variant="subtitle2" sx={{ mb: 1, color: '#d32f2f' }}>
                                            ⚠️ Factores de Riesgo:
                                        </Typography>
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                            {analysis.riskFactors.map((risk, index) => (
                                                <Chip
                                                    key={index}
                                                    label={risk}
                                                    size="small"
                                                    color="error"
                                                    variant="outlined"
                                                />
                                            ))}
                                        </Box>
                                    </Box>
                                )}

                                {/* Oportunidades */}
                                {analysis.opportunities.length > 0 && (
                                    <Box>
                                        <Typography variant="subtitle2" sx={{ mb: 1, color: '#2e7d32' }}>
                                            ✅ Oportunidades:
                                        </Typography>
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                            {analysis.opportunities.map((opportunity, index) => (
                                                <Chip
                                                    key={index}
                                                    label={opportunity}
                                                    size="small"
                                                    color="success"
                                                    variant="outlined"
                                                />
                                            ))}
                                        </Box>
                                    </Box>
                                )}
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            )}

            {/* Tab 2: Registros Manuales */}
            {activeTab === 1 && (
                <Box>
                    <Card sx={{ mb: 2 }}>
                        <CardContent>
                            <Typography variant="h6" sx={{ mb: 2, color: theme.colores.azul, display: 'flex', alignItems: 'center' }}>
                                <Person sx={{ mr: 1 }} />
                                Resumen de Lluvias Manuales
                            </Typography>
                            
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={4}>
                                    <Box sx={{ textAlign: 'center' }}>
                                        <Typography variant="h4" sx={{ color: theme.colores.azul }}>
                                            {totalLluviasManuales.toFixed(1)} mm
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Total registrado
                                        </Typography>
                                    </Box>
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                    <Box sx={{ textAlign: 'center' }}>
                                        <Typography variant="h4" sx={{ color: theme.colores.azul }}>
                                            {promedioLluviasManuales.toFixed(1)} mm
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Promedio por registro
                                        </Typography>
                                    </Box>
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                    <Box sx={{ textAlign: 'center' }}>
                                        <Typography variant="h4" sx={{ color: theme.colores.azul }}>
                                            {lluviasManuales.length}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Registros totales
                                        </Typography>
                                    </Box>
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>

                    {lluviasManuales.length > 0 ? (
                        <TableContainer component={Paper}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Fecha</TableCell>
                                        <TableCell align="right">Cantidad</TableCell>
                                        <TableCell>Unidad</TableCell>
                                        <TableCell>Observaciones</TableCell>
                                        <TableCell>Registrado</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {lluviasManuales.map((lluvia) => (
                                        <TableRow key={lluvia.id}>
                                            <TableCell>
                                                {new Date(lluvia.fecha).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell align="right">
                                                {lluvia.cantidad}
                                            </TableCell>
                                            <TableCell>
                                                {lluvia.unidad}
                                            </TableCell>
                                            <TableCell>
                                                {lluvia.observaciones || '-'}
                                            </TableCell>
                                            <TableCell>
                                                {new Date(lluvia.registradoEn).toLocaleDateString()}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    ) : (
                        <Alert severity="info">
                            No hay registros de lluvia manuales para este período.
                        </Alert>
                    )}
                </Box>
            )}

            {/* Tab 3: Formulario para registrar lluvia */}
            {activeTab === 2 && onAddLluvia && (
                <LluviaForm 
                    theme={theme} 
                    onAddLluvia={handleAddLluvia}
                    loading={loading}
                />
            )}
        </Box>
    );
}
