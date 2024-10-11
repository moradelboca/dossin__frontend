import { Box } from "@mui/material";
import TextField from "@mui/material/TextField";
import { useState, useEffect, useContext } from "react";
import { ContextoGeneral } from "../Contexto";
import Autocomplete from "@mui/material/Autocomplete";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import { NumericFormat, NumericFormatProps } from "react-number-format";
import React from "react";
import Stack from "@mui/material/Stack";

interface props {
    datosNuevaCarga: any;
}
interface CustomProps {
    onChange: (event: { target: { name: string; value: string } }) => void;
    name: string;
}
const NumericFormatCustom = React.forwardRef<NumericFormatProps, CustomProps>(
    function NumericFormatCustom(props, ref) {
        const { onChange, ...other } = props;

        return (
            <NumericFormat
                {...other}
                getInputRef={ref}
                onValueChange={(values) => {
                    // Verificar si el valor es negativo
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
                thousandSeparator
                valueIsNumericString
                prefix="$"
            />
        );
    }
);

export default function SelectorTarifa(selectorProps: props) {
    let { datosNuevaCarga } = selectorProps;
    const { backendURL } = useContext(ContextoGeneral);
    const [tarifas, setTarifas] = useState<any[]>([]);
    let unidadesStrings: string[];

    useEffect(() => {
        fetch(`${backendURL}/tipotarifas`)
            .then((response) => response.json())
            .then((tarifas) => setTarifas(tarifas))
            .catch(() =>
                console.error("Error al obtener las Tarifas disponibles")
            );
    }, [backendURL]);

    unidadesStrings = tarifas.map((tarifa) => {
        return `${tarifa.nombre}`;
    });

    let unidadesIds = tarifas.map((tarifa) => {
        return tarifa.id;
    });

    const seleccionarId = (e: any, value: string | null) => {
        const index = unidadesStrings.indexOf(value || "");
        if (index !== -1) {
            datosNuevaCarga["idTipoTarifa"] = unidadesIds[index];
        }
    };
    const seleccionarTarifa = (event: React.ChangeEvent<HTMLInputElement>) => {
        const tarifa = Number(event.target.value);

        // Si la tarifa es menor o igual a 10 millones, se guarda.
        if (tarifa <= 10000000) {
            datosNuevaCarga["tarifa"] = tarifa;
            setValues({
                ...values,
                [event.target.name]: event.target.value,
            });
        } else {
            // Si la tarifa es mayor a 10 millones, no se guarda nada y se limpia el campo.
            datosNuevaCarga["tarifa"] = null;
        }
    };

    const [values, setValues] = React.useState({
        numberformat: "",
    });

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
                                value={values.numberformat}
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
                            />
                        </Stack>
                    </Box>
                </Box>
                <>X</>
                <Box display="column" gap={2}>
                    <Autocomplete
                        disablePortal
                        options={unidadesStrings}
                        sx={{ width: 300 }}
                        onChange={(e, value) => seleccionarId(e, value)} // Actualizar el ID de la unidad seleccionada
                        renderInput={(params) => (
                            <TextField {...params} label={"Unidades"} />
                        )}
                    />
                </Box>
            </Box>
            <FormControlLabel
                control={
                    <Checkbox
                        onChange={(e) => {
                            datosNuevaCarga["incluyeIVA"] = e.target.checked; // Asigna true o false dependiendo del estado del Checkbox
                        }}
                        sx={{
                            color: "#163660", // Color por defecto
                            "&.Mui-checked": {
                                color: "#163660", // Color cuando está seleccionado
                            },
                        }}
                    />
                }
                label="Incluye IVA?"
            />
        </Box>
    );
}
