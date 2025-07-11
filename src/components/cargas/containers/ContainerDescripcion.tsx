import { Box, IconButton, Typography } from "@mui/material";
import { useContext } from "react";
import { ContextoCargas } from "./ContainerTajetasCargas";
import BorderColorIcon from "@mui/icons-material/BorderColor";

export default function ContainerDescripcion() {
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
                <Typography>Descripción</Typography>
                <IconButton
                    disabled={!cargaSeleccionada}
                    onClick={() => handleClickAbrirDialog(4)}
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        p: 0,
                        transition: 'background 0.2s',
                        '&:hover': {
                            backgroundColor: '#f5f5f5',
                        },
                    }}
                >
                    <BorderColorIcon sx={{ fontSize: 16 }} />
                </IconButton>
            </Box>
            <Box
                sx={{
                    border: "1px solid #ccc",
                    borderRadius: "16px",
                    padding: 2,
                    width: "100%",
                    height: "100%",
                    textAlign: "left",
                    boxSizing: "border-box",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    minHeight: 125,
                }}
            >
                <Typography
                    variant="subtitle2"
                    sx={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        wordBreak: "break-word",
                    }}
                    color="#90979f"
                >
                    {cargaSeleccionada?.descripcion}
                </Typography>
            </Box>
        </>
    );
}
