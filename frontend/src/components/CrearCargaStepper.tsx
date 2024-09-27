import Box from "@mui/material/Box";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import StepContent from "@mui/material/StepContent";
import Button from "@mui/material/Button";
import SelectorDeAcoplados from "./SelectorDeAcoplados";
import SelectorDeUbicacion from "./SelectorDeUbicacion";
import { useState } from "react";
import SelectorTarifa from "./SelectorTarifa";
import SelectorMasInfo from "./SelectorMasInfo";

export default function CrearCargaStepper() {
    const [pasoActivo, setPasoActivo] = useState(0);

    const pasos = [
        {
            titulo: "Seleccionar acoplados permitidos",
            componente: <SelectorDeAcoplados />,
        },
        {
            titulo: "Seleccionar ubicacion y horarios",
            componente: <SelectorDeUbicacion />,
        },
        {
            titulo: "Seleccionar tarifa",
            componente: <SelectorTarifa />,
        },
        {
            titulo: "Mas informacion",
            componente: <SelectorMasInfo />,
        },
    ];

    const handleProximoPaso = () => {
        setPasoActivo((prevActiveStep) => prevActiveStep + 1);
    };

    const handleAnteriorPaso = () => {
        setPasoActivo((prevActiveStep) => prevActiveStep - 1);
    };

    return (
        <Stepper activeStep={pasoActivo} orientation="vertical">
            {pasos.map((paso, indice) => (
                <Step key={paso.titulo}>
                    <StepLabel>{paso.titulo}</StepLabel>
                    <StepContent>
                        <Box sx={{ mb: 2 }}>
                            {paso.componente}
                            <Button
                                variant="contained"
                                onClick={handleProximoPaso}
                                sx={{ mt: 1, mr: 1 }}
                            >
                                {indice === pasos.length - 1
                                    ? "Terminar"
                                    : "Continuar"}
                            </Button>
                            <Button
                                disabled={indice === 0}
                                onClick={handleAnteriorPaso}
                                sx={{ mt: 1, mr: 1 }}
                            >
                                Anterior
                            </Button>
                        </Box>
                    </StepContent>
                </Step>
            ))}
        </Stepper>
    );
}
