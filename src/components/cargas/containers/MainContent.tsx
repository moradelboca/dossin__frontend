import React from "react";
import { Box, Typography, IconButton, Divider, Grid } from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import ContainerMapa from "./ContainerMapa";
import ContainerProximosCupos from "./ContainterProximosCupos";
import ContainerInformacionCarga from "./ContainerInformacionCarga";
import ContainerDetalles from "./ContainerDetalles";

interface MainContentProps {
  cargaSeleccionada: any;
  onDeleteCarga: () => void;
}

const MainContent: React.FC<MainContentProps> = ({
  cargaSeleccionada,
  onDeleteCarga,
}) => {
  return (
    <Box
      sx={{
        maxWidth: "100%",
        height: "100%",
        borderRadius: "16px",
        flex: 1,
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#ffffff",
        overflowY: "auto",
        overflowX: "hidden",
      }}
    >
      <Box
        sx={{
          paddingLeft: "24px",
          paddingTop: "12px",
          paddingRight: "24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          width: "100%",
          maxWidth: "100%",
          flexWrap: "wrap",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography variant="h6" color="#90979f">
            Carga ID:
          </Typography>
          <Typography variant="h6">
            {`#${cargaSeleccionada?.id || " "}`}
          </Typography>
        </Box>
        <IconButton disabled={!cargaSeleccionada} onClick={onDeleteCarga}>
          <DeleteOutlineIcon sx={{ fontSize: 20, color: "#d68384" }} />
        </IconButton>
      </Box>
      <Divider sx={{ marginTop: 1, marginBottom: "1rem" }} />
      <Grid container direction="column" sx={{ height: "100%" }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            borderRadius: "16px",
            height: "60%",
            width: "100%",
            flexWrap: "wrap",
            paddingX: "16px",
            gap: "0.5rem",
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              width: "60%",
              height: "100%",
            }}
          >
            <ContainerMapa />
          </Box>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              flex: 1,
              alignItems: "center",
              width: "40%",
              height: "100%",
            }}
          >
            <ContainerProximosCupos />
          </Box>
        </Box>
        <Box
          sx={{
            maxWidth: "100%",
            borderRadius: "16px",
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            backgroundColor: "#ffffff",
            width: "100%",
            height: "40%",
            p: "1rem",
            gap: "0.5rem",
          }}
        >
          <Box
            sx={{
              width: { xs: "100%", md: "60%" },
              height: "100%",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <ContainerInformacionCarga />
          </Box>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              width: { xs: "100%", md: "40%" },
              height: "100%",
            }}
          >
            <ContainerDetalles />
          </Box>
        </Box>
      </Grid>
    </Box>
  );
};

export default MainContent;
