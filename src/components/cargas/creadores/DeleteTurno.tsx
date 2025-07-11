import { Box, Button, Typography } from "@mui/material";
import { useContext } from "react";
import { ContextoGeneral } from "../../Contexto";
import ClearSharpIcon from "@mui/icons-material/ClearSharp";
import { useNotificacion } from '../../Notificaciones/NotificacionSnackbar';

interface Turnos {
    idTurno: any;
    idCarga: any;
    fecha: any;
    handleCloseDialog: any;
    handleClose: any;
    refreshCupos: any;
}
export default function DeleteTurno(props: Turnos) {
    const { handleCloseDialog, idTurno, handleClose, refreshCupos } = props;
    const { backendURL, theme } = useContext(ContextoGeneral);
    const { showNotificacion } = useNotificacion();

    const handleNoClick = () => {
        handleCloseDialog();
    };

    const borrarTurno = () => {
        fetch(`${backendURL}/turnos/${idTurno}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "ngrok-skip-browser-warning": "true",
            },
        })
            .then((response) => {
                if (!response.ok) throw response;
                return response.json();
            })
            .then(() => {
                handleCloseDialog();
                refreshCupos();
                handleClose();
            })
            .catch(async (error) => {

                let errorMsg = "Error al borrar el turno";

                if (error && error.text) {
                    const text = await error.text();
                    // Detectar mensaje específico del backend
                    if (text && (text.includes("adelanto") || text.includes("adelantos"))) {
                      
                        errorMsg = "No se puede eliminar este turno, tiene adelantos de efectivo o combustible asociados";

                    }
                }
                showNotificacion(errorMsg, 'error');
                console.error("Error al borrar el turno", error);
            });
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
                    ¿Está seguro de que quiere eliminar el Turno?
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
                        onClick={borrarTurno}
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
