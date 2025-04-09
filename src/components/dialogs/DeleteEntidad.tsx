/* eslint-disable @typescript-eslint/no-explicit-any */
import { Box, Button, Typography } from "@mui/material";
import { useContext } from "react";
import { ContextoGeneral } from "../Contexto";
import ClearSharpIcon from "@mui/icons-material/ClearSharp";

interface IDeleteEntidad {
    idEntidad: string | number;
    endpointEntidad: string;
    handleCloseDialog: () => void;
    handleClose: () => void;
    datos: any;
    setDatos: any;
    usarPruebas?: boolean;
}
export default function DeleteEntidad(props: IDeleteEntidad) {
    const { handleCloseDialog, idEntidad, endpointEntidad, handleClose, datos, setDatos, usarPruebas } = props;
    const { pruebas, backendURL, theme } = useContext(ContextoGeneral);

    const handleNoClick = () => {
        handleCloseDialog();
    };

    const apiURL = usarPruebas ? pruebas : backendURL;
    const borrarEntidad = () => {
        fetch(`${apiURL}/${endpointEntidad}/${idEntidad}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "ngrok-skip-browser-warning": "true",
            },
        })
            .then((response) => response.json())
            .then(() => {
                if (datos && Array.isArray(datos)) {
                    const newEntidades = datos.filter(
                        (entidad: any) => Object.values(entidad)[0] !== idEntidad
                    );
                    setDatos(newEntidades);
                } else {
                    console.error("Error: 'datos' no es un array válido.");
                }
            })
            .catch((error) => {
                console.error("Error al borrar la entidad", error);
            });
        handleCloseDialog();
        handleClose();
    };

    return (
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
                ¿Está seguro de que quiere eliminar la entidad?
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
                    onClick={borrarEntidad}
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
    );
}
