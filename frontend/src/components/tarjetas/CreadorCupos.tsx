// @ts-ignore
import { DateCalendar, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { PickersDay } from "@mui/x-date-pickers/PickersDay";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import dayjs, { Dayjs } from "dayjs";
import { Box, Typography } from "@mui/material";
import FormControlLabel from "@mui/material/FormControlLabel";
import { NumericFormat, NumericFormatProps } from "react-number-format";
import React from "react";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import { useState, useEffect, useContext } from "react";
import { ContextoGeneral } from "../Contexto";

// Tema personalizado
const theme = createTheme({
    palette: {
        primary: {
            main: "#163660", // Color azul personalizado
        },
    },
});

const CustomDay = (props: any) => {
    const { day, selected, onClick } = props;

    return (
        <PickersDay
            {...props}
            selected={selected}
            onClick={onClick}
            className={selected ? "Mui-selected" : ""}
        />
    );
};

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
                prefix=""
            />
        );
    }
);

export function CreadorCupos(selectorProps: props) {
    let { datosNuevaCarga } = selectorProps;
    const { backendURL } = useContext(ContextoGeneral);
    const [selectedDates, setSelectedDates] = useState<Dayjs[]>([]);
    const [open, setOpen] = useState(true); // Estado para controlar la apertura

    // Inicializa datosNuevaCarga si es undefined
    if (!datosNuevaCarga) {
        datosNuevaCarga = {}; // Inicializa como un objeto vacío si es necesario
    }

    const handleDateChange = (date: Dayjs | null) => {
        if (
            date &&
            (date.isSame(dayjs(), "day") || date.isAfter(dayjs(), "day"))
        ) {
            setSelectedDates((prev) => {
                const isSelected = prev.some((selectedDate) =>
                    selectedDate.isSame(date, "day")
                );

                // Agregar o quitar la fecha seleccionada
                if (isSelected) {
                    return prev.filter(
                        (selectedDate) => !selectedDate.isSame(date, "day")
                    );
                } else {
                    return [...prev, date];
                }
            });
            // Mantener el DatePicker abierto después de la selección
            setOpen(true);
        }
    };

    const [error, setError] = useState<string | null>(null);

    const [values, setValues] = React.useState({
        numberformat: "",
    });

    const seleccionarCupos = (event: React.ChangeEvent<HTMLInputElement>) => {
        const cupos = Number(event.target.value);
        if (cupos > 1000) {
            setError("No se pueden más de 1000 cupos al día!");
            datosNuevaCarga["cupos"] = null; // Asigna null si el valor es inválido
        } else {
            setError(null); // Limpia el error si es un valor válido
            datosNuevaCarga["cupos"] = cupos; // Asigna el valor válido
        }

        setValues({
            ...values,
            [event.target.name]: event.target.value,
        });
    };

    return (
        <>
            <Box
                display="flex"
                flexDirection="column"
                width="350px"
                padding={2}
                alignItems={"center"}
            >
                <ThemeProvider theme={theme}>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DateCalendar
                            value={null}
                            onChange={handleDateChange}
                            slots={{
                                day: (dayProps) => (
                                    <CustomDay
                                        {...dayProps}
                                        selected={selectedDates.some((date) =>
                                            date.isSame(dayProps.day, "day")
                                        )}
                                    />
                                ),
                            }}
                        />
                    </LocalizationProvider>
                </ThemeProvider>
                <Stack direction="row" spacing={2}>
                    <Box width="300px">
                        <TextField
                            label="Cupos"
                            value={values.numberformat}
                            onChange={seleccionarCupos}
                            name="numberformat"
                            id="formatted-numberformat-input"
                            slotProps={{
                                input: {
                                    inputComponent: NumericFormatCustom as any,
                                },
                            }}
                            variant="outlined"
                        />
                        {error && (
                            <Typography
                                color="#ff3333"
                                style={{ marginTop: "8px" }}
                            >
                                {error}
                            </Typography>
                        )}
                    </Box>
                </Stack>
            </Box>
            <div>
                <h4>Fechas seleccionadas:</h4>
                <ul>
                    {selectedDates.map((date) => (
                        <li key={date.toString()}>
                            {date.format("YYYY-MM-DD")}
                        </li>
                    ))}
                </ul>
            </div>
        </>
    );
}
