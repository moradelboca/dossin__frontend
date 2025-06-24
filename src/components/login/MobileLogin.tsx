import { Box, Button, Typography, Dialog, DialogContent } from "@mui/material";
import hermes from "../../assets/hermes.jpg";
import hermes1 from "../../assets/hermes1.jpg";
import hermes3 from "../../assets/hermes3.jpg";
import hermes4 from "../../assets/hermes4.jpg";
import hermes5 from "../../assets/hermes5.jpg";
import hermex from "../../assets/hermex.png";
import { Google } from "@mui/icons-material";
import { useContext, useState, useEffect } from "react";
import { ContextoGeneral } from "../Contexto";
import { useSearchParams } from "react-router-dom";

const MobileLogin = () => {
  const { theme } = useContext(ContextoGeneral);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const images = [hermes, hermes1, hermes3, hermes4, hermes5];
  const [searchParams] = useSearchParams();
  const estado = searchParams.get("estado");

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  return (
    <Box
      sx={{
        position: "relative",
        minHeight: "100vh",
        width: "100vw",
        overflow: "hidden",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        justifyContent: "stretch",
        alignItems: "stretch",
        backgroundColor: "#000",
      }}
    >
      {/* Fondo con imágenes en transición */}
      {images.map((img, index) => (
        <Box
          key={index}
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            height: "100vh",
            width: "100vw",
            backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.6)), url(${img})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: currentImageIndex === index ? 1 : 0,
            transition: "opacity 1.5s ease-in-out",
            zIndex: 0,
            pointerEvents: "none",
          }}
        />
      ))}

      {/* Contenido principal */}
      <Box
        sx={{
          position: "relative",
          zIndex: 1,
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          alignItems: "center",
          minHeight: 0,
          padding: { xs: "16px 8px 8px 8px", sm: "24px 16px 16px 16px" },
          boxSizing: "border-box",
        }}
      >
        {/* Logo en la parte superior */}
        <Box sx={{ mt: 2, mb: 2 }}>
          <img
            src={hermex}
            alt="Hermex Logo"
            style={{
              width: "160px",
              height: "auto",
              maxWidth: "80vw",
              filter:
                "drop-shadow(0 0 30px rgba(255,255,255,0.7)) drop-shadow(0 0 15px rgba(255,255,255,0.8))",
            }}
          />
        </Box>

        {/* Texto centrado */}
        <Box sx={{ textAlign: "center", flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <Typography
            variant="h5"
            sx={{
              color: "white",
              fontWeight: "700",
              textShadow: "0px 2px 4px rgba(0,0,0,0.5)",
              marginBottom: "0.5rem",
              letterSpacing: "1px",
            }}
          >
            UN MEDIO PARA UN FIN
          </Typography>
          <Typography
            variant="subtitle1"
            sx={{
              color: "white",
              textShadow: "0px 2px 4px rgba(0,0,0,0.5)",
            }}
          >
            TRANSPORTA TUS MEJORES MOMENTOS
          </Typography>
        </Box>

        {/* Botón de sign in fijo abajo */}
        <Box
          sx={{
            width: "100%",
            maxWidth: "320px",
            textAlign: "center",
            mb: 2,
          }}
        >
          <Button
            variant="contained"
            sx={{
              backgroundColor: "white",
              color: theme.colores.azul,
              borderRadius: "30px",
              paddingX: "2rem",
              paddingY: "0.8rem",
              textTransform: "none",
              fontWeight: "600",
              fontSize: "1rem",
              width: "100%",
              boxShadow: "0px 4px 12px rgba(0,0,0,0.4)",
              "&:hover": {
                backgroundColor: "#f0f0f0",
                boxShadow: "0px 6px 15px rgba(0,0,0,0.5)",
              },
            }}
            onClick={handleOpenDialog}
          >
            SIGN IN
          </Button>
        </Box>
         {/* Mostrar mensaje si existe el query param 'estado' */}
        {estado && (
          <Typography variant="body1" mb={2} sx={{ color: '#000000' }}>
            Su cuenta no se encontró. Por favor, comuníquese con un administrador.
          </Typography>
        )}
      </Box>

      {/* Diálogo para el inicio de sesión */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        PaperProps={{
          sx: {
            borderRadius: "20px",
            maxWidth: "350px",
            width: "100%",
            margin: "16px",
          },
        }}
      >
        <DialogContent sx={{ padding: "2rem", textAlign: "center" }}>
          <Typography
            variant="h5"
            sx={{
              color: theme.colores.azul,
              fontWeight: "600",
              marginBottom: "1.5rem",
            }}
          >
            SIGN IN
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
              marginTop: "1rem",
              "&:hover": {
                backgroundColor: theme.colores.azul ? theme.colores.azul + "dd" : undefined,
                boxShadow: "0 6px 15px rgba(0,0,0,0.2)",
              },
            }}
            onClick={() =>
              window.open("https://auth.dossin.com.ar/auth/google", "_self")
            }
          >
            Iniciar sesión con Google
          </Button>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default MobileLogin; 
