import React, { useContext } from "react"; 
import {
  Box,
  Button,
  Collapse,
  IconButton,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import EditIcon from "@mui/icons-material/Edit";
import { ContextoGeneral } from "../../Contexto";
import useTransformarCampo from "../../hooks/useTransformarCampo";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";

interface CardMobileProps {
  item: any;
  index: number;
  fields: string[];
  headerNames: string[];
  expandedCard: number | null;
  handleExpandClick: (index: number) => void;
  handleOpenDialog: (item: any) => void;
  tituloField?: string;
  subtituloField?: string;
  customIcon?: string;
  usarSinDesplegable?: boolean;
  mostrarBotonEditar?: boolean;
  // Nuevos props opcionales para botón secundario
  textoSecondaryButton?: string;
  handleSecondButton?: (item: any) => void;
  colorSecondaryButton?: string;
}

const CardMobile: React.FC<CardMobileProps> = ({
  item,
  index,
  fields,
  headerNames,
  expandedCard,
  handleExpandClick,
  handleOpenDialog,
  tituloField,
  subtituloField,
  customIcon,
  usarSinDesplegable,
  mostrarBotonEditar = true,
  textoSecondaryButton,
  handleSecondButton,
  colorSecondaryButton,
}) => {
  const { theme } = useContext(ContextoGeneral);
  const transformarCampo = useTransformarCampo();

  return (
    <Box
      key={index}
      sx={{
        border: "1px solid #ccc",
        marginBottom: 2,
        borderRadius: 2,
        boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
        overflow: "hidden",
        minWidth: usarSinDesplegable ? "25rem" : "auto",
      }}
    >
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        sx={{ padding: 2, backgroundColor: "#ffffff", cursor: "pointer" }}
        onClick={() => !usarSinDesplegable && handleExpandClick(index)}
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
            {customIcon ? (
              <img
                src={customIcon}
                alt="Icono"
                style={{ width: "80%", height: "80%", objectFit: "contain" }}
              />
            ) : (
              <LocalShippingIcon sx={{ width: "80%", height: "80%", color:"#ffffff" }} />
            )}
          </Box>
          <Box>
            <Typography variant="subtitle1" fontWeight="bold">
              {transformarCampo(tituloField || fields[0], item) || "Sin título"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {subtituloField ? transformarCampo(subtituloField, item) : ""}
            </Typography>
          </Box>
        </Box>
        {!usarSinDesplegable && (
          <IconButton
            sx={{
              transform: expandedCard === index ? "rotate(180deg)" : "rotate(0deg)",
              transition: "0.3s",
            }}
          >
            <ExpandMoreIcon />
          </IconButton>
        )}
      </Box>

      <Collapse in={usarSinDesplegable || expandedCard === index} timeout="auto" unmountOnExit>
        <Box sx={{ padding: 2, backgroundColor: "#ffffff" }}>
          {fields.map((field, idx) => (
            <Box
              key={idx}
              marginBottom={1}
              display={usarSinDesplegable ? "flex" : "block"}
              justifyContent={usarSinDesplegable ? "space-between" : "normal"}
              alignItems="center"
            >
              <Typography variant="body2" fontWeight="bold" sx={usarSinDesplegable ? { marginRight: 1 } : {}}>
                {headerNames[idx]}:
              </Typography>
              <Typography variant="body2">
                {transformarCampo(field, item)}
              </Typography>
            </Box>
          ))}
          {/* Botón primario de Editar */}
          {mostrarBotonEditar && (
            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              fullWidth
              sx={{ marginTop: 2 }}
              onClick={() => handleOpenDialog(item)}
            >
              Editar
            </Button>
          )}
          {/* Botón secundario condicional */}
          {textoSecondaryButton && handleSecondButton && (
            <Button
              variant="outlined"
              fullWidth
              sx={{
                marginTop: 2,
                borderColor: colorSecondaryButton ? colorSecondaryButton : theme.colores.azul,
                color: colorSecondaryButton ? colorSecondaryButton : theme.colores.azul,
              }}
              onClick={() => handleSecondButton(item)}
            >
              {textoSecondaryButton}
            </Button>
          )}
        </Box>
      </Collapse>
    </Box>
  );
};

export default CardMobile;
