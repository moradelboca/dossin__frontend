import React, { useContext, useState } from "react";
import { ContextoGeneral } from "../Contexto";
import {
  Card,
  CardContent,
  Typography,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
} from "@mui/material";
import BorderColorIcon from "@mui/icons-material/BorderColor";

const DashboardGraficos: React.FC = () => {
  const { theme } = useContext(ContextoGeneral);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<"cargas" | "provincias">("cargas");
  const [selectedCargas, setSelectedCargas] = useState<string[]>([]);
  const [selectedProvincias, setSelectedProvincias] = useState<string[]>([]);

  const cargasOptions = ["Maíz", "Soja", "Trigo", "Girasol"];
  const provinciasOptions = ["Córdoba", "Buenos Aires", "Santa Fe", "Mendoza", "Jujuy", "Santa Cruz", "La Rioja"];

  const handleClickAbrirDialog = (type: "cargas" | "provincias") => {
    setDialogType(type);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const handleAddItem = (item: string) => {
    if (dialogType === "cargas" && !selectedCargas.includes(item)) {
      setSelectedCargas([...selectedCargas, item]);
    } else if (dialogType === "provincias" && !selectedProvincias.includes(item)) {
      setSelectedProvincias([...selectedProvincias, item]);
    }
  };

  const handleRemoveItem = (type: "cargas" | "provincias", item: string) => {
    if (type === "cargas") {
      setSelectedCargas(selectedCargas.filter((carga) => carga !== item));
    } else {
      setSelectedProvincias(selectedProvincias.filter((provincia) => provincia !== item));
    }
  };

  const options = dialogType === "cargas" ? cargasOptions : provinciasOptions;
  const selectedItems = dialogType === "cargas" ? selectedCargas : selectedProvincias;

  return (
    <Card>
      <CardContent>
        {/* Sección de cargas */}
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, flexGrow: 1, mb: 2 }}>
          <Typography sx={{ fontWeight: "bold", mr: 2 }}>Cargas:</Typography>
            {selectedCargas.map((carga) => (
              <Chip
                key={carga}
                label={carga}
                onDelete={() => handleRemoveItem("cargas", carga)}
                sx={{
                  borderRadius: "8px",
                  backgroundColor: "#ffffff",
                  border: `1px solid ${theme.colores.azul}`,
                  color: theme.colores.azul,
                  fontWeight: "bold",
                }}
              />
            ))}
          <IconButton onClick={() => handleClickAbrirDialog("cargas")}>
            <BorderColorIcon sx={{ fontSize: 20 }} />
          </IconButton>
        </Box>

        {/* Sección de provincias */}
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, flexGrow: 1, mb: 2  }}>
          <Typography sx={{ fontWeight: "bold", mr: 2 }}>Provincias:</Typography>
            {selectedProvincias.map((provincia) => (
              <Chip
                key={provincia}
                label={provincia}
                onDelete={() => handleRemoveItem("provincias", provincia)}
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
      </CardContent>

      {/* Diálogo de selección */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} fullWidth>
        <DialogTitle>Seleccionar {dialogType === "cargas" ? "cargas" : "provincias"}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {/* Opciones seleccionadas */}
            <Box>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>
                Seleccionadas:
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {selectedItems.map((item) => (
                  <Chip
                    key={item}
                    label={item}
                    onDelete={() => handleRemoveItem(dialogType, item)}
                    sx={{
                      borderRadius: "8px",
                      backgroundColor: "#ffffff",
                      border: `1px solid ${theme.colores.azul}`,
                      color: theme.colores.azul,
                      fontWeight: "bold",
                    }}
                  />
                ))}
              </Box>
            </Box>

            {/* Opciones disponibles */}
            <Box>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>
                Disponibles:
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {options
                  .filter((option) => !selectedItems.includes(option))
                  .map((option) => (
                    <Chip
                      key={option}
                      label={option}
                      onClick={() => handleAddItem(option)}
                      sx={{
                        borderRadius: "8px",
                        backgroundColor: "#ffffff",
                        border: `1px solid ${theme.colores.azul}`,
                        color: theme.colores.azul,
                        fontWeight: "bold",
                        cursor: "pointer",
                      }}
                    />
                  ))}
              </Box>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

export default DashboardGraficos;
