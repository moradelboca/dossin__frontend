// ContainerCupos.tsx
import React, { useState, useEffect, useContext, useCallback } from "react";
import {
  Box,
  Tabs,
  Tab,
  CircularProgress,
  Typography,
  Dialog,
  DialogContent,
  DialogTitle,
  useMediaQuery,
  Checkbox,
  FormControlLabel,
  FormGroup,
  IconButton,
  Button,
} from "@mui/material";
import { DialogActions as MuiDialogActions } from "@mui/material";
import { BotonIcon } from "../../botones/IconButton";
import { AccessAlarmOutlined } from "@mui/icons-material";
import ClearSharpIcon from "@mui/icons-material/ClearSharp";
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { useParams } from "react-router-dom";
import { ContextoGeneral } from "../../Contexto";
import { CreadorCupos } from "../creadores/CreadorCupos";
import { CuposCardsContainer } from "./tabsCupos/CuposCardsContainer";
import { CuposGridContainer } from "./tabsCupos/CuposGridContainer";
import { CuposGridPorDiaContainer } from "./tabsCupos/CuposGridPorDiaContainer";
import CuposMobile from "../../mobile/cupos/CuposMobile";
import { useAuth } from "../../autenticacion/ContextoAuth";
import InfoTooltip from '../../InfoTooltip';
import dayjs, { Dayjs } from 'dayjs';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { PickersDay } from '@mui/x-date-pickers/PickersDay';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import MainButton from '../../botones/MainButtom';

// Tipos para la implementación
interface Cupo {
  carga: number;
  cupos: number;
  fecha: string;
  turnos: any[];
  turnosConErrores?: any[];
}

interface FiltrosCupos {
  excluirPagados: boolean;
  mostrarVaciosDelPasado: boolean;
  fechaDesde?: string;
  fechaHasta?: string;
}

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

