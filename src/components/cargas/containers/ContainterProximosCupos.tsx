import { Box, IconButton, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import { useNavigate } from "react-router-dom";
import { useContext, useEffect, useRef, useState } from "react";
import { ContextoCargas } from "./ContainerTajetasCargas";
import { ContextoGeneral } from "../../Contexto";
//import { cuposCargasPrueba } from "./cuposCargasPrueba";

export default function ContainerProximosCupos() {
  const navigate = useNavigate();
  const [cupos, setCupos] = useState<any[]>([]);
  const { backendURL } = useContext(ContextoGeneral);
  const { cargaSeleccionada } = useContext(ContextoCargas);

  // Referencia al contenedor de scroll
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  // Guardamos el ancho para desplazar un "slide" entero

  const handleScrollLeft = () => {
    if (!scrollContainerRef.current) return;
    const container = scrollContainerRef.current;
    const width = container.clientWidth; // se mide al momento
    container.scrollTo({
      left: container.scrollLeft - width,
      behavior: "smooth",
    });
  };
  
  const handleScrollRight = () => {
    if (!scrollContainerRef.current) return;
    const container = scrollContainerRef.current;
    const width = container.clientWidth; // se mide al momento
    container.scrollTo({
      left: container.scrollLeft + width,
      behavior: "smooth",
    });
  };
  

  const handleClickVerCupos = () => {
    navigate(`/cargas/${cargaSeleccionada.id}/cupos`);
  };

  useEffect(() => {
    if (cargaSeleccionada?.id) {
      fetch(`${backendURL}/cargas/${cargaSeleccionada.id}/cupos`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Error al obtener los cupos");
          }
          return response.json();
        })
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
          setCupos([]); // En caso de error
        });
    }
  }, [cargaSeleccionada, backendURL]);

  return (
    <>
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          width: "100%",
        }}
      >
        <Typography>Cupos</Typography>
        <IconButton
          disabled={!cargaSeleccionada}
          onClick={handleClickVerCupos}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 25,
            height: 25,
            borderRadius: '50%',
            p: 0,
            transition: 'background 0.2s',
            '&:hover': {
              backgroundColor: '#f5f5f5', 
            },
          }}
        >
          <AddIcon />
        </IconButton>
      </Box>

      {/* Contenedor principal del slider */}
      <Box
        sx={{
          width: "100%",
          borderRadius: "16px",
          border: "1px solid #ccc",
          position: "relative",
          paddingY: 2,
        }}
      >
        {/* Si no hay cupos, mostramos un mensaje */}
        {!cupos.length ? (
          <Typography variant="subtitle2" sx={{ margin: 2 }} color="#90979f">
            Parece ser que no hay cupos.
          </Typography>
        ) : (
          <>
            {/* Flecha izquierda */}
            <IconButton
              onClick={handleScrollLeft}
              sx={{
                position: "absolute",
                left: 0,
                top: "50%",
                transform: "translateY(-50%)",
                zIndex: 1,
              }}
            >
              <ArrowBackIosIcon />
            </IconButton>

            {/* Contenedor con scroll horizontal y scroll-snap */}
            <Box
              ref={scrollContainerRef}
              sx={{
                display: "flex",
                flexDirection: "row",
                overflowX: "scroll",
                scrollBehavior: "smooth",
                // Scroll Snap
                scrollSnapType: "x mandatory",
                // Opcional: ocultar scrollbar
                "::-webkit-scrollbar": { display: "none" },
                msOverflowStyle: "none",
                scrollbarWidth: "none",
              }}
            >
              {cupos.map((cupo, i) => (
                <Box
                  key={i}
                  sx={{
                    flex: "0 0 100%", // cada cupo ocupa todo el ancho
                    scrollSnapAlign: "center", // se alinea al centro
                    padding: 2,
                    textAlign: "center",
                  }}
                >
                  <Typography variant="subtitle2" color="#90979f">
                    Fecha: {cupo.fecha}
                  </Typography>
                  <Typography variant="subtitle2" color="#90979f">
                    Turnos confirmados: {cupo.turnos?.length} ⛟
                  </Typography>
                  <Typography variant="subtitle2" color="#90979f">
                    Turnos restantes: {cupo.cupos} ⛟
                  </Typography>
                </Box>
              ))}
            </Box>

            {/* Flecha derecha */}
            <IconButton
              onClick={handleScrollRight}
              sx={{
                position: "absolute",
                right: 0,
                top: "50%",
                transform: "translateY(-50%)",
                zIndex: 1,
              }}
            >
              <ArrowForwardIosIcon />
            </IconButton>
          </>
        )}
      </Box>
    </>
  );
}
