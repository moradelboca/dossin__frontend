// CargasMobile.tsx
import React, { useContext, useState } from "react";
import {
  Box,
  Typography,
  Button,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { ContextoCargas } from "../../cargas/containers/ContainerTajetasCargas";
import { Mapa2 } from "../../cargas/tarjetas/Mapa2";
import ListaCargasMobile from "./ListaCargasMobile";
import { ContextoGeneral } from "../../Contexto";
import DrawerCargaMobile from "./DrawerCargaMobile";
import { useAuth } from "../../autenticacion/ContextoAuth";
import SwipeableDrawer from "@mui/material/SwipeableDrawer";

interface CargasMobileProps {
  cargas: any[];
  estadoCarga: string;
  cargaSeleccionada: any;
  setCargaSeleccionada: React.Dispatch<React.SetStateAction<any>>;
  cupos: any[];
}

export function CargasMobile({
  cargas,
  estadoCarga,
  cargaSeleccionada,
  setCargaSeleccionada,
}: CargasMobileProps) {
  const { theme } = useContext(ContextoGeneral);
  const [openDrawer, setOpenDrawer] = useState(false); // Controla la lista de cargas
  const [openDrawerCarga, setOpenDrawerCarga] = useState(false); // Controla el Drawer con Cupos/Datos

  const { handleClickAbrirDialog } = useContext(ContextoCargas);
  const { user } = useAuth();
  const rolId = user?.rol?.id;

  // Abre/cierra la lista de cargas
  const toggleDrawer = () => {
    setOpenDrawer((prev) => !prev);
  };

  // Seleccionar una carga de la lista
  const handleCardClick = (carga: any) => {
    setCargaSeleccionada(carga);
    setOpenDrawer(false);
    // Al seleccionar una carga, se abre el Drawer de la carga
    setOpenDrawerCarga(true);
  };

  // Crear carga -> abre el paso 0 en tu Stepper
  const handleCrearCarga = () => {
    if (handleClickAbrirDialog) {
      handleClickAbrirDialog(0);
    }
    setOpenDrawer(false);
  };

  // Cierra el Drawer de la carga
  const handleToggleDrawerCarga = () => {
    setOpenDrawerCarga(false);
  };

  return (
    <Box
      sx={{
        width: "100%",
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        position: "relative",
      }}
    >
      {/* Cuadro blanco con 'Cargas' y botón de lista */}
      <Box
        sx={{
          width: '100%',
          backgroundColor: '#fff',
          borderRadius: 2,
          boxShadow: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 2,
          py: 1.5,
          position: 'relative',
          zIndex: 2,
          mt: 0,
        }}
      >
        <Typography
          variant="h6"
          sx={{ color: theme.colores.azul }}
        >
          Cargas
        </Typography>
        <Button
          onClick={toggleDrawer}
          variant="contained"
          sx={{
            background: theme.colores.azul,
            color: "#FFFFFF",
            borderRadius: "5%",
            textTransform: "none",
            padding: "6px 12px",
          }}
          startIcon={!openDrawer ? <MenuIcon /> : null}
        >
          {openDrawer ? "Cancelar" : "Lista"}
        </Button>
        <SwipeableDrawer
          anchor="bottom"
          open={openDrawer}
          onOpen={() => {}}
          onClose={toggleDrawer}
          disableSwipeToOpen
          disableDiscovery
          ModalProps={{
            keepMounted: true,
            style: { pointerEvents: 'none' },
            BackdropProps: {
              style: { backgroundColor: 'transparent', pointerEvents: 'none' },
            },
          }}
          PaperProps={{
            sx: {
              pointerEvents: 'auto',
              height: '80vh',
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
              boxShadow: '0px -2px 10px rgba(0,0,0,0.1)',
              overflow: 'hidden',
            },
          }}
        >
          <ListaCargasMobile
            cargas={cargas}
            estadoCarga={estadoCarga}
            cargaSeleccionada={cargaSeleccionada}
            onCardClick={handleCardClick}
            onCrearCarga={handleCrearCarga}
          />
        </SwipeableDrawer>
      </Box>

      {/* Mapa ocupando el resto de la pantalla */}
      <Box
        sx={{
          width: "100%",
          flex: 1,
          minHeight: 0,
          position: "relative",
          zIndex: 1,
          display: 'flex',
        }}
      >
        <Mapa2
          coordenadasBalanza={[
            cargaSeleccionada?.ubicacionBalanza?.latitud,
            cargaSeleccionada?.ubicacionBalanza?.longitud,
          ]}
          coordenadasCarga={[
            cargaSeleccionada?.ubicacionCarga?.latitud,
            cargaSeleccionada?.ubicacionCarga?.longitud,
          ]}
          coordenadasDescarga={[
            cargaSeleccionada?.ubicacionDescarga?.latitud,
            cargaSeleccionada?.ubicacionDescarga?.longitud,
          ]}
          sx={{ width: "100%", height: "100%" }}
        />
      </Box>

      {/* Drawer con la info de la carga (Cupos / Datos) se oculta si el listado está desplegado */}
      <DrawerCargaMobile
        open={openDrawerCarga && !openDrawer}
        onClose={handleToggleDrawerCarga}
        cargaSeleccionada={cargaSeleccionada}
        rolId={rolId}
      />
    </Box>
  );
}

export default CargasMobile;
