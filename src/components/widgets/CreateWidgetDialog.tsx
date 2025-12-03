import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  CircularProgress,
  Alert,
  Box,
  Typography,
  IconButton,
} from '@mui/material';
import { useState } from 'react';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CloseIcon from '@mui/icons-material/Close';
import { archivosService } from '../../services/archivosService';
import { Archivo } from '../../interfaces/archivo';

interface CreateWidgetDialogProps {
  open: boolean;
  onClose: () => void;
  onCreated: (archivo: Archivo) => void;
  userEmail: string;
}

export function CreateWidgetDialog({
  open,
  onClose,
  onCreated,
  userEmail,
}: CreateWidgetDialogProps) {
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [archivo, setArchivo] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleReset = () => {
    setNombre('');
    setDescripcion('');
    setArchivo(null);
    setError(null);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validar que sea archivo HTML
      const validExtensions = ['.html', '.htm'];
      const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
      
      if (!validExtensions.includes(fileExtension)) {
        setError('Solo se permiten archivos HTML (.html, .htm)');
        setArchivo(null);
        return;
      }

      // Validar tamaño máximo (5MB)
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        setError('El archivo no puede superar los 5MB');
        setArchivo(null);
        return;
      }

      setArchivo(file);
      setError(null);
    }
  };

  const handleRemoveFile = () => {
    setArchivo(null);
    setError(null);
  };

  const handleSubmit = async () => {
    // Validaciones
    if (!nombre.trim()) {
      setError('El nombre es requerido');
      return;
    }
    if (!descripcion.trim()) {
      setError('La descripción es requerida');
      return;
    }
    if (!archivo) {
      setError('Debes seleccionar un archivo HTML');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const nuevoArchivo = await archivosService.crearArchivo(
        nombre.trim(),
        descripcion.trim(),
        archivo,
        userEmail
      );

      onCreated(nuevoArchivo);
      handleClose();
    } catch (err) {
      setError('Error al crear el widget. Intenta nuevamente.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Crear Nuevo Widget
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {error && <Alert severity="error">{error}</Alert>}

          <TextField
            label="Nombre del Widget"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            fullWidth
            required
            disabled={loading}
            placeholder="Ej: Dashboard de Ventas"
          />

          <TextField
            label="Descripción"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            fullWidth
            required
            multiline
            rows={3}
            disabled={loading}
            placeholder="Describe brevemente el contenido del widget"
          />

          <Box>
            <input
              accept=".html,.htm"
              style={{ display: 'none' }}
              id="widget-file-upload"
              type="file"
              onChange={handleFileChange}
              disabled={loading}
            />
            <label htmlFor="widget-file-upload">
              <Button
                variant="outlined"
                component="span"
                startIcon={<CloudUploadIcon />}
                fullWidth
                disabled={loading}
              >
                Seleccionar Archivo HTML
              </Button>
            </label>

            {archivo && (
              <Box
                sx={{
                  mt: 1,
                  p: 1.5,
                  border: '1px solid #e0e0e0',
                  borderRadius: 1,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  backgroundColor: '#f5f5f5',
                }}
              >
                <Box>
                  <Typography variant="body2" fontWeight="bold">
                    {archivo.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {(archivo.size / 1024).toFixed(2)} KB
                  </Typography>
                </Box>
                <IconButton size="small" onClick={handleRemoveFile} disabled={loading}>
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Box>
            )}
          </Box>

          <Typography variant="caption" color="text.secondary">
            * Solo archivos HTML (.html, .htm) de máximo 5MB
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading || !nombre || !descripcion || !archivo}
        >
          {loading ? <CircularProgress size={24} /> : 'Crear Widget'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
