import React, { useContext, useState } from "react";
import { Box, Typography, TextField, InputAdornment } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { ContextoGeneral } from "../../Contexto";
import CargasExpandCardMobile from "../../cards/mobile/cargas/CargasExpandCardMobile";
import { TarjetaCarga } from "../../cargas/tarjetas/TarjetaCarga";

interface ListaCargasMobileProps {
  cargas: any[];
  estadoCarga: string;
  cargaSeleccionada: any;
  onCardClick: (carga: any) => void;
  onCrearCarga: () => void;
}

const ListaCargasMobile: React.FC<ListaCargasMobileProps> = ({
  cargas,
  estadoCarga,
  cargaSeleccionada,
  onCardClick,
}) => {
  const { theme } = useContext(ContextoGeneral);
  const [busqueda, setBusqueda] = useState("");

  // Filtrado básico y excluye la carga ya seleccionada
  const cargasFiltradas = cargas
    .filter((carga) => {
      if (!busqueda) return true;
      return JSON.stringify(carga)
        .toLowerCase()
        .includes(busqueda.toLowerCase());
    })
    .filter((carga) => carga.id !== cargaSeleccionada?.id);

  return (
    <Box sx={{ backgroundColor: theme.colores.azul, height: '100vh', minHeight: 0, display: 'flex', flexDirection: 'column', borderRadius: '8px' }}>
      {/* Tarjeta de carga seleccionada arriba, si existe */}
      {cargaSeleccionada && (
        <Box sx={{ backgroundColor: '#fff', borderBottom: '1px solid #ccc', padding: 2 }}>
          <TarjetaCarga
            datosCarga={cargaSeleccionada}
            isSelected
            onClick={() => {}}
          />
        </Box>
      )}
      {/* Buscador y botón de Agregar Carga */}
      <Box
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 11,
          backgroundColor: theme.colores.azul,
          display: "flex",
          flexDirection: "column",
          gap: 1,
          px: 2,
          pt: 2,
        }}
      >
        <TextField
          variant="outlined"
          size="small"
          placeholder="Buscar Carga"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          fullWidth
          sx={{
            backgroundColor: "#fff",
            borderRadius: "50px",
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {/* Contenedor de la lista de cargas, con scroll si es necesario */}
      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          px: 2,
          pt: 2,
          pb: 2,
        }}
      >
        {estadoCarga === "Cargando" && (
          <Typography sx={{ p: 2, color: "#fff" }}>
            Cargando cargas...
          </Typography>
        )}
        {estadoCarga !== "Cargando" && cargasFiltradas.length === 0 && (
          <Typography sx={{ p: 2, color: "#fff" }}>No hay cargas.</Typography>
        )}
        {estadoCarga !== "Cargando" &&
          cargasFiltradas.map((carga, index) => (
            <Box key={index} sx={{ mb: 1 }}>
              <CargasExpandCardMobile
                datosCarga={carga}
                onSelect={(carga) => onCardClick(carga)}
              />
            </Box>
          ))}
      </Box>
    </Box>
  );
};

export default ListaCargasMobile;
