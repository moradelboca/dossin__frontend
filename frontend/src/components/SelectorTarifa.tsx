import Autocompletar from "./Autocompletar";
import { Box } from "@mui/material";
import TextField from "@mui/material/TextField";
import { useState, useEffect, useContext } from "react";
import { ContextoGeneral } from "./Contexto";

export default function SelectorTarifa() {
    const { backendURL } = useContext(ContextoGeneral);
    const [tarifas, setTarifas] = useState<any[]>([]);
    let unidadesStrings: string[];

    useEffect(() => {
        fetch(`${backendURL}/tipotarifa`)
            .then((response) => response.json())
            .then((tarifas) => setTarifas(tarifas))
            .catch(() =>
                console.error("Error al obtener las Tarifas disponibles")
            );
    }, []);
    unidadesStrings = tarifas.map((tarifa) => {
        return `${tarifa.nombre}`;
    });

    return (
        <>
            <Box
                display="flex"
                flexDirection="row"
                gap={2}
                alignContent={"center"}
                alignItems={"center"}
                width={"800px"}
            >
                <Box display="column" gap={2}>
                    <Box>
                        <TextField
                            id="outlined-basic"
                            label="Tarifa"
                            variant="outlined"
                            type="number" // Solo permite números
                            inputProps={{
                                inputMode: "numeric", // Teclado numérico en móviles
                                pattern: "[0-9]*", // Acepta solo dígitos
                            }}
                        />
                    </Box>
                </Box>
                <>X</>
                <Box display="column" gap={2}>
                    {/* <Autocompletar datos={unidadesStrings} title="Unidad" /> */}
                </Box>
            </Box>
        </>
    );
}
