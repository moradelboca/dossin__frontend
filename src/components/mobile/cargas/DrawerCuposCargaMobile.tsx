import { useEffect, useState } from "react";
import { Box, IconButton, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useNavigate } from "react-router-dom";

interface DrawerCuposCargaMobileProps {
  cargaSeleccionada: any;
}

export default function DrawerCuposCargaMobile({
  cargaSeleccionada,
}: DrawerCuposCargaMobileProps) {
  const [cupos, setCupos] = useState<any[]>([]);
  const navigate = useNavigate();
  
  const handleClickVerCupos = () => {
    navigate(`/cargas/${cargaSeleccionada.idCarga}/cupos`);
  };

  // Aquí asignamos los cupos directamente desde la carga seleccionada
  useEffect(() => {
    if (cargaSeleccionada?.cupos) {
      setCupos(cargaSeleccionada.cupos);  // Asignamos los cupos directamente
    } else {
      setCupos([]);  // Si no hay cupos, asignamos un array vacío
    }
  }, [cargaSeleccionada]);

  return (
    <Box sx={{ p: 2 }}>
      {/* Título y botón de acción */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography variant="h6">Cupos</Typography>
        <IconButton
          disabled={!cargaSeleccionada}
          onClick={handleClickVerCupos}
          sx={{
            paddingRight: 0,
            paddingBottom: 0,
          }}
        >
          <AddIcon />
        </IconButton>
      </Box>

      {/* Muestra un mensaje si no hay cupos */}
      {!cupos.length ? (
        <Typography variant="subtitle2" color="#90979f" sx={{ marginTop: 2 }}>
          Parece ser que no hay cupos.
        </Typography>
      ) : (
        // Muestra los primeros 3 cupos si existen
        cupos.map((cupo, index) => (
          <Box
            key={index}
            sx={{
              marginBottom: 2,
              borderBottom: "1px solid #eee",
              paddingBottom: 1,
              color:"#90979f",
            }}
          >
            <Typography variant="body2">
              <strong>Fecha:</strong> {cupo.fecha}
            </Typography>
            <Typography variant="body2">
              <strong>Cupos confirmados:</strong> {cupo.turnos?.length ?? 0} ⛟ 🗸
            </Typography>
            <Typography variant="body2">
              <strong>Cupos restantes:</strong> {cupo.cupos} ⛟ ⏱
            </Typography>
          </Box>
        ))
      )}
    </Box>
  );
}
