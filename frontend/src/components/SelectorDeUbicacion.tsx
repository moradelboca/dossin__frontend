import Autocompletar from "./Autocompletar";
import { Box } from "@mui/material";
import Reloj from "./Reloj";
import { useState, useEffect, useContext } from "react";
import { ContextoGeneral } from "./Contexto";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";

interface props {
    ubicacionCarga: (id: number) => void;
    ubicacionDescarga: (id: number) => void;
    ubicacionBalanza: (id: number) => void;
}

export default function SelectorDeUbicacion(selectorProps: props) {
    const { ubicacionCarga, ubicacionDescarga, ubicacionBalanza } =
        selectorProps;
    const { backendURL } = useContext(ContextoGeneral);
    const [ubicaciones, setUbicaciones] = useState<any[]>([]);
    const [requiereBalanza, setRequiereBalanza] = useState<boolean>(false); // Estado para el checkbox

    useEffect(() => {
        fetch(`${backendURL}/ubicaciones`)
            .then((response) => response.json())
            .then((ubicaciones) => setUbicaciones(ubicaciones))
            .catch(() =>
                console.error("Error al obtener las Ubicaciones disponibles")
            );
    }, []);

    return (
        <>
            <Box display="column" flexDirection="row" gap={2} width={"800px"}>
                <Box display="flex" flexDirection="row" gap={2}>
                    <Box
                        display="column"
                        flexDirection="row"
                        gap={2}
                        alignItems={"center"}
                        sx={{
                            border: "1px solid rgba(22, 54, 96, 0.6)",
                            borderRadius: "8px",
                            padding: "16px",
                        }}
                    >
                        <Autocompletar
                            datos={ubicaciones}
                            title="Ubicación de Carga"
                            filtro="Carga"
                            ubicacion={ubicacionCarga}
                        />
                        <Box display="flex" flexDirection="row" gap={2}>
                            <Box display="column" gap={2}>
                                <>Inicio</>
                                <Reloj />
                            </Box>
                            <Box display="column">
                                <>Fin</>
                                <Reloj />
                            </Box>
                        </Box>
                    </Box>
                    <Box
                        display="column"
                        flexDirection="row"
                        gap={2}
                        alignItems={"center"}
                        sx={{
                            border: "1px solid rgba(22, 54, 96, 0.6)",
                            borderRadius: "8px",
                            padding: "16px",
                        }}
                    >
                        <Autocompletar
                            datos={ubicaciones}
                            title="Ubicación de Descarga"
                            filtro="Descarga"
                            ubicacion={ubicacionDescarga}
                        />
                        <Box display="flex" flexDirection="row" gap={2}>
                            <Box display="column">
                                <>Inicio</>
                                <Reloj />
                            </Box>
                            <Box display="column">
                                <>Fin</>
                                <Reloj />
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
                            sx={{
                                color: "#163660", // Color por defecto
                                "&.Mui-checked": {
                                    color: "#163660", // Color cuando está seleccionado
                                },
                            }}
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
                        width={"335px"}
                        alignItems={"center"}
                        sx={{
                            border: "1px solid rgba(22, 54, 96, 0.6)",
                            borderRadius: "8px",
                            padding: "16px",
                        }}
                    >
                        <Autocompletar
                            datos={ubicaciones}
                            title="Ubicación de Balanza"
                            filtro="Balanza"
                            ubicacion={ubicacionBalanza}
                        />
                        <Box display="flex" flexDirection="row" gap={2}>
                            <Box display="column">
                                <>Inicio</>
                                <Reloj />
                            </Box>
                            <Box display="column">
                                <>Fin</>
                                <Reloj />
                            </Box>
                        </Box>
                    </Box>
                )}
            </Box>
        </>
    );
}
