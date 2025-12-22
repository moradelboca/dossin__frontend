import React, { useState, useRef, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  IconButton,
  CircularProgress,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CameraAltIcon from '@mui/icons-material/CameraAlt';

interface CameraCaptureDialogProps {
  open: boolean;
  onClose: () => void;
  onCapture: (file: File) => void;
  title?: string;
  theme?: any;
}

export const CameraCaptureDialog: React.FC<CameraCaptureDialogProps> = ({
  open,
  onClose,
  onCapture,
  title = 'Tomar Foto',
  theme,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  useEffect(() => {
    if (open) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [open]);

  const startCamera = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Verificar si el navegador soporta getUserMedia
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Tu navegador no soporta el acceso a la cámara');
      }

      // Solicitar acceso a la cámara
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Preferir cámara trasera en móviles
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });

      streamRef.current = stream;
      setHasPermission(true);

      // Conectar el stream al elemento video
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err: any) {
      console.error('Error al acceder a la cámara:', err);
      setHasPermission(false);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setError('Se necesita permiso para acceder a la cámara');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setError('No se encontró ninguna cámara disponible');
      } else {
        setError('Error al acceder a la cámara. Por favor, intenta nuevamente.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setHasPermission(null);
    setError(null);
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    // Establecer dimensiones del canvas iguales al video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Dibujar el frame actual del video en el canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convertir canvas a blob y luego a File
    canvas.toBlob(
      (blob) => {
        if (blob) {
          const file = new File([blob], `camera-capture-${Date.now()}.jpg`, {
            type: 'image/jpeg',
            lastModified: Date.now(),
          });
          onCapture(file);
          stopCamera();
          onClose();
        }
      },
      'image/jpeg',
      0.9 // Calidad JPEG (0-1)
    );
  };

  const handleClose = () => {
    stopCamera();
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: '#000',
        },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          color: '#fff',
        }}
      >
        {title}
        <IconButton onClick={handleClose} sx={{ color: '#fff' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ padding: 0, position: 'relative' }}>
        {isLoading && (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: 400,
            }}
          >
            <CircularProgress sx={{ color: '#fff' }} />
          </Box>
        )}

        {error && (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: 400,
              padding: 2,
              color: '#fff',
              textAlign: 'center',
            }}
          >
            <Typography variant="h6" sx={{ color: '#fff', mb: 2 }}>
              {error}
            </Typography>
            <Button
              variant="contained"
              onClick={startCamera}
              sx={{
                backgroundColor: theme?.colores?.azul || '#1976d2',
                '&:hover': {
                  backgroundColor: theme?.colores?.azulOscuro || '#1565c0',
                },
              }}
            >
              Intentar Nuevamente
            </Button>
          </Box>
        )}

        {hasPermission && !error && (
          <Box sx={{ position: 'relative', width: '100%' }}>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={{
                width: '100%',
                height: 'auto',
                display: 'block',
                maxHeight: '70vh',
              }}
            />
            <canvas ref={canvasRef} style={{ display: 'none' }} />
          </Box>
        )}
      </DialogContent>
      <DialogActions
        sx={{
          justifyContent: 'center',
          padding: 2,
          backgroundColor: '#000',
        }}
      >
        {hasPermission && !error && (
          <Button
            onClick={capturePhoto}
            variant="contained"
            startIcon={<CameraAltIcon />}
            sx={{
              backgroundColor: theme?.colores?.azul || '#1976d2',
              color: '#fff',
              '&:hover': {
                backgroundColor: theme?.colores?.azulOscuro || '#1565c0',
              },
            }}
          >
            Capturar Foto
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

