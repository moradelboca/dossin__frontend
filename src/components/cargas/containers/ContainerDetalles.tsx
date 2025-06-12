import { Box, IconButton, Typography } from "@mui/material";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import { useContext, useRef } from "react";
import { ContextoCargas } from "./ContainerTajetasCargas";

export default function ContainerDetalles() {
  const { cargaSeleccionada } = useContext(ContextoCargas);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Funciones para desplazar el slider
  const handleScrollLeft = () => {
    if (!scrollContainerRef.current) return;
    const container = scrollContainerRef.current;
    const width = container.clientWidth;
    container.scrollTo({
      left: container.scrollLeft - width,
      behavior: "smooth",
    });
  };

  const handleScrollRight = () => {
    if (!scrollContainerRef.current) return;
    const container = scrollContainerRef.current;
    const width = container.clientWidth;
    container.scrollTo({
      left: container.scrollLeft + width,
      behavior: "smooth",
    });
  };

  // Armar el array de slides utilizando los datos de cargaSeleccionada.
  // Si algún dato es null se muestra "No especificado".
  const slides: {
    title: string;
    horaInicio: string;
    horaFin: string;
    ubicacion: string;
  }[] = [];

  if (cargaSeleccionada) {
    // Slide para Carga
    slides.push({
      title: "Carga",
      horaInicio: cargaSeleccionada.horaInicioCarga || "No especificado",
      horaFin: cargaSeleccionada.horaFinCarga || "No especificado",
      ubicacion: cargaSeleccionada.ubicacionCarga
        ? cargaSeleccionada.ubicacionCarga.nombre
        : "No especificado",
    });

    // Slide para Descarga
    slides.push({
      title: "Descarga",
      horaInicio: cargaSeleccionada.horaInicioDescarga || "No especificado",
      horaFin: cargaSeleccionada.horaFinDescarga || "No especificado",
      ubicacion: cargaSeleccionada.ubicacionDescarga
        ? cargaSeleccionada.ubicacionDescarga.nombre
        : "No especificado",
    });

    // Slide para Balanza (solo si alguno de sus datos existe)
    if (
      cargaSeleccionada.horaInicioBalanza ||
      cargaSeleccionada.horaFinBalanza ||
      cargaSeleccionada.ubicacionBalanza
    ) {
      slides.push({
        title: "Balanza",
        horaInicio: cargaSeleccionada.horaInicioBalanza || "No especificado",
        horaFin: cargaSeleccionada.horaFinBalanza || "No especificado",
        ubicacion: cargaSeleccionada.ubicacionBalanza
          ? cargaSeleccionada.ubicacionBalanza.nombre
          : "No especificado",
      });
    }
  }

  return (
    <>
      {/* Encabezado sin botón de agregar */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          width: "100%", // Para ubicar flechas superpuestas
          marginTop: 2,
        }}
      >
        <Typography>Horarios</Typography>
      </Box>

      {/* Contenedor principal del slider de detalles */}
      <Box
        sx={{
          width: "100%",
          borderRadius: "16px",
          border: "1px solid #ccc",
          position: "relative",
          paddingY: 2,
        }}
      >
        {slides.length === 0 ? (
          <Typography variant="subtitle2" sx={{ margin: 2 }} color="#90979f">
            No hay detalles disponibles.
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
                scrollSnapType: "x mandatory",
                "::-webkit-scrollbar": { display: "none" },
                msOverflowStyle: "none",
                scrollbarWidth: "none",
              }}
            >
              {slides.map((slide, i) => (
                <Box
                  key={i}
                  sx={{
                    flex: "0 0 100%",
                    scrollSnapAlign: "center",
                    padding: 2,
                    textAlign: "center",
                  }}
                >
                  <Typography variant="subtitle2" color="#90979f">
                    Hora inicio {slide.title}: {slide.horaInicio}
                  </Typography>
                  <Typography variant="subtitle2" color="#90979f">
                    Hora fin {slide.title}: {slide.horaFin}
                  </Typography>
                  <Typography variant="subtitle2" color="#90979f">
                    Ubicación {slide.title}: {slide.ubicacion}
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
