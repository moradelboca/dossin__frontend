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
import pin from "../../images/pin.png";
import cargamos from "../../images/cargamos.png";
import { ContextoGeneral } from "./Contexto";
import AutocompletarUbicacionMapa from "./autocompletar/AutocompletarUbicacionMapa";
import { AddLocationAltOutlined } from "@mui/icons-material";

const { BaseLayer, Overlay } = LayersControl;

const customIcon = L.icon({
    iconUrl: pin,
    iconSize: [56, 56],
    iconAnchor: [28, 28],
    popupAnchor: [0, -28],
});

const customIcon1 = L.icon({
    iconUrl: cargamos,
    iconSize: [56, 56],
    iconAnchor: [28, 28],
    popupAnchor: [0, -28],
});

// Define la interfaz para la ubicación
interface Ubicacion {
    nombre: string;
    provincia: string;
    pais: string;
    latitud: number; // Debe ser un número
    longitud: number; // Debe ser un número
    tipoUbicacion: string; // Asumiendo que hay un tipo de ubicación
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

export function MapaMain() {
    const [openDialog, setOpenDialog] = useState(false);
    const { backendURL } = useContext(ContextoGeneral);
    const [ubicaciones, setUbicaciones] = useState<Ubicacion[]>([]);
    const [selectedLocation, setSelectedLocation] = useState<{
        lat: number;
        lng: number;
    } | null>(null);
    const [tipoUbicacionSeleccionado, setTipoUbicacionSeleccionado] =
        useState<string>("Carga");

    useEffect(() => {
        fetch(`${backendURL}/ubicaciones`)
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
        <Box>
            <Box
                width={"fit-content"}
                height={"fit-content"}
                sx={{
                    zIndex: 1000,
                    position: "absolute",
                    top: 80,
                    left: 130,
                    display: "flex",
                    gap: "10px",
                }}
            >
                {/* Componente de autocompletar ubicación */}
                <AutocompletarUbicacionMapa
                    ubicaciones={ubicaciones}
                    title="Ubicación de Carga"
                    filtro={tipoUbicacionSeleccionado} // Pasamos el tipo de ubicación seleccionado
                    onSelectLocation={setSelectedLocation} // Actualizar la ubicación seleccionada
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
                        setTipoUbicacionSeleccionado(value || "Carga"); // Actualizamos el filtro según la selección
                    }}
                />
                <IconButton sx={{ color: "white" }}>
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
                    <BaseLayer checked name="OpenStreetMap">
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                    </BaseLayer>

                    <BaseLayer name="Esri WorldImagery">
                        <TileLayer
                            attribution="Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"
                            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                        />
                    </BaseLayer>

                    {ubicaciones.map((ubicacion, index) => (
                        <Overlay
                            key={index}
                            checked
                            name={`Ubicación ${index + 1}`}
                        >
                            <Marker
                                position={[
                                    ubicacion.latitud,
                                    ubicacion.longitud,
                                ]}
                                icon={
                                    ubicacion.tipoUbicacion === "Balanza"
                                        ? customIcon1
                                        : customIcon
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
                    <p>
                        Coordenadas:{" "}
                        {selectedLocation
                            ? `${selectedLocation.lat}, ${selectedLocation.lng}`
                            : "N/A"}
                    </p>
                    <p>Descripción: Este es un ejemplo de diálogo.</p>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cerrar</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
