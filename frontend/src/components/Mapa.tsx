import { Box } from "@mui/material";
import { MapContainer, TileLayer, Marker } from "react-leaflet";

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
                <Marker position={coordenadas}></Marker>
            </MapContainer>
        </Box>
    );
}
