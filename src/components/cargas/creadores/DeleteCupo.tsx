import { Box, Button, Typography } from "@mui/material";
import { useContext } from "react";
import { ContextoGeneral } from "../../Contexto";
import ClearSharpIcon from "@mui/icons-material/ClearSharp";

// Define el tipo para el cupo (ajústalo según tu modelo)
interface Cupo {
  carga: number;
  cupos: number;
  fecha: any;
  turnos: any[];
  turnosConErrores: any[];
}

interface DeleteCupoProps {
  idCarga: any;
  handleCloseDialog: () => void;
  fecha: any;
  refreshCupos: () => void;
  selectedCupo: Cupo;
}

export default function DeleteCupo(props: DeleteCupoProps) {
  const { handleCloseDialog, idCarga, fecha, refreshCupos, selectedCupo } = props;
  const { backendURL, theme } = useContext(ContextoGeneral);

  const handleDeleteCupo = () => {
    fetch(`${backendURL}/cargas/${idCarga}/cupos/${fecha}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true",
      },
    })
      .then((response) => response.json())
      .then(() => {
        refreshCupos();
        handleCloseDialog();
      })
      .catch((error) => {
        console.error("Error al borrar el cupo", error);
      });
  };

  // Verifica si el array de turnos está vacío
  const isTurnosEmpty = selectedCupo.turnos.length === 0;

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        alignItems: "center",
        width: "100%",
        maxWidth: "400px",
        padding: 3,
        borderRadius: 2,
        margin: "auto",
        gap: 2,
        position: "relative",
      }}
    >
      <ClearSharpIcon
        onClick={handleCloseDialog}
        sx={{
          position: "absolute",
          top: "10px",
          right: "10px",
          cursor: "pointer",
          color: theme.colores.azul,
        }}
      />
      {isTurnosEmpty ? (
        <>
          <Typography variant="h6" color="textPrimary" align="center">
            ¿Está seguro de que quiere eliminar el cupo?
          </Typography>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-around",
              alignItems: "center",
              width: "100%",
              gap: 2,
              marginTop: 2,
            }}
          >
            <Button
              variant="text"
              onClick={handleDeleteCupo}
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
              onClick={handleCloseDialog}
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
        </>
      ) : (
        <>
          <Typography variant="h6" color="textPrimary" align="center">
            Primero debe borrar los turnos asociados a este cupo.
          </Typography>
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              width: "100%",
              marginTop: 2,
            }}
          >
            <Button
              variant="text"
              onClick={handleCloseDialog}
              sx={{
                width: "100%",
                color: theme.colores.azul,
                maxWidth: "100px",
                fontWeight: "bold",
              }}
            >
              Ok
            </Button>
          </Box>
        </>
      )}
    </Box>
  );
}
