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
import { useAuth } from "../../autenticacion/ContextoAuth";

// Interfaces para tipar el estado y las props
interface DatosNuevaCarga {
  idsTiposAcoplados?: number[];
  incluyeIVA?: boolean;
  nombreTipoTarifa?: string;
  idTipoTarifa?: number;
  tarifa?: number;
  descripcion?: string;
  plantaProcedenciaRuca?: string;
  destinoRuca?: string; 
  nombreCargamento?: string;
  nombreUbicacionCarga?: string;
  idUbicacionCarga?: number;
  nombreUbicacionDescarga?: string;
  idUbicacionDescarga?: number;
  requiereBalanza?: boolean;
  nombreUbicacionBalanza?: string;
  idUbicacionBalanza?: number | string;
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
  listaCargasCreadas?: any[];
  onCargaCreated?: (payload: any) => void;
  onCargaUpdated?: (payload: any) => void;
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
  listaCargasCreadas,
  onCargaCreated,
  onCargaUpdated,
}) => {
  const initialCargaData = creando ? null : datosCarga;
  const { user } = useAuth();

  const [datosNuevaCarga, setDatosNuevaCarga] = useState<DatosNuevaCarga>({
    idsTiposAcoplados:
      initialCargaData?.tiposAcoplados?.map((acoplado: any) => acoplado.id) || [],
    incluyeIVA: initialCargaData?.incluyeIVA || false,
    nombreTipoTarifa: initialCargaData?.tipoTarifa?.nombre || "",
    idTipoTarifa: initialCargaData?.tipoTarifa?.id,
    tarifa: initialCargaData?.tarifa,
    descripcion: initialCargaData?.descripcion || "",
    plantaProcedenciaRuca: initialCargaData?.plantaProcedenciaRuca || "",
    destinoRuca: initialCargaData?.destinoRuca || "",
    nombreCargamento: initialCargaData?.cargamento?.nombre || "",
    nombreUbicacionCarga: initialCargaData?.ubicacionCarga?.nombre || "",
    idUbicacionCarga: initialCargaData?.ubicacionCarga?.id,
    nombreUbicacionDescarga: initialCargaData?.ubicacionDescarga?.nombre || "",
    idUbicacionDescarga: initialCargaData?.ubicacionDescarga?.id,
    requiereBalanza: Boolean(initialCargaData?.horaInicioBalanza),
    nombreUbicacionBalanza: initialCargaData?.ubicacionBalanza?.nombre || "",
    idUbicacionBalanza: initialCargaData?.ubicacionBalanza?.id || null,
    idCargamento: initialCargaData?.cargamento?.id,
    cantidadKm: initialCargaData?.cantidadKm,
    horaInicioCarga: initialCargaData?.horaInicioCarga || "",
    horaFinCarga: initialCargaData?.horaFinCarga || "",
    horaInicioDescarga: initialCargaData?.horaInicioDescarga || "",
    horaFinDescarga: initialCargaData?.horaFinDescarga || "",
    horaInicioBalanza: initialCargaData?.horaInicioBalanza || "",
    horaFinBalanza: initialCargaData?.horaFinBalanza || "",
    tolerancia: initialCargaData?.tolerancia || 0,
    creadoPor: user?.email || "test@test.com",
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
        return !!(datosNuevaCarga.descripcion && datosNuevaCarga.tolerancia && datosNuevaCarga.destinoRuca && datosNuevaCarga.plantaProcedenciaRuca);
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
      const {
        nombreUbicacionCarga,
        nombreUbicacionDescarga,
        nombreUbicacionBalanza,
        nombreTipoTarifa,
        nombreCargamento,
        requiereBalanza,
        ...body
      } = datosNuevaCarga;

      if (creando) {
        onCargaCreated?.(body);
      } else {
        onCargaUpdated?.(body);
      }
      handleCloseDialog();
    } else {
      setPasoActivo((prev) => prev + 1);
    }
  }, [
    pasoActivo,
    pasos.length,
    datosNuevaCarga,
    creando,
    onCargaCreated,
    onCargaUpdated,
    handleCloseDialog,
    isStepValid,
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
