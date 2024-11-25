import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import { ContextoStepper } from "../creadores/CrearCargaStepper";
import { useContext, useState } from "react";

interface AutocompletarProps {
    title: string;
    ubicaciones: any[];
    filtro: string;
    estadoCarga: boolean;
}

export default function AutocompletarUbicacion(props: AutocompletarProps) {
    const { datosNuevaCarga, datosSinCompletar } = useContext(ContextoStepper);
    let { title, ubicaciones, filtro, estadoCarga } = props;
    let [ubicacionSeleccionada, setUbicacionSeleccionada] = useState<any>(
        datosNuevaCarga["nombreUbicacion" + filtro] || null
    );

    const seleccionarUbicacion = (_event: any, seleccionado: string | null) => {
        if (seleccionado) {
            const ubicacionesStrings = ubicaciones.map(
                (ubicacion) =>
                    `${ubicacion.nombre}, ${ubicacion.localidad.nombre}, ${ubicacion.localidad.provincia.nombre}`
            );
            const index = ubicacionesStrings.indexOf(seleccionado);
            const ubicacionesIds = ubicaciones.map((ubicacion) => ubicacion.id);
            datosNuevaCarga["idUbicacion" + filtro] = ubicacionesIds[index];
            datosNuevaCarga["nombreUbicacion" + filtro] = seleccionado;
            setUbicacionSeleccionada(seleccionado);
        }
    };

    return (
        <Autocomplete
            disablePortal
            options={ubicaciones
                .filter(
                    (ubicacion) => ubicacion.tipoUbicacion.nombre === filtro
                )
                .map((ubicacion) => {
                    return `${ubicacion.nombre}, ${ubicacion.localidad.nombre}, ${ubicacion.localidad.provincia.nombre}`;
                })}
            sx={{ width: 300 }}
            value={ubicacionSeleccionada}
            defaultValue={ubicacionSeleccionada}
            onChange={seleccionarUbicacion}
            loading={estadoCarga}
            renderInput={(params) => (
                <TextField
                    {...params}
                    error={!ubicacionSeleccionada ? datosSinCompletar : false}
                    label={title}
                />
            )}
        />
    );
}
