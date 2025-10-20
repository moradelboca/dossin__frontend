// Dashboard.tsx (fragmento modificado)
import React, { useContext, useEffect, useState } from "react";
import { Box, IconButton, Button } from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import { ContextoGeneral } from "../Contexto";
import { useAuth } from "../autenticacion/ContextoAuth";
import DashboardCard from "../cards/Dashboard/DashboardCard";
import DashboardGraficos from "./DashboardGraficos";
import InconvenientesDialog from "../dialogs/dashboard/InconvenientesDialog";
import DashboardColaboradoresDialog from "../dialogs/dashboard/DashboardColaboradoresDialog";
import dayjs, { Dayjs } from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { Dialog, DialogTitle, DialogContent, DialogActions, Typography } from '@mui/material';
import {  LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import MainButton from '../botones/MainButtom';
import { PickersDay } from '@mui/x-date-pickers/PickersDay';
import 'dayjs/locale/es';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { CargasGeneralesDashboardPrueba } from './CargasGeneralesDashboardPrueba';
import { InconvenientesResolucionPrueba } from "./InconvenientesResolucionPrueba";
import { ColaboradoresNuevosPrueba } from './ColaboradoresNuevosPrueba';
import { inconvenientesPruebaDash } from './inconvenientesPruebaDash';
import ToneladasTotalesMock from "./ToneladasTotalesMock";

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);
dayjs.locale('es');

const quickRanges = [
  { label: '1D', value: '1D' },
  { label: '5D', value: '5D' },
  { label: '1M', value: '1M' },
  { label: '3M', value: '3M' },
  { label: '6M', value: '6M' },
  { label: 'YTD', value: 'YTD' },
  { label: '1A', value: '1A' },
  { label: 'Todos', value: 'ALL' },
];

const today = dayjs();

const getRangeDates = (range: string): [Dayjs, Dayjs] => {
  switch (range) {
    case '1D':
      return [today.subtract(1, 'day'), today];
    case '5D':
      return [today.subtract(5, 'day'), today];
    case '1M':
      return [today.subtract(1, 'month'), today];
    case '3M':
      return [today.subtract(3, 'month'), today];
    case '6M':
      return [today.subtract(6, 'month'), today];
    case 'YTD':
      return [today.startOf('year'), today];
    case '1A':
      return [today.subtract(1, 'year'), today];
    case 'ALL':
    default:
      return [dayjs('1900-01-01'), today];
  }
};

// Componente para customizar el color del día seleccionado
const CustomDay = (props: any) => {
  const { selected } = props;
  const { theme } = useContext(ContextoGeneral);
  return (
    <PickersDay
      {...props}
      sx={selected ? {
        backgroundColor: `${theme.colores.azul} !important`,
        color: '#fff',
        fontWeight: 'bold',
        borderRadius: '50%',
      } : {}}
    />
  );
};

