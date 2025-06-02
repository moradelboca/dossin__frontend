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
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import { BotonIcon } from "../../botones/IconButton";
import { AccessAlarmOutlined } from "@mui/icons-material";
import ClearSharpIcon from "@mui/icons-material/ClearSharp";
import { useParams } from "react-router-dom";
import { ContextoGeneral } from "../../Contexto";
import { CreadorCupos } from "../creadores/CreadorCupos";
import { CuposCardsContainer } from "./tabsCupos/CuposCardsContainer";
import { ErroresCuposCardsContainer } from "./tabsCupos/ErroresCuposCardsContainer";
import { CuposGridContainer } from "./tabsCupos/CuposGridContainer";
import { ErroresCuposGridContainer } from "./tabsCupos/ErroresCuposGridContainer";
import { CuposGridPorDiaContainer } from "./tabsCupos/CuposGridPorDiaContainer";
import { ErroresCuposGridPorDiaContainer } from "./tabsCupos/ErroresCuposGridPorDiaContainer";
//import { cuposPrueba } from "./cuposPrueba";
import CuposMobile from "../../mobile/cupos/CuposMobile";

export function ContainerCupos() {
  const { idCarga } = useParams();
  const { backendURL, theme } = useContext(ContextoGeneral);
  const [cupos, setCupos] = useState<any[]>([]);
  const [estadoCarga, setEstadoCarga] = useState("Cargando");
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedTab, setSelectedTab] = useState("CARDS");

  // State para elegir entre Turnos y Con Errores (para todas las tabs)
  const [selectedView, setSelectedView] = useState<{
    label: string;
    value: string;
  }>({
    label: "Turnos",
    value: "TURNOS",
  });

  const refreshCupos = () => {
    setEstadoCarga("Cargando");
    fetch(`${backendURL}/cargas/${idCarga}/cupos`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true",
      },
    })
      .then((response) => response.json())
      .then((cupos) => {
        // Forzar nueva referencia de objetos internos y arrays internos y normalizar campos
        const cuposClonados = cupos.map((cupo: any) => ({
          ...cupo,
          turnos: Array.isArray(cupo.turnos)
            ? cupo.turnos.map((turno: any) => ({
                ...turno,
                camion: typeof turno.camion === "string" ? { patente: turno.camion } : turno.camion,
                acoplado: typeof turno.acoplado === "string" ? { patente: turno.acoplado } : turno.acoplado,
                acopladoExtra: typeof turno.acopladoExtra === "string" ? { patente: turno.acopladoExtra } : turno.acopladoExtra,
              }))
            : [],
          turnosConErrores: Array.isArray(cupo.turnosConErrores)
            ? cupo.turnosConErrores.map((turno: any) => ({
                ...turno,
                camion: typeof turno.camion === "string" ? { patente: turno.camion } : turno.camion,
                acoplado: typeof turno.acoplado === "string" ? { patente: turno.acoplado } : turno.acoplado,
                acopladoExtra: typeof turno.acopladoExtra === "string" ? { patente: turno.acopladoExtra } : turno.acopladoExtra,
              }))
            : [],
        }));
        setCupos(cuposClonados);
        setEstadoCarga("Cargado");
      })
      .catch(() => {
        setEstadoCarga("Cargado");
        console.error("Error al obtener los cupos disponibles");
      });
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

  if (isMobile) {
    return (
      <CuposMobile
        cupos={cupos}
        estadoCarga={estadoCarga}
        selectedView={selectedView}
        setSelectedView={setSelectedView}
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

        {selectedView.value !== "ERRORES" && (
          <BotonIcon
            onClick={handleClickCrearCupo}
            title="Quiero crear un nuevo cupo"
            icon={<AccessAlarmOutlined />}
          />
        )}
      </Box>

      {/* Selector para Turnos / Con Errores: se aplica para todas las tabs */}
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
        >
          <ToggleButton
            value="TURNOS"
            sx={{
              backgroundColor:
                selectedView.value === "TURNOS"
                  ? theme.colores.azul
                  : "transparent",
              color: selectedView.value === "TURNOS" ? "white" : "black",
              "&.Mui-selected": {
                backgroundColor: theme.colores.azul, // Aquí puedes cambiar el color al que desees
                color: "white", // El color del texto cuando está seleccionado
              },
            }}
          >
            Turnos
          </ToggleButton>
          <ToggleButton
            value="ERRORES"
            sx={{
              backgroundColor:
                selectedView.value === "ERRORES"
                  ? theme.colores.azul
                  : "transparent",
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
        <Box width="100%">
          {selectedTab === "CARDS" && (
            <>
              {selectedView.value === "TURNOS" ? (
                <CuposCardsContainer
                  cupos={cupos}
                  fields={fields}
                  headerNames={headerNames}
                  idCarga={idCarga}
                  refreshCupos={refreshCupos}
                />
              ) : (
                <ErroresCuposCardsContainer
                  cupos={cupos}
                  idCarga={idCarga}
                  refreshCupos={refreshCupos}
                />
              )}
            </>
          )}
          {selectedTab === "GRID" && (
            <>
              {selectedView.value === "TURNOS" ? (
                <CuposGridContainer cupos={cupos} refreshCupos={refreshCupos} />
              ) : (
                <ErroresCuposGridContainer
                  idCarga={idCarga}
                  cupos={cupos}
                  refreshCupos={refreshCupos}
                />
              )}
            </>
          )}
          {selectedTab === "POR_DIA" && (
            <>
              {selectedView.value === "TURNOS" ? (
                <CuposGridPorDiaContainer
                  cupos={cupos}
                  refreshCupos={refreshCupos}
                />
              ) : (
                <ErroresCuposGridPorDiaContainer
                  idCarga={idCarga}
                  cupos={cupos}
                  refreshCupos={refreshCupos}
                />
              )}
            </>
          )}
        </Box>
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
