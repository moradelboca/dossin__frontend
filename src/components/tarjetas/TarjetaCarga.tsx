import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import { Box, CardActionArea } from "@mui/material";
import { CustomButtom } from "../botones/CustomButtom";
import { styled } from "@mui/material/styles";
import Divider from "@mui/material/Divider";
import { useContext, useState } from "react";
import { ContextoGeneral } from "../Contexto";
import { useNavigate } from "react-router-dom";
import { Mapa } from "../Mapa";

export function TarjetaCarga(props: any) {
    const navigate = useNavigate();
    const { onClick, datosCarga, isSelected } = props;

    const handleClickAbrirDialog = () => {
        navigate(`/cargas/${datosCarga.id}`);
    };

    const { theme } = useContext(ContextoGeneral);

    return (
        <Box
            sx={{
                minWidth: 256,
                maxWidth: 500,
            }}
        >
            <Card
                onClick={onClick}
                sx={{
                    minWidth: 256,
                    maxWidth: 500,
                    borderRadius: "16px",
                    boxShadow: "none",
                    transition: "0.2s",
                    "&:hover": {
                        boxShadow: `0 0 10px ${theme.colores.gris}`,
                        transform: "scale(1.05)",
                    },
                }}
            >
                <CardContent
                    sx={{
                        backgroundColor: "#ffffff",
                        padding: "10px",
                    }}
                >
                    <Box
                        sx={{
                            display: "flex",
                            flexDirection: "row",
                        }}
                    >
                        <Typography color="#90979f">Carga: # </Typography>
                        <Typography>
                            {" "}
                            {datosCarga.id}, {datosCarga.cargamento}
                        </Typography>
                    </Box>
                    <Box
                        marginTop={2}
                        sx={{
                            display: "flex",
                            flexDirection: "column",
                            borderRadius: "16px",
                            border: "2px solid #ccc",
                            backgroundColor: isSelected
                                ? theme.colores.azul
                                : "#ffffff",
                            color: isSelected ? "#ffffff" : "#000000",
                        }}
                    >
                        <Box
                            margin={2}
                            sx={{
                                display: "flex",
                                flexDirection: "row",
                                alignItems: "flex-start",
                            }}
                        >
                            <Box
                                sx={{
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    marginRight: 2,
                                }}
                            >
                                <Typography
                                    sx={{
                                        color: isSelected
                                            ? "#ffffff"
                                            : theme.colores.azul,
                                        fontSize: "24px",
                                    }}
                                >
                                    ●
                                </Typography>
                                <Box
                                    sx={{
                                        width: "2px",
                                        height: "50px",
                                        color: theme.colores.azul,
                                        borderRight: "2px dashed #90979f",
                                    }}
                                />
                                <Typography
                                    sx={{
                                        color: isSelected
                                            ? "#ffffff"
                                            : theme.colores.azul,
                                        fontSize: "24px",
                                    }}
                                >
                                    ○
                                </Typography>
                            </Box>

                            <Box
                                sx={{
                                    display: "flex",
                                    flexDirection: "column",
                                }}
                            >
                                {/* Lugar de carga */}
                                <Box sx={{ marginBottom: 4 }}>
                                    <Typography>
                                        {datosCarga.ubicacionCarga.localidad},{" "}
                                        {datosCarga.ubicacionCarga.provincia},{" "}
                                        {datosCarga.ubicacionCarga.pais}
                                    </Typography>
                                    <Typography
                                        color={
                                            isSelected ? "#d9d9e6" : "#90979f"
                                        }
                                    >
                                        {datosCarga.ubicacionCarga.nombre}
                                    </Typography>
                                </Box>

                                {/* Lugar de descarga */}
                                <Box>
                                    <Typography>
                                        {datosCarga.ubicacionDescarga.localidad}
                                        ,{" "}
                                        {datosCarga.ubicacionDescarga.provincia}
                                        , {datosCarga.ubicacionDescarga.pais}
                                    </Typography>
                                    <Typography
                                        color={
                                            isSelected ? "#d9d9e6" : "#90979f"
                                        }
                                    >
                                        {datosCarga.ubicacionDescarga.nombre}
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>
                    </Box>
                </CardContent>
            </Card>
        </Box>
    );
}
