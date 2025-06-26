// SidebarBuscador.tsx
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
import { ContextoGeneral } from "../../Contexto";

interface SidebarBuscadorProps {
  onFilterChange: (filterType: string, filterValue: any) => void;
  provinciasCarga: any[];
  provinciasDescarga: any[];
}

const SidebarBuscador: React.FC<SidebarBuscadorProps> = ({
  onFilterChange,
  provinciasCarga,
  provinciasDescarga,
}) => {
  const { backendURL, theme } = useContext(ContextoGeneral);
  const [filterType, setFilterType] = useState<string>("sin-filtro");
  const [filterValue, setFilterValue] = useState("");
  const [showValueInput, setShowValueInput] = useState(false);
  const [cargamentos, setCargamentos] = useState<any[]>([]);
  const [cargandoCargamentos, setCargandoCargamentos] = useState(true);

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
    { value: "sin-filtro", label: "Todas las provincias" },
    { value: "id", label: "ID" },
    { value: "provincia-carga", label: "Provincia Carga" },
    { value: "provincia-descarga", label: "Provincia Descarga" },
    { value: "cargamento", label: "Cargamento" },
  ];

  useEffect(() => {
    fetch(`${backendURL}/cargamentos`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setCargamentos(data);
      })
      .catch(console.error)
      .finally(() => setCargandoCargamentos(false));
  }, [backendURL]);

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
        width: "100%",
        display: "flex",
        flexDirection: "column",
        gap: 1,
        p: 1,
        position: "sticky",
        top: 0,
        bgcolor: "background.paper",
        zIndex: 1,
      }}
    >
      <Box sx={{ display: "flex", gap: 1 }}>
        <Autocomplete
          disablePortal
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
              label="ID de carga"
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

          {filterType === "provincia-carga" && (
            <FormControl fullWidth size="small" sx={azulStyles}>
              <Select
                value={filterValue}
                onChange={(e) => setFilterValue(e.target.value)}
                displayEmpty
                renderValue={(selected) =>
                  selected
                    ? provinciasCarga.find((p) => p.id === selected)?.nombre
                    : "Seleccione provincia"
                }
                sx={azulStyles}
              >
                {provinciasCarga.map((provincia) => (
                  <MenuItem key={provincia.id} value={provincia.id}>
                    {provincia.nombre}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          {filterType === "provincia-descarga" && (
            <FormControl fullWidth size="small" sx={azulStyles}>
              <Select
                value={filterValue}
                onChange={(e) => setFilterValue(e.target.value)}
                displayEmpty
                renderValue={(selected) =>
                  selected
                    ? provinciasDescarga.find((p) => p.id === selected)?.nombre
                    : "Seleccione provincia"
                }
                sx={azulStyles}
              >
                {provinciasDescarga.map((provincia) => (
                  <MenuItem key={provincia.id} value={provincia.id}>
                    {provincia.nombre}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          {filterType === "cargamento" && (
            <FormControl fullWidth size="small" sx={azulStyles}>
              <Select
                value={filterValue}
                onChange={(e) => setFilterValue(e.target.value)}
                displayEmpty
                disabled={cargandoCargamentos}
                renderValue={(selected) =>
                  selected
                    ? cargamentos.find((c) => c.id === selected)?.nombre
                    : "Seleccione cargamento"
                }
                sx={azulStyles}
              >
                {cargamentos.map((cargamento) => (
                  <MenuItem key={cargamento.id} value={cargamento.id}>
                    {cargamento.nombre}
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

export default SidebarBuscador;
