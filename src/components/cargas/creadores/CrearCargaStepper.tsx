import Box from "@mui/material/Box";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import StepContent from "@mui/material/StepContent";
import Button from "@mui/material/Button";
import SelectorDeAcoplados from "../selectores/SelectorDeAcoplados";
import SelectorDeUbicacion from "../selectores/SelectorDeUbicacion";
import { useState, useContext, createContext } from "react";
import SelectorTarifa from "../selectores/SelectorTarifa";
import SelectorMasInfo from "../selectores/SelectorMasInfo";
import SelectorProveedor from "../selectores/SelectorProveedor";
import { Typography } from "@mui/material";
import { ContextoGeneral } from "../../Contexto";
import CheckIcon from "@mui/icons-material/Check";
import CancelIcon from "@mui/icons-material/Cancel";
import CircularProgress from "@mui/material/CircularProgress";
import ClearSharpIcon from "@mui/icons-material/ClearSharp";

export const ContextoStepper = createContext<{
    datosNuevaCarga: any;
    setDatosNuevaCarga: React.Dispatch<React.SetStateAction<any>>;
    datosSinCompletar: boolean;
    setDatosSinCompletar: React.Dispatch<React.SetStateAction<boolean>>;
}>({
    datosNuevaCarga: {},
    setDatosNuevaCarga: () => {},
    datosSinCompletar: false,
    setDatosSinCompletar: () => {},
});

export default function CrearCargaStepper(props: any) {
    const { pasoSeleccionado, datosCarga, handleCloseDialog } = props;
    const [datosNuevaCarga, setDatosNuevaCarga] = useState<any>({
        ...datosCarga,
        requiereBalanza: false,
        idsTiposAcoplados: [],
        incluyeIVA: datosCarga?.incluyeIVA || false,
        nombreTipoTarifa: datosCarga?.tipoTarifa,
        nombreProveedor: datosCarga?.proveedor,
        nombreCargamento: datosCarga?.cargamento,
        nombreUbicacionCarga: datosCarga?.ubicacionCarga.nombre,
        nombreUbicacionDescarga: datosCarga?.ubicacionDescarga.nombre,
    });
    const [datosSinCompletar, setDatosSinCompletar] = useState(false);
    const [pasoActivo, setPasoActivo] = useState<number>(pasoSeleccionado ?? 0);
    const [estadoCarga, setEstadoCarga] = useState("Creando");

    const { backendURL, theme } = useContext(ContextoGeneral);

    const pasos = [
        {
            titulo: "Seleccionar Proveedor",
            componente: <SelectorProveedor />,
        },
        {
            titulo: "Seleccionar ubicacion y horarios",
            componente: <SelectorDeUbicacion />,
        },
        {
            titulo: "Seleccionar acoplados permitidos",
            componente: <SelectorDeAcoplados />,
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
        setDatosSinCompletar(false);

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
                    !datosNuevaCarga["horaFinDescarga"] ||
                    (datosNuevaCarga["requiereBalanza"] &&
                        (!datosNuevaCarga["horaInicioBalanza"] ||
                            !datosNuevaCarga["horaFinBalanza"] ||
                            !datosNuevaCarga["idUbicacionBalanza"])) ||
                    datosNuevaCarga["horaInicioCarga"] >=
                        datosNuevaCarga["horaFinCarga"] ||
                    datosNuevaCarga["horaInicioDescarga"] >=
                        datosNuevaCarga["horaFinDescarga"] ||
                    (datosNuevaCarga["requiereBalanza"] &&
                        datosNuevaCarga["horaInicioBalanza"] >=
                            datosNuevaCarga["horaFinBalanza"])
                ) {
                    setDatosSinCompletar(true);
                    return;
                }
                break;
            case 2:
                if (datosNuevaCarga["idsTiposAcoplados"].length === 0) {
                    setDatosSinCompletar(true);
                    return;
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

        if (pasoActivo === pasos.length - 1) {
            setEstadoCarga("Cargando");
            datosNuevaCarga["creadoPor"] = "test@test.com";

            fetch(`${backendURL}/cargas`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(datosNuevaCarga),
            })
                .then((response) => {
                    if (!response.ok) {
                        throw new Error("Error al crear la carga");
                    }
                    response.json();
                })
                .then(() => {
                    setTimeout(() => {
                        setEstadoCarga("Creado");
                    }, 2000);
                    setTimeout(() => {
                        handleCloseDialog();
                    }, 4000);
                })
                .catch(() => {
                    setEstadoCarga("Error");
                });
        }
    };

    const handleAnteriorPaso = () => {
        setPasoActivo((prevActiveStep) => prevActiveStep - 1);
        setDatosSinCompletar(false);
    };

    return (
        <ContextoStepper.Provider
            value={{
                datosNuevaCarga,
                setDatosNuevaCarga,
                datosSinCompletar,
                setDatosSinCompletar,
            }}
        >
            <ClearSharpIcon
                onClick={handleCloseDialog}
                sx={{
                    position: "absolute",
                    top: "10px",
                    right: "10px",
                    cursor: "pointer",
                    color: theme.colores.azul,
                }}
            />
            {estadoCarga === "Creando" && (
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
            )}
            {estadoCarga === "Cargando" && (
                <Box
                    display={"flex"}
                    flexDirection={"row"}
                    width={"100%"}
                    justifyContent={"center"}
                    alignItems={"center"}
                    gap={3}
                >
                    <CircularProgress
                        sx={{ padding: "5px", width: "30px", height: "30px" }}
                    />
                    <Typography variant="h5">
                        <b>Cargando...</b>
                    </Typography>
                </Box>
            )}
            {estadoCarga === "Creado" && (
                <Box
                    display={"flex"}
                    flexDirection={"row"}
                    width={"100%"}
                    justifyContent={"center"}
                    alignItems={"center"}
                    gap={3}
                >
                    <CheckIcon
                        sx={{
                            background: "green",
                            color: "#fff",
                            borderRadius: "50%",
                            padding: "5px",
                            width: "30px",
                            height: "30px",
                        }}
                    />
                    <Typography variant="h5">
                        <b>Carga creada con éxito!</b>
                    </Typography>
                </Box>
            )}
            {estadoCarga === "Error" && (
                <Box
                    display={"flex"}
                    flexDirection={"row"}
                    width={"100%"}
                    justifyContent={"center"}
                    alignItems={"center"}
                    gap={3}
                >
                    <CancelIcon
                        sx={{
                            color: "red",
                            borderRadius: "50%",
                            padding: "5px",
                            width: "50px",
                            height: "50px",
                        }}
                    />
                    <Typography variant="h5">
                        <b>Al parecer hubo un error, intenta nuevamente.</b>
                    </Typography>
                </Box>
            )}
        </ContextoStepper.Provider>
    );
}
