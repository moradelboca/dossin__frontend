import { Box, Grid, Button, Typography } from "@mui/material";
import hermes from "../../assets/hermes1.jpg";
import hermex from "../../assets/hermex.svg";
import { Google } from "@mui/icons-material";
import { useContext } from "react";
import { ContextoGeneral } from "../Contexto";

const PantallaLogin = () => {
  const { theme } = useContext(ContextoGeneral);

  return (
    <Grid container sx={{ height: "100vh" }}>
      <Grid item xs={12} md={6}>
        <Box
          sx={{
            height: "100%",
            width: "100%",
            backgroundImage: `url(${hermes})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
      </Grid>

      <Grid
        item
        xs={12}
        md={6}
        container
        alignItems="center"
        justifyContent="center"
      >
        <Box textAlign="center" p={4}>
          <Box mb={3}>
            <img
              src={hermex}
              alt="Hermex Logo"
              style={{
                maxWidth: "300px",
                height: "auto",
              }}
            />
          </Box>

          <Typography
            variant="h3"
            gutterBottom
            fontWeight="bold"
            sx={{ color: theme.colores.azul }}
          >
            ¡Bienvenido a Hermex!
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" mb={1}>
            Empezá tu camino con nosotros
          </Typography>
          <Typography variant="body1" mb={3}>
            Registrate rápidamente con tu cuenta de Google.
          </Typography>
          <Button
            variant="contained"
            startIcon={<Google />}
            sx={{ backgroundColor: theme.colores.azul }}
            onClick={() =>
              window.open("https://auth.dossin.com.ar/auth/google", "_self")
            }
          >
            Sign in with Google
          </Button>
        </Box>
      </Grid>
    </Grid>
  );
};

export default PantallaLogin;
