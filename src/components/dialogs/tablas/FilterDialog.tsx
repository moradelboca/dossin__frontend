import React, { useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Select,
  TextField,
  Typography,
  IconButton,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh"; // Ícono de flecha en espiral

const FilterDialog = ({
  open,
  onClose,
  onApplyFilter,
  columns,
  onUndoFilter
}) => {
  const [selectedColumn, setSelectedColumn] = useState("");
  const [selectedOperator, setSelectedOperator] = useState("");
  const [filterValue, setFilterValue] = useState("");

  const operators = [
    "contains",
    "does not contain",
    "equals",
    "does not equal",
    "starts with",
    "ends with",
    "is empty",
    "is not empty",
    "is any of",
  ];

  const handleApply = () => {
    if (selectedColumn && selectedOperator) {
      onApplyFilter({
        column: selectedColumn,
        operator: selectedOperator,
        value: filterValue,
      });
      onClose(); // Cierra el diálogo al aplicar el filtro
    } else {
      onUndoFilter();
      onClose();
    }
  };

  const handleReset = () => {
    setSelectedColumn("");
    setSelectedOperator("");
    setFilterValue("");
    onUndoFilter();
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        Filtrar Datos
        <IconButton
          onClick={handleReset}
          color="default"
          style={{ position: "absolute", right: 10, top: 10 }}
        >
          <RefreshIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Box display="flex" flexDirection="column" gap={3}>
          <Box>
            <Typography variant="body1">Columna</Typography>
            <Select
              fullWidth
              value={selectedColumn}
              onChange={(e) => setSelectedColumn(e.target.value)}
              displayEmpty
            >
              <MenuItem value="">
                <em>Seleccionar columna</em>
              </MenuItem>
              {columns.map((column) => (
                <MenuItem key={column} value={column}>
                  {column}
                </MenuItem>
              ))}
            </Select>
          </Box>
          
          <Box>
            <Typography variant="body1">Operador</Typography>
            <Select
              fullWidth
              value={selectedOperator}
              onChange={(e) => setSelectedOperator(e.target.value)}
              displayEmpty
            >
              <MenuItem value="">
                <em>Seleccionar operador</em>
              </MenuItem>
              {operators.map((operator) => (
                <MenuItem key={operator} value={operator}>
                  {operator}
                </MenuItem>
              ))}
            </Select>
          </Box>

          <Box>
            <Typography variant="body1">Valor</Typography>
            <TextField
              fullWidth
              value={filterValue}
              onChange={(e) => setFilterValue(e.target.value)}
              placeholder="Ingresar valor"
              disabled={
                selectedOperator === "is empty" ||
                selectedOperator === "is not empty"
              }
            />
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">
          Cancelar
        </Button>
        <Button onClick={handleApply} color="primary" variant="contained">
          Aplicar Filtro
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FilterDialog;
