//import React from 'react'
import { Box, Grid, Button, Typography } from "@mui/material";
import hermes from "../../assets/hermes1.jpg";
import { Google } from "@mui/icons-material";

const PantallaLogin = () => {
  return (
    <Grid container sx={{ height: "100vh" }}>
      {/* Lado de la imagen */}
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

      {/* Lado del login */}
      <Grid
        item
        xs={12}
        md={6}
        container
        alignItems="center"
        justifyContent="center"
      >
        <Box textAlign="center" p={4}>
          <Typography variant="h4" gutterBottom>
            ¡Bienvenido!
          </Typography>
          <Typography variant="body1" mb={3}>
            Iniciá sesión con tu cuenta de Google
          </Typography>
          <Button
            variant="contained"
            startIcon={<Google />}
            color="primary"
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