export function ContainerCupos() {
  const { idCarga } = useParams();
  const { backendURL, theme } = useContext(ContextoGeneral);
  const { user } = useAuth();
  
  // Estados principales
  const [cupos, setCupos] = useState<Cupo[]>([]);
  const [estadoCarga, setEstadoCarga] = useState<"Cargando" | "Cargado" | "Error">("Cargando");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);

  const [selectedTab, setSelectedTab] = useState<"CARDS" | "GRID" | "POR_DIA">("CARDS");
  const [fechaSeleccionada] = useState<string | null>(null);
  
  // Estados para lazy loading
  const [fechaDesdeFuturo, setFechaDesdeFuturo] = useState<Date>(new Date());
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMoreData, setHasMoreData] = useState(true);
  const [diasBuscadosFuturo, setDiasBuscadosFuturo] = useState(0);
  
  // Estados para el selector de fechas
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [calendarMode, setCalendarMode] = useState<'start' | 'end'>('start');
  const [customStart, setCustomStart] = useState<Dayjs>(dayjs().subtract(7, 'day'));
  const [customEnd, setCustomEnd] = useState<Dayjs>(dayjs().subtract(1, 'day'));
  
  // Filtros
  const [filtros, setFiltros] = useState<FiltrosCupos>({
    excluirPagados: true,
    mostrarVaciosDelPasado: false,
    fechaDesde: dayjs().subtract(7, 'day').format('YYYY-MM-DD'),
    fechaHasta: dayjs().subtract(1, 'day').format('YYYY-MM-DD'),
  });

  // Variables de detección
  const isMobile = useMediaQuery("(max-width:768px)");
  const isIngeniero = user?.rol?.id === 3;

  // Constantes para lazy loading
  const BLOQUE_CARDS = 7;
  const BLOQUE_GRID = 5;
  const LIMITE_DIAS_FUTURO = 14;

  // Función para formatear fecha a YYYY-MM-DD
  const formatearFecha = (fecha: Date): string => {
    return fecha.toISOString().split('T')[0];
  };

  // Función para sumar días a una fecha
  const sumarDias = (fecha: Date, dias: number): Date => {
    const nuevaFecha = new Date(fecha);
    nuevaFecha.setDate(nuevaFecha.getDate() + dias);
    return nuevaFecha;
  };

  // Función para validar que el rango no exceda 2 meses
  const validarRangoFechas = (start: Dayjs, end: Dayjs): boolean => {
    const diffInMonths = end.diff(start, 'month', true);
    return diffInMonths <= 2;
  };

  // Función para construir URL de fetch con filtros
  const construirUrlCupos = (fechaDesde: string, fechaHasta: string, filtros: FiltrosCupos): string => {
    const params = new URLSearchParams({
      fechaDesde,
      fechaHasta,
    });
    
    if (filtros.excluirPagados) {
      params.append('excluirPagados', 'true');
    }
    
    return `${backendURL}/cargas/${idCarga}/cupos?${params.toString()}`;
  };

  // Función para hacer fetch de turnos para una fecha específica (solo para grid)
  const fetchTurnosParaFecha = async (fecha: string): Promise<{ turnos: any[], turnosConErrores: any[] }> => {
    try {
      const url = `${backendURL}/cargas/${idCarga}/cupos/${fecha}/turnos`;
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
      });
      
      if (!response.ok) {
        console.error('Error HTTP al obtener turnos', { url, status: response.status });
        return { turnos: [], turnosConErrores: [] };
      }
      
      const turnosData = await response.json();
      const turnos = Array.isArray(turnosData) ? turnosData : turnosData.turnos || [];
      const turnosConErrores = turnosData.turnosConErrores || [];
      
      // Normalizar los campos de patente
      const normalizarTurno = (turno: any) => ({
        ...turno,
        camion: typeof turno.camion === "string" ? { patente: turno.camion } : turno.camion,
        acoplado: typeof turno.acoplado === "string" ? { patente: turno.acoplado } : turno.acoplado,
        acopladoExtra: typeof turno.acopladoExtra === "string" ? { patente: turno.acopladoExtra } : turno.acopladoExtra,
      });
      
      return {
        turnos: turnos.map(normalizarTurno),
        turnosConErrores: turnosConErrores.map(normalizarTurno),
      };
    } catch (err) {
      console.error('Excepción al obtener turnos', { fecha, err });
      return { turnos: [], turnosConErrores: [] };
    }
  };

  // Función para cargar cupos del pasado
  const cargarCuposPasado = async (): Promise<Cupo[]> => {
    const fechaDesde = filtros.fechaDesde || dayjs().subtract(7, 'day').format('YYYY-MM-DD');
    const fechaHasta = filtros.fechaHasta || dayjs().subtract(1, 'day').format('YYYY-MM-DD');
    
    const url = construirUrlCupos(fechaDesde, fechaHasta, filtros);
    
    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const cuposData = await response.json();
      // Filtrar cupos vacíos del pasado según el filtro
      const cuposFiltrados = cuposData.filter((cupo: any) =>
        filtros.mostrarVaciosDelPasado ? true : (cupo.turnos && cupo.turnos.length > 0)
      );
      // Si es modo grid, necesitamos los turnos
      if (selectedTab === "GRID") {
        const cuposConTurnos = [];
        for (const cupo of cuposFiltrados) {
          if (cupo.turnos && cupo.turnos.length > 0) {
            const turnosData = await fetchTurnosParaFecha(cupo.fecha);
            cuposConTurnos.push({
              ...cupo,
              ...turnosData,
            });
          } else if (filtros.mostrarVaciosDelPasado) {
            // Solo mostrar vacíos si el filtro está activado
            cuposConTurnos.push(cupo);
          }
        }
        return cuposConTurnos;
      }
      // Para cards, solo usar la info de cupos
      return cuposFiltrados;
    } catch (error) {
      console.error("Error al cargar cupos del pasado:", error);
      return [];
    }
  };

  // Función para cargar cupos futuros con lazy loading
  const cargarCuposFuturos = async (fechaDesde: Date): Promise<{ cupos: Cupo[], tieneMasDatos: boolean }> => {
    const bloque = selectedTab === "CARDS" ? BLOQUE_CARDS : BLOQUE_GRID;
    const fechaHasta = sumarDias(fechaDesde, bloque - 1);
    
    const url = construirUrlCupos(
      formatearFecha(fechaDesde),
      formatearFecha(fechaHasta),
      filtros
    );
    
    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const cuposData = await response.json();
      
      // Verificar si hay datos
      if (!cuposData || cuposData.length === 0) {
        return { cupos: [], tieneMasDatos: true };
      }
      
      // Si es modo grid, necesitamos los turnos
      if (selectedTab === "GRID") {
        const cuposConTurnos = [];
        for (const cupo of cuposData) {
          if (cupo.turnos && cupo.turnos.length > 0) {
            const turnosData = await fetchTurnosParaFecha(cupo.fecha);
            cuposConTurnos.push({
              ...cupo,
              ...turnosData,
            });
          } else {
            // Para fechas futuras, mostrar aunque estén vacíos
            cuposConTurnos.push(cupo);
          }
        }
        return { cupos: cuposConTurnos, tieneMasDatos: true };
      }
      
      // Para cards, solo usar la info de cupos
      return { cupos: cuposData, tieneMasDatos: true };
    } catch (error) {
      console.error("Error al cargar cupos futuros:", error);
      return { cupos: [], tieneMasDatos: true };
    }
  };

  // Función principal de carga inicial
  const cargarCuposInicial = async () => {
    setEstadoCarga("Cargando");
    setIsRefreshing(true);
    
    try {
      // 1. Cargar cupos del pasado
      const cuposPasado = await cargarCuposPasado();
      
      // 2. Determinar desde qué fecha cargar futuros
      // Siempre empezar desde hoy para los cupos futuros
      const fechaDesdeFuturos = new Date();
      
      const { cupos: cuposFuturo, tieneMasDatos } = await cargarCuposFuturos(fechaDesdeFuturos);
      
      // Combinar cupos
      const todosLosCupos = [...cuposPasado, ...cuposFuturo];
      
      setCupos(todosLosCupos);
      setFechaDesdeFuturo(sumarDias(fechaDesdeFuturos, selectedTab === "CARDS" ? BLOQUE_CARDS : BLOQUE_GRID));
      setHasMoreData(tieneMasDatos);
      setDiasBuscadosFuturo(selectedTab === "CARDS" ? BLOQUE_CARDS : BLOQUE_GRID);
      setEstadoCarga("Cargado");
    } catch (error) {
      console.error("Error en carga inicial:", error);
      setEstadoCarga("Error");
    } finally {
      setIsRefreshing(false);
    }
  };

  // Función para lazy loading
  const cargarMasCupos = async () => {
    if (isLoadingMore || !hasMoreData || diasBuscadosFuturo >= LIMITE_DIAS_FUTURO) {
      return;
    }
    
    setIsLoadingMore(true);
    
    try {
      const { cupos: nuevosCupos, tieneMasDatos } = await cargarCuposFuturos(fechaDesdeFuturo);
      
      if (nuevosCupos.length > 0) {
        setCupos(prev => [...prev, ...nuevosCupos]);
      }
      
      const nuevoBloque = selectedTab === "CARDS" ? BLOQUE_CARDS : BLOQUE_GRID;
      setFechaDesdeFuturo(sumarDias(fechaDesdeFuturo, nuevoBloque));
      setHasMoreData(tieneMasDatos);
      setDiasBuscadosFuturo(prev => prev + nuevoBloque);
    } catch (error) {
      console.error("Error en lazy loading:", error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  // Función para cargar cupos de una fecha específica (modo POR_DIA)
  const cargarCuposPorDia = async (fecha: string) => {
    setEstadoCarga("Cargando");
    setIsRefreshing(true);
    
    try {
      const url = `${backendURL}/cargas/${idCarga}/cupos/${fecha}/turnos`;
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const turnosData = await response.json();
      const turnos = Array.isArray(turnosData) ? turnosData : turnosData.turnos || [];
      const turnosConErrores = turnosData.turnosConErrores || [];
      
      // Normalizar turnos
      const normalizarTurno = (turno: any) => ({
        ...turno,
        camion: typeof turno.camion === "string" ? { patente: turno.camion } : turno.camion,
        acoplado: typeof turno.acoplado === "string" ? { patente: turno.acoplado } : turno.acoplado,
        acopladoExtra: typeof turno.acopladoExtra === "string" ? { patente: turno.acopladoExtra } : turno.acopladoExtra,
      });
      
      const cupoPorDia = {
        carga: parseInt(idCarga!),
        cupos: 0,
        fecha,
        turnos: turnos.map(normalizarTurno),
        turnosConErrores: turnosConErrores.map(normalizarTurno),
      };
      
      setCupos([cupoPorDia]);
      setEstadoCarga("Cargado");
    } catch (error) {
      console.error("Error al cargar cupos por día:", error);
      setEstadoCarga("Error");
    } finally {
      setIsRefreshing(false);
    }
  };

  // Función para refrescar cupos
  const refreshCupos = useCallback(async () => {
    if (selectedTab === "POR_DIA" && fechaSeleccionada) {
      await cargarCuposPorDia(fechaSeleccionada);
    } else {
      await cargarCuposInicial();
    }
  }, [selectedTab, fechaSeleccionada, filtros]);

  // Efectos
  useEffect(() => {
    refreshCupos();
  }, [refreshCupos]);

  // Handler para cambio de tab
  const handleChangeTab = (_event: React.SyntheticEvent, newValue: string) => {
    const nuevoTab = newValue as "CARDS" | "GRID" | "POR_DIA";
    setSelectedTab(nuevoTab);
    
    // Resetear estados de lazy loading
    setFechaDesdeFuturo(new Date());
    setHasMoreData(true);
    setDiasBuscadosFuturo(0);
  };

  // Handler para cambio de filtros
  const handleFiltroChange = (filtro: keyof FiltrosCupos) => {
    setFiltros(prev => ({
      ...prev,
      [filtro]: !prev[filtro],
    }));
  };

  // Handler para aplicar rango de fechas
  const handleAplicarRangoFechas = () => {
    if (!validarRangoFechas(customStart, customEnd)) {
      alert('El rango de fechas no puede exceder 2 meses');
      return;
    }
    
    setFiltros(prev => ({
      ...prev,
      fechaDesde: customStart.format('YYYY-MM-DD'),
      fechaHasta: customEnd.format('YYYY-MM-DD'),
    }));
    setShowDatePicker(false);
  };

  // Handler para lazy loading (scroll)
  const handleScroll = useCallback(() => {
    if (selectedTab === "POR_DIA") return;
    
    const scrollTop = window.scrollY;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    
    if (scrollTop + windowHeight >= documentHeight - 100) {
      cargarMasCupos();
    }
  }, [selectedTab]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  // Handlers para diálogos
  const handleClickCrearCupo = () => setOpenDialog(true);
  const handleCloseDialog = () => setOpenDialog(false);

  // Configuración de campos
  const fields = [
    "estado.nombre",
    "empresa.cuit",
    "camion.patente",
    "acoplado.patente",
    "acopladoExtra.patente",
  ];

  const headerNames = [
    "Estado",
    "Empresa",
    "Patente Camion",
    "Patente Acoplado",
    "Patente Acoplado Extra",
  ];

  // Render para mobile
  if (isMobile) {
    return (
      <CuposMobile
        cupos={cupos}
        estadoCarga={estadoCarga}
        idCarga={idCarga}
        refreshCupos={refreshCupos}
        theme={theme}
        fields={fields}
        headerNames={headerNames}
        filtros={filtros}
        setFiltros={setFiltros}
      />
    );
  }

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      width="100%"
      marginTop={2}
      sx={{ height: '100%', overflowY: 'auto' }}
    >
      {/* Header con tabs y filtros */}
      <Box
        display="flex"
        flexDirection="column"
        width="100%"
        padding={2}
        gap={2}
      >
        {/* Tabs */}
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" alignItems="center" gap={2}>
            {!isIngeniero && (
              <Tabs
                value={selectedTab}
                onChange={handleChangeTab}
                textColor="inherit"
                sx={{
                  color: theme.colores.azul,
                  "& .MuiTab-root": { color: "gray" },
                  "& .Mui-selected": { color: theme.colores.azul },
                  "& .MuiTabs-indicator": { backgroundColor: theme.colores.azul },
                }}
              >
                <Tab value="CARDS" label="CARDS" />
                <Tab value="GRID" label="GRID" />
                <Tab value="POR_DIA" label="POR DÍA" />
              </Tabs>
            )}
            <InfoTooltip
              placement="bottom"
              title="¿Qué podés hacer en Cupos?"
              sections={[
                "En esta pantalla podés ver, crear y gestionar los cupos y turnos de cada carga.",
                {
                  label: "Vistas",
                  items: [
                    "Tarjetas: Visualizá cada fecha de cupo como una tarjeta, con los turnos y sus estados destacados.",
                    "Tabla: Mostrá los turnos en formato tabla, con opciones para filtrar, seleccionar columnas y exportar los datos.",
                    "Por Día: Filtrá y consultá los turnos de una fecha específica de manera rápida."
                  ]
                },
                {
                  label: "Botones principales",
                  items: [
                    "Quiero crear un nuevo cupo: Agregá una nueva fecha de cupo.",
                    "Ver más: Accedé a los detalles y edición de un cupo.",
                    "Crear turno: Agregá un nuevo turno a un cupo existente."
                  ]
                },
                "Si no ves un turno o no podés realizar alguna acción, puede ser por falta de permisos según tu rol."
              ]}
            />
          </Box>
          {!isIngeniero && (
            <BotonIcon
              onClick={handleClickCrearCupo}
              title="Quiero crear un nuevo cupo"
              icon={<AccessAlarmOutlined />}
            />
          )}
        </Box>

        {/* Filtros */}
        {selectedTab !== "POR_DIA" && (
          <FormGroup row sx={{ gap: 2, alignItems: 'center' }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={filtros.excluirPagados}
                  onChange={() => handleFiltroChange('excluirPagados')}
                  sx={{
                    color: theme.colores.azul,
                    '&.Mui-checked': {
                      color: theme.colores.azul,
                    },
                  }}
                />
              }
              label="Excluir cupos pagados"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={filtros.mostrarVaciosDelPasado}
                  onChange={() => handleFiltroChange('mostrarVaciosDelPasado')}
                  sx={{
                    color: theme.colores.azul,
                    '&.Mui-checked': {
                      color: theme.colores.azul,
                    },
                  }}
                />
              }
              label="Mostrar cupos vacíos del pasado"
            />
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, ml: 2 }}>
              <Typography variant="body2" sx={{ color: theme.colores.texto }}>
                Rango de fechas:
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 'bold', color: theme.colores.azul }}>
                {filtros.fechaDesde} - {filtros.fechaHasta}
              </Typography>
              <IconButton 
                size="small"
                onClick={() => {
                  setShowDatePicker(true);
                  setCustomStart(dayjs(filtros.fechaDesde));
                  setCustomEnd(dayjs(filtros.fechaHasta));
                }}
                sx={{ color: theme.colores.azul }}
              >
                <CalendarMonthIcon />
              </IconButton>
            </Box>
          </FormGroup>
        )}
      </Box>

      {/* Contenido principal */}
      <Box sx={{ position: 'relative', width: '100%' }}>
        {isRefreshing && (
          <Box
            sx={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.7)',
              zIndex: 10,
            }}
          >
            <CircularProgress />
          </Box>
        )}

        {estadoCarga === "Cargado" && cupos.length > 0 ? (
          <Box width="100%">
            {selectedTab === "CARDS" && (
              <CuposCardsContainer
                cupos={cupos}
                refreshCupos={refreshCupos}
                fields={fields}
                headerNames={headerNames}
                idCarga={idCarga}
                estadoCarga={estadoCarga}
              />
            )}
            {selectedTab === "GRID" && (
              <CuposGridContainer
                cupos={cupos}
                refreshCupos={refreshCupos}
                estadoCarga={estadoCarga}
              />
            )}
            {selectedTab === "POR_DIA" && (
              <CuposGridPorDiaContainer
                cupos={cupos}
                refreshCupos={refreshCupos}
                estadoCarga={estadoCarga}
              />
            )}
            
            {/* Indicador de lazy loading */}
            {isLoadingMore && (
              <Box display="flex" justifyContent="center" p={3}>
                <CircularProgress />
              </Box>
            )}
            
            {/* Mensaje cuando no hay más datos */}
            {!hasMoreData && selectedTab !== "POR_DIA" && (
              <Box display="flex" justifyContent="center" p={3}>
                <Typography variant="body2" color="text.secondary">
                  No hay más cupos disponibles
                </Typography>
              </Box>
            )}
          </Box>
        ) : estadoCarga === "Cargado" && cupos.length === 0 ? (
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            height="50vh"
          >
            <ClearSharpIcon style={{ fontSize: "5rem", color: "gray" }} />
            <Typography variant="h6" color="textSecondary">
              {selectedTab === "POR_DIA" 
                ? "Selecciona una fecha para ver los cupos"
                : "No hay cupos disponibles"
              }
            </Typography>
            {selectedTab !== "POR_DIA" && diasBuscadosFuturo >= LIMITE_DIAS_FUTURO && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                No se encontraron cupos en los próximos 14 días
              </Typography>
            )}
          </Box>
        ) : estadoCarga === "Error" ? (
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            height="50vh"
          >
            <ClearSharpIcon style={{ fontSize: "5rem", color: "red" }} />
            <Typography variant="h6" color="error">
              Error al cargar los cupos
            </Typography>
          </Box>
        ) : (
          // Si está cargando pero hay cupos anteriores, mostrarlos
          cupos.length > 0 ? (
            <Box width="100%">
              {selectedTab === "CARDS" && (
                <CuposCardsContainer
                  cupos={cupos}
                  refreshCupos={refreshCupos}
                  fields={fields}
                  headerNames={headerNames}
                  idCarga={idCarga}
                  estadoCarga={estadoCarga}
                />
              )}
              {selectedTab === "GRID" && (
                <CuposGridContainer
                  cupos={cupos}
                  refreshCupos={refreshCupos}
                  estadoCarga={estadoCarga}
                />
              )}
              {selectedTab === "POR_DIA" && (
                <CuposGridPorDiaContainer
                  cupos={cupos}
                  refreshCupos={refreshCupos}
                  estadoCarga={estadoCarga}
                />
              )}
            </Box>
          ) : (
            !isRefreshing && (
              <Box
                display="flex"
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
                height="50vh"
              >
                <CircularProgress />
              </Box>
            )
          )
        )}
      </Box>

      {/* Diálogo para crear cupo */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        fullWidth
        maxWidth="sm"
      >
        <ClearSharpIcon
          onClick={handleCloseDialog}
          sx={{
            position: "absolute",
            top: "10px",
            right: "10px",
            cursor: "pointer",
            color: theme.colores.azul,
          }}
        />
        <DialogTitle>Crear un nuevo cupo</DialogTitle>
        <DialogContent>
          <CreadorCupos
            idCarga={idCarga}
            refreshCupos={refreshCupos}
            handleCloseDialog={handleCloseDialog}
          />
        </DialogContent>
      </Dialog>

      {/* Diálogo para selector de fechas */}
      <Dialog open={showDatePicker} onClose={() => setShowDatePicker(false)}>
        <DialogTitle>Seleccionar rango de fechas (máximo 2 meses)</DialogTitle>
        <DialogContent>
          <Box display="flex" gap={2} alignItems="center" mt={1} justifyContent="center">
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
                maxDate={calendarMode === 'start' ? customEnd : dayjs().subtract(1, 'day')}
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
          {!validarRangoFechas(customStart, customEnd) && (
            <Typography variant="body2" color="error" sx={{ mt: 1 }}>
              El rango de fechas no puede exceder 2 meses
            </Typography>
          )}
        </DialogContent>
        <MuiDialogActions sx={{ justifyContent: 'center', gap: 2, px: 3, pb: 2 }}>
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
            onClick={handleAplicarRangoFechas}
            text="Aplicar"
            backgroundColor={theme.colores.azul}
            textColor="#fff"
            borderRadius="8px"
            hoverBackgroundColor={theme.colores.azulOscuro}
            divWidth="auto"
            disabled={customStart.isAfter(customEnd) || !validarRangoFechas(customStart, customEnd)}
          />
        </MuiDialogActions>
      </Dialog>
    </Box>
  );
}
