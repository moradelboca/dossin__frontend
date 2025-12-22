import React, { useContext } from "react";
import { TableRow, TableCell, Box, Button, IconButton } from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import { ContextoGeneral } from '../../../Contexto';
import useTransformarCampo from '../../../hooks/useTransformarCampo';
import Dialog from '@mui/material/Dialog';
import DeleteTurno from '../../../cargas/creadores/DeleteTurno';
import { useManejoTurnos, renderTurnosDialogs } from '../../../cards/mobile/manejoTurnos';
import { getExplicacionEstado } from '../../../cards/mobile/explicacionTurnos';
import { useAllowed } from '../../../hooks/auth/useAllowed';
import EstadoTurnoForm from '../../../forms/turnos/tabs/EstadoTurnoForm';
import { useAuth } from '../../../autenticacion/ContextoAuth';
import { puedeVerEstado, puedeEditarEstado } from '../../../../utils/turnoEstadoPermisos';
import Tooltip from '@mui/material/Tooltip';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import InfoTooltip from '../../../InfoTooltip';
import NoteAltOutlinedIcon from '@mui/icons-material/NoteAltOutlined';
import Popover from '@mui/material/Popover';
import Typography from '@mui/material/Typography';
import { axiosPut } from '../../../../lib/axiosConfig';
import { FotosTurnoDialog } from '../../../turnos/FotosTurnoDialog';

interface TurnoGridRowProps {
  turno: any;
  cupo: any;
  refreshCupos: () => void;
  fields: string[];
  onEdit?: () => void;
}

