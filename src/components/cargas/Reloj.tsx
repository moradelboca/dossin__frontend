import dayjs from "dayjs";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { MobileTimePicker } from "@mui/x-date-pickers/MobileTimePicker";
import { useContext, useState } from "react";
import { Box } from "@mui/material";
import { ContextoStepper } from "./creadores/CrearCargaStepper";

interface props {
    filtro: any;
}

export default function Reloj(props: props) {
    const { datosNuevaCarga, datosSinCompletar } = useContext(ContextoStepper);
    let { filtro } = props;
    const [horarioSeleccionado, setHorarioSeleccionado] =
        useState<dayjs.Dayjs | null>(
            datosNuevaCarga[filtro]
                ? dayjs(datosNuevaCarga[filtro], "HH:mm")
                : null
        );
    const manejarTiempo = (seleccionado: any) => {
        if (seleccionado != null) {
            datosNuevaCarga[filtro] = seleccionado.format("HH:mm") + ":00";
            setHorarioSeleccionado(seleccionado);
        }
    };

    return (
        <Box width="140px">
            <LocalizationProvider dateAdapter={AdapterDayjs}>
                <MobileTimePicker
                    value={horarioSeleccionado}
                    defaultValue={horarioSeleccionado}
                    onChange={manejarTiempo}
                    ampm={false}
                    slotProps={{
                        textField: {
                            error: !horarioSeleccionado && datosSinCompletar,
                        },
                    }}
                />
            </LocalizationProvider>
        </Box>
    );
}
