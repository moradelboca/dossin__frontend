/* eslint-disable @typescript-eslint/no-explicit-any */

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
const tema = createTheme({
  palette: {
    primary: {
      main: "#163660",
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
  const { idCarga, handleCloseDialog, refreshCupos } = props;
  const { backendURL } = useContext(ContextoGeneral);
  const [selectedDates, setSelectedDates] = useState<Dayjs[]>([]);
  const [cupoSeleccionado, setCupoSeleccionado] = useState<number | null>(null);
  const [error, setError] = useState(false);
  const [errorFecha, setErrorFecha] = useState(false);
  const { theme } = useContext(ContextoGeneral);
  const [mensajeError, setMensajeError] = useState<string | null>(null);

  const handleClickGuardar = () => {
    setError(false);
    setErrorFecha(false);
    setMensajeError(null);
    if (cupoSeleccionado == 0 || cupoSeleccionado == null) {
      setError(true);
      return;
    }

    if (selectedDates.length == 0) {
      setErrorFecha(true);
      return;
    }

    for (const fecha of selectedDates) {
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
            return response.text().then((text) => {
              throw new Error(text || "Error al crear la carga");
            });
          }
          return response.json();
        })
        .then(() => {
          handleCloseDialog();
          refreshCupos();
        })
        .catch((error) => {
          setMensajeError(
            `Error al crear el cupo: ${error.message || "Error desconocido"}`
          );
        });
    }
  };

  const handleDateChange = (date: Dayjs | null) => {
    if (date && (date.isSame(dayjs(), "day") || date.isAfter(dayjs(), "day"))) {
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
        width="100%"
        maxWidth="400px"
        mx="auto"
        py={1}
        alignItems={"center"}
      >
        <ThemeProvider theme={tema}>
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
              sx={{
                '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: theme.colores.azul,
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: theme.colores.azul,
                },
              }}
            />
            {errorFecha && (
              <Typography color="#ff3333">
                Debes seleccionar al menos una fecha
              </Typography>
            )}
            <Button
              onClick={handleClickGuardar}
              sx={{ color: theme.colores.azul }}
            >
              Guardar
            </Button>
            {mensajeError && (
              <Typography color="#ff3333" mt={1}>
                {mensajeError}
              </Typography>
            )}
          </Box>
        </Stack>
      </Box>
    </>
  );
}
