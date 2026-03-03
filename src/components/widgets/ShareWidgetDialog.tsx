import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
  Checkbox,
  CircularProgress,
  Alert,
  Box,
  Avatar,
  ListItemAvatar,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { Usuario } from '../../interfaces/archivo';
import { archivosService } from '../../services/archivosService';

interface ShareWidgetDialogProps {
  open: boolean;
  onClose: () => void;
  archivoId: number;
  creadoPor: string;
  compartidoConActual: string[];
  onShare: (emails: string[]) => void;
}

export function ShareWidgetDialog({
  open,
  onClose,
  archivoId,
  creadoPor,
  compartidoConActual,
  onShare,
}: ShareWidgetDialogProps) {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [usuariosSeleccionados, setUsuariosSeleccionados] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (open) {
      cargarUsuarios();
      setUsuariosSeleccionados([...compartidoConActual]);
    }
  }, [open, compartidoConActual]);

  const cargarUsuarios = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await archivosService.obtenerUsuarios();
      // Filtrar solo usuarios administradores y excluir al creador
      const administradores = data.filter(
        (usuario) => usuario.rol.nombre === 'Administrador' && usuario.email !== creadoPor
      );
      setUsuarios(administradores);
    } catch (err) {
      setError('Error al cargar usuarios');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (email: string) => {
    setUsuariosSeleccionados((prev) => {
      if (prev.includes(email)) {
        return prev.filter((e) => e !== email);
      } else {
        return [...prev, email];
      }
    });
  };

  const handleGuardar = async () => {
    try {
      setGuardando(true);
      setError(null);

      // Determinar qué emails agregar y cuáles eliminar
      const emailsAgregar = usuariosSeleccionados.filter(
        (email) => !compartidoConActual.includes(email)
      );
      const emailsEliminar = compartidoConActual.filter(
        (email) => !usuariosSeleccionados.includes(email)
      );

      // Realizar las operaciones
      if (emailsAgregar.length > 0) {
        await archivosService.compartirArchivo(archivoId, emailsAgregar);
      }
      if (emailsEliminar.length > 0) {
        // Revocar acceso uno por uno
        for (const email of emailsEliminar) {
          await archivosService.revocarAcceso(archivoId, email);
        }
      }

      onShare(usuariosSeleccionados);
      onClose();
    } catch (err) {
      setError('Error al actualizar permisos');
      console.error(err);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Compartir Widget</DialogTitle>
      <DialogContent>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : usuarios.length === 0 ? (
          <Alert severity="info">No hay usuarios administradores disponibles</Alert>
        ) : (
          <List sx={{ maxHeight: 400, overflow: 'auto' }}>
            {usuarios.map((usuario) => (
              <ListItem
                key={usuario.id}
                onClick={() => handleToggle(usuario.email)}
                dense
                sx={{ cursor: 'pointer', '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' } }}
              >
                <Checkbox
                  edge="start"
                  checked={usuariosSeleccionados.includes(usuario.email)}
                  tabIndex={-1}
                  disableRipple
                />
                <ListItemAvatar>
                  <Avatar
                    src={usuario.imagen}
                    alt={usuario.email}
                    imgProps={{ referrerPolicy: 'no-referrer' }}
                  >
                    {usuario.email[0].toUpperCase()}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={`${usuario.nombre} ${usuario.apellido}`}
                  secondary={usuario.email}
                />
              </ListItem>
            ))}
          </List>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={guardando}>
          Cancelar
        </Button>
        <Button
          onClick={handleGuardar}
          variant="contained"
          disabled={guardando || loading}
        >
          {guardando ? <CircularProgress size={24} /> : 'Guardar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
