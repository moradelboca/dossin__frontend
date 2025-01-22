import { Box, IconButton, Typography } from "@mui/material";
import { useContext } from "react";
import BorderColorIcon from "@mui/icons-material/BorderColor";
import { ContextoCargas } from "./ContainerTajetasCargas";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";

export default function ContainerTipoAcoplado() {
    const { cargaSeleccionada, handleClickAbrirDialog } =
        useContext(ContextoCargas);

    const tiposAcoplados = cargaSeleccionada?.tiposAcoplados
        .map((acoplado: any) => acoplado.nombre)
        .join(", ") || "No definido";

    return (
        <Box
            sx={{
                border: "1px solid #ccc",
                borderRadius: "8px",
                padding: "0.5rem",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                height: "100%",
                backgroundColor: "#ffffff",
            }}
        >
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    width: "100%",
                }}
            >
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        color: "#90979F",
                    }}
                >
                    <LocalShippingIcon sx={{ fontSize: 20 }} />
                </Box>
                <IconButton
                    disabled={!cargaSeleccionada}
                    onClick={() => handleClickAbrirDialog(2)}
                >
                    <BorderColorIcon sx={{ fontSize: 16 }} />
                </IconButton>
            </Box>
            <Box>
                <Typography
                    variant="subtitle1"
                    fontWeight="bold"
                    sx={{
                        color: "#90979F",
                        fontSize: 12,
                        marginBottom: "-0.5rem",
                    }}
                >
                    Tipo de acoplado
                </Typography>
                <Typography
                    variant="h6"
                    sx={{
                        color: "#333",
                        fontWeight: 600,
                    }}
                >
                    {tiposAcoplados}
                </Typography>
            </Box>
        </Box>
    );
}
