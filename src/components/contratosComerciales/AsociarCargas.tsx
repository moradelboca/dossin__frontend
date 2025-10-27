import React, { useState, useMemo, useContext } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  TextField,
  InputAdornment,
  CircularProgress,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme
} from '@mui/material';
import {
  Search as SearchIcon,
  ExpandMore as ExpandMoreIcon,
  Add as AddIcon,
  Remove as RemoveIcon
} from '@mui/icons-material';
import { ContratoWithStats, CargaDisponible, CULTIVOS_MAP } from '../../types/contratosComerciales';
import TarjetaCarga from './TarjetaCarga';
import CrearContratoDialog from './CrearContratoDialog';
import { ContextoGeneral } from '../Contexto';

interface AsociarCargasProps {
  contratos: ContratoWithStats[];
  cargasDisponibles: CargaDisponible[];
  loading: boolean;
  error: string | null;
  onAsociarCarga: (contratoId: number, cargaId: number) => Promise<boolean>;
  onAsociarCargasMasivas?: (contratoId: number, cargasIds: number[]) => Promise<boolean>;
  onDesasociarCarga: (contratoId: number, cargaId: number) => Promise<boolean>;
  onRefreshContratos?: () => void;
}

const AsociarCargas: React.FC<AsociarCargasProps> = ({
  contratos,
  cargasDisponibles,
  loading,
  error,
  onAsociarCarga,
  onAsociarCargasMasivas,
  onDesasociarCarga,
  onRefreshContratos
}) => {
  const theme = useTheme();
  const { theme: customTheme } = useContext(ContextoGeneral);
  // const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCargas, setSelectedCargas] = useState<Set<number>>(new Set());
  const [selectedContrato, setSelectedContrato] = useState<number | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    contratoId: number;
    cargaId: number;
    action: 'asociar' | 'desasociar';
  }>({
    open: false,
    contratoId: 0,
    cargaId: 0,
    action: 'asociar'
  });

  const [crearContratoOpen, setCrearContratoOpen] = useState(false);

  // Filter unassociated loads
  const cargasNoAsociadas = useMemo(() => {
    return cargasDisponibles.filter(carga => !carga.asociada);
  }, [cargasDisponibles]);

  // Filter loads by search term
  const cargasFiltradas = useMemo(() => {
    if (!searchTerm.trim()) return cargasNoAsociadas;
    
    const term = searchTerm.toLowerCase();
    return cargasNoAsociadas.filter(carga =>
      String(carga.numeroCartaPorte ?? '').toLowerCase().includes(term) ||
      (carga.titular?.razonSocial?.toLowerCase() || '').includes(term) ||
      (carga.destinatario?.razonSocial?.toLowerCase() || '').includes(term) ||
      (CULTIVOS_MAP[carga.cultivo]?.toLowerCase() || '').includes(term)
    );
  }, [cargasNoAsociadas, searchTerm]);

  // Get loads for a specific contract
  const getCargasPorContrato = (contratoId: number): CargaDisponible[] => {
    return cargasDisponibles.filter(carga => carga.contratoId === contratoId);
  };

  // Check if a load can be associated with a contract (same grain type)
  const canAssociate = (carga: CargaDisponible | undefined, contrato: ContratoWithStats): boolean => {
    if (!carga) {
      return false;
    }
    return carga.cultivo === contrato.tipoGrano;
  };

  const handleCargaClick = (carga: CargaDisponible) => {
    if (carga.asociada) return; // Can't select already associated loads
    
    const newSelected = new Set(selectedCargas);
    if (newSelected.has(carga.id)) {
      newSelected.delete(carga.id);
    } else {
      newSelected.add(carga.id);
    }
    setSelectedCargas(newSelected);
  };

  const handleContratoClick = (contratoId: number) => {
    setSelectedContrato(selectedContrato === contratoId ? null : contratoId);
  };

  const handleAssociate = async (contratoId: number, cargaId: number) => {
    const success = await onAsociarCarga(contratoId, cargaId);
    if (success) {
      setSelectedCargas(prev => {
        const newSet = new Set(prev);
        newSet.delete(cargaId);
        return newSet;
      });
    }
  };

  const handleDisassociate = async (contratoId: number, cargaId: number) => {
    await onDesasociarCarga(contratoId, cargaId);
  };

  const handleBulkAssociate = async () => {
    if (!selectedContrato || selectedCargas.size === 0) return;
    
    const contrato = contratos.find(c => c.id === selectedContrato);
    if (!contrato) return;

    // Filter loads that can be associated
    const validCargas = Array.from(selectedCargas).filter(cargaId => {
      const carga = cargasDisponibles.find(c => c.id === cargaId);
      const canAssociateResult = canAssociate(carga, contrato);
      return carga && canAssociateResult;
    });

    // Perform a single bulk association update when supported
    if (onAsociarCargasMasivas) {
      const success = await onAsociarCargasMasivas(selectedContrato, validCargas);
      if (success) {
        setSelectedCargas(new Set());
      }
      return;
    }

    // Fallback: associate one by one (legacy)
    for (const cargaId of validCargas) {
      // eslint-disable-next-line no-await-in-loop
      await handleAssociate(selectedContrato, cargaId);
    }
    setSelectedCargas(new Set());
  };

  const handleCrearContratoSuccess = () => {
    // Refresh contracts after creating a new one
    if (onRefreshContratos) {
      onRefreshContratos();
    }
  };

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '50vh',
        flexDirection: 'column',
        gap: 2
      }}>
        <CircularProgress size={40} />
        <Typography variant="h6" color="text.secondary">
          Cargando cargas...
        </Typography>
      </Box>
    );
  }

  // debug: intentionally minimal

  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="error">
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography
          variant="h4"
          sx={{
            color: customTheme?.colores?.azul || '#163660',
            fontWeight: 'bold'
          }}
        >
          Asociar Cargas a Contratos
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setCrearContratoOpen(true)}
          sx={{
            backgroundColor: customTheme?.colores?.azul || theme?.palette?.primary?.main || '#163660',
            '&:hover': {
              backgroundColor: customTheme?.colores?.azulOscuro || theme?.palette?.primary?.dark || '#0e213b'
            }
          }}
        >
          Crear Nuevo Contrato
        </Button>
      </Box>

      <Grid container spacing={3} sx={{ height: 'calc(100vh - 200px)' }}>
        {/* Left panel - Unassociated loads */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ height: '100%', p: 2, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              Cargas Disponibles ({cargasFiltradas.length})
              {selectedCargas.size > 0 && (
                <Chip
                  label={`${selectedCargas.size} seleccionadas`}
                  size="small"
                  color="primary"
                />
              )}
            </Typography>

            <TextField
              fullWidth
              size="small"
              placeholder="Buscar cargas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                )
              }}
              sx={{ mb: 2 }}
            />

            <Box sx={{ flex: 1, overflowY: 'auto' }}>
              {cargasFiltradas.length > 0 ? (
                cargasFiltradas.map((carga) => (
                    <TarjetaCarga
                      key={carga.id}
                      carga={carga}
                      isSelected={selectedCargas.has(carga.id)}
                      onClick={handleCargaClick}
                    />
                ))
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body1" color="text.secondary">
                    {searchTerm ? 'No se encontraron cargas' : 'No hay cargas disponibles'}
                  </Typography>
                </Box>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Right panel - Contracts with associated loads */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ height: '100%', p: 2, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Contratos ({contratos.length})
            </Typography>

            <Box sx={{ flex: 1, overflowY: 'auto' }}>
              {contratos.map((contrato) => {
                const cargasContrato = getCargasPorContrato(contrato.id);
                const isExpanded = selectedContrato === contrato.id;

                return (
                  <Accordion
                    key={contrato.id}
                    expanded={isExpanded}
                    onChange={() => handleContratoClick(contrato.id)}
                    sx={{ mb: 1 }}
                  >
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                          #{contrato.numeroContrato}
                        </Typography>
                        <Chip
                          label={contrato.tipoGranoNombre}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                        <Chip
                          label={`${cargasContrato.length} cargas`}
                          size="small"
                        />
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          {contrato.exportadorNombre}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {(contrato.cantidadEntregadaKg || 0).toLocaleString()} / {(contrato.cantidadTotalKg || 0).toLocaleString()} kg
                        </Typography>
                      </Box>

                      {/* Associated loads */}
                      {cargasContrato.length > 0 ? (
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="subtitle2" gutterBottom>
                            Cargas Asociadas:
                          </Typography>
                          {cargasContrato.map((carga) => (
                            <Box
                              key={carga.id}
                              sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                p: 1,
                                backgroundColor: theme?.palette?.grey?.[100] || '#f5f5f5',
                                borderRadius: 1,
                                mb: 1
                              }}
                            >
                              <Typography variant="body2">
                                Carga #{carga.numeroCartaPorte || carga.id}
                              </Typography>
                              <Button
                                size="small"
                                startIcon={<RemoveIcon />}
                                onClick={() => handleDisassociate(contrato.id, carga.id)}
                                color="error"
                              >
                                Quitar
                              </Button>
                            </Box>
                          ))}
                        </Box>
                      ) : (
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          No hay cargas asociadas
                        </Typography>
                      )}

                      {/* Bulk associate button */}
                      {selectedCargas.size > 0 && (
                        <Button
                          fullWidth
                          variant="contained"
                          startIcon={<AddIcon />}
                          onClick={handleBulkAssociate}
                          disabled={!isExpanded}
                          sx={{
                            backgroundColor: customTheme?.colores?.azul || theme?.palette?.primary?.main || '#163660',
                            '&:hover': {
                              backgroundColor: customTheme?.colores?.azulOscuro || theme?.palette?.primary?.dark || '#0e213b'
                            }
                          }}
                        >
                          Asociar {selectedCargas.size} cargas seleccionadas
                        </Button>
                      )}
                    </AccordionDetails>
                  </Accordion>
                );
              })}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Confirmation dialog */}
      <Dialog open={confirmDialog.open} onClose={() => setConfirmDialog(prev => ({ ...prev, open: false }))}>
        <DialogTitle>
          {confirmDialog.action === 'asociar' ? 'Asociar Carga' : 'Desasociar Carga'}
        </DialogTitle>
        <DialogContent>
          <Typography>
            {confirmDialog.action === 'asociar' 
              ? '¿Estás seguro de que quieres asociar esta carga al contrato?'
              : '¿Estás seguro de que quieres desasociar esta carga del contrato?'
            }
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog(prev => ({ ...prev, open: false }))}>
            Cancelar
          </Button>
          <Button
            onClick={() => {
              if (confirmDialog.action === 'asociar') {
                handleAssociate(confirmDialog.contratoId, confirmDialog.cargaId);
              } else {
                handleDisassociate(confirmDialog.contratoId, confirmDialog.cargaId);
              }
              setConfirmDialog(prev => ({ ...prev, open: false }));
            }}
            color={confirmDialog.action === 'asociar' ? 'primary' : 'error'}
            variant="contained"
            sx={confirmDialog.action === 'asociar' ? {
              backgroundColor: customTheme?.colores?.azul || theme?.palette?.primary?.main || '#163660',
              '&:hover': {
                backgroundColor: customTheme?.colores?.azulOscuro || theme?.palette?.primary?.dark || '#0e213b'
              }
            } : {}}
          >
            {confirmDialog.action === 'asociar' ? 'Asociar' : 'Desasociar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Crear Contrato Dialog */}
      <CrearContratoDialog
        open={crearContratoOpen}
        onClose={() => setCrearContratoOpen(false)}
        onSuccess={handleCrearContratoSuccess}
      />
    </Box>
  );
};

export default AsociarCargas;
