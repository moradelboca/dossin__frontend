import { Box } from "@mui/material";
import TextField from "@mui/material/TextField";
import { useState, useEffect, useContext } from "react";
import { ContextoGeneral } from "../Contexto";
import Autocomplete from "@mui/material/Autocomplete";
import {
    NumericFormat,
    NumericFormatProps,
    PatternFormat,
} from "react-number-format";
import React from "react";
import Stack from "@mui/material/Stack";

interface Props {
    datosNuevaCarga: any;
}
interface CustomProps {
    onChange: (event: { target: { name: string; value: string } }) => void;
    name: string;
}

const KmFormat = React.forwardRef<any, CustomProps>(
    function KmFormat(props, ref) {
        const { onChange, ...other } = props;

        return (
            <PatternFormat
                {...other}
                getInputRef={ref}
                format="####"
                mask="_" // Puedes personalizar la máscara que desees
                onValueChange={(values) => {
                    // Verifica si el valor es negativo
                    if (Number(values.value) < 0) {
                        return; // No hacer nada si el valor es negativo
                    }

                    onChange({
                        target: {
                            name: props.name,
                            value: values.value,
                        },
                    });
                }}
            />
        );
    }
);

export default function SelectorProveedor({ datosNuevaCarga }: Props) {
    const { backendURL } = useContext(ContextoGeneral);
    const [cargamentos, setCargamentos] = useState<any[]>([]);
    const [proveedores, setProveedores] = useState<any[]>([]);
    const [isFocused, setIsFocused] = useState(false);

    useEffect(() => {
        fetch(`${backendURL}/cargamentos`)
            .then((response) => response.json())
            .then((cargamentos) => setCargamentos(cargamentos))
            .catch(() =>
                console.error("Error al obtener los Cargamentos disponibles")
            );

        fetch(`${backendURL}/proveedores`)
            .then((response) => response.json())
            .then((p) => setProveedores(p))
            .catch(() =>
                console.error("Error al obtener los Proveedores disponibles")
            );
    }, []);

    const cargamentosStrings = cargamentos.map(
        (cargamento) => cargamento.nombre
    );
    const proveedoresStrings = proveedores.map((proveedor) => proveedor.nombre);
    const cargamentosIds = cargamentos.map((cargamento) => cargamento.id);
    const proveedoresIds = proveedores.map((proveedor) => proveedor.id);
    const [values, setValues] = React.useState({
        numberformat: "",
    });

    const seleccionarKilometros = (event: any) => {
        datosNuevaCarga["cantidadKm"] = Number(event.target.value);
    };

    const seleccionarCargamento = (event: any, seleccionado: string | null) => {
        if (seleccionado) {
            const index = cargamentosStrings.indexOf(seleccionado);
            datosNuevaCarga["idCargamento"] = cargamentosIds[index];
        }
    };
    const seleccionarProveedor = (event: any, seleccionado: string | null) => {
        if (seleccionado) {
            const index = proveedoresStrings.indexOf(seleccionado);
            datosNuevaCarga["idProveedor"] = proveedoresIds[index];
        }
    };
    const mapearListaAOtra = (
        listaOrigen: any[],
        listaDestino: any[],
        elemento: any
    ) => {
        console.log(elemento);
        const index = listaOrigen.indexOf(elemento);
        return index !== -1 ? listaDestino[index] : undefined;
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
                options={proveedoresStrings}
                value={
                    mapearListaAOtra(
                        proveedoresIds,
                        proveedoresStrings,
                        datosNuevaCarga["idProveedor"]
                    ) ?? null
                }
                clearOnEscape={false}
                onInputChange={seleccionarProveedor} // Maneja el cambio de cargamento
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
                    <Stack direction="row" spacing={2}>
                        <TextField
                            label="Kilometros"
                            value={datosNuevaCarga["cantidadKm"]}
                            onChange={seleccionarKilometros}
                            name="numberformat"
                            id="formatted-numberformat-input"
                            slotProps={{
                                input: {
                                    inputComponent: KmFormat as any,
                                },
                            }}
                            variant="outlined"
                        />
                    </Stack>
                </Box>
                <Box display="column" gap={2}>
                    <Autocomplete
                        disablePortal
                        options={cargamentosStrings}
                        onChange={seleccionarCargamento} // Maneja el cambio de cargamento
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
