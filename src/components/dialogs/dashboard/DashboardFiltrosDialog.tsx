import React from "react";
import { Box, Typography, Chip, Dialog, DialogTitle, DialogContent, DialogActions, Button } from "@mui/material";
import { ContextoGeneral } from "../../Contexto";

interface DashboardFiltrosDialogProps {
  open: boolean;
  onClose: () => void;
  dialogType: "cargas" | "dias" | "provincias";
  selectedItems: string[];
  options: string[];
  handleAddItem: (item: string) => void;
  handleRemoveItem: (item: string) => void;
}

const DashboardFiltrosDialog: React.FC<DashboardFiltrosDialogProps> = ({
  open,
  onClose,
  dialogType,
  selectedItems,
  options,
  handleAddItem,
  handleRemoveItem,
}) => {
  const { theme } = React.useContext(ContextoGeneral);

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>Seleccionar {dialogType}</DialogTitle>
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
                  onDelete={() => handleRemoveItem(item)}
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
              Opciones:
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
              {options.map((option) => (
                <Chip
                  key={option}
                  label={option}
                  onClick={() => handleAddItem(option)}
                  sx={{
                    borderRadius: "8px",
                    backgroundColor: "#f0f0f0",
                    border: `1px solid ${theme.colores.azul}`,
                    color: theme.colores.azul,
                    fontWeight: "bold",
                  }}
                />
              ))}
            </Box>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DashboardFiltrosDialog;
