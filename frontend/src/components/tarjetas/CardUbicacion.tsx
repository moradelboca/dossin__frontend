import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import { Box, CardActionArea } from "@mui/material";
import { CustomButtom } from "../botones/CustomButtom";
import { styled } from "@mui/material/styles";
import Divider from "@mui/material/Divider";
import { useContext } from "react";
import { ContextoGeneral } from "../Contexto";
import { useNavigate } from "react-router-dom";
import { Mapa } from "../Mapa";


const CustomTypography = styled(Typography)(() => ({
  fontFamily: "Arial",
  fontSize: "1rem",
  color: "#163660",
  textTransform: "uppercase",
  textAlign: "center",
}));


export function CardUbicacion(carga: any) {
    const navigate = useNavigate();

    const handleClickAbrirDialog = () => {
        navigate(`/cargas/${carga.idCarga}`);
    };

    const handleClickVerCupos = () => {
        navigate(`/cargas/${carga.idCarga}/cupos`);
    };

    const { theme } = useContext(ContextoGeneral);

    return (
        <Box>
            <Card
                sx={{
                    minWidth: 256,
                    borderRadius: "16px",
                    boxShadow: "none",
                    transition: "0.2s",
                    "&:hover": {
                        boxShadow: `0 0 10px ${theme.colores.gris}`,
                        transform: "scale(1.05)",
                    },
                }}
            >
                {carga.latitudCarga ? <Mapa coordenadas={[carga.latitudCarga, carga.longitudCarga]}/> : null}
                <CardContent
                    sx={{
                        backgroundColor: theme.colores.gris,
                        padding: "20px",
                    }}
                >
                    <CustomTypography variant={"h3"}>
                        {carga.ubicacionCarga} - {carga.ubicacionDescarga}
                    </CustomTypography>
                    <CustomTypography variant={"body1"}>
                        {carga.fechaMinima} - {carga.fechaMaxima}{" "}
                    </CustomTypography>
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "space-evenly",
                            marginTop: "20px",
                        }}
                    >
                        <CustomButtom
                            title="Ver Cupos"
                            onClick={handleClickVerCupos}
                        ></CustomButtom>
                        <CustomButtom
                            title="Ver Detalles"
                            onClick={handleClickAbrirDialog}
                        ></CustomButtom>
                    </Box>
                </CardContent>
            </Card>
        </Box>
    );
}
