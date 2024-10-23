import {
    Box,
    Dialog,
    DialogContent,
    DialogTitle,
    Grid2 as Grid,
    Typography,
} from "@mui/material";
import { BotonIcon } from "../botones/IconButton";
import { AccessAlarmOutlined } from "@mui/icons-material";
import { TarjetaCupos } from "../tarjetas/TarjetaCupos";
import { TarjetaChoferesCarga } from "../tarjetas/CardGradientVerde";
import { useEffect, useContext, useState } from "react";
import { ContextoGeneral } from "../Contexto";
import { useParams } from "react-router-dom";
import { CreadorCupos } from "../tarjetas/CreadorCupos";
import CancelIcon from "@mui/icons-material/Cancel";
import ClearSharpIcon from "@mui/icons-material/ClearSharp";

export function ContainerCupos() {
    const { idCarga } = useParams();
    const { backendURL, theme } = useContext(ContextoGeneral);
    const [cupos, setCupos] = useState<any[]>([]);

    useEffect(() => {
        fetch(`${backendURL}/cargas/${idCarga}/cupos`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "ngrok-skip-browser-warning": "true",
            },
        })
            .then((response) => response.json())
            .then((cupos) => {
                setCupos(cupos); // Setea los cupos si existen
            })
            .catch(() => {
                console.error("Error al obtener las cupos disponibles");
            });
    }, []);
    const [openDialog, setOpenDialog] = useState(false);

    // Función para abrir el Dialog
    const handleClickCrearCupo = () => {
        setOpenDialog(true);
    };

    // Función para cerrar el Dialog
    const handleCloseDialog = () => {
        setOpenDialog(false);
    };
    return (
        <Box
            display="flex"
            justifyContent="center"
            width="100%"
            flexDirection={"column"}
            gap={"50px"}
            alignItems={"center"}
        >
            <BotonIcon
                onClick={handleClickCrearCupo}
                title="Quiero crear un nuevo cupo"
                icon={<AccessAlarmOutlined />}
            />

            {cupos.map((cupo) => (
                <Grid
                    container
                    direction="row"
                    width={"100%"}
                    spacing={5}
                    flexWrap={"nowrap"}
                    marginLeft={"50px"}
                    alignItems={"center"}
                    justifyContent={"center"}
                >
                    <TarjetaCupos
                        fecha={cupo.fecha}
                        cuposDisponibles={cupo.cupos}
                        cuposConfirmados={cupo.turnos.length}
                        idCarga={idCarga}
                    />

                    <Grid
                        container
                        spacing={5}
                        flexWrap={"nowrap"}
                        sx={{ overflowX: "scroll" }}
                        width={"80%"}
                        minHeight={"380px"}
                        alignItems={"center"}
                        padding={"35px"}
                    >
                        {cupo.turnos.map((turno: any) => (
                            <TarjetaChoferesCarga
                                titleNombre={turno.nombre}
                                titleApellido=""
                                textCuil={turno.cuilChofer}
                                textCelular={turno.celular}
                                textCuitEmpresa={turno.cuitEmpresa}
                                textPatenteCamion={turno.patenteCamion}
                                textPatenteSemi1={turno.patenteAcoplado}
                                textPatenteSemi2={turno.patenteAcopladoExtra}
                                imagen=""
                            />
                        ))}
                    </Grid>
                </Grid>
            ))}
            {cupos.length === 0 && (
                <Box
                    display={"flex"}
                    flexDirection={"row"}
                    width={"100%"}
                    justifyContent={"center"}
                    alignItems={"center"}
                    gap={3}
                >
                    <CancelIcon
                        sx={{
                            color: "red",
                            borderRadius: "50%",
                            padding: "5px",
                            width: "50px",
                            height: "50px",
                        }}
                    />
                    <Typography variant="h5">
                        <b>Al parecer no hay cupos.</b>
                    </Typography>
                </Box>
            )}
            <Dialog
                open={openDialog}
                onClose={handleCloseDialog}
                fullWidth
                maxWidth="sm" // Puedes ajustar el tamaño según lo necesites
            >
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
                <DialogTitle sx={{ textAlign: "start" }}>
                    Crear un nuevo cupo
                </DialogTitle>
                <DialogContent>
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "center", // Centra horizontalmente
                            alignItems: "center", // Centra verticalmente
                            flexDirection: "column", // Asegura que los elementos se alineen en columna
                            height: "100%", // Asegura que tome el 100% del alto disponible
                            padding: "16px", // Espacio interno
                        }}
                    >
                        <CreadorCupos idCarga={idCarga} />
                    </Box>
                </DialogContent>
            </Dialog>
        </Box>
    );
}
