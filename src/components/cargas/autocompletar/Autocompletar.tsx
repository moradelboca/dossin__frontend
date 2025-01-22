import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";

interface AutocompletarProps {
    title: string;
    datos: any[];
    filtro?: string;
    ubicacion: (id: number) => void;
}

export default function Autocompletar(props: AutocompletarProps) {
    const { title, datos, filtro, ubicacion } = props;
    const ubicacionStrings = datos
        .filter((ubicacion) => ubicacion.tipoUbicacion === filtro)
        .map((ubicacion) => {
            return `${ubicacion.nombre}, ${ubicacion.provincia}, ${ubicacion.pais}`;
        });
    const ubicacionIds = datos
        .filter((ubicacion) => ubicacion.tipoUbicacion == filtro)
        .map((ubicacion) => {
            return ubicacion.id;
        });

    const seleccionarId = (e: any) => {
        if (e.target.value != undefined) {
            console.log(datos);
            console.log(ubicacionIds);
            console.log(ubicacionIds[e.target.value]);
            ubicacion(ubicacionIds[e.target.value]);
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
