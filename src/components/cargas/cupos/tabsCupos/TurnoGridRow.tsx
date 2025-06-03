import React, { useContext } from "react";
import { TableRow, TableCell, Box, Button, IconButton } from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import { ContextoGeneral } from '../../../Contexto';
import useTransformarCampo from '../../../hooks/useTransformarCampo';
import Dialog from '@mui/material/Dialog';
import DeleteTurno from '../../../cargas/creadores/DeleteTurno';
import { useManejoTurnos, renderTurnosDialogs } from '../../../cards/mobile/manejoTurnos';
import { useAllowed } from '../../../hooks/auth/useAllowed';
import EstadoTurnoForm from '../../../forms/turnos/tabs/EstadoTurnoForm';
import { useAuth } from '../../../autenticacion/ContextoAuth';
import { puedeVerEstado } from '../../../../utils/turnoEstadoPermisos';

interface TurnoGridRowProps {
  turno: any;
  cupo: any;
  refreshCupos: () => void;
  fields: string[];
}

const TurnoGridRow: React.FC<TurnoGridRowProps> = ({ turno, cupo, refreshCupos, fields }) => {
  const { theme } = useContext(ContextoGeneral);
  const transformarCampo = useTransformarCampo();
  const manejoTurnos = useManejoTurnos({ item: turno, cupo, refreshCupos });
  const isAdmin = useAllowed([1]);
  const [openEstadoDialog, setOpenEstadoDialog] = React.useState(false);
  const { user } = useAuth();
  const rolId = user?.rol?.id;
  const estadoId = manejoTurnos.turnoLocal.estado?.id;
  if (rolId && estadoId && !puedeVerEstado(estadoId, rolId)) {
    return null;
  }

  // Botones de acción (idénticos a CardMobile, pero en formato vertical dentro de la celda)
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
    let botones = [];
    switch (estado) {
      case 'con errores':
        botones.push(mainButton({ key: 'corregir', children: 'Corregir', onClick: () => manejoTurnos.setOpenDialog('corregir') }));
        break;
      case 'validado':
        botones.push(mainButton({ key: 'corregir', children: 'Corregir', onClick: () => manejoTurnos.setOpenDialog('corregir') }));
        botones.push(mainButton({ key: 'autorizar', children: 'Autorizar', onClick: () => manejoTurnos.setOpenDialog('autorizar') }));
        break;
      case 'autorizado':
        if (rolId === 3) {
          botones.push(mainButton({ key: 'tara', children: 'Cargar Tara', onClick: () => manejoTurnos.setOpenDialog('tara') }));
        } else {
          botones.push(mainButton({ key: 'tara', children: 'Cargar Tara', onClick: () => manejoTurnos.setOpenDialog('tara') }));
        }
        break;
      case 'tarado':
        if (rolId === 3) {
          botones.push(mainButton({ key: 'tara', children: 'Cargar Peso Bruto', onClick: () => manejoTurnos.setOpenDialog('tara') }));
        } else {
          botones.push(
            <Box key="tarado-row" sx={{ display: 'flex', gap: 1 }}>
              {outlinedButton({ key: 'ver-carta', children: 'Ver Carta de Porte', onClick: () => manejoTurnos.setOpenDialog('cartaPorte') })}
              {mainButton({ key: 'cargar-carta', children: 'Cargar Carta de Porte', onClick: () => manejoTurnos.setOpenDialog('cargarCarta') })}
            </Box>
          );
        }
        break;
      case 'en viaje':
        botones.push(mainButton({ key: 'descarga', children: 'Ingresar Kg Descargados', onClick: () => manejoTurnos.setOpenDialog('pesaje') }));
        break;
      case 'descargado':
        botones.push(
          <Box key="descargado-row" sx={{ display: 'flex', gap: 1 }}>
            {mainButton({ key: 'factura', children: 'Agregar Factura', onClick: () => manejoTurnos.setOpenDialog('factura') })}
          </Box>
        );
        break;
      case 'facturado':
        botones.push(
          <Box key="facturado-row" sx={{ display: 'flex', gap: 1 }}>
            {outlinedButton({ key: 'ver-pago', children: 'Ver Datos de Pago', onClick: () => manejoTurnos.setOpenDialog('pago') })}
            {mainButton({ key: 'pagar', children: 'Pagar', onClick: () => manejoTurnos.setOpenDialog('pago') })}
          </Box>
        );
        break;
      default:
        return null;
    }
    // Botones extra solo si NO es rol 3
    if (rolId !== 3) {
      botones.push(outlinedButton({ key: 'adelanto', children: 'Adelanto', onClick: () => manejoTurnos.setOpenDialog('adelanto') }));
      botones.push(
        <IconButton
          key="delete"
          onClick={() => manejoTurnos.setOpenDeleteDialog(true)}
          sx={{ color: '#d68384', background: 'transparent', '&:hover': { background: '#fbe9e7' }, borderRadius: 2, ml: 1 }}
          aria-label="eliminar turno"
          size="small"
        >
          <DeleteIcon fontSize="small" />
        </IconButton>
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
      <TableRow>
        {fields.map((field, idx) => (
          <TableCell key={idx}>{transformarCampo(field, manejoTurnos.turnoLocal)}</TableCell>
        ))}
        <TableCell>
          {manejoTurnos.turnoLocal.estado?.nombre && (
            isAdmin ? (
              <Box
                sx={{
                  px: 2,
                  py: 0.5,
                  borderRadius: '16px',
                  border: `2px solid ${manejoTurnos.getEstadoColor(manejoTurnos.turnoLocal.estado.nombre.toLowerCase())}`,
                  color: manejoTurnos.getEstadoColor(manejoTurnos.turnoLocal.estado.nombre.toLowerCase()),
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
                  border: `2px solid ${manejoTurnos.getEstadoColor(manejoTurnos.turnoLocal.estado.nombre.toLowerCase())}`,
                  color: manejoTurnos.getEstadoColor(manejoTurnos.turnoLocal.estado.nombre.toLowerCase()),
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
      {renderTurnosDialogs({ ...manejoTurnos, theme, cupo, refreshCupos })}
    </>
  );
};

export default TurnoGridRow; 