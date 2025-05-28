import React, { useContext, useState } from "react";
import { ContextoGeneral } from "../Contexto";
import {
  Card,
  CardContent,
  Typography,
  IconButton,
  Chip,
  Box,
} from "@mui/material";
import BorderColorIcon from "@mui/icons-material/BorderColor";
import DashboardFiltrosDialog from "../dialogs/dashboard/DashboardFiltrosDialog";
import DashboardCargas from "./graficos/DashboardCargas";
import DashboardFechas from "./graficos/DashboardFechas";
import DashboardFechasDialog from "../dialogs/dashboard/DashboardFechasDialog";
import { useMediaQuery } from '@mui/material';

interface DashboardGraficosProps {
  opcion: "cargas" | "fechas";
}

const DashboardGraficos: React.FC<DashboardGraficosProps> = ({ opcion }) => {
  const { theme } = useContext(ContextoGeneral);
  // Se abre el diálogo según el tipo de filtro
  const [dialogOpen, setDialogOpen] = useState<
    "cargas" | "fechas" | "provincias" | null
  >(null);

  // Estado para las selecciones de filtros.
  // Ahora usamos "fechas" en lugar de "dias"
  const [selections, setSelections] = useState({
    cargas: [] as string[],
    fechas: [] as string[], // cada fecha se guarda como "YYYY-MM-DD"
    provincias: [] as string[],
  });

  const isLargeScreen = useMediaQuery("(min-width:1200px)");

  // Opciones disponibles para cada tipo.
  // Para fechas ya no se usan opciones fijas; se seleccionan mediante calendario.
  const opciones = {
    cargas: [
      "Maíz",
      "Soja",
      "Trigo",
      "Girasol",
      "tipo carga 1",
      "tipo carga 2",
      "General",
    ],
    provincias: [
      "Buenos Aires",
      "Cordoba",
      "Santa Fe",
      "Mendoza",
      "Salta",
      "provincia 2",
      "provincia 1",
    ],
  };

  const handleClickAbrirDialog = (
    type: "cargas" | "fechas" | "provincias"
  ) => {
    setDialogOpen(type);
  };

  const handleCloseDialog = () => setDialogOpen(null);

  const handleAddItem = (
    item: string,
    type: "cargas" | "fechas" | "provincias"
  ) => {
    setSelections((prev) => ({
      ...prev,
      [type]: prev[type].includes(item) ? prev[type] : [...prev[type], item],
    }));
  };

  const handleRemoveItem = (
    item: string,
    type: "cargas" | "fechas" | "provincias"
  ) => {
    setSelections((prev) => ({
      ...prev,
      [type]: prev[type].filter((x) => x !== item),
    }));
  };

  const getAvailableOptions = (type: "cargas" | "provincias") => {
    // No usamos opciones fijas para fechas, ya que se agregan mediante calendario.
    return opciones[type].filter((option) => !selections[type].includes(option));
  };

  const renderChips = (items: string[], type: "cargas" | "fechas" | "provincias") => (
    <>
      {items.slice(0, isLargeScreen ? 1 : 3).map((item) => (
        <Chip
          key={item}
          label={item}
          onDelete={() => handleRemoveItem(item, type)}
          sx={{
            borderRadius: "8px",
            backgroundColor: "#ffffff",
            border: `1px solid ${theme.colores.azul}`,
            color: theme.colores.azul,
            fontWeight: "bold",
          }}
        />
      ))}
      {items.length > (isLargeScreen ? 1 : 3) && (
        <Chip
          label={`+${items.length - (isLargeScreen ? 1 : 3)}`}
          sx={{
            borderRadius: "8px",
            backgroundColor: "#ffffff",
            border: `1px solid ${theme.colores.azul}`,
            color: theme.colores.azul,
            fontWeight: "bold",
            cursor: 'pointer',
          }}
        />
      )}
    </>
  );
  
  

  // Ajustar tamaños de fuente responsive
  const titleFontSize = isLargeScreen ? '0.8rem' : '0.9rem';
  const chartHeight = isLargeScreen ? "85%" : 400;
  const chartContainerStyles = isLargeScreen
  ? { flex: 1, minHeight: 300 }
  : { flex: 1, height: 400 };

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        '& .recharts-surface': { fontSize: isLargeScreen ? '12px' : '14px' }
      }}>
        {/* Sección de Provincias */}
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
          <Typography sx={{ fontWeight: "bold", mr: 2, fontSize: titleFontSize }}>
            Provincias:
          </Typography>
          {renderChips(selections.provincias, "provincias")}
          <IconButton onClick={() => handleClickAbrirDialog("provincias")}>
            <BorderColorIcon sx={{ fontSize: isLargeScreen ? 18 : 20 }} />
          </IconButton>
        </Box>

        {/* Sección de Cargas/Fechas */}
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
          <Typography sx={{ fontWeight: "bold", mr: 2, fontSize: titleFontSize }}>
            {opcion === "cargas" ? "Cargas:" : "Fechas:"}
          </Typography>
          {renderChips(selections[opcion], opcion)}
          <IconButton onClick={() => handleClickAbrirDialog(opcion)}>
            <BorderColorIcon sx={{ fontSize: isLargeScreen ? 18 : 20 }} />
          </IconButton>
        </Box>

        {/* Gráfico con altura responsive */}
        <Box sx={chartContainerStyles }>
          {opcion === "cargas" ? (
            <DashboardCargas
              selections={selections}
              chartHeight={chartHeight}
            />
          ) : (
            <DashboardFechas
              selections={selections}
              chartHeight={chartHeight}
            />
          )}
        </Box>
      </CardContent>

      {/* Diálogo de Filtros para cargas y provincias */}
      {dialogOpen && dialogOpen !== "fechas" && (
        <DashboardFiltrosDialog
          open={dialogOpen !== null}
          onClose={handleCloseDialog}
          dialogType={dialogOpen}
          selectedItems={selections[dialogOpen]}
          options={getAvailableOptions(dialogOpen as "cargas" | "provincias")}
          handleAddItem={(item) => handleAddItem(item, dialogOpen as "cargas" | "provincias")}
          handleRemoveItem={(item) =>
            handleRemoveItem(item, dialogOpen as "cargas" | "provincias")
          }
        />
      )}

      {/* Diálogo especial para la selección de fechas */}
      {dialogOpen === "fechas" && (
        <DashboardFechasDialog
          open={true}
          onClose={handleCloseDialog}
          selectedFechas={selections.fechas}
          onAddFecha={(fecha) => handleAddItem(fecha, "fechas")}
          onRemoveFecha={(fecha) => handleRemoveItem(fecha, "fechas")}
        />
      )}
    </Card>
  );
};

export default DashboardGraficos;
