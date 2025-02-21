import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import Box from "@mui/material/Box";
import React, { createContext, MouseEvent, useCallback } from "react";
import CrearCargaStepper from "../creadores/CrearCargaStepper";
import DeleteCarga from "../creadores/DeleteCarga";
import MainContent from "./MainContent";
import Sidebar from "./Sidebar";

// Contexto para compartir estados internos (ahora usa los valores pasados como props)
export const ContextoCargas = createContext<{
  cargaSeleccionada: any;
  setCargaSeleccionada: React.Dispatch<React.SetStateAction<any>>;
  handleClickAbrirDialog: (paso: any) => void;
  cupos: any[];
}>({
  cargaSeleccionada: null,
  setCargaSeleccionada: () => {},
  handleClickAbrirDialog: () => {},
  cupos: [],
});

interface ContainerTarjetasCargasProps {
  cargas: any[];
  estadoCarga: string;
  refreshCargas: () => void;
  cargaSeleccionada: any;
  setCargaSeleccionada: React.Dispatch<React.SetStateAction<any>>;
  cupos: any[];
}

export function ContainerTarjetasCargas({
  cargas,
  estadoCarga,
  refreshCargas,
  cargaSeleccionada,
  setCargaSeleccionada,
  cupos,
}: ContainerTarjetasCargasProps) {

  // Estados locales para diálogos, creación, filtros y menú
  const [openDialog, setOpenDialog] = React.useState(false);
  const [openDialogDelete, setOpenDialogDelete] = React.useState(false);
  const [pasoSeleccionado, setPasoSeleccionado] = React.useState<any>(null);
  const [creando, setCreando] = React.useState(false);
  const [provincia, setProvincia] = React.useState<string | null>(null);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const menuOpen = Boolean(anchorEl);

  // Handler para seleccionar una carga (usa la función del padre)
  const handleCardClick = useCallback((carga: any) => {
    setCargaSeleccionada(carga);
  }, [setCargaSeleccionada]);

  const handleClickAbrirDialog = useCallback((paso: any) => {
    setPasoSeleccionado(paso);
    setOpenDialog(true);
  }, []);

  const handleCrearCarga = () => {
    setCreando(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setOpenDialogDelete(false);
    setCreando(false);
  };

  const handleClickDeleteCarga = () => {
    setOpenDialogDelete(true);
  };

  // Handlers para el filtro por provincia
  const handleProvinciaChange = (_event: any, seleccionado: any | null) => {
    setProvincia(seleccionado?.value || null);
  };

  const handleMenuClick = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <ContextoCargas.Provider
      value={{
        cargaSeleccionada,
        setCargaSeleccionada,
        handleClickAbrirDialog,
        cupos,
      }}
    >
      <Box
        sx={{
          p: 1,
          width: "100%",
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "row",
          gap: 1,
          maxHeight: "100%",
          height: "100%",
          padding: "1.2rem",
        }}
      >
        {/* Sidebar: listado de cargas y filtros */}
        <Sidebar
          cargas={cargas}
          estadoCarga={estadoCarga}
          provincia={provincia}
          onProvinciaChange={handleProvinciaChange}
          onMenuClick={handleMenuClick}
          menuOpen={menuOpen}
          anchorEl={anchorEl}
          onMenuClose={handleMenuClose}
          onCrearCarga={() => {
            handleClickAbrirDialog(0);
            handleCrearCarga();
          }}
          onCardClick={handleCardClick}
          cargaSeleccionada={cargaSeleccionada}
        />

        {/* Contenido principal */}
        <MainContent
          cargaSeleccionada={cargaSeleccionada}
          onDeleteCarga={handleClickDeleteCarga}
        />

        {/* Diálogos */}
        <CrearCargaDialog
          open={openDialog}
          creando={creando}
          cargaSeleccionada={cargaSeleccionada}
          pasoSeleccionado={pasoSeleccionado}
          onClose={handleCloseDialog}
          refreshCargas={refreshCargas}
        />
        <DeleteCargaDialog open={openDialogDelete} onClose={handleCloseDialog} />
      </Box>
    </ContextoCargas.Provider>
  );
}

interface CrearCargaDialogProps {
  open: boolean;
  creando: boolean;
  cargaSeleccionada: any;
  pasoSeleccionado: any;
  onClose: () => void;
  refreshCargas: () => void;
}

const CrearCargaDialog: React.FC<CrearCargaDialogProps> = ({
  open,
  creando,
  cargaSeleccionada,
  pasoSeleccionado,
  onClose,
  refreshCargas,
}) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        {creando ? "Crear Nueva Carga" : "Modificando Carga"}
      </DialogTitle>
      <DialogContent sx={{ height: "80vh", alignContent: "center" }}>
        <CrearCargaStepper
          datosCarga={cargaSeleccionada}
          pasoSeleccionado={pasoSeleccionado}
          handleCloseDialog={onClose}
          creando={creando}
          refreshCargas={refreshCargas}
        />
      </DialogContent>
    </Dialog>
  );
};

interface DeleteCargaDialogProps {
  open: boolean;
  onClose: () => void;
}

const DeleteCargaDialog: React.FC<DeleteCargaDialogProps> = ({
  open,
  onClose,
}) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DeleteCarga handleCloseDialog={onClose} />
    </Dialog>
  );
};
