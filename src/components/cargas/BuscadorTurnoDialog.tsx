import React, { useState, useContext } from 'react';
import {
  Dialog,
  DialogContent,
  Box,
  Autocomplete,
  TextField,
  Button,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Menu,
  MenuItem,
  Checkbox,
  ListItemText,
  IconButton,
  Tooltip,
  Typography,
  Tabs,
  Tab,
  Card,
  CardContent,
  Grid,
  Divider,
  Chip,
} from '@mui/material';
import { ContextoGeneral } from '../Contexto';
// import { useAuth } from '../autenticacion/ContextoAuth';
import TurnoGridRow from './cupos/tabsCupos/TurnoGridRow';
import { exportarCSV, exportarPDF, exportarImagen } from '../../utils/exportUtils';
import { AnalisisDescargas } from './AnalisisDescargas';
import { ModoLiquidacion } from './ModoLiquidacion';
import { MaestroAtributosTurnos } from '../turnos/MaestroAtributosTurnos';
import { DatosExtraTable } from '../turnos/DatosExtraTable';
import ViewColumnIcon from '@mui/icons-material/ViewColumn';
import SaveAltIcon from '@mui/icons-material/SaveAlt';
import ImageIcon from '@mui/icons-material/Image';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import ReceiptIcon from '@mui/icons-material/Receipt';
import InfoIcon from '@mui/icons-material/Info';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import DescriptionIcon from '@mui/icons-material/Description';
import { ESTADO_PERMISOS } from '../../utils/turnoEstadoPermisos';
import { getContratosComerciales } from '../../lib/contratos-comerciales-api';
import { ContratoComercial } from '../../types/contratosComerciales';

interface BuscadorTurnoDialogProps {
  open: boolean;
  onClose: () => void;
}

const criterioBusqueda = [
  { label: 'CTG', value: 'ctg' },
  { label: 'Estado', value: 'estado' },
];

const fields = [
  "estado.nombre",
  "colaborador.nombre",
  "colaborador.apellido",
  "colaborador.cuil",
  "empresa.razonSocial",
  "empresa.cuit",
  "camion.patente",
  "acoplado.patente",
  "acopladoExtra.patente",
  "kgTara",
  "kgBruto",
  "kgNeto",
  "kgDescargados",
  "precioGrano",
  "factura",
  "numeroOrdenPago",
  "cartaDePorte.numeroCartaPorte",
  "cartaDePorte.CTG"
];

const headerNames = [
  "Estado",
  "Nombre",
  "Apellido",
  "CUIL Chofer",
  "Razon Social",
  "CUIT Empresa",
  "Patente Camión",
  "Patente Acoplado",
  "Patente Acoplado Extra",
  "Kg Tara",
  "Kg Bruto",
  "Kg Neto",
  "Kg Descargados",
  "Precio Grano",
  "Factura",
  "N° Orden Pago",
  "Carta de Porte",
  "CTG"
];

const columnasPorDefecto = [
  "estado.nombre",
  "colaborador.nombre",
  "colaborador.apellido",
  "colaborador.cuil",
  "empresa.razonSocial",
  "empresa.cuit",
  "camion.patente",
  "acoplado.patente",
  "acopladoExtra.patente",
  "cartaDePorte.CTG"
];

