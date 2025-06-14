import { useContext, useEffect, useState } from "react";
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

  return (
    <Box p={2}>
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
          onClick={() => { setSeleccionado(null); setOpen(true); }}
        >
          <Button sx={{ color: theme.colores.azul }}>Agregar contrato +</Button>
        </Box>
      </Box>

      {contratosConCargas.map((contrato) => (
        <Box key={contrato.id} mb={3}>
        <ContratoItem
          contrato={contrato}
          onEditContrato={handleOpenDialog}
          refreshContratos={refreshContratos}
        />
        </Box>
      ))}

      <DialogContrato
        open={open}
        onClose={handleClose}
        seleccionado={seleccionado}
      />
    </Box>
  );
}
