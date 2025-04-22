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

const mapeoTipos: Record<string, string> = {
    Carga: "Carga",
    Descarga: "Descarga",
    Balanza: "Balanza"
};

interface AutocompletarProps {
    title: string;
    ubicaciones: any[];
    filtro: keyof typeof mapeoTipos;
    estadoCarga: boolean;
}

export default function AutocompletarUbicacion(props: AutocompletarProps) {
    const { datosNuevaCarga, datosSinCompletar } = useContext(ContextoStepper);
    const { title, ubicaciones, filtro, estadoCarga } = props;
    const [ubicacionSeleccionada, setUbicacionSeleccionada] = useState<any>(
        (datosNuevaCarga as any)["nombreUbicacion" + filtro] || null
    );

    const tipoUbicacionAPI = mapeoTipos[filtro as keyof typeof mapeoTipos] || filtro;

    // Filtra las ubicaciones según el tipo mapeado
    const ubicacionesFiltradas = ubicaciones.filter(({ tipoUbicacion }) => {
        const nombre = tipoUbicacion?.nombre;
        if (tipoUbicacion === "Carga/Descarga") {
            return nombre === "Carga" || nombre === "Descarga";
        }
        return nombre === tipoUbicacionAPI;
    });

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
                (datosNuevaCarga as any)["idUbicacion" + filtro] = ubicacionesFiltradas[index].id;
                (datosNuevaCarga as any)["nombreUbicacion" + filtro] = seleccionado;
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
