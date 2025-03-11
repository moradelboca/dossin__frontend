/*
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
    let {
        pasoSeleccionado,
        datosCarga,
        handleCloseDialog,
        creando,
        refreshCargas,
    } = props;
    if (creando) {
        datosCarga = null;
    }
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
        tolerancia: 32.5,
        creadoPor: "test@test.com"
    });
    
    {
    //    "tarifa": 1200,
    //    "idTipoTarifa": 1,
    //    "incluyeIVA": true,
    //    "cantidadKm": 200,
    //    "idsTiposAcoplados": [1],
    //    "idProveedor": 1,
    //    "idCargamento": 1,
    //    "horaInicioCarga": "08:00",
    //    "horaFinCarga": "08:15:00",
    //    "horaInicioDescarga": "20:00:00",
    //    "horaFinDescarga": "20:15:00",
    //    "horaInicioBalanza": "19:00:00",
    //    "horaFinBalanza": "19:30:00",
    //    "idUbicacionCarga": 1,
    //    "idUbicacionDescarga": 1,
    //    "idUbicacionBalanza":1,
    //    "descripcion": "afafaw"
//
    //    "tolerancia": 30.5,
    //    "creadoPor": "test@test.com",
    //}
        
    const [datosSinCompletar, setDatosSinCompletar] = useState(false);
    const [pasoActivo, setPasoActivo] = useState<number>(pasoSeleccionado ?? 0);
    const [estadoCarga, setEstadoCarga] = useState("Creando");
    useEffect(() => {
        setEstadoCarga(creando ? "Creando" : "Actualizando");
    }, [creando]);
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
            const metodo = creando ? "POST" : "PUT";
            const url = creando
                ? `${backendURL}/cargas`
                : `${backendURL}/cargas/${datosCarga?.id}`;
            const body = { ...datosNuevaCarga, creadoPor: "test@test.com" };
            delete body["nombreUbicacionCarga"];
            delete body["nombreUbicacionDescarga"];
            delete body["nombreUbicacionBalanza"];
            delete body["nombreTipoTarifa"];
            delete body["nombreProveedor"];
            delete body["nombreCargamento"];
            setEstadoCarga("Cargando");
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
                        throw new Error("Error al crear la carga");
                    }
                    response.json();
                })
                .then(() => {
                    refreshCargas();
                    setEstadoCarga("Creado");
                    setTimeout(() => {
                        handleCloseDialog();
                    }, 1000);
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

*/

import React, { useState, useEffect, useContext, createContext, useMemo, useCallback } from "react";
import Box from "@mui/material/Box";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import StepContent from "@mui/material/StepContent";
import Button from "@mui/material/Button";
import { Typography } from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";
import CheckIcon from "@mui/icons-material/Check";
import CancelIcon from "@mui/icons-material/Cancel";
import ClearSharpIcon from "@mui/icons-material/ClearSharp";

import SelectorDeAcoplados from "../selectores/SelectorDeAcoplados";
import SelectorDeUbicacion from "../selectores/SelectorDeUbicacion";
import SelectorTarifa from "../selectores/SelectorTarifa";
import SelectorMasInfo from "../selectores/SelectorMasInfo";
import SelectorProveedor from "../selectores/SelectorProveedor";

import { ContextoGeneral } from "../../Contexto";

// Interfaces para tipar el estado y las props
interface DatosNuevaCarga {
  idsTiposAcoplados?: number[];
  incluyeIVA?: boolean;
  nombreTipoTarifa?: string;
  idTipoTarifa?: number;
  tarifa?: number;
  descripcion?: string;
  nombreProveedor?: string;
  nombreCargamento?: string;
  nombreUbicacionCarga?: string;
  idUbicacionCarga?: number;
  nombreUbicacionDescarga?: string;
  idUbicacionDescarga?: number;
  requiereBalanza?: boolean;
  nombreUbicacionBalanza?: string;
  idUbicacionBalanza?: number | string;
  idProveedor?: number;
  idCargamento?: number;
  cantidadKm?: number;
  horaInicioCarga?: string;
  horaFinCarga?: string;
  horaInicioDescarga?: string;
  horaFinDescarga?: string;
  horaInicioBalanza?: string;
  horaFinBalanza?: string;
  tolerancia?: number;
  creadoPor?: string;
}

