// CargasExpandCardMobile.tsx
import React, { useState, useContext } from "react";
import { Box, Collapse, IconButton, Typography } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import { ContextoGeneral } from "../../../Contexto";
import MainButton from "../../../botones/MainButtom"; // Ajusta la ruta según tu estructura

interface CargasExpandCardMobileProps {
  datosCarga: any;
  /** Función a ejecutar cuando se selecciona la carga */
  onSelect?: (datosCarga: any) => void;
}

const CargasExpandCardMobile: React.FC<CargasExpandCardMobileProps> = ({
  datosCarga,
  onSelect,
}) => {
  const { theme } = useContext(ContextoGeneral);
  const [expanded, setExpanded] = useState(false);

  const handleExpandClick = () => {
    setExpanded((prev) => !prev);
  };

  // Definición de título y subtítulo
  const title = `Carga: #${datosCarga.id}, ${datosCarga.cargamento.nombre}`;
  const subtitle = `${datosCarga.ubicacionCarga.localidad.nombre} > ${datosCarga.ubicacionDescarga.localidad.nombre}`;

  return (
    <Box
      sx={{
        border: "1px solid #ccc",
        marginBottom: 2,
        borderRadius: 2,
        boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
        overflow: "hidden",
      }}
    >
      {/* Header de la card */}
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        sx={{ padding: 2, backgroundColor: "#ffffff", cursor: "pointer" }}
        onClick={handleExpandClick}
      >
        <Box display="flex" alignItems="center" gap={2}>
          <Box
            sx={{
              width: 40,
              height: 40,
              backgroundColor: theme.colores.azul,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "4px",
            }}
          >
            <LocalShippingIcon
              sx={{ width: "80%", height: "80%", color: "#ffffff" }}
            />
          </Box>
          <Box>
            <Typography variant="subtitle1" color="black">
              {title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {subtitle}
            </Typography>
          </Box>
        </Box>
        <IconButton
          sx={{
            transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
            transition: "0.3s",
          }}
        >
          <ExpandMoreIcon />
        </IconButton>
      </Box>

      {/* Contenido desplegable */}
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <Box sx={{ padding: 2, backgroundColor: "#ffffff" }}>
          <Box sx={{ display: "flex", flexDirection: "row", marginBottom:"1rem" }}>
            {/* Columna de iconos/indicadores */}
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                marginRight: 2,
              }}
            >
              <Typography sx={{ color: theme.colores.azul, fontSize: "24px" }}>
                ●
              </Typography>
              <Box
                sx={{
                  width: "2px",
                  height: "50px",
                  borderRight: "2px dashed #90979f",
                }}
              />
              <Typography sx={{ color: theme.colores.azul, fontSize: "24px" }}>
                ○
              </Typography>
            </Box>

            {/* Contenido de lugares de carga y descarga */}
            <Box sx={{ display: "flex", flexDirection: "column" }}>
              {/* Lugar de carga */}
              <Box sx={{ marginBottom: 4 }}>
                <Typography color="black">
                  {datosCarga.ubicacionCarga.localidad.nombre},{" "}
                  {datosCarga.ubicacionCarga.localidad.provincia.nombre},{" "}
                  {datosCarga.ubicacionCarga.localidad.provincia.pais.nombre}
                </Typography>
                <Typography color="#90979f">
                  {datosCarga.ubicacionCarga.nombre}
                </Typography>
              </Box>
              {/* Lugar de descarga */}
              <Box>
                <Typography color="black">
                  {datosCarga.ubicacionDescarga.localidad.nombre},{" "}
                  {datosCarga.ubicacionDescarga.localidad.provincia.nombre},{" "}
                  {datosCarga.ubicacionDescarga.localidad.provincia.pais.nombre}
                </Typography>
                <Typography color="#90979f">
                  {datosCarga.ubicacionDescarga.nombre}
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Botón de selección utilizando MainButton */}
          {onSelect && (
            <MainButton
              onClick={() => onSelect(datosCarga)}
              text="Seleccionar"
              backgroundColor={theme.colores.azul}
              textColor="#fff"
              width="90%"
            />
          )}
        </Box>
      </Collapse>
    </Box>
  );
};

export default CargasExpandCardMobile;
