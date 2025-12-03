import { Box, Typography, CircularProgress, Alert, Button } from "@mui/material";
import { useEffect, useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import { Archivo } from "../../interfaces/archivo";
import { archivosService } from "../../services/archivosService";
import { ResizableWidget } from "./ResizableWidget";
import { CreateWidgetDialog } from "./CreateWidgetDialog";
import { useAuth } from "../autenticacion/ContextoAuth";

export default function Widgets() {
  const [archivos, setArchivos] = useState<Archivo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const { user } = useAuth();

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

  const handleDelete = (id: number) => {
    setArchivos((prev) => prev.filter((archivo) => archivo.id !== id));
  };

  const handleUpdate = (archivoActualizado: Archivo) => {
    setArchivos((prev) =>
      prev.map((archivo) =>
        archivo.id === archivoActualizado.id ? archivoActualizado : archivo
      )
    );
  };

  const handleCreate = (nuevoArchivo: Archivo) => {
    setArchivos((prev) => [...prev, nuevoArchivo]);
    // Scroll al final para ver el nuevo widget
    setTimeout(() => {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }, 100);
  };

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
    <Box sx={{ p: 3, height: '100%', overflow: 'auto', position: 'relative' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Widgets</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setCreateDialogOpen(true)}
        >
          Crear Widget
        </Button>
      </Box>
      <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
        {archivos.map((archivo) => (
          <ResizableWidget 
            key={archivo.id} 
            archivo={archivo}
            onDelete={handleDelete}
            onUpdate={handleUpdate}
          />
        ))}
      </Box>

      {/* Diálogo de creación */}
      {user && (
        <CreateWidgetDialog
          open={createDialogOpen}
          onClose={() => setCreateDialogOpen(false)}
          onCreated={handleCreate}
          userEmail={user.email}
        />
      )}
    </Box>
  );
}

