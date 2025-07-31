import  { useState, useEffect, useContext } from "react";
import { Box, Button, Dialog, DialogTitle, DialogContent, Typography, IconButton, CircularProgress } from "@mui/material";
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { ContextoGeneral } from "../../Contexto";
import TurnoConErroresForm from "../../forms/turnos/tabs/turnosConErrores/TurnoConErroresForm";
import { TaraForm, PesoBrutoForm } from "../../forms/turnos/tabs/TaraForm";
import CartaPorteForm from "../../forms/turnos/tabs/CartaPorteForm";
import PesajeForm from "../../forms/turnos/tabs/PesajeForm";
import FacturaForm from "../../forms/turnos/tabs/FacturaForm";
import AdelantosTurnoForm from "../../forms/turnos/tabs/AdelantosTurnoForm";
import OrdenPagoForm from "../../forms/turnos/tabs/OrdenPagoForm";
import { getNextEstadoId } from "../../../utils/turnosEstados";

export function useManejoTurnos({ item, cupo, refreshCupos }: any) {
  const { theme } = useContext(ContextoGeneral);

  // Dialog states for forms
  const [openDialog, setOpenDialog] = useState<null | 'corregir' | 'autorizar' | 'tara' | 'cartaPorte' | 'cargarCarta' | 'pesaje' | 'pago' | 'datospago' | 'factura' | 'adelanto'>(null);
  const [autorizarLoading, setAutorizarLoading] = useState(false);
  const [cartaPorteData, setCartaPorteData] = useState<any>(null);
  const [cartaPorteLoading, setCartaPorteLoading] = useState(false);
  const [cartaPorteError, setCartaPorteError] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [turnoLocal, setTurnoLocal] = useState(item);

  // Estado y handlers para nota
  const [anchorElNota, setAnchorElNota] = useState<null | HTMLElement>(null);
  const [notaLocal, setNotaLocal] = useState<string>("");
  const [notaLoading, setNotaLoading] = useState(false);
  const openNota = Boolean(anchorElNota);
  const handleOpenNota = (e: React.MouseEvent<HTMLElement>, nota: string) => {
    e.stopPropagation();
    setAnchorElNota(e.currentTarget);
    setNotaLocal(nota || '');
  };
  const handleCloseNota = () => setAnchorElNota(null);
  const handleGuardarNota = async (turnoId: number) => {
    setNotaLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || ''}/turnos/${turnoId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nota: notaLocal }),
      });
      if (!response.ok) throw new Error(await response.text());
      if (refreshCupos) refreshCupos();
      setAnchorElNota(null);
    } catch (err) {
      // Manejar error
    } finally {
      setNotaLoading(false);
    }
  };
  const handleBorrarNota = async (turnoId: number) => {
    setNotaLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || ''}/turnos/${turnoId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nota: '' }),
      });
      if (!response.ok) throw new Error(await response.text());
      if (refreshCupos) refreshCupos();
      setNotaLocal('');
      setAnchorElNota(null);
    } catch (err) {
      // Manejar error
    } finally {
      setNotaLoading(false);
    }
  };

  useEffect(() => { setTurnoLocal(item); }, [item]);

  useEffect(() => {
    // Si se abre un dialogo que necesita datos completos del turno (como precios o adelantos), y no los tenemos, los buscamos.
    if (['cartaPorte', 'corregir', 'autorizar', 'datospago', 'adelanto'].includes(openDialog || '') && item?.id) {
      // Usamos 'precios' como indicador de que tenemos los datos completos.
      if (!turnoLocal.precios) { 
        (async () => {
          try {
            const backendURL = import.meta.env.VITE_BACKEND_URL || '';
            const res = await fetch(`${backendURL}/turnos/${item.id}`);
            if (!res.ok) throw new Error('No se pudo obtener datos del turno');
            const turnoCompleto = await res.json();
            setTurnoLocal(turnoCompleto);
          } catch (e) {
            // console.error(e)
          }
        })();
      }
    }
  }, [openDialog, item, turnoLocal.precios]);

  const getEstadoColor = (estado: string) => {
    switch (estado?.toLowerCase()) {
      case 'con errores': return '#E53935'; // Rojo fuerte
      case 'creado': return '#90A4AE'; // Gris azulado
      case 'validado': return '#FFD600'; // Amarillo vibrante
      case 'cancelado': return '#757575'; // Gris oscuro
      case 'autorizado': return '#1976D2'; // Azul fuerte
      case 'tarado': return '#00BFAE'; // Verde agua
      case 'cargado': return '#FFA000'; // Naranja
      case 'en viaje': return '#7C4DFF'; // Violeta
      case 'descargado': return '#43A047'; // Verde
      case 'facturado': return '#8E24AA'; // Púrpura
      case 'pagado': return '#388E3C'; // Verde oscuro
      default: return theme.colores.azul;
    }
  };

  const handleFormSuccess = () => {
    if (refreshCupos) refreshCupos();
    setOpenDialog(null);
  };

  useEffect(() => {
    if (openDialog === 'cartaPorte') {
      setCartaPorteLoading(true);
      setCartaPorteError(null);
      (async () => {
        try {
          const backendURL = import.meta.env.VITE_BACKEND_URL || '';
          
          // Obtener datos completos del turno (incluyendo KG)
          let turno = item;
          if (item?.id) {
            try {
              const turnoRes = await fetch(`${backendURL}/turnos/${item.id}`);
              if (turnoRes.ok) {
                turno = await turnoRes.json();
              }
            } catch (err) {
              // console.error(err);
            }
          }
          
          let carga = null;
          if (cupo && cupo.carga) {
            const cargaRes = await fetch(`${backendURL}/cargas/${cupo.carga}`);
            carga = await cargaRes.json();
          } else if (item.carga || item.idCarga) {
            const cargaRes = await fetch(`${backendURL}/cargas/${item.carga || item.idCarga}`);
            carga = await cargaRes.json();
          }
          let contrato = null;
          if (carga && carga.id) {
            try {
              const contratosRes = await fetch(`${backendURL}/contratos`, { headers: { 'ngrok-skip-browser-warning': 'true' } });
              const contratos = await contratosRes.json();
              contrato = contratos.find((contrato: any) => {
                const tieneCarga = Array.isArray(contrato.cargas) && contrato.cargas.some((c: any) => {
                  return c.id === carga.id;
                });
                return tieneCarga;
              });
            } catch (err) {
              // console.error(err);
            }
          }          
          const turnoCompleto = turnoLocal.precios ? turnoLocal : null;
          setCartaPorteData({ turno, carga, contrato, cupo, turnoCompleto });
        } catch (err: any) {
          setCartaPorteError('Error al cargar los datos de la carta de porte');
        } finally {
          setCartaPorteLoading(false);
        }
      })();
    } else {
      setCartaPorteData(null);
      setCartaPorteError(null);
    }
  }, [openDialog, item, cupo, turnoLocal]);

  const handleCopy = (value: string, field: string) => {
    // Si el valor tiene formato 'razonSocial - cuit', solo copiar el cuit
    const cuitMatch = value.match(/-\s*(\d{11})$/);
    if (cuitMatch) {
      navigator.clipboard.writeText(cuitMatch[1]);
    } else {
      navigator.clipboard.writeText(value);
    }
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 1200);
  };

  const getNextEstadoName = (estadoActual: string | undefined): string => {
    switch ((estadoActual || '').toLowerCase()) {
      case 'con errores':
      case 'validado': return 'autorizado';
      case 'autorizado': return 'tarado';
      case 'tarado': return 'en viaje';
      case 'en viaje': return 'descargado';
      case 'descargado': return 'facturado';
      case 'facturado': return 'pagado';
      default: return estadoActual || '';
    }
  };

  return {
    openDialog, setOpenDialog, autorizarLoading, setAutorizarLoading, cartaPorteData, cartaPorteLoading, cartaPorteError, copiedField, setCopiedField, openDeleteDialog, setOpenDeleteDialog, turnoLocal, setTurnoLocal,
    getEstadoColor, handleFormSuccess, handleCopy, getNextEstadoName,
    anchorElNota, openNota, notaLocal, setNotaLocal, notaLoading, handleOpenNota, handleCloseNota, handleGuardarNota, handleBorrarNota,
  };
}

