import { BotonIcon } from "../../botones/IconButton";
import { AccessAlarmOutlined } from "@mui/icons-material";
import Box from "@mui/material/Box";
import { useParams } from "react-router-dom";
import { CargaDialog } from "../tarjetas/CargaDialog";
import CrearCargaStepper from "../creadores/CrearCargaStepper";
import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@mui/material";
import { ContainerTarjetasCargas } from "./ContainerTajetasCargas";

export function ContainerCargas() {
    const { idCarga } = useParams();

    return (
        <>
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "100%",
                    flexDirection: "column",
                    backgroundColor: "#f6f6f6",
                }}
            >
                <ContainerTarjetasCargas />
                {idCarga ? <CargaDialog /> : null}
            </Box>
        </>
    );
}
