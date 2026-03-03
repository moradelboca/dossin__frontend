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
import { axiosGet, axiosPut } from "../../../lib/axiosConfig";
import { registrarCambioEstado } from "../../../services/turnosEstadoHistorialService";
import { useAuth } from "../../autenticacion/ContextoAuth";
import { getRemitoId, getFotosTurno } from "../../../lib/supabase";
// TEMPORALMENTE COMENTADO - Backend no está listo todavía
// import { useModificacionesCartaPorte } from "../../hooks/turnos/useModificacionesCartaPorte";
// import CampoEditableCartaPorte from "./CampoEditableCartaPorte";
import DialogActions from "@mui/material/DialogActions";
import MainButton from "../../botones/MainButtom";

export function useManejoTurnos({ item, cupo, refreshCupos }: any) {
  const { theme, backendURL } = useContext(ContextoGeneral);

  // Dialog states for forms
  const [openDialog, setOpenDialog] = useState<null | 'corregir' | 'autorizar' | 'tara' | 'cartaPorte' | 'cargarCarta' | 'pesaje' | 'pago' | 'datospago' | 'factura' | 'adelanto'>(null);
  const [autorizarLoading, setAutorizarLoading] = useState(false);
  const [cartaPorteData, setCartaPorteData] = useState<any>(null);
  const [cartaPorteLoading, setCartaPorteLoading] = useState(false);
  const [cartaPorteError, setCartaPorteError] = useState<string | null>(null);
  const [remitoData, setRemitoData] = useState<{ idRemito: string | null; fotoUrl: string | null } | null>(null);
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
      await axiosPut(`turnos/${turnoId}`, { nota: notaLocal }, backendURL);
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
      await axiosPut(`turnos/${turnoId}`, { nota: '' }, backendURL);
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
            const turnoCompleto = await axiosGet<any>(`turnos/${item.id}`, backendURL);
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
    if (openDialog === 'cartaPorte' || openDialog === 'cargarCarta') {
      setCartaPorteLoading(true);
      setCartaPorteError(null);
      (async () => {
        try {
          // Obtener datos completos del turno (incluyendo KG)
          let turno = item;
          if (item?.id) {
            try {
              turno = await axiosGet<any>(`turnos/${item.id}`, backendURL);
            } catch (err) {
              // console.error(err);
            }
          }
          
          let carga = null;
          if (cupo && cupo.carga) {
            carga = await axiosGet<any>(`cargas/${cupo.carga}`, backendURL);
          } else if (item.carga || item.idCarga) {
            carga = await axiosGet<any>(`cargas/${item.carga || item.idCarga}`, backendURL);
          }
          let contrato = null;
          if (carga && carga.id) {
            try {
              const contratos = await axiosGet<any[]>('contratos', backendURL);
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
          
          // Cargar datos del remito si existe
          try {
            const remitoId = await getRemitoId(item.id);
            let fotoRemitoUrl = null;
            if (remitoId) {
              const fotos = await getFotosTurno(item.id);
              const fotoRemito = fotos.find((f: any) => f.tipo_foto === 'remito');
              if (fotoRemito) {
                fotoRemitoUrl = fotoRemito.url;
              }
              setRemitoData({ idRemito: remitoId, fotoUrl: fotoRemitoUrl });
            } else {
              setRemitoData(null);
            }
          } catch (err) {
            console.error('Error al cargar datos del remito:', err);
            setRemitoData(null);
          }
        } catch (err: any) {
          setCartaPorteError('Error al cargar los datos de la carta de porte');
        } finally {
          setCartaPorteLoading(false);
        }
      })();
    } else {
      setCartaPorteData(null);
      setCartaPorteError(null);
      setRemitoData(null);
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
    remitoData,
  };
}

// Componente separado para el contenido del diálogo de Carta de Porte
function CartaPorteDialogContent({
  turnoId: _turnoId,
  cartaPorteData,
  cartaPorteLoading,
  cartaPorteError,
  copiedField,
  remitoData,
  theme,
  backendURL: _backendURL,
  handleCopy,
  handleFormSuccess: _handleFormSuccess,
  setOpenDialog,
  refreshCupos: _refreshCupos,
}: any) {
  // TEMPORALMENTE COMENTADO - Backend no está listo todavía
  // const modificacionesHook = useModificacionesCartaPorte(turnoId);
  // const [empresas, setEmpresas] = useState<any[]>([]);
  // const [ubicaciones, setUbicaciones] = useState<any[]>([]);
  // const [loadingData, setLoadingData] = useState(false);
  const [_saving] = useState(false);
  const isMobile = window.innerWidth <= 600;

  // TEMPORALMENTE COMENTADO - Backend no está listo todavía
  // Cargar empresas y ubicaciones
  // useEffect(() => {
  //   const cargarDatos = async () => {
  //     setLoadingData(true);
  //     try {
  //       const [empresasData, ubicacionesData] = await Promise.all([
  //         axiosGet<any[]>('empresas', backendURL),
  //         axiosGet<any[]>('ubicaciones', backendURL),
  //       ]);
  //       setEmpresas(empresasData || []);
  //       setUbicaciones(ubicacionesData || []);
  //     } catch (err) {
  //       console.error('Error cargando datos:', err);
  //     } finally {
  //       setLoadingData(false);
  //     }
  //   };
  //   if (cartaPorteData) {
  //     cargarDatos();
  //   }
  // }, [cartaPorteData, backendURL]);

  // TEMPORALMENTE COMENTADO - Backend no está listo todavía
  // const handleEmitirCP = async () => {
  //   setSaving(true);
  //   try {
  //     await modificacionesHook.guardarModificacionesYCambiarEstado(true);
  //     if (refreshCupos) refreshCupos();
  //     handleFormSuccess();
  //   } catch (err: any) {
  //     console.error('Error al emitir CP:', err);
  //     // El error ya se maneja en el hook
  //   } finally {
  //     setSaving(false);
  //   }
  // };

  // TEMPORALMENTE COMENTADO - Backend no está listo todavía
  // const handleContinuarSinEmitir = async () => {
  //   setSaving(true);
  //   try {
  //     await modificacionesHook.guardarModificacionesYCambiarEstado(false);
  //     if (refreshCupos) refreshCupos();
  //     handleFormSuccess();
  //   } catch (err: any) {
  //     console.error('Error al continuar sin emitir:', err);
  //     // El error ya se maneja en el hook
  //   } finally {
  //     setSaving(false);
  //   }
  // };

  // Solo crear campos si cartaPorteData existe
  const campos = cartaPorteData ? [
    { label: 'Titular Carta de Porte', value: formatearEmpresa(cartaPorteData.contrato?.titularCartaDePorte), valorOriginal: cartaPorteData.contrato?.titularCartaDePorte?.cuit },
    { label: 'Remitente Comercial Productor', value: formatearEmpresa(cartaPorteData.contrato?.remitenteProductor), valorOriginal: cartaPorteData.contrato?.remitenteProductor?.cuit },
    { label: 'Rte. Comercial Venta Primaria', value: formatearEmpresa(cartaPorteData.contrato?.remitenteVentaPrimaria), valorOriginal: cartaPorteData.contrato?.remitenteVentaPrimaria?.cuit },
    { label: 'Mercado a Término', value: formatearEmpresa(cartaPorteData.contrato?.mercadoATermino), valorOriginal: null },
    { label: 'Corredor Venta Primaria', value: formatearEmpresa(cartaPorteData.contrato?.corredorVentaPrimaria), valorOriginal: cartaPorteData.contrato?.corredorVentaPrimaria?.cuit },
    { label: 'Corredor Venta Secundaria', value: formatearEmpresa(cartaPorteData.contrato?.corredorVentaSecundaria), valorOriginal: cartaPorteData.contrato?.corredorVentaSecundaria?.cuit },
    { label: 'Representante entregador', value: formatearEmpresa(cartaPorteData.contrato?.representanteEntregador), valorOriginal: cartaPorteData.contrato?.representanteEntregador?.cuit },
    { label: 'Destinatario', value: formatearEmpresa(cartaPorteData.contrato?.destinatario), valorOriginal: cartaPorteData.contrato?.destinatario?.cuit },
    { label: 'Destino', value: formatearEmpresa(cartaPorteData.contrato?.destino), valorOriginal: cartaPorteData.contrato?.destino?.cuit },
    { label: 'Rte. Comercial Venta secundaria', value: formatearEmpresa(cartaPorteData.contrato?.remitenteVentaSecundaria), valorOriginal: cartaPorteData.contrato?.remitenteVentaSecundaria?.cuit },
    { label: 'Rte. Comercial Venta secundaria 2', value: formatearEmpresa(cartaPorteData.contrato?.remitenteVentaSecundaria2), valorOriginal: cartaPorteData.contrato?.remitenteVentaSecundaria2?.cuit },
    { label: 'Flete pagador', value: formatearEmpresa(cartaPorteData.contrato?.fletePagador), valorOriginal: cartaPorteData.contrato?.fletePagador?.cuit },
    { label: 'Representante recibidor', value: formatearEmpresa(cartaPorteData.contrato?.representanteRecibidor), valorOriginal: cartaPorteData.contrato?.representanteRecibidor?.cuit },
    { label: 'Kilómetros del viaje', value: cartaPorteData.carga?.cantidadKm, valorOriginal: cartaPorteData.carga?.cantidadKm },
    { label: 'Empresa transportista', value: formatearEmpresa(cartaPorteData.turno?.empresa || cartaPorteData.carga?.empresa), valorOriginal: null },
    { label: 'Chofer', value: (cartaPorteData.turno?.colaborador?.nombre || '') + ' ' + (cartaPorteData.turno?.colaborador?.apellido || '') + (cartaPorteData.turno?.colaborador?.cuil ? ' - ' + cartaPorteData.turno?.colaborador?.cuil : ''), valorOriginal: null },
    { label: 'Patente camión', value: cartaPorteData.turno?.camion?.patente, valorOriginal: null },
    { label: 'Patente acoplado', value: cartaPorteData.turno?.acoplado?.patente, valorOriginal: null },
    { label: 'Patente acoplado extra', value: cartaPorteData.turno?.acopladoExtra?.patente, valorOriginal: null },
    { label: 'Tarifa', value: cartaPorteData.carga?.tarifa, valorOriginal: cartaPorteData.carga?.tarifa },
    { label: 'Kg tara', value: cartaPorteData.turno?.kgTara ?? cartaPorteData.turnoCompleto?.kgTara, valorOriginal: null },
    { label: 'Kg bruto', value: cartaPorteData.turno?.kgBruto ?? cartaPorteData.turnoCompleto?.kgBruto, valorOriginal: null },
    { label: 'Kg neto', value: cartaPorteData.turno?.kgNeto ?? cartaPorteData.turnoCompleto?.kgNeto, valorOriginal: null },
    { label: 'Kg cargados', value: cartaPorteData.turno?.kgCargados ?? cartaPorteData.turnoCompleto?.kgCargados, valorOriginal: null },
  ].filter((row: any) => row.value !== undefined && row.value !== null) : [];

  return (
    <>
      <DialogContent>
        {/* TEMPORALMENTE COMENTADO - Backend no está listo todavía */}
        {/* {cartaPorteLoading || loadingData || modificacionesHook.loading ? ( */}
        {cartaPorteLoading ? (
          <Box display="flex" alignItems="center" justifyContent="center" minHeight={200}>
            <CircularProgress />
          </Box>
        ) : cartaPorteError ? (
          <Typography color="error">{cartaPorteError}</Typography>
        ) : /* TEMPORALMENTE COMENTADO - Backend no está listo todavía */
        /* modificacionesHook.error ? (
          <Typography color="error">{modificacionesHook.error}</Typography>
        ) : */ cartaPorteData ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            {/* Mostrar información de remito si existe */}
            {remitoData && remitoData.idRemito && (
              <Box sx={{ 
                backgroundColor: '#f5f5f5', 
                p: 2, 
                borderRadius: '8px', 
                mb: 2,
                border: `2px solid ${theme.colores.azul}`
              }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, color: theme.colores.azul }}>
                  El turno no lleva carta de porte
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography sx={{ fontWeight: 500 }}>ID del Remito:</Typography>
                    <Typography sx={{ flex: 1 }}>{remitoData.idRemito}</Typography>
                    <IconButton size="small" onClick={() => handleCopy(remitoData.idRemito || '', 'ID Remito')}>
                      <ContentCopyIcon fontSize="small" />
                    </IconButton>
                    {copiedField === 'ID Remito' && (
                      <Typography sx={{ color: theme.colores.azul, fontSize: 12 }}>Copiado!</Typography>
                    )}
                  </Box>
                  {remitoData.fotoUrl && (
                    <Box sx={{ mt: 1 }}>
                      <Typography sx={{ fontWeight: 500, mb: 1 }}>Foto del Remito:</Typography>
                      <img 
                        src={remitoData.fotoUrl} 
                        alt="Foto del remito"
                        style={{ 
                          maxWidth: '100%', 
                          maxHeight: 300, 
                          borderRadius: '8px',
                          cursor: 'pointer'
                        }}
                        onClick={() => window.open(remitoData.fotoUrl || '', '_blank')}
                      />
                    </Box>
                  )}
                </Box>
              </Box>
            )}
            
            {/* FICHA DATOS */}
            {/* TEMPORALMENTE COMENTADO - Backend no está listo todavía - Solo mostrar campos sin edición */}
            {campos.map((campo: any) => {
              // TEMPORALMENTE COMENTADO - Backend no está listo todavía
              // const tipoModificacion = modificacionesHook.obtenerTipoModificacionCampo(campo.label);
              // const esEditable = modificacionesHook.esCampoEditable(campo.label);
              // const valorMostrar = modificacionesHook.obtenerValorCampo(campo.label, campo.valorOriginal || campo.value);

              // TEMPORALMENTE COMENTADO - Backend no está listo todavía
              // if (esEditable && tipoModificacion) {
              //   return (
              //     <CampoEditableCartaPorte
              //       key={campo.label}
              //       label={campo.label}
              //       valor={valorMostrar || campo.valorOriginal}
              //       tipoModificacion={tipoModificacion}
              //       isMobile={isMobile}
              //       onCopy={handleCopy}
              //       copiedField={copiedField}
              //       onSave={(valor) => modificacionesHook.editarCampo(campo.label, valor)}
              //       onCancel={() => {}}
              //       empresas={empresas}
              //       ubicaciones={ubicaciones}
              //     />
              //   );
              // }

              // Campo no editable (mostrar como antes) - Solo modo lectura con copiar
              return isMobile ? (
                <Box key={campo.label} sx={{ borderBottom: '1px solid #eee', pb: 1, mb: 1 }}>
                  <Typography sx={{ fontWeight: 500, fontSize: 15 }}>{campo.label}</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                    <Typography sx={{ flex: 1 }}>{campo.value && String(campo.value).trim() !== '' ? String(campo.value) : 'Dato no necesario'}</Typography>
                    <IconButton size="small" onClick={() => handleCopy(String(campo.value), campo.label)}>
                      <ContentCopyIcon fontSize="small" />
                    </IconButton>
                    {copiedField === campo.label && (
                      <Typography sx={{ color: theme.colores.azul, fontSize: 12, ml: 1 }}>Copiado!</Typography>
                    )}
                  </Box>
                </Box>
              ) : (
                <Box key={campo.label} sx={{ display: 'flex', alignItems: 'center', gap: 2, borderBottom: '1px solid #eee', pb: 1 }}>
                  <Typography sx={{ minWidth: 260, fontWeight: 500 }}>{campo.label}</Typography>
                  <Typography sx={{ flex: 1 }}>{campo.value && String(campo.value).trim() !== '' ? String(campo.value) : 'Dato no necesario'}</Typography>
                  <IconButton size="small" onClick={() => handleCopy(String(campo.value), campo.label)}>
                    <ContentCopyIcon fontSize="small" />
                  </IconButton>
                  {copiedField === campo.label && (
                    <Typography sx={{ color: theme.colores.azul, fontSize: 12, ml: 1 }}>Copiado!</Typography>
                  )}
                </Box>
              );
            })}
          </Box>
        ) : (
          <Typography color="text.secondary">No hay datos para mostrar.</Typography>
        )}
      </DialogContent>
      {/* TEMPORALMENTE COMENTADO - Backend no está listo todavía - Solo permitir cerrar */}
      <DialogActions sx={{ p: 2, gap: 1 }}>
        <MainButton
          onClick={() => setOpenDialog(null)}
          text="Cerrar"
          backgroundColor={theme.colores.azul}
          textColor="#fff"
          borderRadius="8px"
          hoverBackgroundColor={theme.colores.azulOscuro}
        />
        {/* TEMPORALMENTE COMENTADO - Backend no está listo todavía */}
        {/* <MainButton
          onClick={() => setOpenDialog(null)}
          text="Cancelar"
          backgroundColor="transparent"
          textColor={theme.colores.azul}
          borderRadius="8px"
          hoverBackgroundColor="rgba(22, 54, 96, 0.1)"
          disabled={saving}
        />
        <MainButton
          onClick={handleContinuarSinEmitir}
          text={saving ? "Guardando..." : "Continuar sin emitir"}
          backgroundColor={theme.colores.azul}
          textColor="#fff"
          borderRadius="8px"
          hoverBackgroundColor={theme.colores.azulOscuro}
          disabled={saving || modificacionesHook.loading}
        />
        <MainButton
          onClick={handleEmitirCP}
          text={saving ? "Guardando..." : "Emitir CP"}
          backgroundColor="#4caf50"
          textColor="#fff"
          borderRadius="8px"
          hoverBackgroundColor="#45a049"
          disabled={saving || modificacionesHook.loading}
        /> */}
      </DialogActions>
    </>
  );
}

