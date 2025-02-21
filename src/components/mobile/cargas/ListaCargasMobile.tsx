import React, { useContext, useState } from "react";
import { Box, Typography, TextField, InputAdornment } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { ContextoGeneral } from "../../Contexto";
import CargasExpandCardMobile from "../../cards/mobile/cargas/CargasExpandCardMobile";
import MainButton from "../../botones/MainButtom"; // Ajusta la ruta según corresponda
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
  onCrearCarga,
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
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <Box
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          backgroundColor: "#FFFFFF",
          borderBottom: "1px solid #ccc",
          padding: 2,
        }}
      >
        {cargaSeleccionada ? (
          <TarjetaCarga
            datosCarga={cargaSeleccionada}
            isSelected
            onClick={() => {}}
          />
        ) : (
          <Box sx={{ height: 150 }} />
        )}
      </Box>

      {/* Contenedor unificado con fondo azul, que agrupa el buscador, botón y listado */}
      <Box
        sx={{
          backgroundColor: theme.colores.azul,
          borderRadius: "8px",
          padding: "2rem 1.5rem",
          display: "flex",
          flexDirection: "column",
          minHeight: "50vh",  
        }}
      >
        
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
          <MainButton onClick={onCrearCarga} text="+ Agregar Carga" />
        </Box>

        {/* Contenedor de la lista de cargas, con scroll si es necesario */}
        <Box
          sx={{
            flex: 1,
            overflowY: "auto",
            paddingBottom: "16px",
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

          {/* Espacio en blanco al final para evitar que quede muy pegado */}
          <Box sx={{ height: 16 }} />
        </Box>
      </Box>
    </Box>
  );
};

export default ListaCargasMobile;
