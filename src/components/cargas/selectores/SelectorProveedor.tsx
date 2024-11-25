import { Box } from "@mui/material";
import TextField from "@mui/material/TextField";
import { useState, useEffect, useContext } from "react";
import { ContextoGeneral } from "../../Contexto";
import Autocomplete from "@mui/material/Autocomplete";
import { PatternFormat } from "react-number-format";
import React from "react";
import Stack from "@mui/material/Stack";
import { ContextoStepper } from "../creadores/CrearCargaStepper";

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
                mask="" // Puedes personalizar la máscara que desees
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

export default function SelectorProveedor() {
    const { datosNuevaCarga, datosSinCompletar } = useContext(ContextoStepper);
    const { backendURL } = useContext(ContextoGeneral);
    const [cargamentos, setCargamentos] = useState<any[]>([]);
    const [proveedores, setProveedores] = useState<any[]>([]);
    const [valueProveedores, setValueProveedores] = useState<any>(
        datosNuevaCarga["nombreProveedor"] || null
    );
    const [valueCargamentos, setValueCargamentos] = useState<any>(
        datosNuevaCarga["nombreCargamento"] || null
    );
    const [estadoCarga, setEstadoCarga] = useState(true);

    useEffect(() => {
        fetch(`${backendURL}/cargas/cargamentos`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "ngrok-skip-browser-warning": "true",
            },
        })
            .then((response) => response.json())
            .then((car) => {
                setCargamentos(car);
                setEstadoCarga(false);
            })
            .catch(() =>
                console.error("Error al obtener los Cargamentos disponibles")
            );

        fetch(`${backendURL}/proveedores`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "ngrok-skip-browser-warning": "true",
            },
        })
            .then((response) => response.json())
            .then((p) => {
                setProveedores(p);
                setEstadoCarga(false);
            })
            .catch(() =>
                console.error("Error al obtener los Proveedores disponibles")
            );
    }, []);

    const seleccionarKilometros = (event: any) => {
        datosNuevaCarga["cantidadKm"] = Number(event.target.value);
    };

    const seleccionarCargamento = (
        _event: any,
        seleccionado: string | null
    ) => {
        if (seleccionado) {
            const cargamentosStrings = cargamentos.map(
                (cargamento) => cargamento.nombre
            );
            const index = cargamentosStrings.indexOf(seleccionado);
            const cargamentosIds = cargamentos.map(
                (cargamento) => cargamento.id
            );
            datosNuevaCarga["idCargamento"] = cargamentosIds[index];
            datosNuevaCarga["nombreCargamento"] = seleccionado;
            setValueCargamentos(seleccionado);
        }
    };
    const seleccionarProveedor = (_event: any, seleccionado: string | null) => {
        if (seleccionado) {
            const proveedoresStrings = proveedores.map(
                (proveedor) => proveedor.nombre
            );
            const index = proveedoresStrings.indexOf(seleccionado);
            const proveedoresIds = proveedores.map((proveedor) => proveedor.id);
            datosNuevaCarga["idProveedor"] = proveedoresIds[index];
            datosNuevaCarga["nombreProveedor"] = seleccionado;
            setValueProveedores(seleccionado);
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
                options={proveedores.map((proveedor: any) => proveedor.nombre)}
                value={valueProveedores}
                defaultValue={valueProveedores}
                onChange={seleccionarProveedor}
                sx={{ width: 540 }}
                loading={estadoCarga}
                renderInput={(params) => (
                    <TextField
                        {...params}
                        error={!valueProveedores ? datosSinCompletar : false}
                        label="Proveedor"
                    />
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
                            error={
                                !datosNuevaCarga["cantidadKm"]
                                    ? datosSinCompletar
                                    : false
                            }
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
                        options={cargamentos.map(
                            (cargamento: any) => cargamento.nombre
                        )}
                        value={valueCargamentos}
                        defaultValue={valueCargamentos}
                        onChange={seleccionarCargamento}
                        sx={{ width: 300 }}
                        loading={estadoCarga}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                error={
                                    !valueCargamentos
                                        ? datosSinCompletar
                                        : false
                                }
                                label="Cargamento"
                            />
                        )}
                    />
                </Box>
            </Box>
        </Box>
    );
}
