import { Box, Grid, Button, Typography, useMediaQuery, useTheme as useMuiTheme } from "@mui/material";
import hermes from "../../assets/hermes.jpg";
import hermes1 from "../../assets/hermes1.jpg";
import hermes3 from "../../assets/hermes3.jpg";
import hermes4 from "../../assets/hermes4.jpg";
import hermes5 from "../../assets/hermes5.jpg";
import hermex from "../../assets/hermex.png";
import { Google } from "@mui/icons-material";
import { useContext, useState, useEffect } from "react";
import { ContextoGeneral } from "../Contexto";
import MobileLogin from "./MobileLogin";

const PantallaLogin = () => {
  const { theme } = useContext(ContextoGeneral);
  const muiTheme = useMuiTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const images = [hermes, hermes1, hermes3, hermes4, hermes5];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 5000); // Cambiar imagen cada 5 segundos

    return () => clearInterval(interval);
  }, []);

  // Si es un dispositivo móvil, usar el componente específico para móviles
  if (isMobile) {
    return <MobileLogin />;
  }

  // Versión de escritorio mejorada con control de proporción de imagen
  return (
    <Grid container sx={{ height: "100vh", overflow: "hidden" }}>
      <Grid 
        item 
        xs={12} 
        md={6} 
        sx={{ 
          position: "relative",
          height: "100vh",
          overflow: "hidden"
        }}
      >
        {images.map((img, index) => (
          <Box
            key={index}
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              height: "100%",
              width: "100%",
              backgroundImage: `url(${img})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              opacity: currentImageIndex === index ? 1 : 0,
              transition: "opacity 1.5s ease-in-out",
              zIndex: 1,
              // Esta propiedad evita que la imagen se deforme
              objectFit: "cover",
            }}
          />
        ))}
      </Grid>

      <Grid
        item
        xs={12}
        md={6}
        container
        alignItems="center"
        justifyContent="center"
        sx={{
          height: "100vh",
          backgroundColor: theme.colores.grisClaro || "#f8f9fa",
          boxShadow: "-5px 0 15px rgba(0,0,0,0.1)",
          position: "relative",
          zIndex: 2,
        }}
      >
        <Box 
          textAlign="center" 
          p={4}
          sx={{
            maxWidth: "450px",
            width: "100%",
            borderRadius: "10px",
            padding: "2rem",
          }}
        >
          <Box mb={4}>
            <img
              src={hermex}
              alt="Hermex Logo"
              style={{
                maxWidth: "250px",
                height: "auto",
              }}
            />
          </Box>

          <Typography
            variant="h4"
            gutterBottom
            fontWeight="bold"
            sx={{ 
              color: theme.colores.azul,
              marginBottom: "1rem"
            }}
          >
            ¡Bienvenido a Hermex!
          </Typography>
          <Typography 
            variant="subtitle1" 
            sx={{ 
              color: "text.secondary", 
              mb: 1,
              fontSize: "1.1rem"
            }}
          >
            Empezá tu camino con nosotros
          </Typography>
          <Typography 
            variant="body1" 
            mb={3}
            sx={{
              marginBottom: "2rem",
              color: "text.secondary"
            }}
          >
            Registrate rápidamente con tu cuenta de Google.
          </Typography>
          <Button
            variant="contained"
            startIcon={<Google />}
            fullWidth
            size="large"
            sx={{ 
              backgroundColor: theme.colores.azul,
              borderRadius: "30px",
              padding: "0.8rem",
              textTransform: "none",
              fontSize: "1rem",
              fontWeight: "500",
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              "&:hover": {
                backgroundColor: theme.colores.azul ? theme.colores.azul + "dd" : undefined,
                boxShadow: "0 6px 15px rgba(0,0,0,0.2)",
              }
            }}
            onClick={() =>
              window.open("https://auth.dossin.com.ar/auth/google", "_self")
            }
          >
            Iniciar sesión con Google
          </Button>
        </Box>
      </Grid>
    </Grid>
  );
};

export default PantallaLogin;
