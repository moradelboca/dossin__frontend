import { styled, Typography } from "@mui/material";
import Button from "@mui/material/Button";
import { useState } from "react";

const StyledBoton = styled(Button)<{ isPressed: boolean }>(({ isPressed }) => ({
  background: isPressed ? "#347ad6" : "#163660", // Cambia el color según el estado
  textTransform: "none",
  color: "#ffffff",
  display: "flex",
  alignItems: "center",
  gap: "0px",
  flexDirection: "column",
  padding: "20px",
  borderRadius: "15px",
  transition: "background 0.3s ease",
  "&:hover": {
    background: isPressed ? "#347ad6" : "#1a426e", // Permite el hover solo si no está presionado
  },
}));

const StyledTypography = styled(Typography)<{ isPressed: boolean }>(
  ({ isPressed }) => ({
    transition: "font-size 0.3s ease", // Transición para el cambio en el tamaño de fuente
    fontSize: isPressed ? "1rem" : "1.25rem", // Tamaño de fuente cuando está presionado o no
  })
);

interface CustomButtomProps {
  title: string;
  imageSrc?: string;
  array: string[];
}

export function CustomBotonCamion(props: CustomButtomProps) {
  const { title, imageSrc, array } = props;

  // Estado para controlar si el botón está presionado
  const [isPressed, setIsPressed] = useState(false);

  // Alternar el estado cuando se hace clic
  function handleClick() {
    setIsPressed(!isPressed); // Alterna entre true y false
    if (!isPressed) {
      array.push(title);
    } else {
      const pos = array.indexOf(title);
      array.splice(pos, 1);
    }
  }

  return (
    <StyledBoton
      onClick={handleClick}
      isPressed={isPressed} // Pasar el estado al estilo del botón
    >
      {imageSrc && (
        <img
          src={imageSrc}
          alt="icono"
          style={{ width: "140px", height: "90px" }}
        />
      )}
      <StyledTypography isPressed={isPressed}>{title}</StyledTypography>
    </StyledBoton>
  );
}
