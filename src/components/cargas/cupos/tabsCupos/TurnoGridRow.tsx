import React, { useContext } from "react";
import { TableRow, TableCell, Box, Button, IconButton } from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import { ContextoGeneral } from '../../../Contexto';
import useTransformarCampo from '../../../hooks/useTransformarCampo';
import Dialog from '@mui/material/Dialog';
import DeleteTurno from '../../../cargas/creadores/DeleteTurno';
import { useManejoTurnos, renderTurnosDialogs } from '../../../cards/mobile/manejoTurnos';

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
        botones.push(mainButton({ key: 'tara', children: 'Cargar Tara', onClick: () => manejoTurnos.setOpenDialog('tara') }));
        break;
      case 'tarado':
        botones.push(outlinedButton({ key: 'ver-carta', children: 'Ver Carta de Porte', onClick: () => manejoTurnos.setOpenDialog('cartaPorte') }));
        botones.push(mainButton({ key: 'cargar-carta', children: 'Cargar Carta de Porte', onClick: () => manejoTurnos.setOpenDialog('cargarCarta') }));
        break;
      case 'en viaje':
        botones.push(mainButton({ key: 'descarga', children: 'Ingresar Kg Descargados', onClick: () => manejoTurnos.setOpenDialog('pesaje') }));
        break;
      case 'descargado':
        botones.push(outlinedButton({ key: 'ver-pago', children: 'Ver Datos de Pago', onClick: () => manejoTurnos.setOpenDialog('pago') }));
        botones.push(mainButton({ key: 'factura', children: 'Agregar Factura', onClick: () => manejoTurnos.setOpenDialog('factura') }));
        break;
      case 'facturado':
        botones.push(mainButton({ key: 'pagar', children: 'Pagar', onClick: () => manejoTurnos.setOpenDialog('pago') }));
        break;
      default:
        return null;
    }
    // Adelanto y eliminar siempre disponibles
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
          )}
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