import { Box } from "@mui/material";
import {
    MapContainer,
    TileLayer,
    Marker,
    LayersControl,
    Polyline,
    useMap,
} from "react-leaflet";

import L from "leaflet";
import { useEffect, useState } from "react";
const { BaseLayer } = LayersControl;

const balanzaIcon = L.icon({
    iconUrl: "https://i.imgur.com/yFbV2Nx.png",
    iconSize: [45, 51],
    iconAnchor: [22, 51],
    popupAnchor: [0, -28],
});
const okIcon = L.icon({
    iconUrl: "https://i.imgur.com/GaUWXH5.png",
    iconSize: [45, 51],
    iconAnchor: [22, 51],
    popupAnchor: [0, -28],
});

const pinIcon = L.icon({
    iconUrl: "https://i.imgur.com/9Try738.png",
    iconSize: [45, 51],
    iconAnchor: [22, 51],
    popupAnchor: [0, -28],
});

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
            map.flyTo([lat, lng], 5);
        }
    }, [lat, lng, map]);

    return null;
}

export function Mapa2(props: any) {
    const { coordenadasCarga, coordenadasDescarga, coordenadasBalanza } = props;

    const [latitudCentro, setLatitudCentro] = useState<number | undefined>();
    const [longitudCentro, setLongitudCentro] = useState<number | undefined>();

    useEffect(() => {
        if (coordenadasCarga && coordenadasDescarga) {
            const nuevaLat = (coordenadasCarga[0] + coordenadasDescarga[0]) / 2;
            const nuevaLng = (coordenadasCarga[1] + coordenadasDescarga[1]) / 2;
            setLatitudCentro(nuevaLat);
            setLongitudCentro(nuevaLng);
        }
    }, [coordenadasCarga, coordenadasDescarga]);

    const positions = [
        coordenadasCarga,
        coordenadasBalanza,
        coordenadasDescarga,
    ].filter((coord) => coord[0] !== undefined);

    return (
        <Box
            sx={{
                width: "100%",
                borderRadius: "16px",
                overflow: "hidden",
            }}
        >
            <MapContainer
                center={[
                    latitudCentro || -31.939129,
                    longitudCentro || -63.375878,
                ]}
                zoom={6}
                scrollWheelZoom={false}
                style={{
                    height: "18vw",
                    width: "39vw",
                    borderRadius: "16px",
                }}
            >
                {latitudCentro && longitudCentro && (
                    <ZoomToLocation lat={latitudCentro} lng={longitudCentro} />
                )}
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
                </LayersControl>

                {coordenadasCarga[0] && (
                    <Marker position={coordenadasCarga} icon={pinIcon}></Marker>
                )}
                {coordenadasDescarga[0] && (
                    <Marker
                        position={coordenadasDescarga}
                        icon={okIcon}
                    ></Marker>
                )}
                {coordenadasBalanza[0] && (
                    <Marker
                        position={coordenadasBalanza}
                        icon={balanzaIcon}
                    ></Marker>
                )}

                {positions.length > 0 && (
                    <Polyline positions={positions} color="#163660" />
                )}
            </MapContainer>
        </Box>
    );
}
