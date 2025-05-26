import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import { ContextoStepper } from "../creadores/CrearCargaStepper";
import { useContext, useState } from "react";
import { ContextoGeneral } from "../../Contexto";
import AddIcon from '@mui/icons-material/Add';

const mapeoTipos: Record<string, string> = {
    Carga: "Carga",
    Descarga: "Descarga",
    Balanza: "Balanza",
    Carga_Descarga: "Carga/Descarga"
};

interface AutocompletarProps {
    title: string;
    ubicaciones: any[];
    filtro: keyof typeof mapeoTipos;
    estadoCarga: boolean;
    onAgregarUbicacion?: () => void;
}

export default function AutocompletarUbicacion(props: AutocompletarProps) {
    const { datosNuevaCarga, datosSinCompletar } = useContext(ContextoStepper);
    const { title, ubicaciones, filtro, estadoCarga, onAgregarUbicacion } = props;
    const { theme } = useContext(ContextoGeneral);
    const [ubicacionSeleccionada, setUbicacionSeleccionada] = useState<any>(
        (datosNuevaCarga as any)["nombreUbicacion" + filtro] || null
    );

    const tipoUbicacionAPI = mapeoTipos[filtro as keyof typeof mapeoTipos] || filtro;

    // Filtra las ubicaciones según el tipo mapeado
    const ubicacionesFiltradas = ubicaciones.filter(({ tipoUbicacion }) => {
        const nombreUbi = tipoUbicacion?.nombre;
        if (nombreUbi === "Carga/Descarga") {
            return tipoUbicacionAPI === "Carga" || tipoUbicacionAPI === "Descarga";
        }
        return nombreUbi === tipoUbicacionAPI;
    });

    // Mapea las ubicaciones filtradas a strings
    const opcionesStrings = ubicacionesFiltradas.map(
        (ubicacion) =>
            `${ubicacion.nombre}, ${ubicacion.localidad.nombre}, ${ubicacion.localidad.provincia.nombre}`
    );

    // Opción especial para agregar ubicación
    const opciones = [...opcionesStrings, "__add__"];

    const seleccionarUbicacion = (_event: any, seleccionado: string | null) => {
        if (seleccionado === "__add__") {
            if (typeof onAgregarUbicacion === 'function') onAgregarUbicacion();
            return;
        }
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

    const azulStyles = {
        '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: theme.colores.azul,
        },
        '& .MuiInputLabel-root.Mui-focused': {
            color: theme.colores.azul,
        },
    };

    return (
        <Autocomplete
            disablePortal
            options={opciones}
            sx={{
                width: 300,
                '& .MuiAutocomplete-option': {
                    fontWeight: 400,
                },
                '& .Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: theme.colores.azul,
                },
                '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: theme.colores.azul,
                },
            }}
            value={opcionesStrings.includes(ubicacionSeleccionada) ? ubicacionSeleccionada : null}
            onChange={seleccionarUbicacion}
            loading={estadoCarga}
            renderOption={(props, option) => {
                const { key, ...rest } = props;
                if (option === "__add__") {
                    return (
                        <li key={key} {...rest} style={{ display: 'flex', alignItems: 'center', color: theme.colores.azul, fontWeight: 600 }}>
                            <AddIcon fontSize="small" style={{ marginRight: 8, color: theme.colores.azul }} />
                            <span>Agregar una ubicación</span>
                        </li>
                    );
                }
                return <li key={key} {...rest}>{option}</li>;
            }}
            renderInput={(params) => (
                <TextField
                    {...params}
                    error={!ubicacionSeleccionada && datosSinCompletar}
                    label={title}
                    variant="outlined"
                    sx={azulStyles}
                />
            )}
        />
    );
}
