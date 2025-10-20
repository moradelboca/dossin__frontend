import React, { useState, useContext } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Grid,
  IconButton,
  useTheme
} from '@mui/material';
import {
  Close as CloseIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { ContextoGeneral } from '../Contexto';
import { createContratoComercial, updateContratoComercial, deleteContratoComercial } from '../../lib/supabase';
import AutocompleteEmpresas, { Empresa } from '../forms/autocompletes/AutocompleteEmpresas';
import { ContratoWithStats } from '../../types/contratosComerciales';

interface CrearContratoDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  modo?: 'crear' | 'editar';
  contratoInicial?: ContratoWithStats | null;
}

const CULTIVOS_OPTIONS = [
  { value: 1, label: 'Soja' },
  { value: 2, label: 'Maíz' },
  { value: 3, label: 'Trigo' },
  { value: 4, label: 'Girasol' },
  { value: 5, label: 'Sorgo' },
  { value: 6, label: 'Cebada' },
  { value: 7, label: 'Avena' },
  { value: 8, label: 'Centeno' },
  { value: 9, label: 'Otros' }
];

const ESTADOS_OPTIONS = [
  { value: 'activo', label: 'Activo' },
  { value: 'cumplido', label: 'Cumplido' },
  { value: 'cancelado', label: 'Cancelado' },
  { value: 'vencido', label: 'Vencido' }
];

