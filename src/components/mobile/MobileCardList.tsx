import {
  Box,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";
import "jspdf-autotable";
import React, { useEffect, useState } from "react";
import { handleSearch } from "../../utils/busquedaUtils";
import { exportarCSV, exportarPDF } from "../../utils/exportUtils";
import { Filter, handleFilterApply } from "../../utils/filtrosUtils";
import CardMobile from "../cards/mobile/CardMobile";
import CreadorEntidad from "../dialogs/CreadorEntidad";
import FilterDialog from "../dialogs/tablas/FilterDialog";
import MobileEditToolbar from "./MobileEditToolbar";

interface MobileCardListProps {
  titulo: string;
  entidad: string;
  fields: string[];
  headerNames: string[];
  usarAuthURL?: boolean;
  FormularioCreador: React.ComponentType<any>;
  customIcon?: string;
  tituloField?: string;
  subtituloField?: string;
  datos: any[]; // Datos ya obtenidos desde el padre
  setDatos: React.Dispatch<React.SetStateAction<any[]>>;
  // Estados y funciones de control del diálogo (delegados desde TablaTemplate)
  seleccionado: any;
  openDialog: boolean;
  handleOpenDialog: (item: any) => void;
  handleCloseDialog: () => void;
}

const MobileCardList: React.FC<MobileCardListProps> = ({
  titulo,
  entidad,
  fields,
  headerNames,
  FormularioCreador,
  customIcon,
  tituloField,
  subtituloField,
  datos,
  setDatos,
  seleccionado,
  openDialog,
  handleOpenDialog,
  handleCloseDialog,
}) => {
  // Estados para filtrar y buscar dentro de los datos
  const [filteredDatos, setFilteredDatos] = useState<any[]>(datos);
  const [originalDatos, setOriginalDatos] = useState<any[]>(datos);

  useEffect(() => {
    setOriginalDatos(datos);
    setFilteredDatos(datos);
  }, [datos]);

  const [expandedCard, setExpandedCard] = useState<number | null>(null);
  const [openFilterDialog, setOpenFilterDialog] = useState(false);

  const handleSearchQuery = (query: string) => {
    const filtered = handleSearch(query, datos); // Búsqueda sobre los datos del padre
    setFilteredDatos(filtered);
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

  // Se muestra un spinner en caso de que no se hayan recibido datos aún
  if (!datos.length) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100%">
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
