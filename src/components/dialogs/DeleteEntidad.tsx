/* eslint-disable @typescript-eslint/no-explicit-any */
import ClearSharpIcon from "@mui/icons-material/ClearSharp";
import { Box, Button, Typography } from "@mui/material";
import { useContext } from "react";
import { ContextoGeneral } from "../Contexto";
import { useNotificacion } from "../../components/Notificaciones/NotificacionSnackbar";
import { axiosDelete } from "../../lib/axiosConfig";

interface IDeleteEntidad {
    idEntidad: string | number;
    endpointEntidad: string;
    handleCloseDialog: () => void;
    handleClose: () => void;
    datos: any;
    setDatos: any;
    usarAuthURL?: boolean;
}
export default function DeleteEntidad(props: IDeleteEntidad) {
    const { handleCloseDialog, idEntidad, endpointEntidad, handleClose, datos, setDatos, usarAuthURL } = props;
    const { authURL, backendURL, theme } = useContext(ContextoGeneral);
    const { showNotificacion } = useNotificacion();

    const handleNoClick = () => {
        handleCloseDialog();
    };

    const apiURL = usarAuthURL ? authURL : backendURL;
    const borrarEntidad = () => {
        axiosDelete(`${endpointEntidad}/${idEntidad}`, apiURL)
            .then(() => {
                if (datos && Array.isArray(datos)) {
                    const newEntidades = datos.filter(
                        (entidad: any) => Object.values(entidad)[0] !== idEntidad
                    );
                    setDatos(newEntidades);
                } else {
                    console.error("Error: 'datos' no es un array válido.");
                }
                handleCloseDialog();
                handleClose();
            })
            .catch((error: any) => {
                const errorMessage = error?.response?.data?.mensaje || 'Error al borrar la entidad';
                showNotificacion(errorMessage, 'error');
                console.error("Error al borrar la entidad", error);
                handleCloseDialog();
            });
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
                {(() => {
                    switch (endpointEntidad) {
                        case 'colaboradores':
                            return '¿Está seguro de que quiere eliminar el colaborador?';
                        case 'empresas':
                        case 'empresa':
                            return '¿Está seguro de que quiere eliminar la empresa?';
                        case 'camiones':
                        case 'camion':
                            return '¿Está seguro de que quiere eliminar el camión?';
                        case 'acoplados':
                        case 'acoplado':
                            return '¿Está seguro de que quiere eliminar el acoplado?';
                        default:
                            return '¿Está seguro de que quiere eliminar la entidad?';
                    }
                })()}
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
