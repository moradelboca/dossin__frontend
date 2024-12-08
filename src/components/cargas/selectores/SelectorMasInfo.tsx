import { Box } from "@mui/material";
import TextField from "@mui/material/TextField";
import { useState, useContext } from "react";
import { ContextoStepper } from "../creadores/CrearCargaStepper";

export default function SelectorMasInfo() {
    const { datosNuevaCarga, setDatosNuevaCarga } = useContext(ContextoStepper);
    const [focused, setFocused] = useState(false);

    const seleccionarDescripcion = (e: any) => {
        datosNuevaCarga["descripcion"] = e.target.value;
        setDatosNuevaCarga({ ...datosNuevaCarga });
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
                                maxLength: 100,
                            },
                        }}
                        multiline
                        value={datosNuevaCarga["descripcion"]}
                        rows={focused ? 4 : 1}
                        onFocus={() => setFocused(true)}
                        onBlur={() => setFocused(false)}
                        onChange={seleccionarDescripcion}
                        fullWidth
                    />
                </Box>
            </Box>
        </>
    );
}
