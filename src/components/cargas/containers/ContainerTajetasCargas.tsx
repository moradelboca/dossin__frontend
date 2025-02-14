/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
    MouseEvent,
  } from "react";
  import Box from "@mui/material/Box";
  import {
    Dialog,
    DialogContent,
    DialogTitle,
  } from "@mui/material";
  import CrearCargaStepper from "../creadores/CrearCargaStepper";
  import DeleteCarga from "../creadores/DeleteCarga";
  import { ContextoGeneral } from "../../Contexto";
  import MainContent from "./MainContent";
  import Sidebar from "./Sidebar";
  
  // Definimos el contexto para las cargas
  export const ContextoCargas = createContext<{
    cargaSeleccionada: Record<string, any>;
    setCargaSeleccionada: React.Dispatch<React.SetStateAction<Record<string, any>>>;
    handleClickAbrirDialog: (paso: any) => void;
    cupos: any[];
  }>({
    cargaSeleccionada: {},
    setCargaSeleccionada: () => {},
    handleClickAbrirDialog: () => {},
    cupos: [],
  });
  
  // Componente principal refactorizado
  export function ContainerTarjetasCargas() {
    const { backendURL } = useContext(ContextoGeneral);
    const [cargas, setCargas] = useState<any[]>([]);
    const [cargaSeleccionada, setCargaSeleccionada] = useState<any>(null);
    const [cupos, setCupos] = useState<any[]>([]);
    const [estadoCarga, setEstadoCarga] = useState("Cargando");
  
    // Estados para diálogos y creación
    const [openDialog, setOpenDialog] = useState(false);
    const [openDialogDelete, setOpenDialogDelete] = useState(false);
    const [pasoSeleccionado, setPasoSeleccionado] = useState<any>(null);
    const [creando, setCreando] = useState(false);
  
    // Estado para el filtro de provincia
    const [provincia, setProvincia] = useState<string | null>(null);
  
    // Estados para el menú del Autocomplete
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const menuOpen = Boolean(anchorEl);
  
    // Función para refrescar las cargas
    const refreshCargas = useCallback(() => {
        fetch(`${backendURL}/cargas`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "ngrok-skip-browser-warning": "true",
            },
          })
            .then((res) => res.json())
            .then((data) => {
              if (Array.isArray(data)) {
                setCargas(data);
                setEstadoCarga("Cargado");
              } else {
                console.error("Error: La respuesta no es un array", data);
              }
            })
            .catch((_e) => {
              console.error("Error al obtener las cargas");
            });
    }, [backendURL]);
  
    // Obtener los cupos de la carga seleccionada
    useEffect(() => {
      if (cargaSeleccionada?.id) {
        fetch(`${backendURL}/cargas/${cargaSeleccionada.id}/cupos`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
          },
        })
          .then((response) => response.json())
          .then(setCupos)
          .catch(() => {
            setCupos([]);
            console.error("Error al obtener los cupos disponibles");
          });
      }
    }, [backendURL, cargaSeleccionada]);
  
    // Actualizar la carga seleccionada si las cargas han cambiado
    useEffect(() => {
      if (cargas.length > 0 && cargaSeleccionada?.id) {
        const cargaActualizada = cargas.find(
          (carga) => carga.id === cargaSeleccionada.id
        );
        if (cargaActualizada) setCargaSeleccionada(cargaActualizada);
      }
    }, [cargas, cargaSeleccionada]);
  
    // Cargar las cargas al iniciar
    useEffect(() => {
      refreshCargas();
    }, [refreshCargas]);
  
    // Handlers principales
    const handleCardClick = useCallback((carga: any) => {
      setCargaSeleccionada(carga);
    }, []);
  
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
      // Resetear el estado de creación si es necesario
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
          {/* Barra lateral con listado de cargas y filtros */}
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
  
  /* ─────────────────────────────────────────────────────────────────────────────
     COMPONENTES AUXILIARES
  ───────────────────────────────────────────────────────────────────────────────*/
  
  // Diálogo para crear o modificar una carga
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
  
  // Diálogo para eliminar una carga
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