import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import { useState } from "react";

interface AutocompletarProps {
    title: string;
    ubicaciones: any[];
    filtro: string;
    onSelectLocation: (location: { lat: number; lng: number }) => void;
    estadoCarga: boolean;
}

export default function AutocompletarUbicacionMapa(props: AutocompletarProps) {
    let { title, ubicaciones, filtro, onSelectLocation, estadoCarga } = props;
    let [ubicacionSeleccionada, setUbicacionSeleccionada] = useState<any>(null);

    const ubicacionesFiltradas = ubicaciones.filter(
        (ubicacion) => filtro === "Todas" || ubicacion.tipoUbicacion === filtro
    );

    const seleccionarUbicacion = (event: any, seleccionado: string | null) => {
        event.stopPropagation();
        if (seleccionado) {
            const selectedLocation = ubicacionesFiltradas.find(
                (ubicacion) =>
                    `${ubicacion.nombre}, ${ubicacion.provincia}, ${ubicacion.pais}` ===
                    seleccionado
            );
            if (selectedLocation) {
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
            options={ubicacionesFiltradas}
            groupBy={(ubicacion) => ubicacion.provincia}
            getOptionLabel={(ubicacion) =>
                `${ubicacion.nombre}, ${ubicacion.provincia}, ${ubicacion.pais}`
            }
            value={ubicacionSeleccionada}
            defaultValue={ubicacionSeleccionada}
            loading={estadoCarga}
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
            renderGroup={(params) => {
                const { key, group, children } = params;
                return (
                    <li key={key}>
                        <div
                            style={{
                                fontWeight: "bold",
                                padding: "8px 16px",
                            }}
                        >
                            {group}
                        </div>
                        <ul style={{ padding: 0, margin: 0 }}>{children}</ul>
                    </li>
                );
            }}
        />
    );
}
