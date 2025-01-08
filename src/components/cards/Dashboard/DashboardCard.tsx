import React, { useContext } from "react";
import { Box, Typography, Card } from "@mui/material";
import { ContextoGeneral } from "../../Contexto";

interface DashboardCardProps {
  title: string;
  value: string | number;
  unidad?: string;
  titleSize?: string;
  valueSize?: string;
  cardPadding?: string;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ title, value, unidad, titleSize, valueSize, cardPadding }) => {
  const { theme } = useContext(ContextoGeneral);
  return (
    <Card
      sx={{
        display: "flex",
        flexDirection: "column", // Elementos organizados en columna
        justifyContent: "flex-end", // Empujar todo hacia la parte inferior
        alignItems: "flex-start", // Alinear a la izquierda
        height: "100%", // Altura fija para ocupar espacio
        backgroundColor: "white",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        borderRadius: "12px",
        padding: cardPadding ?? "1rem 1rem 0.8rem 1.25rem",
        "&:hover": {
          boxShadow: "0 6px 8px rgba(0, 0, 0, 0.2)",
          transform: "scale(1.02)",
          transition: "all 0.2s ease-in-out",
          backgroundColor:theme.colores.azul,
          "& .value-typography": {
            color: "#ffffff", // Cambiar color del value a blanco cuando se hace hover sobre el Card
          },
        },
      }}
    >
      {/* Contenedor para el valor */}
      <Box
        sx={{
          flexGrow: 1, // Rellenar espacio disponible
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end", // Empujar hacia abajo
          width: "100%",
        }}
      >
        
        <Typography
          variant="subtitle1"
          component="div"
          sx={{
            marginBottom: "4px",
            color: "#90979F",
            fontWeight: "600",
            fontSize: titleSize ?? "1rem", // Tamaño del título
            lineHeight: 1.2,
            wordBreak: "break-word", // Permite que las palabras largas se dividan
            hyphens: "auto",
          }}
        >
          {title}
        </Typography>
        <Typography
          variant="h4"
          component="div"
          className="value-typography" 
          sx={{
            fontWeight: "600",
            fontSize: valueSize ?? "1.4rem", // Tamaño del valor
            color:"#000000",
            
          }}
        >
          {value} {unidad && <span style={{ fontSize: valueSize ?? "1.4rem" }}>{unidad}</span>}
        </Typography>
      </Box>
    </Card>
  );
};

export default DashboardCard;
