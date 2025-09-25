import React, { useState, useRef, useContext } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Alert,
  LinearProgress,
  IconButton,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
} from '@mui/material';
import {
  CloudUpload,
  CheckCircle,
  Error,
  Warning,
  Close,
  Description,
} from '@mui/icons-material';
import { ContextoGeneral } from '../../../../Contexto';

interface CsvUploadDialogProps {
  open: boolean;
  onClose: () => void;
  onUpload: (file: File) => Promise<UploadResult>;
}

interface UploadResult {
  success: boolean;
  message: string;
  totalProcessed: number;
  newRecords: number;
  duplicates: number;
  errors: string[];
}

export function CsvUploadDialog({ open, onClose, onUpload }: CsvUploadDialogProps) {
  const { theme } = useContext(ContextoGeneral);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFileSelect = (file: File) => {
    // Validar que sea un archivo CSV
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setUploadResult({
        success: false,
        message: 'Por favor selecciona un archivo CSV válido',
        totalProcessed: 0,
        newRecords: 0,
        duplicates: 0,
        errors: ['El archivo debe tener extensión .csv']
      });
      return;
    }

    setSelectedFile(file);
    setUploadResult(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadResult(null);

    try {
      const result = await onUpload(selectedFile);
      setUploadResult(result);
    } catch (error) {
      setUploadResult({
        success: false,
        message: 'Error inesperado durante la carga',
        totalProcessed: 0,
        newRecords: 0,
        duplicates: 0,
        errors: ['Error desconocido durante la carga']
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setUploadResult(null);
    setIsUploading(false);
    onClose();
  };

  const handleReset = () => {
    setSelectedFile(null);
    setUploadResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: { minHeight: '400px' }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        backgroundColor: theme.colores.azul,
        color: 'white'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CloudUpload />
          <Typography variant="h6">Cargar Órdenes de Trabajo desde CSV</Typography>
        </Box>
        <IconButton onClick={handleClose} sx={{ color: 'white' }}>
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        {!uploadResult ? (
          <Box>
            <Typography variant="body1" sx={{ mb: 2, color: 'text.secondary' }}>
              Selecciona un archivo CSV con las órdenes de trabajo. El sistema detectará automáticamente 
              duplicados y solo guardará las nuevas órdenes.
            </Typography>

            {/* Zona de drop */}
            <Box
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              sx={{
                border: 2,
                borderColor: dragActive ? theme.colores.azul : 'grey.300',
                borderStyle: 'dashed',
                borderRadius: 2,
                p: 4,
                textAlign: 'center',
                backgroundColor: dragActive ? 'rgba(25, 118, 210, 0.04)' : 'transparent',
                transition: 'all 0.2s ease',
                cursor: 'pointer',
                '&:hover': {
                  borderColor: theme.colores.azul,
                  backgroundColor: 'rgba(25, 118, 210, 0.04)'
                }
              }}
              onClick={() => fileInputRef.current?.click()}
            >
              <CloudUpload sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
              <Typography variant="h6" sx={{ mb: 1 }}>
                {selectedFile ? selectedFile.name : 'Arrastra tu archivo CSV aquí o haz clic para seleccionar'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Formatos soportados: .csv
              </Typography>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileInputChange}
                style={{ display: 'none' }}
              />
            </Box>

            {selectedFile && (
              <Box sx={{ mt: 2 }}>
                <Alert severity="info" sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    <strong>Archivo seleccionado:</strong> {selectedFile.name} 
                    ({(selectedFile.size / 1024).toFixed(1)} KB)
                  </Typography>
                </Alert>
              </Box>
            )}
          </Box>
        ) : (
          <Box>
            <Alert 
              severity={uploadResult.success ? 'success' : 'error'} 
              sx={{ mb: 2 }}
              icon={uploadResult.success ? <CheckCircle /> : <Error />}
            >
              <Typography variant="h6" sx={{ mb: 1 }}>
                {uploadResult.success ? 'Carga completada' : 'Error en la carga'}
              </Typography>
              <Typography variant="body2">
                {uploadResult.message}
              </Typography>
            </Alert>

            {uploadResult.success && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
                  Resumen de la carga:
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Chip 
                    icon={<Description />}
                    label={`Total procesadas: ${uploadResult.totalProcessed}`}
                    color="primary"
                    variant="outlined"
                  />
                  <Chip 
                    icon={<CheckCircle />}
                    label={`Nuevas: ${uploadResult.newRecords}`}
                    color="success"
                    variant="outlined"
                  />
                  <Chip 
                    icon={<Warning />}
                    label={`Duplicadas: ${uploadResult.duplicates}`}
                    color="warning"
                    variant="outlined"
                  />
                </Box>
              </Box>
            )}

            {uploadResult.errors.length > 0 && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, color: 'error.main' }}>
                  Errores encontrados:
                </Typography>
                <List dense>
                  {uploadResult.errors.map((error, index) => (
                    <ListItem key={index} sx={{ py: 0.5 }}>
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <Error color="error" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText 
                        primary={error}
                        primaryTypographyProps={{ variant: 'body2', color: 'error.main' }}
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}

            <Divider sx={{ my: 2 }} />
            
            <Button
              variant="outlined"
              onClick={handleReset}
              startIcon={<CloudUpload />}
              sx={{ mr: 1 }}
            >
              Cargar otro archivo
            </Button>
          </Box>
        )}

        {isUploading && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" sx={{ mb: 1 }}>
              Procesando archivo...
            </Typography>
            <LinearProgress />
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button onClick={handleClose} variant="outlined">
          {uploadResult ? 'Cerrar' : 'Cancelar'}
        </Button>
        
        {selectedFile && !uploadResult && (
          <Button
            onClick={handleUpload}
            variant="contained"
            disabled={isUploading}
            sx={{
              backgroundColor: theme.colores.azul,
              '&:hover': {
                backgroundColor: theme.colores.azul,
                opacity: 0.9
              }
            }}
          >
            {isUploading ? 'Procesando...' : 'Cargar archivo'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
