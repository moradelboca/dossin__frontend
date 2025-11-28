import { Box, Typography, CircularProgress, Alert } from "@mui/material";
import { useEffect, useState } from "react";
import { Archivo } from "../../interfaces/archivo";
import { archivosService } from "../../services/archivosService";
import { ResizableWidget } from "./ResizableWidget";

export default function Widgets() {
  const [archivos, setArchivos] = useState<Archivo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cargarArchivos = async () => {
      try {
        setLoading(true);
        const data = await archivosService.obtenerArchivos();
        setArchivos(data);
        setError(null);
      } catch (err) {
        setError('Error al cargar los widgets');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    cargarArchivos();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (archivos.length === 0) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="info">No hay widgets disponibles</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      p: 3, 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      <Typography variant="h4" sx={{ mb: 3, flexShrink: 0 }}>Widgets</Typography>
      <Box sx={{ 
        display: 'flex', 
        flexWrap: 'nowrap',
        overflowX: 'auto',
        overflowY: 'hidden',
        flex: 1,
        pb: 1,
        '&::-webkit-scrollbar': {
          height: '12px',
        },
        '&::-webkit-scrollbar-track': {
          backgroundColor: 'rgba(0, 0, 0, 0.05)',
        },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: 'rgba(0, 0, 0, 0.2)',
          borderRadius: '6px',
          '&:hover': {
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
          },
        },
      }}>
        {archivos.map((archivo) => (
          <ResizableWidget key={archivo.id} archivo={archivo} />
        ))}
      </Box>
    </Box>
  );
}
