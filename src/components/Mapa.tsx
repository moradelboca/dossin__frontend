import { Box } from "@mui/material";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import pin from "../../images/pin.png";
import cargamos from "../../images/cargamos.png";
import L from "leaflet";

const customIcon1 = L.icon({
    iconUrl: cargamos,
    iconSize: [56, 56],
    iconAnchor: [28, 28],
    popupAnchor: [0, -28],
});

const customIcon = L.icon({
    iconUrl: pin,
    iconSize: [56, 56],
    iconAnchor: [28, 28],
    popupAnchor: [0, -28],
});

export function Mapa(props: any) {
    const { coordenadas } = props;

    return (
        <Box>
            <MapContainer
                center={coordenadas}
                zoom={10}
                scrollWheelZoom={false}
                style={{ height: "250px" }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={coordenadas} icon={customIcon}></Marker>
            </MapContainer>
        </Box>
    );
}
