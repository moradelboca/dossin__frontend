import React, { useState, useContext, useEffect } from 'react';
import {
    Box,
    Typography,
    FormControlLabel,
    Checkbox,
    CircularProgress,
    Alert,
    Tabs,
    Tab,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    useMediaQuery,
} from '@mui/material';
import {
    CloudQueue,
    WaterDrop,
    Agriculture,
} from '@mui/icons-material';
import { ContextoGeneral } from '../../../../Contexto';
import { WeatherChart } from './WeatherChart';
import { RainfallAnalysis } from './RainfallAnalysis';
import { WeatherRecommendations } from './WeatherRecommendations';
import { useWeatherData } from './useWeatherData';
import { useWeatherAnalysis } from './useWeatherAnalysis';
import { ClimaPanelProps } from './types';
import { RegistroLluvia } from '../../../../../types/agro';
import { supabaseAgro } from '../../../../../lib/supabase';

// Mapeo de períodos a días
const daysMap = {
    '7days': 7,
    '1month': 30,
    '3months': 90,
    '6months': 180
};

export function ClimaPanel({ ubicacion, planificacion, onPlanificacionUpdated }: ClimaPanelProps) {
    const { theme } = useContext(ContextoGeneral);
    const isMobile = useMediaQuery('(max-width:600px)');
    const [isDaily, setIsDaily] = useState(true);
    const [selectedPeriod, setSelectedPeriod] = useState<'7days' | '1month' | '3months' | '6months'>('7days');
    const [activeTab, setActiveTab] = useState(0);
    const [lluviasManuales, setLluviasManuales] = useState<RegistroLluvia[]>([]);
    const [loadingLluvias, setLoadingLluvias] = useState(false);

    // Hooks personalizados
    const { weatherData, loading, error } = useWeatherData(ubicacion, isDaily, selectedPeriod);
    const { rainfallAnalysis, recommendations, analyzeRainfallAndGenerateRecommendations } = useWeatherAnalysis();

    // Cargar lluvias manuales cuando cambie la planificación
    useEffect(() => {
        if (planificacion?.lluvias) {
            setLluviasManuales(planificacion.lluvias.filter((lluvia: RegistroLluvia) => lluvia.fuente === 'manual'));
        }
    }, [planificacion]);

    // Analizar datos cuando cambien
    useEffect(() => {
        if (weatherData) {
            analyzeRainfallAndGenerateRecommendations(weatherData, isDaily, selectedPeriod);
        }
    }, [weatherData, isDaily, selectedPeriod, analyzeRainfallAndGenerateRecommendations]);

    const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
        setActiveTab(newValue);
    };

    const handleDailyChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setIsDaily(event.target.checked);
    };

    const handlePeriodChange = (event: any) => {
        setSelectedPeriod(event.target.value as '7days' | '1month' | '3months' | '6months');
    };

    const handleAddLluvia = async (lluviaData: Omit<RegistroLluvia, 'id' | 'registradoPor' | 'registradoEn' | 'fuente'>) => {
        if (!planificacion) return;

        setLoadingLluvias(true);
        try {
            const nuevaLluvia: RegistroLluvia = {
                ...lluviaData,
                id: `lluvia-${Date.now()}`,
                registradoPor: 'usuario', // TODO: Obtener del contexto de usuario
                registradoEn: new Date().toISOString(),
                fuente: 'manual'
            };

            const lluviasActualizadas = [...(planificacion.lluvias || []), nuevaLluvia];
            
            const { error } = await supabaseAgro
                .from('PlaneacionLote')
                .update({ 
                    lluvias: lluviasActualizadas,
                    updated_at: new Date().toISOString()
                })
                .eq('campania', planificacion.campania)
                .eq('idLote', planificacion.idLote);

            if (error) throw error;

            // Actualizar estado local
            setLluviasManuales(prev => [...prev, nuevaLluvia]);
            
            // Notificar al componente padre
            if (onPlanificacionUpdated) {
                onPlanificacionUpdated({
                    ...planificacion,
                    lluvias: lluviasActualizadas
                });
            }
        } catch (error) {
            console.error('Error al registrar lluvia:', error);
        } finally {
            setLoadingLluvias(false);
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
                <CircularProgress />
                <Typography sx={{ ml: 2 }}>Cargando datos climáticos...</Typography>
            </Box>
        );
    }

    if (error) {
        return (
            <Alert severity="error" sx={{ m: 2 }}>
                <Typography variant="h6">Error al cargar datos climáticos</Typography>
                <Typography variant="body2">{error}</Typography>
            </Alert>
        );
    }

    return (
        <Box>
            {/* Header con controles */}
            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                <Typography variant="h6" sx={{ color: theme.colores.azul, mb: 2, display: 'flex', alignItems: 'center' }}>
                    <CloudQueue sx={{ mr: 1 }} />
                    Análisis Climático - {ubicacion?.nombre}
                </Typography>
                
                <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', alignItems: 'center' }}>
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={isDaily}
                                onChange={handleDailyChange}
                                sx={{
                                    color: theme.colores.azul,
                                    '&.Mui-checked': {
                                        color: theme.colores.azul,
                                    },
                                }}
                            />
                        }
                        label="Ver datos diarios"
                    />
                    
                    <FormControl sx={{ minWidth: 200 }}>
                        <InputLabel>Período de análisis</InputLabel>
                        <Select
                            value={selectedPeriod}
                            onChange={handlePeriodChange}
                            label="Período de análisis"
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                        borderColor: theme.colores.azul,
                                    },
                                },
                            }}
                        >
                            <MenuItem value="7days">Últimos 7 días</MenuItem>
                            <MenuItem value="1month">Último mes</MenuItem>
                            <MenuItem value="3months">Último trimestre</MenuItem>
                            <MenuItem value="6months">Últimos 6 meses</MenuItem>
                        </Select>
                    </FormControl>
                </Box>
            </Box>

            {/* Tabs de contenido */}
            <Box>
                <Tabs
                    value={activeTab}
                    onChange={handleTabChange}
                    sx={{
                        borderBottom: 1,
                        borderColor: 'divider',
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
                    <Tab icon={<CloudQueue />} label="Gráficos" iconPosition="start" />
                    <Tab icon={<WaterDrop />} label="Análisis de Lluvias" iconPosition="start" />
                    <Tab icon={<Agriculture />} label="Recomendaciones" iconPosition="start" />
                </Tabs>

                <Box sx={{ p: 2 }}>
                    {activeTab === 0 && (
                        <Box sx={{ 
                            height: isMobile ? 300 : 400, 
                            width: '100%',
                            position: 'relative'
                        }}>
                            <WeatherChart weatherData={weatherData} isDaily={isDaily} theme={theme} />
                        </Box>
                    )}

                    {activeTab === 1 && rainfallAnalysis && (
                        <RainfallAnalysis 
                            analysis={rainfallAnalysis} 
                            theme={theme} 
                            periodDays={daysMap[selectedPeriod]}
                            lluviasManuales={lluviasManuales}
                            onAddLluvia={handleAddLluvia}
                            loading={loadingLluvias}
                        />
                    )}

                    {activeTab === 2 && (
                        <WeatherRecommendations 
                            recommendations={recommendations} 
                            theme={theme} 
                        />
                    )}
                </Box>
            </Box>
        </Box>
    );
}