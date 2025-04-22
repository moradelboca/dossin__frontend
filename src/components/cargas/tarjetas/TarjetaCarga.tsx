import { Box } from "@mui/material";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import { useContext } from "react";
import { ContextoGeneral } from "../../Contexto";

export function TarjetaCarga(props: any) {
  const { onClick, datosCarga, isSelected } = props;
  const { theme } = useContext(ContextoGeneral);

  return (
    <Box sx={{ width: "100%", p: "0 8px" }}>
      <Card
        onClick={onClick}
        sx={{
          width: "100%",
          borderRadius: 2,
          transition: "transform 0.2s, box-shadow 0.2s",
          "&:hover": {
            transform: "scale(1.02)",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)"
          }
        }}
      >
        <CardContent sx={{ 
          p: "clamp(8px, 1.5vw, 12px)",
          '&:last-child': { pb: "clamp(8px, 1.5vw, 12px)" }
        }}>
          {/* Encabezado mejorado */}
          <Box sx={{ 
            display: "flex",
            flexWrap: "wrap",
            gap: 1,
            mb: 2,
            alignItems: "baseline"
          }}>
            <Typography 
              component="span" 
              sx={{ 
                fontSize: "clamp(0.8rem, 1.3vw, 0.9rem)",
                color: "#90979f",
                flexShrink: 0
              }}
            >
              Carga:
            </Typography>
            <Typography
              component="span"
              sx={{
                fontSize: "clamp(0.8rem, 1.3vw, 0.9rem)",
                fontWeight: 500,
                lineHeight: 1.2,
                wordBreak: "break-word"
              }}
            >
              #{datosCarga.id}, {datosCarga.cargamento.nombre}
            </Typography>
          </Box>

          {/* Grid container optimizado */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "min-content 1fr",
              gridTemplateRows: "repeat(2, auto)",
              border: 2,
              borderColor: isSelected ? theme.colores.azul + "40" : "#ccc",
              borderRadius: 2,
              bgcolor: isSelected ? theme.colores.azul : "#fff",
              color: isSelected ? "#fff" : "#000",
              p: 2,
              position: "relative",
              overflow: "hidden"
            }}
          >
            {/* Línea vertical centralizada */}
            <Box
              sx={{
                position: "absolute",
                left: "1.45rem",
                top: "30%",
                bottom: "30%",
                width: "2px",
                borderRight: `2px dashed ${isSelected ? "#ffffffdd" : "#90979f"}`, 
                transform: "translateX(-50%)",
                zIndex: 1
              }}
            />

            {/* Puntos alineados */}
            <Box
              sx={{
                gridColumn: 1,
                gridRow: "1 / -1",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                height: "100%",
                pr: 1.5,
                position: "relative"
              }}
            >
              <Typography
                sx={{
                  fontSize: "clamp(1rem, 2.5vw, 1.5rem)",
                  color: isSelected ? "#fff" : theme.colores.azul,
                  lineHeight: 0.8
                }}
              >
                ●
              </Typography>
              <Typography
                sx={{
                  fontSize: "clamp(1rem, 2.5vw, 1.5rem)",
                  color: isSelected ? "#fff" : theme.colores.azul,
                  lineHeight: 0.8
                }}
              >
                ○
              </Typography>
            </Box>

            {/* Contenido responsivo */}
            <Box 
              gridColumn={2} 
              gridRow={1}
              sx={{ 
                alignSelf: "end",
                pb: { xs: 0.5, sm: 1 }
              }}
            >
              <Typography
                sx={{
                  fontSize: "clamp(0.75rem, 1.1vw, 0.9rem)",
                  lineHeight: 1.3,
                  wordBreak: "break-word",
                  hyphens: "auto",
                  fontWeight: 500
                }}
              >
                {datosCarga.ubicacionCarga.localidad.nombre},{" "}
                {datosCarga.ubicacionCarga.localidad.provincia.nombre},{" "}
                {datosCarga.ubicacionCarga.localidad.provincia.pais.nombre}
              </Typography>
              <Typography
                sx={{
                  fontSize: "clamp(0.7rem, 0.9vw, 0.85rem)",
                  color: isSelected ? "#d9d9e6" : "#90979f",
                  mt: 0.5,
                  lineHeight: 1.2
                }}
              >
                {datosCarga.ubicacionCarga.nombre}
              </Typography>
            </Box>

            <Box 
              gridColumn={2} 
              gridRow={2}
              sx={{ 
                alignSelf: "start",
                pt: { xs: 0.5, sm: 1 }
              }}
            >
              <Typography
                sx={{
                  fontSize: "clamp(0.75rem, 1.1vw, 0.9rem)",
                  lineHeight: 1.3,
                  wordBreak: "break-word",
                  hyphens: "auto",
                  fontWeight: 500
                }}
              >
                {datosCarga.ubicacionDescarga.localidad.nombre},{" "}
                {datosCarga.ubicacionDescarga.localidad.provincia.nombre},{" "}
                {datosCarga.ubicacionDescarga.localidad.provincia.pais.nombre}
              </Typography>
              <Typography
                sx={{
                  fontSize: "clamp(0.7rem, 0.9vw, 0.85rem)",
                  color: isSelected ? "#d9d9e6" : "#90979f",
                  mt: 0.5,
                  lineHeight: 1.2
                }}
              >
                {datosCarga.ubicacionDescarga.nombre}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}