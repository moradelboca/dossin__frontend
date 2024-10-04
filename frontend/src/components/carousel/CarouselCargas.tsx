import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Carousel, { carouselClasses } from "./Carousel";
import { useContext, useEffect, useState } from "react";
import { CardUbicacion } from "../tarjetas/CardUbicacion";
import { ContextoGeneral } from "../Contexto";

function getCommonProps() {
    const { theme } = useContext(ContextoGeneral);
    return {
        renderPrev: (btnProps: any) => (
            <Button
                variant="contained"
                {...btnProps}
                sx={{ background: theme.colores.azul }}
            >
                Anterior
            </Button>
        ),
        renderNext: (btnProps: any) => (
            <Button
                variant="contained"
                {...btnProps}
                sx={{ background: theme.colores.azul }}
            >
                Siguiente
            </Button>
        ),
        renderDot: ({ selected, index }: any) => (
            <Button
                variant={selected ? "contained" : "outlined"}
                sx={{
                    background: selected
                        ? theme.colores.azul
                        : theme.colores.gris,
                    color: selected ? "#fff" : theme.colores.azul,
                    borderColor: theme.colores.azul,
                }}
            >
                {index}
            </Button>
        ),
        dots: true,
        showSlides: 3,
        speed: 500,
        spacing: 2,
        autoPlay: false,
        infinity: true,
        pauseOnHover: true,
        disableTransition: false,
        sx: {},
    };
}

export function CarouselCargas() {
    const { backendURL } = useContext(ContextoGeneral);
    const [cargas, setCargas] = useState<any[]>([]);

    useEffect(() => {
        fetch(`${backendURL}/cargas?incluirAnteriores=true`)
            .then((res) => res.json())
            .then((data) => { setCargas(data) })
            .catch(() => {console.error("Error al obtener las cargas") });
    }, []);

    return (
        <Box sx={{ p: 5, width: "100%", boxSizing: "border-box" }}>
            <Carousel
                {...getCommonProps()}
                sx={{
                    [`& .${carouselClasses.dots}`]: {
                        mt: 5,
                    },
                    [`& .${carouselClasses.item} > *`]: {
                        transition: "all 0.5s",
                        transform: "scale(0.8)",
                    },
                    [`& .${carouselClasses.center} > *`]: {
                        transform: "scale(1)",
                    },
                }}
                spacing={4}
                centerMode
            >
                {cargas.map((carga, i) => (
                    <CardUbicacion
                        key={i}
                        idCarga={carga.id}
                        ubicacionCarga={carga.ubicacionCargaNombre}
                        ubicacionDescarga={carga.ubicacionDescargaNombre}
                        fechaMinima={carga.fechaMinimaDisponible}
                        fechaMaxima={carga.fechaMaximaDisponible}
                        tarifa={carga.tarifa}
                        tipoTarifa={carga.tipoTarifa}
                        tiposAcoplados={carga.tiposDeAcoplados}
                        km={carga.cantidadKm}
                        incluyeIVA={carga.incluyeIVA}
                        horaCarga={carga.horaCarga}
                        horaDescarga={carga.horaDescarga}
                        latitudCarga={carga.latitudCarga}
                        longitudCarga={carga.longitudCarga}
                    />
                ))}
            </Carousel>
        </Box>
    );
}
