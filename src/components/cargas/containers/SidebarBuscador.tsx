// SidebarBuscador.tsx
import React, { useState, useEffect, useContext } from "react";
import {
  Box,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
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
  const { backendURL } = useContext(ContextoGeneral);
  const [filterType, setFilterType] = useState<string>("sin-filtro");
  const [filterValue, setFilterValue] = useState("");
  const [showValueInput, setShowValueInput] = useState(false);
  const [cargamentos, setCargamentos] = useState<any[]>([]);
  const [cargandoCargamentos, setCargandoCargamentos] = useState(true);

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

  const handleFilterTypeChange = (event: any) => {
    const type = event.target.value;
    setFilterType(type);
    setShowValueInput(type !== "sin-filtro");

    // Aplicar filtro inmediatamente al cambiar tipo
    if (type === "sin-filtro") {
      onFilterChange("sin-filtro", null);
      setFilterValue("");
    } else {
      setFilterValue("");
      onFilterChange(type, ""); // Limpiar filtro anterior
    }
  };

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
        <FormControl fullWidth size="small">
          <InputLabel id="filter-type-label">Filtrar por</InputLabel>
          <Select
            defaultValue=""
            labelId="filter-type-label"
            onChange={handleFilterTypeChange}
            displayEmpty
          >
            <MenuItem value="sin-filtro">Todas las provincias</MenuItem>
            <MenuItem value="id">ID</MenuItem>
            <MenuItem value="provincia-carga">Provincia Carga</MenuItem>
            <MenuItem value="provincia-descarga">Provincia Descarga</MenuItem>
            <MenuItem value="cargamento">Cargamento</MenuItem>
          </Select>
        </FormControl>
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
            />
          )}

          {filterType === "provincia-carga" && (
            <FormControl fullWidth size="small">
              <Select
                value={filterValue}
                onChange={(e) => setFilterValue(e.target.value)}
                displayEmpty
                renderValue={(selected) =>
                  selected
                    ? provinciasCarga.find((p) => p.id === selected)?.nombre
                    : "Seleccione provincia"
                }
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
            <FormControl fullWidth size="small">
              <Select
                value={filterValue}
                onChange={(e) => setFilterValue(e.target.value)}
                displayEmpty
                renderValue={(selected) =>
                  selected
                    ? provinciasDescarga.find((p) => p.id === selected)?.nombre
                    : "Seleccione provincia"
                }
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
            <FormControl fullWidth size="small">
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
