import { Box } from "@mui/material";
import TextField from "@mui/material/TextField";
import { useState, useContext } from "react";
import { ContextoStepper } from "../tarjetas/CrearCargaStepper";

export default function SelectorMasInfo() {
    const { datosNuevaCarga } = useContext(ContextoStepper);
    const [focused, setFocused] = useState(false);

    const seleccionarDescripcion = (e: any) => {
        datosNuevaCarga["descripcion"] = e.target.value;
    };

    return (
        <>
            <Box display="column" gap={2} width={"800px"}>
                <>Descripción</>
                <Box width={"560px"} mt={"10px"}>
                    <TextField
                        id="outlined-basic"
                        label="Ingresar máximo 100 caracteres"
                        variant="outlined"
                        slotProps={{
                            htmlInput: {
                                maxLength: 100, // Límite de 100 caracteres
                            }
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
