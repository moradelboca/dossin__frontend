import Autocompletar from "./Autocompletar";
import { Box } from "@mui/material";
import TextField from "@mui/material/TextField";
import { useState, useEffect, useContext } from "react";
import { ContextoGeneral } from "./Contexto";

export default function SelectorMasInfo() {
    const { backendURL } = useContext(ContextoGeneral);
    const [cargamentos, setCargamentos] = useState<any[]>([]);
    let cargamentosStrings: string[];
    const [focused, setFocused] = useState(false); // Estado para el enfoque

    useEffect(() => {
        fetch(`${backendURL}/cargamentos`)
            .then((response) => response.json())
            .then((cargamentos) => setCargamentos(cargamentos))
            .catch(() =>
                console.error("Error al obtener las Ubicaciones disponibles")
            );
    }, []);
    cargamentosStrings = cargamentos.map((cargamento) => {
        return `${cargamento.nombre}`;
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
                            label="Kilometros"
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
                    {/* <Autocompletar
                        info={cargamentosStrings}
                        title="Cargamento"
                    /> */}
                </Box>
            </Box>
            <Box display="column" gap={2}>
                <>Descripcion</>
                <Box width={"560px"}>
                    <TextField
                        id="outlined-basic"
                        label="Ingresar maximo 100 caracteres"
                        variant="outlined"
                        inputProps={{
                            maxLength: 100, // Límite de 100 caracteres
                        }}
                        multiline
                        rows={focused ? 4 : 1} // Cambia el tamaño al enfocarse
                        onFocus={() => setFocused(true)} // Cambia el estado al enfocarse
                        onBlur={() => setFocused(false)} // Vuelve al estado original al salir del foco
                        fullWidth
                    />
                </Box>
            </Box>
        </>
    );
}
