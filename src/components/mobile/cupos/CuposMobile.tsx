// CuposMobile.tsx
import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  ToggleButton,
  ToggleButtonGroup,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Button,
} from "@mui/material";
import ClearSharpIcon from "@mui/icons-material/ClearSharp";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import CancelIcon from "@mui/icons-material/Cancel";

import { TarjetaCupos } from "../../cargas/cupos/TarjetaCupos";
import { CreadorCupos } from "../../cargas/creadores/CreadorCupos";
import TurnoForm from "../../forms/turnos/TurnoForm";
import TurnoConErroresForm from "../../forms/turnos/tabs/turnosConErrores/TurnoConErroresForm";
import CardMobile from "../../cards/mobile/CardMobile";

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

interface CuposMobileProps {
  cupos: Cupo[];
  estadoCarga: string;
  selectedView: { label: string; value: string };
  setSelectedView: (view: { label: string; value: string }) => void;
  idCarga?: string;
  refreshCupos: () => void;
  theme: any;
  fields: string[];
  headerNames: string[];
}

export default function CuposMobile({
  cupos,
  estadoCarga,
  selectedView,
  setSelectedView,
  idCarga,
  refreshCupos,
  theme,
  fields,
  headerNames,
}: CuposMobileProps) {
  const [expandedCard, setExpandedCard] = useState<number | null>(null);
  const [openDialogCupo, setOpenDialogCupo] = useState(false);
  const [openDialogTurno, setOpenDialogTurno] = useState(false);
  const [selectedTurno, setSelectedTurno] = useState<Turno | null>(null);
  const [selectedCupo, setSelectedCupo] = useState<Cupo | null>(null);

  // Estados para turnos con errores
  const [openDialogError, setOpenDialogError] = useState(false);
  const [selectedError, setSelectedError] = useState<any>(null);

  // 1) Fechas únicas
  const availableDates = Array.from(new Set(cupos.map((c) => c.fecha)));
  const [selectedDate, setSelectedDate] = useState<string>(availableDates[0] || "");
  const [filteredCupos, setFilteredCupos] = useState<Cupo[]>([]);

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

  const handleClickCrearCupo = () => {
    setOpenDialogCupo(true);
  };
  const handleCloseDialogCupo = () => {
    setOpenDialogCupo(false);
  };

  const handleOpenDialogTurno = (turno: Turno | null, cupo: Cupo) => {
    setSelectedTurno(turno);
    setSelectedCupo(cupo);
    setOpenDialogTurno(true);
  };
  const handleCloseDialogTurno = () => {
    setSelectedTurno(null);
    setSelectedCupo(null);
    setOpenDialogTurno(false);
  };

  const handleOpenDialogError = (error: any) => {
    setSelectedError(error);
    setOpenDialogError(true);
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
        if (selectedView.value === "ERRORES") {
          backgroundColor = isSelected ? theme.colores.azul : "#fff";
          color = isSelected ? "#fff" : theme.colores.azul;
          border = isSelected ? `1px solid ${theme.colores.azul}` : `1px solid #ccc`;
        } else {
          const cupo = cupos.find((c) => c.fecha === date);
          const hasAvailability = cupo ? cupo.cupos > 0 : false;
          backgroundColor = isSelected ? theme.colores.azul : (hasAvailability ? "#418C75" : "red");
          color = isSelected ? "#fff" : "#fff";
          border = isSelected ? `1px solid ${theme.colores.azul}` : "1px solid black";
        }
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
          handleOpenDialog={() => handleOpenDialogTurno(turno, cupo)}
          tituloField="colaborador.nombre"
          subtituloField="colaborador.cuil"
        />
      </Box>
    ));
  };

  // Render de turnos con errores (lista vertical)
  const renderErrores = (errores: any[], cupo: Cupo) => {
    const errorFields = [
      "id",
      "cuilColaborador",
      "cuitEmpresa",
      "patenteCamion",
      "patenteAcoplado",
      "patenteAcopladoExtra",
      "kgCargados",
      "kgDescargados",
      "numeroOrdenPago",
    ];
    const errorHeaderNames = [
      "ID",
      "CUIL Colaborador",
      "CUIT Empresa",
      "Patente Camión",
      "Patente Acoplado",
      "Patente Acoplado Extra",
      "Kg Cargados",
      "Kg Descargados",
      "Nro Orden de Pago",
    ];

    if (!errores || errores.length === 0) {
      return (
        <Box padding={2}>
          <Typography variant="body2">No hay turnos con errores para este cupo</Typography>
        </Box>
      );
    }
    return errores.map((error, index) => (
      <Box key={error.id || index}>
        <CardMobile
          item={error}
          index={index}
          fields={errorFields}
          headerNames={errorHeaderNames}
          expandedCard={expandedCard}
          handleExpandClick={handleExpandClick}
          handleOpenDialog={() => handleOpenDialogError(error)}
          tituloField="id"
          subtituloField="fechaCreacion"
        />
      </Box>
    ));
  };

  return (
    <Box padding={2}>
      <Typography variant="h5" gutterBottom>
        Cupos
      </Typography>

      {/* Toggle para Turnos vs Errores */}
      <Box display="flex" justifyContent="center" my={2}>
        <ToggleButtonGroup
          value={selectedView.value}
          exclusive
          onChange={(_, newValue) => {
            if (newValue !== null) {
              setSelectedView({
                label: newValue === "TURNOS" ? "Turnos" : "Con Errores",
                value: newValue,
              });
            }
          }}
          sx={{ width: "100%" }}
        >
          <ToggleButton
            value="TURNOS"
            sx={{
              width: "50%",
              textTransform: "none",
              backgroundColor: selectedView.value === "TURNOS" ? theme.colores.azul : "transparent",
              color: selectedView.value === "TURNOS" ? "white" : "black",
              "&.Mui-selected": {
                backgroundColor: theme.colores.azul,
                color: "white",
              },
            }}
          >
            Turnos
          </ToggleButton>
          <ToggleButton
            value="ERRORES"
            sx={{
              width: "50%",
              textTransform: "none",
              backgroundColor: selectedView.value === "ERRORES" ? theme.colores.azul : "transparent",
              color: selectedView.value === "ERRORES" ? "white" : "black",
              "&.Mui-selected": {
                backgroundColor: theme.colores.azul,
                color: "white",
              },
            }}
          >
            Con Errores
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {selectedView.value !== "ERRORES" && (
        <Box display="flex" justifyContent="center" mb={2}>
          <Button
            onClick={handleClickCrearCupo}
            sx={{
              backgroundColor: "#fff",
              color: theme.colores.azul,
              border: `1px solid ${theme.colores.azul}`,
              textTransform: "none",
              fontWeight: "600",
              width: "100%",
              "&:hover": {
                backgroundColor: "#fff",
                opacity: 0.8,
              },
            }}
          >
            + Agregar Cupo
          </Button>
        </Box>
      )}

      {estadoCarga === "Cargando" && (
        <Box
          display="flex"
          flexDirection="row"
          width="100%"
          height="100%"
          justifyContent="center"
          alignItems="center"
          gap={3}
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
                selectedView.value === "TURNOS" ? (
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
                  <>
                    {filteredCupos.map((cupo, idx) =>
                      cupo.turnosConErrores && cupo.turnosConErrores.length > 0 ? (
                        <Box key={idx} mb={4} p={2} sx={{ backgroundColor: "#fff" }}>
                            <Box sx={{ marginBottom: 2 }}>
                              <Typography variant="h6">Fecha: {cupo.fecha}</Typography>
                            </Box>
                          {/* Lista vertical de turnos con errores */}
                          <Box
                            mt={2}
                            sx={{
                              display: "flex",
                              flexDirection: "column",
                              gap: 2,
                            }}
                          >
                            {renderErrores(cupo.turnosConErrores, cupo)}
                          </Box>
                        </Box>
                      ) : null
                    )}
                    {!filteredCupos.some(
                      (cupo) => cupo.turnosConErrores && cupo.turnosConErrores.length > 0
                    ) && (
                      <Box display="flex" justifyContent="center" alignItems="center" height="200px">
                        <Typography variant="body1">
                          No hay turnos con errores para la fecha seleccionada
                        </Typography>
                      </Box>
                    )}
                  </>
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
            }}
            handleClose={handleCloseDialogError}
          />
        </DialogContent>
      </Dialog>
    </Box>
  );
}
