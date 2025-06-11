import { useMediaQuery } from "@mui/material";
import Box from "@mui/material/Box";
import { useCallback, useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ContextoGeneral } from "../../Contexto";
import { CargasMobile } from "../../mobile/cargas/CargasMobile";
import { CargaDialog } from "../tarjetas/CargaDialog";
import { ContainerTarjetasCargas, ContextoCargas } from "./ContainerTajetasCargas";
import CrearCargaStepper from "../creadores/CrearCargaStepper";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";

export function ContainerCargas() {
  const { backendURL } = useContext(ContextoGeneral);
  const { idCarga } = useParams();
  const isMobile = useMediaQuery('(max-width:768px)');

  // Estados para las cargas y su estado (cargando/cargado)
  const [cargas, setCargas] = useState<any[]>([]);
  const [estadoCarga, setEstadoCarga] = useState("Cargando");

  // Estado para la carga seleccionada y sus cupos
  const [cargaSeleccionada, setCargaSeleccionada] = useState<any>(null);
  const [cupos, setCupos] = useState<any[]>([]);

  // Estados para el diálogo de edición en mobile
  const [openDialogMobile, setOpenDialogMobile] = useState(false);
  const [pasoSeleccionadoMobile, setPasoSeleccionadoMobile] = useState<any>(null);

  // Función para obtener las cargas del backend
  const refreshCargas = useCallback(() => {
    fetch(`${backendURL}/cargas`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setCargas(data);
          setEstadoCarga("Cargado");
        } else {
          console.error("Error: La respuesta no es un array", data);
        }
      })
      .catch((_e) => {
        console.error("Error al obtener las cargas");
      });
  }, [backendURL]);

  
  useEffect(() => {
    refreshCargas();
  }, [refreshCargas]);

  // Actualizar la carga seleccionada si las cargas cambian
  useEffect(() => {
    if (cargas.length > 0 && cargaSeleccionada?.id) {
      const cargaActualizada = cargas.find(
        (carga) => carga.id === cargaSeleccionada.id
      );
      if (cargaActualizada) {
        setCargaSeleccionada(cargaActualizada);
      }
    }
  }, [cargas, cargaSeleccionada]);

  // Obtener los cupos de la carga seleccionada
  useEffect(() => {
    if (cargaSeleccionada?.id) {
      fetch(`${backendURL}/cargas/${cargaSeleccionada.id}/cupos`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
      })
        .then((res) => res.json())
        .then((data) => {
          // Normalizar los campos de los turnos
          const cuposNormalizados = Array.isArray(data)
            ? data.map((cupo: any) => ({
                ...cupo,
                turnos: Array.isArray(cupo.turnos)
                  ? cupo.turnos.map((turno: any) => ({
                      ...turno,
                      camion: typeof turno.camion === "string" ? { patente: turno.camion } : turno.camion,
                      acoplado: typeof turno.acoplado === "string" ? { patente: turno.acoplado } : turno.acoplado,
                      acopladoExtra: typeof turno.acopladoExtra === "string" ? { patente: turno.acopladoExtra } : turno.acopladoExtra,
                    }))
                  : [],
                turnosConErrores: Array.isArray(cupo.turnosConErrores)
                  ? cupo.turnosConErrores.map((turno: any) => ({
                      ...turno,
                      camion: typeof turno.camion === "string" ? { patente: turno.camion } : turno.camion,
                      acoplado: typeof turno.acoplado === "string" ? { patente: turno.acoplado } : turno.acoplado,
                      acopladoExtra: typeof turno.acopladoExtra === "string" ? { patente: turno.acopladoExtra } : turno.acopladoExtra,
                    }))
                  : [],
              }))
            : [];
          setCupos(cuposNormalizados);
        })
        .catch(() => {
          setCupos([]);
          console.error("Error al obtener los cupos disponibles");
        });
    }
  }, [backendURL, cargaSeleccionada]);

  const handleCargaUpdated = useCallback(async (fullCarga: any) => {
    try {
      if (!fullCarga.id) return;
      
      const response = await fetch(`${backendURL}/cargas/${fullCarga.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify(fullCarga.payload)
      });
      
      if (response.ok) {
        refreshCargas();
        const updatedCarga = await response.json();
        setCargaSeleccionada(updatedCarga);
      }
    } catch (error) {
      console.error('Error actualizando carga:', error);
    }
  }, [backendURL, refreshCargas]);

  // Handler para abrir el diálogo en mobile
  const handleClickAbrirDialogMobile = (paso: any) => {
    setPasoSeleccionadoMobile(paso);
    setOpenDialogMobile(true);
  };
  const handleCloseDialogMobile = () => {
    setOpenDialogMobile(false);
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100%",
        flexDirection: "column",
        backgroundColor: "#f6f6f6",
      }}
    >
      {isMobile ? (
        <ContextoCargas.Provider
          value={{
            cargaSeleccionada,
            setCargaSeleccionada,
            handleClickAbrirDialog: handleClickAbrirDialogMobile,
            cupos,
          }}
        >
          <CargasMobile
            cargas={cargas}
            estadoCarga={estadoCarga}
            cargaSeleccionada={cargaSeleccionada}
            setCargaSeleccionada={setCargaSeleccionada}
            cupos={cupos}
          />
          <Dialog open={openDialogMobile} onClose={handleCloseDialogMobile} maxWidth="lg" fullWidth
            PaperProps={{
              sx: {
                m: { xs: 1, sm: 2 },
                width: '100%',
                maxWidth: { xs: '98vw', sm: '95vw', md: '900px', lg: '1100px' },
              }
            }}
          >
            <DialogTitle>
              Modificando Carga
            </DialogTitle>
            <DialogContent
              sx={{
                height: { xs: 'auto', sm: '80vh' },
                alignContent: "center",
                px: { xs: 1, sm: 3 },
                py: { xs: 1, sm: 2 },
                boxSizing: 'border-box',
              }}
            >
              <CrearCargaStepper
                datosCarga={cargaSeleccionada}
                pasoSeleccionado={pasoSeleccionadoMobile}
                handleCloseDialog={handleCloseDialogMobile}
                creando={false}
                onCargaUpdated={handleCargaUpdated}
              />
            </DialogContent>
          </Dialog>
        </ContextoCargas.Provider>
      ) : (
        <ContainerTarjetasCargas
          cargas={cargas}
          estadoCarga={estadoCarga}
          cargaSeleccionada={cargaSeleccionada}
          setCargaSeleccionada={setCargaSeleccionada}
          cupos={cupos}
          onCargaUpdated={handleCargaUpdated}
          onRefresh={refreshCargas}
        />
      )}
      {idCarga ? <CargaDialog /> : null}
    </Box>
  );
}
