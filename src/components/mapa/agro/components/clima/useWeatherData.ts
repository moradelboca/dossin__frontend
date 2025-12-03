import { useState, useEffect, useCallback } from 'react';
import { WeatherData } from './types';
import axios from 'axios';

// Mapeo de períodos a días
const daysMap = {
    '7days': 7,
    '1month': 30,
    '3months': 90,
    '6months': 180
};

export function useWeatherData(ubicacion: any, isDaily: boolean, selectedPeriod: keyof typeof daysMap) {
    const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchWeatherData = useCallback(async () => {
        if (!ubicacion?.latitud || !ubicacion?.longitud) return;

        setLoading(true);
        setError(null);

        try {
            let url = "https://api.open-meteo.com/v1/forecast";
            let params;
            const pastDays = daysMap[selectedPeriod];

            if (isDaily) {
                params = {
                    latitude: ubicacion.latitud,
                    longitude: ubicacion.longitud,
                    daily: [
                        "temperature_2m_max",
                        "temperature_2m_min",
                        "precipitation_sum",
                        "relative_humidity_2m_max",
                        "windspeed_10m_max",
                    ],
                    past_days: pastDays,
                    forecast_days: 7,
                    timezone: "auto",
                };

                const response = await axios.get(
                    `${url}?latitude=${params.latitude}&longitude=${params.longitude}&daily=${params.daily.join(",")}&timezone=${params.timezone}&past_days=${params.past_days}&forecast_days=${params.forecast_days}`,
                    { withCredentials: false }
                );
                const data = response.data;

                if (data.error) {
                    throw new Error(data.reason || 'Error al obtener datos climáticos');
                }

                if (!data.daily) {
                    throw new Error('No se pudieron obtener datos diarios de la API');
                }

                const weatherData = {
                    time: data.daily.time || [],
                    temperature2mMax: data.daily.temperature_2m_max || [],
                    temperature2mMin: data.daily.temperature_2m_min || [],
                    precipitationSum: data.daily.precipitation_sum || [],
                    humidity: data.daily.relative_humidity_2m_max || [],
                    windspeed_10m: data.daily.windspeed_10m_max || [],
                };
                
                setWeatherData(weatherData);
            } else {
                params = {
                    latitude: ubicacion.latitud,
                    longitude: ubicacion.longitud,
                    hourly: [
                        "temperature_2m",
                        "precipitation_probability",
                        "precipitation",
                        "relative_humidity_2m",
                        "windspeed_10m",
                    ],
                    past_days: pastDays,
                    forecast_days: 3,
                    timezone: "auto",
                };

                const response = await axios.get(
                    `${url}?latitude=${params.latitude}&longitude=${params.longitude}&hourly=${params.hourly.join(",")}&timezone=${params.timezone}&past_days=${params.past_days}&forecast_days=${params.forecast_days}`,
                    { withCredentials: false }
                );
                const data = response.data;

                if (data.error) {
                    throw new Error(data.reason || 'Error al obtener datos climáticos');
                }

                if (!data.hourly) {
                    throw new Error('No se pudieron obtener datos horarios de la API');
                }

                const weatherData = {
                    time: data.hourly.time || [],
                    temperature_2m: data.hourly.temperature_2m || [],
                    precipitation_probability: data.hourly.precipitation_probability || [],
                    precipitation: data.hourly.precipitation || [],
                    humidity: data.hourly.relative_humidity_2m || [],
                    windspeed_10m: data.hourly.windspeed_10m || [],
                };
                
                setWeatherData(weatherData);
            }

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error desconocido');
        } finally {
            setLoading(false);
        }
    }, [ubicacion, isDaily, selectedPeriod]);

    useEffect(() => {
        fetchWeatherData();
    }, [fetchWeatherData]);

    return {
        weatherData,
        loading,
        error,
        refetch: fetchWeatherData
    };
}

