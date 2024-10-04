import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";

interface AutocompletarProps {
    title: string;
    datos: any[];
    filtro: string;
    datosNuevaCarga: any;
}

export default function AutocompletarUbicacion(props: AutocompletarProps) {
    let { title, datos, filtro, datosNuevaCarga } = props;
    let ubicacionStrings = datos
        .filter((ubicacion) => ubicacion.tipoUbicacion === filtro)
        .map((ubicacion) => {
            return `${ubicacion.nombre}, ${ubicacion.provincia}, ${ubicacion.pais}`;
        });
    let ubicacionIds = datos
        .filter((ubicacion) => ubicacion.tipoUbicacion == filtro)
        .map((ubicacion) => {
            return ubicacion.id;
        });

    const seleccionarId = (e: any) => {
        if (e.target.value != undefined) {
            datosNuevaCarga["idUbicacion" + filtro] =
                ubicacionIds[e.target.value];
        }
    };

    return (
        <Autocomplete
            disablePortal
            options={ubicacionStrings}
            sx={{ width: 300 }}
            onChange={(e) => seleccionarId(e)}
            renderInput={(params) => <TextField {...params} label={title} />}
        />
    );
}
