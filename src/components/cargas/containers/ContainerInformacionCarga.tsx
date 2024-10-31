import { Box, IconButton, Typography } from "@mui/material";
import { useContext } from "react";
import { ContextoCargas } from "./ContainerTajetasCargas";
import BorderColorIcon from "@mui/icons-material/BorderColor";
import { useNavigate } from "react-router-dom";
import ContainerTipoAcoplado from "./ContainerTipoAcoplado";

//agregar una interface para recibir el valor de los cupos

export default function ContainerInformacionCarga() {
    const navigate = useNavigate();
    const { cupos } = useContext(ContextoCargas);
    const cuposLength = cupos.length;
    const { cargaSeleccionada, handleClickAbrirDialog } =
        useContext(ContextoCargas);
    const handleClickVerCupos = () => {
        navigate(`/cargas/${cargaSeleccionada.id}/cupos`);
    };

    return (
        <>
            {/* Tarifa */}
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    flexDirection: "column",
                    width: "100%",
                    height: "100%",
                }}
            >
                <Box
                    sx={{
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                        width: "100%",
                    }}
                >
                    <Typography>Tarifa</Typography>
                    <IconButton
                        disabled={!cargaSeleccionada}
                        onClick={() => handleClickAbrirDialog(3)}
                    >
                        <BorderColorIcon sx={{ fontSize: 17 }} />
                    </IconButton>
                </Box>
                <Box
                    sx={{
                        border: "1px solid #ccc",
                        borderRadius: "16px",
                        padding: 2,
                        width: "100%",
                        textAlign: "left",
                    }}
                >
                    <Typography
                        variant="subtitle2"
                        sx={{ marginLeft: 2 }}
                        color="#90979f"
                        minHeight={22}
                    >
                        ${cargaSeleccionada?.tarifa} /
                        {cargaSeleccionada?.tipoTarifa.nombre}
                        {cargaSeleccionada?.incluyeIva === 1 ? "+IVA" : ""}
                    </Typography>
                </Box>
            </Box>

            {/* Kilómetros */}
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    flexDirection: "column",
                    width: "100%",
                    height: "100%",
                    marginLeft: 2,
                }}
            >
                <Box
                    sx={{
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                        width: "100%",
                    }}
                >
                    <Typography>Kilometros</Typography>
                    <IconButton
                        disabled={!cargaSeleccionada}
                        onClick={() => handleClickAbrirDialog(0)}
                    >
                        <BorderColorIcon sx={{ fontSize: 17 }} />
                    </IconButton>
                </Box>
                <Box
                    sx={{
                        border: "1px solid #ccc",
                        borderRadius: "16px",
                        padding: 2,
                        width: "100%",
                        textAlign: "left",
                    }}
                >
                    <Typography
                        variant="subtitle2"
                        sx={{ marginLeft: 2 }}
                        color="#90979f"
                        minHeight={22}
                    >
                        {cargaSeleccionada?.cantidadKm}
                    </Typography>
                </Box>
            </Box>

            {/* Cupos creados */}
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    flexDirection: "column",
                    width: "100%",
                    height: "100%",
                }}
            >
                <Box
                    sx={{
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                        width: "100%",
                    }}
                >
                    <Typography>Cupos creados</Typography>
                    <IconButton
                        disabled={!cargaSeleccionada}
                        onClick={handleClickVerCupos}
                    >
                        <BorderColorIcon sx={{ fontSize: 17 }} />
                    </IconButton>
                </Box>
                <Box
                    sx={{
                        border: "1px solid #ccc",
                        borderRadius: "16px",
                        padding: 2,
                        width: "100%",
                        textAlign: "left",
                    }}
                >
                    <Typography
                        variant="subtitle2"
                        sx={{ marginLeft: 2 }}
                        color="#90979f"
                        minHeight={22}
                    >
                        {cuposLength}
                    </Typography>
                </Box>
            </Box>

            {/* Tipos de camiones */}
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    flexDirection: "column",
                    width: "100%",
                    height: "100%",
                    marginLeft: 2,
                }}
            >
                <ContainerTipoAcoplado />
            </Box>
        </>
    );
}