export function renderTurnosDialogs({
  openDialog, setOpenDialog, autorizarLoading, setAutorizarLoading, cartaPorteData, cartaPorteLoading, cartaPorteError, copiedField, turnoLocal, setTurnoLocal,
  handleFormSuccess, handleCopy, getNextEstadoName, theme
}: any) {
  switch (openDialog) {
    case 'corregir':
      return (
        <Dialog open onClose={() => setOpenDialog(null)} fullWidth maxWidth="sm">
          <DialogTitle>Corregir Turno</DialogTitle>
          <DialogContent>
            <TurnoConErroresForm
              seleccionado={(() => {
                if (turnoLocal.estado?.nombre?.toLowerCase() === 'validado') {
                  return {
                    ...turnoLocal,
                    cuilColaborador: turnoLocal.colaborador?.cuil,
                    cuitEmpresa: turnoLocal.empresa?.cuit,
                    patenteCamion: turnoLocal.camion?.patente,
                    patenteAcoplado: turnoLocal.acoplado?.patente,
                    patenteAcopladoExtra: turnoLocal.acopladoExtra?.patente,
                  };
                }
                return turnoLocal;
              })()}
              datos={[turnoLocal]}
              setDatos={() => {
                if (typeof handleFormSuccess === 'function') handleFormSuccess();
              }}
              handleClose={() => setOpenDialog(null)}
              idCarga={turnoLocal.carga || turnoLocal.idCarga}
            />
          </DialogContent>
        </Dialog>
      );
    case 'autorizar':
      return (
        <Dialog open onClose={() => setOpenDialog(null)} fullWidth maxWidth="sm">
          <DialogTitle>Autorizar Turno</DialogTitle>
          <DialogContent>
            <Button
              variant="contained"
              fullWidth
              sx={{ backgroundColor: theme.colores.azul, color: '#fff', borderRadius: '8px', boxShadow: 'none', '&:hover': { backgroundColor: theme.colores.azul, opacity: 0.9 }, mt: 2 }}
              disabled={autorizarLoading}
              onClick={async () => {
                setAutorizarLoading(true);
                try {
                  const nextEstadoId = getNextEstadoId(turnoLocal.estado?.nombre);
                  if (!nextEstadoId) throw new Error('No se puede determinar el próximo estado');
                  const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || ''}/turnos/${turnoLocal.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ idEstado: nextEstadoId }),
                  });
                  if (!response.ok) throw new Error(await response.text());
                  setTurnoLocal({
                    ...turnoLocal,
                    estado: { ...turnoLocal.estado, nombre: getNextEstadoName(turnoLocal.estado?.nombre) }
                  });
                  handleFormSuccess();
                } catch (err) {
                  //console.error(err);
                } finally {
                  setAutorizarLoading(false);
                }
              }}
            >
              {autorizarLoading ? <CircularProgress size={24} sx={{ color: '#fff' }} /> : 'Confirmar Autorización'}
            </Button>
          </DialogContent>
        </Dialog>
      );
    case 'tara':
      if (turnoLocal.estado?.nombre?.toLowerCase() === 'autorizado') {
      return (
        <Dialog open onClose={() => setOpenDialog(null)} fullWidth maxWidth="sm">
          <DialogTitle>Cargar Tara</DialogTitle>
          <DialogContent>
            <TaraForm
              turnoId={turnoLocal.id}
              initialTara={turnoLocal.tara}
                onSuccess={handleFormSuccess}
                onCancel={() => setOpenDialog(null)}
              />
            </DialogContent>
          </Dialog>
        );
      } else if (turnoLocal.estado?.nombre?.toLowerCase() === 'tarado') {
        return (
          <Dialog open onClose={() => setOpenDialog(null)} fullWidth maxWidth="sm">
            <DialogTitle>Cargar Peso Bruto</DialogTitle>
            <DialogContent>
              <PesoBrutoForm
                turnoId={turnoLocal.id}
                initialTara={turnoLocal.tara}
                onSuccess={handleFormSuccess}
              onCancel={() => setOpenDialog(null)}
            />
          </DialogContent>
        </Dialog>
      );
      }
      return null;
    case 'cartaPorte':
      // Detectar mobile
      const isMobile = window.innerWidth <= 600;
      
      return (
        <Dialog open onClose={() => setOpenDialog(null)} fullWidth maxWidth="md">
          <DialogTitle>Carta de Porte</DialogTitle>
          <DialogContent>
            {cartaPorteLoading ? (
              <Box display="flex" alignItems="center" justifyContent="center" minHeight={200}>
                <CircularProgress />
              </Box>
            ) : cartaPorteError ? (
              <Typography color="error">{cartaPorteError}</Typography>
            ) : cartaPorteData ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                {/* FICHA DATOS */}
                {[
                  { label: 'Titular Carta de Porte', value: formatearEmpresa(cartaPorteData.contrato?.titularCartaDePorte) },
                  { label: 'Remitente Comercial Productor', value: formatearEmpresa(cartaPorteData.contrato?.remitenteProductor) },
                  { label: 'Rte. Comercial Venta Primaria', value: formatearEmpresa(cartaPorteData.contrato?.remitenteVentaPrimaria) },
                  { label: 'Mercado a Término', value: formatearEmpresa(cartaPorteData.contrato?.mercadoATermino) },
                  { label: 'Corredor Venta Primaria', value: formatearEmpresa(cartaPorteData.contrato?.corredorVentaPrimaria) },
                  { label: 'Corredor Venta Secundaria', value: formatearEmpresa(cartaPorteData.contrato?.corredorVentaSecundaria) },
                  { label: 'Representante entregador', value: formatearEmpresa(cartaPorteData.contrato?.representanteEntregador) },
                  { label: 'Destinatario', value: formatearEmpresa(cartaPorteData.contrato?.destinatario) },
                  { label: 'Destino', value: formatearEmpresa(cartaPorteData.contrato?.destino) },
                  { label: 'Rte. Comercial Venta secundaria', value: formatearEmpresa(cartaPorteData.contrato?.remitenteVentaSecundaria) },
                  { label: 'Rte. Comercial Venta secundaria 2', value: formatearEmpresa(cartaPorteData.contrato?.remitenteVentaSecundaria2) },
                  { label: 'Flete pagador', value: formatearEmpresa(cartaPorteData.contrato?.fletePagador) },
                  { label: 'Representante recibidor', value: formatearEmpresa(cartaPorteData.contrato?.representanteRecibidor) },
                  { label: 'Kilómetros del viaje', value: cartaPorteData.carga?.cantidadKm },
                  { label: 'Empresa transportista', value: formatearEmpresa(cartaPorteData.turno?.empresa || cartaPorteData.carga?.empresa) },
                  { label: 'Chofer', value: (cartaPorteData.turno?.colaborador?.nombre || '') + ' ' + (cartaPorteData.turno?.colaborador?.apellido || '') + (cartaPorteData.turno?.colaborador?.cuil ? ' - ' + cartaPorteData.turno?.colaborador?.cuil : '') },
                  { label: 'Patente camión', value: cartaPorteData.turno?.camion?.patente },
                  { label: 'Patente acoplado', value: cartaPorteData.turno?.acoplado?.patente },
                  { label: 'Patente acoplado extra', value: cartaPorteData.turno?.acopladoExtra?.patente },
                  { label: 'Tarifa', value: cartaPorteData.carga?.tarifa },
                  { label: 'Kg tara', value: cartaPorteData.turno?.kgTara ?? cartaPorteData.turnoCompleto?.kgTara },
                  { label: 'Kg bruto', value: cartaPorteData.turno?.kgBruto ?? cartaPorteData.turnoCompleto?.kgBruto },
                  { label: 'Kg neto', value: cartaPorteData.turno?.kgNeto ?? cartaPorteData.turnoCompleto?.kgNeto },
                  { label: 'Kg cargados', value: cartaPorteData.turno?.kgCargados ?? cartaPorteData.turnoCompleto?.kgCargados },
                ].filter((row: any) => row.value !== undefined && row.value !== null).map((row: any) => (
                  isMobile ? (
                    <Box key={row.label} sx={{ borderBottom: '1px solid #eee', pb: 1, mb: 1 }}>
                      <Typography sx={{ fontWeight: 500, fontSize: 15 }}>{row.label}</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                        <Typography sx={{ flex: 1 }}>{row.value && String(row.value).trim() !== '' ? String(row.value) : 'Dato no necesario'}</Typography>
                        <IconButton size="small" onClick={() => handleCopy(String(row.value), row.label)}>
                          <ContentCopyIcon fontSize="small" />
                        </IconButton>
                        {copiedField === row.label && (
                          <Typography sx={{ color: theme.colores.azul, fontSize: 12, ml: 1 }}>Copiado!</Typography>
                        )}
                      </Box>
                    </Box>
                  ) : (
                    <Box key={row.label} sx={{ display: 'flex', alignItems: 'center', gap: 2, borderBottom: '1px solid #eee', pb: 1 }}>
                      <Typography sx={{ minWidth: 260, fontWeight: 500 }}>{row.label}</Typography>
                      <Typography sx={{ flex: 1 }}>{row.value && String(row.value).trim() !== '' ? String(row.value) : 'Dato no necesario'}</Typography>
                      <IconButton size="small" onClick={() => handleCopy(String(row.value), row.label)}>
                        <ContentCopyIcon fontSize="small" />
                      </IconButton>
                      {copiedField === row.label && (
                        <Typography sx={{ color: theme.colores.azul, fontSize: 12, ml: 1 }}>Copiado!</Typography>
                      )}
                    </Box>
                  )
                ))}
              </Box>
            ) : (
              <Typography color="text.secondary">No hay datos para mostrar.</Typography>
            )}
          </DialogContent>
        </Dialog>
      );
    case 'cargarCarta':
      return (
        <Dialog open onClose={() => setOpenDialog(null)} fullWidth maxWidth="sm">
          <DialogTitle>Cargar Carta de Porte</DialogTitle>
          <DialogContent>
            <CartaPorteForm
              turnoId={turnoLocal.id}
              initialData={turnoLocal.cartaDePorte}
              onSuccess={async () => {
                try {
                  const nextEstadoId = getNextEstadoId(turnoLocal.estado?.nombre);
                  if (!nextEstadoId) throw new Error('No se puede determinar el próximo estado');
                  await fetch(`${import.meta.env.VITE_BACKEND_URL || ''}/turnos/${turnoLocal.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ idEstado: nextEstadoId }),
                  });
                } catch (err) {
                  //console.error(err);
                }
                handleFormSuccess();
              }}
              onCancel={() => setOpenDialog(null)}
            />
          </DialogContent>
        </Dialog>
      );
    case 'pesaje':
      return (
        <Dialog open onClose={() => setOpenDialog(null)} fullWidth maxWidth="sm">
          <DialogTitle>Ingresar Kg Descargados</DialogTitle>
          <DialogContent>
            <PesajeForm
              turnoId={turnoLocal.id}
              initialData={{ kgDescargados: turnoLocal.kgDescargados }}
              onSuccess={async () => {
                try {
                  const nextEstadoId = getNextEstadoId(turnoLocal.estado?.nombre);
                  if (!nextEstadoId) throw new Error('No se puede determinar el próximo estado');
                  await fetch(`${import.meta.env.VITE_BACKEND_URL || ''}/turnos/${turnoLocal.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ idEstado: nextEstadoId }),
                  });
                } catch (err) {
                  //console.error(err);
                }
                handleFormSuccess();
              }}
              onCancel={() => setOpenDialog(null)}
            />
          </DialogContent>
        </Dialog>
      );
    case 'datospago':
      const isMobilePago = window.innerWidth <= 600;
      return (
        <Dialog open onClose={() => setOpenDialog(null)} fullWidth maxWidth="sm">
          <DialogTitle>Datos de Pago</DialogTitle>
          <DialogContent>
            {!turnoLocal.precios ? (
              <Box display="flex" alignItems="center" justifyContent="center" minHeight={200}>
                <CircularProgress />
              </Box>
            ) : Object.keys(turnoLocal.precios).length > 0 ? (
              <Box sx={{ mt: 1 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ borderBottom: '1px solid #eee', pb: 1, mb: 2 }}>
                    {Object.entries(turnoLocal.precios).map(([label, value]: [string, any]) => {
                      const prettyLabel = label
                        .replace(/([A-Z])/g, ' $1')
                        .replace(/^./, (str) => str.toUpperCase())
                        .trim();
                      const isMoney = [
                        'montoNeto', 'iva', 'montoBruto', 'retencion', 'descuentoBruto', 'adelanto', 'totalAPagar',
                        'Monto Neto', 'Iva', 'Monto Bruto', 'Retencion', 'Descuento Bruto', 'Adelanto', 'Total A Pagar'
                      ].some(key => label.toLowerCase().replace(/\s/g, '') === key.toLowerCase().replace(/\s/g, ''));
                      return (
                        isMobilePago ? (
                          <Box key={label} sx={{ borderBottom: '1px solid #eee', pb: 1, mb: 1 }}>
                            <Typography sx={{ fontWeight: 500, fontSize: 15 }}>{prettyLabel}</Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                              <Typography sx={{ flex: 1 }}>{isMoney ? formatMoney(value) : String(value)}</Typography>
                              {isMoney && <Typography sx={{ color: '#888', ml: 0.5, userSelect: 'none' }} component="span">$</Typography>}
                              <IconButton size="small" onClick={() => handleCopy(String(value), `${turnoLocal.id}-${label}`)}>
                                <ContentCopyIcon fontSize="small" />
                              </IconButton>
                              {copiedField === `${turnoLocal.id}-${label}` && (
                                <Typography sx={{ color: theme.colores.azul, fontSize: 12, ml: 1 }}>Copiado!</Typography>
                              )}
                            </Box>
                          </Box>
                        ) : (
                          <Box key={label} sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 0.5 }}>
                            <Typography sx={{ minWidth: 180, fontWeight: 500 }}>{prettyLabel}</Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                              <Typography sx={{ flex: 1 }}>{isMoney ? formatMoney(value) : String(value)}</Typography>
                              {isMoney && <Typography sx={{ color: '#888', ml: 0.5, userSelect: 'none' }} component="span">$</Typography>}
                            </Box>
                            <IconButton size="small" onClick={() => handleCopy(String(value), `${turnoLocal.id}-${label}`)}>
                              <ContentCopyIcon fontSize="small" />
                            </IconButton>
                            {copiedField === `${turnoLocal.id}-${label}` && (
                              <Typography sx={{ color: theme.colores.azul, fontSize: 12, ml: 1 }}>Copiado!</Typography>
                            )}
                          </Box>
                        )
                      );
                    })}
                  </Box>
                </Box>
              </Box>
            ) : (
              <Typography color="text.secondary">No hay datos de pago para mostrar.</Typography>
            )}
          </DialogContent>
        </Dialog>
      );
    case 'pago':
      return (
        <Dialog open onClose={() => setOpenDialog(null)} fullWidth maxWidth="sm">
          <DialogTitle>Ingresar Orden de Pago</DialogTitle>
          <DialogContent>
            <OrdenPagoForm
              turnoId={turnoLocal.id}
              initialData={turnoLocal.numeroOrdenPago}
              onSuccess={async () => {
                try {
                  await fetch(`${import.meta.env.VITE_BACKEND_URL || ''}/turnos/${turnoLocal.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ idEstado: 11 }),
                  });
                } catch (err) {
                  //console.error(err);
                }
                handleFormSuccess();
              }}
              onCancel={() => setOpenDialog(null)}
            />
          </DialogContent>
        </Dialog>
      );
    case 'factura':
      // Usar item directo si está disponible, si no, fallback a turnoLocal
      const turnoFactura = turnoLocal;
      return (
        <Dialog open onClose={() => setOpenDialog(null)} fullWidth maxWidth="sm">
          <DialogTitle>Agregar Factura</DialogTitle>
          <DialogContent>
            <FacturaForm
              cuitEmpresa={turnoFactura.empresa?.cuit}
              turnoId={turnoFactura.id}
              precioGrano={turnoFactura.precioGrano}
              initialFactura={turnoFactura.factura}
              onSuccess={async (updatedFactura) => {
                try {
                  // Solo cambiar de estado si se está asociando una factura (no si se borra/desasocia)
                  if (updatedFactura) {
                    const nextEstadoId = getNextEstadoId(turnoFactura.estado?.nombre);
                    if (!nextEstadoId) throw new Error('No se puede determinar el próximo estado');
                    await fetch(`${import.meta.env.VITE_BACKEND_URL || ''}/turnos/${turnoFactura.id}`, {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ idEstado: nextEstadoId }),
                    });
                  }
                } catch (err) {
                  //console.error(err);
                }
                handleFormSuccess();
              }}
              onCancel={() => setOpenDialog(null)}
            />
          </DialogContent>
        </Dialog>
      );
    case 'adelanto':
      return (
        <Dialog open onClose={() => setOpenDialog(null)} fullWidth maxWidth="sm">
          <DialogTitle>Adelanto</DialogTitle>
          <DialogContent>
            <AdelantosTurnoForm
              turnoId={turnoLocal.id}
              rolPermitido={true}
              onSuccess={handleFormSuccess}
              onCancel={() => setOpenDialog(null)}
              adelantos={turnoLocal.adelantos}
            />
          </DialogContent>
        </Dialog>
      );
    default:
      return null;
  }
}

function formatearEmpresa(empresa: any): string {
  if (!empresa) return '';
  const razon = empresa.razonSocial || empresa.nombreFantasia || '';
  const cuit = empresa.cuit || '';
  if (razon && cuit) return `${razon} - ${cuit}`;
  return razon || cuit;
}

function formatMoney(value: any) {
  if (typeof value !== 'number' && isNaN(Number(value))) return value;
  return Number(value).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
} 