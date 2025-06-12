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
      // 1. Traer cupos
      const cuposRes = await fetch(`${backendURL}/cargas/${idCarga}/cupos`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
      });
      const cuposData = await cuposRes.json();
      // 2. Traer todos los turnos
      const turnosRes = await fetch(`${backendURL}/turnos`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
      });
      const turnosData = await turnosRes.json();
      // 3. Indexar turnos por id
      const turnosById = Array.isArray(turnosData)
        ? Object.fromEntries(turnosData.map((t: any) => [t.id, t]))
        : (turnosData.turnos ? Object.fromEntries(turnosData.turnos.map((t: any) => [t.id, t])) : {});
      // 4. Reemplazar cada turno en cada cupo por el objeto completo
      const cuposClonados = cuposData.map((cupo: any) => ({
        ...cupo,
        turnos: Array.isArray(cupo.turnos)
          ? cupo.turnos.map((turno: any) => {
              const fullTurno = turnosById[turno.id] || turno;
              return {
                ...fullTurno,
                camion: typeof fullTurno.camion === "string" ? { patente: fullTurno.camion } : fullTurno.camion,
                acoplado: typeof fullTurno.acoplado === "string" ? { patente: fullTurno.acoplado } : fullTurno.acoplado,
                acopladoExtra: typeof fullTurno.acopladoExtra === "string" ? { patente: fullTurno.acopladoExtra } : fullTurno.acopladoExtra,
              };
            })
          : [],
        turnosConErrores: Array.isArray(cupo.turnosConErrores)
          ? cupo.turnosConErrores.map((turno: any) => {
              const fullTurno = turnosById[turno.id] || turno;
              return {
                ...fullTurno,
                camion: typeof fullTurno.camion === "string" ? { patente: fullTurno.camion } : fullTurno.camion,
                acoplado: typeof fullTurno.acoplado === "string" ? { patente: fullTurno.acoplado } : fullTurno.acoplado,
                acopladoExtra: typeof fullTurno.acopladoExtra === "string" ? { patente: fullTurno.acopladoExtra } : fullTurno.acopladoExtra,
              };
            })
          : [],
      }));
      setCupos(cuposClonados);
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
        />
      ) : null}
      {!isIngeniero && selectedTab === "GRID" && (
        <CuposGridContainer cupos={cupos} refreshCupos={refreshCupos} />
      )}
      {!isIngeniero && selectedTab === "POR_DIA" && (
        <CuposGridPorDiaContainer
          cupos={cupos}
          refreshCupos={refreshCupos}
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
