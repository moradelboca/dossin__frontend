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
                mask=""
                onValueChange={(values) => {
                    if (Number(values.value) < 0) {
                        return;
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

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
                alignContent: 'center',
                alignItems: { xs: 'stretch', md: 'flex-start' },
                width: '100%',
                maxWidth: { xs: '95vw', sm: 600, md: 800 },
                mx: 'auto',
                px: { xs: 1, sm: 2 },
            }}
        >
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', md: 'row' },
                    gap: 2,
                    alignContent: 'center',
                    alignItems: { xs: 'stretch', md: 'center' },
                    width: '100%',
                }}
            >
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: { xs: '100%', md: 'auto' } }}>
                    <Stack direction="row" spacing={2} sx={{ width: '100%' }}>
                        <TextField
                            label="Kilometros"
                            value={datosNuevaCarga["cantidadKm"]}
                            error={!datosNuevaCarga["cantidadKm"] ? datosSinCompletar : false}
                            onChange={seleccionarKilometros}
                            name="numberformat"
                            id="formatted-numberformat-input"
                            slotProps={{
                                input: {
                                    inputComponent: KmFormat as any,
                                },
                            }}
                            variant="outlined"
                            sx={{
                                width: { xs: '100%', sm: 220, md: 300 },
                                '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                    borderColor: '#163660',
                                },
                                '& .MuiInputLabel-root.Mui-focused': {
                                    color: '#163660',
                                },
                            }}
                        />
                    </Stack>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: { xs: '100%', md: 'auto' } }}>
                    <Autocomplete
                        disablePortal
                        options={cargamentos.map((cargamento: any) => cargamento.nombre)}
                        value={valueCargamentos}
                        defaultValue={valueCargamentos}
                        onChange={seleccionarCargamento}
                        sx={{
                            width: { xs: '100%', sm: 220, md: 300 },
                            '& .MuiAutocomplete-option': {
                                fontWeight: 400,
                            },
                            '& .Mui-focused .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#163660',
                            },
                            '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#163660',
                            },
                        }}
                        loading={estadoCarga}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                error={!valueCargamentos ? datosSinCompletar : false}
                                label="Cargamento"
                                variant="outlined"
                                sx={{
                                    '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                        borderColor: '#163660',
                                    },
                                    '& .MuiInputLabel-root.Mui-focused': {
                                        color: '#163660',
                                    },
                                }}
                            />
                        )}
                    />
                </Box>
            </Box>
        </Box>
    );
}
