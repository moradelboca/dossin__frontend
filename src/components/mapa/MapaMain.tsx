import React, { useContext, useEffect, useState } from "react";
import {
    Box,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Autocomplete,
    TextField,
    IconButton,
    Stack,
} from "@mui/material";
import L from "leaflet";
import {
    MapContainer,
    TileLayer,
    Marker,
    LayersControl,
    Popup,
    useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import pin from "../../../images/pinbox.png";
import cargamos from "../../../images/pinBALA2.png";
import ok from "../../../images/pinokaaa.png";
import { ContextoGeneral } from "../Contexto";
import AutocompletarUbicacionMapa from "../cargas/autocompletar/AutocompletarUbicacionMapa";
import { AddLocationAltOutlined } from "@mui/icons-material";
import {
    NumericFormat,
    NumericFormatProps,
    PatternFormat,
} from "react-number-format";

const { BaseLayer, Overlay } = LayersControl;

const balanzaIcon = L.icon({
    iconUrl: cargamos,
    iconSize: [45, 51],
    iconAnchor: [22, 51],
    popupAnchor: [0, -28],
});
const okIcon = L.icon({
    iconUrl: ok,
    iconSize: [45, 51],
    iconAnchor: [22, 51],
    popupAnchor: [0, -28],
});

const pinIcon = L.icon({
    iconUrl: pin,
    iconSize: [45, 51],
    iconAnchor: [22, 51],
    popupAnchor: [0, -28],
});

interface Ubicacion {
    nombre: string;
    provincia: string;
    pais: string;
    latitud: number;
    longitud: number;
    tipoUbicacion: string;
    id: number;
}

// Componente para manejar el zoom
function ZoomToLocation({
    lat,
    lng,
}: {
    lat: number | undefined;
    lng: number | undefined;
}) {
    const map = useMap();

    useEffect(() => {
        if (lat !== undefined && lng !== undefined) {
            map.flyTo([lat, lng], 15);
        }
    }, [lat, lng, map]);

    return null;
}
interface CustomProps {
    onChange: (event: { target: { name: string; value: string } }) => void;
    name: string;
}
const latLongFormat = React.forwardRef<NumericFormatProps, CustomProps>(
    function NumericFormatCustom(props, ref) {
        const { onChange, ...other } = props;

        const isAllowed = (values: any) => {
            const { formattedValue } = values;
            // Remove the prefix and separators to count only the digits
            const numericValue = formattedValue.replace(/[$.,]/g, "");
            return numericValue.length <= 12;
        };

        return (
            <NumericFormat
                {...other}
                getInputRef={ref}
                thousandSeparator="."
                decimalSeparator=","
                prefix=""
                decimalScale={2}
                fixedDecimalScale={true}
                allowNegative={true}
                isAllowed={isAllowed}
                onValueChange={(values) => {
                    onChange({
                        target: {
                            name: props.name,
                            value: values.value,
                        },
                    });
                }}
            />
        );
    }
);

export function MapaMain() {
    const [openDialog, setOpenDialog] = useState(false);
    const { backendURL, theme } = useContext(ContextoGeneral);
    const [ubicaciones, setUbicaciones] = useState<Ubicacion[]>([]);
    const [selectedLocation, setSelectedLocation] = useState<{
        lat: number;
        lng: number;
    } | null>(null);
    const [tipoUbicacionSeleccionado, setTipoUbicacionSeleccionado] =
        useState<string>("Todas");

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
            })
            .catch(() =>
                console.error("Error al obtener las ubicaciones disponibles")
            );
    }, []);

    const handleMarkerClick = () => {
        setOpenDialog(true);
    };

    const handleClose = () => {
        setOpenDialog(false);
    };

    const tipoUbicacionOptions = ["Todas", "Carga", "Descarga", "Balanza"];

    return (
        <Box position={"relative"}>
            <Box
                width={"fit-content"}
                height={"fit-content"}
                sx={{
                    zIndex: 1000,
                    position: "absolute",
                    top: 10,
                    left: 80,
                    display: "flex",
                    gap: "10px",
                }}
            >
                <AutocompletarUbicacionMapa
                    ubicaciones={ubicaciones}
                    title="Ubicación de Carga"
                    filtro={tipoUbicacionSeleccionado}
                    onSelectLocation={setSelectedLocation}
                />
                <Autocomplete
                    options={tipoUbicacionOptions}
                    renderInput={(params) => (
                        <TextField {...params} label="Tipo" />
                    )}
                    sx={{
                        width: 100,
                        background: "white",
                        borderRadius: "6px",
                    }}
                    onChange={(event, value) => {
                        setTipoUbicacionSeleccionado(value || "Todas");
                    }}
                    defaultValue={tipoUbicacionOptions[0]}
                />
                <IconButton
                    sx={{
                        backgroundColor: theme.colores.azul,
                        color: theme.colores.gris,
                        width: "55px",
                        "&:hover": {
                            backgroundColor: theme.colores.azulOscuro,
                        },
                    }}
                    onClick={() => handleMarkerClick()}
                >
                    <AddLocationAltOutlined />
                </IconButton>
            </Box>
            <MapContainer
                center={[-33.099765, -64.3654802]}
                zoom={5}
                scrollWheelZoom={false}
                style={{ height: "91vh" }}
            >
                <ZoomToLocation
                    lat={selectedLocation?.lat}
                    lng={selectedLocation?.lng}
                />

                <LayersControl position="topright">
                    <BaseLayer checked name="CartoDB Positron">
                        <TileLayer
                            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                            subdomains="abcd"
                            maxZoom={20}
                        />
                    </BaseLayer>
                    <BaseLayer name="Esri WorldImagery">
                        <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" />
                    </BaseLayer>
                    <BaseLayer name="OpenStreetMap">
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    </BaseLayer>

                    {ubicaciones.map((ubicacion, index) => (
                        <Overlay
                            key={index}
                            checked
                            name={`Ubicación ${ubicacion.id}`}
                        >
                            <Marker
                                position={[
                                    ubicacion.latitud,
                                    ubicacion.longitud,
                                ]}
                                icon={
                                    ubicacion.tipoUbicacion === "Balanza"
                                        ? balanzaIcon
                                        : pinIcon
                                }
                            >
                                <Popup>
                                    <strong>{ubicacion.nombre}</strong>
                                    <br />
                                    Provincia: {ubicacion.provincia}
                                    <br />
                                    País: {ubicacion.pais}
                                    <br />
                                    Tipo: {ubicacion.tipoUbicacion}
                                    <br />
                                    <Button
                                        variant="contained"
                                        size="small"
                                        onClick={() => handleMarkerClick()}
                                    >
                                        Ver más
                                    </Button>
                                </Popup>
                            </Marker>
                        </Overlay>
                    ))}
                </LayersControl>
            </MapContainer>

            <Dialog open={openDialog} onClose={handleClose}>
                <DialogTitle>Detalles del Punto</DialogTitle>
                <DialogContent>
                    <Box
                        display="flex"
                        flexDirection="column"
                        gap={2}
                        alignContent={"center"}
                        alignItems={"center"}
                        marginTop={2}
                        marginBottom={1}
                    >
                        <TextField
                            id="outlined-basic"
                            label="URL Google Maps"
                            variant="outlined"
                            slotProps={{
                                htmlInput: {
                                    maxLength: 200,
                                },
                            }}
                            sx={{ width: 350 }}
                        />
                        <TextField
                            id="outlined-basic"
                            label="Nombre"
                            variant="outlined"
                            slotProps={{
                                htmlInput: {
                                    maxLength: 50,
                                },
                            }}
                            sx={{ width: 350 }}
                        />
                        <Stack direction="row" spacing={2}>
                            <TextField
                                label="Latitud"
                                name="numberformat"
                                id="formatted-numberformat-input"
                                slotProps={{
                                    input: {
                                        inputComponent: latLongFormat as any,
                                    },
                                }}
                                variant="outlined"
                                sx={{ width: 350 }}
                            />
                        </Stack>
                        <Stack direction="row" spacing={2}>
                            <TextField
                                label="Longitud"
                                name="numberformat"
                                id="formatted-numberformat-input"
                                slotProps={{
                                    input: {
                                        inputComponent: latLongFormat as any,
                                    },
                                }}
                                variant="outlined"
                                sx={{ width: 350 }}
                            />
                        </Stack>
                        <Autocomplete
                            options={tipoUbicacionOptions}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Tipo"
                                    sx={{ width: 350 }}
                                />
                            )}
                            sx={{
                                width: 350,
                                background: "white",
                                borderRadius: "6px",
                            }}
                            onChange={(event, value) => {
                                setTipoUbicacionSeleccionado(value || "Todas");
                            }}
                            defaultValue={tipoUbicacionOptions[0]}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cerrar</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
