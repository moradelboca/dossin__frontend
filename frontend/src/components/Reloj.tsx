import React, { useState } from "react";
import { Box } from "@mui/material";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { StaticTimePicker } from "@mui/x-date-pickers/StaticTimePicker";
import dayjs from "dayjs";
import { styled } from "@mui/material/styles";

// Personaliza el contenedor del reloj
const CustomTimePicker = styled(StaticTimePicker)(({ theme }) => ({
    "& .MuiClockPointer-thumb": {
        backgroundColor: "#163660", // Cambia el color del círculo en el número seleccionado
        borderColor: "#163660", // Cambia el color del borde del círculo
    },
    "& .MuiClockPointer-root": {
        backgroundColor: "#163660", // Cambia el color de la línea que conecta el círculo con el centro
    },
    "& .MuiClockPointer-pin": {
        backgroundColor: "#163660", // Cambia el color del circulito en el centro del reloj
    },
    "& .MuiClock-pin": {
        backgroundColor: "#163660", // Cambia el color del pequeño círculo central
    },
    "& .MuiButton-root": {
        color: "#163660", // Cambia el color de los botones "OK" y "Cancel"
    },
    "& .MuiPickersToolbar-button": {
        color: "#163660", // Cambia el color de los botones de selección en la parte superior
    },
}));

export default function Reloj() {
    // Estado para guardar el tiempo seleccionado
    const [horarioSeleccionado, sethorarioSeleccionado] = useState(dayjs());

    // Función que se llama cuando el tiempo cambia
    const manejarTiempo = (newValue: any) => {
        sethorarioSeleccionado(newValue);
    };

    return (
        <Box width={"80px"}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
                <CustomTimePicker
                    defaultValue={horarioSeleccionado}
                    onChange={manejarTiempo} // Actualiza el estado con el valor seleccionado
                />
            </LocalizationProvider>
            <Box mt={2}>
                <p>Hora seleccionada: {horarioSeleccionado.format("HH:mm")}</p>
            </Box>
        </Box>
    );
}
