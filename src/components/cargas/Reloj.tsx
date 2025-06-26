import dayjs from "dayjs";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { MobileTimePicker } from "@mui/x-date-pickers/MobileTimePicker";
import { useContext, useState, useEffect } from "react";
import { Box } from "@mui/material";
import { ContextoStepper } from "./creadores/CrearCargaStepper";

interface props {
    filtro: any;
}

export default function Reloj(props: props) {
    const { datosNuevaCarga, datosSinCompletar } = useContext(ContextoStepper);
    const { filtro } = props;
    const [horarioSeleccionado, setHorarioSeleccionado] =
        useState<dayjs.Dayjs | null>(
            (datosNuevaCarga as any)[filtro]
                ? dayjs((datosNuevaCarga as any)[filtro], "HH:mm")
                : null
        );

    // Sincroniza el valor del picker con datosNuevaCarga cuando cambia
    useEffect(() => {
        if ((datosNuevaCarga as any)[filtro]) {
            setHorarioSeleccionado(dayjs((datosNuevaCarga as any)[filtro], "HH:mm"));
        } else {
            setHorarioSeleccionado(null);
        }
    }, [(datosNuevaCarga as any)[filtro], filtro]);

    const manejarTiempo = (seleccionado: any) => {
        if (seleccionado != null) {
            (datosNuevaCarga as any)[filtro] = seleccionado.format("HH:mm") + ":00";
            setHorarioSeleccionado(seleccionado);
        }
    };

    // Theme solo para el reloj (solo MuiClockPointer y MuiClockNumber, que sí son soportados)
    
    return (
        <Box sx={{ width: { xs: '100%', sm: 110, md: 140 } }}>
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
