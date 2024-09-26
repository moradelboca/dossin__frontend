import { Box, Grid2 as Grid } from "@mui/material";
import { BotonIcon } from "./botones/IconButton";
import { AccessAlarmOutlined } from "@mui/icons-material";
import { TarjetaCupos } from "./tarjetas/TarjetaCupos";
import { TarjetaChoferesCarga } from "./tarjetas/CardGradientVerde";
import { useEffect, useContext, useState } from "react";
import { ContextoGeneral } from "./Contexto";
import { useParams } from "react-router-dom";

export function ContainerCupos() {
    const { idCarga } = useParams();
    const { backendURL } = useContext(ContextoGeneral);
    const [cupos, setCupos] = useState<any[]>([]);

    useEffect(() => {
        fetch(
            `${backendURL}/cargas/${idCarga}/cupos?incluirErrores=true?incluirAnteriores=true`
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
                title="Quiero crear un nuevo"
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
                                titleApellido={turno.estado}
                                textCuil={turno.cuilChofer}
                                textCelular={turno.errores}
                                textCuitEmpresa=""
                                textPatenteCamion={turno.patenteCamion}
                                textPatenteSemi1=""
                                textPatenteSemi2=""
                                imagen=""
                            />
                        ))}
                    </Grid>
                </Grid>
            ))}
        </Box>
    );
}
