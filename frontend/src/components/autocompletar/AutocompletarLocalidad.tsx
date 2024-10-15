import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import { ContextoStepper } from "../tarjetas/CrearCargaStepper";
import { useContext, useState } from "react";

interface AutocompletarProps {
    title: string;
    ubicaciones: any[];
    filtro: string;
}

/* export default function AutocompletarLocalidad(props: AutocompletarProps) {
    const { datosNuevaCarga, datosSinCompletar } = useContext(ContextoStepper);
    let { title, ubicaciones, filtro } = props;
    const seleccionarUbicacion = (event: any, seleccionado: string | null) => {
        if (seleccionado) {
            const ubicacionesStrings = ubicaciones.map((ubicacion) => `${ubicacion.nombre}, ${ubicacion.provincia}, ${ubicacion.pais}`);
            const index = ubicacionesStrings.indexOf(seleccionado);
            const ubicacionesIds = ubicaciones.map((ubicacion) => ubicacion.id);
        }
    };

    return (
        <Autocomplete
            disablePortal
            options={ubicaciones
                .filter((ubicacion) => ubicacion.tipoUbicacion === filtro)
                .map((ubicacion) => {
                    return `${ubicacion.nombre}, ${ubicacion.provincia}, ${ubicacion.pais}`;
                })}
            sx={{ width: 300 }}
            value={ubicacionSeleccionada}
            defaultValue={ubicacionSeleccionada}
            onChange={seleccionarUbicacion}
            renderInput={(params) => <TextField {...params} error={!ubicacionSeleccionada ? datosSinCompletar : false} label={title} />}
        />
    );
}
 */
