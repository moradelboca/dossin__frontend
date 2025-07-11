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
import ContratosMobile from "./ContratosMobile";
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
  const [open, setOpen] = useState(false);
  const [seleccionado, setSeleccionado] = useState<any>(null);

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
          sx={{ display: "flex", justifyContent: "flex-end", mt: 1, mr: 3 }}
        >
          <Button sx={{ color: theme.colores.azul }} onClick={() => { setSeleccionado(null); setOpen(true); }}>Agregar contrato +</Button>
        </Box>
      </Box>

      {contratosConCargas && contratosConCargas.length > 0 ? (
        contratosConCargas.map((contrato) => (
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
            No hay contratos disponibles
          </Typography>
          <Typography variant="body2" color="textSecondary" textAlign="center">
            Hacé clic en "Agregar contrato +" para crear tu primer contrato
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
