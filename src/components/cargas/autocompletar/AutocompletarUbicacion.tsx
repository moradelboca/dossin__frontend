import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import { ContextoStepper } from "../creadores/CrearCargaStepper";
import { useContext, useState } from "react";

interface AutocompletarProps {
    title: string;
    ubicaciones: any[];
    filtro: string;
}

export default function AutocompletarUbicacion(props: AutocompletarProps) {
    const { datosNuevaCarga, datosSinCompletar } = useContext(ContextoStepper);
    let { title, ubicaciones, filtro } = props;
    let [ubicacionSeleccionada, setUbicacionSeleccionada] = useState<any>(
        datosNuevaCarga["nombreUbicacion" + filtro] || null
    );

    const seleccionarUbicacion = (_event: any, seleccionado: string | null) => {
        if (seleccionado) {
            const ubicacionesStrings = ubicaciones.map(
                (ubicacion) =>
                    `${ubicacion.nombre}, ${ubicacion.localidad}, ${ubicacion.provincia}`
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
                .filter((ubicacion) => ubicacion.tipoUbicacion === filtro)
                .map((ubicacion) => {
                    return `${ubicacion.nombre}, ${ubicacion.localidad}, ${ubicacion.provincia}`;
                })}
            sx={{ width: 300 }}
            value={ubicacionSeleccionada}
            defaultValue={ubicacionSeleccionada}
            onChange={seleccionarUbicacion}
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
