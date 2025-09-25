// ContratoBuscador.tsx
import React, { useState, useEffect, useContext } from "react";
import {
  Box,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  Autocomplete,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { ContextoGeneral } from "../Contexto";

interface ContratoBuscadorProps {
  onFilterChange: (filterType: string, filterValue: any) => void;
  empresas: any[];
}

const ContratoBuscador: React.FC<ContratoBuscadorProps> = ({
  onFilterChange,
  empresas,
}) => {
  const { theme } = useContext(ContextoGeneral);
  const [filterType, setFilterType] = useState<string>("sin-filtro");
  const [filterValue, setFilterValue] = useState("");
  const [showValueInput, setShowValueInput] = useState(false);

  // Estilos azul para focus
  const azulStyles = {
    '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: theme.colores.azul,
    },
    '& .MuiInputLabel-root.Mui-focused': {
      color: theme.colores.azul,
    },
    '& .MuiSelect-icon': {
      color: theme.colores.azul,
    },
    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: theme.colores.gris,
    },
  };

  // Opciones para el filtro principal
  const filterOptions = [
    { value: "sin-filtro", label: "Todos los contratos" },
    { value: "id", label: "ID" },
    { value: "titular", label: "Titular" },
    { value: "destinatario", label: "Destinatario" },
    { value: "empresa", label: "Empresa" },
  ];

  useEffect(() => {
    onFilterChange("sin-filtro", null);
  }, []);

  useEffect(() => {
    handleSearch();
  }, [filterValue]);

  const handleSearch = () => {
    onFilterChange(filterType, filterValue);
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 1,
        p: 1,
        bgcolor: "#fff",
        borderRadius: 2,
        boxShadow: 2,
        maxWidth: "400px",
        minWidth: "300px",
      }}
    >
      <Box sx={{ display: "flex", gap: 1 }}>
        <Autocomplete
          disablePortal={false}
          slotProps={{ popper: { sx: { zIndex: 2000 } } }}
          options={filterOptions}
          getOptionLabel={(option) => option.label}
          value={filterOptions.find(opt => opt.value === filterType) || filterOptions[0]}
          onChange={(_e, newValue) => {
            const type = newValue?.value || "sin-filtro";
            setFilterType(type);
            setShowValueInput(type !== "sin-filtro");
            if (type === "sin-filtro") {
              onFilterChange("sin-filtro", null);
              setFilterValue("");
            } else {
              setFilterValue("");
              onFilterChange(type, "");
            }
          }}
          renderInput={(params) => (
            <TextField {...params} label="Filtrar por" sx={azulStyles} />
          )}
          sx={{ ...azulStyles, width: "100%" }}
        />
      </Box>

      {showValueInput && (
        <Box sx={{ mt: 1 }}>
          {filterType === "id" && (
            <TextField
              fullWidth
              size="small"
              type="number"
              placeholder="ID de contrato"
              value={filterValue}
              onChange={(e) => {
                setFilterValue(e.target.value);
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
              sx={azulStyles}
            />
          )}

          {filterType === "titular" && (
            <TextField
              fullWidth
              size="small"
              placeholder="Titular"
              value={filterValue}
              onChange={(e) => {
                setFilterValue(e.target.value);
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
              sx={azulStyles}
            />
          )}

          {filterType === "destinatario" && (
            <TextField
              fullWidth
              size="small"
              placeholder="Destinatario"
              value={filterValue}
              onChange={(e) => {
                setFilterValue(e.target.value);
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
              sx={azulStyles}
            />
          )}

          {filterType === "empresa" && (
            <FormControl fullWidth size="small" sx={azulStyles}>
              <Select
                value={filterValue}
                onChange={(e) => setFilterValue(e.target.value)}
                displayEmpty
                renderValue={(selected) =>
                  selected
                    ? empresas.find((e) => e.id === selected)?.razonSocial
                    : "Empresa"
                }
                sx={azulStyles}
              >
                {empresas.map((empresa) => (
                  <MenuItem key={empresa.id} value={empresa.id}>
                    {empresa.razonSocial}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        </Box>
      )}
    </Box>
  );
};

export default ContratoBuscador;
