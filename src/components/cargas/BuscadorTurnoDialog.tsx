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
  const [contratoInfo, setContratoInfo] = useState<any>(null);
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

  // Función para obtener información de la carga usando el endpoint estándar
  const obtenerInfoCarga = async (idCarga: number) => {
    try {
      // Primero intentar con el endpoint estándar
      const response = await fetch(`${backendURL}/cargas/${idCarga}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
      });

      if (response.ok) {
        const carga = await response.json();
        return carga;
      }
      
      // Si falla, intentar con el endpoint de kgDescargadosTotales
      const response2 = await fetch(`${backendURL}/cargas/kgDescargadosTotales/${idCarga}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
      });

      if (response2.ok) {
        const data = await response2.json();
        return data.carga || data;
      }
      return null;
    } catch (error) {
      console.error('Error obteniendo información de carga:', error);
      return null;
    }
  };

  // Función para buscar la carga que contiene este turno
  // La relación es: Turno → Cupo → Carga
  const buscarCargaPorTurnoId = async (turnoId: string) => {
    try {
      // Obtener todas las cargas
      const responseCargas = await fetch(`${backendURL}/cargas`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
      });

      if (!responseCargas.ok) {
        return null;
      }

      const cargas = await responseCargas.json();

      // Para cada carga, buscar en sus cupos si contiene este turno
      for (const carga of cargas) {
        try {
          // Obtener los cupos de esta carga
          const responseCupos = await fetch(`${backendURL}/cargas/${carga.id}/cupos`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'ngrok-skip-browser-warning': 'true',
            },
          });

          if (responseCupos.ok) {
            const cupos = await responseCupos.json();

            // Buscar el turno en los cupos
            for (const cupo of cupos) {
              // Buscar en turnos normales
              if (Array.isArray(cupo.turnos)) {
                const turnoEncontrado = cupo.turnos.find((t: any) => t.id === turnoId);
                if (turnoEncontrado) {
                  return carga;
                }
              }

              // Buscar en turnos con errores
              if (Array.isArray(cupo.turnosConErrores)) {
                const turnoEncontrado = cupo.turnosConErrores.find((t: any) => t.id === turnoId);
                if (turnoEncontrado) {
                  return carga;
                }
              }
            }
          }
        } catch (err) {
          // Continuar con la siguiente carga
        }
      }

      return null;
    } catch (error) {
      console.error('Error buscando carga por turno ID:', error);
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
          
          // Paso 1: Obtener el turno completo (puede tener más información)
          let turnoCompleto = turno;
          if (turno.id) {
            try {
              const turnoRes = await fetch(`${backendURL}/turnos/${turno.id}`, {
                method: 'GET',
                headers: {
                  'Content-Type': 'application/json',
                  'ngrok-skip-browser-warning': 'true',
                },
              });
              if (turnoRes.ok) {
                turnoCompleto = await turnoRes.json();
              }
            } catch (err) {
              console.error('Error obteniendo turno completo:', err);
            }
          }
          
          // Paso 2: Intentar obtener la carga
          let carga: any = null;
          let idCarga: number | null = null;
          
          // Método 1: Desde el turno completo
          if (turnoCompleto.carga?.id) {
            idCarga = turnoCompleto.carga.id;
          } else if (turnoCompleto.idCarga) {
            idCarga = turnoCompleto.idCarga;
          } else if (typeof turnoCompleto.carga === 'number') {
            idCarga = turnoCompleto.carga;
          }
          
          // Método 2: Buscar la carga que contiene este turno (Turno → Cupo → Carga)
          if (!idCarga && turnoCompleto.id) {
            carga = await buscarCargaPorTurnoId(turnoCompleto.id);
            if (carga) {
              idCarga = carga.id;
            }
          }
          
          // Método 3: Si tenemos el ID, obtener la carga completa
          if (idCarga && !carga) {
            carga = await obtenerInfoCarga(idCarga);
          }
          
          // Paso 3: Si encontramos la carga, buscar el contrato
          if (carga && carga.id) {
            setCargaInfo(carga);
            
            // Buscar contrato en contratos comerciales
            const contratoComercial = await obtenerContratoAsociado(carga.id);
            
            // También buscar en contratos normales (como hace manejoTurnos.tsx)
            let contratoNormal = null;
            try {
              const contratosRes = await fetch(`${backendURL}/contratos`, {
                headers: { 'ngrok-skip-browser-warning': 'true' }
              });
              if (contratosRes.ok) {
                const contratos = await contratosRes.json();
                contratoNormal = contratos.find((c: any) => {
                  return Array.isArray(c.cargas) && c.cargas.some((car: any) => car.id === carga.id);
                });
              }
            } catch (err) {
              console.error('Error buscando contratos normales:', err);
            }
            
            // Priorizar contrato comercial, sino usar contrato normal
            setContratoInfo(contratoComercial || contratoNormal);
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
                                  <strong>ID:</strong> {cargaInfo.id || 'N/A'}
                                </Typography>
                              </Grid>
                              {cargaInfo.descripcion && (
                                <Grid item xs={12}>
                                  <Typography variant="body2" color="textSecondary">
                                    <strong>Descripción:</strong> {cargaInfo.descripcion}
                                  </Typography>
                                </Grid>
                              )}
                              {cargaInfo.cargamento && (
                                <Grid item xs={12}>
                                  <Typography variant="body2" color="textSecondary">
                                    <strong>Cultivo:</strong> {cargaInfo.cargamento.nombre || 'N/A'}
                                  </Typography>
                                </Grid>
                              )}
                              {cargaInfo.tipoTarifa && (
                                <Grid item xs={6}>
                                  <Typography variant="body2" color="textSecondary">
                                    <strong>Tarifa:</strong> ${cargaInfo.tarifa?.toLocaleString() || 'N/A'} / {cargaInfo.tipoTarifa.nombre || 'N/A'}
                                  </Typography>
                                </Grid>
                              )}
                              {cargaInfo.cantidadKm && (
                                <Grid item xs={6}>
                                  <Typography variant="body2" color="textSecondary">
                                    <strong>Distancia:</strong> {cargaInfo.cantidadKm} km
                                  </Typography>
                                </Grid>
                              )}
                              {cargaInfo.ubicacionCarga && (
                                <Grid item xs={12}>
                                  <Typography variant="body2" color="textSecondary">
                                    <strong>Origen:</strong> {cargaInfo.ubicacionCarga.nombre || 'N/A'}
                                    {cargaInfo.ubicacionCarga.localidad && (
                                      <span> - {cargaInfo.ubicacionCarga.localidad.nombre}</span>
                                    )}
                                    {cargaInfo.ubicacionCarga.localidad?.provincia && (
                                      <span>, {cargaInfo.ubicacionCarga.localidad.provincia.nombre}</span>
                                    )}
                                  </Typography>
                                </Grid>
                              )}
                              {cargaInfo.ubicacionDescarga && (
                                <Grid item xs={12}>
                                  <Typography variant="body2" color="textSecondary">
                                    <strong>Destino:</strong> {cargaInfo.ubicacionDescarga.nombre || 'N/A'}
                                    {cargaInfo.ubicacionDescarga.localidad && (
                                      <span> - {cargaInfo.ubicacionDescarga.localidad.nombre}</span>
                                    )}
                                    {cargaInfo.ubicacionDescarga.localidad?.provincia && (
                                      <span>, {cargaInfo.ubicacionDescarga.localidad.provincia.nombre}</span>
                                    )}
                                  </Typography>
                                </Grid>
                              )}
                              {cargaInfo.horaInicioCarga && cargaInfo.horaFinCarga && (
                                <Grid item xs={6}>
                                  <Typography variant="body2" color="textSecondary">
                                    <strong>Horario Carga:</strong> {cargaInfo.horaInicioCarga} - {cargaInfo.horaFinCarga}
                                  </Typography>
                                </Grid>
                              )}
                              {cargaInfo.horaInicioDescarga && cargaInfo.horaFinDescarga && (
                                <Grid item xs={6}>
                                  <Typography variant="body2" color="textSecondary">
                                    <strong>Horario Descarga:</strong> {cargaInfo.horaInicioDescarga} - {cargaInfo.horaFinDescarga}
                                  </Typography>
                                </Grid>
                              )}
                              {cargaInfo.tiposAcoplados && cargaInfo.tiposAcoplados.length > 0 && (
                                <Grid item xs={12}>
                                  <Typography variant="body2" color="textSecondary">
                                    <strong>Tipos de Acoplado:</strong> {cargaInfo.tiposAcoplados.map((t: any) => t.nombre).join(', ')}
                                  </Typography>
                                </Grid>
                              )}
                              {cargaInfo.tolerancia && (
                                <Grid item xs={12}>
                                  <Typography variant="body2" color="textSecondary">
                                    <strong>Tolerancia:</strong> {cargaInfo.tolerancia} kg
                                  </Typography>
                                </Grid>
                              )}
                              {cargaInfo.plantaProcedenciaRuca && (
                                <Grid item xs={12}>
                                  <Typography variant="body2" color="textSecondary">
                                    <strong>Planta Procedencia RUCA:</strong> {cargaInfo.plantaProcedenciaRuca}
                                  </Typography>
                                </Grid>
                              )}
                              {cargaInfo.destinoRuca && (
                                <Grid item xs={12}>
                                  <Typography variant="body2" color="textSecondary">
                                    <strong>Destino RUCA:</strong> {cargaInfo.destinoRuca}
                                  </Typography>
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
                                {contratoInfo.numeroContrato || contratoInfo.nombreContrato ? 'Contrato Comercial' : 'Contrato'}
                              </Typography>
                            </Box>
                            <Divider sx={{ mb: 2 }} />
                            <Grid container spacing={1.5}>
                              <Grid item xs={12}>
                                <Typography variant="body2" color="textSecondary">
                                  <strong>ID:</strong> {contratoInfo.id || 'N/A'}
                                </Typography>
                              </Grid>
                              {/* Campos para contratos normales (/contratos) */}
                              {contratoInfo.titularCartaDePorte && (
                                <Grid item xs={12}>
                                  <Typography variant="body2" color="textSecondary">
                                    <strong>Titular Carta de Porte:</strong> {contratoInfo.titularCartaDePorte.razonSocial || contratoInfo.titularCartaDePorte.nombreFantasia || 'N/A'}
                                    {contratoInfo.titularCartaDePorte.cuit && (
                                      <span> (CUIT: {contratoInfo.titularCartaDePorte.cuit})</span>
                                    )}
                                  </Typography>
                                </Grid>
                              )}
                              {contratoInfo.remitenteProductor && (
                                <Grid item xs={12}>
                                  <Typography variant="body2" color="textSecondary">
                                    <strong>Remitente Productor:</strong> {contratoInfo.remitenteProductor.razonSocial || contratoInfo.remitenteProductor.nombreFantasia || 'N/A'}
                                    {contratoInfo.remitenteProductor.cuit && (
                                      <span> (CUIT: {contratoInfo.remitenteProductor.cuit})</span>
                                    )}
                                  </Typography>
                                </Grid>
                              )}
                              {contratoInfo.remitenteVentaPrimaria && (
                                <Grid item xs={12}>
                                  <Typography variant="body2" color="textSecondary">
                                    <strong>Remitente Venta Primaria:</strong> {contratoInfo.remitenteVentaPrimaria.razonSocial || contratoInfo.remitenteVentaPrimaria.nombreFantasia || 'N/A'}
                                    {contratoInfo.remitenteVentaPrimaria.cuit && (
                                      <span> (CUIT: {contratoInfo.remitenteVentaPrimaria.cuit})</span>
                                    )}
                                  </Typography>
                                </Grid>
                              )}
                              {(contratoInfo.destinatario || contratoInfo.destinatarioNombre) && (
                                <Grid item xs={12}>
                                  <Typography variant="body2" color="textSecondary">
                                    <strong>Destinatario:</strong> {
                                      contratoInfo.destinatarioNombre || 
                                      contratoInfo.destinatario?.razonSocial || 
                                      contratoInfo.destinatario?.nombreFantasia || 
                                      'N/A'
                                    }
                                    {contratoInfo.destinatario?.cuit && (
                                      <span> (CUIT: {contratoInfo.destinatario.cuit})</span>
                                    )}
                                  </Typography>
                                </Grid>
                              )}
                              {contratoInfo.cargas && Array.isArray(contratoInfo.cargas) && contratoInfo.cargas.length > 0 && (
                                <Grid item xs={12}>
                                  <Typography variant="body2" color="textSecondary">
                                    <strong>Cargas asociadas:</strong> {contratoInfo.cargas.length}
                                    {contratoInfo.cargas[0].cargamento && (
                                      <span> - Cultivo: {contratoInfo.cargas[0].cargamento.nombre}</span>
                                    )}
                                  </Typography>
                                  {/* Mostrar destinatario desde la primera carga si existe */}
                                  {contratoInfo.cargas[0].destinatario && (
                                    <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5 }}>
                                      <strong>Destinatario (desde carga):</strong> {
                                        contratoInfo.cargas[0].destinatario.razonSocial || 
                                        contratoInfo.cargas[0].destinatario.nombreFantasia || 
                                        'N/A'
                                      }
                                    </Typography>
                                  )}
                                </Grid>
                              )}
                              {/* Campos para contratos comerciales (/contratos-comerciales) */}
                              {contratoInfo.numeroContrato && (
                                <Grid item xs={12}>
                                  <Typography variant="body2" color="textSecondary">
                                    <strong>Número Contrato:</strong> {contratoInfo.numeroContrato}
                                  </Typography>
                                </Grid>
                              )}
                              {contratoInfo.productorNombre && (
                                <Grid item xs={12}>
                                  <Typography variant="body2" color="textSecondary">
                                    <strong>Productor:</strong> {contratoInfo.productorNombre}
                                  </Typography>
                                </Grid>
                              )}
                              {contratoInfo.exportadorNombre && (
                                <Grid item xs={12}>
                                  <Typography variant="body2" color="textSecondary">
                                    <strong>Exportador:</strong> {contratoInfo.exportadorNombre}
                                  </Typography>
                                </Grid>
                              )}
                              {contratoInfo.tipoGranoNombre && (
                                <Grid item xs={12}>
                                  <Typography variant="body2" color="textSecondary">
                                    <strong>Tipo de Grano:</strong> {contratoInfo.tipoGranoNombre}
                                  </Typography>
                                </Grid>
                              )}
                              {contratoInfo.cantidadTotalKg && (
                                <Grid item xs={6}>
                                  <Typography variant="body2" color="textSecondary">
                                    <strong>Cantidad Total:</strong> {contratoInfo.cantidadTotalKg.toLocaleString()} kg
                                  </Typography>
                                </Grid>
                              )}
                              {contratoInfo.precioPorKg && (
                                <Grid item xs={6}>
                                  <Typography variant="body2" color="textSecondary">
                                    <strong>Precio/Kg:</strong> {contratoInfo.moneda || 'ARS'} {contratoInfo.precioPorKg.toFixed(2)}
                                  </Typography>
                                </Grid>
                              )}
                              {contratoInfo.fechaInicioEntrega && (
                                <Grid item xs={12}>
                                  <Typography variant="body2" color="textSecondary">
                                    <strong>Fecha Inicio:</strong> {new Date(contratoInfo.fechaInicioEntrega).toLocaleDateString()}
                                  </Typography>
                                </Grid>
                              )}
                              {contratoInfo.fechaFinEntrega && (
                                <Grid item xs={12}>
                                  <Typography variant="body2" color="textSecondary">
                                    <strong>Fecha Fin:</strong> {new Date(contratoInfo.fechaFinEntrega).toLocaleDateString()}
                                  </Typography>
                                </Grid>
                              )}
                              {contratoInfo.estado && (
                                <Grid item xs={12}>
                                  <Chip 
                                    label={typeof contratoInfo.estado === 'string' ? contratoInfo.estado.toUpperCase() : contratoInfo.estado.nombre?.toUpperCase() || 'N/A'} 
                                    size="small"
                                    sx={{ 
                                      backgroundColor: 
                                        (typeof contratoInfo.estado === 'string' ? contratoInfo.estado : contratoInfo.estado.nombre) === 'activo' ? '#4caf5020' :
                                        (typeof contratoInfo.estado === 'string' ? contratoInfo.estado : contratoInfo.estado.nombre) === 'cumplido' ? '#2196f320' :
                                        (typeof contratoInfo.estado === 'string' ? contratoInfo.estado : contratoInfo.estado.nombre) === 'cancelado' ? '#f4433620' :
                                        '#ff980020',
                                      color: 
                                        (typeof contratoInfo.estado === 'string' ? contratoInfo.estado : contratoInfo.estado.nombre) === 'activo' ? '#4caf50' :
                                        (typeof contratoInfo.estado === 'string' ? contratoInfo.estado : contratoInfo.estado.nombre) === 'cumplido' ? '#2196f3' :
                                        (typeof contratoInfo.estado === 'string' ? contratoInfo.estado : contratoInfo.estado.nombre) === 'cancelado' ? '#f44336' :
                                        '#ff9800',
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

