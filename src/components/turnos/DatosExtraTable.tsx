import React, { useState, useEffect, useContext } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Typography,
  TextField,
  IconButton,
  Alert,
  Chip,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { ContextoGeneral } from '../Contexto';
import {
  getAtributos,
  getAllDatosExtra,
} from '../../lib/datos-extra-turnos-api';
import type { MaestroAtributo, DatosExtraTurno } from '../../types/datos-extra';
import { formatValueByType } from '../../utils/stringUtils';
import { DatosExtraTurnoDialog } from './DatosExtraTurnoDialog';

export const DatosExtraTable: React.FC = () => {
  const { theme, backendURL } = useContext(ContextoGeneral);
  
  const [atributos, setAtributos] = useState<MaestroAtributo[]>([]);
  const [datosExtra, setDatosExtra] = useState<DatosExtraTurno[]>([]);
  const [turnosMap, setTurnosMap] = useState<Record<number, any>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedTurno, setSelectedTurno] = useState<any>(null);

  const azulStyles = {
    '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: theme.colores.azul,
    },
    '& .MuiInputLabel-root.Mui-focused': {
      color: theme.colores.azul,
    },
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Load attributes
      const atributosData = await getAtributos();
      setAtributos(atributosData);

      // Load all datos extra
      const datosExtraData = await getAllDatosExtra();
      setDatosExtra(datosExtraData);

      // Load turno details for each datos extra
      const turnoIds = datosExtraData.map(d => d.turno_id);
      const turnosData: Record<number, any> = {};
      
      await Promise.all(
        turnoIds.map(async (turnoId) => {
          try {
            const response = await fetch(`${backendURL}/turnos/${turnoId}`, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                'ngrok-skip-browser-warning': 'true',
              },
            });
            if (response.ok) {
              const turnoData = await response.json();
              turnosData[turnoId] = turnoData;
            }
          } catch (err) {
            console.error(`Error loading turno ${turnoId}:`, err);
          }
        })
      );
      
      setTurnosMap(turnosData);
    } catch (err) {
      setError('Error al cargar los datos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (datoExtra: DatosExtraTurno) => {
    const turno = turnosMap[datoExtra.turno_id];
    if (turno) {
      setSelectedTurno(turno);
      setDialogOpen(true);
    }
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedTurno(null);
  };

  const filteredDatos = datosExtra.filter((dato) => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    const turno = turnosMap[dato.turno_id];
    
    return (
      dato.ctg?.toLowerCase().includes(searchLower) ||
      dato.empresa_titular_carta_de_porte?.toLowerCase().includes(searchLower) ||
      turno?.estado?.nombre?.toLowerCase().includes(searchLower)
    );
  });

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Datos Extra de Turnos
      </Typography>

      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TextField
        fullWidth
        size="small"
        label="Buscar por CTG, Empresa o Estado"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        sx={{ ...azulStyles, mb: 2, maxWidth: 400 }}
      />

      {datosExtra.length === 0 ? (
        <Alert severity="info">
          No hay datos extra registrados aún. Puede agregar datos extra desde las notas de los turnos.
        </Alert>
      ) : (
        <TableContainer component={Paper} sx={{ maxHeight: '70vh' }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell><strong>CTG</strong></TableCell>
                <TableCell><strong>Empresa</strong></TableCell>
                <TableCell><strong>Estado</strong></TableCell>
                {atributos.map((atributo) => (
                  <TableCell key={atributo.id}>
                    <strong>{atributo.nombre_atributo}</strong>
                  </TableCell>
                ))}
                <TableCell align="right"><strong>Acciones</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredDatos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={atributos.length + 4} align="center">
                    <Typography color="text.secondary">
                      No se encontraron resultados
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredDatos.map((datoExtra) => {
                  const turno = turnosMap[datoExtra.turno_id];
                  return (
                    <TableRow key={datoExtra.id} hover>
                      <TableCell>{datoExtra.ctg || 'N/A'}</TableCell>
                      <TableCell>{datoExtra.empresa_titular_carta_de_porte || 'N/A'}</TableCell>
                      <TableCell>
                        {turno?.estado?.nombre ? (
                          <Chip 
                            label={turno.estado.nombre} 
                            size="small"
                            sx={{ 
                              backgroundColor: `${theme.colores.azul}20`,
                              color: theme.colores.azul,
                            }}
                          />
                        ) : (
                          'N/A'
                        )}
                      </TableCell>
                      {atributos.map((atributo) => (
                        <TableCell key={atributo.id}>
                          {formatValueByType(
                            datoExtra.datos[atributo.nombre_atributo],
                            atributo.tipo_dato
                          )}
                        </TableCell>
                      ))}
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          onClick={() => handleEditClick(datoExtra)}
                          sx={{ color: theme.colores.azul }}
                          disabled={!turno}
                        >
                          <EditIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {selectedTurno && (
        <DatosExtraTurnoDialog
          open={dialogOpen}
          onClose={handleCloseDialog}
          turno={selectedTurno}
          refreshTurnos={loadData}
        />
      )}
    </Box>
  );
};

