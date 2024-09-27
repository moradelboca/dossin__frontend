import Autocompletar from "./Autocompletar";
import { Box } from "@mui/material";
import Reloj2 from "./Relo2";
import { useState, useEffect, useContext } from "react";
import { ContextoGeneral } from "./Contexto";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";

export default function SelectorDeUbicacion() {
    const { backendURL } = useContext(ContextoGeneral);
    const [ubicaciones, setUbicaciones] = useState<any[]>([]);
    let ubicacionCargaStrings: string[];
    let ubicacionDescargaStrings: string[];
    let ubicacionBalanzaStrings: string[];
    const [requiereBalanza, setRequiereBalanza] = useState<boolean>(false); // Estado para el checkbox

    useEffect(() => {
        fetch(`${backendURL}/ubicaciones`)
            .then((response) => response.json())
            .then((ubicaciones) => setUbicaciones(ubicaciones))
            .catch(() =>
                console.error("Error al obtener las Ubicaciones disponibles")
            );
    }, []);
    ubicacionCargaStrings = ubicaciones
        .filter((ubicacion) => ubicacion.tipoUbicacion == "Carga")
        .map((ubicacion) => {
            return `${ubicacion.nombre}, ${ubicacion.provincia}, ${ubicacion.pais}`;
        });
    ubicacionDescargaStrings = ubicaciones
        .filter((ubicacion) => ubicacion.tipoUbicacion == "Descarga")
        .map((ubicacion) => {
            return `${ubicacion.nombre}, ${ubicacion.provincia}, ${ubicacion.pais}`;
        });
    ubicacionBalanzaStrings = ubicaciones
        .filter((ubicacion) => ubicacion.tipoUbicacion == "Balanza")
        .map((ubicacion) => {
            return `${ubicacion.nombre}, ${ubicacion.provincia}, ${ubicacion.pais}`;
        });

    return (
        <>
            <Box display="column" flexDirection="row" gap={2}>
                <Box display="flex" flexDirection="row" gap={2}>
                    <Box
                        display="column"
                        flexDirection="row"
                        gap={2}
                        alignItems={"center"}
                    >
                        <Autocompletar
                            info={ubicacionCargaStrings}
                            title="Desde"
                        />
                        <Box display="flex" flexDirection="row" gap={2}>
                            <Box display="column" gap={2}>
                                <>Inicio</>
                                <Reloj2 />
                            </Box>
                            <Box display="column">
                                <>Fin</>
                                <Reloj2 />
                            </Box>
                        </Box>
                    </Box>
                    <Box
                        display="column"
                        flexDirection="row"
                        gap={2}
                        alignItems={"center"}
                    >
                        <Autocompletar
                            info={ubicacionDescargaStrings}
                            title="A"
                        />
                        <Box display="flex" flexDirection="row" gap={2}>
                            <Box display="column">
                                <>Inicio</>
                                <Reloj2 />
                            </Box>
                            <Box display="column">
                                <>Fin</>
                                <Reloj2 />
                            </Box>
                        </Box>
                    </Box>
                </Box>
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={requiereBalanza}
                            onChange={(e) =>
                                setRequiereBalanza(e.target.checked)
                            }
                        />
                    }
                    label="Requiere balanza?"
                />
                {/* Mostrar la opción de "Ubicación balanza" solo si requiereBalanza es true */}
                {requiereBalanza && (
                    <Box
                        display="column"
                        flexDirection="row"
                        gap={2}
                        alignItems={"center"}
                    >
                        <Autocompletar
                            info={ubicacionBalanzaStrings}
                            title="Ubicación balanza"
                        />
                        <Box display="flex" flexDirection="row" gap={2}>
                            <Box display="column">
                                <>Inicio</>
                                <Reloj2 />
                            </Box>
                            <Box display="column">
                                <>Fin</>
                                <Reloj2 />
                            </Box>
                        </Box>
                    </Box>
                )}
            </Box>
        </>
    );
}
