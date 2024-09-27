import Autocompletar from "./Autocompletar";
import { Box } from "@mui/material";
import TextField from "@mui/material/TextField";

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
                    <Box>
                        <TextField
                            id="outlined-basic"
                            label="Ingresar"
                            variant="outlined"
                        />
                    </Box>
                </Box>
                <>X</>
                <Box display="column" gap={2}>
                    <>Unidad</>
                    <Autocompletar info={["asads"]} title="Selecciona" />
                </Box>
            </Box>
        </>
    );
}
