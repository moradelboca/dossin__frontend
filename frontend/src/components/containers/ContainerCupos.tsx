import {
    Box,
    Dialog,
    DialogContent,
    DialogTitle,
    Grid2 as Grid,
} from "@mui/material";
import { BotonIcon } from "../botones/IconButton";
import { AccessAlarmOutlined } from "@mui/icons-material";
import { TarjetaCupos } from "../tarjetas/TarjetaCupos";
import { TarjetaChoferesCarga } from "../tarjetas/CardGradientVerde";
import { useEffect, useContext, useState } from "react";
import { ContextoGeneral } from "../Contexto";
import { useParams } from "react-router-dom";
import { CreadorCupos } from "../tarjetas/CreadorCupos";

export function ContainerCupos() {
    const { idCarga } = useParams();
    const { backendURL } = useContext(ContextoGeneral);
    const [cupos, setCupos] = useState<any[]>([]);

    useEffect(() => {
        fetch(
            `${backendURL}/cargas/${idCarga}/cupos?incluirAnteriores=true&incluirErrores=true`
        )
            .then((response) => response.json())
            .then((cupos) => {
                setCupos(cupos);
                console.log(cupos);
            })
            .catch(() =>
                console.error("Error al obtener las cargas disponibles")
            );
    }, []);
    // Estado para controlar el Dialog
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
                >
                    <TarjetaCupos
                        fecha={cupo.fecha}
                        cuposDisponibles={cupo.cupos}
                        cuposConfirmados={cupo.turnos.length}
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
            <Dialog
                open={openDialog}
                onClose={handleCloseDialog}
                fullWidth
                maxWidth="sm" // Puedes ajustar el tamaño según lo necesites
            >
                <DialogTitle sx={{ textAlign: "center" }}>
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
                        <CreadorCupos datosNuevaCarga={undefined} />
                    </Box>
                </DialogContent>
            </Dialog>
        </Box>
    );
}
