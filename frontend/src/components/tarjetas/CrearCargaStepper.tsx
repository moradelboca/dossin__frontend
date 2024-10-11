import Box from "@mui/material/Box";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import StepContent from "@mui/material/StepContent";
import Button from "@mui/material/Button";
import SelectorDeAcoplados from "../selectores/SelectorDeAcoplados";
import SelectorDeUbicacion from "../selectores/SelectorDeUbicacion";
import { useEffect, useState, useContext } from "react";
import SelectorTarifa from "../selectores/SelectorTarifa";
import SelectorMasInfo from "../selectores/SelectorMasInfo";
import SelectorProveedor from "../selectores/SelectorProveedor";
import { Typography } from "@mui/material";
import { ContextoGeneral } from "../Contexto";

export default function CrearCargaStepper() {
    const [datosNuevaCarga, setDatosNuevaCarga] = useState<any>({});
    const [datosSinCompletar, setDatosSinCompletar] = useState(false);
    const [horarioIncorrecto, setHorarioIncorrecto] = useState(false);
    const [pasoActivo, setPasoActivo] = useState(0);

    const { backendURL } = useContext(ContextoGeneral);

    const pasos = [
        {
            titulo: "Seleccionar Proveedor",
            componente: <SelectorProveedor datosNuevaCarga={datosNuevaCarga} />,
        },
        {
            titulo: "Seleccionar ubicacion y horarios",
            componente: (
                <SelectorDeUbicacion datosNuevaCarga={datosNuevaCarga} />
            ),
        },
        {
            titulo: "Seleccionar acoplados permitidos",
            componente: (
                <SelectorDeAcoplados datosNuevaCarga={datosNuevaCarga} />
            ),
        },
        {
            titulo: "Seleccionar tarifa",
            componente: <SelectorTarifa datosNuevaCarga={datosNuevaCarga} />,
        },
        {
            titulo: "Mas informacion",
            componente: <SelectorMasInfo datosNuevaCarga={datosNuevaCarga} />,
        },
    ];

    const handleProximoPaso = () => {
        setDatosSinCompletar(false);
        setHorarioIncorrecto(false);

        switch (pasoActivo) {
            case 0:
                if (
                    !datosNuevaCarga["idProveedor"] ||
                    !datosNuevaCarga["cantidadKm"] ||
                    !datosNuevaCarga["idCargamento"]
                ) {
                    setDatosSinCompletar(true);
                    return;
                }
                break;
            case 1:
                if (
                    !datosNuevaCarga["idUbicacionCarga"] ||
                    !datosNuevaCarga["idUbicacionDescarga"] ||
                    !datosNuevaCarga["horaInicioCarga"] ||
                    !datosNuevaCarga["horaFinCarga"] ||
                    !datosNuevaCarga["horaInicioDescarga"] ||
                    !datosNuevaCarga["horaFinDescarga"]
                ) {
                    setDatosSinCompletar(true);
                    return;
                } else {
                    // Verificación de horarios solo en el paso 2
                    if (
                        datosNuevaCarga["horaInicioCarga"] >=
                            datosNuevaCarga["horaFinCarga"] ||
                        datosNuevaCarga["horaInicioDescarga"] >=
                            datosNuevaCarga["horaFinDescarga"]
                    ) {
                        setHorarioIncorrecto(true);
                        return;
                    }
                    if (
                        (datosNuevaCarga["idUbicacionBalanza"] ||
                            datosNuevaCarga["horaInicioBalanza"] ||
                            datosNuevaCarga["horaFinBalanza"]) &&
                        (!datosNuevaCarga["idUbicacionBalanza"] ||
                            !datosNuevaCarga["horaInicioBalanza"] ||
                            !datosNuevaCarga["horaFinBalanza"])
                    ) {
                        setDatosSinCompletar(true);
                        return;
                    }
                }
                break;
            case 3:
                if (
                    !datosNuevaCarga["idTipoTarifa"] ||
                    !datosNuevaCarga["tarifa"]
                ) {
                    setDatosSinCompletar(true);
                    return;
                }
                break;
            default:
                break;
        }

        setPasoActivo((prevActiveStep) => prevActiveStep + 1);
        console.log(datosNuevaCarga);

        if (pasoActivo === pasos.length - 1) {
            datosNuevaCarga["creadoPor"] = "test@test.com";

            fetch(`${backendURL}/cargas`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(datosNuevaCarga),
            });
        }
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
                            StepIconComponent={({ completed }) => (
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
                                {datosSinCompletar ? (
                                    <Typography color="#ff3333">
                                        Hay campos sin completar, o estan mal!
                                    </Typography>
                                ) : null}
                                {horarioIncorrecto && pasoActivo === 1 && (
                                    <Typography color="#ff3333">
                                        La hora de inicio no puede ser mayor o
                                        igual a la de fin!
                                    </Typography>
                                )}
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
