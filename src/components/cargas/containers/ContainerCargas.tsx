import { useMediaQuery } from "@mui/material";
import Box from "@mui/material/Box";
import { useCallback, useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ContextoGeneral } from "../../Contexto";
import { CargasMobile } from "../../mobile/cargas/CargasMobile";
import { CargaDialog } from "../tarjetas/CargaDialog";
import { ContainerTarjetasCargas } from "./ContainerTajetasCargas";

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
          setCupos(data);
        })
        .catch(() => {
          setCupos([]);
          console.error("Error al obtener los cupos disponibles");
        });
    }
  }, [backendURL, cargaSeleccionada]);

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
        <CargasMobile
          cargas={cargas}
          estadoCarga={estadoCarga}
          refreshCargas={refreshCargas}
          cargaSeleccionada={cargaSeleccionada}
          setCargaSeleccionada={setCargaSeleccionada}
          cupos={cupos}
        />
      ) : (
        <ContainerTarjetasCargas
          cargas={cargas}
          estadoCarga={estadoCarga}
          refreshCargas={refreshCargas}
          cargaSeleccionada={cargaSeleccionada}
          setCargaSeleccionada={setCargaSeleccionada}
          cupos={cupos}
        />
      )}
      {idCarga ? <CargaDialog /> : null}
    </Box>
  );
}
