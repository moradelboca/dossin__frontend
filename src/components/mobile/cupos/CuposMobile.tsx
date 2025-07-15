// CuposMobile.tsx
import { useState, useEffect, useRef, useContext } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Checkbox,
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import ClearSharpIcon from "@mui/icons-material/ClearSharp";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import CancelIcon from "@mui/icons-material/Cancel";
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import FilterListIcon from '@mui/icons-material/FilterList';
import { TarjetaCupos } from "../../cargas/cupos/TarjetaCupos";
import { CreadorCupos } from "../../cargas/creadores/CreadorCupos";
import TurnoForm from "../../forms/turnos/TurnoForm";
import TurnoConErroresForm from "../../forms/turnos/tabs/turnosConErrores/TurnoConErroresForm";
import CardMobile from "../../cards/mobile/CardMobile";
import { ContextoGeneral } from "../../Contexto";
import dayjs, { Dayjs } from 'dayjs';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { PickersDay } from '@mui/x-date-pickers/PickersDay';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import MainButton from '../../botones/MainButtom';

interface Turno {
  id?: number;
  colaborador?: { nombre: string; apellido: string; cuil: number };
  // Otros campos...
}

interface Cupo {
  carga: number;
  cupos: number;
  fecha: string;
  turnos: Turno[];
  turnosConErrores?: any[]; // propiedad opcional para errores
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

interface CuposMobileProps {
  cupos: Cupo[];
  estadoCarga: string;
  idCarga?: string;
  refreshCupos: () => void;
  theme: any;
  fields: string[];
  headerNames: string[];
  filtros: FiltrosCupos;
  setFiltros: (filtros: FiltrosCupos) => void;
}

export default function CuposMobile({
  cupos,
  estadoCarga,
  idCarga,
  refreshCupos,
  theme,
  fields,
  headerNames,
  filtros,
  setFiltros,
}: CuposMobileProps) {
  const { theme: contextTheme } = useContext(ContextoGeneral);
  
  const [expandedCard, setExpandedCard] = useState<number | null>(null);
  const [openDialogCupo, setOpenDialogCupo] = useState(false);
  const [openDialogTurno, setOpenDialogTurno] = useState(false);
  const [selectedTurno, setSelectedTurno] = useState<Turno | null>(null);
  const [selectedCupo, setSelectedCupo] = useState<Cupo | null>(null);

  // Estados para turnos con errores
  const [openDialogError, setOpenDialogError] = useState(false);
  const [selectedError, setSelectedError] = useState<any>(null);

  // Estados para el selector de fechas
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [calendarMode, setCalendarMode] = useState<'start' | 'end'>('start');
  const [customStart, setCustomStart] = useState<Dayjs>(dayjs().subtract(7, 'day'));
  const [customEnd, setCustomEnd] = useState<Dayjs>(dayjs());

  // Estado para el menú de filtros
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const availableDates = Array.from(new Set(cupos?.map((c) => c.fecha)));
  const [selectedDate, setSelectedDate] = useState<string>(availableDates[0] || "");
  const [filteredCupos, setFilteredCupos] = useState<Cupo[]>([]);

  // Ejecutar refresh cuando cambien los filtros
  useEffect(() => {
    refreshCupos();
  }, [filtros, refreshCupos]);

  useEffect(() => {
    if (selectedDate) {
      const filtered = cupos.filter((c) => c.fecha === selectedDate);
      setFilteredCupos(filtered);
    } else {
      setFilteredCupos([]);
    }
  }, [selectedDate, cupos]);

  const handleExpandClick = (index: number) => {
    setExpandedCard(expandedCard === index ? null : index);
  };


  const handleCloseDialogCupo = () => {
    setOpenDialogCupo(false);
  };

  const handleCloseDialogTurno = () => {
    setSelectedTurno(null);
    setSelectedCupo(null);
    setOpenDialogTurno(false);
  };

  const handleCloseDialogError = () => {
    setSelectedError(null);
    setOpenDialogError(false);
  };

  const dateScrollRef = useRef<HTMLDivElement | null>(null);
  const scrollLeft = () => {
    if (dateScrollRef.current) {
      dateScrollRef.current.scrollBy({ left: -120, behavior: "smooth" });
    }
  };
  const scrollRight = () => {
    if (dateScrollRef.current) {
      dateScrollRef.current.scrollBy({ left: 120, behavior: "smooth" });
    }
  };

  // Función para validar que el rango no exceda 2 meses
  const validarRangoFechas = (start: Dayjs, end: Dayjs): boolean => {
    const diffInMonths = end.diff(start, 'month', true);
    return diffInMonths <= 2;
  };

  // Handler para cambio de filtros
  const handleFiltroChange = (filtro: keyof FiltrosCupos) => {
    setFiltros({
      ...filtros,
      [filtro]: !filtros[filtro],
    });
  };

  // Handler para aplicar rango de fechas
  const handleAplicarRangoFechas = () => {
    if (!validarRangoFechas(customStart, customEnd)) {
      alert('El rango de fechas no puede exceder 2 meses');
      return;
    }
    
    setFiltros({
      ...filtros,
      fechaDesde: customStart.format('YYYY-MM-DD'),
      fechaHasta: customEnd.format('YYYY-MM-DD'),
    });
    setShowDatePicker(false);
  };

  // Handlers para el menú de filtros
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleOpenDatePicker = () => {
    setShowDatePicker(true);
    setCustomStart(dayjs(filtros.fechaDesde));
    setCustomEnd(dayjs(filtros.fechaHasta));
    handleClose();
  };

  const renderDateChips = () => (
    <Box
      ref={dateScrollRef}
      sx={{
        display: "flex",
        overflowX: "auto",
        gap: 1,
        py: 1,
        scrollbarWidth: "none", // Firefox
        "&::-webkit-scrollbar": { display: "none" }, // Chrome, Safari, Opera
      }}
    >
      {availableDates.map((date) => {
        const isSelected = date === selectedDate;
        let backgroundColor, color, border;
        const cupo = cupos.find((c) => c.fecha === date);
        const hasAvailability = cupo ? cupo.cupos > 0 : false;
        backgroundColor = isSelected ? theme.colores.azul : (hasAvailability ? "#418C75" : "#FF6666");
        color = isSelected ? "#fff" : "#fff";
        border = isSelected ? `1px solid ${theme.colores.azul}` : "1px solid black";
        return (
          <Box
            key={date}
            onClick={() => setSelectedDate(date)}
            sx={{
              cursor: "pointer",
              padding: "6px 12px",
              borderRadius: "4px",
              whiteSpace: "nowrap",
              fontWeight: "bold",
              backgroundColor,
              color,
              border,
              flexShrink: 0,
            }}
          >
            {date}
          </Box>
        );
      })}
    </Box>
  );

  // Render de turnos normales (lista vertical)
  const renderTurnos = (turnos: Turno[], cupo: Cupo) => {
    if (!turnos || turnos.length === 0) {
      return (
        <Box padding={2}>
          <Typography variant="body2">No hay turnos para este cupo</Typography>
        </Box>
      );
    }
    return turnos.map((turno, index) => (
      <Box key={turno.id || index}>
        <CardMobile
          item={turno}
          index={index}
          fields={fields}
          headerNames={headerNames}
          expandedCard={expandedCard}
          handleExpandClick={handleExpandClick}
          tituloField="nombreColaborador"
          subtituloField="nombreEmpresa"
          refreshCupos={refreshCupos}
          cupo={cupo}
        />
      </Box>
    ));
  };

  return (
    <Box padding={2}>
      {/* Header con título y menú de filtros */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" gutterBottom sx={{ mb: 0 }}>
          Cupos
        </Typography>
        <IconButton
          onClick={handleClick}
          sx={{ color: contextTheme.colores.azul }}
        >
          <MoreVertIcon />
        </IconButton>
      </Box>

      {/* Menú desplegable de filtros */}
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          sx: {
            minWidth: 250,
            mt: 1,
          },
        }}
      >
        <MenuItem onClick={handleClose} disabled>
          <ListItemIcon>
            <FilterListIcon />
          </ListItemIcon>
          <ListItemText primary="Filtros" />
        </MenuItem>
        <MenuItem onClick={() => {
          handleFiltroChange('excluirPagados');
          handleClose();
        }}>
          <Checkbox
            checked={filtros.excluirPagados}
            sx={{
              color: contextTheme.colores.azul,
              '&.Mui-checked': {
                color: contextTheme.colores.azul,
              },
            }}
          />
          <ListItemText primary="Excluir cupos pagados" />
        </MenuItem>
        <MenuItem onClick={() => {
          handleFiltroChange('mostrarVaciosDelPasado');
          handleClose();
        }}>
          <Checkbox
            checked={filtros.mostrarVaciosDelPasado}
            sx={{
              color: contextTheme.colores.azul,
              '&.Mui-checked': {
                color: contextTheme.colores.azul,
              },
            }}
          />
          <ListItemText primary="Mostrar cupos vacíos del pasado" />
        </MenuItem>
        <MenuItem onClick={handleOpenDatePicker}>
          <ListItemIcon>
            <CalendarMonthIcon />
          </ListItemIcon>
          <ListItemText 
            primary="Rango de fechas" 
            secondary={`${filtros.fechaDesde} - ${filtros.fechaHasta}`}
          />
        </MenuItem>
      </Menu>

      {estadoCarga === "Cargando" && (
        <Box
          display="flex"
          flexDirection="row"
          width="100%"
          height="100%"
          justifyContent="center"
          alignItems="center"
          gap={3}
          minHeight="60vh"
        >
          <CircularProgress />
          <Typography variant="h5">
            <b>Cargando...</b>
          </Typography>
        </Box>
      )}

      {estadoCarga === "Cargado" && (
        <Box width="100%" mt={2}>
          {availableDates.length > 0 ? (
            <>
              {/* Selector de fechas modificado */}
              <Box display="flex" alignItems="center" mb={2} width="100%">
                <IconButton onClick={scrollLeft}>
                  <ChevronLeftIcon />
                </IconButton>
                <Box sx={{ overflow: "hidden", flex: 1 }}>{renderDateChips()}</Box>
                <IconButton onClick={scrollRight}>
                  <ChevronRightIcon />
                </IconButton>
              </Box>

              {selectedDate ? (
                filteredCupos.length > 0 ? (
                  filteredCupos.map((cupo, idx) => (
                    <Box key={idx} mb={4} p={2} sx={{ backgroundColor: "#fff" }}>
                      <TarjetaCupos
                        fecha={cupo.fecha}
                        cuposDisponibles={cupo.cupos}
                        cuposConfirmados={cupo.turnos.length}
                        idCarga={cupo.carga}
                        refreshCupos={refreshCupos}
                        estaEnElGrid={true}
                        cupos={cupos}
                      />
                      {/* Lista vertical de turnos */}
                      <Box
                        mt={2}
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 2,
                        }}
                      >
                        {renderTurnos(cupo.turnos, cupo)}
                      </Box>
                    </Box>
                  ))
                ) : (
                  <Box display="flex" justifyContent="center" alignItems="center" height="200px">
                    <Typography variant="body1">
                      No hay cupos para la fecha seleccionada
                    </Typography>
                  </Box>
                )
              ) : (
                <Box display="flex" justifyContent="center" alignItems="center" height="200px">
                  <Typography variant="body1">Seleccione una fecha para empezar</Typography>
                </Box>
              )}
            </>
          ) : (
            <Box
              display="flex"
              flexDirection="row"
              width="100%"
              justifyContent="center"
              alignItems="center"
              gap={3}
              mt={4}
            >
              <CancelIcon
                sx={{
                  color: "red",
                  borderRadius: "50%",
                  padding: "5px",
                  width: "50px",
                  height: "50px",
                }}
              />
              <Typography variant="h5">
                <b>Al parecer no hay cupos.</b>
              </Typography>
            </Box>
          )}
        </Box>
      )}

      {/* Dialog para "Crear Cupo" */}
      <Dialog open={openDialogCupo} onClose={handleCloseDialogCupo} fullWidth maxWidth="sm">
        <IconButton
          onClick={handleCloseDialogCupo}
          sx={{
            position: "absolute",
            top: "10px",
            right: "10px",
            cursor: "pointer",
            color: theme.colores.azul,
          }}
        >
          <ClearSharpIcon />
        </IconButton>
        <DialogTitle>Crear un nuevo cupo</DialogTitle>
        <DialogContent>
          <CreadorCupos
            idCarga={idCarga}
            refreshCupos={refreshCupos}
            handleCloseDialog={handleCloseDialogCupo}
          />
        </DialogContent>
      </Dialog>

      {/* Dialog para "Crear/Editar Turno" */}
      <Dialog open={openDialogTurno} onClose={handleCloseDialogTurno} fullWidth maxWidth="md">
        <DialogTitle>{selectedTurno ? "Editar Turno" : "Crear Turno"}</DialogTitle>
        <DialogContent>
          <TurnoForm
            seleccionado={selectedTurno}
            handleClose={handleCloseDialogTurno}
            idCarga={selectedCupo?.carga}
            fechaCupo={selectedCupo?.fecha}
            datos={cupos}
            setDatos={refreshCupos}
          />
        </DialogContent>
      </Dialog>

      {/* Dialog para "Crear/Editar Turno con Error" */}
      <Dialog open={openDialogError} onClose={handleCloseDialogError} fullWidth maxWidth="md">
        <DialogTitle>
          {selectedError ? "Editar Turno con Error" : "Crear Turno con Error"}
        </DialogTitle>
        <DialogContent>
          <TurnoConErroresForm
            seleccionado={selectedError}
            datos={selectedError ? [selectedError] : []}
            setDatos={() => {
              refreshCupos();
              handleCloseDialogError();
            }}
            handleClose={handleCloseDialogError}
            idCarga={idCarga}
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
                sx={{ mb: 1, minWidth: 120, color: calendarMode === 'start' ? '#fff' : contextTheme.colores.azul, backgroundColor: calendarMode === 'start' ? contextTheme.colores.azul : 'transparent', borderColor: contextTheme.colores.azul }}
              >
                {customStart.format('DD/MM/YYYY')}
              </Button>
            </Box>
            <Box>
              <Typography variant="body2">Hasta</Typography>
              <Button
                variant={calendarMode === 'end' ? 'contained' : 'outlined'}
                onClick={() => setCalendarMode('end')}
                sx={{ mb: 1, minWidth: 120, color: calendarMode === 'end' ? '#fff' : contextTheme.colores.azul, backgroundColor: calendarMode === 'end' ? contextTheme.colores.azul : 'transparent', borderColor: contextTheme.colores.azul }}
              >
                {customEnd.format('DD/MM/YYYY')}
              </Button>
            </Box>
          </Box>
          <ThemeProvider theme={createTheme({
            palette: {
              primary: {
                main: contextTheme.colores.azul,
              },
            },
          })}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DateCalendar
                value={calendarMode === 'start' ? customStart : customEnd}
                minDate={calendarMode === 'end' ? customStart : undefined}
                maxDate={calendarMode === 'start' ? customEnd : dayjs()}
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
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, px: 3, pb: 2 }}>
          <MainButton
            onClick={() => setShowDatePicker(false)}
            text="Cancelar"
            backgroundColor="transparent"
            textColor={contextTheme.colores.azul}
            borderRadius="8px"
            hoverBackgroundColor="rgba(22, 54, 96, 0.1)"
            divWidth="auto"
          />
          <MainButton
            onClick={handleAplicarRangoFechas}
            text="Aplicar"
            backgroundColor={contextTheme.colores.azul}
            textColor="#fff"
            borderRadius="8px"
            hoverBackgroundColor={contextTheme.colores.azulOscuro}
            divWidth="auto"
            disabled={customStart.isAfter(customEnd) || !validarRangoFechas(customStart, customEnd)}
          />
        </Box>
      </Dialog>
    </Box>
  );
}
