import { Box, IconButton, Typography } from "@mui/material";
import { useContext } from "react";
import { ContextoCargas } from "./ContainerTajetasCargas";
import BorderColorIcon from "@mui/icons-material/BorderColor";

export default function ContainerTipoAcoplado() {
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
                }}
            >
                <Typography>Tipo de acoplado</Typography>
                <IconButton
                    disabled={!cargaSeleccionada}
                    onClick={() => handleClickAbrirDialog(2)}
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
                    {cargaSeleccionada?.tiposAcoplados.map(
                        (acoplado: any, index: any) => (
                            <span key={index}>
                                {acoplado.nombre}
                                {index <
                                    cargaSeleccionada.tiposAcoplados.length -
                                        1 && ", "}
                            </span>
                        )
                    )}
                </Typography>
            </Box>
        </>
    );
}
