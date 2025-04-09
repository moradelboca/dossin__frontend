// Dashboard.tsx (fragmento modificado)
import React, { useContext, useEffect, useState } from "react";
import { Box, IconButton } from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import { ContextoGeneral } from "../Contexto";
import DashboardCard from "../cards/Dashboard/DashboardCard";
import HistorialTurnos from "./HistorialTurnos";
import DashboardGraficos from "./DashboardGraficos";
import InconvenientesDialog from "../dialogs/dashboard/InconvenientesDialog";
import DashboardColaboradoresDialog from "../dialogs/dashboard/DashboardColaboradoresDialog";

const Dashboard: React.FC = () => {
  const { dashboardURL, theme } = useContext(ContextoGeneral);
  const [co2Emitido, setCo2Emitido] = useState<number>(0);
  const [tarifaPromedio, setTarifaPromedio] = useState<string>("$0");

  const [tiempoAsignacion, setTiempoAsignacion] = useState<string>("0 min");
  const [tiempoConfirmacion, setTiempoConfirmacion] = useState<string>("0 min");
  const [tiempoInconvenientes, setTiempoInconvenientes] = useState<string>("0 min");

  const [colaboradores, setColaboradores] = useState<any>();
  const [openColaboradoresDialog, setOpenColaboradoresDialog] = useState<boolean>(false);

  const [inconvenientes, setInconvenientes] = useState<any>();
  const [openInconvenientesDialog, setOpenInconvenientesDialog] = useState<boolean>(false);

  const [toneladasTransportadas, setToneladasTransportadas] = useState<string>("0 t");

  const fetchOptions = {
    headers: {
      "Content-Type": "application/json",
      "ngrok-skip-browser-warning": "true"
    }
  };

  // Función para formatear el tiempo
  const formatTiempo = (dias: number, horas: number, minutos: number) => {
    const parts = [];
    if (dias > 0) parts.push(`${dias} día${dias !== 1 ? 's' : ''}`);
    if (horas > 0) parts.push(`${horas} hs`);
    if (minutos > 0 || parts.length === 0) parts.push(`${minutos} min`);
    return parts.join(' ');
  };

  useEffect(() => {
    // Fetch CO2
    fetch(`${dashboardURL}/turnos/co2`, fetchOptions)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => setCo2Emitido(parseFloat(data.TotalCo2.split(' ')[0]) / 1000))
      .catch(() => setCo2Emitido(0));

    // Fetch Tarifa Promedio
    fetch(`${dashboardURL}/cargas/promedio`, fetchOptions)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => setTarifaPromedio(data.promedio))
      .catch(() => setTarifaPromedio("$0"));

    // Fetch Tiempo Asignación
    fetch(`${dashboardURL}/turnos/promedio-asignacion`, fetchOptions)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => setTiempoAsignacion(
        formatTiempo(data.promedio.dias, data.promedio.horas, data.promedio.minutos)
      ))
      .catch(() => setTiempoAsignacion("0 min"));

    
    // Fetch Tiempo Confirmación
    fetch(`${dashboardURL}/turnos/promedio-confirmacion`, fetchOptions)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => setTiempoConfirmacion(
        formatTiempo(data.promedio.dias, data.promedio.horas, data.promedio.minutos)
      ))
      .catch(() => setTiempoConfirmacion("0 min"));

    // Fetch Tiempo Inconvenientes
    fetch(`${dashboardURL}/inconvenientes/promedio`, fetchOptions)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => setTiempoInconvenientes(
        formatTiempo(data.promedio.dias, data.promedio.horas, data.promedio.minutos)
      ))
      .catch(() => setTiempoInconvenientes("0 min"));

    // Fetch Colaboradores 
    fetch(`${dashboardURL}/colaboradores/nuevos`, fetchOptions)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => setColaboradores(data))
      .catch(error => console.error("Error fetching colaboradores", error));

    // Fetch Inconvenientes
    fetch(`${dashboardURL}/inconvenientes`, fetchOptions)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => setInconvenientes(data))
      .catch((error) => console.error("Hubo un error con inconvenientes", error));

    // Fetch Toneladas Transportadas
    fetch(`${dashboardURL}/turnos/toneladas`, fetchOptions)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => setToneladasTransportadas(data.Toneladas)) // Usamos directamente el string formateado
      .catch(() => setToneladasTransportadas("0 t"));

  }, [dashboardURL]);

  const tarjetasPrincipales = [
    { title: "Toneladas totales transportadas", value: toneladasTransportadas },
    { title: "Tiempo promedio de asignación de carga", value: tiempoAsignacion },
    { title: "Promedio de tarifa de transporte", value: tarifaPromedio },
    // En la card de inconvenientes agregamos un contenedor para el botón +
    { title: "Cantidad de inconvenientes", value: inconvenientes ? inconvenientes.TotalInconvenientes : 0},
  ];

  const tarjetasSecundarias = [
    { title: "CO2 Emitido", value: co2Emitido, unidad: "Toneladas" },
    { title: "Tiempo promedio de resolución de inconvenientes", value: tiempoInconvenientes },
    { title: "Tiempo promedio de confirmación de carga", value: tiempoConfirmacion },
    { title: "Colaboradores nuevos", value: colaboradores ? colaboradores.Cantidad : 0 },
  ];

  const cardStyles = {
    titleSize: "0.7rem",
    valueSize: "1.1rem",
    cardPadding: "1rem 1rem 0.4rem 1rem",
  };
  console.log(inconvenientes);
  return (
    <Box
      sx={{
        backgroundColor: theme.colores.grisClaro,
        height: "91vh",
        width: "100%",
        padding: 2,
      }}
    >
      {/* Grid principal */}
      <Box
        display="grid"
        gridTemplateColumns={{
          xs: "repeat(4, 1fr)",
          md: "repeat(6, 1fr)",
          lg: "repeat(6, 1fr)"
        }}
        gridTemplateRows={{
          xs: "auto auto auto auto",
          lg: "180px minmax(400px, 1fr)" // Altura mínima para la sección inferior
        }}
        gap="20px"
        sx={{ height: "100%" }}
      >
        {/* Tarjetas Principales */}
        <Box
          gridColumn={{
            xs: "span 4",
            md: "span 6",
            lg: "span 4"
          }}
          gridRow="auto"
          display="grid"
          gridTemplateColumns={{
            xs: "1fr",        // En mobile, cada card ocupa toda la fila
            md: "repeat(4, 1fr)"
          }}
          gap="10px"
          sx={{
            backgroundColor: theme.colores.gris,
            padding: 1,
            borderRadius: 2,
          }}
        >
          {tarjetasPrincipales.map((card, index) => {
            if (card.title === "Cantidad de inconvenientes") {
              return (
                <Box key={index} sx={{ position: "relative" }}>
                  <DashboardCard {...card} />
                  <IconButton
                    size="small"
                    onClick={() => setOpenInconvenientesDialog(true)}
                    sx={{
                      position: "absolute",
                      top: 8,
                      right: 8,
                      color: theme.colores.gris,
                    }}
                  >
                    <AddIcon />
                  </IconButton>
                </Box>
              );
            }
            return <DashboardCard key={index} {...card} />;
          })}
        </Box>
        
        {/* Tarjetas Secundarias */}
        <Box
          gridColumn={{
            xs: "span 4",
            md: "span 6",
            lg: "span 2"
          }}
          gridRow="auto"
          display="grid"
          gridTemplateColumns={{
            xs: "1fr",         // Una sola columna en mobile
            md: "repeat(4, 1fr)",
            lg: "repeat(2, 1fr)"
          }}
          gridTemplateRows={{
            xs: "auto",
            md: "auto",
            lg: "1fr 1fr"
          }}
          gap="6px"
          sx={{
            backgroundColor: theme.colores.gris,
            padding: 1,
            borderRadius: 2,
          }}
        >
          {tarjetasSecundarias.map((card, index) => (
            card.title === "Colaboradores nuevos" ? (
              <Box key={index} sx={{ position: "relative" }}>
                <DashboardCard {...card} {...cardStyles} />
                <IconButton
                  size="small"
                  onClick={() => setOpenColaboradoresDialog(true)}
                  sx={{
                    position: "absolute",
                    top: 8,
                    right: 8,
                    color: theme.colores.gris,
                  }}
                >
                  <AddIcon />
                </IconButton>
              </Box>
            ) : (
              <DashboardCard key={index} {...card} {...cardStyles} />
            )
          ))}
        </Box>
        
        {/* Sección de Gráficos */}
        {/* Gráficos */}
        <Box
          gridColumn={{
            xs: "span 4",
            md: "span 6",
            lg: "span 4"
          }}
          gridRow={{
            xs: "auto",
            md: "auto",
            lg: "2 / span 2"
          }}
          display="grid"
          gridTemplateColumns={{
            xs: "1fr",
            md: "repeat(2, 1fr)",
            lg: "repeat(2, 1fr)"
          }}
          gap="10px"
          sx={{
            backgroundColor: theme.colores.gris,
            padding: 1,
            borderRadius: 2,
          }}
        >
          <DashboardGraficos opcion="cargas" />
          <DashboardGraficos opcion="fechas" />
        </Box>
        
        {/* Historial */}
        <Box
          gridColumn={{
            xs: "span 4",
            md: "span 6",
            lg: "span 2"
          }}
          gridRow={{
            xs: "auto",
            md: "auto",
            lg: 2
          }}
          sx={{
            backgroundColor: theme.colores.gris,
            padding: 1,
            borderRadius: 2,
            height: '100%',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <HistorialTurnos />
        </Box>
      </Box>


      {/* Diálogo de inconvenientes */}
      <InconvenientesDialog
        open={openInconvenientesDialog}
        handleClose={() => setOpenInconvenientesDialog(false)}
        inconvenientes={inconvenientes}
      />
      <DashboardColaboradoresDialog
        open={openColaboradoresDialog}
        handleClose={() => setOpenColaboradoresDialog(false)}
        colaboradores={colaboradores}
      />
    </Box>
  );
};

export default Dashboard;
