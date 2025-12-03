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
import { axiosGet } from "../../lib/axiosConfig";

interface DashboardGraficosProps {
  opcion: "cargas" | "fechas";
  startDate?: string;
  endDate?: string;
  dateRangeType?: string;
}

const DashboardGraficos: React.FC<DashboardGraficosProps> = ({ opcion, startDate, endDate, dateRangeType }) => {
  const { theme, backendURL } = useContext(ContextoGeneral);
  // Se abre el diálogo según el tipo de filtro
  const [dialogOpen, setDialogOpen] = useState<
    "cargas" | "fechas" | "provincias" | null
  >(null);

  // Estado para las selecciones de filtros.
  // Ahora usamos "fechas" en lugar de "dias"
  const [cargamentos, setCargamentos] = useState<{ id: number, nombre: string }[]>([]);
  const [selectedCargamentoIds, setSelectedCargamentoIds] = useState<number[]>([]);
  const [selections, setSelections] = useState({
    cargas: [] as string[],
    fechas: [] as string[], // cada fecha se guarda como "YYYY-MM-DD"
    provincias: [] as string[],
  });

  const isLargeScreen = useMediaQuery("(min-width:1200px)");

  React.useEffect(() => {
    axiosGet<any[]>('cargamentos', backendURL)
      .then(data => setCargamentos(data))
      .catch(() => setCargamentos([]));
  }, [backendURL]);

  // Cuando cambia selections.cargas, actualiza selectedCargamentoIds
  React.useEffect(() => {
    const ids = cargamentos
      .filter(c => selections.cargas.includes(c.nombre))
      .map(c => c.id);
    setSelectedCargamentoIds(ids);
  }, [selections.cargas, cargamentos]);

  // Preselección de provincias y cargamentos al cargar los datos
  React.useEffect(() => {
    if (cargamentos.length > 0) {
      setSelections((prev) => ({
        ...prev,
        cargas: cargamentos.map(c => c.nombre),
        provincias: [
          "Córdoba",
          "Buenos Aires",
          "Santa Fe",
          "Santiago del Estero",
          "San Luis"
        ]
      }));
    }
  }, [cargamentos]);

  // Opciones disponibles para cada tipo (solo nombres de cargamentos)
  const opciones = {
    cargas: cargamentos.map(c => c.nombre),
    provincias: [
      "Buenos Aires",
      "Catamarca",
      "Chaco",
      "Chubut",
      "Córdoba",
      "Corrientes",
      "Entre Ríos",
      "Formosa",
      "Jujuy",
      "La Pampa",
      "La Rioja",
      "Mendoza",
      "Misiones",
      "Neuquén",
      "Río Negro",
      "Salta",
      "San Juan",
      "San Luis",
      "Santa Cruz",
      "Santa Fe",
      "Santiago del Estero",
      "Tierra del Fuego",
      "Tucumán"
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
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mb: 1, alignItems: 'center', minHeight: 32 }}>
          <Typography sx={{ fontWeight: 500, mr: 1, fontSize: '0.75rem' }}>
            Provincias:
          </Typography>
          {renderChips(selections.provincias, "provincias")}
          <IconButton onClick={() => handleClickAbrirDialog("provincias")}
            size="small"
            sx={{ ml: 0.5, p: 0.5 }}>
            <BorderColorIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Box>

        {/* Sección de Cargas (únicamente) */}
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mb: 1, alignItems: 'center', minHeight: 32 }}>
          <Typography sx={{ fontWeight: 500, mr: 1, fontSize: '0.75rem' }}>
            {opcion === "cargas" ? "Cargamento:" : null}
          </Typography>
          {opcion === "cargas" && renderChips(selections["cargas"], "cargas")}
          {opcion === "cargas" && (
            <IconButton onClick={() => handleClickAbrirDialog("cargas")}
              size="small"
              sx={{ ml: 0.5, p: 0.5 }}>
              <BorderColorIcon sx={{ fontSize: 16 }} />
            </IconButton>
          )}
        </Box>

        {/* Gráfico con altura responsive */}
        <Box sx={chartContainerStyles }>
          {opcion === "cargas" ? (
            <DashboardCargas
              selections={selections}
              chartHeight={chartHeight}
              startDate={startDate}
              endDate={endDate}
              cargamentosSeleccionados={selectedCargamentoIds}
            />
          ) : (
            <DashboardFechas
              selections={selections}
              chartHeight={chartHeight}
              startDate={startDate}
              endDate={endDate}
              dateRangeType={dateRangeType}
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
