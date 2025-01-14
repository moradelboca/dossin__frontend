import React, { useContext } from "react";
import { Box, Button, TextField } from "@mui/material";
import { Add, FilterList, SaveAlt, Search } from "@mui/icons-material";
import { ContextoGeneral } from "../Contexto";

interface MobileEditToolbarProps {
  onAdd?: () => void;
  onFilter?: () => void;
  onExport?: () => void;
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

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (onSearch) onSearch(event.target.value);
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        paddingBottom: 2,
        paddingTop: 2,
        gap: 1,
        backgroundColor: "#FFFFFF",
        color: theme.colores.azul,
      }}
    >
      {/* Barra de búsqueda */}
      <TextField
        variant="outlined"
        size="small"
        placeholder="Buscar..."
        InputProps={{
          startAdornment: <Search sx={{ marginRight: 1 }} />,
        }}
        fullWidth
      />

      {/* Botón Agregar */}
      <Button
        startIcon={<Add />}
        onClick={onAdd}
        variant="contained"
        sx={{
          borderRadius: "8px",
          padding: "6px",
          fontSize: "12px",
          backgroundColor:"#FFFFFF",
          color: theme.colores.azul,
          border: "0.1px solid #ccc",
          textTransform: "none",
        }}
        fullWidth
      >
        Agregar {name}
      </Button>

      {/* Botones Filtros y Exportar */}
      <Box
        sx={{
          display: "flex",
          gap: 1,
          justifyContent: "space-between",
        }}
      >
        {onFilter && onExport ? (
          <>
            <Button
              startIcon={<FilterList />}
              onClick={onFilter}
              variant="contained"
              sx={{
                borderRadius: "8px",
                padding: "6px",
                fontSize: "12px",
                flex: 1,
                backgroundColor:"#FFFFFF",
                color: theme.colores.azul,
                border: "0.1px solid #ccc",
                textTransform: "none",
              }}
            >
              FILTERS
            </Button>
            <Button
              startIcon={<SaveAlt />}
              onClick={onExport}
              variant="contained"
              sx={{
                borderRadius: "8px",
                padding: "6px",
                fontSize: "12px",
                flex: 1,
                backgroundColor:"#FFFFFF",
                color: theme.colores.azul,
                border: "0.1px solid #ccc",
                textTransform: "none",
              }}
            >
              EXPORT
            </Button>
          </>
        ) : (
          <Button
            startIcon={onFilter ? <FilterList /> : <SaveAlt />}
            onClick={onFilter || onExport}
            variant="contained"
            color="primary"
            sx={{
              borderRadius: "8px",
              padding: "6px",
              fontWeight: "bold",
              fontSize: "12px",
              flex: 1,
            }}
            fullWidth
          >
            {onFilter ? "Filtrar" : "Exportar"}
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default MobileEditToolbar;
