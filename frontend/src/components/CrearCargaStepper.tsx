import Box from "@mui/material/Box";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import StepContent from "@mui/material/StepContent";
import Button from "@mui/material/Button";
import SelectorDeAcoplados from "./SelectorDeAcoplados";
import SelectorDeUbicacion from "./SelectorDeUbicacion";
import { useEffect, useState } from "react";
import SelectorTarifa from "./SelectorTarifa";
import SelectorMasInfo from "./SelectorMasInfo";

export default function CrearCargaStepper() {
    const tiposAcopladosSeleccionados: string[] = [];
    let ubicacionCarga = (id: number) => {
        console.log("ID de ubicación seleccionada Carga:", id);
        // Aquí puedes hacer cualquier otra cosa con el valor del ID de la ubicación, como guardarlo en una variable o realizar una acción.
    };
    let ubicacionDescarga = (id: number) => {
        console.log("ID de ubicación seleccionada Descarga:", id);
        // Aquí puedes hacer cualquier otra cosa con el valor del ID de la ubicación, como guardarlo en una variable o realizar una acción.
    };
    let ubicacionBalanza = (id: number) => {
        console.log("ID de ubicación seleccionada Balanza:", id);
        // Aquí puedes hacer cualquier otra cosa con el valor del ID de la ubicación, como guardarlo en una variable o realizar una acción.
    };
    const [pasoActivo, setPasoActivo] = useState(0);
    const pasos = [
        {
            titulo: "Seleccionar acoplados permitidos",
            componente: (
                <SelectorDeAcoplados
                    tiposAcopladosSeleccionados={tiposAcopladosSeleccionados}
                />
            ),
        },
        {
            titulo: "Seleccionar ubicacion y horarios",
            componente: (
                <SelectorDeUbicacion
                    ubicacionCarga={ubicacionCarga}
                    ubicacionDescarga={ubicacionDescarga}
                    ubicacionBalanza={ubicacionBalanza}
                />
            ),
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
        <Box
            sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
            }}
        >
            <Stepper activeStep={pasoActivo} orientation="vertical">
                {pasos.map((paso, indice) => (
                    <Step key={paso.titulo}>
                        <StepLabel
                            StepIconComponent={({ active, completed }) => (
                                <Box
                                    sx={{
                                        backgroundColor: "#163660",
                                        border: "2px solid #163660", // Borde azul para los pasos que faltan
                                        borderRadius: "50%", // Asegura que el círculo tenga forma redonda
                                        width: "24px", // Tamaño del ícono
                                        height: "24px", // Tamaño del ícono
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        color: "white",
                                        fontSize: "12px", // Tamaño más pequeño para el número
                                    }}
                                >
                                    {completed ? "✓" : indice + 1}{" "}
                                    {/* Muestra el número del paso */}
                                </Box>
                            )}
                        >
                            {paso.titulo}
                        </StepLabel>
                        <StepContent>
                            <Box sx={{ mb: 2 }}>
                                {paso.componente}
                                <Button
                                    variant="contained"
                                    onClick={handleProximoPaso}
                                    sx={{
                                        mt: 1,
                                        mr: 1,
                                        backgroundColor: "#163660", // Color azul personalizado
                                        color: "#fff", // Color del texto
                                        "&:hover": {
                                            backgroundColor: "#0E2A45", // Azul más oscuro al hacer hover
                                        },
                                    }}
                                >
                                    {indice === pasos.length - 1
                                        ? "Terminar"
                                        : "Continuar"}
                                </Button>
                                <Button
                                    disabled={indice === 0}
                                    onClick={handleAnteriorPaso}
                                    sx={{
                                        mt: 1,
                                        mr: 1,
                                        color: "#163660", // Color del texto azul para el botón
                                        "&:hover": {
                                            backgroundColor:
                                                "rgba(22, 54, 96, 0.1)", // Fondo azul en hover
                                        },
                                    }}
                                >
                                    Anterior
                                </Button>
                            </Box>
                        </StepContent>
                    </Step>
                ))}
            </Stepper>
        </Box>
    );
}
