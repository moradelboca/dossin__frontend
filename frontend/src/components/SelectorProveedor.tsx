import { Box } from "@mui/material";
import TextField from "@mui/material/TextField";
import { useState, useEffect, useContext } from "react";
import { ContextoGeneral } from "./Contexto";
import Autocomplete from "@mui/material/Autocomplete";

interface Props {
    datosNuevaCarga: any;
}

export default function SelectorProveedor({ datosNuevaCarga }: Props) {
    const { backendURL } = useContext(ContextoGeneral);
    const [cargamentos, setCargamentos] = useState<any[]>([]);
    const [proveedores, setProveedores] = useState<any[]>([]);
    const [value, setValue] = useState<string | null>(null); // Estado para el cargamento seleccionado
    const [inputValue, setInputValue] = useState(""); // Estado para el valor del input

    useEffect(() => {
        fetch(`${backendURL}/cargamentos`)
            .then((response) => response.json())
            .then((cargamentos) => setCargamentos(cargamentos))
            .catch(() =>
                console.error("Error al obtener los Cargamentos disponibles")
            );
    }, [backendURL]);
    useEffect(() => {
        fetch(`${backendURL}/proveedores`)
            .then((response) => response.json())
            .then((proveedores) => setProveedores(proveedores))
            .catch(() =>
                console.error("Error al obtener los Proveedor disponibles")
            );
    }, [backendURL]);

    const cargamentosStrings = cargamentos.map(
        (cargamento) => cargamento.nombre
    );
    const proveedoresStrings = proveedores.map((proveedor) => proveedor.nombre);
    const cargamentosIds = cargamentos.map((cargamento) => cargamento.id);
    const proveedoresIds = proveedores.map((proveedor) => proveedor.id);

    const seleccionarKilometros = (e: any) => {
        const value = e.target.value;
        datosNuevaCarga["cantidadKm"] = Number(value);
    };

    const seleccionarCargamento = (event: any, newValue: string | null) => {
        setValue(newValue); // Actualiza el estado del valor seleccionado

        const index = cargamentosStrings.indexOf(newValue || "");
        if (index !== -1) {
            datosNuevaCarga["idCargamento"] = cargamentosIds[index];
        } else {
            datosNuevaCarga["idCargamento"] = null;
        }
    };
    const seleccionarProveedor = (event: any, newValue: string | null) => {
        setValue(newValue); // Actualiza el estado del valor seleccionado

        const index = proveedoresStrings.indexOf(newValue || "");
        if (index !== -1) {
            datosNuevaCarga["idProveedor"] = proveedoresIds[index];
        } else {
            datosNuevaCarga["idProveedor"] = null;
        }
    };

    return (
        <Box
            display="flex"
            flexDirection="column"
            gap={2}
            alignContent={"center"}
            alignItems={"flex-start"}
            width={"800px"}
        >
            <Autocomplete
                disablePortal
                options={proveedoresStrings}
                value={value} // Asigna el estado del valor seleccionado
                onChange={seleccionarProveedor} // Maneja el cambio de cargamento
                inputValue={inputValue} // Valor del input
                onInputChange={(event, newInputValue) => {
                    setInputValue(newInputValue); // Actualiza el valor del input
                }}
                sx={{ width: 540 }}
                renderInput={(params) => (
                    <TextField {...params} label="Proveedor" />
                )}
            />
            <Box
                display="flex"
                flexDirection="row"
                gap={2}
                alignContent={"center"}
                alignItems={"center"}
                width={"800px"}
            >
                <Box display="column" gap={2}>
                    <TextField
                        id="outlined-basic"
                        variant="outlined"
                        type="number" // Solo permite números
                        inputProps={{
                            inputMode: "numeric", // Teclado numérico en móviles
                            pattern: "[0-9]*", // Acepta solo dígitos
                        }}
                        onChange={seleccionarKilometros} // Guardar los kilómetros
                        label="Kilometros"
                    />
                </Box>
                <Box display="column" gap={2}>
                    <Autocomplete
                        disablePortal
                        options={cargamentosStrings}
                        value={value} // Asigna el estado del valor seleccionado
                        onChange={seleccionarCargamento} // Maneja el cambio de cargamento
                        inputValue={inputValue} // Valor del input
                        onInputChange={(event, newInputValue) => {
                            setInputValue(newInputValue); // Actualiza el valor del input
                        }}
                        sx={{ width: 300 }}
                        renderInput={(params) => (
                            <TextField {...params} label="Cargamento" />
                        )}
                    />
                </Box>
            </Box>
        </Box>
    );
}
