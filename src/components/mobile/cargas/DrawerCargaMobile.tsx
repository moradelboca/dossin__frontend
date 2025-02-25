import React, { useState } from "react";
import {
  Box,
  Typography,
  styled,
  Tab,
  Tabs,
  SwipeableDrawer,
} from "@mui/material";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import DrawerCuposCargaMobile from "./DrawerCuposCargaMobile";
import DrawerDatosCargaMobile from "./DrawerDatosCargaMobile";

interface DrawerCargaMobileProps {
  open?: boolean; 
  onClose?: () => void; 
  cargaSeleccionada: any;
}

const CustomTabs = styled(Tabs)(() => ({
  borderRadius: 6,
  border: "0.5px solid lightgray",
  backgroundColor: "#fff",
  color: "#163660",
  minHeight: "32px",
  "& .MuiTabs-flexContainer": {
    display: "inline-flex",
    width: "100%",
  },
  "& .MuiTab-root": {
    flex: 1,
    minHeight: 32, 
    padding: "4px 8px", 
    fontSize: "0.8rem",
    fontWeight: 600,
    transition: "all 0.2s",
    color: "#163660",
    textTransform: "none",
    "&.Mui-selected": {
      color: "#fff",
      backgroundColor: "#163660",
    },
  },
  "& .MuiTabs-indicator": {
    display: "none",
  },
}));

export default function DrawerCargaMobile({
  open = true,
  onClose = () => {},
  cargaSeleccionada,
}: DrawerCargaMobileProps) {
  // Controla si el drawer está colapsado (3rem) o expandido (60vh)
  const [expanded, setExpanded] = useState(false);

  // Controla la pestaña activa (0 = Cupos, 1 = Datos)
  const [tabValue, setTabValue] = useState(0);

  const handleChangeTab = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const toggleExpanded = () => {
    setExpanded((prev) => !prev);
  };

  // Si no hay cargaSeleccionada, no renderizamos nada
  if (!cargaSeleccionada) return null;

  return (
    <SwipeableDrawer
  anchor="bottom"
  open={open}
  onOpen={() => {}}
  onClose={onClose}  // Asegúrate de usar la prop onClose
  hideBackdrop
  disableSwipeToOpen
  disableDiscovery
  ModalProps={{
    keepMounted: true,
    // Permite interacción con elementos fuera del drawer
    style: { pointerEvents: 'none' },
    BackdropProps: {
      style: { backgroundColor: 'transparent', pointerEvents: 'none' },
    },
  }}
  PaperProps={{
    sx: {
      pointerEvents: 'auto', // Permite interacción dentro del drawer
      height: expanded ? '60vh' : '3rem',
      transition: 'height 0.3s ease',
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
      boxShadow: '0px -2px 10px rgba(0,0,0,0.1)',
      overflow: 'hidden',
    },
  }}
>
      <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
        {/* Flecha superior para colapsar/expandir */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            p: 1,
            cursor: "pointer",
            borderBottom: expanded ? "1px solid #E0E0E0" : "none",
          }}
          onClick={toggleExpanded}
        >
          <ArrowDownwardIcon
            sx={{
              transform: expanded ? "rotate(0deg)" : "rotate(180deg)",
              transition: "transform 0.3s ease",
            }}
          />
        </Box>

        {/* Si está colapsado, no mostramos contenido */}
        {expanded && (
          <>
            <Box sx={{ p: 2 }}>
              <Typography variant="body2" sx={{ color: "#90979f", mb: 0.5 }}>
                Seleccionado:
              </Typography>
              <Typography variant="h6" fontWeight="bold" color="#333">
                #{cargaSeleccionada.id}, {cargaSeleccionada?.cargamento?.nombre}
              </Typography>
            </Box>

            <Box sx={{ px: 2, pb: 1 }}>
              <CustomTabs value={tabValue} onChange={handleChangeTab}>
                <Tab label="Cupos" />
                <Tab label="Datos" />
              </CustomTabs>
            </Box>

            <Box sx={{ flex: 1, overflowY: "auto" }}>
              {tabValue === 0 && (
                <DrawerCuposCargaMobile cargaSeleccionada={cargaSeleccionada} />
              )}
              {tabValue === 1 && (
                <DrawerDatosCargaMobile cargaSeleccionada={cargaSeleccionada} />
              )}
            </Box>
          </>
        )}
      </Box>
    </SwipeableDrawer>
  );
}
