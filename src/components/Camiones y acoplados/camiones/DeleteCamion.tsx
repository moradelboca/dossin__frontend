/* eslint-disable @typescript-eslint/no-explicit-any */
import { Box, Button, Typography } from "@mui/material";
import { useContext } from "react";
import { ContextoGeneral } from "../../Contexto";
import ClearSharpIcon from "@mui/icons-material/ClearSharp";

interface Camiones {
    patente: any;
    handleCloseDialog: any;
    handleClose: any;
    camiones: any;
    setCamiones: any;
}
export default function DeleteCamion(props: Camiones) {
    const { handleCloseDialog, patente, handleClose, camiones, setCamiones } =
        props;
    const { backendURL, theme } = useContext(ContextoGeneral);

    const handleNoClick = () => {
        handleCloseDialog();
    };

    const borrarCamion = () => {
        fetch(`${backendURL}/camiones/${patente}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "ngrok-skip-browser-warning": "true",
            },
        })
            .then((response) => response.json())
            .then((_data) => {
                const newCamiones = camiones.filter(
                    (camion: { patente: any }) => camion.patente !== patente
                );
                setCamiones(newCamiones);
            })
            .catch((error) => {
                console.error("Error al borrar el camion", error);
            });
        handleCloseDialog();
        handleClose();
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
                    ¿Está seguro de que quiere eliminar el camion?
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
                        onClick={borrarCamion}
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
