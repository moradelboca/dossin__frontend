import dayjs from "dayjs";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { MobileTimePicker } from "@mui/x-date-pickers/MobileTimePicker";
import { useState } from "react";
import { Box } from "@mui/material";

interface props {
    filtro: any;
    datosNuevaCarga: any;
}

export default function Reloj(props: props) {
    let { filtro, datosNuevaCarga } = props;
    const [horarioSeleccionado, setHorarioSeleccionado] =
        useState<dayjs.Dayjs | null>(null);

    const manejarTiempo = (newValue: any) => {
        setHorarioSeleccionado(newValue);
        if (newValue != null) {
            datosNuevaCarga[filtro] = newValue.format("HH:mm");
        }
    };

    return (
        <Box width="140px">
            <LocalizationProvider dateAdapter={AdapterDayjs}>
                <MobileTimePicker
                    value={horarioSeleccionado} // Usa `value` en lugar de `defaultValue`
                    onChange={manejarTiempo} // Actualiza el estado con el valor seleccionado
                    ampm={false} // Muestra el formato de 24 horas
                />
            </LocalizationProvider>
        </Box>
    );
}
