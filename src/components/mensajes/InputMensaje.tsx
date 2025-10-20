import React from 'react';
import {
  Box,
  TextField,
  IconButton,
  Tooltip,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Chip,
  // Alert
} from '@mui/material';
import {
  Send as SendIcon,
  AttachFile as AttachFileIcon,
  EmojiEmotions as EmojiIcon,
  Image as ImageIcon,
  VideoFile as VideoIcon,
  InsertDriveFile as FileIcon,
  Close as CloseIcon
} from '@mui/icons-material';

interface InputMensajeProps {
  valor: string;
  onChange: (valor: string) => void;
  onEnviar: () => void;
  onAdjuntarArchivo?: () => void;
  onAdjuntarImagen?: () => void;
  onAdjuntarVideo?: () => void;
  placeholder?: string;
  disabled?: boolean;
  archivosAdjuntos?: File[];
  onEliminarArchivo?: (index: number) => void;
}

const InputMensaje: React.FC<InputMensajeProps> = ({
  valor,
  onChange,
  onEnviar,
  onAdjuntarArchivo,
  onAdjuntarImagen,
  onAdjuntarVideo,
  placeholder = "Escribe un mensaje...",
  disabled = false,
  archivosAdjuntos = [],
  onEliminarArchivo
}) => {
  const [mostrarAdjuntos, setMostrarAdjuntos] = React.useState(false);

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      onEnviar();
    }
  };

  const formatearTamañoArchivo = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getIconoTipoArchivo = (tipo: string) => {
    if (tipo.startsWith('image/')) return <ImageIcon />;
    if (tipo.startsWith('video/')) return <VideoIcon />;
    return <FileIcon />;
  };

  return (
    <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider', backgroundColor: 'background.paper' }}>
      {/* Archivos adjuntos */}
      {archivosAdjuntos.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
            Archivos adjuntos:
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {archivosAdjuntos.map((archivo, index) => (
              <Chip
                key={index}
                icon={getIconoTipoArchivo(archivo.type)}
                label={`${archivo.name} (${formatearTamañoArchivo(archivo.size)})`}
                onDelete={() => onEliminarArchivo?.(index)}
                color="primary"
                variant="outlined"
                size="small"
              />
            ))}
          </Box>
        </Box>
      )}

      {/* Input principal */}
      <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1 }}>
        <Tooltip title="Adjuntar archivo">
          <IconButton onClick={onAdjuntarArchivo} disabled={disabled}>
            <AttachFileIcon />
          </IconButton>
        </Tooltip>
        
        <TextField
          fullWidth
          multiline
          maxRows={4}
          value={valor}
          onChange={(e) => onChange(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          disabled={disabled}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '24px',
              backgroundColor: 'grey.50',
            },
          }}
        />
        
        <Tooltip title="Emoji">
          <IconButton disabled={disabled}>
            <EmojiIcon />
          </IconButton>
        </Tooltip>
        
        <Tooltip title="Enviar mensaje">
          <IconButton
            color="primary"
            onClick={onEnviar}
            disabled={disabled || !valor.trim()}
            sx={{
              backgroundColor: 'primary.main',
              color: 'white',
              '&:hover': {
                backgroundColor: 'primary.dark',
              },
              '&:disabled': {
                backgroundColor: 'grey.300',
                color: 'grey.500',
              },
            }}
          >
            <SendIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Botón flotante para más opciones de adjuntos */}
      <Fab
        size="small"
        color="secondary"
        sx={{
          position: 'absolute',
          bottom: 80,
          right: 20,
          opacity: mostrarAdjuntos ? 1 : 0.7,
        }}
        onClick={() => setMostrarAdjuntos(true)}
      >
        <AttachFileIcon />
      </Fab>

      {/* Dialog para opciones de adjuntos */}
      <Dialog
        open={mostrarAdjuntos}
        onClose={() => setMostrarAdjuntos(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            Adjuntar archivo
            <IconButton onClick={() => setMostrarAdjuntos(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, p: 2 }}>
            <Button
              variant="outlined"
              startIcon={<ImageIcon />}
              onClick={() => {
                onAdjuntarImagen?.();
                setMostrarAdjuntos(false);
              }}
              sx={{ justifyContent: 'flex-start', p: 2 }}
            >
              Adjuntar imagen
            </Button>
            <Button
              variant="outlined"
              startIcon={<VideoIcon />}
              onClick={() => {
                onAdjuntarVideo?.();
                setMostrarAdjuntos(false);
              }}
              sx={{ justifyContent: 'flex-start', p: 2 }}
            >
              Adjuntar video
            </Button>
            <Button
              variant="outlined"
              startIcon={<FileIcon />}
              onClick={() => {
                onAdjuntarArchivo?.();
                setMostrarAdjuntos(false);
              }}
              sx={{ justifyContent: 'flex-start', p: 2 }}
            >
              Adjuntar archivo
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMostrarAdjuntos(false)}>
            Cancelar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default InputMensaje;





