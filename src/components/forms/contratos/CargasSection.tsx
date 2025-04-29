// components/CargasSection.tsx
import React from "react";
import { Box, Typography, IconButton } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CardMobile from "../../cards/mobile/CardMobile";

interface CargasSectionProps {
  cargas: any[];
  expandedCard: number | null;
  handleExpandClick: (index: number) => void;
  handleOpenDialog: (carga: any) => void;
  handleDeleteCarga: (carga: any) => void;
}

const CargasSection: React.FC<CargasSectionProps> = ({
  cargas,
  expandedCard,
  handleExpandClick,
  handleOpenDialog,
  handleDeleteCarga,
}) => {
  const fields = [
    "id",
    "tarifa",
    "tipoTarifa.nombre",       
    "incluyeIVA",
    "cantidadKm",
    "cargamento.nombre",       
    "tiposAcoplados",
    "horaInicioCarga",
    "horaFinCarga",
    "ubicacionCarga.nombre",   
    "horaInicioDescarga",
    "horaFinDescarga",
    "ubicacionDescarga.nombre",
    "horaInicioBalanza",
    "horaFinBalanza",
    "ubicacionBalanza.nombre", 
    "tolerancia",
    "creadoPor",
    "descripcion",
    "plantaProcedenciaRuca",
    "destinoRuca", 
  ];
  const headerNames = [
    "ID",
    "Tarifa",
    "Tipo Tarifa",
    "Incluye IVA",
    "Cantidad Km",
    "Cargamento",
    "Tipos Acoplados",
    "Hora Inicio Carga",
    "Hora Fin Carga",
    "Ubicación Carga",
    "Hora Inicio Descarga",
    "Hora Fin Descarga",
    "Ubicación Descarga",
    "Hora Inicio Balanza",
    "Hora Fin Balanza",
    "Ubicación Balanza",
    "Tolerancia",
    "Creado Por",
    "Descripción",
    "Planta Procedencia Ruca",
    "Destino Ruca", 
  ];
  return (
    <Box mt={4}>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h6">Cargas</Typography>
        <IconButton
          color="primary"
          onClick={() => {
            handleOpenDialog(null);
          }}
        >
          <AddIcon />
        </IconButton>
      </Box>
      {cargas.length === 0 ? (
        <Typography>No hay cargas registradas.</Typography>
      ) : (
        cargas.map((carga, index) => (
          <CardMobile
            key={carga.id || index}
            item={carga}
            index={index}
            fields={fields}
            headerNames={headerNames}
            expandedCard={expandedCard}
            handleExpandClick={handleExpandClick}
            handleOpenDialog={handleOpenDialog}
            tituloField="ubicacionCarga.nombre"
            subtituloField="id"
            mostrarBotonEditar={true}
            textoSecondaryButton="Eliminar"
            handleSecondButton={handleDeleteCarga}
            colorSecondaryButton="#d68384"
          />
        ))
      )}
    </Box>
  );
};

export default CargasSection;
