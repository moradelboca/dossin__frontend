import { Box } from "@mui/material";
import TextField from "@mui/material/TextField";
import { useState, useEffect, useContext } from "react";
import { ContextoGeneral } from "./Contexto";
import Autocomplete from "@mui/material/Autocomplete";

interface props {
    datosNuevaCarga: any;
}

export default function SelectorMasInfo(selectorProps: props) {
    let { datosNuevaCarga } = selectorProps;
    const { backendURL } = useContext(ContextoGeneral);
    const [cargamentos, setCargamentos] = useState<any[]>([]);
    const [focused, setFocused] = useState(false);
    let cargamentosStrings: string[];

    useEffect(() => {
        fetch(`${backendURL}/cargamentos`)
            .then((response) => response.json())
            .then((cargamentos) => setCargamentos(cargamentos))
            .catch(() =>
                console.error("Error al obtener los Cargamentos disponibles")
            );
    }, [backendURL]);

    const seleccionarDescripcion = (e: any) => {
        datosNuevaCarga["descripcion"] = e.target.value;
    };

    return (
        <>
            <Box display="column" gap={2} width={"800px"}>
                <>Descripción</>
                <Box width={"560px"}>
                    <TextField
                        id="outlined-basic"
                        label="Ingresar máximo 100 caracteres"
                        variant="outlined"
                        inputProps={{
                            maxLength: 100, // Límite de 100 caracteres
                        }}
                        multiline
                        rows={focused ? 4 : 1} // Cambia el tamaño al enfocarse
                        onFocus={() => setFocused(true)} // Cambia el estado al enfocarse
                        onBlur={() => setFocused(false)} // Vuelve al estado original al salir del foco
                        onChange={seleccionarDescripcion} // Guardar la descripción
                        fullWidth
                    />
                </Box>
            </Box>
        </>
    );
}
