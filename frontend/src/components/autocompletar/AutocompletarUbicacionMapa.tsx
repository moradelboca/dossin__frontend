import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import { useState } from "react";

interface AutocompletarProps {
    title: string;
    ubicaciones: any[];
    filtro: string; // Prop para recibir el tipo de filtro
    onSelectLocation: (location: { lat: number; lng: number }) => void; // Prop para actualizar la ubicación seleccionada
}

export default function AutocompletarUbicacionMapa(props: AutocompletarProps) {
    let { title, ubicaciones, filtro, onSelectLocation } = props; // Recibido el prop
    let [ubicacionSeleccionada, setUbicacionSeleccionada] = useState<any>(null);

    // Filtrar ubicaciones según el tipo recibido en filtro
    const ubicacionesFiltradas = ubicaciones.filter(
        (ubicacion) => filtro === "Todas" || ubicacion.tipoUbicacion === filtro
    );

    // Función para manejar la selección de ubicación
    const seleccionarUbicacion = (event: any, seleccionado: string | null) => {
        event.stopPropagation(); // Detener la propagación del evento
        if (seleccionado) {
            const selectedLocation = ubicacionesFiltradas.find(
                (ubicacion) =>
                    `${ubicacion.nombre}, ${ubicacion.provincia}, ${ubicacion.pais}` ===
                    seleccionado
            );
            if (selectedLocation) {
                // Actualizamos la ubicación seleccionada
                onSelectLocation({
                    lat: selectedLocation.latitud,
                    lng: selectedLocation.longitud,
                });
            }
            setUbicacionSeleccionada(seleccionado);
        }
    };

    return (
        <Autocomplete
            options={ubicacionesFiltradas.map((ubicacion) => {
                return `${ubicacion.nombre}, ${ubicacion.provincia}, ${ubicacion.pais}`;
            })}
            value={ubicacionSeleccionada}
            defaultValue={ubicacionSeleccionada}
            sx={{
                width: 300,
                background: "white",
                borderRadius: "6px",
                zIndex: 1000,
            }}
            onChange={(event, seleccionado) => {
                seleccionarUbicacion(event, seleccionado);
            }}
            renderInput={(params) => <TextField {...params} label={title} />}
        />
    );
}
