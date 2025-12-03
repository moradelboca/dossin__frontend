import React, { useState, useContext, useCallback } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Autocomplete,
  Chip,
  IconButton,
  Tooltip,
  Alert,
  LinearProgress,
  CircularProgress,
} from '@mui/material';
import {
  CloudUpload,
  Assessment,
  Download,
  Delete,
  CheckCircle,
} from '@mui/icons-material';
import { ContextoGeneral } from '../Contexto';
import { DescargaRegistro, PROVEEDORES_DESCARGA } from '../../types/descargas';
import { parseDescargasCsv } from '../../utils/descargas/parsers';
import { chunkArray, normalizeTurnosResponse, VALIDATION_CONFIG } from '../../utils/descargas/validation';
import { axiosGet } from '../../lib/axiosConfig';

interface AnalisisDescargasProps {
  onDataChange?: (data: DescargaRegistro[]) => void;
}

export const AnalisisDescargas: React.FC<AnalisisDescargasProps> = ({ onDataChange }) => {
  const { theme, backendURL } = useContext(ContextoGeneral);
  
  const [loading, setLoading] = useState(false);
  const [proveedorSeleccionado, setProveedorSeleccionado] = useState<typeof PROVEEDORES_DESCARGA[0] | null>(null);
  const [archivoCargado, setArchivoCargado] = useState<File | null>(null);
  const [datosProcesados, setDatosProcesados] = useState<DescargaRegistro[]>([]);
  const [error, setError] = useState<string>('');
  const [progreso, setProgreso] = useState(0);
  
  // Estados para validación de turnos
  const [validandoTurnos, setValidandoTurnos] = useState(false);
  const [turnosEncontrados, setTurnosEncontrados] = useState<any[]>([]);
  const [progresoValidacion, setProgresoValidacion] = useState(0);
  const [errorValidacion, setErrorValidacion] = useState<string>('');

  const handleFileUpload = useCallback(async (file: File) => {
    if (!proveedorSeleccionado) {
      setError('Por favor selecciona un proveedor primero');
      return;
    }

    setLoading(true);
    setError('');
    setProgreso(0);

    try {
      const contenido = await file.text();
      setProgreso(50);
      
      const datos = parseDescargasCsv(contenido, proveedorSeleccionado.nombre as 'Bunge' | 'AGD');
      
      setProgreso(100);
      setDatosProcesados(datos);
      setArchivoCargado(file);
      
      if (onDataChange) {
        onDataChange(datos);
      }
      
      if (datos.length === 0) {
        setError('No se encontraron datos válidos en el archivo');
      }
      
    } catch (error) {
      setError('Error al procesar el archivo: ' + (error as Error).message);
    } finally {
      setLoading(false);
      setProgreso(0);
    }
  }, [proveedorSeleccionado, onDataChange]);

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const files = Array.from(event.dataTransfer.files);
    const csvFile = files.find(file => file.name.toLowerCase().endsWith('.csv'));
    
    if (csvFile) {
      handleFileUpload(csvFile);
    } else {
      setError('Por favor selecciona un archivo CSV válido');
    }
  }, [handleFileUpload]);

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  }, [handleFileUpload]);

  const handleClearData = () => {
    setDatosProcesados([]);
    setArchivoCargado(null);
    setError('');
    setTurnosEncontrados([]);
    setErrorValidacion('');
  };

  const handleExportData = () => {
    if (datosProcesados.length === 0) return;
    
    const csvContent = [
      'Fecha,Grano,Número CTG,Kg Descargados,Proveedor',
      ...datosProcesados.map(d => 
        `${d.fecha},${d.grano},${d.numeroCTG},${d.kgDescargados},${d.proveedor}`
      )
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `descargas_${proveedorSeleccionado?.nombre}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleValidarTurnos = async () => {
    if (datosProcesados.length === 0) {
      setErrorValidacion('No hay datos para validar');
      return;
    }

    setValidandoTurnos(true);
    setErrorValidacion('');
    setTurnosEncontrados([]);
    setProgresoValidacion(0);

    try {
      // Obtener CTGs únicos del CSV
      const ctgsUnicos = [...new Set(datosProcesados.map(d => d.numeroCTG))];
      
      // Procesar en lotes de 10
      const lotes = chunkArray(ctgsUnicos, VALIDATION_CONFIG.BATCH_SIZE);
      const todosLosTurnos: any[] = [];

      for (let i = 0; i < lotes.length; i++) {
        const lote = lotes[i];
        
        // Hacer consultas en paralelo para cada CTG del lote
        const promesas = lote.map(async (ctg) => {
          try {
            const data = await axiosGet<any[]>(`turnos?estado=en%20viaje&ctg=${ctg}`, backendURL);
            const turnosData = normalizeTurnosResponse(data);

            return turnosData.map((turno: any) => ({
              ...turno,
              ctgBuscado: ctg,
            }));
          } catch (error) {
            console.error(`Error consultando CTG ${ctg}:`, error);
            return [];
          }
        });

        const resultadosLote = await Promise.all(promesas);
        todosLosTurnos.push(...resultadosLote.flat());

        // Actualizar progreso
        const progresoActual = Math.round(((i + 1) / lotes.length) * 100);
        setProgresoValidacion(progresoActual);

        // Esperar un poco entre lotes para no sobrecargar el sistema
        if (i < lotes.length - 1) {
          await new Promise(resolve => setTimeout(resolve, VALIDATION_CONFIG.BATCH_DELAY_MS));
        }
      }

      setTurnosEncontrados(todosLosTurnos);
      
      if (todosLosTurnos.length === 0) {
        setErrorValidacion('No se encontraron turnos en estado "en viaje" para los CTGs del CSV');
      }

    } catch (error) {
      setErrorValidacion('Error durante la validación: ' + (error as Error).message);
    } finally {
      setValidandoTurnos(false);
      setProgresoValidacion(0);
    }
  };

  // Calcular métricas
  const totalKg = datosProcesados.reduce((sum, d) => sum + d.kgDescargados, 0);
  const totalRegistros = datosProcesados.length;
  const promedioKg = totalRegistros > 0 ? totalKg / totalRegistros : 0;
  const granosUnicos = [...new Set(datosProcesados.map(d => d.grano))].length;

  return (
    <Box sx={{ pt: 3 }}>
      {/* Selector de Proveedor */}
      <Card sx={{ mb: 3, border: `1px solid ${theme.colores.azul}20` }}>
        <CardContent>
          <Typography variant="h6" sx={{ color: theme.colores.azul, mb: 2 }}>
            Configuración de Análisis
          </Typography>
          
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={4}>
              <Autocomplete
                options={PROVEEDORES_DESCARGA}
                value={proveedorSeleccionado}
                onChange={(_, newValue) => {
                  setProveedorSeleccionado(newValue);
                  handleClearData();
                }}
                getOptionLabel={(option) => option.nombre}
                size="small"
                renderInput={(params) => (
                  <TextField 
                    {...params} 
                    label="Proveedor" 
                    placeholder="Selecciona Bunge o AGD"
                    sx={{
                      '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: theme.colores.azul,
                      },
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: theme.colores.azul,
                      },
                    }}
                  />
                )}
                sx={{
                  '& .MuiAutocomplete-option': { fontWeight: 400 },
                  '& .Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: theme.colores.azul },
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={8}>
              <Typography variant="body2" color="textSecondary">
                {proveedorSeleccionado 
                  ? `Seleccionado: ${proveedorSeleccionado.nombre} - Arrastra un archivo CSV de descargas`
                  : 'Primero selecciona un proveedor para cargar el archivo'
                }
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Área de Drop de Archivos */}
      {proveedorSeleccionado && (
        <Card sx={{ mb: 3, border: `1px solid ${theme.colores.azul}20` }}>
          <CardContent>
            <Box
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onDragEnter={(e) => e.preventDefault()}
              sx={{
                border: `2px dashed ${theme.colores.azul}40`,
                borderRadius: 2,
                p: 4,
                textAlign: 'center',
                backgroundColor: archivoCargado ? `${theme.colores.azul}10` : 'transparent',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  backgroundColor: `${theme.colores.azul}20`,
                  borderColor: theme.colores.azul,
                }
              }}
            >
              <input
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
                id="csv-upload"
              />
              <label htmlFor="csv-upload" style={{ cursor: 'pointer', width: '100%', display: 'block' }}>
                <CloudUpload sx={{ fontSize: 48, color: theme.colores.azul, mb: 2 }} />
                <Typography variant="h6" sx={{ color: theme.colores.azul, mb: 1 }}>
                  {archivoCargado ? `Archivo cargado: ${archivoCargado.name}` : 'Arrastra tu archivo CSV aquí'}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  O haz clic para seleccionar archivo
                </Typography>
                {loading && (
                  <Box sx={{ mt: 2 }}>
                    <LinearProgress variant="determinate" value={progreso} />
                    <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
                      Procesando archivo... {progreso}%
                    </Typography>
                  </Box>
                )}
              </label>
            </Box>
            
            {archivoCargado && (
              <Box sx={{ mt: 2, display: 'flex', gap: 2, justifyContent: 'center' }}>
                <Button
                  variant="outlined"
                  onClick={handleClearData}
                  startIcon={<Delete />}
                  size="small"
                >
                  Limpiar Datos
                </Button>
                <Button
                  variant="contained"
                  onClick={handleExportData}
                  startIcon={<Download />}
                  size="small"
                  sx={{
                    backgroundColor: theme.colores.azul,
                    '&:hover': {
                      backgroundColor: theme.colores.azulOscuro || '#163660'
                    }
                  }}
                >
                  Exportar CSV
                </Button>
                <Button
                  variant="contained"
                  onClick={handleValidarTurnos}
                  disabled={validandoTurnos}
                  startIcon={validandoTurnos ? <CircularProgress size={20} /> : <CheckCircle />}
                  size="small"
                  sx={{
                    backgroundColor: theme.colores.azul,
                    '&:hover': {
                      backgroundColor: theme.colores.azulOscuro || '#163660'
                    }
                  }}
                >
                  {validandoTurnos ? 'Validando...' : 'Validar Turnos'}
                </Button>
              </Box>
            )}
          </CardContent>
        </Card>
      )}

      {/* Progreso de Validación */}
      {validandoTurnos && (
        <Card sx={{ mb: 3, border: `1px solid ${theme.colores.azul}20` }}>
          <CardContent>
            <Typography variant="h6" sx={{ color: theme.colores.azul, mb: 2 }}>
              Validando Turnos en Dossin
            </Typography>
            <LinearProgress variant="determinate" value={progresoValidacion} />
            <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
              Progreso: {progresoValidacion}% - Consultando CTGs en lotes de 10
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* Mensajes de Error */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {errorValidacion && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          {errorValidacion}
        </Alert>
      )}

      {/* Métricas */}
      {datosProcesados.length > 0 && (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ border: `1px solid ${theme.colores.azul}20` }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography color="textSecondary" gutterBottom variant="body2">
                      Total Registros
                    </Typography>
                    <Typography variant="h4" sx={{ color: theme.colores.azul }}>
                      {totalRegistros.toLocaleString()}
                    </Typography>
                  </Box>
                  <Assessment sx={{ color: theme.colores.azul, fontSize: 40 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ border: `1px solid ${theme.colores.azul}20` }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography color="textSecondary" gutterBottom variant="body2">
                      Total Kg Descargados
                    </Typography>
                    <Typography variant="h4" sx={{ color: theme.colores.azul }}>
                      {(totalKg / 1000).toFixed(1)}K
                    </Typography>
                  </Box>
                  <Assessment sx={{ color: theme.colores.azul, fontSize: 40 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ border: `1px solid ${theme.colores.azul}20` }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography color="textSecondary" gutterBottom variant="body2">
                      Promedio por Registro
                    </Typography>
                    <Typography variant="h4" sx={{ color: theme.colores.azul }}>
                      {promedioKg.toFixed(0)} kg
                    </Typography>
                  </Box>
                  <Assessment sx={{ color: theme.colores.azul, fontSize: 40 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ border: `1px solid ${theme.colores.azul}20` }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography color="textSecondary" gutterBottom variant="body2">
                      Tipos de Grano
                    </Typography>
                    <Typography variant="h4" sx={{ color: theme.colores.azul }}>
                      {granosUnicos}
                    </Typography>
                  </Box>
                  <Assessment sx={{ color: theme.colores.azul, fontSize: 40 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Tabla de Datos */}
      {datosProcesados.length > 0 && (
        <Card sx={{ border: `1px solid ${theme.colores.azul}20` }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ color: theme.colores.azul }}>
                Datos de Descargas Procesados ({datosProcesados.length} registros)
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Tooltip title="Exportar">
                  <IconButton size="small" onClick={handleExportData} sx={{ color: theme.colores.azul }}>
                    <Download />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
            
            <TableContainer component={Paper} sx={{ maxHeight: 600 }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, color: theme.colores.azul }}>Fecha</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: theme.colores.azul }}>Grano</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: theme.colores.azul }}>Número CTG</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: theme.colores.azul }}>Kg Descargados</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: theme.colores.azul }}>Proveedor</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {datosProcesados.map((row, index) => (
                    <TableRow key={index} hover>
                      <TableCell>{row.fecha}</TableCell>
                      <TableCell>
                        <Chip 
                          label={row.grano}
                          size="small"
                          sx={{ backgroundColor: `${theme.colores.azul}20`, color: theme.colores.azul }}
                        />
                      </TableCell>
                      <TableCell>{row.numeroCTG}</TableCell>
                      <TableCell>{row.kgDescargados.toLocaleString()} kg</TableCell>
                      <TableCell>
                        <Chip 
                          label={row.proveedor}
                          size="small"
                          color={row.proveedor === 'Bunge' ? 'primary' : 'secondary'}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* Resultados de Validación */}
      {turnosEncontrados.length > 0 && (
        <Card sx={{ border: `1px solid ${theme.colores.azul}20`, mt: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ color: theme.colores.azul }}>
                Turnos Encontrados en Dossin ({turnosEncontrados.length} turnos)
              </Typography>
            </Box>
            
            <TableContainer component={Paper} sx={{ maxHeight: 600 }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, color: theme.colores.azul }}>CTG Buscado</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: theme.colores.azul }}>Estado</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: theme.colores.azul }}>Chofer</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: theme.colores.azul }}>Empresa</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: theme.colores.azul }}>Camión</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: theme.colores.azul }}>Acoplado</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: theme.colores.azul }}>Kg Neto</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {turnosEncontrados.map((turno, index) => (
                    <TableRow key={index} hover>
                      <TableCell>
                        <Chip 
                          label={turno.ctgBuscado}
                          size="small"
                          sx={{ backgroundColor: `${theme.colores.azul}20`, color: theme.colores.azul }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={turno.estado?.nombre || 'En Viaje'}
                          size="small"
                          color="warning"
                        />
                      </TableCell>
                      <TableCell>
                        {turno.colaborador ? 
                          `${turno.colaborador.nombre} ${turno.colaborador.apellido}` : 
                          'N/A'
                        }
                      </TableCell>
                      <TableCell>{turno.empresa?.razonSocial || 'N/A'}</TableCell>
                      <TableCell>{turno.camion?.patente || 'N/A'}</TableCell>
                      <TableCell>{turno.acoplado?.patente || 'N/A'}</TableCell>
                      <TableCell>{turno.kgNeto ? `${turno.kgNeto.toLocaleString()} kg` : 'N/A'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};
