import { useState, useContext } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  IconButton,
} from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import RefreshIcon from "@mui/icons-material/Refresh"; // Ícono de flecha en espiral
import { ContextoGeneral } from '../../Contexto';

interface FilterDialogProps {
  open: boolean;
  onClose: () => void;
  onApplyFilter: (filter: { column: string; operator: string; value: string }) => void;
  columns: string[];
  headerNames: string[];
  onUndoFilter: () => void;
}

const operatorOptions = [
  { value: "contains", label: "Contiene" },
  { value: "does not contain", label: "No contiene" },
  { value: "equals", label: "Igual a" },
  { value: "does not equal", label: "Distinto de" },
  { value: "starts with", label: "Empieza con" },
  { value: "ends with", label: "Termina con" },
  { value: "is empty", label: "Está vacío" },
  { value: "is not empty", label: "No está vacío" },
  { value: "is any of", label: "Es alguno de" },
];

const FilterDialog: React.FC<FilterDialogProps> = ({
  open,
  onClose,
  onApplyFilter,
  columns,
  headerNames,
  onUndoFilter
}) => {
  const { theme } = useContext(ContextoGeneral);
  const [selectedColumn, setSelectedColumn] = useState<string | null>(null);
  const [selectedOperator, setSelectedOperator] = useState<string | null>(null);
  const [filterValue, setFilterValue] = useState("");

  // Opciones para el Autocomplete de columnas
  const columnOptions = columns.map((col, idx) => ({
    value: col,
    label: (headerNames && headerNames[idx]) ? headerNames[idx] : col
  }));

  const handleApply = () => {
    if (selectedColumn && selectedOperator) {
      onApplyFilter({
        column: selectedColumn,
        operator: selectedOperator,
        value: filterValue,
      });
      onClose();
    } else {
      onUndoFilter();
      onClose();
    }
  };

  const handleReset = () => {
    setSelectedColumn(null);
    setSelectedOperator(null);
    setFilterValue("");
    onUndoFilter();
    onClose();
  };

  const azulStyles = {
    '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: theme.colores.azul,
    },
    '& .MuiInputLabel-root.Mui-focused': {
      color: theme.colores.azul,
    },
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ color: theme.colores.azul }}>
        Filtrar Datos
        <IconButton
          onClick={handleReset}
          color="default"
          sx={{ position: "absolute", right: 10, top: 10 }}
        >
          <RefreshIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Box display="flex" flexDirection="column" gap={3}>
          <Autocomplete
            options={columnOptions}
            getOptionLabel={option => option.label}
            value={columnOptions.find(opt => opt.value === selectedColumn) || null}
            onChange={(_, newValue) => setSelectedColumn(newValue ? newValue.value : null)}
            renderInput={(params) => (
              <TextField {...params} label="Columna" fullWidth sx={azulStyles} />
            )}
            isOptionEqualToValue={(option, value) => option.value === value.value}
          />
          <Autocomplete
            options={operatorOptions}
            getOptionLabel={option => option.label}
            value={operatorOptions.find(opt => opt.value === selectedOperator) || null}
            onChange={(_, newValue) => setSelectedOperator(newValue ? newValue.value : null)}
            renderInput={(params) => (
              <TextField {...params} label="Operador" fullWidth sx={azulStyles} />
            )}
            isOptionEqualToValue={(option, value) => option.value === value.value}
          />
          <TextField
            fullWidth
            value={filterValue}
            onChange={(e) => setFilterValue(e.target.value)}
            placeholder="Ingresar valor"
            label="Valor"
            sx={azulStyles}
            disabled={selectedOperator === "is empty" || selectedOperator === "is not empty"}
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 1, p: 2 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{
            borderColor: theme.colores.azul,
            color: theme.colores.azul,
            borderRadius: '8px',
            textTransform: 'none',
            fontWeight: 500,
            width: { xs: '100%', sm: 'auto' },
            '&:hover': {
              borderColor: theme.colores.azul,
              backgroundColor: '#f0f8ff',
            },
          }}
        >
          Cancelar
        </Button>
        <Button
          onClick={handleApply}
          variant="contained"
          sx={{
            backgroundColor: theme.colores.azul,
            color: '#fff',
            borderRadius: '8px',
            textTransform: 'none',
            fontWeight: 500,
            width: { xs: '100%', sm: 'auto' },
            '&:hover': {
              backgroundColor: theme.colores.azulOscuro,
            },
          }}
        >
          Aplicar Filtro
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FilterDialog;
