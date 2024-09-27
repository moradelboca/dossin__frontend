import Autocompletar from "./Autocompletar";
import { Box } from "@mui/material";

export default function SelectorTarifa() {
    return (
        <>
            <Box
                display="flex"
                flexDirection="row"
                gap={2}
                alignContent={"center"}
                alignItems={"center"}
            >
                <Box display="column" gap={2}>
                    <>Tarifa</>
                    <Autocompletar title="ingresar" />
                </Box>
                <>X</>
                <Box display="column" gap={2}>
                    <>Unidad</>
                    <Autocompletar title="Selecciona" />
                </Box>
            </Box>
        </>
    );
}
