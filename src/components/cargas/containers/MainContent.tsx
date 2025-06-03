import React from "react";
import { Box, Typography, IconButton} from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import ContainerMapa from "./ContainerMapa";
import ContainerProximosCupos from "./ContainterProximosCupos";
import ContainerInformacionCarga from "./ContainerInformacionCarga";
import ContainerDescripcion from "./ContainerDescripcion";
import ContainerDetalles from "./ContainerDetalles";

interface MainContentProps {
  cargaSeleccionada: any;
  onDeleteCarga: () => void;
  rolId?: number;
}

const MainContent: React.FC<MainContentProps> = ({
  cargaSeleccionada,
  onDeleteCarga,
  rolId,
}) => {
  const esRol3 = rolId === 3;
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        flex: 1,
        height: "100%",
        overflowY: { xs: "auto", lg: "hidden" }, 
        backgroundColor: "#ffffff",
      }}
    >
      {/* Header */}
      <Box sx={{ padding: "12px 24px 0", flexShrink: 0 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography variant="h6" color="#90979f">
              Carga ID:
            </Typography>
            <Typography variant="h6">
              {`#${cargaSeleccionada?.id || " "}`}
            </Typography>
          </Box>
          {!esRol3 && (
            <IconButton disabled={!cargaSeleccionada} onClick={onDeleteCarga}>
              <DeleteOutlineIcon sx={{ fontSize: 20, color: "#d68384" }} />
            </IconButton>
          )}
        </Box>
      </Box>

      {/* Contenido principal dividido en 60% - 40% */}
      <Box sx={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        height: esRol3 ? '100%' : undefined,
      }}>
        {/* Sección superior (60%) */}
        <Box sx={{
          flex: esRol3 ? 1 : { lg: '0 0 60%', xs: '0 0 auto' },
          display: "flex",
          p: 1.5,
          paddingTop: 0,
          flexDirection: { xs: "column", lg: "row" },
          gap: "0.5rem",
          minHeight: 0,
          height: esRol3 ? '100%' : undefined,
        }}>
          {/* Mapa (60% del espacio superior) */}
          <Box sx={{
            flex: 1,
            minWidth: { xs: "100%", lg: "60%" },
            height: { lg: "100%", xs: "400px" },
            minHeight: { xs: "400px", lg: 0 },
            display: "flex",
            flexDirection: "column",
            overflow: "hidden"
          }}>
            <ContainerMapa />
          </Box>
          
          {/* Cupos (40% del espacio superior) y Detalles */}
          <Box sx={{
            flex: 1,
            height: { lg: "100%", xs: "400px" },
            minHeight: { lg: "100%", xs: "400px" },
            minWidth: { xs: "100%", lg: "40%" },
            display: "flex",
            flexDirection: "column",
            overflow: "hidden"
          }}>
            <ContainerProximosCupos />
            <ContainerDetalles/>
          </Box>
        </Box>

        {/* Sección inferior (40%) */}
        {!esRol3 && (
          <Box sx={{
            flex: { lg: '0 0 40%', xs: '0 0 auto' }, 
            minHeight: 0,
            display: "flex",
            gap: "0.5rem",
            p: 1.5,
            paddingTop: 0,
            flexDirection: { xs: "column", lg: "row" },
          }}>
            {/* Información (60% del espacio inferior) */}
            <Box sx={{
              flex: 1,
              height: { lg: "100%", xs: "auto" },
              minWidth: { xs: "100%", lg: "60%" },
              minHeight: { xs: "220px" },
              display: "flex",
              flexDirection: "column",
              overflow: "hidden"
            }}>
              <ContainerInformacionCarga />
            </Box>
            
            {/* Detalles (40% del espacio inferior) */}
            <Box sx={{
              flex: 1,
              height: { lg: "100%", xs: "auto" },
              minWidth: { xs: "100%", lg: "40%" },
              display: "flex",
              flexDirection: "column",
              overflow: "hidden"
            }}>
              <ContainerDescripcion />
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default MainContent;
