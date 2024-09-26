import { BotonIcon } from "./botones/IconButton";
import { AccessAlarmOutlined } from "@mui/icons-material";
import Box from "@mui/material/Box";
import { CarouselCargas } from "./carousel/CarouselCargas";
import { useNavigate, useParams } from "react-router-dom";
import { CargaDialog } from "./CargaDialog";

export function ContainerCargas() {

    const navigate = useNavigate();

    const { idCarga } = useParams();

    const handleClickCrearCarga = () => {
        navigate("/cargas/crearCarga");
    }

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
        </Box>
    );
}