export function renderTurnosDialogs({
  openDialog, setOpenDialog, autorizarLoading, setAutorizarLoading, cartaPorteData, cartaPorteLoading, cartaPorteError, copiedField, turnoLocal, setTurnoLocal,
  handleFormSuccess, handleCopy, getNextEstadoName, theme, backendURL, remitoData, refreshCupos
}: any) {
  const { user } = useAuth();
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
                  const estadoAnteriorId = turnoLocal.estado?.id || null;
                  const nextEstadoId = getNextEstadoId(turnoLocal.estado?.nombre);
                  if (!nextEstadoId) throw new Error('No se puede determinar el próximo estado');
                  await axiosPut(`turnos/${turnoLocal.id}`, { idEstado: nextEstadoId }, backendURL);
                  
                  // Registrar cambio de estado en historial (no bloqueante)
                  if (estadoAnteriorId !== nextEstadoId) {
                    registrarCambioEstado(
                      turnoLocal.id,
                      estadoAnteriorId,
                      nextEstadoId,
                      user?.id,
                      'Autorización de turno'
                    ).catch(() => {
                      // Error silencioso - no debe afectar el flujo principal
                    });
                  }
                  
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
                turno={turnoLocal}
                onSuccess={handleFormSuccess}
                onCancel={() => setOpenDialog(null)}
              />
          </DialogContent>
        </Dialog>
      );
      }
      return null;
    case 'cartaPorte':
      return (
        <Dialog open onClose={() => setOpenDialog(null)} fullWidth maxWidth="md">
          <DialogTitle>Carta de Porte</DialogTitle>
          <CartaPorteDialogContent
            turnoId={turnoLocal?.id}
            cartaPorteData={cartaPorteData}
            cartaPorteLoading={cartaPorteLoading}
            cartaPorteError={cartaPorteError}
            copiedField={copiedField}
            remitoData={remitoData}
            theme={theme}
            backendURL={backendURL}
            handleCopy={handleCopy}
            handleFormSuccess={handleFormSuccess}
            setOpenDialog={setOpenDialog}
            refreshCupos={refreshCupos}
          />
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
              cuitTitular={cartaPorteData?.contrato?.titularCartaDePorte?.cuit}
              onSuccess={async (updatedData) => {
                try {
                  const estadoAnteriorId = turnoLocal.estado?.id || null;
                  const estadoAnteriorNombre = turnoLocal.estado?.nombre || '';
                  const nextEstadoId = getNextEstadoId(estadoAnteriorNombre);
                  
                  if (!nextEstadoId) {
                    throw new Error(`No se puede determinar el próximo estado para: ${estadoAnteriorNombre}`);
                  }
                  
                  const updatedTurno = await axiosPut(`turnos/${turnoLocal.id}`, { idEstado: nextEstadoId }, backendURL);
                  
                  // Actualizar el estado local del turno
                  if (updatedTurno?.estado) {
                    setTurnoLocal({
                      ...turnoLocal,
                      estado: updatedTurno.estado
                    });
                  }
                  
                  // Registrar cambio de estado en historial (no bloqueante)
                  if (estadoAnteriorId !== nextEstadoId) {
                    const motivo = updatedData?.noLlevaCartaPorte 
                      ? 'Carga de remito' 
                      : 'Carga de carta de porte';
                    registrarCambioEstado(
                      turnoLocal.id,
                      estadoAnteriorId,
                      nextEstadoId,
                      user?.id,
                      motivo
                    ).catch(() => {
                      // Error silencioso - no debe afectar el flujo principal
                    });
                  }
                } catch (err: any) {
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
              initialData={{ 
                kgDescargados: turnoLocal.kgDescargados, 
                precioGrano: turnoLocal.precioGrano ? turnoLocal.precioGrano * 1000 : turnoLocal.precioGrano // Convertir de precio por kg a precio por tonelada para mostrar al usuario
              }}
              onSuccess={async () => {
                try {
                  const estadoAnteriorId = turnoLocal.estado?.id || null;
                  const nextEstadoId = getNextEstadoId(turnoLocal.estado?.nombre);
                  if (!nextEstadoId) throw new Error('No se puede determinar el próximo estado');
                  await axiosPut(`turnos/${turnoLocal.id}`, { idEstado: nextEstadoId }, backendURL);
                  
                  // Registrar cambio de estado en historial (no bloqueante)
                  if (estadoAnteriorId !== nextEstadoId) {
                    registrarCambioEstado(
                      turnoLocal.id,
                      estadoAnteriorId,
                      nextEstadoId,
                      user?.id,
                      'Registro de kg descargados'
                    ).catch(() => {
                      // Error silencioso - no debe afectar el flujo principal
                    });
                  }
                } catch (err) {
                  console.error(err);
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
                  const estadoAnteriorId = turnoLocal.estado?.id || null;
                  await axiosPut(`turnos/${turnoLocal.id}`, { idEstado: 11 }, backendURL);
                  
                  // Registrar cambio de estado en historial (no bloqueante)
                  if (estadoAnteriorId !== 11) {
                    registrarCambioEstado(
                      turnoLocal.id,
                      estadoAnteriorId,
                      11,
                      user?.id,
                      'Registro de orden de pago'
                    ).catch(() => {
                      // Error silencioso - no debe afectar el flujo principal
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
              initialFactura={turnoFactura.factura}
              onSuccess={async (updatedFactura) => {
                try {
                  // Solo cambiar de estado si se está asociando una factura (no si se borra/desasocia)
                  if (updatedFactura) {
                    const estadoAnteriorId = turnoFactura.estado?.id || null;
                    const nextEstadoId = getNextEstadoId(turnoFactura.estado?.nombre);
                    if (!nextEstadoId) throw new Error('No se puede determinar el próximo estado');
                    await axiosPut(`turnos/${turnoFactura.id}`, { idEstado: nextEstadoId }, backendURL);
                    
                    // Registrar cambio de estado en historial (no bloqueante)
                    if (estadoAnteriorId !== nextEstadoId) {
                      registrarCambioEstado(
                        turnoFactura.id,
                        estadoAnteriorId,
                        nextEstadoId,
                        user?.id,
                        'Asociación de factura'
                      ).catch(() => {
                        // Error silencioso - no debe afectar el flujo principal
                      });
                    }
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
