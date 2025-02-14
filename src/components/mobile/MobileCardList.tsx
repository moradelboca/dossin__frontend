import {
  Box,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";
import React, { useContext, useEffect, useState } from "react";
import { ContextoGeneral } from "../Contexto";
import MobileEditToolbar from "./MobileEditToolbar";
import CreadorEntidad from "../dialogs/CreadorEntidad";
import FilterDialog from "../dialogs/tablas/FilterDialog";
import "jspdf-autotable";
import CardMobile from "../cards/mobile/CardMobile";
import { handleFilterApply, Filter } from "../../utils/filtrosUtils";
import { handleSearch } from "../../utils/busquedaUtils";
import { exportarCSV, exportarPDF } from "../../utils/exportUtils";


interface MobileCardListProps {
  titulo: string;
  entidad: string;
  endpoint: string;
  fields: string[];
  headerNames: string[];
  usarPruebas?: boolean;
  FormularioCreador: React.ComponentType<any>;
  customIcon?: string;
  tituloField?: string;
  subtituloField?: string;
}



const MobileCardList: React.FC<MobileCardListProps> = ({
  titulo,
  entidad,
  endpoint,
  fields,
  headerNames,
  usarPruebas = false,
  FormularioCreador,
  customIcon,
  tituloField,
  subtituloField,
}) => {
  const { backendURL, pruebas } = useContext(ContextoGeneral);
  const [datos, setDatos] = useState<any[]>([]);
  const [originalDatos, setOriginalDatos] = useState<any[]>([]);
  const [filteredDatos, setFilteredDatos] = useState<any[]>([]);

  const [estadoCarga, setEstadoCarga] = useState("Cargando");
  const [expandedCard, setExpandedCard] = useState<number | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [seleccionado, setSeleccionado] = useState<any>(null);

  const [openFilterDialog, setOpenFilterDialog] = useState(false);

  const apiURL = usarPruebas ? pruebas : backendURL;

  const refreshDatos = () => {
    setEstadoCarga("Cargando");
    fetch(`${apiURL}/${endpoint}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true",
      },
    })
      .then((response) => {
        if (!response.ok) throw new Error("Error en la respuesta del servidor");
        return response.json();
      })
      .then((data) => {
        setDatos(data);
        setOriginalDatos(data);
        setFilteredDatos(data);
        setEstadoCarga("Cargado");
      })
      .catch((error) => {
        console.error(`Error al cargar datos para ${entidad}:`, error);
        setEstadoCarga("Error");
      });
  };

  useEffect(() => {
    refreshDatos();
  }, []);

  const handleSearchQuery = (query: string) => {
    const filtered = handleSearch(query, datos);  // Hacemos la busqueda
    setFilteredDatos(filtered);  // Actualizo la lista con los datos buscados
  };  

  const handleFilterApplyQuery = (filter: Filter) => {
    const filtered = handleFilterApply(filter, datos);
    setFilteredDatos(filtered);
  };

  const handleUndoFilter = () => {
    setFilteredDatos(originalDatos);
  };

  const handleOpenFilterDialog = () => {
    setOpenFilterDialog(true);
  };

  const handleCloseFilterDialog = () => {
    setOpenFilterDialog(false);
  };

  

  const handleExport = (formato: "csv" | "pdf") => {
    if (formato === "csv") {
      exportarCSV(headerNames, filteredDatos, fields, entidad);
    } else if (formato === "pdf") {
      exportarPDF(headerNames, filteredDatos, fields, entidad);
    }
  };

  const handleExpandClick = (index: number) => {
    setExpandedCard(expandedCard === index ? null : index);
  };

  const handleOpenDialog = (item: any) => {
    setSeleccionado(item);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setSeleccionado(null);
    setOpenDialog(false);
  };

  const renderCards = (datos: any[]) =>
    datos.map((item, index) => (
      <CardMobile 
        key={item.id || index}
        item={item} 
        index={index} 
        fields={fields} 
        headerNames={headerNames} 
        expandedCard={expandedCard} 
        handleExpandClick={handleExpandClick} 
        handleOpenDialog={handleOpenDialog}
        tituloField={tituloField}
        subtituloField={subtituloField}
        customIcon={customIcon}
      />
    ));


  if (estadoCarga === "Cargando") {
    return (
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
    );
  }

  return (
    <Box padding={2}>
      <Typography variant="h5" gutterBottom>
        {titulo}
      </Typography>
      <MobileEditToolbar
        onAdd={() => handleOpenDialog(null)}
        onFilter={handleOpenFilterDialog}
        onExport={handleExport}
        onSearch={handleSearchQuery}
        name={entidad}
      />
      {renderCards(filteredDatos)}
      <FilterDialog
        open={openFilterDialog}
        onClose={handleCloseFilterDialog}
        onApplyFilter={handleFilterApplyQuery}
        columns={fields}
        onUndoFilter={handleUndoFilter}
      />
      
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>
          {seleccionado ? `Editar ${entidad}` : `Crear ${entidad}`}
        </DialogTitle>
        <DialogContent>
          <CreadorEntidad
            seleccionado={seleccionado}
            handleClose={handleCloseDialog}
            datos={datos}
            setDatos={setDatos}
            nombreEntidad={entidad}
            Formulario={FormularioCreador}
          />
        </DialogContent>
      </Dialog>
      
    </Box>
  );
};

export default MobileCardList;
