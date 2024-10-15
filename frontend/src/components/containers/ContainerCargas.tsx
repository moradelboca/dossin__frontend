import { BotonIcon } from "../botones/IconButton";
import { AccessAlarmOutlined } from "@mui/icons-material";
import Box from "@mui/material/Box";
import { CarouselCargas } from "../carousel/CarouselCargas";
import { useParams } from "react-router-dom";
import { CargaDialog } from "../tarjetas/CargaDialog";
import CrearCargaStepper from "../tarjetas/CrearCargaStepper";
import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@mui/material";

export function ContainerCargas() {
    const { idCarga } = useParams();

    // Estado para controlar el Dialog
    const [openDialog, setOpenDialog] = useState(false);

    // Función para abrir el Dialog
    const handleClickCrearCarga = () => {
        setOpenDialog(true);
    };

    // Función para cerrar el Dialog
    const handleCloseDialog = () => {
        setOpenDialog(false);
    };

    return (
        <Box
            sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                flexDirection: "column",
            }}
        >
            <BotonIcon
                onClick={handleClickCrearCarga}
                title="Quiero crear una nueva carga"
                icon={<AccessAlarmOutlined />}
            />
            <CarouselCargas />
            {idCarga ? <CargaDialog /> : null}

            <Dialog
                open={openDialog}
                onClose={handleCloseDialog}
                maxWidth="lg"
                fullWidth
            >
                <DialogTitle>Crear Nueva Carga</DialogTitle>
                <DialogContent sx={{ height: "80vh", alignContent: "center" }}>
                    <CrearCargaStepper handleCloseDialog={handleCloseDialog} />
                </DialogContent>
            </Dialog>
        </Box>
    );
}
