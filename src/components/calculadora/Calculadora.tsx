/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { TextField, Box, Typography } from "@mui/material";
import Papa from "papaparse";
import { BotonIcon } from "../botones/IconButton";
import CalculateOutlinedIcon from "@mui/icons-material/CalculateOutlined";
import {
    NumericFormat,
    NumericFormatProps,
    PatternFormat,
} from "react-number-format";
import { ContextoGeneral } from "../Contexto";
import { DataGrid, GridColDef } from "@mui/x-data-grid";

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
const NumericFormatCustom = React.forwardRef<NumericFormatProps, CustomProps>(
    function NumericFormatCustom(props, ref) {
        const { onChange, ...other } = props;

        const isAllowed = (values: any) => {
            const { formattedValue } = values;
            // Remove the prefix and separators to count only the digits
            const numericValue = formattedValue.replace(/[$.,]/g, "");
            return numericValue.length <= 9;
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
const ContraFleteFormat = React.forwardRef<NumericFormatProps, CustomProps>(
    function ContraFleteFormat(props, ref) {
        const { onChange, ...other } = props;

        const isAllowed = (values: any) => {
            const { formattedValue } = values;
            // Remove the prefix and separators to count only the digits
            const numericValue = formattedValue.replace(/[$.,]/g, "");
            return numericValue.length <= 7;
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
    const [precio, setPrecio] = useState<number | null>(null);
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
    const [incideciasConDescContra, setIncideciasConDescContra] = useState<
        number | null
    >(null);
    const [incidenciaConDescuento, setIncidenciaConDescuento] = useState<
        number | null
    >(null);
    const [contraFlete, setContraFlete] = useState<number | null>(null);
    const [
        tarifaPorToneladaConDescuentoContra,
        setTarifaPorToneladaConDescuentoContra,
    ] = useState<number | null>(null);

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

            // Seteamos las tarifas base
            setTarifaSinDescuento(tarifaBruta);
            setTarifaConDescuento(tarifaConDescuentoCalc);
            setTarifaPorToneladaConDescuento(
                tarifaPorToneladaConDescuentoValue
            );

            // Calculamos tarifa por tonelada con contra-flete
            const tarifaToneladaConDescContra =
                (tarifaPorToneladaValue -
                    (tarifaPorToneladaValue * descuento) / 100 +
                    (contraFlete || 0)) *
                tn;
            setTarifaPorToneladaConDescuentoContra(tarifaToneladaConDescContra);
            // Si hay km, calculamos tarifas por kilómetro
            if (km !== null) {
                setTarifaPorKm(tarifaBruta / km);
                setTarifaPorKmConDescuento(tarifaConDescuentoCalc / km);
            }

            // Si hay precio, calculamos incidencias
            if (precio) {
                const incidenciaConDesc =
                    (tarifaConDescuentoCalc / (precio * tn)) * 100;
                const incidenciaDescContra =
                    (tarifaToneladaConDescContra / (precio * tn)) * 100;

                setIncidenciaConDescuento(incidenciaConDesc);
                setIncideciasConDescContra(incidenciaDescContra);
            }
        }
    };
    const columns: GridColDef[] = [
        {
            field: "concepto",
            headerName: "Concepto",
            flex: 2,
            renderHeader: () => (
                <strong style={{ color: theme.colores.grisOscuro }}>
                    Concepto
                </strong>
            ),
        },
        {
            field: "valor",
            headerName: "Valor",
            flex: 1,
            renderHeader: () => (
                <strong style={{ color: theme.colores.grisOscuro }}>
                    Valor
                </strong>
            ),
        },
    ];

    const rows = [
        {
            id: 1,
            concepto: "Tarifa ($/tn)",
            valor: tarifaPorTonelada?.toFixed(2) || "-",
        },
        {
            id: 2,
            concepto: "Tarifa total ($)",
            valor: tarifaSinDescuento?.toFixed(2) || "-",
        },
        {
            id: 3,
            concepto: "Tarifa con descuento ($/tn)",
            valor: tarifaPorToneladaConDescuento?.toFixed(2) || "-",
        },
        {
            id: 4,
            concepto: "Tarifa total con descuento ($)",
            valor: tarifaConDescuento?.toFixed(2) || "-",
        },
        {
            id: 5,
            concepto: "Tarifa total con descuento y Contraflete ($)",
            valor: tarifaPorToneladaConDescuentoContra?.toFixed(2) || "-",
        },
        {
            id: 6,
            concepto: "Tarifa por KM ($/km)",
            valor: tarifaPorKm?.toFixed(2) || "-",
        },
        {
            id: 7,
            concepto: "Tarifa por KM con Descuento ($/km)",
            valor: tarifaPorKmConDescuento?.toFixed(2) || "-",
        },
        {
            id: 8,
            concepto: "Incidencia del flete con descuento (%)",
            valor: incidenciaConDescuento?.toFixed(2) || "-",
        },
        {
            id: 9,
            concepto: "Incidencia del flete con descuento y contraflete(%)",
            valor: incideciasConDescContra?.toFixed(2) || "-",
        },
    ];

    return (
        <Box
            sx={{
                backgroundColor: theme.colores.grisClaro,
                height: "91vh",
                width: "100%",
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
                flexDirection="row"
                gap={2}
                justifyContent={"flex-start"}
                alignItems={"flex-start"}
                width={"100%"}
            >
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
                        label="Kilometros a recorrer"
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
                        label="Toneladas a transportar"
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
                        label="Precio del grano de referencia"
                        value={precio ?? ""}
                        onChange={(e) => setPrecio(parseInt(e.target.value))}
                        id="formatted-numberformat-input"
                        slotProps={{
                            input: {
                                inputComponent: NumericFormatCustom as any,
                            },
                        }}
                        sx={{ width: "100%" }}
                    />
                    <TextField
                        label="Porcentaje de Descuento"
                        value={descuento}
                        onChange={(e) =>
                            setDescuento(parseFloat(e.target.value))
                        }
                        id="formatted-numberformat-input"
                        slotProps={{
                            input: {
                                inputComponent: PorcentajeFormat as any,
                            },
                        }}
                        sx={{ width: "100%" }}
                    />
                    <TextField
                        label="Contra flete"
                        value={contraFlete ?? ""}
                        onChange={(e) =>
                            setContraFlete(parseInt(e.target.value))
                        }
                        id="formatted-numberformat-input"
                        slotProps={{
                            input: {
                                inputComponent: ContraFleteFormat as any,
                            },
                        }}
                        sx={{ width: "100%" }}
                    />
                    <BotonIcon
                        onClick={handleCalcular}
                        title="Calcular tarifa"
                        icon={<CalculateOutlinedIcon />}
                    />
                </Box>
                <Box
                    sx={{
                        width: "100%",
                        padding: 3,
                        maxWidth: "600px",
                        minWidth: "100px",
                    }}
                >
                    <DataGrid
                        rows={rows}
                        columns={columns}
                        hideFooter
                        sx={{
                            backgroundColor: "#fff",
                            borderRadius: "16px",
                        }}
                    />
                </Box>
            </Box>
        </Box>
    );
};

export default TarifaApp;
