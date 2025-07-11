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
import InfoTooltip from '../../InfoTooltip';

// Interfaces para tipar el estado y las props
interface DatosNuevaCarga {
  id?: number;
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
  onCargaCreated,
  onCargaUpdated,
}) => {
  const initialCargaData = creando ? null : datosCarga;
  const { user } = useAuth();

  const [datosNuevaCarga, setDatosNuevaCarga] = useState<DatosNuevaCarga>({
    id: initialCargaData?.id,
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
    nombreUbicacionCarga: initialCargaData?.ubicacionCarga
      ? `${initialCargaData.ubicacionCarga.nombre}, ${initialCargaData.ubicacionCarga.localidad.nombre}, ${initialCargaData.ubicacionCarga.localidad.provincia.nombre}`
      : "",
    idUbicacionCarga: initialCargaData?.ubicacionCarga?.id,
    nombreUbicacionDescarga: initialCargaData?.ubicacionDescarga
      ? `${initialCargaData.ubicacionDescarga.nombre}, ${initialCargaData.ubicacionDescarga.localidad.nombre}, ${initialCargaData.ubicacionDescarga.localidad.provincia.nombre}`
      : "",
    idUbicacionDescarga: initialCargaData?.ubicacionDescarga?.id,
    requiereBalanza: Boolean(initialCargaData?.horaInicioBalanza),
    nombreUbicacionBalanza: initialCargaData?.ubicacionBalanza
      ? `${initialCargaData.ubicacionBalanza.nombre}, ${initialCargaData.ubicacionBalanza.localidad.nombre}, ${initialCargaData.ubicacionBalanza.localidad.provincia.nombre}`
      : "",
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

  const { theme } = useContext(ContextoGeneral);

  useEffect(() => {
    setEstadoCarga(creando ? "Creando" : "Actualizando");
  }, [creando]);

  // Se memorizan los pasos, ya que no cambian durante la vida del componente
  const pasos = useMemo(
    () => [
      {
        titulo: "Seleccionar ubicacion y horarios",
        componente: <SelectorDeUbicacion />,
        tooltip: {
          title: 'Ubicación y horarios',
          sections: [
            'Seleccioná la ubicación de carga y descarga, y completá los horarios de inicio y fin para cada etapa.',
            {
              label: '¿Qué significa "requiere balanza"?',
              items: [
                'Si marcás que la carga requiere balanza, significa que el campo NO tiene balanza propia y se utilizará una balanza de un tercero (fuera del campo).',
                'En este caso, es fundamental seleccionar correctamente la ubicación de la balanza, ya que los camioneros deberán ir primero a la balanza para pesar el camión antes de dirigirse al campo.',
                'Esto afecta la logística: el recorrido será primero a la balanza y luego al campo, no directamente al campo.'
              ]
            },
            {
              label: 'Consejos',
              items: [
                'Verificá que las ubicaciones existan en el sistema. Si no, deberás crearlas antes.',
                'Los horarios deben ser coherentes: la hora de inicio debe ser menor a la de fin.',
                'Si la carga requiere balanza, completá también la ubicación y horarios de balanza.'
              ]
            },
            'Asegurate de que la información sea precisa, ya que impacta en la logística y la planificación.'
          ]
        }
      },
      {
        titulo: "Seleccionar kilometros y cargamento",
        componente: <SelectorProveedor />,
        tooltip: {
          title: 'Kilómetros y cargamento',
          sections: [
            'Seleccioná un solo cargamento de los que figuran en el sistema. Si el cargamento que necesitás no está, generá un inconveniente solicitando que lo agreguen.',
            {
              label: 'Sobre los kilómetros',
              items: [
                'Ingresá la cantidad de kilómetros exactos que indica Google Maps para el trayecto.',
                'Estos kilómetros se usan para la carta de porte y para otros cálculos importantes, así que deben ser precisos.'
              ]
            }
          ]
        }
      },
      {
        titulo: "Seleccionar tarifa",
        componente: <SelectorTarifa />,
        tooltip: {
          title: 'Tarifa',
          sections: [
            'Seleccioná el tipo de tarifa (por tonelada, por viaje, etc.) e ingresá el valor correspondiente.',
            {
              label: '¿Qué significa "incluye IVA"?',
              items: [
                'Si marcás la opción "incluye IVA", el monto que ingresás ya tiene el IVA incluido dentro de ese número.',
                'Si NO se marca, el sistema calculará el IVA por fuera y le sumará automáticamente un 21% al monto que ingreses.'
              ]
            },
            {
              label: 'Recomendaciones',
              items: [
                'Verificá que la tarifa sea la acordada con el proveedor o cliente.',
                'Si la tarifa incluye IVA, marcá la opción correspondiente.'
              ]
            },
            'La tarifa impacta en la facturación y en los reportes de costos.'
          ]
        }
      },
      {
        titulo: "Selecciona tipos de acoplados permitidos",
        componente: <SelectorDeAcoplados />,
        tooltip: {
          title: 'Tipos de acoplados',
          sections: [
            'Seleccioná uno o más tipos de acoplados que estarán permitidos para esta carga.',
            {
              label: 'Tips',
              items: [
                'Solo los camiones con los acoplados seleccionados podrán tomar turnos para esta carga.',
                'Si no seleccionás ninguno, no se podrán asignar turnos.'
              ]
            },
            'Podés agregar nuevos tipos de acoplados desde el panel de administración si es necesario.'
          ]
        }
      },
      {
        titulo: "Mas informacion",
        componente: <SelectorMasInfo />,
        tooltip: {
          title: 'Más información',
          sections: [
            'Completá datos adicionales como tolerancia, descripción, y cualquier observación relevante.',
            {
              label: 'Importante',
              items: [
                'La tolerancia define el margen de error permitido en la carga/descarga.',
                'Una buena descripción ayuda a todos los usuarios a entender particularidades de la carga.'
              ]
            },
            'Revisá toda la información antes de finalizar.'
          ]
        }
      },
    ],
    []
  );

  // Función para validar el paso actual
  const isStepValid = useCallback((): boolean => {
    switch (pasoActivo) {
      case 0:
        // Paso 0: Seleccionar ubicacion y horarios
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
      case 1:
        // Paso 1: Seleccionar kilometros y cargamento
        return !!(
          datosNuevaCarga.cantidadKm &&
          datosNuevaCarga.idCargamento
        );
      case 2:
        // Paso 2: Seleccionar tarifa
        return !!(datosNuevaCarga.idTipoTarifa && datosNuevaCarga.tarifa);
      case 3:
        // Paso 3: Selecciona tipos de acoplados permitidos
        return !!(datosNuevaCarga.idsTiposAcoplados?.length);
      case 4:
        // Paso 4: Solo tolerancia es requerida
        return datosNuevaCarga.tolerancia !== undefined && datosNuevaCarga.tolerancia !== null && !isNaN(Number(datosNuevaCarga.tolerancia));
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
      // Si tolerancia está vacío o no es un número, enviar 0
      const toleranciaFinal = (datosNuevaCarga.tolerancia === undefined || datosNuevaCarga.tolerancia === null || isNaN(Number(datosNuevaCarga.tolerancia))) ? 0 : Number(datosNuevaCarga.tolerancia);
      const fullCarga = {
        id: datosNuevaCarga.id,
        idsTiposAcoplados: datosNuevaCarga.idsTiposAcoplados,
        incluyeIVA: datosNuevaCarga.incluyeIVA,
        tipoTarifa: {
          id: datosNuevaCarga.idTipoTarifa,
          nombre: datosNuevaCarga.nombreTipoTarifa
        },
        tarifa: datosNuevaCarga.tarifa,
        descripcion: datosNuevaCarga.descripcion,
        plantaProcedenciaRuca: datosNuevaCarga.plantaProcedenciaRuca,
        destinoRuca: datosNuevaCarga.destinoRuca,
        cargamento: {
          id: datosNuevaCarga.idCargamento,
          nombre: datosNuevaCarga.nombreCargamento
        },
        ubicacionCarga: {
          id: datosNuevaCarga.idUbicacionCarga,
          nombre: datosNuevaCarga.nombreUbicacionCarga
        },
        ubicacionDescarga: {
          id: datosNuevaCarga.idUbicacionDescarga,
          nombre: datosNuevaCarga.nombreUbicacionDescarga
        },
        ubicacionBalanza: datosNuevaCarga.idUbicacionBalanza ? {
          id: datosNuevaCarga.idUbicacionBalanza,
          nombre: datosNuevaCarga.nombreUbicacionBalanza
        } : null,
        cantidadKm: datosNuevaCarga.cantidadKm,
        horaInicioCarga: datosNuevaCarga.horaInicioCarga,
        horaFinCarga: datosNuevaCarga.horaFinCarga,
        horaInicioDescarga: datosNuevaCarga.horaInicioDescarga,
        horaFinDescarga: datosNuevaCarga.horaFinDescarga,
        horaInicioBalanza: datosNuevaCarga.horaInicioBalanza,
        horaFinBalanza: datosNuevaCarga.horaFinBalanza,
        tolerancia: toleranciaFinal,
        creadoPor: datosNuevaCarga.creadoPor,
        payload: body
      };

      if (creando) {
        onCargaCreated?.(fullCarga);
      } else {
        onCargaUpdated?.(fullCarga);
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
                  <Box display="flex" alignItems="center" gap={1}>
                    {paso.titulo}
                    {pasoActivo === index && (
                      <InfoTooltip
                        title={paso.tooltip.title}
                        sections={paso.tooltip.sections}
                        placement="right"
                        iconSize="small"
                        contexto={`Formulario: Crear/Editar carga\nPaso: ${paso.titulo}`}
                      />
                    )}
                  </Box>
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