const TurnoGridRow: React.FC<TurnoGridRowProps> = ({ turno, cupo, refreshCupos, fields }) => {
  const { theme, backendURL } = useContext(ContextoGeneral);
  const transformarCampo = useTransformarCampo();
  const manejoTurnos = useManejoTurnos({ item: turno, cupo, refreshCupos });
  const { user } = useAuth();
  const rolId = user?.rol?.id;
  const estadoId = manejoTurnos.turnoLocal.estado?.id;
  const isAdmin = useAllowed([1]);
  const [openEstadoDialog, setOpenEstadoDialog] = React.useState(false);
  const [openCancelarDialog, setOpenCancelarDialog] = React.useState(false);
  const [openFotosDialog, setOpenFotosDialog] = React.useState(false);
  if (rolId && estadoId && !puedeVerEstado(estadoId, rolId)) {
    return null;
  }

  // Botones de acción (idénticos a CardMobile, pero en formato horizontal dentro de la celda)
  const renderButtons = () => {
    const estado = manejoTurnos.turnoLocal.estado?.nombre?.toLowerCase();
    if (estado === 'pagado') return null;
    
    // Verificar si el usuario puede editar este estado específico
    const puedeEditar = manejoTurnos.turnoLocal.estado?.id && rolId ? puedeEditarEstado(manejoTurnos.turnoLocal.estado.id, rolId) : false;
    
    const mainButton = (props: any) => {
      const { key, ...rest } = props;
      return (
        <Button
          key={key}
          variant="contained"
          size="small"
          sx={{ backgroundColor: theme.colores.azul, color: '#fff', minWidth: 0, px: 2, '&:hover': { backgroundColor: theme.colores.azul, opacity: 0.9 } }}
          {...rest}
        />
      );
    };
    const outlinedButton = (props: any) => {
      const { key, ...rest } = props;
      return (
        <Button
          key={key}
          variant="outlined"
          color="secondary"
          size="small"
          sx={{ borderColor: theme.colores.azul, color: theme.colores.azul, minWidth: 0, px: 2, '&:hover': { borderColor: theme.colores.azul, backgroundColor: '#f0f8ff' } }}
          {...rest}
        />
      );
    };
    
    // Si no puede editar, no mostrar botones de acción
    if (!puedeEditar) {
      return (
        <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1, alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', fontSize: '0.75rem' }}>
            Sin permisos para editar
          </Typography>
          {/* Ícono de nota siempre disponible */}
          <Tooltip title={manejoTurnos.turnoLocal.nota ? 'Ver/Editar nota' : 'Agregar nota'}>
            <IconButton
              sx={{ color: manejoTurnos.turnoLocal.nota ? theme.colores.azul : '#bdbdbd' }}
              onClick={e => manejoTurnos.handleOpenNota(e, manejoTurnos.turnoLocal.nota)}
              aria-label="nota turno"
              size="small"
            >
              <NoteAltOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      );
    }
    
    let botones: React.ReactNode[] = [];
    const safeOpenDialog = (dialog: null | 'corregir' | 'autorizar' | 'tara' | 'cartaPorte' | 'cargarCarta' | 'pesaje' | 'pago' | 'datospago' | 'factura' | 'adelanto') => {
      if (turno && turno.id) {
        manejoTurnos.setTurnoLocal(turno);
        manejoTurnos.setOpenDialog(dialog);
      } else {
        console.error('No se puede abrir el diálogo, turno sin id:', turno);
      }
    };
    switch (estado) {
      case 'con errores':
        botones.push(mainButton({ key: 'corregir', children: 'Corregir', onClick: () => safeOpenDialog('corregir') }));
        break;
      case 'validado':
        botones.push(mainButton({ key: 'corregir', children: 'Corregir', onClick: () => safeOpenDialog('corregir') }));
        botones.push(mainButton({ key: 'autorizar', children: 'Autorizar', onClick: () => safeOpenDialog('autorizar') }));
        break;
      case 'autorizado':
        botones.push(mainButton({ key: 'tara', children: 'Cargar Tara', onClick: () => safeOpenDialog('tara') }));
        break;
      case 'tarado':
        botones.push(mainButton({ key: 'tara', children: 'Cargar Peso Bruto', onClick: () => safeOpenDialog('tara') }));
        break;
      case 'cargado':
        botones.push(outlinedButton({ key: 'ver-carta', children: 'Ver CP', onClick: () => safeOpenDialog('cartaPorte') }));
        botones.push(mainButton({ key: 'cargar-carta', children: 'Cargar CP', onClick: () => safeOpenDialog('cargarCarta') }));
        break;
      case 'en viaje':
        botones.push(mainButton({ key: 'descarga', children: 'Ingresar Kg Descargados', onClick: () => safeOpenDialog('pesaje') }));
        break;
      case 'descargado':
        botones.push(mainButton({ key: 'factura', children: '+ Factura', onClick: () => safeOpenDialog('factura') }));
        break;
      case 'facturado':
        botones.push(outlinedButton({ key: 'ver-pago', children: 'Ver Pago', onClick: () => safeOpenDialog('datospago') }));
        botones.push(mainButton({ key: 'pagar', children: 'Pagar', onClick: () => safeOpenDialog('pago') }));
        break;
      default:
        break;
    }
    // Botones extra
    const isContableOrLogistica = rolId === 2 || rolId === 4;
    if (rolId !== 3) {
      botones.push(outlinedButton({ key: 'adelanto', children: 'Adelanto', onClick: () => safeOpenDialog('adelanto'), sx: { borderColor: theme.colores.azul, color: theme.colores.azul, minWidth: 0, px: 2, '&:hover': { borderColor: theme.colores.azul, backgroundColor: '#f0f8ff' }, ml: 1 } }));
    }
    if (isAdmin) {
      botones.push(
        <Tooltip title="Eliminar turno" key="delete">
          <IconButton
            onClick={() => manejoTurnos.setOpenDeleteDialog(true)}
            sx={{ color: '#d68384', background: 'transparent', '&:hover': { background: '#fbe9e7' }, borderRadius: 2, ml: 1 }}
            aria-label="eliminar turno"
            size="small"
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      );
    } else if (isContableOrLogistica) {
      botones.push(
        <Tooltip title="Cancelar turno" key="cancel">
          <IconButton
            onClick={() => setOpenCancelarDialog(true)}
            sx={{ color: '#d68384', background: 'transparent', '&:hover': { background: '#fbe9e7' }, borderRadius: 2, ml: 1 }}
            aria-label="cancelar turno"
            size="small"
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      );
    }
    // Ícono de fotos (solo para admin o contable, cuando estado >= Cargado)
    const isAdminOrContable = rolId === 1 || rolId === 2;
    const estadoPermiteFotos = estadoId && estadoId >= 7; // Cargado (7) o posterior
    if (isAdminOrContable && estadoPermiteFotos) {
      botones.push(
        <Tooltip title="Ver fotos del turno" key="fotos">
          <IconButton
            sx={{ color: theme.colores.azul }}
            onClick={() => setOpenFotosDialog(true)}
            aria-label="ver fotos turno"
            size="small"
          >
            <PhotoCameraIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      );
    }
    
    // Ícono de nota
    botones.push(
      <Tooltip title={manejoTurnos.turnoLocal.nota ? 'Ver/Editar nota' : 'Agregar nota'} key="nota">
        <IconButton
          sx={{ color: manejoTurnos.turnoLocal.nota ? theme.colores.azul : '#bdbdbd' }}
          onClick={e => manejoTurnos.handleOpenNota(e, manejoTurnos.turnoLocal.nota)}
          aria-label="nota turno"
          size="small"
        >
          <NoteAltOutlinedIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    );
    return (
      <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1, alignItems: 'center' }}>
        {botones}
        {/* Popover para nota */}
        <Popover
          open={manejoTurnos.openNota}
          anchorEl={manejoTurnos.anchorElNota}
          onClose={manejoTurnos.handleCloseNota}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          PaperProps={{
            sx: {
              p: 2,
              bgcolor: 'rgba(240,240,240,0.95)',
              border: '1.5px solid #e0e0e0',
              borderRadius: 2,
              minWidth: 260,
              maxWidth: 320,
              boxShadow: 3,
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
            }
          }}
        >
          <Typography variant="subtitle2" sx={{ color: theme.colores.azul, fontWeight: 600, mb: 1 }}>
            Nota del turno
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <textarea
              value={manejoTurnos.notaLocal}
              onChange={e => manejoTurnos.setNotaLocal(e.target.value)}
              rows={4}
              style={{ width: '100%', borderRadius: 8, border: '1px solid #e0e0e0', padding: 8, background: '#fff', fontFamily: 'inherit', fontSize: 15, resize: 'vertical' }}
              placeholder="Escribí una nota para este turno..."
              disabled={manejoTurnos.notaLoading}
            />
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
              {manejoTurnos.turnoLocal.nota && (
                <Button
                  size="small"
                  color="error"
                  disabled={manejoTurnos.notaLoading}
                  onClick={() => manejoTurnos.handleBorrarNota(manejoTurnos.turnoLocal.id)}
                >
                  Borrar
                </Button>
              )}
              <Button
                size="small"
                variant="contained"
                sx={{ backgroundColor: theme.colores.azul, color: '#fff', '&:hover': { backgroundColor: theme.colores.azulOscuro } }}
                disabled={manejoTurnos.notaLoading}
                onClick={() => manejoTurnos.handleGuardarNota(manejoTurnos.turnoLocal.id)}
              >
                Guardar
              </Button>
            </Box>
          </Box>
        </Popover>
      </Box>
    );
  };

  return (
    <>
      <TableRow
        style={{ cursor: undefined }}
      >
        {fields.map((field, idx) => (
          <TableCell key={idx}>{transformarCampo(field, manejoTurnos.turnoLocal)}</TableCell>
        ))}
        <TableCell>
          <Box display="flex" alignItems="center" gap={1}>
            {manejoTurnos.turnoLocal.estado?.nombre && (
              isAdmin ? (
                <Box
                  sx={{
                    px: 2,
                    py: 0.5,
                    borderRadius: '16px',
                    border: `2px solid ${manejoTurnos.turnoLocal.estado.id === 4 ? '#d68384' : manejoTurnos.getEstadoColor(manejoTurnos.turnoLocal.estado.nombre.toLowerCase())}`,
                    color: manejoTurnos.turnoLocal.estado.id === 4 ? '#d68384' : manejoTurnos.getEstadoColor(manejoTurnos.turnoLocal.estado.nombre.toLowerCase()),
                    fontWeight: 'bold',
                    fontSize: '0.85rem',
                    background: '#fff',
                    textTransform: 'capitalize',
                    minWidth: '80px',
                    textAlign: 'center',
                    display: 'inline-block',
                    cursor: 'pointer',
                    transition: 'box-shadow 0.2s',
                    boxShadow: openEstadoDialog ? '0 0 0 2px #16366055' : undefined,
                  }}
                  onClick={() => setOpenEstadoDialog(true)}
                >
                  {manejoTurnos.turnoLocal.estado.nombre}
                </Box>
              ) : (
                <Box
                  sx={{
                    px: 2,
                    py: 0.5,
                    borderRadius: '16px',
                    border: `2px solid ${manejoTurnos.turnoLocal.estado.id === 4 ? '#d68384' : manejoTurnos.getEstadoColor(manejoTurnos.turnoLocal.estado.nombre.toLowerCase())}`,
                    color: manejoTurnos.turnoLocal.estado.id === 4 ? '#d68384' : manejoTurnos.getEstadoColor(manejoTurnos.turnoLocal.estado.nombre.toLowerCase()),
                    fontWeight: 'bold',
                    fontSize: '0.85rem',
                    background: '#fff',
                    textTransform: 'capitalize',
                    minWidth: '80px',
                    textAlign: 'center',
                    display: 'inline-block',
                  }}
                >
                  {manejoTurnos.turnoLocal.estado.nombre}
                </Box>
              )
            )}
            {/* Tooltip de explicación de estado */}
            {(() => {
              const explicacion = getExplicacionEstado(manejoTurnos.turnoLocal.estado?.nombre);
              if (!explicacion) return null;
              return (
                <InfoTooltip
                  title={explicacion.title}
                  sections={explicacion.sections}
                  placement="top"
                  iconSize="medium"
                  contexto={`Componente: Tabla de turnos\nID turno: ${manejoTurnos.turnoLocal.id || ''}\nEstado: ${manejoTurnos.turnoLocal.estado?.nombre || ''}\nFecha cupo: ${manejoTurnos.turnoLocal.fechaCupo || manejoTurnos.turnoLocal.fecha || ''}`}
                />
              );
            })()}
          </Box>
          {/* Dialog para cambiar estado */}
          <Dialog open={openEstadoDialog} onClose={() => setOpenEstadoDialog(false)} maxWidth="xs" fullWidth>
            <EstadoTurnoForm
              turnoId={manejoTurnos.turnoLocal.id}
              initialEstado={manejoTurnos.turnoLocal.estado}
              onSuccess={(updatedData) => {
                manejoTurnos.setTurnoLocal((prev: any) => ({ ...prev, estado: updatedData.estado || updatedData }));
                setOpenEstadoDialog(false);
                if (refreshCupos) refreshCupos();
              }}
              onCancel={() => setOpenEstadoDialog(false)}
            />
          </Dialog>
        </TableCell>
        <TableCell>{renderButtons()}</TableCell>
      </TableRow>
      {/* Diálogo de confirmación para eliminar el turno usando DeleteTurno */}
      <Dialog open={manejoTurnos.openDeleteDialog} onClose={() => manejoTurnos.setOpenDeleteDialog(false)} maxWidth="sm" fullWidth>
        <DeleteTurno
          idTurno={manejoTurnos.turnoLocal.id}
          idCarga={cupo?.carga || manejoTurnos.turnoLocal.carga || manejoTurnos.turnoLocal.idCarga}
          fecha={cupo?.fecha || manejoTurnos.turnoLocal.fecha || manejoTurnos.turnoLocal.fechaCupo}
          handleCloseDialog={() => manejoTurnos.setOpenDeleteDialog(false)}
          handleClose={() => manejoTurnos.setOpenDeleteDialog(false)}
          refreshCupos={refreshCupos || (() => {})}
        />
      </Dialog>
      {/* Diálogo de confirmación para cancelar el turno (solo contable y logística) */}
      <Dialog open={openCancelarDialog} onClose={() => setOpenCancelarDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Cancelar Turno</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Está seguro que desea cancelar este turno? Esta acción no se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCancelarDialog(false)} sx={{ color: theme.colores.azul }}>
            No, volver
          </Button>
          <Button
            onClick={async () => {
              try {
                await axiosPut(`turnos/${manejoTurnos.turnoLocal.id}`, { idEstado: 4 }, backendURL);
                if (refreshCupos) refreshCupos();
                setOpenCancelarDialog(false);
              } catch (err) {
                console.error(err);
              }
            }}
            sx={{ color: '#fff', backgroundColor: theme.colores.azul, '&:hover': { backgroundColor: theme.colores.azulOscuro || '#163660' } }}
          >
            Sí, cancelar
          </Button>
        </DialogActions>
      </Dialog>
      {/* Dialog para ver fotos del turno */}
      <FotosTurnoDialog
        open={openFotosDialog}
        onClose={() => setOpenFotosDialog(false)}
        turnoId={manejoTurnos.turnoLocal.id}
        turno={manejoTurnos.turnoLocal}
      />
      {renderTurnosDialogs({ ...manejoTurnos, theme, cupo, refreshCupos })}
    </>
  );
};

export default TurnoGridRow; 