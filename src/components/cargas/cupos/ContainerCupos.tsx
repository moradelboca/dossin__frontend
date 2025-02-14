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
  TextField,
  Autocomplete,
} from "@mui/material";
import { BotonIcon } from "../../botones/IconButton";
import { AccessAlarmOutlined } from "@mui/icons-material";
import ClearSharpIcon from "@mui/icons-material/ClearSharp";
import { useParams } from "react-router-dom";
import { ContextoGeneral } from "../../Contexto";
import { CreadorCupos } from "../creadores/CreadorCupos";
import { CuposCardsContainer } from "./tabsCupos/CuposCardsContainer";
import { ErroresCuposCardsContainer } from "./tabsCupos/ErroresCuposCardsContainer"; // <-- Importa el nuevo componente
import { CuposGridContainer } from "./tabsCupos/CuposGridContainer";
import { CuposGridPorDiaContainer } from "./tabsCupos/CuposGridPorDiaContainer";
import { cuposPrueba } from "./cuposPrueba";

export function ContainerCupos() {
  const { idCarga } = useParams();
  const { backendURL, theme } = useContext(ContextoGeneral);
  const [cupos, setCupos] = useState<any[]>([]);
  const [estadoCarga, setEstadoCarga] = useState("Cargando");
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedTab, setSelectedTab] = useState("CARDS");

  // Nuevo state para alternar entre Turnos y Con Errores
  const [selectedView, setSelectedView] = useState<{ label: string; value: string }>({
    label: "Turnos",
    value: "TURNOS",
  });

  const refreshCupos = () => {
    fetch(`${backendURL}/cargas/${idCarga}/cupos`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true",
      },
    })
      .then((response) => response.json())
      .then((cupos) => {
        setCupos(cupos);
        setEstadoCarga("Cargado");
        console.log(cupos);
      })
      .catch(() => {
        console.error("Error al obtener los cupos disponibles");
      });
  };

  //useEffect(() => {
  //  refreshCupos();
  //}, []);

  // Si deseas usar datos de prueba, puedes descomentar lo siguiente:
  useEffect(() => {
    setCupos(cuposPrueba);
    setEstadoCarga("Cargado");
  }, []);

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
    "tara.pesoNeto",
    "camion.patente",
    "acoplado.patente",
    "acopladoExtra.patente",
    "cartaDePorte.CTG",
    "kgCargados",
    "kgDescargados",
    "precioGrano",
    "numeroOrdenPago",
  ];

  const headerNames = [
    "Estado",
    "Camión",
    "Tara",
    "Patente Camion",
    "Patente Acoplado",
    "Patente Acoplado Extra",
    "CTG",
    "Kg Cargados",
    "Kg Descargados",
    "Precio Grano",
    "Nro Orden de Pago",
  ];

  return (
    <Box display="flex" flexDirection="column" alignItems="center" width="100%" marginTop={2}>
      <Box display="flex" justifyContent="space-between" alignItems="center" width="100%" padding={2}>
        <Tabs value={selectedTab} onChange={handleChangeTab} textColor="inherit">
          <Tab value="CARDS" label="CARDS" />
          <Tab value="GRID" label="GRID" />
          <Tab value="POR_DIA" label="POR DÍA" />
        </Tabs>
        <BotonIcon
          onClick={handleClickCrearCupo}
          title="Quiero crear un nuevo cupo"
          icon={<AccessAlarmOutlined />}
        />
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
              <Box display="flex" justifyContent="center" my={2}>
                <Autocomplete
                  value={selectedView}
                  onChange={(event, newValue) => {
                    if (newValue) setSelectedView(newValue);
                  }}
                  options={[
                    { label: "Turnos", value: "TURNOS" },
                    { label: "Con Errores", value: "ERRORES" },
                  ]}
                  getOptionLabel={(option) => option.label}
                  renderInput={(params) => <TextField {...params} label="Ver" variant="outlined" />}
                  sx={{ width: 200 }}
                />
              </Box>
              {selectedView.value === "TURNOS" ? (
                <CuposCardsContainer
                  cupos={cupos}
                  fields={fields}
                  headerNames={headerNames}
                  idCarga={idCarga}
                  refreshCupos={refreshCupos}
                />
              ) : (
                <ErroresCuposCardsContainer cupos={cupos} idCarga={idCarga} refreshCupos={refreshCupos} />
              )}
            </>
          )}
          {selectedTab === "GRID" && <CuposGridContainer cupos={cupos} refreshCupos={refreshCupos} />}
          {selectedTab === "POR_DIA" && (
            <CuposGridPorDiaContainer cupos={cupos} refreshCupos={refreshCupos} />
          )}
        </Box>
      )}

      <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="sm">
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
          <CreadorCupos idCarga={idCarga} refreshCupos={refreshCupos} handleCloseDialog={handleCloseDialog} />
        </DialogContent>
      </Dialog>
    </Box>
  );
}
