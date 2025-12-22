import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Avatar,
  IconButton,
  // Tooltip,
  Chip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  Reply as ReplyIcon,
  Forward as ForwardIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  AttachFile as AttachFileIcon,
  Image as ImageIcon
} from '@mui/icons-material';

interface MensajeItemProps {
  id: string;
  contenido: string;
  remitenteNombre: string;
  remitenteAvatar?: string;
  fechaEnvio: Date;
  leido: boolean;
  esPropio: boolean;
  tipo: 'texto' | 'imagen' | 'archivo' | 'video';
  adjuntos?: string[];
  onReply?: (mensajeId: string) => void;
  onForward?: (mensajeId: string) => void;
  onDelete?: (mensajeId: string) => void;
}

const MensajeItem: React.FC<MensajeItemProps> = ({
  id,
  contenido,
  remitenteNombre,
  remitenteAvatar,
  fechaEnvio,
  leido,
  esPropio,
  tipo,
  adjuntos,
  onReply,
  onForward,
  onDelete
}) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const formatearFecha = (fecha: Date) => {
    const ahora = new Date();
    const diff = ahora.getTime() - fecha.getTime();
    const minutos = Math.floor(diff / (1000 * 60));
    const horas = Math.floor(diff / (1000 * 60 * 60));
    const dias = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutos < 1) return 'Ahora';
    if (minutos < 60) return `${minutos}m`;
    if (horas < 24) return `${horas}h`;
    if (dias < 7) return `${dias}d`;
    return fecha.toLocaleDateString();
  };

  const getIconoTipo = () => {
    switch (tipo) {
      case 'imagen':
        return <ImageIcon sx={{ fontSize: 16, mr: 0.5 }} />;
      case 'archivo':
        return <AttachFileIcon sx={{ fontSize: 16, mr: 0.5 }} />;
      default:
        return null;
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: esPropio ? 'flex-end' : 'flex-start',
        mb: 2,
        alignItems: 'flex-end',
      }}
    >
      {!esPropio && (
        <Avatar
          src={remitenteAvatar}
          sx={{ width: 32, height: 32, mr: 1 }}
        >
          {remitenteNombre.charAt(0).toUpperCase()}
        </Avatar>
      )}
      
      <Box sx={{ maxWidth: '70%', position: 'relative' }}>
        <Paper
          sx={{
            p: 2,
            backgroundColor: esPropio ? 'primary.main' : 'grey.100',
            color: esPropio ? 'white' : 'text.primary',
            borderRadius: esPropio ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
            position: 'relative',
            '&:hover': {
              '& .mensaje-actions': {
                opacity: 1,
              },
            },
          }}
        >
          {!esPropio && (
            <Typography variant="caption" sx={{ fontWeight: 600, mb: 0.5, display: 'block' }}>
              {remitenteNombre}
            </Typography>
          )}
          
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            {getIconoTipo()}
            <Typography variant="body1" sx={{ wordBreak: 'break-word' }}>
              {contenido}
            </Typography>
          </Box>

          {adjuntos && adjuntos.length > 0 && (
            <Box sx={{ mt: 1 }}>
              {adjuntos.map((adjunto, index) => (
                <Chip
                  key={index}
                  label={adjunto}
                  size="small"
                  sx={{ mr: 0.5, mb: 0.5 }}
                />
              ))}
            </Box>
          )}

          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mt: 1,
            }}
          >
            <Typography
              variant="caption"
              sx={{
                opacity: 0.7,
                fontSize: '0.75rem',
              }}
            >
              {formatearFecha(fechaEnvio)}
            </Typography>
            
            {esPropio && (
              <Box sx={{ display: 'flex', alignItems: 'center', ml: 1 }}>
                {leido ? (
                  <CheckCircleIcon sx={{ fontSize: 16, opacity: 0.7 }} />
                ) : (
                  <ScheduleIcon sx={{ fontSize: 16, opacity: 0.7 }} />
                )}
              </Box>
            )}
          </Box>
        </Paper>

        {/* Botones de acción */}
        <Box
          className="mensaje-actions"
          sx={{
            position: 'absolute',
            top: -8,
            right: esPropio ? -8 : 8,
            opacity: 0,
            transition: 'opacity 0.2s',
            backgroundColor: 'background.paper',
            borderRadius: '50%',
            boxShadow: 1,
          }}
        >
          <IconButton size="small" onClick={handleClick}>
            <MoreVertIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Box>
      </Box>

      {/* Menú de opciones */}
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={() => { onReply?.(id); handleClose(); }}>
          <ListItemIcon>
            <ReplyIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Responder</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => { onForward?.(id); handleClose(); }}>
          <ListItemIcon>
            <ForwardIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Reenviar</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => { onDelete?.(id); handleClose(); }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Eliminar</ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default MensajeItem;







