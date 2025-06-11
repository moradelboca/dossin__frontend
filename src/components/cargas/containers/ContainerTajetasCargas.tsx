import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import Box from "@mui/material/Box";
import React, { createContext, useCallback } from "react";
import CrearCargaStepper from "../creadores/CrearCargaStepper";
import DeleteCarga from "../creadores/DeleteCarga";
import MainContent from "./MainContent";
import Sidebar from "./Sidebar";
import { useAuth } from "../../autenticacion/ContextoAuth";

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
  cargaSeleccionada: any;
  setCargaSeleccionada: React.Dispatch<React.SetStateAction<any>>;
  cupos: any[];
  onCargaUpdated?: (carga: any) => void;
  onRefresh: () => void; // Añadir esta prop
}

export function ContainerTarjetasCargas({
  cargas,
  estadoCarga,
  cargaSeleccionada,
  setCargaSeleccionada,
  cupos,
  onCargaUpdated,
  onRefresh
}: ContainerTarjetasCargasProps) {

  // Estados locales para diálogos, creación, filtros y menú
  const [openDialog, setOpenDialog] = React.useState(false);
  const [openDialogDelete, setOpenDialogDelete] = React.useState(false);
  const [pasoSeleccionado, setPasoSeleccionado] = React.useState<any>(null);
  const [creando, setCreando] = React.useState(false);
  const [provincia, setProvincia] = React.useState<number | null>(null);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const menuOpen = Boolean(anchorEl);

  const { user } = useAuth();
  const rolId = user?.rol?.id;

  // Handler para seleccionar una carga (usa la función del padre)
  const handleCardClick = useCallback((carga: any) => {
    setCargaSeleccionada(carga);
  }, [setCargaSeleccionada]);

  const handleClickAbrirDialog = useCallback((paso: any) => {
    setPasoSeleccionado(paso);
    setOpenDialog(true);
  }, []);

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setOpenDialogDelete(false);
    setCreando(false);
  };

  const handleClickDeleteCarga = () => {
    setOpenDialogDelete(true);
  };

  // Handlers para el filtro por provincia
  const handleProvinciaChange = (value: number | null) => {
    setProvincia(value);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleDeleteSuccess = useCallback(() => {
    onRefresh();
    setCargaSeleccionada(null); // Limpiar selección
  }, [onRefresh]);

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
          menuOpen={menuOpen}
          anchorEl={anchorEl}
          onMenuClose={handleMenuClose}
          onCardClick={handleCardClick}
          cargaSeleccionada={cargaSeleccionada}
        />

        {/* Contenido principal */}
        <MainContent
          cargaSeleccionada={cargaSeleccionada}
          onDeleteCarga={handleClickDeleteCarga}
          rolId={rolId}
        />

        {/* Diálogos */}
        <CrearCargaDialog
          open={openDialog}
          creando={creando}
          cargaSeleccionada={cargaSeleccionada}
          pasoSeleccionado={pasoSeleccionado}
          onClose={handleCloseDialog}
          onCargaUpdated={onCargaUpdated}
        />
        <DeleteCargaDialog 
          open={openDialogDelete} 
          onClose={handleCloseDialog}
          onDeleteSuccess={handleDeleteSuccess}
        />
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
  onCargaUpdated?: (carga: any) => void;
}

const CrearCargaDialog: React.FC<CrearCargaDialogProps> = ({
  open,
  creando,
  cargaSeleccionada,
  pasoSeleccionado,
  onClose,
  onCargaUpdated
}) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth
      PaperProps={{
        sx: {
          m: { xs: 1, sm: 2 }, // margen exterior en móvil y tablet
          width: '100%',
          maxWidth: { xs: '98vw', sm: '95vw', md: '900px', lg: '1100px' },
        }
      }}
    >
      <DialogTitle>
        {creando ? "Crear Nueva Carga" : "Modificando Carga"}
      </DialogTitle>
      <DialogContent
        sx={{
          height: { xs: 'auto', sm: '80vh' },
          alignContent: "center",
          px: { xs: 1, sm: 3 }, // padding lateral responsivo
          py: { xs: 1, sm: 2 },
          boxSizing: 'border-box',
        }}
      >
        <CrearCargaStepper
          datosCarga={cargaSeleccionada}
          pasoSeleccionado={pasoSeleccionado}
          handleCloseDialog={onClose}
          creando={creando}
          onCargaUpdated={onCargaUpdated}
        />
      </DialogContent>
    </Dialog>
  );
};

interface DeleteCargaDialogProps {
  open: boolean;
  onClose: () => void;
  onDeleteSuccess?: () => void;
}

const DeleteCargaDialog: React.FC<DeleteCargaDialogProps> = ({
  open,
  onClose,
  onDeleteSuccess
}) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DeleteCarga 
        handleCloseDialog={onClose}
        onDeleteSuccess={onDeleteSuccess}
      />
    </Dialog>
  );
};
