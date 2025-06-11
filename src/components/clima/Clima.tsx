import React, { useContext, useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
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
} from "chart.js";
import "chartjs-adapter-date-fns";
import {
    Box,
    Checkbox,
    FormControlLabel,
    Typography,
    useMediaQuery,
} from "@mui/material";
import { ContextoGeneral } from "../Contexto";
import AutocompletarUbicacionMapa from "../cargas/autocompletar/AutocompletarUbicacionMapa";

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

type WeatherData = {
    time: string[];
    temperature_2m?: number[];
    precipitation_probability?: number[];
    precipitation?: number[];
    temperature2mMax?: number[];
    temperature2mMin?: number[];
    precipitationSum?: number[];
};
interface Ubicacion {
    id: number;
    nombre: string;
    provincia?: string;
    pais?: string;
    latitud: number;
    longitud: number;
    tipoUbicacion?: any;
    localidad?: {
        nombre: string;
        provincia: {
            nombre: string;
            pais?: {
                nombre: string;
            };
        };
    };
    urlMaps?: string;
}

const Clima = () => {
    const { theme } = React.useContext(ContextoGeneral);
    const isMobile = useMediaQuery("(max-width:600px)");
    const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
    const [diario, setDiario] = useState(false);
    const { backendURL } = useContext(ContextoGeneral);
    const [ubicaciones, setUbicaciones] = useState<Ubicacion[]>([]);
    const [selectedLocation, setSelectedLocation] = useState<Ubicacion | null>(null);

    useEffect(() => {
        fetch(`${backendURL}/ubicaciones`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "ngrok-skip-browser-warning": "true",
            },
        })
            .then((response) => response.json())
            .then((ubicaciones) => {
                setUbicaciones(ubicaciones);
                if (ubicaciones.length > 0 && !selectedLocation) {
                    setSelectedLocation(ubicaciones[0]);
                }
            })
            .catch(() =>
                console.error("Error al obtener las ubicaciones disponibles")
            );
    }, [backendURL, selectedLocation]);

    useEffect(() => {
        const fetchWeatherData = async () => {
            if (!selectedLocation) return;

            let url = "https://api.open-meteo.com/v1/forecast";
            let params;

            if (diario) {
                params = {
                    latitude: selectedLocation.latitud,
                    longitude: selectedLocation.longitud,
                    daily: [
                        "temperature_2m_max",
                        "temperature_2m_min",
                        "precipitation_sum",
                    ],
                    past_days: 7,
                    timezone: "auto",
                };

                const response = await fetch(
                    `${url}?latitude=${params.latitude}&longitude=${params.longitude}&daily=${params.daily.join(",")}&timezone=${params.timezone}&past_days=${params.past_days}`
                );
                const data = await response.json();

                setWeatherData({
                    time: data.daily.time,
                    temperature2mMax: data.daily.temperature_2m_max,
                    temperature2mMin: data.daily.temperature_2m_min,
                    precipitationSum: data.daily.precipitation_sum,
                });
            } else {
                params = {
                    latitude: selectedLocation.latitud,
                    longitude: selectedLocation.longitud,
                    hourly: [
                        "temperature_2m",
                        "precipitation_probability",
                        "precipitation",
                    ],
                    past_days: 7,
                    timezone: "auto",
                };

                const response = await fetch(
                    `${url}?latitude=${params.latitude}&longitude=${params.longitude}&hourly=${params.hourly.join(",")}&timezone=${params.timezone}&past_days=${params.past_days}`
                );
                const data = await response.json();

                setWeatherData({
                    time: data.hourly.time,
                    temperature_2m: data.hourly.temperature_2m,
                    precipitation_probability:
                        data.hourly.precipitation_probability,
                    precipitation: data.hourly.precipitation,
                });
            }
        };

        fetchWeatherData();
    }, [diario, selectedLocation]);

    const diarioApretado = (event: React.ChangeEvent<HTMLInputElement>) => {
        setDiario(event.target.checked);
    };
 

    const chartData = {
        labels: weatherData?.time,
        datasets: diario
            ? [
                  {
                      label: "Temperatura Máxima (°C)",
                      data: weatherData?.temperature2mMax,
                      borderColor: "rgba(75, 192, 192, 1)",
                      backgroundColor: "rgba(75, 192, 192, 0.2)",
                      fill: false,
                      tension: 0.1,
                  },
                  {
                      label: "Temperatura Mínima (°C)",
                      data: weatherData?.temperature2mMin,
                      borderColor: "rgba(255, 99, 132, 1)",
                      backgroundColor: "rgba(255, 99, 132, 0.2)",
                      fill: false,
                      tension: 0.1,
                  },
                  {
                      label: "Precipitación Acumulada (mm)",
                      data: weatherData?.precipitationSum,
                      borderColor: "rgba(54, 162, 235, 1)",
                      backgroundColor: "rgba(54, 162, 235, 0.2)",
                      fill: false,
                      tension: 0.1,
                  },
              ]
            : [
                  {
                      label: "Temperatura (°C)",
                      data: weatherData?.temperature_2m,
                      borderColor: "rgba(75, 192, 192, 1)",
                      backgroundColor: "rgba(75, 192, 192, 0.2)",
                      fill: false,
                      tension: 0.1,
                  },
                  {
                      label: "Probabilidad de Precipitación (%)",
                      data: weatherData?.precipitation_probability,
                      borderColor: "rgba(255, 159, 64, 1)",
                      backgroundColor: "rgba(255, 159, 64, 0.2)",
                      fill: false,
                      tension: 0.1,
                  },
                  {
                      label: "Precipitación (mm)",
                      data: weatherData?.precipitation,
                      borderColor: "rgba(54, 162, 235, 1)",
                      backgroundColor: "rgba(54, 162, 235, 0.2)",
                      fill: false,
                      tension: 0.1,
                  },
              ],
    };

    const chartOptions = {
        responsive: true,
        scales: {
            x: {
                type: "time" as const,
                time: {
                    unit: "day" as "day",
                    tooltipFormat: "yyyy-MM-dd HH:mm",
                },
            },
            y: {
                // beginAtZero: true, // Quitado para que el eje Y se ajuste automáticamente
            },
        },
    };

    return (
        <Box
            sx={{
                backgroundColor: theme.colores.grisClaro,
                height: "91vh",
                width: "100%",
                padding: 3,
            }}
        >
            <Typography
                variant="h5"
                component="div"
                sx={{
                    color: theme.colores.azul,
                    fontWeight: "bold",
                    fontSize: "2rem",
                    marginLeft: 1,
                }}
            >
                Pronóstico del Tiempo
            </Typography>
            {isMobile ? (
                <Box display="flex" flexDirection="column" gap={2} height="100%" mt={2}>
                    <AutocompletarUbicacionMapa
                        ubicaciones={ubicaciones}
                        title="Buscar ubicación"
                        filtro="Todas"
                        ubicacionSeleccionada={selectedLocation}
                        setUbicacionSeleccionada={setSelectedLocation}
                        sx={{ mb: 2 }}
                    />
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={diario}
                                onChange={diarioApretado}
                                sx={{
                                    color: theme.colores.azul,
                                    '&.Mui-checked': {
                                        color: theme.colores.azul,
                                    },
                                }}
                            />
                        }
                        label="Ver datos diarios"
                        sx={{ mb: 2, alignSelf: 'flex-start' }}
                    />
                    <Box display="flex" alignItems="center" justifyContent="center" sx={{ height: 'calc(100vh - 220px)', width: '100%', maxHeight: { xs: 400, sm: '60vh' } }}>
                        {weatherData ? (
                            <Line data={chartData} options={chartOptions} height={Math.min(400, window.innerHeight * 0.6)} width={undefined} />
                        ) : (
                            <Typography variant="body1">Cargando datos...</Typography>
                        )}
                    </Box>
                </Box>
            ) : (
                <Box display="flex" flexDirection="row" gap={2} height="100%" mt={2}>
                    {/* Panel izquierdo: Autocomplete y tarjetas */}
                    <Box sx={{ minWidth: 320, maxWidth: 340, display: "flex", flexDirection: "column", gap: 2 }}>
                        <AutocompletarUbicacionMapa
                            ubicaciones={ubicaciones}
                            title="Buscar ubicación"
                            filtro="Todas"
                            ubicacionSeleccionada={selectedLocation}
                            setUbicacionSeleccionada={setSelectedLocation}
                            sx={{ mb: 2 }}
                        />
                        <Box sx={{ overflowY: "auto", maxHeight: "60vh", pr: 1 }}>
                            {ubicaciones.map((ubic, idx) => (
                                <Box
                                    key={idx}
                                    onClick={() => setSelectedLocation(ubic)}
                                    sx={{
                                        cursor: "pointer",
                                        border: "1px solid #ccc",
                                        borderRadius: "8px",
                                        p: 2,
                                        mb: 1,
                                        backgroundColor:
                                            selectedLocation && selectedLocation.id === ubic.id
                                                ? theme.colores.azul
                                                : "#fff",
                                        color:
                                            selectedLocation && selectedLocation.id === ubic.id
                                                ? "#fff"
                                                : "#333",
                                        transition: "background 0.2s, color 0.2s",
                                    }}
                                >
                                    <Typography variant="subtitle1" fontWeight="bold">
                                        {ubic.nombre}
                                    </Typography>
                                    <Typography variant="body2">
                                        {ubic.localidad?.nombre ? ubic.localidad.nombre + ", " : ""}
                                        {ubic.localidad?.provincia?.nombre || ""}
                                    </Typography>
                                </Box>
                            ))}
                        </Box>
                    </Box>
                    {/* Panel derecho: Gráfico */}
                    <Box flex={1} display="flex" flexDirection="column" alignItems="center" justifyContent="flex-start" sx={{ height: "100%", maxHeight: "550px" }}>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={diario}
                                    onChange={diarioApretado}
                                    sx={{
                                        color: theme.colores.azul,
                                        '&.Mui-checked': {
                                            color: theme.colores.azul,
                                        },
                                    }}
                                />
                            }
                            label="Ver datos diarios"
                            sx={{ mb: 2, alignSelf: 'flex-start' }}
                        />
                        {weatherData ? (
                            <Line data={chartData} options={chartOptions} />
                        ) : (
                            <Typography variant="body1">Cargando datos...</Typography>
                        )}
                    </Box>
                </Box>
            )}
        </Box>
    );
};

export default Clima;
