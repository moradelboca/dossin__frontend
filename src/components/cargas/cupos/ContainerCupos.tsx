// ContainerCupos.tsx
import React, { useState, useEffect, useContext } from "react";
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
} from "@mui/material";
import { BotonIcon } from "../../botones/IconButton";
import { AccessAlarmOutlined } from "@mui/icons-material";
import ClearSharpIcon from "@mui/icons-material/ClearSharp";
import { useParams } from "react-router-dom";
import { ContextoGeneral } from "../../Contexto";
import { CreadorCupos } from "../creadores/CreadorCupos";
import { CuposCardsContainer } from "./tabsCupos/CuposCardsContainer";
import { CuposGridContainer } from "./tabsCupos/CuposGridContainer";
import { CuposGridPorDiaContainer } from "./tabsCupos/CuposGridPorDiaContainer";
//import { cuposPrueba } from "./cuposPrueba";
import CuposMobile from "../../mobile/cupos/CuposMobile";
import { useAuth } from "../../autenticacion/ContextoAuth";

export function ContainerCupos() {
  const { idCarga } = useParams();
  const { backendURL, theme } = useContext(ContextoGeneral);
  const [cupos, setCupos] = useState<any[]>([]);
  const [estadoCarga, setEstadoCarga] = useState("Cargando");
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedTab, setSelectedTab] = useState("CARDS");
  const { user } = useAuth();

  const refreshCupos = async () => {
    setEstadoCarga("Cargando");
    try {
      // 1. Traer cupos (para obtener fechas)
      const cuposRes = await fetch(`${backendURL}/cargas/${idCarga}/cupos`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
      });
      const cuposData = await cuposRes.json();
      // 2. Para cada fecha, traer los turnos de ese cupo
      const cuposConTurnos = await Promise.all(
        cuposData.map(async (cupo: any) => {
          const turnosRes = await fetch(
            `${backendURL}/cargas/${idCarga}/cupos/${cupo.fecha}/turnos`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                "ngrok-skip-browser-warning": "true",
              },
            }
          );
          const turnosData = await turnosRes.json();
          // turnosData puede venir como { turnos: [...] } o como array directo
          const turnos = Array.isArray(turnosData)
            ? turnosData
            : turnosData.turnos || [];
          // turnosConErrores puede venir o no
          const turnosConErrores = turnosData.turnosConErrores || [];
          // Normalizar los campos de patente
          const normalizarTurno = (turno: any) => ({
            ...turno,
            camion:
              typeof turno.camion === "string"
                ? { patente: turno.camion }
                : turno.camion,
            acoplado:
              typeof turno.acoplado === "string"
                ? { patente: turno.acoplado }
                : turno.acoplado,
            acopladoExtra:
              typeof turno.acopladoExtra === "string"
                ? { patente: turno.acopladoExtra }
                : turno.acopladoExtra,
          });
          return {
            ...cupo,
            turnos: Array.isArray(turnos) ? turnos.map(normalizarTurno) : [],
            turnosConErrores: Array.isArray(turnosConErrores)
              ? turnosConErrores.map(normalizarTurno)
              : [],
          };
        })
      );
      setCupos(cuposConTurnos);
      setEstadoCarga("Cargado");
    } catch (e) {
      setEstadoCarga("Cargado");
      setCupos([]);
      console.error("Error al obtener los cupos o turnos", e);
    }
  };

  useEffect(() => {
    refreshCupos();
  }, []);

  // useEffect(() => {
  //   setCupos(cuposPrueba);
  //   setEstadoCarga("Cargado");
  // }, []);

  const handleChangeTab = (_event: React.SyntheticEvent, newValue: string) => {
    setSelectedTab(newValue);
  };

  const handleClickCrearCupo = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

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

  const isMobile = useMediaQuery("(max-width:768px)");

  // Si el usuario es Ingeniero (rol 3), forzar vista CARDS y ocultar tabs
  const isIngeniero = user?.rol?.id === 3;

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
    >
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        width="100%"
        padding={2}
      >
        {!isIngeniero && (
          <Tabs
            value={selectedTab}
            onChange={handleChangeTab}
            textColor="inherit"
            sx={{
              color: theme.colores.azul,
              "& .MuiTab-root": {
                color: "gray",
              },
              "& .Mui-selected": {
                color: theme.colores.azul,
              },
              "& .MuiTabs-indicator": {
                backgroundColor: theme.colores.azul,
              },
            }}
          >
            <Tab value="CARDS" label="CARDS" />
            <Tab value="GRID" label="GRID" />
            <Tab value="POR_DIA" label="POR DÍA" />
          </Tabs>
        )}
        {!isIngeniero && (
          <BotonIcon
            onClick={handleClickCrearCupo}
            title="Quiero crear un nuevo cupo"
            icon={<AccessAlarmOutlined />}
          />
        )}
      </Box>

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

      {(!isIngeniero && selectedTab === "CARDS") || (isIngeniero) ? (
        <CuposCardsContainer
          cupos={cupos}
          fields={fields}
          headerNames={headerNames}
          idCarga={idCarga}
          refreshCupos={refreshCupos}
          estadoCarga={estadoCarga}
        />
      ) : null}
      {!isIngeniero && selectedTab === "GRID" && (
        <CuposGridContainer cupos={cupos} refreshCupos={refreshCupos} estadoCarga={estadoCarga} />
      )}
      {!isIngeniero && selectedTab === "POR_DIA" && (
        <CuposGridPorDiaContainer
          cupos={cupos}
          refreshCupos={refreshCupos}
          estadoCarga={estadoCarga}
        />
      )}

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
    </Box>
  );
}
