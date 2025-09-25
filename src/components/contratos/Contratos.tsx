import { useContext, useEffect, useState, useRef } from "react";
import { ContextoGeneral } from "../Contexto";
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  Typography,
  useMediaQuery,
} from "@mui/material";
import ContratoForm from "../forms/contratos/ContratoForm";
import { ContratoItem } from "./ContratoItem";
import useContratosConCargas from "../hooks/contratos/useContratosConCargas";
import useEmpresas from "../hooks/contratos/useEmpresas";
import ContratosMobile from "./ContratosMobile";
import ContratoBuscador from "./ContratoBuscador";
import CircularProgress from "@mui/material/CircularProgress";

const DialogContrato = ({
  open,
  onClose,
  seleccionado,
}: {
  open: boolean;
  onClose: () => void;
  seleccionado: any;
}) => {
  const [datos, setDatos] = useState<any[]>([]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogContent>
        <ContratoForm
          seleccionado={seleccionado}
          datos={datos}
          setDatos={setDatos}
          handleClose={onClose}
        />
      </DialogContent>
    </Dialog>
  );
};

export default function Contratos() {
  const { backendURL } = useContext(ContextoGeneral);
  const { theme } = useContext(ContextoGeneral);

  const { contratosConCargas, refreshContratos } =
    useContratosConCargas(backendURL);
  const { empresas } = useEmpresas(backendURL);
  const [open, setOpen] = useState(false);
  const [seleccionado, setSeleccionado] = useState<any>(null);
  const [contratosFiltrados, setContratosFiltrados] = useState<any[]>([]);

  const isMobile = useMediaQuery("(max-width:768px)");

  const [cargando, setCargando] = useState(true);
  const firstLoad = useRef(true);
  useEffect(() => {
    if (firstLoad.current) {
      firstLoad.current = false;
      return;
    }
    setCargando(false);
  }, [contratosConCargas]);

  useEffect(() => {
    refreshContratos();
  }, []);

  // Inicializar contratos filtrados cuando se cargan los contratos
  useEffect(() => {
    setContratosFiltrados(contratosConCargas);
  }, [contratosConCargas]);

  const handleFilterChange = (filterType: string, filterValue: any) => {
    let filtered = contratosConCargas;
    
    switch(filterType) {
      case 'id':
        filtered = contratosConCargas.filter(c => 
          c.id.toString().includes(filterValue)
        );
        break;
      case 'titular':
        filtered = contratosConCargas.filter(c => 
          c.titularCartaDePorte?.razonSocial?.toLowerCase().includes(filterValue.toLowerCase())
        );
        break;
      case 'destinatario':
        filtered = contratosConCargas.filter(c => 
          c.destinatario?.razonSocial?.toLowerCase().includes(filterValue.toLowerCase())
        );
        break;
      case 'empresa':
        filtered = contratosConCargas.filter(c => 
          c.titularCartaDePorte?.id === filterValue || c.destinatario?.id === filterValue
        );
        break;
      case 'sin-filtro':
      default:
        filtered = contratosConCargas;
        break;
    }
    
    // Mantener el orden descendente por ID
    const sortedFiltered = [...filtered].sort((a, b) => b.id - a.id);
    setContratosFiltrados(sortedFiltered);
  };

  const handleOpenDialog = (item: any) => {
    setSeleccionado(item);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    refreshContratos();
  };

  if (isMobile) {
    return (
      <ContratosMobile
        contratos={contratosConCargas}
        refreshContratos={refreshContratos}
        handleOpenDialog={handleOpenDialog}
        seleccionado={seleccionado}
        open={open}
        handleClose={handleClose}
        theme={theme}
      />
    );
  }

  if (cargando) {
    return (
      <Box sx={{ backgroundColor: theme.colores.grisClaro, height: '100%', minHeight: 0, minWidth: 0, width: '100%', p: 2, overflowY: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Box display="flex" flexDirection="row" alignItems="center" gap={3}>
          <CircularProgress sx={{ padding: '5px', width: '30px', height: '30px'}} />
          <Typography variant="h5" ><b>Cargando...</b></Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ backgroundColor: theme.colores.grisClaro, height: '100%', minHeight: 0, minWidth: 0, width: '100%', p: 2, overflowY: 'auto' }}>
      <Box sx={{ display: "flex", flexDirection: "column", mb: 2 }}>
        <Typography
          variant="h5"
          sx={{
            color: theme.colores.azul,
            fontWeight: "bold",
            fontSize: "2rem",
            ml: 1,
          }}
        >
          Contratos
        </Typography>
        <Box
          sx={{ 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "center",
            mt: 1, 
            mr: 3,
            gap: 2
          }}
        >
          {/* Buscador y filtros */}
          <ContratoBuscador
            onFilterChange={handleFilterChange}
            empresas={empresas}
          />
          <Button sx={{ color: theme.colores.azul }} onClick={() => { setSeleccionado(null); setOpen(true); }}>Agregar contrato +</Button>
        </Box>
      </Box>

      {contratosFiltrados && contratosFiltrados.length > 0 ? (
        contratosFiltrados.map((contrato) => (
          <Box key={contrato.id} mb={3}>
            <ContratoItem
              contrato={contrato}
              onEditContrato={handleOpenDialog}
              refreshContratos={refreshContratos}
            />
          </Box>
        ))
      ) : (
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          height="50vh"
          gap={2}
        >
          <Typography variant="h6" color="textSecondary">
            {contratosConCargas.length > 0 ? "No se encontraron resultados" : "No hay contratos disponibles"}
          </Typography>
          <Typography variant="body2" color="textSecondary" textAlign="center">
            {contratosConCargas.length > 0 ? "Intenta con otros filtros de búsqueda" : "Hacé clic en \"Agregar contrato +\" para crear tu primer contrato"}
          </Typography>
        </Box>
      )}

      <DialogContrato
        open={open}
        onClose={handleClose}
        seleccionado={seleccionado}
      />
    </Box>
  );
}
