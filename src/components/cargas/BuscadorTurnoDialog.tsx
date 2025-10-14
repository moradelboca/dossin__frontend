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
} from '@mui/material';
import { ContextoGeneral } from '../Contexto';
// import { useAuth } from '../autenticacion/ContextoAuth';
import TurnoGridRow from './cupos/tabsCupos/TurnoGridRow';
import { exportarCSV, exportarPDF, exportarImagen } from '../../utils/exportUtils';
import { AnalisisDescargas } from './AnalisisDescargas';
import ViewColumnIcon from '@mui/icons-material/ViewColumn';
import SaveAltIcon from '@mui/icons-material/SaveAlt';
import ImageIcon from '@mui/icons-material/Image';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import { ESTADO_PERMISOS } from '../../utils/turnoEstadoPermisos';

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
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  
  // Estados para columnas y exportación (reutilizados del grid)
  const [selectedColumns, setSelectedColumns] = useState<string[]>(columnasPorDefecto);
  const [anchorElColumns, setAnchorElColumns] = useState<null | HTMLElement>(null);
  const [anchorElExport, setAnchorElExport] = useState<null | HTMLElement>(null);
  
  // Estado para tabs
  const [activeTab, setActiveTab] = useState(0);

  // Estilos para azul en focus
  const azulStyles = {
    '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: theme.colores.azul,
    },
    '& .MuiInputLabel-root.Mui-focused': {
      color: theme.colores.azul,
    },
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

      setTurnos(turnosNormalizados);
      setSearched(true);
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
    setSearched(false);
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
                color: theme.colores.gris || '#666',
                fontWeight: 500,
                textTransform: 'none',
                fontSize: '0.95rem',
                transition: 'all 0.3s ease',
                '&:hover': {
                  color: theme.colores.azul,
                  backgroundColor: `${theme.colores.azul}15`,
                },
              },
              '& .Mui-selected': {
                color: theme.colores.azul,
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

                    {/* Grid de turnos */}
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
      </DialogContent>
    </Dialog>
  );
};

