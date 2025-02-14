/*
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
*/
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
    const { title, ubicaciones, filtro, estadoCarga } = props;
    const [ubicacionSeleccionada, setUbicacionSeleccionada] = useState<any>(
        datosNuevaCarga["nombreUbicacion" + filtro] || null
    );

    // Mapeo de los filtros de la API a los valores esperados
    const mapeoTipos = {
        Carga: "tipo ubi 1",    // Ejemplo de mapeo, ajustar según la API
        Descarga: "tipo ubi 1", // Asegúrate de que los nombres coincidan con los de la API
        Balanza: "tipo ubi 1"
    };

    const tipoUbicacionAPI = mapeoTipos[filtro] || filtro;  // Si no hay mapeo, usa el filtro tal cual

    // Filtra las ubicaciones según el tipo mapeado
    const ubicacionesFiltradas = ubicaciones.filter(
        (ubicacion) => ubicacion.tipoUbicacion.nombre === tipoUbicacionAPI
    );

    // Mapea las ubicaciones filtradas a strings
    const opcionesStrings = ubicacionesFiltradas.map(
        (ubicacion) =>
            `${ubicacion.nombre}, ${ubicacion.localidad.nombre}, ${ubicacion.localidad.provincia.nombre}`
    );

    const seleccionarUbicacion = (_event: any, seleccionado: string | null) => {
        if (seleccionado) {
            const index = opcionesStrings.indexOf(seleccionado);
            if (index !== -1) {
                // Guarda tanto el id como el nombre de la ubicación seleccionada
                datosNuevaCarga["idUbicacion" + filtro] = ubicacionesFiltradas[index].id;
                datosNuevaCarga["nombreUbicacion" + filtro] = seleccionado;
                setUbicacionSeleccionada(seleccionado);
            }
        }
    };

    return (
        <Autocomplete
            disablePortal
            options={opcionesStrings}
            sx={{ width: 300 }}
            value={ubicacionSeleccionada}
            onChange={seleccionarUbicacion}
            loading={estadoCarga}
            renderInput={(params) => (
                <TextField
                    {...params}
                    error={!ubicacionSeleccionada && datosSinCompletar}
                    label={title}
                />
            )}
        />
    );
}
