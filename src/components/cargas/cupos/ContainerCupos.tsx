import {
    Box,
    CircularProgress,
    Dialog,
    DialogContent,
    DialogTitle,
    Grid2 as Grid,
    Typography,
} from "@mui/material";
import { BotonIcon } from "../../botones/IconButton";
import { AccessAlarmOutlined } from "@mui/icons-material";
import { TarjetaCupos } from "./TarjetaCupos";
import { TarjetaChoferesCarga } from "./CardGradientVerde";
import { useEffect, useContext, useState } from "react";
import { ContextoGeneral } from "../../Contexto";
import { useParams } from "react-router-dom";
import { CreadorCupos } from "../creadores/CreadorCupos";
import CancelIcon from "@mui/icons-material/Cancel";
import ClearSharpIcon from "@mui/icons-material/ClearSharp";

export function ContainerCupos() {
    const { idCarga } = useParams();
    const { backendURL, theme } = useContext(ContextoGeneral);
    const [cupos, setCupos] = useState<any[]>([]);
    const [estadoCarga, setEstadoCarga] = useState("Cargando");

    const refreshCupos = () => {
        fetch(`${backendURL}/cargas/${idCarga}/cupos`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "ngrok-skip-browser-warning": "true",
            },
        })
            .then((response) => response.json())
            .then((cupos) => {
                setCupos(cupos);
                setEstadoCarga("Cargado");
            })
            .catch(() => {
                console.error("Error al obtener las cupos disponibles");
            });
    };
    const [openDialog, setOpenDialog] = useState(false);

    useEffect(() => {
        refreshCupos();
    }, []);

    const handleClickCrearCupo = () => {
        setOpenDialog(true);
    };

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
            marginTop={2}
        >
            <BotonIcon
                onClick={handleClickCrearCupo}
                title="Quiero crear un nuevo cupo"
                icon={<AccessAlarmOutlined />}
            />
            {estadoCarga === "Cargando" && (
                <Box
                    display={"flex"}
                    flexDirection={"row"}
                    width={"100%"}
                    height={"100%"}
                    justifyContent={"center"}
                    alignItems={"center"}
                    gap={3}
                    margin={"auto"}
                    maxHeight={"100%"}
                >
                    <CircularProgress
                        sx={{
                            padding: "5px",
                            width: "30px",
                            height: "30px",
                        }}
                    />
                    <Typography variant="h5">
                        <b>Cargando...</b>
                    </Typography>
                </Box>
            )}

            {estadoCarga === "Cargado" && (
                <>
                    {cupos &&
                        cupos.map((cupo, index) => (
                            <Grid
                                container
                                direction="row"
                                key={index}
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
                                    refreshCupos={refreshCupos}
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
                                    {cupo.turnos.map(
                                        (turno: any, index: number) => {
                                            return (
                                                <TarjetaChoferesCarga
                                                    key={index}
                                                    titleNombre={
                                                        turno.chofer.nombre
                                                    }
                                                    titleApellido={
                                                        turno.chofer.apellido
                                                    }
                                                    textCuil={turno.chofer.cuil}
                                                    textCelular={
                                                        turno.chofer.numeroCel
                                                    }
                                                    textCuitEmpresa={
                                                        turno.empresa.cuit
                                                    }
                                                    textPatenteCamion={
                                                        turno.camion.patente
                                                    }
                                                    textPatenteSemi1={
                                                        turno.acoplado.patente
                                                    }
                                                    textPatenteSemi2={
                                                        turno.acopladoExtra
                                                            ?.patente
                                                    }
                                                    imagen=""
                                                    idCarga={idCarga}
                                                    fecha={cupo.fecha}
                                                    refreshCupos={refreshCupos}
                                                    idTurno={turno.id}
                                                    idEstado={turno.estado.id}
                                                />
                                            );
                                        }
                                    )}
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
                </>
            )}

            <Dialog
                open={openDialog}
                onClose={handleCloseDialog}
                fullWidth
                maxWidth="sm"
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
                            justifyContent: "center",
                            alignItems: "center",
                            flexDirection: "column",
                            height: "100%",
                            padding: "16px",
                        }}
                    >
                        <CreadorCupos
                            idCarga={idCarga}
                            refreshCupos={refreshCupos}
                            handleCloseDialog={handleCloseDialog}
                        />
                    </Box>
                </DialogContent>
            </Dialog>
        </Box>
    );
}
