import { Box, IconButton, Typography } from "@mui/material";
import { useContext } from "react";
import { ContextoCargas } from "./ContainerTajetasCargas";
import BorderColorIcon from "@mui/icons-material/BorderColor";
import { Mapa2 } from "../Mapa2";

export default function ContainerMapa() {
    const { cargaSeleccionada, handleClickAbrirDialog } =
        useContext(ContextoCargas);

    return (
        <>
            <Box
                sx={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    width: "100%",
                    marginRight: 3,
                    margingBottom: 1,
                }}
            >
                <Typography>Recorrido</Typography>
                <IconButton
                    disabled={!cargaSeleccionada}
                    onClick={() => handleClickAbrirDialog(1)}
                >
                    <BorderColorIcon sx={{ fontSize: 17 }} />
                </IconButton>
            </Box>
            <Box
                sx={{
                    marginTop: 0,
                }}
            >
                <Mapa2
                    coordenadasBalanza={[
                        cargaSeleccionada?.ubicacionBalanza?.latitud,
                        cargaSeleccionada?.ubicacionBalanza?.longitud,
                    ]}
                    coordenadasCarga={[
                        cargaSeleccionada?.ubicacionCarga.latitud,
                        cargaSeleccionada?.ubicacionCarga.longitud,
                    ]}
                    coordenadasDescarga={[
                        cargaSeleccionada?.ubicacionDescarga.latitud,
                        cargaSeleccionada?.ubicacionDescarga.longitud,
                    ]}
                />
            </Box>
        </>
    );
}