const CrearContratoDialog: React.FC<CrearContratoDialogProps> = ({
  open,
  onClose,
  onSuccess,
  modo = 'crear',
  contratoInicial = null
}) => {
  const theme = useTheme();
  const { theme: customTheme } = useContext(ContextoGeneral);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<{
    numeroContrato: string;
    fechaContrato: string;
    fechaInicioEntrega: string;
    fechaFinEntrega: string;
    productorId: number;
    productorNombre: string;
    exportadorId: number;
    exportadorNombre: string;
    tipoGrano: number;
    tipoGranoNombre: string;
    calidad: string;
    humedadMaxima: number;
    impurezasMaximas: number;
    cantidadTotalKg: number;
    cantidadEntregadaKg: number;
    precioPorKg: number;
    moneda: string;
    condicionesPago: string;
    lugarEntrega: string;
    condicionesEntrega: string;
    estado: string;
    observaciones: string;
    cargasIds: number[];
  }>({
    numeroContrato: '',
    fechaContrato: new Date().toISOString().split('T')[0],
    fechaInicioEntrega: '',
    fechaFinEntrega: '',
    productorId: 0,
    productorNombre: '',
    exportadorId: 0,
    exportadorNombre: '',
    tipoGrano: 1,
    tipoGranoNombre: 'Soja',
    calidad: '',
    humedadMaxima: 0,
    impurezasMaximas: 0,
    cantidadTotalKg: 0,
    cantidadEntregadaKg: 0,
    precioPorKg: 0,
    moneda: 'USD',
    condicionesPago: '',
    lugarEntrega: '',
    condicionesEntrega: '',
    estado: 'activo',
    observaciones: '',
    cargasIds: []
  });

  // Estados para las empresas seleccionadas
  const [productorSeleccionado, setProductorSeleccionado] = useState<Empresa | null>(null);
  const [exportadorSeleccionado, setExportadorSeleccionado] = useState<Empresa | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Prefill when editing
  React.useEffect(() => {
    if (open && contratoInicial && modo === 'editar') {
      setFormData({
        numeroContrato: contratoInicial.numeroContrato || '',
        fechaContrato: contratoInicial.fechaContrato || new Date().toISOString().split('T')[0],
        fechaInicioEntrega: contratoInicial.fechaInicioEntrega || '',
        fechaFinEntrega: contratoInicial.fechaFinEntrega || '',
        productorId: contratoInicial.productorId || 0,
        productorNombre: contratoInicial.productorNombre || '',
        exportadorId: contratoInicial.exportadorId || 0,
        exportadorNombre: contratoInicial.exportadorNombre || '',
        tipoGrano: contratoInicial.tipoGrano || 1,
        tipoGranoNombre: contratoInicial.tipoGranoNombre || 'Soja',
        calidad: contratoInicial.calidad || '',
        humedadMaxima: Number(contratoInicial.humedadMaxima) || 0,
        impurezasMaximas: Number(contratoInicial.impurezasMaximas) || 0,
        cantidadTotalKg: Number(contratoInicial.cantidadTotalKg) || 0,
        cantidadEntregadaKg: Number(contratoInicial.cantidadEntregadaKg) || 0,
        precioPorKg: Number(contratoInicial.precioPorKg) || 0,
        moneda: contratoInicial.moneda || 'USD',
        condicionesPago: contratoInicial.condicionesPago || '',
        lugarEntrega: contratoInicial.lugarEntrega || '',
        condicionesEntrega: contratoInicial.condicionesEntrega || '',
        estado: contratoInicial.estado || 'activo',
        observaciones: contratoInicial.observaciones || '',
        cargasIds: contratoInicial.cargasIds || []
      });
      // Preselect empresas by CUIT if we have ids/names
      if (contratoInicial.productorId) {
        setProductorSeleccionado({
          cuit: contratoInicial.productorId.toString(),
          razonSocial: contratoInicial.productorNombre || '',
          nombreFantasia: '',
          roles: []
        });
      } else {
        setProductorSeleccionado(null);
      }
      if (contratoInicial.exportadorId) {
        setExportadorSeleccionado({
          cuit: contratoInicial.exportadorId.toString(),
          razonSocial: contratoInicial.exportadorNombre || '',
          nombreFantasia: '',
          roles: []
        });
      } else {
        setExportadorSeleccionado(null);
      }
    }
  }, [open, contratoInicial, modo]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCultivoChange = (tipoGrano: number) => {
    const cultivo = CULTIVOS_OPTIONS.find(c => c.value === tipoGrano);
    setFormData(prev => ({
      ...prev,
      tipoGrano,
      tipoGranoNombre: cultivo?.label || 'Soja'
    }));
  };

  // Handlers para empresas seleccionadas
  const handleProductorChange = (empresa: Empresa | null) => {
    setProductorSeleccionado(empresa);
    if (empresa) {
      setFormData(prev => ({
        ...prev,
        productorId: parseInt(empresa.cuit.toString()),
        productorNombre: empresa.razonSocial
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        productorId: 0,
        productorNombre: ''
      }));
    }
  };

  const handleExportadorChange = (empresa: Empresa | null) => {
    setExportadorSeleccionado(empresa);
    if (empresa) {
      setFormData(prev => ({
        ...prev,
        exportadorId: parseInt(empresa.cuit.toString()),
        exportadorNombre: empresa.razonSocial
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        exportadorId: 0,
        exportadorNombre: ''
      }));
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      
      // Validate required fields
      if (!formData.numeroContrato || !formData.fechaFinEntrega || !productorSeleccionado || !exportadorSeleccionado) {
        alert('Por favor completa todos los campos obligatorios');
        return;
      }

      if (modo === 'editar' && contratoInicial?.id) {
        const updates = {
          ...formData,
        };
        const ok = await updateContratoComercial(contratoInicial.id, updates);
        if (ok) {
          onSuccess();
          onClose();
        } else {
          alert('Error al actualizar el contrato');
        }
      } else {
        const contratoData = {
          ...formData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        const result = await createContratoComercial(contratoData);
      
        if (result) {
          onSuccess();
          onClose();
          // Reset form
          setFormData({
            numeroContrato: '',
            fechaContrato: new Date().toISOString().split('T')[0],
            fechaInicioEntrega: '',
            fechaFinEntrega: '',
            productorId: 0,
            productorNombre: '',
            exportadorId: 0,
            exportadorNombre: '',
            tipoGrano: 1,
            tipoGranoNombre: 'Soja',
            calidad: '',
            humedadMaxima: 0,
            impurezasMaximas: 0,
            cantidadTotalKg: 0,
            cantidadEntregadaKg: 0,
            precioPorKg: 0,
            moneda: 'USD',
            condicionesPago: '',
            lugarEntrega: '',
            condicionesEntrega: '',
            estado: 'activo',
            observaciones: '',
            cargasIds: []
          });
          setProductorSeleccionado(null);
          setExportadorSeleccionado(null);
        } else {
          alert('Error al crear el contrato');
        }
      }
    } catch (error) {
      console.error('Error creating contrato:', error);
      alert(modo === 'editar' ? 'Error al actualizar el contrato' : 'Error al crear el contrato');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (modo !== 'editar' || !contratoInicial?.id) return;
    const confirm = window.confirm('¿Seguro que deseas eliminar este contrato? Esta acción no se puede deshacer.');
    if (!confirm) return;
    try {
      setDeleting(true);
      const ok = await deleteContratoComercial(contratoInicial.id);
      if (ok) {
        onSuccess();
        onClose();
      } else {
        alert('Error al eliminar el contrato');
      }
    } catch (e) {
      console.error('Error deleting contrato:', e);
      alert('Error al eliminar el contrato');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          minHeight: '80vh'
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        backgroundColor: customTheme?.colores?.azul || theme?.palette?.primary?.main || '#163660',
        color: 'white',
        pr: 1
      }}>
        <Box sx={{ fontWeight: 'bold', fontSize: '1.25rem' }}>
          {modo === 'editar' ? 'Editar Contrato Comercial' : 'Crear Nuevo Contrato Comercial'}
        </Box>
        <IconButton onClick={onClose} sx={{ color: 'white' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        <Grid container spacing={3}>
          {/* Información Básica */}
          <Grid item xs={12}>
            <Box sx={{ mb: 2, color: customTheme?.colores?.azul || theme?.palette?.primary?.main || '#163660', fontSize: '1.1rem', fontWeight: 'bold' }}>
              Información Básica
            </Box>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Número de Contrato *"
              value={formData.numeroContrato}
              onChange={(e) => handleInputChange('numeroContrato', e.target.value)}
              required
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Fecha de Contrato"
              type="date"
              value={formData.fechaContrato}
              onChange={(e) => handleInputChange('fechaContrato', e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          {/* Fechas de Entrega */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Fecha Inicio Entrega"
              type="date"
              value={formData.fechaInicioEntrega}
              onChange={(e) => handleInputChange('fechaInicioEntrega', e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Fecha Fin Entrega *"
              type="date"
              value={formData.fechaFinEntrega}
              onChange={(e) => handleInputChange('fechaFinEntrega', e.target.value)}
              InputLabelProps={{ shrink: true }}
              required
            />
          </Grid>

          {/* Partes del Contrato */}
          <Grid item xs={12}>
            <Box sx={{ mb: 2, mt: 2, color: customTheme?.colores?.azul || theme?.palette?.primary?.main || '#163660', fontSize: '1.1rem', fontWeight: 'bold' }}>
              Partes del Contrato
            </Box>
          </Grid>

          <Grid item xs={12} sm={6}>
            <AutocompleteEmpresas
              value={productorSeleccionado?.cuit || null}
              onChange={() => {
                // This will be handled by onChangeEmpresa
              }}
              onChangeEmpresa={handleProductorChange}
              labelText="Productor *"
              rolEmpresa="Titular Carta de Porte"
              fullWidth={true}
              error={!productorSeleccionado && formData.productorId > 0}
              helperText={!productorSeleccionado && formData.productorId > 0 ? "Selecciona un productor válido" : ""}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <AutocompleteEmpresas
              value={exportadorSeleccionado?.cuit || null}
              onChange={() => {
                // This will be handled by onChangeEmpresa
              }}
              onChangeEmpresa={handleExportadorChange}
              labelText="Exportador *"
              rolEmpresa="Destinatario"
              fullWidth={true}
              error={!exportadorSeleccionado && formData.exportadorId > 0}
              helperText={!exportadorSeleccionado && formData.exportadorId > 0 ? "Selecciona un exportador válido" : ""}
            />
          </Grid>

          {/* Detalles del Grano */}
          <Grid item xs={12}>
            <Box sx={{ mb: 2, mt: 2, color: customTheme?.colores?.azul || theme?.palette?.primary?.main || '#163660', fontSize: '1.1rem', fontWeight: 'bold' }}>
              Detalles del Grano
            </Box>
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Tipo de Grano</InputLabel>
              <Select
                value={formData.tipoGrano}
                onChange={(e) => handleCultivoChange(e.target.value as number)}
                label="Tipo de Grano"
              >
                {CULTIVOS_OPTIONS.map(cultivo => (
                  <MenuItem key={cultivo.value} value={cultivo.value}>
                    {cultivo.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Calidad"
              value={formData.calidad}
              onChange={(e) => handleInputChange('calidad', e.target.value)}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Humedad Máxima (%)"
              type="number"
              value={formData.humedadMaxima}
              onChange={(e) => handleInputChange('humedadMaxima', parseFloat(e.target.value) || 0)}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Impurezas Máximas (%)"
              type="number"
              value={formData.impurezasMaximas}
              onChange={(e) => handleInputChange('impurezasMaximas', parseFloat(e.target.value) || 0)}
            />
          </Grid>

          {/* Cantidades y Precios */}
          <Grid item xs={12}>
            <Box sx={{ mb: 2, mt: 2, color: customTheme?.colores?.azul || theme?.palette?.primary?.main || '#163660', fontSize: '1.1rem', fontWeight: 'bold' }}>
              Cantidades y Precios
            </Box>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Cantidad Total (kg)"
              type="number"
              value={formData.cantidadTotalKg}
              onChange={(e) => handleInputChange('cantidadTotalKg', parseInt(e.target.value) || 0)}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Cantidad Entregada (kg)"
              type="number"
              value={formData.cantidadEntregadaKg}
              onChange={(e) => handleInputChange('cantidadEntregadaKg', parseInt(e.target.value) || 0)}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Precio por kg"
              type="number"
              inputProps={{ step: '0.01' }}
              value={formData.precioPorKg}
              onChange={(e) => handleInputChange('precioPorKg', parseFloat(e.target.value) || 0)}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Moneda</InputLabel>
              <Select
                value={formData.moneda}
                onChange={(e) => handleInputChange('moneda', e.target.value)}
                label="Moneda"
              >
                <MenuItem value="USD">USD</MenuItem>
                <MenuItem value="ARS">ARS</MenuItem>
                <MenuItem value="EUR">EUR</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Condiciones Comerciales */}
          <Grid item xs={12}>
            <Box sx={{ mb: 2, mt: 2, color: customTheme?.colores?.azul || theme?.palette?.primary?.main || '#163660', fontSize: '1.1rem', fontWeight: 'bold' }}>
              Condiciones Comerciales
            </Box>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Condiciones de Pago"
              value={formData.condicionesPago}
              onChange={(e) => handleInputChange('condicionesPago', e.target.value)}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Lugar de Entrega"
              value={formData.lugarEntrega}
              onChange={(e) => handleInputChange('lugarEntrega', e.target.value)}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Condiciones de Entrega"
              multiline
              rows={2}
              value={formData.condicionesEntrega}
              onChange={(e) => handleInputChange('condicionesEntrega', e.target.value)}
            />
          </Grid>

          {/* Estado y Observaciones */}
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Estado</InputLabel>
              <Select
                value={formData.estado}
                onChange={(e) => handleInputChange('estado', e.target.value)}
                label="Estado"
              >
                {ESTADOS_OPTIONS.map(estado => (
                  <MenuItem key={estado.value} value={estado.value}>
                    {estado.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Observaciones"
              multiline
              rows={3}
              value={formData.observaciones}
              onChange={(e) => handleInputChange('observaciones', e.target.value)}
            />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 3, gap: 2 }}>
        {modo === 'editar' && (
          <Button onClick={handleDelete} color="error" disabled={deleting}>
            {deleting ? 'Eliminando...' : 'Eliminar contrato'}
          </Button>
        )}
        <Button onClick={onClose} variant="outlined">
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading}
          startIcon={<AddIcon />}
          sx={{
            backgroundColor: customTheme?.colores?.azul || theme?.palette?.primary?.main || '#163660',
            '&:hover': {
              backgroundColor: customTheme?.colores?.azulOscuro || theme?.palette?.primary?.dark || '#0e213b'
            }
          }}
        >
          {loading ? (modo === 'editar' ? 'Guardando...' : 'Creando...') : (modo === 'editar' ? 'Guardar Cambios' : 'Crear Contrato')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CrearContratoDialog;
