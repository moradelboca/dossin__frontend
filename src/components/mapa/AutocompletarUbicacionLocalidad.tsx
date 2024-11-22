import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import { useState } from "react";

interface AutocompletarProps {
    title: string;
    ubicaciones: any[];
    datosNuevaUbicacion: any;
    error: any;
    estadoCarga: any;
}

export default function AutocompletarUbicacionLocalidad(
    props: AutocompletarProps
) {
    let { title, ubicaciones, datosNuevaUbicacion, error, estadoCarga } = props;
    let [ubicacionSeleccionada, setUbicacionSeleccionada] = useState<any>(
        datosNuevaUbicacion["nombreLocalidad"] || null
    );

    const seleccionarUbicacion = (_event: any, seleccionado: string | null) => {
        if (seleccionado) {
            const ubicacionesStrings = ubicaciones.map(
                (ubicacion) =>
                    `${ubicacion.localidad.nombre}, ${ubicacion.localidad.provincia.nombre}`
            );
            const index = ubicacionesStrings.indexOf(seleccionado);
            const ubicacionesIds = ubicaciones.map(
                (ubicacion) => ubicacion.localidad.id
            );
            datosNuevaUbicacion["idLocalidad"] = ubicacionesIds[index];
            datosNuevaUbicacion["nombreLocalidad"] = seleccionado;
            setUbicacionSeleccionada(seleccionado);
        }
    };

    return (
        <Autocomplete
            disablePortal
            options={ubicaciones.map((ubicacion) => {
                return `${ubicacion.localidad.nombre}, ${ubicacion.localidad.provincia.nombre}`;
            })}
            sx={{ width: 350 }}
            value={ubicacionSeleccionada}
            defaultValue={ubicacionSeleccionada}
            onChange={seleccionarUbicacion}
            renderInput={(params) => (
                <TextField {...params} error={error} label={title} />
            )}
            loading={estadoCarga}
        />
    );
}
