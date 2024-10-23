import React, { useState } from "react";
import { TextField, Button, Box, Typography } from "@mui/material";
import Papa from "papaparse";
import { BotonIcon } from "../botones/IconButton";
import CalculateOutlinedIcon from "@mui/icons-material/CalculateOutlined";
import {
    NumericFormat,
    NumericFormatProps,
    PatternFormat,
} from "react-number-format";
import { ContextoGeneral } from "../Contexto";

interface CustomProps {
    onChange: (event: { target: { name: string; value: string } }) => void;
    name: string;
}

const KmFormat = React.forwardRef<NumericFormatProps, CustomProps>(
    function KmFormat(props, ref) {
        const { onChange, ...other } = props;

        const isAllowed = (values: any) => {
            const { formattedValue } = values;
            const numericValue = formattedValue.replace(/[.,]/g, "");
            return numericValue.length <= 4;
        };

        return (
            <NumericFormat
                {...other}
                getInputRef={ref}
                thousandSeparator="."
                decimalSeparator=","
                prefix=""
                decimalScale={0}
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

const TnFormat = React.forwardRef<NumericFormatProps, CustomProps>(
    function TnFormat(props, ref) {
        const { onChange, ...other } = props;

        const isAllowed = (values: any) => {
            const { formattedValue } = values;
            const numericValue = formattedValue.replace(/[.,]/g, "");
            return numericValue.length <= 2;
        };

        return (
            <NumericFormat
                {...other}
                getInputRef={ref}
                thousandSeparator="."
                decimalSeparator=","
                prefix=""
                decimalScale={0}
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

const PorcentajeFormat = React.forwardRef<any, CustomProps>(
    function PorcentajeFormat(props, ref) {
        const { onChange, ...other } = props;

        return (
            <PatternFormat
                {...other}
                getInputRef={ref}
                format="##%"
                mask=""
                onValueChange={(values) => {
                    if (Number(values.value.replace("%", "")) < 0) {
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

const TarifaApp = () => {
    const { theme } = React.useContext(ContextoGeneral);
    const [km, setKm] = useState<number | null>(null);
    const [tn, setTn] = useState<number | null>(null);
    const [descuento, setDescuento] = useState<number>(0);
    const [tarifaSinDescuento, setTarifaSinDescuento] = useState<number | null>(
        null
    );
    const [tarifaConDescuento, setTarifaConDescuento] = useState<number | null>(
        null
    );
    const [tarifaPorKm, setTarifaPorKm] = useState<number | null>(null);
    const [tarifaPorKmConDescuento, setTarifaPorKmConDescuento] = useState<
        number | null
    >(null);
    const [tarifaPorTonelada, setTarifaPorTonelada] = useState<number | null>(
        null
    );
    const [tarifaPorToneladaConDescuento, setTarifaPorToneladaConDescuento] =
        useState<number | null>(null);

    const handleCalcular = async () => {
        const response = await fetch("/tarifas.csv");
        const csvData = await response.text();
        const data = Papa.parse(csvData, { header: false }).data as string[][];

        const tarifaFila = data.find(
            (fila: string[]) => parseInt(fila[0]) === km
        );
        if (!tarifaFila) {
            console.log("No se encontró la tarifa para los km ingresados.");
            return;
        }

        const tarifaPorToneladaValue = parseFloat(tarifaFila[1]);
        setTarifaPorTonelada(tarifaPorToneladaValue);

        if (tn !== null) {
            const tarifaBruta = tarifaPorToneladaValue * tn;
            const tarifaConDescuentoCalc =
                tarifaBruta - (tarifaBruta * descuento) / 100;
            const tarifaPorToneladaConDescuentoValue =
                tarifaPorToneladaValue -
                (tarifaPorToneladaValue * descuento) / 100;

            setTarifaSinDescuento(tarifaBruta);
            setTarifaConDescuento(tarifaConDescuentoCalc);
            setTarifaPorToneladaConDescuento(
                tarifaPorToneladaConDescuentoValue
            );

            if (km !== null) {
                setTarifaPorKm(tarifaBruta / km);
                setTarifaPorKmConDescuento(tarifaConDescuentoCalc / km);
            }
        }
    };

    return (
        <Box
            sx={{
                backgroundColor: theme.colores.grisClaro,
                height: "91vh",
                width: "96vw",
                padding: 3,
            }}
        >
            <Typography
                variant="h5"
                component="div"
                sx={{
                    color: theme.colores.azul,
                    fontWeight: "bold",
                    mb: 2,
                    fontSize: "2rem",
                    pb: 1,
                    marginLeft: 1,
                }}
            >
                Calculadora
            </Typography>
            <Box
                display="flex"
                flexDirection="column"
                gap={2}
                width={"500px"}
                padding={3}
                justifyContent={"center"}
                alignItems={"center"}
            >
                <TextField
                    label="KM"
                    value={km ?? ""}
                    onChange={(e) => setKm(parseInt(e.target.value))}
                    id="formatted-numberformat-input"
                    slotProps={{
                        input: {
                            inputComponent: KmFormat as any,
                        },
                    }}
                    sx={{ width: "100%" }}
                />
                <TextField
                    label="TN"
                    value={tn ?? ""}
                    onChange={(e) => setTn(parseInt(e.target.value))}
                    id="formatted-numberformat-input"
                    slotProps={{
                        input: {
                            inputComponent: TnFormat as any,
                        },
                    }}
                    sx={{ width: "100%" }}
                />
                <TextField
                    label="Porcentaje de Descuento"
                    value={descuento}
                    onChange={(e) => setDescuento(parseFloat(e.target.value))}
                    id="formatted-numberformat-input"
                    slotProps={{
                        input: {
                            inputComponent: PorcentajeFormat as any,
                        },
                    }}
                    sx={{ width: "100%" }}
                />
                <BotonIcon
                    onClick={handleCalcular}
                    title="Calcular tarifa"
                    icon={<CalculateOutlinedIcon />}
                />
                {tarifaPorTonelada !== null && (
                    <Typography>
                        Tarifa: {tarifaPorTonelada.toFixed(2)} $/tn
                    </Typography>
                )}
                {tarifaSinDescuento !== null && (
                    <Typography>
                        Tarifa total: {tarifaSinDescuento.toFixed(2)} $
                    </Typography>
                )}
                {tarifaPorToneladaConDescuento !== null && (
                    <Typography>
                        Tarifa con descuento:
                        {tarifaPorToneladaConDescuento.toFixed(2)} $/tn
                    </Typography>
                )}
                {tarifaConDescuento !== null && (
                    <Typography>
                        Tarifa total con descuento:{" "}
                        {tarifaConDescuento.toFixed(2)} $
                    </Typography>
                )}
                {tarifaPorKm !== null && (
                    <Typography>
                        Tarifa por KM: {tarifaPorKm.toFixed(2)} $/km
                    </Typography>
                )}
                {tarifaPorKmConDescuento !== null && (
                    <Typography>
                        Tarifa por KM con Descuento:
                        {tarifaPorKmConDescuento.toFixed(2)} $/km
                    </Typography>
                )}
            </Box>
        </Box>
    );
};

export default TarifaApp;
