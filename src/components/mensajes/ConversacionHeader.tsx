import React from 'react';
import { Box, Typography, Avatar, IconButton, Tooltip } from '@mui/material';
import { MoreVert as MoreVertIcon, Phone as PhoneIcon } from '@mui/icons-material';

interface ConversacionHeaderProps {
  nombre: string;
  avatar?: string;
  online: boolean;
  ultimaActividad: Date;
  onCall?: () => void;
  onVideoCall?: () => void;
  onMoreOptions?: () => void;
}

const ConversacionHeader: React.FC<ConversacionHeaderProps> = ({
  nombre,
  avatar,
  online,
  ultimaActividad,
  onCall,
  onVideoCall,
  onMoreOptions
}) => {
  const formatearUltimaActividad = (fecha: Date) => {
    const ahora = new Date();
    const diff = ahora.getTime() - fecha.getTime();
    const minutos = Math.floor(diff / (1000 * 60));
    const horas = Math.floor(diff / (1000 * 60 * 60));

    if (minutos < 1) return 'En línea';
    if (minutos < 60) return `Activo hace ${minutos}m`;
    if (horas < 24) return `Activo hace ${horas}h`;
    return 'Desconectado';
  };

  return (
    <Box sx={{ 
      p: 2, 
      borderBottom: 1, 
      borderColor: 'divider',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: 'background.paper'
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Box sx={{ position: 'relative', mr: 2 }}>
          <Avatar src={avatar} sx={{ width: 48, height: 48 }}>
            {nombre.charAt(0).toUpperCase()}
          </Avatar>
          {online && (
            <Box
              sx={{
                position: 'absolute',
                bottom: 2,
                right: 2,
                width: 12,
                height: 12,
                borderRadius: '50%',
                backgroundColor: 'success.main',
                border: '2px solid white',
              }}
            />
          )}
        </Box>
        <Box>
          <Typography variant="h6" component="h2" sx={{ fontWeight: 600 }}>
            {nombre}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {online ? 'En línea' : formatearUltimaActividad(ultimaActividad)}
          </Typography>
        </Box>
      </Box>
      
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Tooltip title="Llamar">
          <IconButton onClick={onCall} size="small">
            <PhoneIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Videollamada">
          <IconButton onClick={onVideoCall} size="small">
            <PhoneIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Más opciones">
          <IconButton onClick={onMoreOptions} size="small">
            <MoreVertIcon />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
};

export default ConversacionHeader;







