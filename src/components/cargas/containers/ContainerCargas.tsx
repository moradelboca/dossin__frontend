import Box from "@mui/material/Box";
import { useParams } from "react-router-dom";
import { CargaDialog } from "../tarjetas/CargaDialog";
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
