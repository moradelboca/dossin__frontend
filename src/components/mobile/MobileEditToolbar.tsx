import { Add, FilterList, SaveAlt, Search } from "@mui/icons-material";
import { Box, Button, Menu, MenuItem, TextField } from "@mui/material";
import React, { useContext, useState } from "react";
import { ContextoGeneral } from "../Contexto";
import { ProtectedComponent } from "../protectedComponent/ProtectedComponent";

interface MobileEditToolbarProps {
  onAdd?: () => void;
  onFilter?: () => void;
  onExport?: (formato: "csv" | "pdf") => void;
  onSearch?: (query: string) => void;
  name?: string;
}

const MobileEditToolbar: React.FC<MobileEditToolbarProps> = ({
  onAdd,
  onFilter,
  onExport,
  onSearch,
  name = "Elemento",
}) => {
  const { theme } = useContext(ContextoGeneral);
  const [searchQuery, setSearchQuery] = useState("");
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value;
    setSearchQuery(query);
    if (onSearch) onSearch(query.toLowerCase());
  };

  const handleExportClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleExportClose = () => {
    setAnchorEl(null);
  };

  const handleExportSelect = (formato: "csv" | "pdf") => {
    if (onExport) onExport(formato);
    handleExportClose();
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 1,
        paddingY: 2,
        backgroundColor: "#FFFFFF",
        color: theme.colores.azul,
      }}
    >
      {/* Barra de búsqueda */}
      <TextField
        variant="outlined"
        size="small"
        placeholder="Buscar..."
        value={searchQuery}
        onChange={handleSearchChange}
        InputProps={{
          startAdornment: <Search sx={{ marginRight: 1 }} />,
        }}
        fullWidth
      />

      {/* Botón Agregar */}
      {onAdd && (
        <Button
          startIcon={<Add />}
          onClick={onAdd}
          variant="contained"
          sx={{
            borderRadius: "8px",
            padding: "6px",
            fontSize: "12px",
            backgroundColor: "#FFFFFF",
            color: theme.colores.azul,
            border: "0.1px solid #ccc",
            textTransform: "none",
          }}
          fullWidth
        >
          Agregar {name}
        </Button>
      )}

      {/* Botones Filtros y Exportar */}
      <Box
        sx={{
          display: "flex",
          gap: 1,
        }}
      >
        {onFilter && (
          <Button
            startIcon={<FilterList />}
            onClick={onFilter}
            variant="contained"
            sx={{
              borderRadius: "8px",
              padding: "6px",
              fontSize: "12px",
              flex: 1,
              backgroundColor: "#FFFFFF",
              color: theme.colores.azul,
              border: "0.1px solid #ccc",
              textTransform: "none",
            }}
          >
            Filtros
          </Button>
        )}

        <ProtectedComponent allowedRoles={["Admin"]}>
        <Button
          startIcon={<SaveAlt />}
          onClick={handleExportClick}
          variant="contained"
          sx={{
            borderRadius: "8px",
            padding: "6px",
            fontSize: "12px",
            flex: 1,
            backgroundColor: "#FFFFFF",
            color: theme.colores.azul,
            border: "0.1px solid #ccc",
            textTransform: "none",
          }}
        >
          Exportar
        </Button>
        </ProtectedComponent>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleExportClose}
          
        >
          <MenuItem onClick={() => handleExportSelect("pdf")}>PDF</MenuItem>
          <MenuItem onClick={() => handleExportSelect("csv")}>CSV</MenuItem>
        </Menu>
      </Box>
    </Box>
  );
};

export default MobileEditToolbar;
