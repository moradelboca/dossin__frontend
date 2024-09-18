import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import useMediaQuery from "@mui/material/useMediaQuery";
import Carousel, { carouselClasses } from "./Carousel";
import CardUbicacion, { CardBody } from "./Card";
import { useTheme } from "@mui/material";

export default {
  title: "Examples",
};

function getCommonProps(showSlides: number) {
  return {
    renderPrev: (btnProps: any) => (
      <Button variant="contained" {...btnProps}>
        Prev
      </Button>
    ),
    renderNext: (btnProps: any) => (
      <Button variant="contained" {...btnProps}>
        Next
      </Button>
    ),
    renderDot: ({ selected, index }: any) => (
      <Button variant={selected ? "contained" : "outlined"}>{index}</Button>
    ),
    dots: true,
    showSlides,
    speed: 1000,
    spacing: 2,
    autoPlay: false,
    infinity: true,
    pauseOnHover: true,
    disableTransition: false,
  };
}

export function CarouselUbis() {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const isMediumScreen = useMediaQuery(theme.breakpoints.down("md"));

  const showSlides = isSmallScreen ? 1 : isMediumScreen ? 2 : 3;

  return (
    <Box
      sx={{
        p: 5,
        width: "100%",
        boxSizing: "border-box",
        maxWidth: "100vw", // Limitar el ancho máximo del contenedor al 100% de la ventana
        overflow: "hidden", // Evita el scroll horizontal
        margin: "0 auto", // Centra el contenedor
        display: "flex",
        justifyContent: "center", // Asegura que el carrusel esté centrado
      }}
    >
      <Carousel
        {...getCommonProps(showSlides)}
        sx={{
          mt: 3,
          height: "auto",
          maxWidth: "1200px", // Limitar el ancho del carrusel
          width: "100%", // Adaptar el carrusel al ancho disponible
          [`& .${carouselClasses.dots}`]: {
            mt: 5,
          },
          [`& .${carouselClasses.item} > *`]: {
            transition: "all 0.5s",
            transform: "scale(0.9)",
            minWidth: "250px", // Tamaño mínimo de la tarjeta
            maxWidth: "350px", // Tamaño máximo de la tarjeta
            height: "auto", // Ajustar la altura automáticamente
          },
          [`& .${carouselClasses.center} > *`]: {
            transform: "scale(1)",
          },
        }}
        spacing={4}
        centerMode
      >
        {/* Tarjetas del carrusel */}
        <CardUbicacion>
          <CardBody
            titleUbis="Cordoba - Rosario"
            titleFechas="10/20 de Agosto"
            textTarifa="31.000"
            textKm="401"
            textCamion="Semi, Batea"
            textHrCarga="9:00 / 18:00"
            textHrDescarga="8:00 / 20:00"
            imagen="https://images.pexels.com/photos/20787/pexels-photo.jpg?auto=compress&cs=tinysrgb&h=350"
          />
        </CardUbicacion>
        <CardUbicacion>
          <CardBody
            titleUbis="Cordoba - Rosario"
            titleFechas="10/20 de Agosto"
            textTarifa="31.000"
            textKm="401"
            textCamion="Semi, Batea"
            textHrCarga="9:00 / 18:00"
            textHrDescarga="8:00 / 20:00"
            imagen="https://images.pexels.com/photos/20787/pexels-photo.jpg?auto=compress&cs=tinysrgb&h=350"
          />
        </CardUbicacion>
        <CardUbicacion>
          <CardBody
            titleUbis="Cordoba - Rosario"
            titleFechas="10/20 de Agosto"
            textTarifa="31.000"
            textKm="401"
            textCamion="Semi, Batea"
            textHrCarga="9:00 / 18:00"
            textHrDescarga="8:00 / 20:00"
            imagen="https://images.pexels.com/photos/20787/pexels-photo.jpg?auto=compress&cs=tinysrgb&h=350"
          />
        </CardUbicacion>
        <CardUbicacion>
          <CardBody
            titleUbis="Cordoba - Rosario"
            titleFechas="10/20 de Agosto"
            textTarifa="31.000"
            textKm="401"
            textCamion="Semi, Batea"
            textHrCarga="9:00 / 18:00"
            textHrDescarga="8:00 / 20:00"
            imagen="https://images.pexels.com/photos/20787/pexels-photo.jpg?auto=compress&cs=tinysrgb&h=350"
          />
        </CardUbicacion>
      </Carousel>
    </Box>
  );
}
