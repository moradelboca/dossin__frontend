import Autocompletar from "./Autocompletar";
import { Box } from "@mui/material";
import Reloj2 from "./Relo2";

export default function SelectorDeUbicacion() {
    return (
        <>
            <Box display="column" flexDirection="row" gap={2}>
                <Box display="flex" flexDirection="row" gap={2}>
                    <Box
                        display="column"
                        flexDirection="row"
                        gap={2}
                        alignItems={"center"}
                    >
                        <Autocompletar title="Desde" />
                        <Box display="flex" flexDirection="row" gap={2}>
                            <Box display="column" gap={2}>
                                <>Inicio</>
                                <Reloj2 />
                            </Box>
                            <Box display="column">
                                <>Fin</>
                                <Reloj2 />
                            </Box>
                        </Box>
                    </Box>
                    <Box
                        display="column"
                        flexDirection="row"
                        gap={2}
                        alignItems={"center"}
                    >
                        <Autocompletar title="A" />
                        <Box display="flex" flexDirection="row" gap={2}>
                            <Box display="column">
                                <>Inicio</>
                                <Reloj2 />
                            </Box>
                            <Box display="column">
                                <>Fin</>
                                <Reloj2 />
                            </Box>
                        </Box>
                    </Box>
                </Box>
            </Box>
        </>
    );
}