export const BuscadorTurnoDialog: React.FC<BuscadorTurnoDialogProps> = ({ open, onClose }) => {
  const { backendURL, theme } = useContext(ContextoGeneral);
  
  const [criterioSeleccionado, setCriterioSeleccionado] = useState<{ label: string; value: string } | null>(null);
  const [valorBusqueda, setValorBusqueda] = useState<string>('');
  const [estadoSeleccionado, setEstadoSeleccionado] = useState<{ id: number; nombre: string } | null>(null);
  const [turnos, setTurnos] = useState<any[]>([]);
  const [turnosCompletos, setTurnosCompletos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingCompletos, setLoadingCompletos] = useState(false);
  const [searched, setSearched] = useState(false);
  const [modoLiquidacion, setModoLiquidacion] = useState(false);
  
  // Estados para columnas y exportación (reutilizados del grid)
  const [selectedColumns, setSelectedColumns] = useState<string[]>(columnasPorDefecto);
  const [anchorElColumns, setAnchorElColumns] = useState<null | HTMLElement>(null);
  const [anchorElExport, setAnchorElExport] = useState<null | HTMLElement>(null);
  
  // Estado para tabs
  const [activeTab, setActiveTab] = useState(0);
  
  // Nuevos estados para carga y contrato
  const [cargaInfo, setCargaInfo] = useState<any>(null);
  const [contratoInfo, setContratoInfo] = useState<ContratoComercial | null>(null);
  const [loadingExtra, setLoadingExtra] = useState(false);

  // Estilos para azul en focus
  const azulStyles = {
    '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: theme.colores.azul,
    },
    '& .MuiInputLabel-root.Mui-focused': {
      color: theme.colores.azul,
    },
  };

  // Función para obtener información de la carga
  const obtenerInfoCarga = async (idCarga: number) => {
    try {
      const response = await fetch(`${backendURL}/cargas/kgDescargadosTotales/${idCarga}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
      });

      if (response.ok) {
        const data = await response.json();
        return data.carga;
      }
      return null;
    } catch (error) {
      console.error('Error obteniendo información de carga:', error);
      return null;
    }
  };

  // Función para buscar carga por número de carta de porte
  const buscarCargaPorCartaPorte = async (numeroCartaPorte: number) => {
    try {
      const response = await fetch(`${backendURL}/cargas`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
      });

      if (response.ok) {
        const cargas = await response.json();
        const cargaEncontrada = cargas.find((c: any) => c.numeroCartaPorte === numeroCartaPorte);
        return cargaEncontrada || null;
      }
      return null;
    } catch (error) {
      console.error('Error buscando carga por carta de porte:', error);
      return null;
    }
  };

  // Función para obtener el contrato asociado a una carga
  const obtenerContratoAsociado = async (idCarga: number) => {
    try {
      const contratos = await getContratosComerciales();
      const contratoEncontrado = contratos.find(
        (contrato) => contrato.cargasIds && contrato.cargasIds.includes(idCarga)
      );
      return contratoEncontrado || null;
    } catch (error) {
      console.error('Error obteniendo contrato asociado:', error);
      return null;
    }
  };

  const handleBuscar = async () => {
    if (!criterioSeleccionado) return;

    setLoading(true);
    setSearched(false);
    
    try {
      let url = `${backendURL}/turnos?`;
      
      if (criterioSeleccionado.value === 'ctg') {
        if (!valorBusqueda.trim()) {
          alert('Por favor ingrese un CTG');
          setLoading(false);
          return;
        }
        url += `ctg=${encodeURIComponent(valorBusqueda.trim())}`;
      } else if (criterioSeleccionado.value === 'estado') {
        if (!estadoSeleccionado) {
          alert('Por favor seleccione un estado');
          setLoading(false);
          return;
        }
        url += `estado=${encodeURIComponent(estadoSeleccionado.nombre.toLowerCase())}`;
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
      });

      if (!response.ok) {
        throw new Error('Error al buscar turnos');
      }

      const data = await response.json();
      
      // Manejar diferentes formatos de respuesta
      let turnosData = [];
      if (Array.isArray(data)) {
        turnosData = data;
      } else if (data.turnos && Array.isArray(data.turnos)) {
        turnosData = data.turnos;
      } else if (data.data && Array.isArray(data.data)) {
        turnosData = data.data;
      } else if (typeof data === 'object' && data !== null) {
        // Si es un solo objeto, convertirlo en array
        turnosData = [data];
      }
      
      // Normalizar los datos de turnos - aplanar la estructura turnoInfo
      const turnosNormalizados = turnosData.map((turno: any) => {
        // Si el turno tiene turnoInfo, aplanar esa estructura
        if (turno.turnoInfo) {
          return {
            ...turno.turnoInfo,
            // Mantener algunos campos del nivel raíz si existen
            carga: turno.carga,
            // Normalizar campos que pueden ser strings
            camion: typeof turno.turnoInfo.camion === "string" ? { patente: turno.turnoInfo.camion } : turno.turnoInfo.camion,
            acoplado: typeof turno.turnoInfo.acoplado === "string" ? { patente: turno.turnoInfo.acoplado } : turno.turnoInfo.acoplado,
            acopladoExtra: typeof turno.turnoInfo.acopladoExtra === "string" ? { patente: turno.turnoInfo.acopladoExtra } : turno.turnoInfo.acopladoExtra,
          };
        }
        // Si no tiene turnoInfo, mantener la estructura original
        return {
          ...turno,
          camion: typeof turno.camion === "string" ? { patente: turno.camion } : turno.camion,
          acoplado: typeof turno.acoplado === "string" ? { patente: turno.acoplado } : turno.acoplado,
          acopladoExtra: typeof turno.acopladoExtra === "string" ? { patente: turno.acopladoExtra } : turno.acopladoExtra,
        };
      });

      // Eliminar duplicados basándose en el ID del turno
      // Si no hay ID, usar una combinación de campos únicos para identificar duplicados
      const turnosUnicos = turnosNormalizados.filter((turno: any, index: number, self: any[]) => {
        if (turno.id) {
          // Si tiene ID, usar el ID para identificar duplicados
          return index === self.findIndex((t: any) => t.id === turno.id);
        } else {
          // Si no tiene ID, usar una combinación de campos para identificar duplicados
          const camposUnicos = `${turno.colaborador?.cuil || ''}-${turno.empresa?.cuit || ''}-${turno.camion?.patente || ''}-${turno.acoplado?.patente || ''}-${turno.estado?.nombre || ''}`;
          return index === self.findIndex((t: any) => {
            if (t.id) return false; // Si el otro tiene ID, no es duplicado
            const otrosCamposUnicos = `${t.colaborador?.cuil || ''}-${t.empresa?.cuit || ''}-${t.camion?.patente || ''}-${t.acoplado?.patente || ''}-${t.estado?.nombre || ''}`;
            return otrosCamposUnicos === camposUnicos;
          });
        }
      });

      // Fallback: Si aún hay duplicados, usar un método más simple
      const turnosFinales = turnosUnicos.length > 0 ? turnosUnicos : turnosNormalizados;

      setTurnos(turnosFinales);
      setSearched(true);
      
      // Si busca por CTG y hay un solo turno, obtener información de carga y contrato
      if (criterioSeleccionado.value === 'ctg' && turnosFinales.length === 1) {
        setLoadingExtra(true);
        try {
          const turno = turnosFinales[0];
          
          // Obtener el ID de la carga del turno
          let idCarga: number | null = null;
          let carga: any = null;
          
          // Intentar obtener el ID de la carga desde diferentes ubicaciones posibles
          if (turno.carga?.id) {
            idCarga = turno.carga.id;
          } else if (turno.idCarga) {
            idCarga = turno.idCarga;
          } else if (typeof turno.carga === 'number') {
            idCarga = turno.carga;
          }
          
          // Si encontramos el ID de la carga, obtener su información
          if (idCarga) {
            carga = await obtenerInfoCarga(idCarga);
          } else {
            // Si no hay ID directo, intentar buscar por número de carta de porte
            const numeroCartaPorte = turno.cartaDePorte?.[0]?.numeroCartaPorte;
            if (numeroCartaPorte) {
              carga = await buscarCargaPorCartaPorte(numeroCartaPorte);
              if (carga) {
                idCarga = carga.id;
              }
            }
          }
          
          if (carga && idCarga) {
            setCargaInfo(carga);
            
            // Obtener contrato asociado
            const contrato = await obtenerContratoAsociado(idCarga);
            setContratoInfo(contrato);
          } else {
            setCargaInfo(null);
            setContratoInfo(null);
          }
        } catch (error) {
          console.error('Error obteniendo información extra:', error);
          setCargaInfo(null);
          setContratoInfo(null);
        } finally {
          setLoadingExtra(false);
        }
      } else {
        // Si no es búsqueda por CTG o hay múltiples turnos, limpiar la info extra
        setCargaInfo(null);
        setContratoInfo(null);
      }
      
      // Si el estado es "Facturado", obtener datos completos de cada turno
      if (estadoSeleccionado?.nombre.toLowerCase() === 'facturado') {
        setLoadingCompletos(true);
        try {
          const turnosCompletosData = await Promise.all(
            turnosFinales.map(async (turno: any) => {
              try {
                const res = await fetch(`${backendURL}/turnos/${turno.id}`, {
                  method: 'GET',
                  headers: {
                    'Content-Type': 'application/json',
                    'ngrok-skip-browser-warning': 'true',
                  },
                });
                if (res.ok) {
                  return await res.json();
                }
                return turno;
              } catch (err) {
                console.error('Error obteniendo turno completo:', err);
                return turno;
              }
            })
          );
          setTurnosCompletos(turnosCompletosData);
        } catch (err) {
          console.error('Error obteniendo turnos completos:', err);
          setTurnosCompletos([]);
        } finally {
          setLoadingCompletos(false);
        }
      } else {
        setTurnosCompletos([]);
      }
    } catch (error) {
      console.error('Error buscando turnos:', error);
      alert('Error al buscar turnos');
      setTurnos([]);
      setSearched(true);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setCriterioSeleccionado(null);
    setValorBusqueda('');
    setEstadoSeleccionado(null);
    setTurnos([]);
    setTurnosCompletos([]);
    setSearched(false);
    setModoLiquidacion(false);
    setCargaInfo(null);
    setContratoInfo(null);
  };

  const handleCloseDialog = () => {
    handleReset();
    onClose();
  };

  const handleToggleColumn = (column: string) => {
    setSelectedColumns((prev) =>
      prev.includes(column) ? prev.filter((c) => c !== column) : [...prev, column]
    );
  };

  const handleExport = async (formato: 'csv' | 'pdf' | 'imagen') => {
    const exportFields = selectedColumns;
    const exportHeaders = exportFields.map(f => headerNames[fields.indexOf(f)]);
    
    if (formato === 'csv') {
      exportarCSV(exportHeaders, turnos, exportFields, 'turnos_busqueda');
    }
    
    if (formato === 'pdf') {
      exportarPDF(exportHeaders, turnos, exportFields, 'turnos_busqueda', null);
    }
    
    if (formato === 'imagen') {
      exportarImagen(exportHeaders, turnos, exportFields, 'turnos_busqueda', null);
    }
    
    setAnchorElExport(null);
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleCloseDialog} 
      maxWidth="xl" 
      fullWidth
      PaperProps={{
        sx: {
          minHeight: '80vh',
          maxHeight: '90vh',
        }
      }}
    >
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        borderBottom: '1px solid #e0e0e0',
        px: 3,
        py: 2
      }}>
        <Typography variant="h6" sx={{ color: theme.colores.azul, fontWeight: 600 }}>
          Turbo-turno
        </Typography>
        <IconButton onClick={handleCloseDialog} size="small">
          <CloseIcon />
        </IconButton>
      </Box>
      
      <DialogContent sx={{ pt: 0 }}>
        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={activeTab} 
            onChange={(_, newValue) => setActiveTab(newValue)}
            sx={{
              '& .MuiTab-root': {
                color: `${theme.colores.azul} !important`,
                fontWeight: 500,
                textTransform: 'none',
                fontSize: '0.95rem',
                transition: 'all 0.3s ease',
                '&:hover': {
                  color: `${theme.colores.azul} !important`,
                  backgroundColor: `${theme.colores.azul}15`,
                },
              },
              '& .Mui-selected': {
                color: `${theme.colores.azul} !important`,
                fontWeight: 700,
                backgroundColor: `${theme.colores.azul}20`,
                borderBottom: `2px solid ${theme.colores.azul}`,
              },
              '& .MuiTabs-indicator': {
                backgroundColor: theme.colores.azul,
                height: 4,
              },
            }}
          >
            <Tab label="Buscador" />
            <Tab label="Análisis de descargas" />
            <Tab label="Maestro de turnos" />
            <Tab label="Datos extra turnos" />
          </Tabs>
        </Box>

        {/* Contenido de las tabs */}
        {activeTab === 0 && (
          <Box sx={{ pt: 3 }}>
            {/* Formulario de búsqueda */}
            <Box sx={{ 
              display: 'flex', 
              gap: 2, 
              mb: 3, 
              alignItems: 'flex-start',
              flexWrap: 'wrap'
            }}>
          <Box sx={{ minWidth: 200, flex: '1 1 200px', mt: 1 }}>
            <Autocomplete
              options={criterioBusqueda}
              value={criterioSeleccionado}
              onChange={(_, newValue) => {
                setCriterioSeleccionado(newValue);
                setValorBusqueda('');
                setEstadoSeleccionado(null);
                setTurnos([]);
                setSearched(false);
              }}
              sx={{
                '& .MuiAutocomplete-option': { fontWeight: 400 },
                '& .Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: theme.colores.azul },
                '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: theme.colores.azul },
              }}
              renderInput={(params) => (
                <TextField 
                  {...params} 
                  label="Buscar por" 
                  size="small"
                  sx={azulStyles}
                />
              )}
              isOptionEqualToValue={(option, value) => option.value === value.value}
            />
          </Box>

          {criterioSeleccionado?.value === 'ctg' && (
            <Box sx={{ minWidth: 250, flex: '1 1 250px', mt: 1 }}>
              <TextField
                fullWidth
                size="small"
                label="Ingrese CTG"
                value={valorBusqueda}
                onChange={(e) => setValorBusqueda(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleBuscar();
                  }
                }}
                sx={azulStyles}
              />
            </Box>
          )}

          {criterioSeleccionado?.value === 'estado' && (
            <Box sx={{ minWidth: 250, flex: '1 1 250px', mt: 1 }}>
              <Autocomplete
                options={ESTADO_PERMISOS}
                value={estadoSeleccionado}
                onChange={(_, newValue) => setEstadoSeleccionado(newValue)}
                getOptionLabel={(option) => option.nombre}
                sx={{
                  '& .MuiAutocomplete-option': { fontWeight: 400 },
                  '& .Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: theme.colores.azul },
                  '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: theme.colores.azul },
                }}
                renderInput={(params) => (
                  <TextField 
                    {...params} 
                    label="Seleccione estado" 
                    size="small"
                    sx={azulStyles}
                  />
                )}
                isOptionEqualToValue={(option, value) => option.id === value.id}
              />
            </Box>
          )}

          <Button
            variant="contained"
            onClick={handleBuscar}
            disabled={!criterioSeleccionado || loading}
            startIcon={loading ? <CircularProgress size={20} /> : <SearchIcon />}
            sx={{
              mt: 1,
              backgroundColor: theme.colores.azul,
              '&:hover': {
                backgroundColor: theme.colores.azulOscuro || '#163660'
              }
            }}
          >
            {loading ? 'Buscando...' : 'Buscar'}
          </Button>

          {searched && (
            <Button
              variant="outlined"
              onClick={handleReset}
              sx={{
                mt: 1,
                borderColor: theme.colores.azul,
                color: theme.colores.azul,
                '&:hover': {
                  borderColor: theme.colores.azulOscuro || '#163660',
                  backgroundColor: 'transparent'
                }
              }}
            >
              Limpiar
            </Button>
          )}
        </Box>

            {/* Información adicional de Carga y Contrato */}
            {searched && criterioSeleccionado?.value === 'ctg' && turnos.length === 1 && (
              <Box sx={{ mb: 3 }}>
                {loadingExtra ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                    <CircularProgress size={30} sx={{ color: theme.colores.azul }} />
                  </Box>
                ) : (
                  <Grid container spacing={2}>
                    {/* Tarjeta de información de la Carga */}
                    {cargaInfo && (
                      <Grid item xs={12} md={6}>
                        <Card sx={{ 
                          border: `1px solid ${theme.colores.azul}30`,
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                        }}>
                          <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                              <LocalShippingIcon sx={{ color: theme.colores.azul, mr: 1 }} />
                              <Typography variant="h6" sx={{ color: theme.colores.azul, fontWeight: 600 }}>
                                Información de la Carga
                              </Typography>
                            </Box>
                            <Divider sx={{ mb: 2 }} />
                            <Grid container spacing={1.5}>
                              <Grid item xs={12}>
                                <Typography variant="body2" color="textSecondary">
                                  <strong>Carta de Porte:</strong> {cargaInfo.numeroCartaPorte || 'N/A'}
                                </Typography>
                              </Grid>
                              <Grid item xs={12}>
                                <Typography variant="body2" color="textSecondary">
                                  <strong>Fecha:</strong> {cargaInfo.fecha ? new Date(cargaInfo.fecha).toLocaleDateString() : 'N/A'}
                                </Typography>
                              </Grid>
                              <Grid item xs={12}>
                                <Typography variant="body2" color="textSecondary">
                                  <strong>Titular:</strong> {cargaInfo.titularCartaDePorte?.razonSocial || 'N/A'}
                                </Typography>
                              </Grid>
                              <Grid item xs={12}>
                                <Typography variant="body2" color="textSecondary">
                                  <strong>Destinatario:</strong> {cargaInfo.destinatario?.razonSocial || 'N/A'}
                                </Typography>
                              </Grid>
                              <Grid item xs={6}>
                                <Typography variant="body2" color="textSecondary">
                                  <strong>Kg Neto:</strong> {cargaInfo.kgNeto?.toLocaleString() || 'N/A'}
                                </Typography>
                              </Grid>
                              <Grid item xs={6}>
                                <Typography variant="body2" color="textSecondary">
                                  <strong>Cultivo:</strong> {cargaInfo.cargamento?.nombre || 'N/A'}
                                </Typography>
                              </Grid>
                              {cargaInfo.ubicacionCarga && (
                                <Grid item xs={12}>
                                  <Typography variant="body2" color="textSecondary">
                                    <strong>Origen:</strong> {cargaInfo.ubicacionCarga.nombre || 'N/A'}
                                  </Typography>
                                </Grid>
                              )}
                              {cargaInfo.ubicacionDescarga && (
                                <Grid item xs={12}>
                                  <Typography variant="body2" color="textSecondary">
                                    <strong>Destino:</strong> {cargaInfo.ubicacionDescarga.nombre || 'N/A'}
                                  </Typography>
                                </Grid>
                              )}
                              {cargaInfo.estado && (
                                <Grid item xs={12}>
                                  <Chip 
                                    label={cargaInfo.estado.nombre || cargaInfo.estado} 
                                    size="small"
                                    sx={{ 
                                      backgroundColor: `${theme.colores.azul}20`,
                                      color: theme.colores.azul,
                                      fontWeight: 600
                                    }}
                                  />
                                </Grid>
                              )}
                            </Grid>
                          </CardContent>
                        </Card>
                      </Grid>
                    )}

                    {/* Tarjeta de información del Contrato */}
                    {contratoInfo && (
                      <Grid item xs={12} md={6}>
                        <Card sx={{ 
                          border: `1px solid ${theme.colores.azul}30`,
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                        }}>
                          <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                              <DescriptionIcon sx={{ color: theme.colores.azul, mr: 1 }} />
                              <Typography variant="h6" sx={{ color: theme.colores.azul, fontWeight: 600 }}>
                                Contrato Comercial
                              </Typography>
                            </Box>
                            <Divider sx={{ mb: 2 }} />
                            <Grid container spacing={1.5}>
                              <Grid item xs={12}>
                                <Typography variant="body2" color="textSecondary">
                                  <strong>Número:</strong> {contratoInfo.numeroContrato || 'N/A'}
                                </Typography>
                              </Grid>
                              <Grid item xs={12}>
                                <Typography variant="body2" color="textSecondary">
                                  <strong>Productor:</strong> {contratoInfo.productorNombre || 'N/A'}
                                </Typography>
                              </Grid>
                              <Grid item xs={12}>
                                <Typography variant="body2" color="textSecondary">
                                  <strong>Exportador:</strong> {contratoInfo.exportadorNombre || 'N/A'}
                                </Typography>
                              </Grid>
                              <Grid item xs={12}>
                                <Typography variant="body2" color="textSecondary">
                                  <strong>Tipo de Grano:</strong> {contratoInfo.tipoGranoNombre || 'N/A'}
                                </Typography>
                              </Grid>
                              <Grid item xs={6}>
                                <Typography variant="body2" color="textSecondary">
                                  <strong>Cantidad Total:</strong> {contratoInfo.cantidadTotalKg?.toLocaleString() || 'N/A'} kg
                                </Typography>
                              </Grid>
                              <Grid item xs={6}>
                                <Typography variant="body2" color="textSecondary">
                                  <strong>Precio/Kg:</strong> {contratoInfo.moneda} {contratoInfo.precioPorKg?.toFixed(2) || 'N/A'}
                                </Typography>
                              </Grid>
                              <Grid item xs={12}>
                                <Typography variant="body2" color="textSecondary">
                                  <strong>Fecha Inicio:</strong> {contratoInfo.fechaInicioEntrega ? new Date(contratoInfo.fechaInicioEntrega).toLocaleDateString() : 'N/A'}
                                </Typography>
                              </Grid>
                              <Grid item xs={12}>
                                <Typography variant="body2" color="textSecondary">
                                  <strong>Fecha Fin:</strong> {contratoInfo.fechaFinEntrega ? new Date(contratoInfo.fechaFinEntrega).toLocaleDateString() : 'N/A'}
                                </Typography>
                              </Grid>
                              <Grid item xs={12}>
                                <Chip 
                                  label={contratoInfo.estado.toUpperCase()} 
                                  size="small"
                                  sx={{ 
                                    backgroundColor: 
                                      contratoInfo.estado === 'activo' ? '#4caf5020' :
                                      contratoInfo.estado === 'cumplido' ? '#2196f320' :
                                      contratoInfo.estado === 'cancelado' ? '#f4433620' :
                                      '#ff980020',
                                    color: 
                                      contratoInfo.estado === 'activo' ? '#4caf50' :
                                      contratoInfo.estado === 'cumplido' ? '#2196f3' :
                                      contratoInfo.estado === 'cancelado' ? '#f44336' :
                                      '#ff9800',
                                    fontWeight: 600
                                  }}
                                />
                              </Grid>
                            </Grid>
                          </CardContent>
                        </Card>
                      </Grid>
                    )}

                    {/* Mensaje si no hay información de carga o contrato */}
                    {!cargaInfo && !contratoInfo && !loadingExtra && (
                      <Grid item xs={12}>
                        <Card sx={{ 
                          border: `1px solid ${theme.colores.gris}30`,
                          backgroundColor: '#f5f5f5'
                        }}>
                          <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 2 }}>
                              <InfoIcon sx={{ color: theme.colores.gris, mr: 1 }} />
                              <Typography variant="body2" color="textSecondary">
                                No se encontró información adicional de carga o contrato para este turno
                              </Typography>
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>
                    )}
                  </Grid>
                )}
              </Box>
            )}

            {/* Resultados */}
            {searched && (
              <>
                {turnos.length === 0 ? (
                  <Box sx={{ 
                    textAlign: 'center', 
                    py: 8,
                    color: theme.colores.gris || '#666'
                  }}>
                    <Typography variant="h6">
                      No se encontraron turnos
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      Intente con otros criterios de búsqueda
                    </Typography>
                  </Box>
                ) : (
                  <Box>
                    {/* Barra de herramientas (igual que en el grid) */}
                    <Box sx={{ 
                      display: 'flex', 
                      gap: 1, 
                      mb: 2,
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <Typography variant="body2" sx={{ color: theme.colores.gris }}>
                        {turnos.length} turno{turnos.length !== 1 ? 's' : ''} encontrado{turnos.length !== 1 ? 's' : ''}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        {estadoSeleccionado?.nombre.toLowerCase() === 'facturado' && (
                          <Tooltip title={modoLiquidacion ? "Vista Normal" : "Modo Liquidación"}>
                            <IconButton
                              size="small"
                              onClick={() => setModoLiquidacion(!modoLiquidacion)}
                              sx={{ 
                                color: modoLiquidacion ? '#fff' : theme.colores.azul,
                                backgroundColor: modoLiquidacion ? theme.colores.azul : 'transparent',
                                '&:hover': {
                                  backgroundColor: modoLiquidacion ? theme.colores.azulOscuro || '#163660' : `${theme.colores.azul}20`,
                                }
                              }}
                            >
                              <ReceiptIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                        {!modoLiquidacion && (
                          <>
                            <Tooltip title="Filtrar columnas">
                              <IconButton
                                size="small"
                                onClick={(e) => setAnchorElColumns(e.currentTarget)}
                                sx={{ color: theme.colores.azul }}
                              >
                                <ViewColumnIcon />
                              </IconButton>
                            </Tooltip>
                            
                            <Tooltip title="Exportar">
                              <IconButton
                                size="small"
                                onClick={(e) => setAnchorElExport(e.currentTarget)}
                                sx={{ color: theme.colores.azul }}
                              >
                                <SaveAltIcon />
                              </IconButton>
                            </Tooltip>
                          </>
                        )}
                      </Box>
                    </Box>

                    {/* Menú de columnas */}
                    <Menu
                      anchorEl={anchorElColumns}
                      open={Boolean(anchorElColumns)}
                      onClose={() => setAnchorElColumns(null)}
                    >
                      {fields.map((field, idx) => (
                        <MenuItem key={field} onClick={() => handleToggleColumn(field)}>
                          <Checkbox 
                            checked={selectedColumns.includes(field)}
                            sx={{
                              color: theme.colores.azul,
                              '&.Mui-checked': {
                                color: theme.colores.azul,
                              },
                            }}
                          />
                          <ListItemText primary={headerNames[idx]} />
                        </MenuItem>
                      ))}
                    </Menu>

                    {/* Menú de exportación */}
                    <Menu
                      anchorEl={anchorElExport}
                      open={Boolean(anchorElExport)}
                      onClose={() => setAnchorElExport(null)}
                    >
                      <MenuItem onClick={() => handleExport('csv')}>
                        <SaveAltIcon sx={{ mr: 1 }} /> Exportar CSV
                      </MenuItem>
                      <MenuItem onClick={() => handleExport('pdf')}>
                        <SaveAltIcon sx={{ mr: 1 }} /> Exportar PDF
                      </MenuItem>
                      <MenuItem onClick={() => handleExport('imagen')}>
                        <ImageIcon sx={{ mr: 1 }} /> Exportar Imagen
                      </MenuItem>
                    </Menu>

                    {/* Grid de turnos o Modo Liquidación */}
                    {modoLiquidacion ? (
                      <ModoLiquidacion 
                        turnos={turnosCompletos.length > 0 ? turnosCompletos : turnos} 
                        loading={loadingCompletos}
                      />
                    ) : (
                      <Box sx={{ width: '100%', maxWidth: '90vw', overflowX: 'auto' }}>
                        <TableContainer component={Paper}>
                          <Table>
                            <TableHead>
                              <TableRow>
                                {selectedColumns.map((field) => (
                                  <TableCell key={field}>{headerNames[fields.indexOf(field)]}</TableCell>
                                ))}
                                <TableCell>Acciones</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {turnos.map((turno, index) => (
                                <TurnoGridRow
                                  key={turno.id || `turno-${index}`}
                                  turno={turno}
                                  cupo={{ carga: turno.carga }}
                                  refreshCupos={() => handleBuscar()}
                                  fields={selectedColumns}
                                />
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </Box>
                    )}
                  </Box>
                )}
              </>
            )}
          </Box>
        )}

        {/* Tab de Análisis de descargas */}
        {activeTab === 1 && (
          <AnalisisDescargas />
        )}

        {/* Tab de Maestro de turnos */}
        {activeTab === 2 && (
          <MaestroAtributosTurnos />
        )}

        {/* Tab de Datos extra turnos */}
        {activeTab === 3 && (
          <DatosExtraTable />
        )}
      </DialogContent>
    </Dialog>
  );
};

