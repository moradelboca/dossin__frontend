import React, { useContext } from "react";
import { Box, Typography } from "@mui/material";
import { ContextoGeneral } from "../Contexto";
import DashboardCard from "../cards/Dashboard/DashboardCard";
import HistorialTurnos from "./HistorialTurnos";
import DashboardGraficos from "./DashboardGraficos";

const Dashboard: React.FC = () => {
  const { theme } = useContext(ContextoGeneral);
  const stats = {
    toneladasTotales: 25,
    tiempoPromedioAsignacion: "2 hs 30 min",
    tarifaPromedio: "$100.000",
    inconvenientes: 15,
    co2Emitido: 1,
    tiempoResolucion: "2 hs 30 min",
    tiempoConfirmacion: "2 hs 30 min",
    choferesNuevos: 5,
  };

  return (
    <>
      <Box
        sx={{
          backgroundColor: theme.colores.grisClaro,
          height: "91vh",
          width: "100%",
          padding: 3,
        }}
      >
        {/* Título del dashboard */}
        <Typography
          variant="h5"
          component="div"
          sx={{
            color: theme.colores.azul,
            fontWeight: "bold",
            mb: 2,
            fontSize: "2rem",
            pb: 1,
            marginLeft: 1,
          }}
        >
          Dashboard
        </Typography>

        {/* Grid principal */}
        <Box
          display="grid"
          gridTemplateColumns="repeat(6, 1fr)" // Grid general de 6 columnas
          gridTemplateRows="180px 1fr 1fr 1fr" // Grid general de 4 filas
          gap="20px"
          sx={{ height: "100%" }} // Altura para distribuir filas proporcionalmente
        >
          {/* Primera fila */}
          {/* Primera sección (4 columnas, 4 tarjetas) */}
          <Box
            gridColumn="span 4" // Ocupa 4 columnas
            gridRow="span 1" // Ocupa 1 fila
            display="grid"
            gridTemplateColumns="repeat(4, 1fr)" // Grid interno de 4 columnas
            gap="10px"
            backgroundColor={theme.colores.gris}
            padding="8px"
            borderRadius="12px"
          >
            <DashboardCard
              title="Toneladas totales transportadas"
              value={stats.toneladasTotales}
              unidad="Toneladas"
            />
            <DashboardCard
              title="Tiempo promedio de asignación de carga"
              value={stats.tiempoPromedioAsignacion}
            />
            <DashboardCard
              title="Promedio de tarifa de transporte"
              value={stats.tarifaPromedio}
            />
            <DashboardCard
              title="Cantidad de inconvenientes"
              value={stats.inconvenientes}
            />
          </Box>

          {/* Segunda sección (2 columnas, 4 tarjetas) */}
          <Box
            gridColumn="span 2" // Ocupa 2 columnas
            gridRow="span 1" // Ocupa 1 fila
            display="grid"
            gridTemplateColumns="repeat(2, 1fr)" // Grid interno de 2 columnas
            gridTemplateRows="1fr 1fr"
            gap="6px"
            backgroundColor={theme.colores.gris}
            padding="8px"
            borderRadius="12px"
          >
            <DashboardCard
              title="CO2 Emitido"
              value={stats.co2Emitido}
              unidad="Toneladas"
              titleSize="0.7rem"
              valueSize="1.1rem"
              cardPadding="1rem 1rem 0.4rem 1rem"
            />
            <DashboardCard
              title="Tiempo promedio de resolución de inconvenientes"
              value={stats.tiempoResolucion}
              titleSize="0.7rem"
              valueSize="1.1rem"
              cardPadding="1rem 1rem 0.4rem 1rem"
            />
            <DashboardCard
              title="Tiempo promedio de confirmación de carga"
              value={stats.tiempoConfirmacion}
              titleSize="0.7rem"
              valueSize="1.1rem"
              cardPadding="1rem 1rem 0.4rem 1rem"
            />
            <DashboardCard
              title="Choferes nuevos en realizar carga"
              value={stats.choferesNuevos}
              titleSize="0.7rem"
              valueSize="1.1rem"
              cardPadding="1rem 1rem 0.4rem 1rem"
            />
          </Box>

          {/* Segunda fila: tres secciones, 2 columnas cada una */}
          <Box
            gridColumn="span 2"
            gridRow="2 / span 3" // Ocupa 3 filas
            display="grid"
            gridTemplateColumns="1fr"
            gap="10px"
            sx={{ backgroundColor: "#e0f7fa" }} // Solo para visualizar mejor la sección
          >
            <DashboardGraficos></DashboardGraficos>
          </Box>

          <Box
            gridColumn="3 / span 2"
            gridRow="2 / span 3" // Ocupa 3 filas
            display="grid"
            gridTemplateColumns="1fr"
            gap="10px"
            sx={{ backgroundColor: "#fce4ec" }} // Solo para visualizar mejor la sección
          >
            <DashboardGraficos></DashboardGraficos>
          </Box>

          {/* Sección 3 (ahora el componente HistorialTurnos) */}
          <Box
            gridColumn="5 / span 2"
            gridRow="2 / span 3" // Ocupa 3 filas
            display="grid"
            gridTemplateColumns="1fr"
            gap="10px"
            sx={{ backgroundColor: "white" }}
          >
            <HistorialTurnos />
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default Dashboard;
