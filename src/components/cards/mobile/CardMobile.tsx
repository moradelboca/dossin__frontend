import React, { useContext } from "react";
import { Box, Button, Collapse, IconButton, Typography } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { ContextoGeneral } from "../../Contexto";
import useTransformarCampo from "../../hooks/useTransformarCampo";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
import Tooltip from '@mui/material/Tooltip';
import DeleteIcon from '@mui/icons-material/Delete';
import DeleteTurno from '../../cargas/creadores/DeleteTurno';
import { useManejoTurnos, renderTurnosDialogs } from './manejoTurnos';
import { getExplicacionEstado } from './explicacionTurnos';
import { useAllowed } from '../../hooks/auth/useAllowed';
import EstadoTurnoForm from '../../forms/turnos/tabs/EstadoTurnoForm';
import { useAuth } from '../../autenticacion/ContextoAuth';
import { puedeVerEstado, puedeEditarEstado } from '../../../utils/turnoEstadoPermisos';
import InfoTooltip from '../../InfoTooltip';
import NoteAltOutlinedIcon from '@mui/icons-material/NoteAltOutlined';
import Popover from '@mui/material/Popover';

interface CardMobileProps {
  item: any;
  index: number;
  fields: string[];
  headerNames: string[];
  expandedCard: number | null;
  handleExpandClick: (index: number) => void;
  tituloField?: string;
  subtituloField?: string;
  customIcon?: string;
  usarSinDesplegable?: boolean;
  mostrarBotonEditar?: boolean;
  // Nuevos props opcionales para botón secundario
  textoSecondaryButton?: string;
  handleSecondButton?: (item: any) => void;
  colorSecondaryButton?: string;
  textoBoton?: string;
  refreshCupos?: () => void; // Callback para refrescar los cupos después de una acción
  cupo?: any; // Nuevo prop opcional
  childrenCollapse?: React.ReactNode; // Nuevo prop para contenido custom dentro del Collapse
  ocultarBotonesAccion?: boolean;
}

