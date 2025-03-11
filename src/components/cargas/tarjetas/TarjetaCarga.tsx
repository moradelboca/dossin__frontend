import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import { Box } from "@mui/material";
import { useContext } from "react";
import { ContextoGeneral } from "../../Contexto";

export function TarjetaCarga(props: any) {
    const { onClick, datosCarga, isSelected } = props;

    const { theme } = useContext(ContextoGeneral);
    return (
        <Box
            sx={{
                width: "100%",
                minWidth: 256,
                maxWidth: 450,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                flexGrow: 1,
            }}
        >
            <Card
                onClick={onClick}
                sx={{
                    borderRadius: "16px",
                    boxShadow: "none",
                    transition: "0.2s",
                    flexGrow: 1,
                }}
            >
                <CardContent
                    sx={{
                        backgroundColor: "#ffffff",
                        padding: "10px",
                        flexGrow: 1,
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
                            {datosCarga.id}, {datosCarga.cargamento.nombre}
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
                                        {
                                            datosCarga.ubicacionCarga.localidad
                                                .nombre
                                        }
                                        ,{" "}
                                        {
                                            datosCarga.ubicacionCarga.localidad
                                                .provincia.nombre
                                        }
                                        ,{" "}
                                        {
                                            datosCarga.ubicacionCarga.localidad
                                                .provincia.pais.nombre
                                        }
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
                                        {
                                            datosCarga.ubicacionDescarga
                                                .localidad.nombre
                                        }
                                        ,{" "}
                                        {
                                            datosCarga.ubicacionDescarga
                                                .localidad.provincia.nombre
                                        }
                                        ,{" "}
                                        {
                                            datosCarga.ubicacionDescarga
                                                .localidad.provincia.pais.nombre
                                        }
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
