// components/CargasSection.tsx
import React from "react";
import { Box, Typography, IconButton } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CardMobile from "../../cards/mobile/CardMobile";

interface CargasSectionProps {
  cargas: any[];
  fields: string[];
  headerNames: string[];
  expandedCard: number | null;
  handleExpandClick: (index: number) => void;
  handleOpenDialog: (carga: any) => void;
  handleDeleteCarga: (carga: any) => void;
}

const CargasSection: React.FC<CargasSectionProps> = ({
  cargas,
  fields,
  headerNames,
  expandedCard,
  handleExpandClick,
  handleOpenDialog,
  handleDeleteCarga,
}) => {
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
