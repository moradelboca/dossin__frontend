export interface WeatherData {
    time: string[];
    temperature_2m?: number[];
    precipitation_probability?: number[];
    precipitation?: number[];
    temperature2mMax?: number[];
    temperature2mMin?: number[];
    precipitationSum?: number[];
    humidity?: number[];
    windspeed_10m?: number[];
    soil_moisture_0_to_1cm?: number[];
    soil_moisture_1_to_3cm?: number[];
    soil_moisture_3_to_9cm?: number[];
    soil_moisture_9_to_27cm?: number[];
    soil_moisture_27_to_81cm?: number[];
}

export interface WeatherRecommendation {
    type: 'sowing' | 'harvest' | 'fertilization' | 'irrigation' | 'pest_control' | 'general';
    priority: 'high' | 'medium' | 'low';
    title: string;
    description: string;
    action?: string;
    timeframe?: string;
    conditions?: string[];
}

export interface RainfallAnalysis {
    totalRainfall: number;
    averageDaily: number;
    consecutiveDryDays: number;
    consecutiveWetDays: number;
    soilMoistureLevel: 'dry' | 'optimal' | 'wet' | 'saturated';
    sowingRecommendation: 'excellent' | 'good' | 'fair' | 'poor' | 'not_recommended';
    riskFactors: string[];
    opportunities: string[];
}

export interface CropStage {
    name: string;
    startDay: number;
    endDay: number;
    criticalFactors: string[];
    weatherSensitivity: 'low' | 'medium' | 'high';
    optimalConditions: {
        temperature: { min: number; max: number };
        humidity: { min: number; max: number };
        rainfall: { min: number; max: number };
    };
}

export interface ClimaPanelProps {
    ubicacion: any;
    planificacion?: any;
    onPlanificacionUpdated?: (planificacion: any) => void;
}