const CardMobile: React.FC<CardMobileProps> = ({
  item,
  index,
  fields,
  headerNames,
  expandedCard,
  handleExpandClick,
  tituloField,
  subtituloField,
  customIcon,
  usarSinDesplegable,
  cupo,
  refreshCupos,
  childrenCollapse,
  ocultarBotonesAccion = false,
}) => {
  const { theme } = useContext(ContextoGeneral);
  const transformarCampo = useTransformarCampo();
  const manejoTurnos = useManejoTurnos({ item, cupo, refreshCupos });
  const { user } = useAuth();
  const rolId = user?.rol?.id;
  const estadoId = manejoTurnos.turnoLocal.estado?.id;
  const isAdmin = useAllowed([1]);
  const [openEstadoDialog, setOpenEstadoDialog] = React.useState(false);
  const [openCancelarDialog, setOpenCancelarDialog] = React.useState(false);
  const [anchorElNota, setAnchorElNota] = React.useState<null | HTMLElement>(null);
  const [notaLocal, setNotaLocal] = React.useState<string>("");
  const [notaLoading, setNotaLoading] = React.useState(false);
  const openNota = Boolean(anchorElNota);
  const handleCloseNota = () => setAnchorElNota(null);
  if (rolId && estadoId && !puedeVerEstado(estadoId, rolId)) {
    return null;
  }

  // Remove 'estado' from fields/headerNames for display
  const filteredFields = fields.filter(f => f !== 'estado.nombre');
  const filteredHeaderNames = headerNames.filter((_, i) => fields[i] !== 'estado.nombre');

  // Botones y diálogos ahora usan manejoTurnos
  const renderButtons = () => {
    if (ocultarBotonesAccion) return null;
    const estado = manejoTurnos.turnoLocal.estado?.nombre?.toLowerCase();
    if (estado === 'pagado') return null;
    
    // Verificar si el usuario puede editar este estado específico
    const puedeEditar = manejoTurnos.turnoLocal.estado?.id && rolId ? puedeEditarEstado(manejoTurnos.turnoLocal.estado.id, rolId) : false;
    
    const mainButton = (props: any) => (
      <Button
        variant="contained"
        fullWidth
        sx={{ backgroundColor: theme.colores.azul, color: '#fff', '&:hover': { backgroundColor: theme.colores.azul, opacity: 0.9 }, justifyContent: 'flex-start' }}
        {...props}
      />
    );
    const outlinedButton = (props: any) => (
      <Button
        variant="outlined"
        color="secondary"
        fullWidth
        sx={{ borderColor: theme.colores.azul, color: theme.colores.azul, '&:hover': { borderColor: theme.colores.azul, backgroundColor: '#f0f8ff' }, justifyContent: 'flex-start' }}
        {...props}
      />
    );
    let botones = null;
    const safeOpenDialog = (dialog: Parameters<typeof manejoTurnos.setOpenDialog>[0]) => {
      if (item && item.id) {
        manejoTurnos.setTurnoLocal(item);
        manejoTurnos.setOpenDialog(dialog);
      } else {
        console.error('No se puede abrir el diálogo, turno sin id:', item);
      }
    };
    
    // Si no puede editar, no mostrar botones de acción
    if (!puedeEditar) {
      return (
        <Box sx={{ width: '100%', mt: 2, display: 'flex', flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'flex-start' }}>
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
              No tienes permisos para editar turnos en estado "{manejoTurnos.turnoLocal.estado?.nombre}"
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', minWidth: 48 }}>
            {/* Ícono de nota siempre disponible */}
            <Tooltip title={manejoTurnos.turnoLocal.nota ? 'Ver/Editar nota' : 'Agregar nota'}>
              <IconButton
                sx={{ color: manejoTurnos.turnoLocal.nota ? theme.colores.azul : '#bdbdbd', mt: 1 }}
                onClick={(e) => {
                  e.stopPropagation();
                  setAnchorElNota(e.currentTarget);
                  setNotaLocal(manejoTurnos.turnoLocal.nota || '');
                }}
                aria-label="nota turno"
              >
                <NoteAltOutlinedIcon fontSize="medium" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      );
    }
    
    switch (estado) {
      case 'con errores':
        botones = <>{mainButton({ children: 'Corregir', onClick: () => safeOpenDialog('corregir') })}</>;
        break;
      case 'validado':
        botones = <>
          <Box display="flex" gap={2} mb={1}>
            {mainButton({ children: 'Corregir', onClick: () => safeOpenDialog('corregir') })}
            {mainButton({ children: 'Autorizar', onClick: () => safeOpenDialog('autorizar') })}
          </Box>
        </>;
        break;
      case 'autorizado':
        if (rolId === 3) {
          botones = <>{mainButton({ children: 'Cargar Tara', onClick: () => safeOpenDialog('tara') })}</>;
        } else {
          botones = <>{mainButton({ children: 'Cargar Tara', onClick: () => safeOpenDialog('tara') })}</>;
        }
        break;
      case 'tarado':
        if (rolId === 3) {
          botones = <>{mainButton({ children: 'Cargar Peso Bruto', onClick: () => safeOpenDialog('tara') })}</>;
        } else {
          botones = <>{mainButton({ children: 'Cargar Peso Bruto', onClick: () => safeOpenDialog('tara') })}</>;
        }
        break;
      case 'cargado':
        botones = (
          <Box display="flex" gap={2} mb={1}>
            {outlinedButton({ children: 'Ver CP', onClick: () => safeOpenDialog('cartaPorte') })}
            {mainButton({ children: 'Cargar CP', onClick: () => safeOpenDialog('cargarCarta') })}
          </Box>
        );
        break;
      case 'en viaje':
        botones = <>{mainButton({ children: 'Ingresar Kg Descargados', onClick: () => safeOpenDialog('pesaje') })}</>;
        break;
      case 'descargado':
        botones = (
          <Box display="flex" gap={2} mb={1}>
            {mainButton({ children: '+ Factura', onClick: () => safeOpenDialog('factura') })}
          </Box>
        );
        break;
      case 'facturado':
        botones = (
          <Box display="flex" gap={2} mb={1}>
            {outlinedButton({ children: 'Ver Pago', onClick: () => safeOpenDialog('datospago') })}
            {mainButton({ children: 'Pagar', onClick: () => safeOpenDialog('pago') })}
          </Box>
        );
        break;
      default:
        return null;
    }
    // Botones extra
    const isContableOrLogistica = rolId === 2 || rolId === 4;
    return (
      <Box sx={{ width: '100%', mt: 2, display: 'flex', flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'flex-start' }}>
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
          {botones}
          {rolId !== 3 && outlinedButton({ children: 'Adelanto', onClick: () => safeOpenDialog('adelanto'), sx: { mt: 1, ...outlinedButton({}).props.sx } })}
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', minWidth: 48 }}>
          {isAdmin && (
            <Tooltip title="Eliminar turno">
              <IconButton
                onClick={() => manejoTurnos.setOpenDeleteDialog(true)}
                sx={{ color: '#d68384', background: 'transparent', '&:hover': { background: '#fbe9e7' }, borderRadius: 2, height: 48, width: 48, ml: 1 }}
                aria-label="eliminar turno"
              >
                <DeleteIcon fontSize="large" />
              </IconButton>
            </Tooltip>
          )}
          {isContableOrLogistica && (
            <Tooltip title="Cancelar turno">
              <IconButton
                onClick={() => setOpenCancelarDialog(true)}
                sx={{ color: '#d68384', background: 'transparent', '&:hover': { background: '#fbe9e7' }, borderRadius: 2, height: 48, width: 48, ml: 1 }}
                aria-label="cancelar turno"
              >
                <DeleteIcon fontSize="large" />
              </IconButton>
            </Tooltip>
          )}
          {/* Ícono de nota */}
          <Tooltip title={manejoTurnos.turnoLocal.nota ? 'Ver/Editar nota' : 'Agregar nota'}>
            <IconButton
              sx={{ color: manejoTurnos.turnoLocal.nota ? theme.colores.azul : '#bdbdbd', mt: 1 }}
              onClick={(e) => {
                e.stopPropagation();
                setAnchorElNota(e.currentTarget);
                setNotaLocal(manejoTurnos.turnoLocal.nota || '');
              }}
              aria-label="nota turno"
            >
              <NoteAltOutlinedIcon fontSize="medium" />
            </IconButton>
          </Tooltip>
        </Box>
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
      </Box>
    );
  };

  return (
    <Box
      key={index}
      sx={{
        border: "1px solid #ccc",
        marginBottom: 2,
        borderRadius: 2,
        boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
        overflow: "hidden",
        minWidth: usarSinDesplegable ? "25rem" : "auto",
        position: 'relative',
      }}
    >
      {/* Estado pill label como botón para admin */}
      {manejoTurnos.turnoLocal.estado?.nombre && !ocultarBotonesAccion && (
        <Box sx={{ position: 'absolute', top: 8, right: 8, display: 'flex', alignItems: 'center', gap: 1 }}>
          {isAdmin ? (
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
                zIndex: 2,
                textTransform: 'capitalize',
                minWidth: '80px',
                textAlign: 'center',
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
                zIndex: 2,
                textTransform: 'capitalize',
                minWidth: '80px',
                textAlign: 'center',
              }}
            >
              {manejoTurnos.turnoLocal.estado.nombre}
            </Box>
          )}
          {/* Tooltip de explicación de estado SIEMPRE visible junto al pill */}
          {(() => {
            const explicacion = getExplicacionEstado(manejoTurnos.turnoLocal.estado?.nombre);
            if (!explicacion) return null;
            return (
              <Box ml={1} display="flex" alignItems="center">
                <InfoTooltip
                  title={explicacion.title}
                  sections={explicacion.sections}
                  placement="top"
                  iconSize="medium"
                  contexto={`Componente: Tarjeta de turno\nID turno: ${manejoTurnos.turnoLocal.id || ''}\nEstado: ${manejoTurnos.turnoLocal.estado?.nombre || ''}\nFecha cupo: ${manejoTurnos.turnoLocal.fechaCupo || manejoTurnos.turnoLocal.fecha || ''}`}
                />
              </Box>
            );
          })()}
        </Box>
      )}
      {/* Dialog para cambiar estado */}
      {!ocultarBotonesAccion && (
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
      )}
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        sx={{ padding: 2, backgroundColor: "#ffffff", cursor: "pointer" }}
        onClick={() => !usarSinDesplegable && handleExpandClick(index)}
      >
        <Box display="flex" alignItems="center" gap={2}>
          <Box
            sx={{
              width: 40,
              height: 40,
              backgroundColor: theme.colores.azul,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "4px",
            }}
          >
            {customIcon ? (
              <img
                src={customIcon}
                alt="Icono"
                style={{ width: "80%", height: "80%", objectFit: "contain" }}
              />
            ) : (
              <LocalShippingIcon
                sx={{ width: "80%", height: "80%", color: "#ffffff" }}
              />
            )}
          </Box>
          <Box>
            <Typography variant="subtitle1" fontWeight="bold"
              sx={(() => {
                // Título: chofer
                let errorCampo = null;
                if (manejoTurnos.turnoLocal.estado?.nombre?.toLowerCase() === 'con errores' && Array.isArray(manejoTurnos.turnoLocal.errores)) {
                  errorCampo = manejoTurnos.turnoLocal.errores.find((err: any) => err.campo === 'cuilColaborador');
                }
                return errorCampo ? { color: '#e57373', fontWeight: 700 } : {};
              })()}
            >
              {(() => {
                let errorCampo = null;
                if (manejoTurnos.turnoLocal.estado?.nombre?.toLowerCase() === 'con errores' && Array.isArray(manejoTurnos.turnoLocal.errores)) {
                  errorCampo = manejoTurnos.turnoLocal.errores.find((err: any) => err.campo === 'cuilColaborador');
                }
                if (errorCampo) {
                  const valor = manejoTurnos.turnoLocal['colaborador'];
                  if (typeof valor === 'object' && valor !== null) {
                    return valor.nombre || valor.cuil || JSON.stringify(valor);
                  }
                  return valor || 'Dato erróneo';
                }
                return transformarCampo(tituloField || fields[0], manejoTurnos.turnoLocal) || "Sin título";
              })()}
            </Typography>
            <Typography variant="body2" color="text.secondary"
              sx={(() => {
                // Subtítulo: empresa
                let errorCampo = null;
                if (manejoTurnos.turnoLocal.estado?.nombre?.toLowerCase() === 'con errores' && Array.isArray(manejoTurnos.turnoLocal.errores)) {
                  errorCampo = manejoTurnos.turnoLocal.errores.find((err: any) => err.campo === 'cuitEmpresa');
                }
                return errorCampo ? { color: '#e57373', fontWeight: 700 } : {};
              })()}
            >
              {(() => {
                let errorCampo = null;
                if (manejoTurnos.turnoLocal.estado?.nombre?.toLowerCase() === 'con errores' && Array.isArray(manejoTurnos.turnoLocal.errores)) {
                  errorCampo = manejoTurnos.turnoLocal.errores.find((err: any) => err.campo === 'cuitEmpresa');
                }
                if (errorCampo) {
                  const valor = manejoTurnos.turnoLocal['empresa'];
                  if (typeof valor === 'object' && valor !== null) {
                    return valor.razonSocial || valor.cuit || JSON.stringify(valor);
                  }
                  return valor || 'Dato erróneo';
                }
                return subtituloField ? transformarCampo(subtituloField, manejoTurnos.turnoLocal) : "";
              })()}
            </Typography>
          </Box>
        </Box>
        {!usarSinDesplegable && (
          <IconButton
            sx={{
              transform:
                expandedCard === index ? "rotate(180deg)" : "rotate(0deg)",
              transition: "0.3s",
            }}
          >
            <ExpandMoreIcon />
          </IconButton>
        )}
      </Box>

      <Collapse
        in={usarSinDesplegable || expandedCard === index}
        timeout="auto"
        unmountOnExit
      >
        <Box sx={{ padding: 2, backgroundColor: "#ffffff" }}>
          {filteredFields.map((field, idx) => {
            // Buscar si hay error para este campo
            let errorCampo = null;
            if (manejoTurnos.turnoLocal.estado?.nombre?.toLowerCase() === 'con errores' && Array.isArray(manejoTurnos.turnoLocal.errores)) {
              // Mapear los nombres de los campos de errores a los fields
              const fieldMap: Record<string, string> = {
                cuilColaborador: 'colaborador',
                cuitEmpresa: 'empresa',
                patenteCamion: 'camion',
                patenteAcoplado: 'acoplado',
                patenteAcopladoExtra: 'acopladoExtra',
              };
              errorCampo = manejoTurnos.turnoLocal.errores.find((err: any) => fieldMap[err.campo] === field.split('.')[0] || err.campo === field);
            }
            // Obtener el valor original ingresado (aunque sea erróneo)
            let valorOriginal = undefined;
            if (errorCampo) {
              valorOriginal = manejoTurnos.turnoLocal[field.split('.')[0]];
            }
            return (
              <Box
                key={idx}
                marginBottom={1}
                display={usarSinDesplegable ? "flex" : "block"}
                justifyContent={usarSinDesplegable ? "space-between" : "normal"}
                alignItems="center"
              >
                <Typography
                  variant="body2"
                  fontWeight="bold"
                  sx={usarSinDesplegable ? { marginRight: 1 } : {}}
                >
                  {filteredHeaderNames[idx]}:
                </Typography>
                <Typography
                  variant="body2"
                  sx={errorCampo ? { color: '#e57373', fontWeight: 600 } : {}}
                >
                  {errorCampo
                    ? (typeof valorOriginal === 'object' && valorOriginal !== null
                        ? valorOriginal.patente || valorOriginal.nombre || valorOriginal.cuil || valorOriginal.cuit || JSON.stringify(valorOriginal)
                        : valorOriginal || 'Dato erróneo')
                    : transformarCampo(field, manejoTurnos.turnoLocal)}
                </Typography>
              </Box>
            );
          })}
          {renderButtons()}
          {childrenCollapse}
        </Box>
        {renderTurnosDialogs({ ...manejoTurnos, theme, cupo, refreshCupos, item })}
      </Collapse>
      {/* Popover para nota */}
      <Popover
        open={openNota}
        anchorEl={anchorElNota}
        onClose={handleCloseNota}
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
            value={notaLocal}
            onChange={e => setNotaLocal(e.target.value)}
            rows={4}
            style={{ width: '100%', borderRadius: 8, border: '1px solid #e0e0e0', padding: 8, background: '#fff', fontFamily: 'inherit', fontSize: 15, resize: 'vertical' }}
            placeholder="Escribí una nota para este turno..."
            disabled={notaLoading}
          />
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
            {manejoTurnos.turnoLocal.nota && (
              <Button
                size="small"
                color="error"
                disabled={notaLoading}
                onClick={async () => {
                  setNotaLoading(true);
                  try {
                    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || ''}/turnos/${manejoTurnos.turnoLocal.id}`, {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ nota: '' }),
                    });
                    if (!response.ok) throw new Error(await response.text());
                    if (refreshCupos) refreshCupos();
                    manejoTurnos.setTurnoLocal((prev: any) => ({ ...prev, nota: '' }));
                    setNotaLocal('');
                    setAnchorElNota(null);
                  } catch (err) {
                    // Manejar error
                  } finally {
                    setNotaLoading(false);
                  }
                }}
              >
                Borrar
              </Button>
            )}
            <Button
              size="small"
              variant="contained"
              sx={{ backgroundColor: theme.colores.azul, color: '#fff', '&:hover': { backgroundColor: theme.colores.azulOscuro } }}
              disabled={notaLoading}
              onClick={async () => {
                setNotaLoading(true);
                try {
                  const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || ''}/turnos/${manejoTurnos.turnoLocal.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ nota: notaLocal }),
                  });
                  if (!response.ok) throw new Error(await response.text());
                  if (refreshCupos) refreshCupos();
                  manejoTurnos.setTurnoLocal((prev: any) => ({ ...prev, nota: notaLocal }));
                  setAnchorElNota(null);
                } catch (err) {
                  // Manejar error
                } finally {
                  setNotaLoading(false);
                }
              }}
            >
              Guardar
            </Button>
          </Box>
        </Box>
      </Popover>
    </Box>
  );
};


export default CardMobile;
