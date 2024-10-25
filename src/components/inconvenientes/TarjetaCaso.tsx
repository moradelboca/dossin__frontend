import { Box, Typography } from "@mui/material";
import { CustomButtom } from "../botones/CustomButtom";
import { styled } from "@mui/material/styles";
import { useState } from "react";
import { CardActions } from "@mui/material";

// Contenedor para centrar el StyledCaja
const CenteredContainer = styled(Box)(() => ({
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh", // Ocupa el 100% de la altura del viewport
    width: "100%", // Ocupa el 100% del ancho
}));

const StyledCaja = styled(Box)(() => ({
    minHeight: 570,
    maxWidth: 645,
    background: `linear-gradient(160deg, #D9D9D9 55%, #A5A5A5 100%)`,
    borderRadius: "20px",
    display: "flex",
    justifyContent: "space-around",
    alignItems: "center",
    flexDirection: "column",
    boxShadow: "0 6px 16px 0 #8d8c8c",
    transition: "0.2s",
    margin: 1,
    padding: "28px 12px",
    "&:hover": {
        background: "#b5b5b5",
        transform: "scale(1.1)",
    },
}));

interface TarjetaProps {
    numCp?: string;
    numFact?: number;
    kgCargados?: number;
    kgDescargados?: number;
    textCelular?: number;
}

export function TarjetaCaso(props: TarjetaProps) {
    const { numCp, numFact, kgCargados, kgDescargados, textCelular } = props;
    const [confirmado, setConfirmado] = useState(false);
    const handleClickConfirmar = () => {
        setConfirmado(true);
    };

    return (
        <>
            <CenteredContainer>
                <StyledCaja>
                    <Typography variant="h4" color="#163660">
                        Caso
                    </Typography>

                    {/* Caja de la Descripción */}
                    <Box sx={{ alignSelf: "flex-start" }}>
                        <Typography variant="h6" color="#163660" align="left">
                            Descripción:
                        </Typography>
                    </Box>
                    <Box
                        sx={{
                            minHeight: 150,
                            minWidth: 545,
                            background: "#ffff",
                            borderRadius: "20px",
                            display: "flex", // Alinea el contenido interno a la izquierda
                            alignItems: "flex-start",
                        }}
                    >
                        <Typography
                            variant="subtitle1"
                            color="#163660"
                            align="left"
                            margin={2}
                        >
                            "Hola la carta de porte que me pasaron esta re mal,
                            todos los datos estan para atras.
                            aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
                        </Typography>
                    </Box>
                    <Box sx={{ alignSelf: "flex-start" }}>
                        <Typography variant="h6" color="#163660" align="left">
                            Carta de porte asociada:{numCp}
                        </Typography>
                        <Typography variant="h6" color="#163660" align="left">
                            Factura asociada:{numFact}
                        </Typography>
                        <Typography variant="h6" color="#163660" align="left">
                            Kg Cargados:{kgCargados}
                        </Typography>
                        <Typography variant="h6" color="#163660" align="left">
                            Kg Descargados:{kgDescargados}
                        </Typography>
                        <Typography variant="h6" color="#163660" align="left">
                            Celular:{textCelular}
                        </Typography>
                    </Box>
                    <CardActions>
                        <Box
                            sx={{
                                display: "flex",
                                justifyContent: "space-evenly", // Espacio uniforme entre los botones
                                width: "100%",
                                gap: 30, // Espacio entre los botones, puedes ajustar este valor
                            }}
                        >
                            {/* Botón "Confirmar", solo si no está confirmado */}
                            {!confirmado ? (
                                <CustomButtom
                                    onClick={handleClickConfirmar}
                                    title="Solucionado"
                                />
                            ) : null}
                            {/* Botón "Contactar" */}
                            <CustomButtom
                                title="Contactar"
                                onClick={() =>
                                    window.open(
                                        `https://wa.me/${textCelular}`,
                                        "_blank"
                                    )
                                }
                            />
                        </Box>
                    </CardActions>
                </StyledCaja>
            </CenteredContainer>
        </>
    );
}
