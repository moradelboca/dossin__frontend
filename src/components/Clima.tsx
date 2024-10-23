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
    IconButton,
    Menu,
    MenuItem,
    Typography,
} from "@mui/material";
import { ContextoGeneral } from "./Contexto";
import AutocompletarUbicacionMapa from "./autocompletar/AutocompletarUbicacionMapa";
import { MoreVert } from "@mui/icons-material";

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
    nombre: string;
    provincia: string;
    pais: string;
    latitud: number; // Debe ser un número
    longitud: number; // Debe ser un número
    tipoUbicacion: string; // Asumiendo que hay un tipo de ubicación
}

const Clima = () => {
    const { theme } = React.useContext(ContextoGeneral);
    const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
    const [diario, setDiario] = useState(false);
    const { backendURL } = useContext(ContextoGeneral);
    const [ubicaciones, setUbicaciones] = useState<Ubicacion[]>([]);
    const [selectedLocation, setSelectedLocation] = useState<{
        lat: number;
        lng: number;
    } | null>(null);
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

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
                    setSelectedLocation({
                        lat: ubicaciones[0].latitud,
                        lng: ubicaciones[0].longitud,
                    });
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
                    latitude: selectedLocation.lat,
                    longitude: selectedLocation.lng,
                    daily: [
                        "temperature_2m_max",
                        "temperature_2m_min",
                        "precipitation_sum",
                    ],
                    timezone: "auto",
                };

                const response = await fetch(
                    `${url}?latitude=${params.latitude}&longitude=${params.longitude}&daily=${params.daily.join(",")}&timezone=${params.timezone}`
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
                    latitude: selectedLocation.lat,
                    longitude: selectedLocation.lng,
                    hourly: [
                        "temperature_2m",
                        "precipitation_probability",
                        "precipitation",
                    ],
                    timezone: "auto",
                };

                const response = await fetch(
                    `${url}?latitude=${params.latitude}&longitude=${params.longitude}&hourly=${params.hourly.join(",")}&timezone=${params.timezone}`
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
    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };
    if (!weatherData)
        return (
            <>
                <Box
                    sx={{
                        backgroundColor: theme.colores.grisClaro,
                        height: "91vh",
                        width: "96vw",
                        padding: 3,
                    }}
                >
                    <Box
                        display="flex"
                        flexDirection="row"
                        gap={2}
                        alignItems="center"
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

                        <IconButton
                            aria-label="more"
                            aria-controls={open ? "menu" : undefined}
                            aria-haspopup="true"
                            onClick={handleClick}
                            sx={{
                                padding: 0,
                            }}
                        >
                            <MoreVert />
                        </IconButton>

                        <Menu
                            id="menu"
                            anchorEl={anchorEl}
                            open={open}
                            onClose={handleClose}
                            MenuListProps={{
                                "aria-labelledby": "menu-button",
                            }}
                            PaperProps={{
                                style: {
                                    maxHeight: 48 * 4.5,
                                    width: "40ch",
                                },
                            }}
                        >
                            <MenuItem>
                                <AutocompletarUbicacionMapa
                                    ubicaciones={ubicaciones}
                                    title="Ubicación de Carga"
                                    filtro="Todas"
                                    onSelectLocation={setSelectedLocation}
                                />
                            </MenuItem>

                            <MenuItem>
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            onChange={diarioApretado}
                                            sx={{
                                                color: "#163660",
                                                "&.Mui-checked": {
                                                    color: "#163660",
                                                },
                                            }}
                                        />
                                    }
                                    label="Ver datos diarios"
                                />
                            </MenuItem>
                        </Menu>
                    </Box>
                </Box>
                <div>Loading...</div>
            </>
        );

    const chartData = {
        labels: weatherData.time,
        datasets: diario
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
        scales: {
            x: {
                type: "time" as const,
                time: {
                    unit: "day" as "day",
                    tooltipFormat: "yyyy-MM-dd HH:mm",
                },
            },
            y: {
                beginAtZero: true,
            },
        },
    };

    return (
        <Box
            sx={{
                backgroundColor: theme.colores.grisClaro,
                height: "91vh",
                width: "96vw",
                padding: 3,
            }}
        >
            <Typography
                variant="h5"
                component="div"
                sx={{
                    color: theme.colores.azul,
                    fontWeight: "bold",
                    mb: 2,
                    fontSize: "2rem",
                    pb: 1,
                    marginLeft: 1,
                }}
            >
                Pronóstico del Tiempo
            </Typography>
            <Box display="flex" flexDirection="row" gap={2} alignItems="center">
                {/* Menú con icono */}
                <IconButton
                    aria-label="more"
                    aria-controls={open ? "menu" : undefined}
                    aria-haspopup="true"
                    onClick={handleClick}
                >
                    <MoreVert />
                </IconButton>

                <Menu
                    id="menu"
                    anchorEl={anchorEl}
                    open={open}
                    onClose={handleClose}
                    MenuListProps={{
                        "aria-labelledby": "menu-button",
                    }}
                    PaperProps={{
                        style: {
                            maxHeight: 48 * 4.5,
                            width: "20ch",
                        },
                    }}
                >
                    {/* Contenido del menú */}
                    <MenuItem>
                        <AutocompletarUbicacionMapa
                            ubicaciones={ubicaciones}
                            title="Ubicación de Carga"
                            filtro="Todas"
                            onSelectLocation={setSelectedLocation}
                        />
                    </MenuItem>

                    <MenuItem>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    onChange={diarioApretado}
                                    sx={{
                                        color: "#163660",
                                        "&.Mui-checked": {
                                            color: "#163660",
                                        },
                                    }}
                                />
                            }
                            label="Ver datos diarios"
                        />
                    </MenuItem>
                </Menu>
            </Box>
            <Box sx={{ height: "81vh", width: "100%" }}>
                <div style={{ height: "100%", width: "100%" }}>
                    <Line data={chartData} options={chartOptions} />
                </div>
            </Box>
        </Box>
    );
};

export default Clima;
