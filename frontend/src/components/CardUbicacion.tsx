import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Typography from "@mui/material/Typography";
import { Box, CardActionArea } from "@mui/material";
import { CustomButtom } from "./CustomButtom";
import { styled } from "@mui/material/styles";
import Divider from "@mui/material/Divider";
import { useContext } from "react";
import { ContextoGeneral } from "./Contexto";
import { useNavigate } from "react-router-dom";


const TextoPrimario = styled(Typography)(() => ({
  fontFamily: "Arial",
  fontSize: "1rem",
  color: "#163660",
  textTransform: "uppercase",
  textAlign: "center",
}));

const TextoSecundario = styled(Typography)(() => ({
  fontFamily: "Arial",
  color: "#163660",
  opacity: 0.87,
  fontWeight: 500,
  fontSize: 14,
  marginBottom: "0.5rem",
}));


interface CardUbicacionProps {
    idCarga: number;
    ubicacionCarga?: string;
    ubicacionDescarga?: string;
    imagen?: string;
    fechaMinima?: string;
    tarifa?: number;
    tipoTarifa?: string;
    incluyeIVA?: boolean;
    fechaMaxima?: string;
    tiposAcoplados?: string;
    km?: string;
    horaCarga?: string;
    horaDescarga?: string;
}

export function CardUbicacion(props: CardUbicacionProps) {
    const navigate = useNavigate();
    const {
        idCarga,
        ubicacionCarga,
        ubicacionDescarga,
        imagen,
        fechaMinima,
        fechaMaxima,
        tarifa,
        incluyeIVA,
        tipoTarifa,
        tiposAcoplados,
        km,
        horaCarga,
        horaDescarga,
    } = props;

    const handleClickAbrirDialog = () => {
        navigate(`/cargas/${idCarga}`);
    };

    const handleClickVerCupos = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.stopPropagation();
        navigate(`/cargas/${idCarga}/cupos`);
    };

    const { theme } = useContext(ContextoGeneral);

    return (
        <Box>
            <CardActionArea
                onClick={handleClickAbrirDialog}
                sx={{
                    transition: "0.2s",
                    borderRadius: "16px",
                    minWidth: 256,
                    "&:hover": {
                        transform: "scale(1.1)",
                    },
                }}
            >
                <Card
                    sx={{
                        minWidth: 256,
                        borderRadius: "16px",
                        boxShadow: "none",
                        transition: "0.2s",
                        "&:hover": {
                            boxShadow: `0 0 10px ${theme.colores.gris}`,
                        },
                    }}
                >
                    <CardMedia
                        image={imagen}
                        sx={{
                            width: "100%",
                            height: 0,
                            paddingBottom: "50%",
                            backgroundColor: "rgba(0,0,0,0.08)",
                        }}
                    />
                    <CardContent
                        sx={{
                            backgroundColor: theme.colores.gris,
                            padding: "20px",
                        }}
                    >
                        <TextoPrimario variant={"h3"}>
                            {ubicacionCarga} - {ubicacionDescarga}
                        </TextoPrimario>
                        <TextoPrimario variant={"body1"}>
                            {fechaMinima} - {fechaMaxima}{" "}
                        </TextoPrimario>
                        <Divider
                            sx={{ my: 2, bgcolor: "#163660", height: 1 }}
                        />
                        <TextoSecundario>
                            Tarifa: ${tarifa}/{tipoTarifa} {!incluyeIVA ? "+ IVA" : null}
                        </TextoSecundario>
                        <TextoSecundario>{km} Km</TextoSecundario>
                        <TextoSecundario>
                            Tipo de Acoplados: {tiposAcoplados}
                        </TextoSecundario>
                        <TextoSecundario>
                            Horarios de Carga: {horaCarga}
                        </TextoSecundario>
                        <TextoSecundario>
                            Horarios de Descarga: {horaDescarga}
                        </TextoSecundario>
                        <Box
                            sx={{
                                display: "flex",
                                justifyContent: "space-evenly",
                            }}
                        >
                            <CustomButtom
                                title="Ver Cupos"
                                onClick={(event) => handleClickVerCupos(event)}
                            ></CustomButtom>
                            <CustomButtom title="Modificar"></CustomButtom>
                        </Box>
                    </CardContent>
                </Card>
            </CardActionArea>
        </Box>
    );
}
