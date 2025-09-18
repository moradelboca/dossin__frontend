import { useState, useCallback } from 'react';
import { WeatherData, WeatherRecommendation, RainfallAnalysis as RainfallAnalysisType } from './types';

// Mapeo de períodos a días
const daysMap = {
    '7days': 7,
    '1month': 30,
    '3months': 90,
    '6months': 180
};

export function useWeatherAnalysis() {
    const [rainfallAnalysis, setRainfallAnalysis] = useState<RainfallAnalysisType | null>(null);
    const [recommendations, setRecommendations] = useState<WeatherRecommendation[]>([]);

    const analyzeRainfallAndGenerateRecommendations = useCallback((
        weatherData: WeatherData, 
        isDaily: boolean, 
        selectedPeriod: keyof typeof daysMap
    ) => {
        if (!weatherData) {
            console.error('WeatherData is undefined');
            return;
        }

        const precipitationData = isDaily ? weatherData.precipitationSum : weatherData.precipitation;
        
        if (!precipitationData || !Array.isArray(precipitationData)) {
            console.error('Precipitation data is not available or not an array:', precipitationData);
            return;
        }
        
        // Calcular análisis de precipitaciones
        const totalRainfall = precipitationData.reduce((sum: number, val: number) => sum + (val || 0), 0);
        const periodDays = daysMap[selectedPeriod];
        const averageDaily = totalRainfall / periodDays;
        
        // Calcular días consecutivos secos y húmedos
        let consecutiveDryDays = 0;
        let consecutiveWetDays = 0;
        let maxDryDays = 0;
        let maxWetDays = 0;
        
        for (let i = 0; i < precipitationData.length; i++) {
            const hasRain = (precipitationData[i] || 0) > 0.1;
            
            if (hasRain) {
                consecutiveWetDays++;
                maxDryDays = Math.max(maxDryDays, consecutiveDryDays);
                consecutiveDryDays = 0;
            } else {
                consecutiveDryDays++;
                maxWetDays = Math.max(maxWetDays, consecutiveWetDays);
                consecutiveWetDays = 0;
            }
        }
        
        // Determinar nivel de humedad del suelo
        let soilMoistureLevel: 'dry' | 'optimal' | 'wet' | 'saturated' = 'optimal';
        if (totalRainfall < 10) {
            soilMoistureLevel = 'dry';
        } else if (totalRainfall > 50) {
            soilMoistureLevel = 'wet';
        } else if (totalRainfall > 100) {
            soilMoistureLevel = 'saturated';
        }
        
        // Recomendación de siembra
        let sowingRecommendation: 'excellent' | 'good' | 'fair' | 'poor' | 'not_recommended' = 'fair';
        const riskFactors: string[] = [];
        const opportunities: string[] = [];
        
        if (totalRainfall >= 20 && totalRainfall <= 40 && maxDryDays <= 3) {
            sowingRecommendation = 'excellent';
            opportunities.push('Condiciones ideales para siembra');
        } else if (totalRainfall >= 15 && totalRainfall <= 50) {
            sowingRecommendation = 'good';
            opportunities.push('Buenas condiciones para siembra');
        } else if (totalRainfall < 10) {
            sowingRecommendation = 'poor';
            riskFactors.push('Sequía prolongada');
            riskFactors.push('Suelo muy seco');
        } else if (totalRainfall > 80) {
            sowingRecommendation = 'not_recommended';
            riskFactors.push('Exceso de humedad');
            riskFactors.push('Riesgo de encharcamiento');
        }
        
        if (maxDryDays > 5) {
            riskFactors.push('Período seco prolongado');
        }
        
        if (averageDaily > 10) {
            riskFactors.push('Lluvias intensas');
        }
        
        const analysis: RainfallAnalysisType = {
            totalRainfall,
            averageDaily,
            consecutiveDryDays: maxDryDays,
            consecutiveWetDays: maxWetDays,
            soilMoistureLevel,
            sowingRecommendation,
            riskFactors,
            opportunities,
        };
        
        setRainfallAnalysis(analysis);
        
        // Generar recomendaciones basadas en el análisis
        const newRecommendations: WeatherRecommendation[] = [];
        
        // Recomendaciones de siembra
        if (sowingRecommendation === 'excellent' || sowingRecommendation === 'good') {
            newRecommendations.push({
                type: 'sowing',
                priority: 'high',
                title: 'Momento óptimo para siembra',
                description: `Las condiciones climáticas son favorables para la siembra. Precipitación total: ${totalRainfall.toFixed(1)}mm en los últimos ${periodDays} días.`,
                action: 'Proceder con la siembra en los próximos 2-3 días',
                timeframe: 'Próximos 2-3 días',
                conditions: ['Humedad del suelo óptima', 'Sin lluvias intensas previstas'],
            });
        } else if (sowingRecommendation === 'poor' || sowingRecommendation === 'not_recommended') {
            newRecommendations.push({
                type: 'sowing',
                priority: 'high',
                title: 'No recomendado para siembra',
                description: `Las condiciones actuales no son adecuadas para la siembra. ${riskFactors.join(', ')}.`,
                action: 'Esperar mejores condiciones climáticas',
                timeframe: 'Monitorear pronóstico',
                conditions: riskFactors,
            });
        }
        
        // Recomendaciones de pulverización (basadas en viento)
        if (weatherData.windspeed_10m) {
            const avgWindSpeed = weatherData.windspeed_10m.reduce((sum, val) => sum + (val || 0), 0) / weatherData.windspeed_10m.length;
            
            if (avgWindSpeed > 15) {
                newRecommendations.push({
                    type: 'pest_control',
                    priority: 'high',
                    title: 'Suspender pulverizaciones',
                    description: `Viento fuerte (${avgWindSpeed.toFixed(1)} km/h). Riesgo de deriva.`,
                    action: 'Esperar viento < 15 km/h',
                    timeframe: 'Monitorear condiciones',
                    conditions: ['Viento fuerte', 'Riesgo de deriva'],
                });
            } else if (avgWindSpeed >= 5 && avgWindSpeed <= 15) {
                newRecommendations.push({
                    type: 'pest_control',
                    priority: 'medium',
                    title: 'Condiciones ideales para pulverización',
                    description: `Viento adecuado (${avgWindSpeed.toFixed(1)} km/h) para pulverizaciones.`,
                    action: 'Proceder con pulverización',
                    timeframe: 'Próximas 4-6 horas',
                    conditions: ['Viento óptimo', 'Sin lluvias previstas'],
                });
            }
        }
        
        // Recomendaciones de fertilización
        if (totalRainfall >= 15 && totalRainfall <= 30) {
            newRecommendations.push({
                type: 'fertilization',
                priority: 'medium',
                title: 'Condiciones ideales para fertilización',
                description: 'La humedad del suelo es adecuada para la aplicación de fertilizantes.',
                action: 'Aplicar fertilizantes según plan de cultivo',
                timeframe: 'Próximos 3-5 días',
                conditions: ['Humedad adecuada', 'Sin lluvias intensas'],
            });
        }
        
        setRecommendations(newRecommendations);
    }, []);

    return {
        rainfallAnalysis,
        recommendations,
        analyzeRainfallAndGenerateRecommendations
    };
}