interface CrearCargaStepperProps {
  pasoSeleccionado?: number;
  datosCarga?: any; // Se recomienda definir un tipo más específico según la estructura
  handleCloseDialog: () => void;
  creando: boolean;
  refreshCargas: () => void;
  // Prop opcional para almacenar las cargas creadas en el parent
  listaCargasCreadas?: any[];
}

interface ContextoStepperProps {
  datosNuevaCarga: DatosNuevaCarga;
  setDatosNuevaCarga: React.Dispatch<React.SetStateAction<DatosNuevaCarga>>;
  datosSinCompletar: boolean;
  setDatosSinCompletar: React.Dispatch<React.SetStateAction<boolean>>;
}

export const ContextoStepper = createContext<ContextoStepperProps>({
  datosNuevaCarga: {},
  setDatosNuevaCarga: () => {},
  datosSinCompletar: false,
  setDatosSinCompletar: () => {},
});

const CrearCargaStepper: React.FC<CrearCargaStepperProps> = ({
  pasoSeleccionado = 0,
  datosCarga,
  handleCloseDialog,
  creando,
  refreshCargas,
  listaCargasCreadas, // nuevo prop opcional
}) => {
  const initialCargaData = creando ? null : datosCarga;

  const [datosNuevaCarga, setDatosNuevaCarga] = useState<DatosNuevaCarga>({
    idsTiposAcoplados:
      initialCargaData?.tiposAcoplados?.map((acoplado: any) => acoplado.id) || [],
    incluyeIVA: initialCargaData?.incluyeIVA || false,
    nombreTipoTarifa: initialCargaData?.tipoTarifa?.nombre || "",
    idTipoTarifa: initialCargaData?.tipoTarifa?.id,
    tarifa: initialCargaData?.tarifa,
    descripcion: initialCargaData?.descripcion || "",
    nombreProveedor: initialCargaData?.proveedor?.nombre || "",
    nombreCargamento: initialCargaData?.cargamento?.nombre || "",
    nombreUbicacionCarga: initialCargaData?.ubicacionCarga?.nombre || "",
    idUbicacionCarga: initialCargaData?.ubicacionCarga?.id,
    nombreUbicacionDescarga: initialCargaData?.ubicacionDescarga?.nombre || "",
    idUbicacionDescarga: initialCargaData?.ubicacionDescarga?.id,
    requiereBalanza: Boolean(initialCargaData?.horaInicioBalanza),
    nombreUbicacionBalanza: initialCargaData?.ubicacionBalanza?.nombre || "",
    idUbicacionBalanza: initialCargaData?.ubicacionBalanza?.id || null,
    idProveedor: initialCargaData?.proveedor?.id,
    idCargamento: initialCargaData?.cargamento?.id,
    cantidadKm: initialCargaData?.cantidadKm,
    horaInicioCarga: initialCargaData?.horaInicioCarga || "",
    horaFinCarga: initialCargaData?.horaFinCarga || "",
    horaInicioDescarga: initialCargaData?.horaInicioDescarga || "",
    horaFinDescarga: initialCargaData?.horaFinDescarga || "",
    horaInicioBalanza: initialCargaData?.horaInicioBalanza || "",
    horaFinBalanza: initialCargaData?.horaFinBalanza || "",
    tolerancia: 32,
    creadoPor: "test@test.com",
  });

  const [datosSinCompletar, setDatosSinCompletar] = useState<boolean>(false);
  const [pasoActivo, setPasoActivo] = useState<number>(pasoSeleccionado);
  const [estadoCarga, setEstadoCarga] = useState<string>("Creando");

  const { backendURL, theme } = useContext(ContextoGeneral);

  useEffect(() => {
    setEstadoCarga(creando ? "Creando" : "Actualizando");
  }, [creando]);

  // Se memorizan los pasos, ya que no cambian durante la vida del componente
  const pasos = useMemo(
    () => [
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
    ],
    []
  );

  // Función para validar el paso actual
  const isStepValid = useCallback((): boolean => {
    switch (pasoActivo) {
      case 0:
        return !!(
          datosNuevaCarga.idProveedor &&
          datosNuevaCarga.cantidadKm &&
          datosNuevaCarga.idCargamento
        );
      case 1:
        return !!(
          datosNuevaCarga.idUbicacionCarga &&
          datosNuevaCarga.idUbicacionDescarga &&
          datosNuevaCarga.horaInicioCarga &&
          datosNuevaCarga.horaFinCarga &&
          datosNuevaCarga.horaInicioDescarga &&
          datosNuevaCarga.horaFinDescarga &&
          (!datosNuevaCarga.requiereBalanza ||
            (datosNuevaCarga.horaInicioBalanza &&
              datosNuevaCarga.horaFinBalanza &&
              datosNuevaCarga.idUbicacionBalanza)) &&
          datosNuevaCarga.horaInicioCarga < datosNuevaCarga.horaFinCarga &&
          datosNuevaCarga.horaInicioDescarga < datosNuevaCarga.horaFinDescarga &&
          (!datosNuevaCarga.requiereBalanza ||
            datosNuevaCarga.horaInicioBalanza! < datosNuevaCarga.horaFinBalanza!)
        );
      case 2:
        return !!(datosNuevaCarga.idsTiposAcoplados?.length);
      case 3:
        return !!(datosNuevaCarga.idTipoTarifa && datosNuevaCarga.tarifa);
      case 4:
        return !!datosNuevaCarga.descripcion;
      default:
        return false;
    }
  }, [pasoActivo, datosNuevaCarga]);

  const handleProximoPaso = useCallback(() => {
    setDatosSinCompletar(false);

    if (!isStepValid()) {
      setDatosSinCompletar(true);
      return;
    }

    if (pasoActivo === pasos.length - 1) {
      const metodo = creando ? "POST" : "PUT";
      const url = creando
        ? `${backendURL}/cargas`
        : `${backendURL}/cargas/${datosCarga?.id}`;

      // Se eliminan propiedades que no deben enviarse
      const {
        nombreUbicacionCarga,
        nombreUbicacionDescarga,
        nombreUbicacionBalanza,
        nombreTipoTarifa,
        nombreProveedor,
        nombreCargamento,
        requiereBalanza,
        ...body
      } = { ...datosNuevaCarga, creadoPor: "test@test.com" };

      setEstadoCarga("Cargando");
      console.log("el body: \n", body);
      (async () => {
        try {
          const response = await fetch(url, {
            method: metodo,
            headers: {
              "Content-Type": "application/json",
              "ngrok-skip-browser-warning": "true",
            },
            body: JSON.stringify(body),
          });
          if (!response.ok) {
            throw new Error("Error al crear la carga");
          }
          const dataResponse = await response.json();
          
          // Si se pasó el prop listaCargasCreadas, se agrega la carga creada
          if (listaCargasCreadas) {
            // Nota: Si el array proviene de state en el parent, lo ideal es actualizarlo de forma inmutable
            listaCargasCreadas.push(dataResponse);
          }
          
          refreshCargas();
          setEstadoCarga("Creado");
          setTimeout(handleCloseDialog, 1000);
        } catch (error) {
          setEstadoCarga("Error");
        }
      })();
    } else {
      setPasoActivo((prev) => prev + 1);
    }
  }, [
    pasoActivo,
    pasos.length,
    datosNuevaCarga,
    creando,
    backendURL,
    datosCarga,
    isStepValid,
    refreshCargas,
    handleCloseDialog,
    listaCargasCreadas,
  ]);

  const handleAnteriorPaso = useCallback(() => {
    setPasoActivo((prev) => prev - 1);
    setDatosSinCompletar(false);
  }, []);

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
            {pasos.map((paso, index) => (
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
                      {completed ? "✓" : index + 1}
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
                        "&:hover": { backgroundColor: "#0E2A45" },
                      }}
                    >
                      {index === pasos.length - 1
                        ? estadoCarga === "Creando"
                          ? "Terminar"
                          : "Actualizar"
                        : "Continuar"}
                    </Button>
                    <Button
                      disabled={index === 0}
                      onClick={handleAnteriorPaso}
                      sx={{
                        mt: 1,
                        mr: 1,
                        color: "#163660",
                        "&:hover": {
                          backgroundColor: "rgba(22, 54, 96, 0.1)",
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
          display="flex"
          flexDirection="row"
          width="100%"
          justifyContent="center"
          alignItems="center"
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
          display="flex"
          flexDirection="row"
          width="100%"
          justifyContent="center"
          alignItems="center"
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
          display="flex"
          flexDirection="row"
          width="100%"
          justifyContent="center"
          alignItems="center"
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
};

export default CrearCargaStepper;
