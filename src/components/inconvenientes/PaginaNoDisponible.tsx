import Box from "@mui/material/Box";
import { Container, Typography } from "@mui/material";

export default function PaginaNoDisponible() {
    return (
        <Box
            sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "80vh",
            }}
        >
            <Container
                maxWidth="sm"
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                }}
            >
                <img
                    src="https://i.imgur.com/9GlWdvW.png"
                    alt="Página no encontrada"
                    width="400"
                />
                <Typography variant="h4" align="center" gutterBottom>
                    Página no disponible
                </Typography>
                <Typography variant="body1" align="center">
                    Lo sentimos, pero la página que estás buscando no está
                    disponible en este momento.
                </Typography>
            </Container>
        </Box>
    );
}
