import React, { useState, useContext } from 'react';
import {
  Box,
  Tabs,
  Tab,
  Typography,
  useTheme,
  useMediaQuery,
  Snackbar,
  Alert
} from '@mui/material';
import {
  Assignment as AssignmentIcon,
  Link as LinkIcon
} from '@mui/icons-material';
import { ContextoGeneral } from '../Contexto';
import useContratosComerciales from '../hooks/contratos/useContratosComerciales';
import useCargasDisponibles from '../hooks/contratos/useCargasDisponibles';
import SeguimientoContratos from './SeguimientoContratos';
import AsociarCargas from './AsociarCargas';
import { ContratoWithStats } from '../../types/contratosComerciales';
import CrearContratoDialog from './CrearContratoDialog';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`contratos-tabpanel-${index}`}
      aria-labelledby={`contratos-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 0 }}>{children}</Box>}
    </div>
  );
}

const ContratosComerciales: React.FC = () => {
  const { backendURL, theme: customTheme } = useContext(ContextoGeneral);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [tabValue, setTabValue] = useState(0);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({
    open: false,
    message: '',
    severity: 'info'
  });
  const [editOpen, setEditOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [contratoSeleccionado, setContratoSeleccionado] = useState<ContratoWithStats | null>(null);

  // Fetch contracts and loads
  const {
    contratos,
    loading: contratosLoading,
    error: contratosError,
    refreshContratos,
    updateCargas
  } = useContratosComerciales(backendURL);

  const {
    cargas: cargasDisponibles,
    loading: cargasLoading,
    error: cargasError
  } = useCargasDisponibles(backendURL, contratos);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'info' | 'warning') => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  const handleAsociarCarga = async (contratoId: number, cargaId: number): Promise<boolean> => {
    try {
      const contrato = contratos.find(c => c.id === contratoId);
      if (!contrato) {
        showSnackbar('Contrato no encontrado', 'error');
        return false;
      }

      const currentCargasIds = contrato.cargasIds || [];
      if (currentCargasIds.includes(cargaId)) {
        showSnackbar('La carga ya está asociada a este contrato', 'warning');
        return false;
      }

      const newCargasIds = [...currentCargasIds, cargaId];
      const success = await updateCargas(contratoId, newCargasIds);
      
      if (success) {
        showSnackbar('Carga asociada exitosamente', 'success');
        return true;
      } else {
        showSnackbar('Error al asociar la carga', 'error');
        return false;
      }
    } catch (error) {
      console.error('Error associating carga:', error);
      showSnackbar('Error al asociar la carga', 'error');
      return false;
    }
  };

  const handleDesasociarCarga = async (contratoId: number, cargaId: number): Promise<boolean> => {
    try {
      const contrato = contratos.find(c => c.id === contratoId);
      if (!contrato) {
        showSnackbar('Contrato no encontrado', 'error');
        return false;
      }

      const currentCargasIds = contrato.cargasIds || [];
      const newCargasIds = currentCargasIds.filter(id => id !== cargaId);
      
      const success = await updateCargas(contratoId, newCargasIds);
      
      if (success) {
        showSnackbar('Carga desasociada exitosamente', 'success');
        return true;
      } else {
        showSnackbar('Error al desasociar la carga', 'error');
        return false;
      }
    } catch (error) {
      console.error('Error disassociating carga:', error);
      showSnackbar('Error al desasociar la carga', 'error');
      return false;
    }
  };

  // Bulk association: add many cargas in a single update
  const handleAsociarCargasMasivas = async (contratoId: number, cargasIds: number[]): Promise<boolean> => {
    try {
      const contrato = contratos.find(c => c.id === contratoId);
      if (!contrato) {
        showSnackbar('Contrato no encontrado', 'error');
        return false;
      }

      const currentCargasIds = contrato.cargasIds || [];
      // Avoid duplicates
      const merged = Array.from(new Set([...currentCargasIds, ...cargasIds]));
      
      const success = await updateCargas(contratoId, merged);
      if (success) {
        showSnackbar(`Se asociaron ${cargasIds.length} cargas`, 'success');
        return true;
      }
      showSnackbar('Error al asociar cargas', 'error');
      return false;
    } catch (error) {
      console.error('Error bulk associating cargas:', error);
      showSnackbar('Error al asociar cargas', 'error');
      return false;
    }
  };

  const handleEditContrato = (contrato: ContratoWithStats) => {
    setContratoSeleccionado(contrato);
    setEditOpen(true);
  };

  const handleCreateContrato = () => {
    setCreateOpen(true);
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const loading = contratosLoading || cargasLoading;
  const error = contratosError || cargasError;

  return (
    <Box sx={{ 
      backgroundColor: customTheme?.colores?.grisClaro || '#f6f6f6', 
      height: '100%', 
      minHeight: 0, 
      minWidth: 0, 
      width: '100%', 
      overflowY: 'auto' 
    }}>
      {/* Header */}
      <Box sx={{ 
        backgroundColor: 'white', 
        borderBottom: `1px solid ${theme?.palette?.divider || '#e0e0e0'}`,
        px: 3,
        py: 2
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <AssignmentIcon sx={{ fontSize: 32, color: customTheme?.colores?.azul || '#163660' }} />
          <Box>
          <Typography
            variant="h4"
            sx={{
              color: customTheme?.colores?.azul || '#163660',
              fontWeight: 'bold',
              mb: 0.5
            }}
          >
              Contratos Comerciales
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Gestión y seguimiento de contratos comerciales
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', backgroundColor: 'white' }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant={isMobile ? 'fullWidth' : 'standard'}
          sx={{ 
            px: 3,
            '& .MuiTab-root': {
              color: customTheme?.colores?.azul || theme?.palette?.primary?.main || '#163660'
            },
            '& .Mui-selected': {
              color: customTheme?.colores?.azul || theme?.palette?.primary?.main || '#163660'
            },
            '& .MuiTabs-indicator': {
              backgroundColor: customTheme?.colores?.azul || theme?.palette?.primary?.main || '#163660'
            }
          }}
        >
          <Tab
            icon={<AssignmentIcon sx={{ color: 'inherit' }} />}
            label="Seguimiento"
            iconPosition="start"
            sx={{ 
              minHeight: 48,
              color: customTheme?.colores?.azul || theme?.palette?.primary?.main || '#163660',
              '&.Mui-selected': {
                color: customTheme?.colores?.azul || theme?.palette?.primary?.main || '#163660'
              }
            }}
          />
          <Tab
            icon={<LinkIcon sx={{ color: 'inherit' }} />}
            label="Asociar Cargas"
            iconPosition="start"
            sx={{ 
              minHeight: 48,
              color: customTheme?.colores?.azul || theme?.palette?.primary?.main || '#163660',
              '&.Mui-selected': {
                color: customTheme?.colores?.azul || theme?.palette?.primary?.main || '#163660'
              }
            }}
          />
        </Tabs>
      </Box>

      {/* Tab content */}
      <Box sx={{ flex: 1, minHeight: 0 }}>
        <TabPanel value={tabValue} index={0}>
          <SeguimientoContratos
            contratos={contratos}
            loading={loading}
            error={error}
            onEditContrato={handleEditContrato}
            onCreateContrato={handleCreateContrato}
          />
        </TabPanel>
        <TabPanel value={tabValue} index={1}>
            <AsociarCargas
              contratos={contratos}
              cargasDisponibles={cargasDisponibles}
              loading={loading}
              error={error}
              onAsociarCarga={handleAsociarCarga}
            onAsociarCargasMasivas={handleAsociarCargasMasivas}
              onDesasociarCarga={handleDesasociarCarga}
              onRefreshContratos={refreshContratos}
            />
        </TabPanel>
      </Box>

      {/* Edit dialog */}
      <CrearContratoDialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        onSuccess={() => { setEditOpen(false); refreshContratos(); showSnackbar('Contrato actualizado', 'success'); }}
        modo="editar"
        contratoInicial={contratoSeleccionado as any}
      />

      {/* Create dialog */}
      <CrearContratoDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSuccess={() => { setCreateOpen(false); refreshContratos(); showSnackbar('Contrato creado exitosamente', 'success'); }}
        modo="crear"
      />

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ContratosComerciales;
