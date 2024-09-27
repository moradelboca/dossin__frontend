import Autocompletar from "./Autocompletar";
import { Box } from "@mui/material";

export default function SelectorMasInfo() {
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
                    <>Kilometros</>
                    <Autocompletar title="ingresar" />
                </Box>
                <>X</>
                <Box display="column" gap={2}>
                    <>Carga</>
                    <Autocompletar title="Selecciona" />
                </Box>
            </Box>
            <Box display="column" gap={2}>
                <>Mas Informacion?</>
                <Autocompletar title="ingresar" />
            </Box>
        </>
    );
}
