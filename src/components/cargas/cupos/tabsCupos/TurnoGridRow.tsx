import React, { useContext } from "react";
import { TableRow, TableCell, Box, Button, IconButton } from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import { ContextoGeneral } from '../../../Contexto';
import useTransformarCampo from '../../../hooks/useTransformarCampo';
import Dialog from '@mui/material/Dialog';
import DeleteTurno from '../../../cargas/creadores/DeleteTurno';
import { useManejoTurnos, renderTurnosDialogs } from '../../../cards/mobile/manejoTurnos';
import { getExplicacionEstado } from '../../../cards/mobile/explicacionTurnos';
import { useAllowed } from '../../../hooks/auth/useAllowed';
import EstadoTurnoForm from '../../../forms/turnos/tabs/EstadoTurnoForm';
import { useAuth } from '../../../autenticacion/ContextoAuth';
import { puedeVerEstado } from '../../../../utils/turnoEstadoPermisos';
import Tooltip from '@mui/material/Tooltip';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import InfoTooltip from '../../../InfoTooltip';

interface TurnoGridRowProps {
  turno: any;
  cupo: any;
  refreshCupos: () => void;
  fields: string[];
  onEdit?: () => void;
}

const TurnoGridRow: React.FC<TurnoGridRowProps> = ({ turno, cupo, refreshCupos, fields }) => {
  const { theme } = useContext(ContextoGeneral);
  const transformarCampo = useTransformarCampo();
  const manejoTurnos = useManejoTurnos({ item: turno, cupo, refreshCupos });
  const { user } = useAuth();
  const rolId = user?.rol?.id;
  const estadoId = manejoTurnos.turnoLocal.estado?.id;
  const isAdmin = useAllowed([1]);
  const [openEstadoDialog, setOpenEstadoDialog] = React.useState(false);
  const [openCancelarDialog, setOpenCancelarDialog] = React.useState(false);
  if (rolId && estadoId && !puedeVerEstado(estadoId, rolId)) {
    return null;
  }

  // Botones de acción (idénticos a CardMobile, pero en formato horizontal dentro de la celda)
  const renderButtons = () => {
    const estado = manejoTurnos.turnoLocal.estado?.nombre?.toLowerCase();
    if (estado === 'pagado') return null;
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
    return (
      <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1, alignItems: 'center' }}>
        {botones}
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
                const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || ''}/turnos/${manejoTurnos.turnoLocal.id}`, {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ idEstado: 4 }),
                });
                if (!response.ok) throw new Error(await response.text());
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
      {renderTurnosDialogs({ ...manejoTurnos, theme, cupo, refreshCupos })}
    </>
  );
};

export default TurnoGridRow; 