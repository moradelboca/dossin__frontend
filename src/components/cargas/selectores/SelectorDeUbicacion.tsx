import { Box, Typography } from "@mui/material";
import Reloj from "../Reloj";
import { useState, useEffect, useContext } from "react";
import { ContextoGeneral } from "../../Contexto";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import AutocompletarUbicacion from "../autocompletar/AutocompletarUbicacion";
import { ContextoStepper } from "../creadores/CrearCargaStepper";

export default function SelectorDeUbicacion() {
    const { datosNuevaCarga, datosSinCompletar } = useContext(ContextoStepper);

    const { backendURL } = useContext(ContextoGeneral);
    const [ubicaciones, setUbicaciones] = useState<any[]>([]);
    const [requiereBalanza, setRequiereBalanza] = useState<boolean>(
        datosNuevaCarga["requiereBalanza"] ?? false
    );
    const [estadoCarga, setEstadoCarga] = useState(true);

    useEffect(() => {
        fetch(`${backendURL}/ubicaciones`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "ngrok-skip-browser-warning": "true",
            },
        })
            .then((response) => response.json())
            .then((ubicaciones) => {
                setUbicaciones(ubicaciones);
                setEstadoCarga(false);
                console.log(ubicaciones);
            })
            .catch(() =>
                console.error("Error al obtener las Ubicaciones disponibles")
            );
    }, []);
    console.log(ubicaciones)

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
                        <AutocompletarUbicacion
                            ubicaciones={ubicaciones}
                            title="Ubicación de Carga"
                            filtro="Carga"
                            estadoCarga={estadoCarga}
                        />
                        <Box display="flex" flexDirection="row" gap={2}>
                            <Box display="column" gap={2}>
                                <>Inicio</>
                                <Reloj filtro="horaInicioCarga" />
                            </Box>
                            <Box display="column">
                                <>Fin</>
                                <Reloj filtro="horaFinCarga" />
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
                        <AutocompletarUbicacion
                            ubicaciones={ubicaciones}
                            title="Ubicación de Descarga"
                            filtro="Descarga"
                            estadoCarga={estadoCarga}
                        />
                        <Box display="flex" flexDirection="row" gap={2}>
                            <Box display="column">
                                <>Inicio</>
                                <Reloj filtro="horaInicioDescarga" />
                            </Box>
                            <Box display="column">
                                <>Fin</>
                                <Reloj filtro="horaFinDescarga" />
                            </Box>
                        </Box>
                    </Box>
                </Box>
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={requiereBalanza}
                            onChange={(e) => {
                                setRequiereBalanza(e.target.checked);
                                datosNuevaCarga["requiereBalanza"] =
                                    e.target.checked;
                            }}
                            sx={{
                                color: "#163660",
                                "&.Mui-checked": {
                                    color: "#163660",
                                },
                            }}
                        />
                    }
                    label="Requiere balanza"
                />
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
                        <AutocompletarUbicacion
                            ubicaciones={ubicaciones}
                            title="Ubicación de Balanza"
                            filtro="Balanza"
                            estadoCarga={estadoCarga}
                        />
                        <Box display="flex" flexDirection="row" gap={2}>
                            <Box display="column">
                                <>Inicio</>
                                <Reloj filtro="horaInicioBalanza" />
                            </Box>
                            <Box display="column">
                                <>Fin</>
                                <Reloj filtro="horaFinBalanza" />
                            </Box>
                        </Box>
                    </Box>
                )}
                {datosSinCompletar && (
                    <Typography color="#ff3333">
                        Las horas de incio deben ser menores a las de fin.
                    </Typography>
                )}
            </Box>
        </>
    );
}
