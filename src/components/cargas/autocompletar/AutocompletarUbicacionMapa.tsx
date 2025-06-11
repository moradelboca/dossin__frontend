import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import { SxProps, Theme } from "@mui/material";

interface AutocompletarProps {
    title?: string;
    ubicaciones: any[];
    filtro?: string;
    estadoCarga?: boolean;
    ubicacionSeleccionada?: any;
    setUbicacionSeleccionada?: any;
    handleMarkerClick?: any;
    onSelectLocation?: any;
    sx?: SxProps<Theme>;
}

export default function AutocompletarUbicacionMapa(props: AutocompletarProps) {
    const {
        title,
        ubicaciones,
        filtro,
        estadoCarga,
        ubicacionSeleccionada,
        setUbicacionSeleccionada,
        handleMarkerClick,
    } = props;

    const ubicacionesFiltradas = ubicaciones.filter(
        (ubicacion) => filtro === "Todas" || ubicacion.tipoUbicacion === filtro
    );

    const seleccionarUbicacion = (event: any, seleccionado: string | null) => {
        event.stopPropagation();
        if (seleccionado) {
            if (typeof setUbicacionSeleccionada === 'function') {
                setUbicacionSeleccionada(seleccionado);
            }
            setTimeout(() => {
                if (typeof handleMarkerClick === 'function') {
                    handleMarkerClick();
                }
            }, 1000);
        }
    };

    return (
        <Autocomplete
            options={ubicacionesFiltradas}
            groupBy={(ubicacion) => ubicacion.provincia}
            getOptionLabel={(ubicacion) => {
                const nombre = ubicacion.nombre || "";
                const localidad = ubicacion.localidad?.nombre || "";
                const provincia = ubicacion.localidad?.provincia?.nombre || "";
                return [nombre, localidad, provincia].filter(Boolean).join(", ");
            }}
            value={ubicacionSeleccionada}
            defaultValue={ubicacionSeleccionada}
            loading={estadoCarga}
            sx={{
                width: 300,
                background: "white",
                borderRadius: "6px",
                zIndex: 1000,
                ...props.sx,
            }}
            onChange={(event, seleccionado) => {
                seleccionarUbicacion(event, seleccionado);
            }}
            renderInput={(params) => <TextField {...params} label={title} />}
            renderGroup={(params) => {
                const { key, group, children } = params;
                return (
                    <li key={key}>
                        <div
                            style={{
                                fontWeight: "bold",
                                padding: "8px 16px",
                            }}
                        >
                            {group}
                        </div>
                        <ul style={{ padding: 0, margin: 0 }}>{children}</ul>
                    </li>
                );
            }}
        />
    );
}
