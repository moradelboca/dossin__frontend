import Box from "@mui/material/Box";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import StepContent from "@mui/material/StepContent";
import Button from "@mui/material/Button";
import SelectorDeAcoplados from "../selectores/SelectorDeAcoplados";
import SelectorDeUbicacion from "../selectores/SelectorDeUbicacion";
import { useState, useContext, createContext, useEffect } from "react";
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
        idsTiposAcoplados: datosCarga?.tiposAcoplados
            ? datosCarga.tiposAcoplados.map((acoplado: any) => acoplado.id)
            : [],
        incluyeIVA: datosCarga?.incluyeIVA || false,
        nombreTipoTarifa: datosCarga?.tipoTarifa.nombre,
        idTipoTarifa: datosCarga?.tipoTarifa.id,
        tarifa: datosCarga?.tarifa,
        descripcion: datosCarga?.descripcion,
        nombreProveedor: datosCarga?.proveedor.nombre,
        nombreCargamento: datosCarga?.cargamento.nombre,
        nombreUbicacionCarga: datosCarga?.ubicacionCarga.nombre,
        idUbicacionCarga: datosCarga?.ubicacionCarga.id,
        nombreUbicacionDescarga: datosCarga?.ubicacionDescarga.nombre,
        idUbicacionDescarga: datosCarga?.ubicacionDescarga.id,
        requiereBalanza: datosCarga?.horaInicioBalanza ? true : false,
        nombreUbicacionBalanza: datosCarga?.ubicacionBalanza?.nombre || "",
        idUbicacionBalanza: datosCarga?.ubicacionBalanza?.id || "",
        idProveedor: datosCarga?.proveedor.id,
        idCargamento: datosCarga?.cargamento.id,
        cantidadKm: datosCarga?.cantidadKm,
        horaInicioCarga: datosCarga?.horaInicioCarga,
        horaFinCarga: datosCarga?.horaFinCarga,
        horaInicioDescarga: datosCarga?.horaInicioDescarga,
        horaFinDescarga: datosCarga?.horaFinDescarga,
        horaInicioBalanza: datosCarga?.horaInicioBalanza,
        horaFinBalanza: datosCarga?.horaFinBalanza,
    });
    const [datosSinCompletar, setDatosSinCompletar] = useState(false);
    const [pasoActivo, setPasoActivo] = useState<number>(pasoSeleccionado ?? 0);
    const [estadoCarga, setEstadoCarga] = useState("Creando");
    useEffect(() => {
        if (pasoSeleccionado !== undefined && pasoSeleccionado !== null) {
            setEstadoCarga("Actualizando");
        }
    }, [pasoSeleccionado]);

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
            case 4:
                if (!datosNuevaCarga["descripcion"]) {
                    setDatosSinCompletar(true);
                    return;
                }
                break;
            default:
                break;
        }

        setPasoActivo((prevActiveStep) => prevActiveStep + 1);

        if (pasoActivo === pasos.length - 1) {
            const body = { ...datosNuevaCarga };
            delete body["nombreUbicacionCarga"];
            delete body["nombreUbicacionDescarga"];
            delete body["nombreUbicacionBalanza"];
            delete body["nombreTipoTarifa"];
            delete body["nombreProveedor"];
            delete body["nombreCargamento"];
            const metodo = estadoCarga === "Creando" ? "POST" : "PUT";
            setEstadoCarga("Cargando");
            datosNuevaCarga["creadoPor"] = "test@test.com";
            const url =
                estadoCarga === "Creando"
                    ? `${backendURL}/cargas`
                    : `${backendURL}/cargas/${datosCarga?.id}`;
            console.log(JSON.stringify(body));
            fetch(`${url}`, {
                method: metodo,
                headers: {
                    "Content-Type": "application/json",
                    "ngrok-skip-browser-warning": "true",
                },
                body: JSON.stringify(body),
            })
                .then((response) => {
                    if (!response.ok) {
                        console.log(response);
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
                .catch((e) => {
                    console.log(e);
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
            {(estadoCarga === "Creando" || estadoCarga === "Actualizando") && (
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
                                                border: "2px solid #163660",
                                                borderRadius: "50%",
                                                width: "24px",
                                                height: "24px",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                color: "white",
                                                fontSize: "12px",
                                            }}
                                        >
                                            {completed ? "✓" : indice + 1}
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
                                                backgroundColor: "#163660",
                                                color: "#fff",
                                                "&:hover": {
                                                    backgroundColor: "#0E2A45",
                                                },
                                            }}
                                        >
                                            {indice === pasos.length - 1
                                                ? estadoCarga === "Creando"
                                                    ? "Terminar"
                                                    : "Actualizar"
                                                : "Continuar"}
                                        </Button>
                                        <Button
                                            disabled={indice === 0}
                                            onClick={handleAnteriorPaso}
                                            sx={{
                                                mt: 1,
                                                mr: 1,
                                                color: "#163660",
                                                "&:hover": {
                                                    backgroundColor:
                                                        "rgba(22, 54, 96, 0.1)",
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
