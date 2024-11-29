import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import { useState } from "react";

interface AutocompletarProps {
    title: string;
    localidades: any[];
    datosNuevaUbicacion: any;
    error: any;
    estadoCarga: any;
}

export default function AutocompletarUbicacionLocalidad(
    props: AutocompletarProps
) {
    let { title, localidades, datosNuevaUbicacion, error, estadoCarga } = props;
    let [ubicacionSeleccionada, setUbicacionSeleccionada] = useState<any>(
        datosNuevaUbicacion["nombreLocalidad"] || null
    );

    const seleccionarUbicacion = (_event: any, seleccionado: string | null) => {
        if (seleccionado) {
            const localidadesStrings = localidades.map(
                (localidad) =>
                    `${localidad.nombre}, ${localidad.provincia.nombre}`
            );
            const index = localidadesStrings.indexOf(seleccionado);
            const localidadesIds = localidades.map((localidad) => localidad.id);
            datosNuevaUbicacion["idLocalidad"] = localidadesIds[index];
            datosNuevaUbicacion["nombreLocalidad"] = seleccionado;
            setUbicacionSeleccionada(seleccionado);
        }
    };

    return (
        <Autocomplete
            disablePortal
            options={localidades.map((localidad) => {
                return `${localidad.nombre}, ${localidad.provincia.nombre}`;
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
