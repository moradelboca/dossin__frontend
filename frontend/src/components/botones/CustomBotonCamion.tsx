import { styled, Typography } from "@mui/material";
import Button from "@mui/material/Button";
import { useContext, useState } from "react";
import { ContextoStepper } from "../tarjetas/CrearCargaStepper";

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
    id: any;
}

export function CustomBotonCamion(props: CustomButtomProps) {
    const { datosNuevaCarga } = useContext(ContextoStepper)
    const { title, imageSrc, id } = props;
    const [isPressed, setIsPressed] = useState(datosNuevaCarga["idsTiposAcoplados"].includes(id));

    function handleClick() {
        setIsPressed(!isPressed); 
        if (!isPressed) {
            datosNuevaCarga["idsTiposAcoplados"].push(parseInt(id)); 
        } else {
            const pos = datosNuevaCarga["idsTiposAcoplados"].indexOf(id);
            if (pos !== -1) {
                datosNuevaCarga["idsTiposAcoplados"].splice(pos, 1);
            }
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
