import React, { useContext, useState } from "react";
import { Box, Button, Collapse, IconButton, Typography } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { ContextoGeneral } from "../../Contexto";
import useTransformarCampo from "../../hooks/useTransformarCampo";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import TurnoConErroresForm from "../../forms/turnos/tabs/turnosConErrores/TurnoConErroresForm";
import TaraForm from "../../forms/turnos/tabs/TaraForm";
import CartaPorteForm from "../../forms/turnos/tabs/CartaPorteForm";
import PesajeForm from "../../forms/turnos/tabs/PesajeForm";
import FacturaForm from "../../forms/turnos/tabs/FacturaForm";
import AdelantosTurnoForm from "../../forms/turnos/tabs/AdelantosTurnoForm";
import OrdenPagoForm from "../../forms/turnos/tabs/OrdenPagoForm";
import CircularProgress from '@mui/material/CircularProgress';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

interface CardMobileProps {
  item: any;
  index: number;
  fields: string[];
  headerNames: string[];
  expandedCard: number | null;
  handleExpandClick: (index: number) => void;
  handleOpenDialog: (item: any) => void;
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
  onActionSuccess?: () => void; // Callback to refresh data after any action
  cupo?: any; // Nuevo prop opcional
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
  onActionSuccess,
  cupo,
}) => {
  const { theme } = useContext(ContextoGeneral);
  const transformarCampo = useTransformarCampo();

  // Dialog states for forms
  const [openCorregir, setOpenCorregir] = useState(false);
  const [openAutorizar, setOpenAutorizar] = useState(false);
  const [openTara, setOpenTara] = useState(false);
  const [openCartaPorte, setOpenCartaPorte] = useState(false);
  const [openCargarCarta, setOpenCargarCarta] = useState(false);
  const [openPesaje, setOpenPesaje] = useState(false);
  const [openPago, setOpenPago] = useState(false);
  const [openFactura, setOpenFactura] = useState(false);
  const [openAdelanto, setOpenAdelanto] = useState(false);
  const [autorizarLoading, setAutorizarLoading] = useState(false);
  const [cartaPorteData, setCartaPorteData] = useState<any>(null);
  const [cartaPorteLoading, setCartaPorteLoading] = useState(false);
  const [cartaPorteError, setCartaPorteError] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Helper: get color for estado
  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'con errores':
        return '#FF0000';
      case 'validado':
        return '#FFFF00';
      case 'autorizado':
        return '#00B7EB';
      case 'tarado':
        return '#90EE90';
      case 'en viaje':
        return '#FFA500';
      case 'descargado':
        return '#800080';
      case 'facturado':
        return '#008000'; // verde oscuro para facturado
      case 'pagado':
        return '#006400'; // verde más oscuro para pagado
      default:
        return theme.colores.azul;
    }
  };

  // Remove 'estado' from fields/headerNames for display
  const filteredFields = fields.filter(f => f !== 'estado.nombre');
  const filteredHeaderNames = headerNames.filter((h, i) => fields[i] !== 'estado.nombre');

  // Success handler for all forms
  const handleFormSuccess = (data?: any) => {
    if (onActionSuccess) onActionSuccess();
    setOpenCorregir(false);
    setOpenAutorizar(false);
    setOpenTara(false);
    setOpenCartaPorte(false);
    setOpenCargarCarta(false);
    setOpenPesaje(false);
    setOpenPago(false);
    setOpenFactura(false);
    setOpenAdelanto(false);
  };

  // Utility: get next estado id for a given estado
  const getNextEstadoId = (estadoNombre: string) => {
    switch (estadoNombre?.toLowerCase()) {
      case 'validado':
        return 3; // Autorizado
      case 'autorizado':
        return 4; // Tarado
      case 'tarado':
        return 5; // En viaje
      case 'en viaje':
        return 6; // Descargado
      case 'descargado':
        return 7; // Facturado
      // Add more transitions as needed
      default:
        return null;
    }
  };

  // Fetch carta de porte data when modal opens
  React.useEffect(() => {
    if (openCartaPorte) {
      setCartaPorteLoading(true);
      setCartaPorteError(null);
      (async () => {
        try {
          const backendURL = import.meta.env.VITE_BACKEND_URL || '';
          // Usar los datos del item y cupo directamente
          const turno = item;
          // Si falta carga, buscarla
          let carga = null;
          if (cupo && cupo.carga) {
            const cargaRes = await fetch(`${backendURL}/cargas/${cupo.carga}`);
            carga = await cargaRes.json();
          } else if (item.carga || item.idCarga) {
            const cargaRes = await fetch(`${backendURL}/cargas/${item.carga || item.idCarga}`);
            carga = await cargaRes.json();
          }
          // Si falta contrato, buscarlo
          let contrato = null;
          if (carga && carga.idContrato) {
            const contratoRes = await fetch(`${backendURL}/contratos/${carga.idContrato}`);
            contrato = await contratoRes.json();
          }
          setCartaPorteData({ turno, carga, contrato, cupo });
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
  }, [openCartaPorte, item, cupo]);

  // Copy to clipboard helper
  const handleCopy = (value: string, field: string) => {
    navigator.clipboard.writeText(value);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 1200);
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
      {/* Estado pill label */}
      {item.estado?.nombre && (
        <Box
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            px: 2,
            py: 0.5,
            borderRadius: '16px',
            border: `2px solid ${getEstadoColor(item.estado.nombre.toLowerCase())}`,
            color: getEstadoColor(item.estado.nombre.toLowerCase()),
            fontWeight: 'bold',
            fontSize: '0.85rem',
            background: '#fff',
            zIndex: 2,
            textTransform: 'capitalize',
            minWidth: '80px',
            textAlign: 'center',
          }}
        >
          {item.estado.nombre}
        </Box>
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
            <Typography variant="subtitle1" fontWeight="bold">
              {transformarCampo(tituloField || fields[0], item) || "Sin título"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {subtituloField ? transformarCampo(subtituloField, item) : ""}
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
          {filteredFields.map((field, idx) => (
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
              <Typography variant="body2">
                {transformarCampo(field, item)}
              </Typography>
            </Box>
          ))}
          {/* Botones por estado */}
          {(() => {
            const estado = item.estado?.nombre?.toLowerCase();
            if (estado === 'pagado') {
              return null; // No buttons for pagado
            }
            // Two-button layout for 'validado' (Corregir/Autorizar)
            if (estado === 'validado') {
              return (
                <>
                  <Box display="flex" gap={2} mb={1}>
                    <Button
                      variant="contained"
                      fullWidth
                      sx={{
                        backgroundColor: theme.colores.azul,
                        color: '#fff',
                        '&:hover': { backgroundColor: theme.colores.azul, opacity: 0.9 },
                      }}
                      onClick={() => setOpenCorregir(true)}
                    >
                      Corregir
                    </Button>
                    <Button
                      variant="contained"
                      fullWidth
                      sx={{
                        backgroundColor: theme.colores.azul,
                        color: '#fff',
                        '&:hover': { backgroundColor: theme.colores.azul, opacity: 0.9 },
                      }}
                      onClick={() => setOpenAutorizar(true)}
                    >
                      Autorizar
                    </Button>
                  </Box>
                  <Button
                    variant="outlined"
                    color="secondary"
                    fullWidth
                    sx={{ mt: 1, borderColor: theme.colores.azul, color: theme.colores.azul, '&:hover': { borderColor: theme.colores.azul, backgroundColor: '#f0f8ff' } }}
                    onClick={() => setOpenAdelanto(true)}
                  >
                    Adelanto
                  </Button>
                </>
              );
            }
            // One main button + Adelanto for other states
            if (estado === 'con errores') {
              return (
                <>
                  <Button
                    variant="contained"
                    fullWidth
                    sx={{
                      backgroundColor: theme.colores.azul,
                      color: '#fff',
                      '&:hover': { backgroundColor: theme.colores.azul, opacity: 0.9 },
                    }}
                    onClick={() => setOpenCorregir(true)}
                  >
                    Corregir
                  </Button>
                  <Button
                    variant="outlined"
                    color="secondary"
                    fullWidth
                    sx={{ mt: 1, borderColor: theme.colores.azul, color: theme.colores.azul, '&:hover': { borderColor: theme.colores.azul, backgroundColor: '#f0f8ff' } }}
                    onClick={() => setOpenAdelanto(true)}
                  >
                    Adelanto
                  </Button>
                </>
              );
            }
            if (estado === 'autorizado') {
              return (
                <>
                  <Button
                    variant="contained"
                    fullWidth
                    sx={{
                      backgroundColor: theme.colores.azul,
                      color: '#fff',
                      '&:hover': { backgroundColor: theme.colores.azul, opacity: 0.9 },
                    }}
                    onClick={() => setOpenTara(true)}
                  >
                    Cargar Tara
                  </Button>
                  <Button
                    variant="outlined"
                    color="secondary"
                    fullWidth
                    sx={{ mt: 1, borderColor: theme.colores.azul, color: theme.colores.azul, '&:hover': { borderColor: theme.colores.azul, backgroundColor: '#f0f8ff' } }}
                    onClick={() => setOpenAdelanto(true)}
                  >
                    Adelanto
                  </Button>
                </>
              );
            }
            if (estado === 'tarado') {
              return (
                <>
                  <Box display="flex" gap={2} mb={1}>
                    <Button
                      variant="outlined"
                      fullWidth
                      sx={{
                        borderColor: theme.colores.azul,
                        color: theme.colores.azul,
                        '&:hover': { borderColor: theme.colores.azul, backgroundColor: '#f0f8ff' },
                      }}
                      onClick={() => setOpenCartaPorte(true)}
                    >
                      Ver Carta de Porte
                    </Button>
                    <Button
                      variant="contained"
                      fullWidth
                      sx={{
                        backgroundColor: theme.colores.azul,
                        color: '#fff',
                        '&:hover': { backgroundColor: theme.colores.azul, opacity: 0.9 },
                      }}
                      onClick={() => setOpenCargarCarta(true)}
                    >
                      Cargar Carta de Porte
                    </Button>
                  </Box>
                  <Button
                    variant="outlined"
                    color="secondary"
                    fullWidth
                    sx={{ mt: 1, borderColor: theme.colores.azul, color: theme.colores.azul, '&:hover': { borderColor: theme.colores.azul, backgroundColor: '#f0f8ff' } }}
                    onClick={() => setOpenAdelanto(true)}
                  >
                    Adelanto
                  </Button>
                </>
              );
            }
            if (estado === 'en viaje') {
              return (
                <>
                  <Button
                    variant="contained"
                    fullWidth
                    sx={{
                      backgroundColor: theme.colores.azul,
                      color: '#fff',
                      '&:hover': { backgroundColor: theme.colores.azul, opacity: 0.9 },
                    }}
                    onClick={() => setOpenPesaje(true)}
                  >
                    Ingresar Kg Descargados
                  </Button>
                  <Button
                    variant="outlined"
                    color="secondary"
                    fullWidth
                    sx={{ mt: 1, borderColor: theme.colores.azul, color: theme.colores.azul, '&:hover': { borderColor: theme.colores.azul, backgroundColor: '#f0f8ff' } }}
                    onClick={() => setOpenAdelanto(true)}
                  >
                    Adelanto
                  </Button>
                </>
              );
            }
            if (estado === 'descargado') {
              return (
                <>
                  <Box display="flex" gap={2} mb={1}>
                    <Button
                      variant="outlined"
                      fullWidth
                      sx={{
                        borderColor: theme.colores.azul,
                        color: theme.colores.azul,
                        '&:hover': { borderColor: theme.colores.azul, backgroundColor: '#f0f8ff' },
                      }}
                      onClick={() => setOpenPago(true)}
                    >
                      Ver Datos de Pago
                    </Button>
                    <Button
                      variant="contained"
                      fullWidth
                      sx={{
                        backgroundColor: theme.colores.azul,
                        color: '#fff',
                        '&:hover': { backgroundColor: theme.colores.azul, opacity: 0.9 },
                      }}
                      onClick={() => setOpenFactura(true)}
                    >
                      Agregar Factura
                    </Button>
                  </Box>
                  <Button
                    variant="outlined"
                    color="secondary"
                    fullWidth
                    sx={{ mt: 1, borderColor: theme.colores.azul, color: theme.colores.azul, '&:hover': { borderColor: theme.colores.azul, backgroundColor: '#f0f8ff' } }}
                    onClick={() => setOpenAdelanto(true)}
                  >
                    Adelanto
                  </Button>
                </>
              );
            }
            if (estado === 'facturado') {
              return (
                <>
                  <Button
                    variant="contained"
                    fullWidth
                    sx={{
                      backgroundColor: theme.colores.azul,
                      color: '#fff',
                      '&:hover': { backgroundColor: theme.colores.azul, opacity: 0.9 },
                    }}
                    onClick={() => setOpenPago(true)}
                  >
                    Pagar
                  </Button>
                  <Button
                    variant="outlined"
                    color="secondary"
                    fullWidth
                    sx={{ mt: 1, borderColor: theme.colores.azul, color: theme.colores.azul, '&:hover': { borderColor: theme.colores.azul, backgroundColor: '#f0f8ff' } }}
                    onClick={() => setOpenAdelanto(true)}
                  >
                    Adelanto
                  </Button>
                </>
              );
            }
            return null;
          })()}
        </Box>
      </Collapse>
      {/* Dialogs para formularios y vistas */}
      <Dialog open={openCorregir} onClose={() => setOpenCorregir(false)} fullWidth maxWidth="sm">
        <DialogTitle>Corregir Turno</DialogTitle>
        <DialogContent>
          <TurnoConErroresForm
            seleccionado={(() => {
              // Si el estado es validado, pasar los campos planos para autocompletes
              if (item.estado?.nombre?.toLowerCase() === 'validado') {
                return {
                  ...item,
                  cuilColaborador: item.colaborador?.cuil,
                  cuitEmpresa: item.empresa?.cuit,
                  patenteCamion: item.camion?.patente,
                  patenteAcoplado: item.acoplado?.patente,
                  patenteAcopladoExtra: item.acopladoExtra?.patente,
                };
              }
              // Para con errores u otros, pasar el item tal cual
              return item;
            })()}
            datos={[item]}
            setDatos={() => {}}
            handleClose={() => setOpenCorregir(false)}
            idCarga={item.carga || item.idCarga}
          />
        </DialogContent>
      </Dialog>
      <Dialog open={openAutorizar} onClose={() => setOpenAutorizar(false)} fullWidth maxWidth="sm">
        <DialogTitle>Autorizar Turno</DialogTitle>
        <DialogContent>
          <Button
            variant="contained"
            fullWidth
            sx={{
              backgroundColor: theme.colores.azul,
              color: '#fff',
              borderRadius: '8px',
              boxShadow: 'none',
              '&:hover': { backgroundColor: theme.colores.azul, opacity: 0.9 },
              mt: 2,
            }}
            disabled={autorizarLoading}
            onClick={async () => {
              setAutorizarLoading(true);
              try {
                const nextEstadoId = getNextEstadoId(item.estado?.nombre);
                if (!nextEstadoId) throw new Error('No se puede determinar el próximo estado');
                const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || ''}/turnos/${item.id}`, {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ idEstado: nextEstadoId }),
                });
                if (!response.ok) throw new Error(await response.text());
                handleFormSuccess();
              } catch (err) {
                console.error(err);
              } finally {
                setAutorizarLoading(false);
              }
            }}
          >
            {autorizarLoading ? <CircularProgress size={24} sx={{ color: '#fff' }} /> : 'Confirmar Autorización'}
          </Button>
        </DialogContent>
      </Dialog>
      <Dialog open={openTara} onClose={() => setOpenTara(false)} fullWidth maxWidth="sm">
        <DialogTitle>Cargar Tara</DialogTitle>
        <DialogContent>
          <TaraForm
            turnoId={item.id}
            initialTara={item.tara}
            onSuccess={async () => {
              // Al guardar la tara, cambiar a tarado
              try {
                const nextEstadoId = getNextEstadoId(item.estado?.nombre);
                if (!nextEstadoId) throw new Error('No se puede determinar el próximo estado');
                await fetch(`${import.meta.env.VITE_BACKEND_URL || ''}/turnos/${item.id}`, {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ idEstado: nextEstadoId }),
                });
              } catch (err) {
                console.error(err);
              }
              handleFormSuccess();
            }}
            onCancel={() => setOpenTara(false)}
          />
        </DialogContent>
      </Dialog>
      <Dialog open={openCartaPorte} onClose={() => setOpenCartaPorte(false)} fullWidth maxWidth="md">
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
                { label: 'Remitente comercial venta primaria', value: cartaPorteData.contrato?.remitenteComercialVentaPrimaria?.razonSocial },
                { label: 'Representante entregador', value: cartaPorteData.contrato?.representanteEntregador?.razonSocial },
                { label: 'Destinatario', value: cartaPorteData.contrato?.destinatario?.razonSocial },
                { label: 'Destino', value: cartaPorteData.carga?.ubicacionDescarga?.nombre },
                { label: 'Empresa transportista', value: cartaPorteData.turno?.empresa?.razonSocial },
                { label: 'Flete pagador', value: cartaPorteData.contrato?.fletePagador?.razonSocial },
                { label: 'Chofer', value: cartaPorteData.turno?.colaborador?.nombre + ' ' + cartaPorteData.turno?.colaborador?.apellido },
                { label: 'Patente camión', value: cartaPorteData.turno?.camion?.patente },
                { label: 'Patente acoplado', value: cartaPorteData.turno?.acoplado?.patente },
                { label: 'Patente acoplado extra', value: cartaPorteData.turno?.acopladoExtra?.patente },
                { label: 'Tarifa', value: cartaPorteData.carga?.tarifa },
                { label: 'Peso tara', value: cartaPorteData.turno?.tara?.pesoTara },
                { label: 'Peso bruto', value: cartaPorteData.turno?.tara?.pesoBruto },
              ].filter(row => row.value !== undefined && row.value !== null).map((row, idx) => (
                <Box key={row.label} sx={{ display: 'flex', alignItems: 'center', gap: 2, borderBottom: '1px solid #eee', pb: 1 }}>
                  <Typography sx={{ minWidth: 260, fontWeight: 500 }}>{row.label}</Typography>
                  <Typography sx={{ flex: 1 }}>{row.value}</Typography>
                  <IconButton size="small" onClick={() => handleCopy(String(row.value), row.label)}>
                    <ContentCopyIcon fontSize="small" />
                  </IconButton>
                  {copiedField === row.label && (
                    <Typography sx={{ color: theme.colores.azul, fontSize: 12, ml: 1 }}>Copiado!</Typography>
                  )}
                </Box>
              ))}
            </Box>
          ) : (
            <Typography color="text.secondary">No hay datos para mostrar.</Typography>
          )}
        </DialogContent>
      </Dialog>
      <Dialog open={openCargarCarta} onClose={() => setOpenCargarCarta(false)} fullWidth maxWidth="sm">
        <DialogTitle>Cargar Carta de Porte</DialogTitle>
        <DialogContent>
          <CartaPorteForm
            turnoId={item.id}
            initialData={item.cartaDePorte}
            onSuccess={async () => {
              // Al guardar la carta de porte, cambiar a en viaje
              try {
                const nextEstadoId = getNextEstadoId(item.estado?.nombre);
                if (!nextEstadoId) throw new Error('No se puede determinar el próximo estado');
                await fetch(`${import.meta.env.VITE_BACKEND_URL || ''}/turnos/${item.id}`, {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ idEstado: nextEstadoId }),
                });
              } catch (err) {
                console.error(err);
              }
              handleFormSuccess();
            }}
            onCancel={() => setOpenCargarCarta(false)}
          />
        </DialogContent>
      </Dialog>
      <Dialog open={openPesaje} onClose={() => setOpenPesaje(false)} fullWidth maxWidth="sm">
        <DialogTitle>Ingresar Kg Descargados</DialogTitle>
        <DialogContent>
          <PesajeForm
            turnoId={item.id}
            initialData={{
              kgCargados: item.kgCargados,
              kgDescargados: item.kgDescargados,
              precioPorKilogramo: item.precioGrano,
            }}
            onSuccess={async () => {
              // Al guardar el pesaje, cambiar a descargado
              try {
                const nextEstadoId = getNextEstadoId(item.estado?.nombre);
                if (!nextEstadoId) throw new Error('No se puede determinar el próximo estado');
                await fetch(`${import.meta.env.VITE_BACKEND_URL || ''}/turnos/${item.id}`, {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ idEstado: nextEstadoId }),
                });
              } catch (err) {
                console.error(err);
              }
              handleFormSuccess();
            }}
            onCancel={() => setOpenPesaje(false)}
          />
        </DialogContent>
      </Dialog>
      <Dialog open={openPago} onClose={() => setOpenPago(false)} fullWidth maxWidth="md">
        <DialogTitle>Datos de Pago</DialogTitle>
        <DialogContent>
          {/* Aquí deberías mostrar los datos de pago, por ahora mostramos los datos crudos */}
          <pre style={{ fontSize: 14 }}>{JSON.stringify(item.pago, null, 2)}</pre>
          {/* Si el estado es facturado, mostrar el formulario de pago */}
          {item.estado?.nombre?.toLowerCase() === 'facturado' && (
            <OrdenPagoForm
              turnoId={item.id}
              initialData={item.numeroOrdenPago}
              onSuccess={async () => {
                // Al guardar la orden de pago, cambiar a pagado
                try {
                  await fetch(`${import.meta.env.VITE_BACKEND_URL || ''}/turnos/${item.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ idEstado: 8 }), // 8 = Pagado
                  });
                } catch (err) {
                  // Optionally show error
                  console.error(err);
                }
                handleFormSuccess();
              }}
              onCancel={() => setOpenPago(false)}
            />
          )}
        </DialogContent>
      </Dialog>
      <Dialog open={openFactura} onClose={() => setOpenFactura(false)} fullWidth maxWidth="sm">
        <DialogTitle>Agregar Factura</DialogTitle>
        <DialogContent>
          <FacturaForm
            turnoId={item.id}
            cuitEmpresa={item.empresa?.cuit}
            initialFactura={item.factura}
            onSuccess={async () => {
              // Al guardar la factura, cambiar a facturado
              try {
                const nextEstadoId = getNextEstadoId(item.estado?.nombre);
                if (!nextEstadoId) throw new Error('No se puede determinar el próximo estado');
                await fetch(`${import.meta.env.VITE_BACKEND_URL || ''}/turnos/${item.id}`, {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ idEstado: nextEstadoId }),
                });
              } catch (err) {
                console.error(err);
              }
              handleFormSuccess();
            }}
            onCancel={() => setOpenFactura(false)}
          />
        </DialogContent>
      </Dialog>
      <Dialog open={openAdelanto} onClose={() => setOpenAdelanto(false)} fullWidth maxWidth="sm">
        <DialogTitle>Adelanto</DialogTitle>
        <DialogContent>
          <AdelantosTurnoForm
            turnoId={item.id}
            rolPermitido={true}
            onSuccess={handleFormSuccess}
            onCancel={() => setOpenAdelanto(false)}
          />
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default CardMobile;
