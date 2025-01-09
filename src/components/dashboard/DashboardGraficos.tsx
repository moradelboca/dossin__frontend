import React, { useContext, useState } from "react";
import { ContextoGeneral } from "../Contexto";
import { Card, CardContent, Typography, IconButton, Chip, Box } from "@mui/material";
import BorderColorIcon from "@mui/icons-material/BorderColor";
import { Radar, RadarChart, PolarGrid, Legend, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import DashboardFiltrosDialog from "../dialogs/dashboard/DashboardFiltrosDialog";

interface DashboardGraficosProps {
  opcion: "cargas" | "dias";
}

const DashboardGraficos: React.FC<DashboardGraficosProps> = ({ opcion }) => {
  const { theme } = useContext(ContextoGeneral);
  const [dialogOpen, setDialogOpen] = useState<"cargas" | "dias" | "provincias" | null>(null);

  const [selections, setSelections] = useState({
    [opcion]: [] as string[],
    provincias: [] as string[],
  });

  const opciones = {
    cargas: ["Maíz", "Soja", "Trigo", "Girasol"],
    dias: ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"],
    provincias: ["Buenos Aires", "Córdoba", "Santa Fe", "Mendoza", "Salta"],
  };

  const simulacionData = {
    cargas: [
      { provincia: "Buenos Aires", Maíz: 2000, Soja: 1200, Trigo: 1500, Girasol: 1500 },
      { provincia: "Córdoba", Maíz: 500, Soja: 300, Trigo: 200, Girasol: 150 },
      { provincia: "Santa Fe", Maíz: 400, Soja: 250, Trigo: 180, Girasol: 100 },
      { provincia: "Mendoza", Maíz: 600, Soja: 350, Trigo: 250, Girasol: 200 },
      { provincia: "Salta", Maíz: 100, Soja: 50, Trigo: 80, Girasol: 40 },
    ],
    dias: [
      { provincia: "Buenos Aires", Lunes: 500, Martes: 300, Miércoles: 450, Jueves: 400, Viernes: 600 },
      { provincia: "Córdoba", Lunes: 200, Martes: 150, Miércoles: 180, Jueves: 170, Viernes: 250 },
      { provincia: "Santa Fe", Lunes: 100, Martes: 120, Miércoles: 110, Jueves: 130, Viernes: 140 },
      { provincia: "Mendoza", Lunes: 300, Martes: 250, Miércoles: 280, Jueves: 260, Viernes: 320 },
      { provincia: "Salta", Lunes: 50, Martes: 70, Miércoles: 60, Jueves: 65, Viernes: 80 },
    ],
  };

  const filteredData = simulacionData[opcion]
    .filter((entry) => selections.provincias.includes(entry.provincia))
    .map((entry) => ({
      provincia: entry.provincia,
      ...selections[opcion].reduce((acc, item) => ({ ...acc, [item]: entry[item] || 0 }), {}),
    }));

  const handleClickAbrirDialog = (type: "cargas" | "dias" | "provincias") => {
    setDialogOpen(type);
  };

  const handleCloseDialog = () => setDialogOpen(null);

  const handleAddItem = (item: string, type: "cargas" | "dias" | "provincias") => {
    setSelections((prev) => ({
      ...prev,
      [type]: prev[type].includes(item) ? prev[type] : [...prev[type], item],
    }));
  };

  const handleRemoveItem = (item: string, type: "cargas" | "dias" | "provincias") => {
    setSelections((prev) => ({
      ...prev,
      [type]: prev[type].filter((x) => x !== item),
    }));
  };

  const getAvailableOptions = (type: "cargas" | "dias" | "provincias") => {
    return opciones[type].filter((option) => !selections[type].includes(option));
  };

  // Colores personalizados para cada línea o radar
  const colorPalette = [
    "#ff6347", "#ff4500", "#32cd32", "#8a2be2", "#00ced1", 
    "#ff1493", "#ffd700", "#adff2f", "#ff8c00", "#e6e6fa"
  ];

  return (
    <Card>
      <CardContent>
        {/*Provincias */}
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
          <Typography sx={{ fontWeight: "bold", mr: 2 }}>Provincias:</Typography>
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

        {/* Elegis si es cargas o días */}
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
          <Typography sx={{ fontWeight: "bold", mr: 2 }}>{opcion === "cargas" ? "Cargas:" : "Días:"}</Typography>
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

        {/* Gráfico */}
        {selections[opcion].length > 0 && selections.provincias.length > 0 && (
          <ResponsiveContainer width="100%" height={400}>
            {opcion === "dias" ? (
              <LineChart
                width={500}
                height={300}
                data={filteredData}
                margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="provincia" />
                <YAxis />
                <Tooltip />
                {selections.dias.map((dia, index) => (
                  <Line
                    key={dia}
                    type="monotone"
                    dataKey={dia}
                    stroke={colorPalette[index % colorPalette.length]} // Usamos el color según el índice
                  />
                ))}
              </LineChart>
            ) : (
              <RadarChart data={filteredData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="provincia" />
                <PolarRadiusAxis />
                {selections[opcion].map((item, index) => (
                  <Radar
                    key={item}
                    name={item}
                    dataKey={item}
                    stroke={colorPalette[index % colorPalette.length]} // Usamos el color según el índice
                    fill={colorPalette[index % colorPalette.length]}
                    fillOpacity={0.6}
                  />
                ))}
                <Legend />
              </RadarChart>
            )}
          </ResponsiveContainer>
        )}
      </CardContent>

      {/* Dialog de Filtros */}
      {dialogOpen && (
        <DashboardFiltrosDialog
          open={dialogOpen !== null}
          onClose={handleCloseDialog}
          dialogType={dialogOpen}
          selectedItems={selections[dialogOpen]}
          options={getAvailableOptions(dialogOpen)}
          handleAddItem={(item) => handleAddItem(item, dialogOpen)}
          handleRemoveItem={(item) => handleRemoveItem(item, dialogOpen)}
        />
      )}
    </Card>
  );
};

export default DashboardGraficos;