const Dashboard: React.FC = () => {
  const { dashboardURL, theme } = useContext(ContextoGeneral);
  const { user } = useAuth();
  const [co2Emitido, setCo2Emitido] = useState<number>(0);
  const [tarifaPromedio, setTarifaPromedio] = useState<string>("$0");

  const [tiempoInconvenientes, setTiempoInconvenientes] = useState<string>("0 min");

  const [colaboradores, setColaboradores] = useState<any>();
  const [openColaboradoresDialog, setOpenColaboradoresDialog] = useState<boolean>(false);

  const [inconvenientes, setInconvenientes] = useState<any>();
  const [openInconvenientesDialog, setOpenInconvenientesDialog] = useState<boolean>(false);

  const [toneladasTransportadas, setToneladasTransportadas] = useState<string>("0 t");

  const [dateRangeType, setDateRangeType] = useState<string>('3M');
  const [[startDate, endDate], setDateRange] = useState<[Dayjs, Dayjs]>(getRangeDates('3M'));
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [customStart, setCustomStart] = useState<Dayjs>(startDate);
  const [customEnd, setCustomEnd] = useState<Dayjs>(endDate);

  const [calendarMode, setCalendarMode] = useState<'start' | 'end'>('start');

  const fetchOptions = {
    headers: {
      "Content-Type": "application/json",
      "ngrok-skip-browser-warning": "true"
    }
  };

 

  useEffect(() => {
    setDateRange(getRangeDates(dateRangeType));
  }, [dateRangeType]);

  useEffect(() => {
    // Detectar si estamos en local
    const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
    if (isLocal) {
      const data = CargasGeneralesDashboardPrueba;
      // Filtrar por rango de fechas
      const filtered = Array.isArray(data)
        ? data.filter((item: any) => {
            const fecha = dayjs(item.fecha);
            return fecha.isSameOrAfter(startDate, 'day') && fecha.isSameOrBefore(endDate, 'day');
          })
        : [];
      const validTarifas = filtered.filter((item: any) => item.estadisticas && typeof item.estadisticas.tarifaPromedio === 'number');
      const validCO2 = filtered.filter((item: any) => item.estadisticas && typeof item.estadisticas.co2EmitidoPromedio === 'number');
      if (filtered.length > 0 && (validTarifas.length > 0 || validCO2.length > 0)) {
        const totalTarifa = validTarifas.reduce((acc: number, curr: any) => acc + curr.estadisticas.tarifaPromedio, 0);
        const totalCO2 = validCO2.reduce((acc: number, curr: any) => acc + curr.estadisticas.co2EmitidoPromedio, 0);
        setTarifaPromedio(validTarifas.length > 0 ? `$${Math.round(totalTarifa / validTarifas.length)}` : "$0");
        setCo2Emitido(validCO2.length > 0 ? Number((totalCO2 / validCO2.length).toFixed(2)) : 0);
      } else {
        setTarifaPromedio("$0");
        setCo2Emitido(0);
      }
      // Fetch Tiempo Inconvenientes (mock)
      const dataInc = InconvenientesResolucionPrueba;
      let totalSegundos = 0;
      let totalCasos = 0;
      dataInc.forEach((item: any) => {
        const t = item.estadisticas.promedioTiempoResolucion;
        const cantidad = item.estadisticas.cantidadTotal || 0;
        if (t && cantidad > 0) {
          const segundos = (t.dias || 0) * 86400 + (t.horas || 0) * 3600 + (t.minutos || 0) * 60 + (t.segundos || 0);
          totalSegundos += segundos * cantidad;
          totalCasos += cantidad;
        }
      });
      if (totalCasos > 0) {
        const promedio = Math.round(totalSegundos / totalCasos);
        const dias = Math.floor(promedio / 86400);
        const horas = Math.floor((promedio % 86400) / 3600);
        const minutos = Math.floor((promedio % 3600) / 60);
        let texto = '';
        if (dias > 0) texto += `${dias} d `;
        if (horas > 0 || dias > 0) texto += `${horas} hr `;
        texto += `${minutos} min`;
        setTiempoInconvenientes(texto.trim());
      } else {
        setTiempoInconvenientes('0 min');
      }
      // Fetch Colaboradores (mock)
      setColaboradores(ColaboradoresNuevosPrueba);
      // Fetch Inconvenientes (mock)
      const totalInconvenientes = inconvenientesPruebaDash.reduce((acc, curr) => acc + (curr.cantidadTotal || 0), 0);
      setInconvenientes({ lista: inconvenientesPruebaDash, total: totalInconvenientes });
      // Mock toneladas transportadas totales
      const toneladasData = ToneladasTotalesMock;
      setToneladasTransportadas(`${toneladasData.toneladasTotales} t`);
      // No ejecuto ningún fetch real en local
      return;
    } else {
      fetch(`${dashboardURL}/turnos`, fetchOptions)
        .then(r => r.ok ? r.json() : Promise.reject())
        .then(data => {
          // Filtrar por rango de fechas
          const filtered = Array.isArray(data)
            ? data.filter((item: any) => {
                const fecha = dayjs(item.fecha);
                return fecha.isSameOrAfter(startDate, 'day') && fecha.isSameOrBefore(endDate, 'day');
              })
            : [];
          // Filtrar solo los que tengan estadisticas válidas
          const validTarifas = filtered.filter((item: any) => item.estadisticas && typeof item.estadisticas.tarifaPromedio === 'number');
          const validCO2 = filtered.filter((item: any) => item.estadisticas && typeof item.estadisticas.co2EmitidoPromedio === 'number');
          if (filtered.length > 0 && (validTarifas.length > 0 || validCO2.length > 0)) {
            const totalTarifa = validTarifas.reduce((acc: number, curr: any) => acc + curr.estadisticas.tarifaPromedio, 0);
            const totalCO2 = validCO2.reduce((acc: number, curr: any) => acc + curr.estadisticas.co2EmitidoPromedio, 0);
            setTarifaPromedio(validTarifas.length > 0 ? `$${Math.round(totalTarifa / validTarifas.length)}` : "$0");
            setCo2Emitido(validCO2.length > 0 ? Number((totalCO2 / validCO2.length).toFixed(2)) : 0);
          } else {
            setTarifaPromedio("$0");
            setCo2Emitido(0);
          }
        })
        .catch(() => {
          setTarifaPromedio("$0");
          setCo2Emitido(0);
        });
      // Fetch Colaboradores 
      fetch(`${dashboardURL}/choferes/nuevos`, fetchOptions)
        .then(r => r.ok ? r.json() : Promise.reject())
        .then(data => setColaboradores(data))
        .catch(error => console.error("Error fetching colaboradores", error));

      // Fetch Inconvenientes (endpoint real)
      fetch(`${dashboardURL}/inconvenientes`, fetchOptions)
        .then(r => r.ok ? r.json() : Promise.reject())
        .then(data => {
          const total = Array.isArray(data) ? data.reduce((acc, curr) => acc + (curr.cantidadTotal || 0), 0) : 0;
          setInconvenientes({ lista: data, total });
        })
        .catch((error) => console.error("Hubo un error con inconvenientes", error));

      // Fetch Toneladas Transportadas
      fetch(`${dashboardURL}/turnos/toneladas`, fetchOptions)
        .then(r => r.ok ? r.json() : Promise.reject())
        .then(data => setToneladasTransportadas(data.Toneladas)) // Usamos directamente el string formateado
        .catch(() => setToneladasTransportadas("0 t"));

      // Fetch Toneladas Transportadas Totales
      fetch(`${dashboardURL}/toneladas-totales?fechaDesde=${startDate.format('YYYY-MM-DD')}&fechaHasta=${endDate.format('YYYY-MM-DD')}`, fetchOptions)
        .then(r => r.ok ? r.json() : Promise.reject())
        .then(data => setToneladasTransportadas(`${data.toneladasTotales} t`))
        .catch(() => setToneladasTransportadas("0 t"));
    }
  }, [dashboardURL, startDate, endDate]);

  const tarjetasPrincipales = [
    { title: "Toneladas totales transportadas", value: toneladasTransportadas },
    { title: "Tiempo promedio de asignación de carga", value: "" },
    { title: "Promedio de tarifa de transporte", value: tarifaPromedio },
    { title: "Cantidad de inconvenientes", value: inconvenientes ? inconvenientes.total : 0},
  ];

  const tarjetasSecundarias = [
    { title: "CO2 Emitido", value: co2Emitido, unidad: "Toneladas" },
    { title: "Tiempo promedio de resolución de inconvenientes", value: tiempoInconvenientes },
    { title: "Tiempo promedio de confirmación de carga", value: "" },
    { title: "Colaboradores nuevos", value: (() => {
      if (!colaboradores) return 0;
      if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
        return colaboradores.cantidadTotal || 0;
      } else {
        return colaboradores.Cantidad || 0;
      }
    })() },
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
      {/* Filtro de fechas superior */}
      <Box display="flex" alignItems="center" gap={1} mb={2}>
        {quickRanges.map((range) => (
          <Box
            key={range.value}
            sx={{
              px: 1.2,
              py: 0.5,
              borderRadius: 1,
              backgroundColor: dateRangeType === range.value ? theme.colores.azul : 'transparent',
              color: dateRangeType === range.value ? '#fff' : theme.colores.texto,
              fontWeight: dateRangeType === range.value ? 'bold' : 'normal',
              cursor: 'pointer',
              transition: 'background 0.2s',
              fontSize: '0.95rem',
              border: dateRangeType === range.value ? `1px solid ${theme.colores.azul}` : '1px solid transparent',
            }}
            onClick={() => {
              setDateRangeType(range.value);
              setShowDatePicker(false);
            }}
          >
            {range.label}
          </Box>
        ))}
        <Box sx={{ mx: 1, height: 24, borderRight: '1px solid #ccc' }} />
        <IconButton onClick={() => {
          setShowDatePicker(true);
          setCustomStart(startDate);
          setCustomEnd(endDate);
        }}>
          <CalendarMonthIcon />
        </IconButton>
      </Box>

      {/* Modal de rango personalizado */}
      <Dialog open={showDatePicker} onClose={() => setShowDatePicker(false)}>
        <DialogTitle>Seleccionar rango de fechas</DialogTitle>
        <DialogContent>
          <Box display="flex" gap={2} alignItems="center" mt={1}>
            <Box>
              <Typography variant="body2">Desde</Typography>
              <Button
                variant={calendarMode === 'start' ? 'contained' : 'outlined'}
                onClick={() => setCalendarMode('start')}
                sx={{ mb: 1, minWidth: 120, color: calendarMode === 'start' ? '#fff' : theme.colores.azul, backgroundColor: calendarMode === 'start' ? theme.colores.azul : 'transparent', borderColor: theme.colores.azul }}
              >
                {customStart.format('DD/MM/YYYY')}
              </Button>
            </Box>
            <Box>
              <Typography variant="body2">Hasta</Typography>
              <Button
                variant={calendarMode === 'end' ? 'contained' : 'outlined'}
                onClick={() => setCalendarMode('end')}
                sx={{ mb: 1, minWidth: 120, color: calendarMode === 'end' ? '#fff' : theme.colores.azul, backgroundColor: calendarMode === 'end' ? theme.colores.azul : 'transparent', borderColor: theme.colores.azul }}
              >
                {customEnd.format('DD/MM/YYYY')}
              </Button>
            </Box>
          </Box>
          <ThemeProvider theme={createTheme({
            palette: {
              primary: {
                main: theme.colores.azul,
              },
            },
          })}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DateCalendar
                value={calendarMode === 'start' ? customStart : customEnd}
                minDate={calendarMode === 'end' ? customStart : undefined}
                maxDate={calendarMode === 'start' ? customEnd : (user?.rol?.id === 1 ? undefined : dayjs().subtract(1, 'day'))}
                onChange={(date) => {
                  if (!date) return;
                  if (calendarMode === 'start') {
                    setCustomStart(date);
                    if (date.isAfter(customEnd)) setCustomEnd(date);
                  } else {
                    setCustomEnd(date);
                    if (date.isBefore(customStart)) setCustomStart(date);
                  }
                }}
                slots={{
                  day: (dayProps) => (
                    <CustomDay
                      {...dayProps}
                      selected={
                        (calendarMode === 'start' && dayProps.day.isSame(customStart, 'day')) ||
                        (calendarMode === 'end' && dayProps.day.isSame(customEnd, 'day'))
                      }
                    />
                  ),
                }}
              />
            </LocalizationProvider>
          </ThemeProvider>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'flex-end', gap: 2, px: 3, pb: 2 }}>
          <MainButton
            onClick={() => setShowDatePicker(false)}
            text="Cancelar"
            backgroundColor="transparent"
            textColor={theme.colores.azul}
            borderRadius="8px"
            hoverBackgroundColor="rgba(22, 54, 96, 0.1)"
            divWidth="auto"
          />
          <MainButton
            onClick={() => {
              setDateRange([customStart, customEnd]);
              setDateRangeType('');
              setShowDatePicker(false);
            }}
            text="Aplicar"
            backgroundColor={theme.colores.azul}
            textColor="#fff"
            borderRadius="8px"
            hoverBackgroundColor={theme.colores.azulOscuro}
            divWidth="auto"
            disabled={customStart.isAfter(customEnd)}
          />
        </DialogActions>
      </Dialog>

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
        <Box
          gridColumn={{
            xs: "span 4",
            md: "span 6",
            lg: "span 6"
          }}
          gridRow={{
            xs: "auto",
            md: "auto",
            lg: "2 / span 2"
          }}
          display="flex"
          flexDirection={{ xs: "column", md: "row" }}
          gap="10px"
          sx={{
            backgroundColor: theme.colores.gris,
            padding: 1,
            borderRadius: 2,
            width: '100%',
            height: '100%',
            minHeight: 300,
          }}
        >
          <Box flex={1} minWidth={0} height="100%">
            <DashboardGraficos opcion="cargas" startDate={startDate.format('YYYY-MM-DD')} endDate={endDate.format('YYYY-MM-DD')} />
          </Box>
          <Box flex={1} minWidth={0} height="100%">
            <DashboardGraficos opcion="fechas" startDate={startDate.format('YYYY-MM-DD')} endDate={endDate.format('YYYY-MM-DD')} dateRangeType={dateRangeType} />
          </Box>
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
