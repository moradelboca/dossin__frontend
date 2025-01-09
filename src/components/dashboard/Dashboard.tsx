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

  const tarjetasPrincipales = [
    { title: "Toneladas totales transportadas", value: stats.toneladasTotales, unidad: "Toneladas" },
    { title: "Tiempo promedio de asignación de carga", value: stats.tiempoPromedioAsignacion },
    { title: "Promedio de tarifa de transporte", value: stats.tarifaPromedio },
    { title: "Cantidad de inconvenientes", value: stats.inconvenientes },
  ];

  const tarjetasSecundarias = [
    { title: "CO2 Emitido", value: stats.co2Emitido, unidad: "Toneladas" },
    { title: "Tiempo promedio de resolución de inconvenientes", value: stats.tiempoResolucion },
    { title: "Tiempo promedio de confirmación de carga", value: stats.tiempoConfirmacion },
    { title: "Choferes nuevos en realizar carga", value: stats.choferesNuevos },
  ];

  const cardStyles = {
    titleSize: "0.7rem",
    valueSize: "1.1rem",
    cardPadding: "1rem 1rem 0.4rem 1rem",
  };

  return (
    <Box
      sx={{
        backgroundColor: theme.colores.grisClaro,
        height: "91vh",
        width: "100%",
        padding: 2,
      }}
    >
      {/* Título*/}
      <Typography
        variant="h5"
        sx={{
          color: theme.colores.azul,
          fontWeight: "bold",
          mb: 2,
          fontSize: "2rem",
          pb: 1,
          ml: 1,
        }}
      >
        Dashboard
      </Typography>

      {/* Grid principal */}
      <Box
        display="grid"
        gridTemplateColumns="repeat(6, 1fr)"
        gridTemplateRows="180px 1fr 1fr"
        gap="20px"
        sx={{ height: "100%" }}
      >
        {/* Primera sección: Tarjetas principales */}
        <Box
          gridColumn="span 4"
          gridRow="span 1"
          display="grid"
          gridTemplateColumns="repeat(4, 1fr)"
          gap="10px"
          sx={{
            backgroundColor: theme.colores.gris,
            padding: 1,
            borderRadius: 2,
          }}
        >
          {tarjetasPrincipales.map((card, index) => (
            <DashboardCard key={index} {...card} />
          ))}
        </Box>

        {/* Segunda sección: Tarjetas secundarias */}
        <Box
          gridColumn="span 2"
          gridRow="span 1"
          display="grid"
          gridTemplateColumns="repeat(2, 1fr)"
          gridTemplateRows="1fr 1fr"
          gap="6px"
          sx={{
            backgroundColor: theme.colores.gris,
            padding: 1,
            borderRadius: 2,
          }}
        >
          {tarjetasSecundarias.map((card, index) => (
            <DashboardCard key={index} {...card} {...cardStyles} />
          ))}
        </Box>

        {/* Segunda fila: Gráficos e historial */}
        <Box
          gridColumn="span 4"
          gridRow="2 / span 2"
          display="grid"
          gridTemplateColumns="repeat(2, 1fr)"
          gap="10px"
          sx={{
            backgroundColor: theme.colores.gris,
            padding: 1,
            borderRadius: 2,
          }}
        >
          <DashboardGraficos opcion="cargas" />
          <DashboardGraficos opcion="dias" />
        </Box>

        {/* Historial*/}
        <Box
          gridColumn="span 2"
          gridRow="2 / span 2"
          sx={{
            backgroundColor: theme.colores.gris,
            padding: 1,
            borderRadius: 2,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            height: "100%",
          }}
        >
          <HistorialTurnos />
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;
