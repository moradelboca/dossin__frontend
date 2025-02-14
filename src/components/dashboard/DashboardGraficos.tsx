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

  return (
    <Card>
      <CardContent>
        {/* Selección de Provincias */}
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
          <Typography sx={{ fontWeight: "bold", mr: 2 }}>
            Provincias:
          </Typography>
          {selections.provincias.map((provincia) => (
            <Chip
              key={provincia}
              label={provincia}
              onDelete={() => handleRemoveItem(provincia, "provincias")}
              sx={{
                borderRadius: "8px",
                backgroundColor: "#ffffff",
                border: `1px solid ${theme.colores.azul}`,
                color: theme.colores.azul,
                fontWeight: "bold",
              }}
            />
          ))}
          <IconButton onClick={() => handleClickAbrirDialog("provincias")}>
            <BorderColorIcon sx={{ fontSize: 20 }} />
          </IconButton>
        </Box>

        {/* Selección de Cargas o Fechas */}
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
          <Typography sx={{ fontWeight: "bold", mr: 2 }}>
            {opcion === "cargas" ? "Cargas:" : "Fechas:"}
          </Typography>
          {selections[opcion].map((item) => (
            <Chip
              key={item}
              label={item}
              onDelete={() => handleRemoveItem(item, opcion)}
              sx={{
                borderRadius: "8px",
                backgroundColor: "#ffffff",
                border: `1px solid ${theme.colores.azul}`,
                color: theme.colores.azul,
                fontWeight: "bold",
              }}
            />
          ))}
          <IconButton onClick={() => handleClickAbrirDialog(opcion)}>
            <BorderColorIcon sx={{ fontSize: 20 }} />
          </IconButton>
        </Box>

        {/* Renderizado del gráfico según la opción */}
        {opcion === "cargas" ? (
          <DashboardCargas
            selections={{
              cargas: selections.cargas,
              provincias: selections.provincias,
            }}
          />
        ) : (
          <DashboardFechas
            selections={{
              fechas: selections.fechas,
              provincias: selections.provincias,
            }}
          />
        )}
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
