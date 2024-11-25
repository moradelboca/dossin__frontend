// @ts-ignore
import { DateCalendar, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { PickersDay } from "@mui/x-date-pickers/PickersDay";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import dayjs, { Dayjs } from "dayjs";
import { Box, Button, Typography } from "@mui/material";
import { NumericFormatProps, PatternFormat } from "react-number-format";
import React from "react";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import { useState, useContext } from "react";
import { ContextoGeneral } from "../../Contexto";

// Tema personalizado
const theme = createTheme({
    palette: {
        primary: {
            main: "#163660", // Color azul personalizado
        },
    },
});

const CustomDay = (props: any) => {
    const { selected, onClick } = props;

    return (
        <PickersDay
            {...props}
            selected={selected}
            onClick={onClick}
            className={selected ? "Mui-selected" : ""}
        />
    );
};

interface CustomProps {
    onChange: (event: { target: { name: string; value: string } }) => void;
    name: string;
}
const cuposFromat = React.forwardRef<NumericFormatProps, CustomProps>(
    function cuposFromat(props, ref) {
        const { onChange, ...other } = props;

        return (
            <PatternFormat
                {...other}
                getInputRef={ref}
                format="###"
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

export function CreadorCupos(props: any) {
    let { idCarga, handleCloseDialog, refreshCupos } = props;
    const { backendURL } = useContext(ContextoGeneral);
    const [selectedDates, setSelectedDates] = useState<Dayjs[]>([]);
    const [cupoSeleccionado, setCupoSeleccionado] = useState<number | null>(
        null
    );
    const [error, setError] = useState(false);
    const [errorFecha, setErrorFecha] = useState(false);

    const handleClickGuardar = () => {
        setError(false);
        setErrorFecha(false);
        if (cupoSeleccionado == 0 || cupoSeleccionado == null) {
            setError(true);
            return;
        }

        if (selectedDates.length == 0) {
            setErrorFecha(true);
            return;
        }

        for (let fecha of selectedDates) {
            const cupoDeCarga = {
                fecha: fecha.format("YYYY-MM-DD"),
                cupos: cupoSeleccionado,
            };
            fetch(`${backendURL}/cargas/${idCarga}/cupos`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(cupoDeCarga),
            })
                .then((response) => {
                    if (!response.ok) {
                        throw new Error("Error al crear la carga");
                    }
                    response.json();
                })
                .then(() => {
                    handleCloseDialog();
                    refreshCupos();
                })
                .catch(() => {});
        }
    };

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
        }
    };

    const [values, setValues] = React.useState({
        numberformat: "",
    });

    const seleccionarCupos = (event: React.ChangeEvent<HTMLInputElement>) => {
        const cupos = Number(event.target.value);
        setCupoSeleccionado(cupos);
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
                            fullWidth
                            error={error}
                            label="Cupos"
                            value={values.numberformat}
                            onChange={seleccionarCupos}
                            name="numberformat"
                            id="formatted-numberformat-input"
                            slotProps={{
                                input: {
                                    inputComponent: cuposFromat as any,
                                },
                            }}
                            variant="outlined"
                        />
                        {errorFecha && (
                            <Typography color="#ff3333">
                                Debes seleccionar al menos una fecha
                            </Typography>
                        )}
                        <Button onClick={handleClickGuardar}>Guardar</Button>
                    </Box>
                </Stack>
            </Box>
        </>
    );
}
