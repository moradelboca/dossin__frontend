// InconvenientesDialog.tsx
import React, { useState, useContext } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Tabs,
  Tab,
  Box,
  Typography
} from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import { ContextoGeneral } from "../../Contexto";
import CardMobile from "../../cards/mobile/CardMobile"; // Asegúrate de que la ruta sea correcta

// Definición de la interfaz para cada inconveniente (ajusta los tipos según tu data real)
interface Inconveniente {
  id: number | string;
  titulo: string;
  descripcion: string;
  urgencia: { id: number; nombre: string; };
  fechaCreacion: string;
  tipoInconveniente: { id: number; nombre: string; };
  creadoPor: { id: number; email: string; imagen: string | null };
  asignadoA: { id: number; email: string; imagen: string | null };
  estado: { id: number; nombre: "Pendiente" | "Resuelto" };
}

// Interfaz que representa el objeto completo que recibimos con la data
interface InconvenientesData {
  TotalInconvenientes: number;
  Pendientes: number;
  Resueltos: number;
  GeneradosPorChofer: number;
  Inconvenientes: Inconveniente[];
}

interface InconvenientesDialogProps {
  open: boolean;
  handleClose: () => void;
  inconvenientes: InconvenientesData;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index, ...other }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`inconvenientes-tabpanel-${index}`}
      aria-labelledby={`inconvenientes-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 2 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

const InconvenientesDialog: React.FC<InconvenientesDialogProps> = ({ open, handleClose, inconvenientes }) => {
  const { theme } = useContext(ContextoGeneral);
  const [tabIndex, setTabIndex] = useState<number>(0);

  // Definición de los campos y encabezados para el CardMobile
  const fields = [
    "titulo",
    "descripcion",
    "estado.nombre",
    "urgencia.nombre",
    "tipoInconveniente.nombre",
    "creadoPor.email",
    "asignadoA.email"
  ];
  const headerNames = [
    "Título",
    "Descripción",
    "Estado",
    "Urgencia",
    "Tipo",
    "Creado por",
    "Asignado a"
  ];

  const handleChangeTab = (_event: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue);
  };

  // Estado y funciones dummy para expandir/contraer las cards y para editar
  const [expandedCard, setExpandedCard] = useState<number | null>(null);
  const handleExpandClick = (index: number) => {
    setExpandedCard(expandedCard === index ? null : index);
  };

  const handleOpenEditDialog = (item: Inconveniente) => {
    console.log("Editar inconveniente", item);
  };

  // Función para renderizar las cards usando CardMobile
  const renderCards = (datos: Inconveniente[]) =>
    datos.map((item, index) => (
      <CardMobile
        key={item.id || index}
        item={item}
        index={index}
        fields={fields}
        headerNames={headerNames}
        expandedCard={expandedCard}
        handleExpandClick={handleExpandClick}
        handleOpenDialog={handleOpenEditDialog}
        mostrarBotonEditar={false}
      />
    ));

  const filterInconvenientes = (filter?: string) => {
    // Si la prop o la lista interna no están definidas, retornamos un arreglo vacío
    const lista = inconvenientes?.Inconvenientes ?? [];
    
    if (!filter) return lista;
    
    if (filter === "GeneradosPorChofer") {
      // Convertimos a minúsculas para comparar de forma robusta
      return lista.filter(item => 
        item.tipoInconveniente?.nombre?.toLowerCase() === "generado por chofer"
      );
    }
    
    return lista.filter(item => 
      item.estado?.nombre?.toLowerCase() === filter.toLowerCase()
    );
  };
  

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
      <DialogTitle sx={{ m: 0, p: 2 }}>
        Inconvenientes
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: theme.colores.azul,
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Tabs
          value={tabIndex}
          onChange={handleChangeTab}
          variant="scrollable"
          scrollButtons="auto"
          aria-label="pestañas de inconvenientes"
        >
          <Tab label="Todos" id="inconvenientes-tab-0" aria-controls="inconvenientes-tabpanel-0" />
          <Tab label="Pendientes" id="inconvenientes-tab-1" aria-controls="inconvenientes-tabpanel-1" />
          <Tab label="Resueltos" id="inconvenientes-tab-2" aria-controls="inconvenientes-tabpanel-2" />
          <Tab label="GeneradosPorChofer" id="inconvenientes-tab-3" aria-controls="inconvenientes-tabpanel-3" />
        </Tabs>

        {/* Pestaña "Todos" */}
        <TabPanel value={tabIndex} index={0}>
          {(() => {
            const data = filterInconvenientes();
            console.log(data)
            return (
              <>
                <Typography variant="subtitle1">Cantidad: {data?.length}</Typography>
                {data?.length
                  ? renderCards(data)
                  : <Typography>No hay inconvenientes</Typography>
                }
              </>
            );
          })()}
        </TabPanel>

        {/* Pestaña "Pendientes" */}
        <TabPanel value={tabIndex} index={1}>
          {(() => {
            const data = filterInconvenientes("Pendiente");
            return (
              <>
                <Typography variant="subtitle1">Cantidad: {data.length}</Typography>
                {data.length
                  ? renderCards(data)
                  : <Typography>No hay inconvenientes pendientes</Typography>
                }
              </>
            );
          })()}
        </TabPanel>

        {/* Pestaña "Resueltos" */}
        <TabPanel value={tabIndex} index={2}>
          {(() => {
            const data = filterInconvenientes("Resuelto");
            return (
              <>
                <Typography variant="subtitle1">Cantidad: {data.length}</Typography>
                {data.length
                  ? renderCards(data)
                  : <Typography>No hay inconvenientes resueltos</Typography>
                }
              </>
            );
          })()}
        </TabPanel>

        {/* Pestaña "GeneradosPorChofer" */}
        <TabPanel value={tabIndex} index={3}>
          {(() => {
            const data = filterInconvenientes("GeneradosPorChofer");
            return (
              <>
                <Typography variant="subtitle1">Cantidad: {data.length}</Typography>
                {data.length
                  ? renderCards(data)
                  : <Typography>No hay inconvenientes generados por chofer</Typography>
                }
              </>
            );
          })()}
        </TabPanel>
      </DialogContent>
    </Dialog>
  );
};

export default InconvenientesDialog;
