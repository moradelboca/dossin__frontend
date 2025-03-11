import { Box, IconButton, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useNavigate } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { ContextoCargas } from "./ContainerTajetasCargas";
import { ContextoGeneral } from "../../Contexto";

export default function ContainerProximosCupos() {
    const navigate = useNavigate();
    const [cupos, setCupos] = useState<any[]>([]);
    const { backendURL } = useContext(ContextoGeneral);
    const { cargaSeleccionada } = useContext(ContextoCargas);

    const handleClickVerCupos = () => {
        navigate(`/cargas/${cargaSeleccionada.id}/cupos`);
    };

    useEffect(() => {
        if (cargaSeleccionada?.id) {
            fetch(`${backendURL}/cargas/${cargaSeleccionada.id}/cupos`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "ngrok-skip-browser-warning": "true",
                },
            })
                .then((response) => {
                    if (!response.ok) {
                        throw new Error("Error al obtener los cupos");
                    }
                    return response.json();
                })
                .then((data) => {
                    // Verifica si los cupos están definidos y son un array
                    if (Array.isArray(data)) {
                        setCupos(data);
                    } else {
                        setCupos([]); // Si no es un array válido, asigna un array vacío
                    }
                })
                .catch(() => {
                    setCupos([]); // En caso de error, asigna un array vacío
                });
        }
    }, [cargaSeleccionada, backendURL]);

    return (
        <>
            <Box
                sx={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    width: "100%",
                }}
            >
                <Typography>Cupos</Typography>
                <IconButton
                    disabled={!cargaSeleccionada}
                    onClick={handleClickVerCupos}
                    sx={{
                        paddingRight: 0,
                        paddingBottom: 0,
                    }}
                >
                    <AddIcon />
                </IconButton>
            </Box>
            <Box
                sx={{
                    width: "100%",
                    display: "flex",
                    flexDirection: "column",
                    borderRadius: "16px",
                    border: "1px solid #ccc",
                    overflowY: "auto",
                    alignItems: "center",
                    justifyContent: "center",
                    flexGrow: 1,
                }}
            >
                {!cupos.length ? (
                    <Typography
                        variant="subtitle2"
                        sx={{
                            marginLeft: 2,
                            marginTop: 2,
                            marginRight: 2,
                        }}
                        color="#90979f"
                    >
                        Parece ser que no hay cupos.
                    </Typography>
                ) : (
                    cupos.slice(0, 3).map((cupo, i) => (
                        <Box
                            key={i}
                            minWidth={200}
                            sx={{
                                marginBottom: 1,
                                marginTop: 2,
                            }}
                        >
                            <Typography
                                variant="subtitle2"
                                sx={{
                                    marginLeft: 2,
                                    marginRight: 2,
                                }}
                                color="#90979f"
                            >
                                Fecha: {cupo.fecha}
                            </Typography>
                            <Typography
                                variant="subtitle2"
                                sx={{
                                    marginLeft: 2,
                                    marginRight: 2,
                                }}
                                color="#90979f"
                            >
                                Cupos confirmados: {cupo.turnos?.length} ⛟ 🗸
                            </Typography>
                            <Typography
                                variant="subtitle2"
                                sx={{
                                    marginLeft: 2,
                                    marginRight: 2,
                                }}
                                color="#90979f"
                            >
                                Cupos restantes: {cupo.cupos} ⛟ ⏱︎
                            </Typography>
                        </Box>
                    ))
                )}
            </Box>
        </>
    );
}
