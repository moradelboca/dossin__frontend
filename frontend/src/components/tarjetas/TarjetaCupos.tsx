import { Box, Typography } from "@mui/material";
import { CustomButtom } from "../botones/CustomButtom";
import { styled } from "@mui/material/styles";
import Grid from "@mui/material/Grid2";
import Divider from "@mui/material/Divider";
import { useState } from "react";

const StyledCaja = styled(Box)(() => ({
  minWidth: 180,
  minHeight: 170,
  maxHeight: 230,
  maxWidth: 230,
  background: "#d9d9d9",
  borderRadius: "20px",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  flexDirection: "column",
  boxShadow: "0 6px 16px 0 #8d8c8c",
  transition: "0.2s",
  margin: 1,
  padding: "28px 12px",
  "&:hover": {
    background: "#b5b5b5",
    transform: "scale(1.1)",
  },
}));

interface TarjetaProps {
  fecha: string;
  cuposDisponibles: number;
  cuposConfirmados: number;
}

export function TarjetaCupos(props: TarjetaProps) {
  const { fecha, cuposDisponibles, cuposConfirmados } = props;

  const [cuposDisponiblesEstado, setCuposDisponiblesEstado] =
    useState(cuposDisponibles);

  function handleClick() {
    setCuposDisponiblesEstado(cuposDisponiblesEstado + 1);
  }

  return (
    <>
      <StyledCaja>
        <Typography variant="h5" color="#163660">
          {fecha}
        </Typography>
        <Divider
          orientation="horizontal"
          flexItem
          sx={{ bgcolor: "#163660" }}
        />
        <Grid container spacing="10px" padding="28px 0px">
          <Grid width="45%" alignItems="center">
            <Typography variant="body1" textAlign="center" color="#163660">
              Cupos Disponibles:
            </Typography>
            <Typography variant="h6" textAlign="center" color="#163660">
              {cuposDisponiblesEstado}
            </Typography>
          </Grid>
          <Grid width="45%" alignItems="center">
            <Typography variant="body1" textAlign="center" color="#163660">
              Cupos Confirmados:
            </Typography>
            <Typography variant="h6" textAlign="center" color="#163660">
              {cuposConfirmados}
            </Typography>
          </Grid>
        </Grid>
        <CustomButtom onClick={handleClick} title="Crear nuevo cupo" />
      </StyledCaja>
    </>
  );
}
