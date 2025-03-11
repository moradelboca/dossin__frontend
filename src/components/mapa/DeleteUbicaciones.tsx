import { useContext } from "react";
import { Box, Button, Typography } from "@mui/material";
import ClearSharpIcon from "@mui/icons-material/ClearSharp";
import { ContextoGeneral } from "../Contexto";

interface DeleteUbicacionProps {
  id: number | null;
  handleCloseDialog: () => void;
  handleClose: () => void;
  refreshUbicaciones: () => void;
}

export default function DeleteUbicacion({
  id,
  handleCloseDialog,
  handleClose,
  refreshUbicaciones,
}: DeleteUbicacionProps) {
  const { backendURL, theme } = useContext(ContextoGeneral);

  const handleNoClick = () => {
    handleCloseDialog();
  };

  const borrarUbicacion = async () => {
    try {
      await fetch(`${backendURL}/ubicaciones/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
      });
    } catch (error) {
      console.error("Error al borrar la ubicación", error);
    } finally {
      handleCloseDialog();
      refreshUbicaciones();
      handleClose();
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        alignItems: "center",
        width: "100%",
        maxWidth: "400px",
        p: 3,
        borderRadius: 2,
        m: "auto",
        gap: 2,
        position: "relative",
      }}
    >
      <Typography variant="h6" color="textPrimary" align="center">
        ¿Está seguro de que quiere eliminar la ubicación?
      </Typography>
      <ClearSharpIcon
        onClick={handleCloseDialog}
        sx={{
          position: "absolute",
          top: 10,
          right: 10,
          cursor: "pointer",
          color: theme.colores.azul,
        }}
      />
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-around",
          alignItems: "center",
          width: "100%",
          gap: 2,
          mt: 2,
        }}
      >
        <Button
          variant="text"
          onClick={borrarUbicacion}
          sx={{
            color: "#d68384",
            width: "100%",
            maxWidth: "100px",
            fontWeight: "bold",
          }}
        >
          Sí
        </Button>
        <Button
          variant="text"
          onClick={handleNoClick}
          sx={{
            width: "100%",
            color: theme.colores.azul,
            maxWidth: "100px",
            fontWeight: "bold",
          }}
        >
          No
        </Button>
      </Box>
    </Box>
  );
}
