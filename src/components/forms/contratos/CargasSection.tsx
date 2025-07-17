// components/CargasSection.tsx
import React from "react";
import { Box, Typography, IconButton } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CardMobile from "../../cards/mobile/CardMobile";

interface CargasSectionProps {
  cargasOriginales: any[];
  cargasACrear: any[];
  cargasAActualizar: any[];
  expandedCard: number | null;
  handleExpandClick: (index: number) => void;
  handleOpenDialog: (carga: any) => void;
  handleDeleteCarga: (carga: any) => void;
  handleDeleteCargaACrear: (carga: any) => void;
  handleDeleteCargaAActualizar: (carga: any) => void;
}

const CargasSection: React.FC<CargasSectionProps> = ({
  cargasOriginales,
  cargasACrear,
  cargasAActualizar,
  expandedCard,
  handleExpandClick,
  handleOpenDialog,
  handleDeleteCarga,
  handleDeleteCargaACrear,
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
    <Box mt={5}>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h6">Cargas</Typography>
        <IconButton color="primary" onClick={() => handleOpenDialog(null)}>
          <AddIcon />
        </IconButton>
      </Box>

      {/* Sección de Cargas a Crear */}
      {cargasACrear.length > 0 && (
        <Box mt={2}>
          <Typography variant="subtitle1" color="primary" gutterBottom>
            Cargas a Crear
          </Typography>
          {cargasACrear.map((carga) => (
            <CardMobile
              key={carga.tempId}
              item={{ ...carga, id: carga.tempId }}
              index={carga.tempId}
              fields={fields}
              headerNames={headerNames}
              expandedCard={expandedCard}
              handleExpandClick={handleExpandClick}
              tituloField="ubicacionCarga.nombre"
              mostrarBotonEditar={false}
              textoSecondaryButton="Eliminar"
              handleSecondButton={handleDeleteCargaACrear}
              colorSecondaryButton="#d68384"
            />
          ))}
        </Box>
      )}

      {/* Sección de Cargas a Actualizar */}
      {cargasAActualizar.length > 0 && (
        <Box mt={2}>
          <Typography variant="subtitle1" color="secondary" gutterBottom>
            Cargas a Actualizar
          </Typography>
          {cargasAActualizar.map((carga) => (
            <CardMobile
              key={carga.id}
              item={carga}
              index={carga.id}
              fields={fields}
              headerNames={headerNames}
              expandedCard={expandedCard}
              handleExpandClick={handleExpandClick}
              tituloField="ubicacionCarga.nombre"
              subtituloField="id"
              mostrarBotonEditar={true}
              textoSecondaryButton="Eliminar"
              handleSecondButton={handleDeleteCarga}
              colorSecondaryButton="#d68384"
              noEsTurno={true}
            />
          ))}
        </Box>
      )}

      {/* Sección de Cargas Originales */}
      {cargasOriginales.length > 0 && (
        <Box mt={2}>
          <Typography variant="subtitle1" gutterBottom>
            Cargas del Contrato
          </Typography>
          {cargasOriginales.map((carga) => (
            <CardMobile
              key={carga.id}
              item={carga}
              index={carga.id}
              fields={fields}
              headerNames={headerNames}
              expandedCard={expandedCard}
              handleExpandClick={handleExpandClick}
              tituloField="ubicacionCarga.nombre"
              subtituloField="id"
              mostrarBotonEditar={true}
              textoSecondaryButton="Eliminar"
              handleSecondButton={handleDeleteCarga}
              colorSecondaryButton="#d68384"
            />
          ))}
        </Box>
      )}

      {cargasACrear.length === 0 && 
       cargasAActualizar.length === 0 && 
       cargasOriginales.length === 0 && (
        <Typography>No hay cargas registradas.</Typography>
      )}
    </Box>
  );
};

export default CargasSection;
