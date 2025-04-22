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
    "tipoTarifa",
    "incluyeIVA",
    "cantidadKm",
    "cargamento",
    "tiposAcoplados",
    "horaInicioCarga",
    "horaFinCarga",
    "ubicacionCarga",
    "horaInicioDescarga",
    "horaFinDescarga",
    "ubicacionDescarga",
    "horaInicioBalanza",
    "horaFinBalanza",
    "ubicacionBalanza",
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
    "Hora InicioCarga",
    "Hora Fin Carga",
    "Ubicacion Carga",
    "Hora Inicio Descarga",
    "Hora Fin Descarga",
    "Ubicacion Descarga",
    "Hora Inicio Balanza",
    "Hora Fin Balanza",
    "Ubicacion Balanza",
    "Tolerancia",
    "Creado Por",
    "Descripcion",
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
            // Para agregar una carga nueva, se puede enviar null o un objeto vacío
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
            subtituloField="tarifa"
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
