import { Box, Button, Typography } from "@mui/material";
import { useContext } from "react";
import { ContextoCargas } from "../containers/ContainerTajetasCargas";
import { ContextoGeneral } from "../../Contexto";
import ClearSharpIcon from "@mui/icons-material/ClearSharp";

export default function DeleteCarga(props: any) {
    let { handleCloseDialog } = props;
    const { backendURL, theme } = useContext(ContextoGeneral);
    const { cargaSeleccionada } = useContext(ContextoCargas);

    const handleNoClick = () => {
        handleCloseDialog();
    };

    const borrarCarga = () => {
        fetch(`${backendURL}/cargas/${cargaSeleccionada.id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "ngrok-skip-browser-warning": "true",
            },
        })
            .then((response) => response.json())

            .catch((error) => {
                console.error("Error al borrar la carga", error);
            });
        handleCloseDialog();
    };

    return (
        <>
            <Box
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    alignItems: "center",
                    width: "100%",
                    maxWidth: "400px",
                    padding: 3,
                    borderRadius: 2,
                    margin: "auto",
                    gap: 2,
                }}
            >
                <Typography variant="h6" color="textPrimary" align="center">
                    ¿Está seguro de que quiere eliminar la carga?
                </Typography>
                <ClearSharpIcon
                    onClick={handleCloseDialog}
                    sx={{
                        position: "absolute",
                        top: "10px",
                        right: "10px",
                        cursor: "pointer",
                        color: theme.colores.azul,
                    }}
                />
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "space-around",
                        alignItems: "center",
                        width: "100%",
                        gap: 2,
                        marginTop: 2,
                    }}
                >
                    <Button
                        variant="text"
                        onClick={borrarCarga}
                        sx={{
                            color: "#d68384",
                            width: "100%",
                            maxWidth: "100px",
                            fontWeight: "bold",
                        }}
                    >
                        Sí
                    </Button>
                    <Button
                        variant="text"
                        sx={{
                            width: "100%",
                            color: theme.colores.azul,
                            maxWidth: "100px",
                            fontWeight: "bold",
                        }}
                        onClick={handleNoClick}
                    >
                        No
                    </Button>
                </Box>
            </Box>
        </>
    );
}
