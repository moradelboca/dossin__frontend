import { Box } from "@mui/material";
import TextField from "@mui/material/TextField";
import { useState, useEffect, useContext } from "react";
import { ContextoGeneral } from "../../Contexto";
import Autocomplete from "@mui/material/Autocomplete";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import { NumericFormat, NumericFormatProps } from "react-number-format";
import React from "react";
import Stack from "@mui/material/Stack";
import { ContextoStepper } from "../creadores/CrearCargaStepper";

interface CustomProps {
    onChange: (event: { target: { name: string; value: string } }) => void;
    name: string;
}
const NumericFormatCustom = React.forwardRef<NumericFormatProps, CustomProps>(
    function NumericFormatCustom(props, ref) {
        const { onChange, ...other } = props;

        const isAllowed = (values: any) => {
            const { formattedValue } = values;
            // Remove the prefix and separators to count only the digits
            const numericValue = formattedValue.replace(/[$.,]/g, "");
            return numericValue.length <= 12;
        };

        return (
            <NumericFormat
                {...other}
                getInputRef={ref}
                thousandSeparator="."
                decimalSeparator=","
                prefix="$"
                decimalScale={2}
                fixedDecimalScale={true}
                allowNegative={false}
                isAllowed={isAllowed}
                onValueChange={(values) => {
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

export default function SelectorTarifa() {
    const { datosNuevaCarga, setDatosNuevaCarga, datosSinCompletar } = useContext(ContextoStepper);
    const { backendURL } = useContext(ContextoGeneral);
    const [tarifas, setTarifas] = useState<any[]>([]);
    const [tarifaSeleccionada, setTarifaSeleccionada] = useState<any>(
        datosNuevaCarga["nombreTipoTarifa"] || null
    );
    const [estadoCarga, setEstadoCarga] = useState(true);

    useEffect(() => {
        fetch(`${backendURL}/cargas/tipostarifas`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "ngrok-skip-browser-warning": "true",
            },
        })
            .then((response) => response.json())
            .then((tarifas) => {
                setTarifas(tarifas);
                setEstadoCarga(false);
            })
            .catch(() =>
                console.error("Error al obtener las Tarifas disponibles")
            );
    }, []);

    const seleccionarTiposTarifas = (_event: any, seleccionado: string | null) => {
                if (!seleccionado) return;
                const tarifaObj = tarifas.find((t) => t.nombre === seleccionado);
                if (!tarifaObj) return;
                setDatosNuevaCarga(prev => ({
                    ...prev,
                    idTipoTarifa: tarifaObj.id,
                    nombreTipoTarifa: tarifaObj.nombre
                }));
                setTarifaSeleccionada(seleccionado);
            };

            const seleccionarTarifa = (event: React.ChangeEvent<HTMLInputElement>) => {
                const value = Number(event.target.value);
                setDatosNuevaCarga(prev => ({ ...prev, tarifa: value }));
            };

    return (
        <Box display="flex" flexDirection="column">
            <Box
                display="flex"
                flexDirection="row"
                gap={2}
                alignContent={"center"}
                alignItems={"center"}
                width={"800px"}
            >
                <Box display="column" gap={2}>
                    <Box display="column" gap={2}>
                        <Stack direction="row" spacing={2}>
                            <TextField
                                label="Tarifa"
                                error={
                                    datosSinCompletar &&
                                    !datosNuevaCarga["tarifa"]
                                }
                                value={datosNuevaCarga["tarifa"]}
                                onChange={seleccionarTarifa}
                                name="numberformat"
                                id="formatted-numberformat-input"
                                slotProps={{
                                    input: {
                                        inputComponent:
                                            NumericFormatCustom as any,
                                    },
                                }}
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
                        </Stack>
                    </Box>
                </Box>
                <>/</>
                <Box display="column" gap={2}>
                    <Autocomplete
                        disablePortal
                        options={tarifas.map((tarifa) => tarifa.nombre)}
                        value={tarifaSeleccionada}
                        defaultValue={tarifaSeleccionada}
                        onChange={seleccionarTiposTarifas}
                        sx={{
                            width: 300,
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
                                error={
                                    !tarifaSeleccionada
                                        ? datosSinCompletar
                                        : false
                                }
                                label={"Unidades"}
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
            <FormControlLabel
                control={
                    <Checkbox
                        value={datosNuevaCarga["incluyeIVA"]}
                        onChange={(e) => {
                            datosNuevaCarga["incluyeIVA"] = e.target.checked;
                        }}
                        sx={{
                            color: "#163660",
                            "&.Mui-checked": {
                                color: "#163660",
                            },
                        }}
                    />
                }
                label="Incluye IVA"
            />
        </Box>
    );
}
