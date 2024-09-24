import { BotonIcon } from "./IconButton";
import { AccessAlarmOutlined } from "@mui/icons-material";
import Box from "@mui/material/Box";
import { CarouselCargas } from "./carousel/CarouselCargas";
import { useParams } from "react-router-dom";
import { CargaDialog } from "./CargaDialog";

export function ContainerCargas() {

    const { idCarga } = useParams();

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
                title="Quiero crear una nueva carga"
                icon={<AccessAlarmOutlined />}
            />
            <CarouselCargas />
            {idCarga ? <CargaDialog /> : null}
        </Box>
    );
}
