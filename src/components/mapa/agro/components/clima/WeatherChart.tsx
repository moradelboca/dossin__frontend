// import React from 'react'; // No necesario en React 17+
import { Line } from 'react-chartjs-2';
import {
    Chart,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    TimeScale,
} from 'chart.js';
import 'chartjs-adapter-date-fns';
import { Box, Typography, useMediaQuery } from '@mui/material';
import { WeatherData } from './types';

Chart.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    TimeScale
);

interface WeatherChartProps {
    weatherData: WeatherData | null;
    isDaily: boolean;
    theme: any;
}

export function WeatherChart({ weatherData, isDaily }: WeatherChartProps) {
    const isMobile = useMediaQuery('(max-width:600px)');

    if (!weatherData) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
                <Typography variant="body1">Cargando datos climáticos...</Typography>
            </Box>
        );
    }

    const chartData = {
        labels: weatherData.time,
        datasets: isDaily
            ? [
                  {
                      label: "Temperatura Máxima (°C)",
                      data: weatherData.temperature2mMax,
                      borderColor: "rgba(75, 192, 192, 1)",
                      backgroundColor: "rgba(75, 192, 192, 0.2)",
                      fill: false,
                      tension: 0.1,
                  },
                  {
                      label: "Temperatura Mínima (°C)",
                      data: weatherData.temperature2mMin,
                      borderColor: "rgba(255, 99, 132, 1)",
                      backgroundColor: "rgba(255, 99, 132, 0.2)",
                      fill: false,
                      tension: 0.1,
                  },
                  {
                      label: "Precipitación Acumulada (mm)",
                      data: weatherData.precipitationSum,
                      borderColor: "rgba(54, 162, 235, 1)",
                      backgroundColor: "rgba(54, 162, 235, 0.2)",
                      fill: false,
                      tension: 0.1,
                  },
              ]
            : [
                  {
                      label: "Temperatura (°C)",
                      data: weatherData.temperature_2m,
                      borderColor: "rgba(75, 192, 192, 1)",
                      backgroundColor: "rgba(75, 192, 192, 0.2)",
                      fill: false,
                      tension: 0.1,
                  },
                  {
                      label: "Probabilidad de Precipitación (%)",
                      data: weatherData.precipitation_probability,
                      borderColor: "rgba(255, 159, 64, 1)",
                      backgroundColor: "rgba(255, 159, 64, 0.2)",
                      fill: false,
                      tension: 0.1,
                  },
                  {
                      label: "Precipitación (mm)",
                      data: weatherData.precipitation,
                      borderColor: "rgba(54, 162, 235, 1)",
                      backgroundColor: "rgba(54, 162, 235, 0.2)",
                      fill: false,
                      tension: 0.1,
                  },
              ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            x: {
                type: "time" as const,
                time: {
                    unit: isDaily ? "day" as const : "hour" as const,
                    tooltipFormat: isDaily ? "yyyy-MM-dd" : "yyyy-MM-dd HH:mm",
                },
            },
            y: {
                // beginAtZero: true, // Quitado para que el eje Y se ajuste automáticamente
            },
        },
    };

    return (
        <Box sx={{ 
            height: isMobile ? 300 : 400, 
            width: '100%',
            position: 'relative'
        }}>
            <Line data={chartData} options={chartOptions} />
        </Box>
    );
}
