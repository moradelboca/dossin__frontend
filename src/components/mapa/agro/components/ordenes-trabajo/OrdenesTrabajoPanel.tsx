import { useState, useContext } from 'react';
import {
    Box,
    Typography,
    Button,
    Card,
    CardContent,
    List,
    IconButton,
    Chip,
    CircularProgress,
    Alert,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
} from '@mui/material';
import {
    Assignment,
    Add,
    Edit,
    Delete,
    Person,
    Refresh,
} from '@mui/icons-material';
import { ContextoGeneral } from '../../../../Contexto';
import { finnegansApi } from '../finnegans/finnegansApi';
import { OrdenTrabajo } from './types';

interface OrdenesTrabajoPanelProps {
    ubicacion?: any;
}

export function OrdenesTrabajoPanel({ ubicacion }: OrdenesTrabajoPanelProps) {
    const { theme } = useContext(ContextoGeneral);
    
    const [ordenes, setOrdenes] = useState<OrdenTrabajo[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingOrden, setEditingOrden] = useState<OrdenTrabajo | null>(null);
    const [formData, setFormData] = useState({
        titulo: '',
        descripcion: '',
        prioridad: 'media' as 'baja' | 'media' | 'alta',
        estado: 'pendiente' as 'pendiente' | 'en_progreso' | 'completada',
        asignadoA: '',
        fechaVencimiento: '',
    });

    const cargarOrdenes = async () => {
        setLoading(true);
        setError(null);
        try {
            console.log('🔄 Cargando informe de órdenes de trabajo desde Finnegans...');
            
            // Obtener token
            const token = await finnegansApi.getAccessToken();
            console.log('🔑 Token obtenido:', token);
            
            // Calcular fechas para el rango (último mes)
            const fechaHasta = new Date();
            const fechaDesde = new Date();
            fechaDesde.setMonth(fechaDesde.getMonth() - 1);
            
            const fechaDesdeFormateada = fechaDesde.toISOString().split('T')[0]; // YYYY-MM-DD
            const fechaHastaFormateada = fechaHasta.toISOString().split('T')[0]; // YYYY-MM-DD
            
            // Construir URL con parámetros según la documentación de Finnegans
            const url = new URL('https://api.finneg.com/api/reports/InformeOrdenesTrabajoApi');
            url.searchParams.append('ACCESS_TOKEN', token);
            url.searchParams.append('FechaDesde', fechaDesdeFormateada);
            url.searchParams.append('FechaHasta', fechaHastaFormateada);
            url.searchParams.append('Situacion', '0'); // 0 = todas las situaciones
            
            console.log('🌐 URL de la petición:', url.toString());
            console.log('📅 Fecha desde:', fechaDesdeFormateada);
            console.log('📅 Fecha hasta:', fechaHastaFormateada);
            
            const response = await fetch(url.toString(), {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                },
            });
            
            if (response.ok) {
                const data = await response.json();
                console.log('✅ Respuesta del informe de Finnegans:', data);
                
                // Verificar si la respuesta es un array o un objeto con datos
                const ordenesData = Array.isArray(data) ? data : (data.data || data.ordenes || []);
                
                // Transformar datos del informe de Finnegans a nuestro formato
                const ordenesTransformadas = ordenesData.map((item: any, index: number) => ({
                    id: `finnegans-${item.codigo || item.id || index}`,
                    titulo: item.nombre || item.titulo || 'Sin título',
                    descripcion: item.descripcion || 'Sin descripción',
                    prioridad: 'media', // Valor por defecto
                    estado: item.activo ? 'en_progreso' : 'pendiente',
                    asignadoA: item.asignadoA || item.responsable || '',
                    fechaVencimiento: item.fechaVencimiento || item.fechaFin || '',
                    ubicacionId: ubicacion?.id,
                    creadoPor: 'Finnegans API',
                    creadoEn: new Date().toISOString(),
                    codigoFinnegans: item.codigo || item.id,
                    activo: item.activo,
                    // Campos adicionales del informe
                    situacion: item.situacion,
                    fechaCreacion: item.fechaCreacion || item.fechaInicio,
                }));
                
                setOrdenes(ordenesTransformadas);
                console.log('✅ Órdenes del informe transformadas:', ordenesTransformadas);
            } else {
                const errorText = await response.text();
                console.error('❌ Error cargando órdenes:', response.status, response.statusText);
                console.error('❌ Detalles del error:', errorText);
                setError(`Error ${response.status}: ${response.statusText}`);
            }
        } catch (err) {
            console.error('❌ Error en la petición:', err);
            setError(err instanceof Error ? err.message : 'Error desconocido');
        } finally {
            setLoading(false);
        }
    };

    const handleCrearOrden = () => {
        setEditingOrden(null);
        setFormData({
            titulo: '',
            descripcion: '',
            prioridad: 'media' as 'baja' | 'media' | 'alta',
            estado: 'pendiente' as 'pendiente' | 'en_progreso' | 'completada',
            asignadoA: '',
            fechaVencimiento: '',
        });
        setDialogOpen(true);
    };

    const handleEditarOrden = (orden: OrdenTrabajo) => {
        setEditingOrden(orden);
        setFormData({
            titulo: orden.titulo,
            descripcion: orden.descripcion,
            prioridad: orden.prioridad,
            estado: orden.estado,
            asignadoA: orden.asignadoA || '',
            fechaVencimiento: orden.fechaVencimiento || '',
        });
        setDialogOpen(true);
    };

    const handleGuardarOrden = async () => {
        try {
            const ordenData = {
                ...formData,
                ubicacionId: ubicacion?.id,
                creadoPor: 'usuario', // TODO: Obtener del contexto de usuario
                creadoEn: new Date().toISOString(),
            };

            if (editingOrden) {
                // Actualizar orden existente
                const ordenActualizada = { ...editingOrden, ...ordenData };
                setOrdenes(prev => prev.map(o => o.id === editingOrden.id ? ordenActualizada : o));
                console.log('✅ Orden actualizada:', ordenActualizada);
            } else {
                // Crear nueva orden
                const nuevaOrden: OrdenTrabajo = {
                    id: `local-${Date.now()}`,
                    ...ordenData,
                };
                setOrdenes(prev => [...prev, nuevaOrden]);
                console.log('✅ Nueva orden creada:', nuevaOrden);
            }
            
            setDialogOpen(false);
        } catch (err) {
            console.error('❌ Error guardando orden:', err);
        }
    };

    const handleEliminarOrden = async (id: string) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar esta orden de trabajo?')) {
            setOrdenes(prev => prev.filter(o => o.id !== id));
            console.log('✅ Orden eliminada');
        }
    };

    const getPrioridadColor = (prioridad: string) => {
        switch (prioridad) {
            case 'alta': return 'error';
            case 'media': return 'warning';
            case 'baja': return 'success';
            default: return 'default';
        }
    };

    const getEstadoColor = (estado: string) => {
        switch (estado) {
            case 'completada': return 'success';
            case 'en_progreso': return 'warning';
            case 'pendiente': return 'default';
            default: return 'default';
        }
    };

    return (
        <Box
            sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column'
            }}
        >
            {/* Header */}
            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="h6" sx={{ color: theme.colores.azul, display: 'flex', alignItems: 'center' }}>
                        <Assignment sx={{ mr: 1 }} />
                        Órdenes de Trabajo
                    </Typography>
                    <IconButton 
                        size="small" 
                        onClick={cargarOrdenes}
                        disabled={loading}
                        title="Cargar desde Finnegans"
                        sx={{ color: theme.colores.azul }}
                    >
                        <Refresh />
                    </IconButton>
                </Box>
                
                {ubicacion && (
                    <Typography variant="body2" color="text.secondary">
                        {ubicacion.nombre}
                    </Typography>
                )}
            </Box>

            {/* Contenido */}
            <Box sx={{ flex: 1, overflow: 'auto', p: 1 }}>
                <Box sx={{ mb: 2, display: 'flex', gap: 1 }}>
                    <Button
                        variant="contained"
                        startIcon={<Add />}
                        onClick={handleCrearOrden}
                        sx={{
                            backgroundColor: theme.colores.azul,
                            '&:hover': {
                                backgroundColor: theme.colores.azul,
                                opacity: 0.9
                            }
                        }}
                    >
                        Nueva Orden
                    </Button>
                    
                    <Button
                        variant="outlined"
                        startIcon={<Refresh />}
                        onClick={cargarOrdenes}
                        disabled={loading}
                        sx={{
                            borderColor: theme.colores.azul,
                            color: theme.colores.azul,
                            '&:hover': {
                                borderColor: theme.colores.azul,
                                backgroundColor: 'rgba(25, 118, 210, 0.04)'
                            }
                        }}
                    >
                        {loading ? 'Cargando...' : 'Cargar de Finnegans'}
                    </Button>
                </Box>

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                        <CircularProgress size={24} />
                        <Typography sx={{ ml: 1 }}>Cargando órdenes...</Typography>
                    </Box>
                ) : ordenes.length === 0 ? (
                    <Box sx={{ p: 2, textAlign: 'center' }}>
                        <Typography color="text.secondary">
                            No hay órdenes de trabajo disponibles
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            Haz clic en "Cargar de Finnegans" para obtener las órdenes
                        </Typography>
                    </Box>
                ) : (
                    <List dense>
                        {ordenes.map((orden) => (
                            <Card key={orden.id} sx={{ mb: 1 }}>
                                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                                        <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                                            {orden.titulo}
                                        </Typography>
                                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                                            <IconButton 
                                                size="small" 
                                                onClick={() => handleEditarOrden(orden)}
                                                title="Editar"
                                            >
                                                <Edit fontSize="small" />
                                            </IconButton>
                                            <IconButton 
                                                size="small" 
                                                onClick={() => handleEliminarOrden(orden.id)}
                                                title="Eliminar"
                                            >
                                                <Delete fontSize="small" />
                                            </IconButton>
                                        </Box>
                                    </Box>
                                    
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                        {orden.descripcion}
                                    </Typography>
                                    
                                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
                                        <Chip 
                                            label={orden.prioridad} 
                                            size="small" 
                                            color={getPrioridadColor(orden.prioridad) as any}
                                        />
                                        <Chip 
                                            label={orden.estado} 
                                            size="small" 
                                            color={getEstadoColor(orden.estado) as any}
                                        />
                                        {orden.codigoFinnegans && (
                                            <Chip 
                                                label={`Finnegans: ${orden.codigoFinnegans}`} 
                                                size="small" 
                                                variant="outlined"
                                                color="primary"
                                            />
                                        )}
                                        {orden.asignadoA && (
                                            <Chip 
                                                icon={<Person />}
                                                label={orden.asignadoA} 
                                                size="small" 
                                                variant="outlined"
                                            />
                                        )}
                                    </Box>
                                </CardContent>
                            </Card>
                        ))}
                    </List>
                )}
            </Box>

            {/* Dialog para crear/editar orden */}
            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>
                    {editingOrden ? 'Editar Orden de Trabajo' : 'Nueva Orden de Trabajo'}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                        <TextField
                            label="Título"
                            value={formData.titulo}
                            onChange={(e) => setFormData(prev => ({ ...prev, titulo: e.target.value }))}
                            fullWidth
                        />
                        
                        <TextField
                            label="Descripción"
                            value={formData.descripcion}
                            onChange={(e) => setFormData(prev => ({ ...prev, descripcion: e.target.value }))}
                            multiline
                            rows={3}
                            fullWidth
                        />
                        
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <FormControl fullWidth>
                                <InputLabel>Prioridad</InputLabel>
                                <Select
                                    value={formData.prioridad}
                                    onChange={(e) => setFormData(prev => ({ ...prev, prioridad: e.target.value as 'baja' | 'media' | 'alta' }))}
                                    label="Prioridad"
                                >
                                    <MenuItem value="baja">Baja</MenuItem>
                                    <MenuItem value="media">Media</MenuItem>
                                    <MenuItem value="alta">Alta</MenuItem>
                                </Select>
                            </FormControl>
                            
                            <FormControl fullWidth>
                                <InputLabel>Estado</InputLabel>
                                <Select
                                    value={formData.estado}
                                    onChange={(e) => setFormData(prev => ({ ...prev, estado: e.target.value as 'pendiente' | 'en_progreso' | 'completada' }))}
                                    label="Estado"
                                >
                                    <MenuItem value="pendiente">Pendiente</MenuItem>
                                    <MenuItem value="en_progreso">En Progreso</MenuItem>
                                    <MenuItem value="completada">Completada</MenuItem>
                                </Select>
                            </FormControl>
                        </Box>
                        
                        <TextField
                            label="Asignado a"
                            value={formData.asignadoA}
                            onChange={(e) => setFormData(prev => ({ ...prev, asignadoA: e.target.value }))}
                            fullWidth
                        />
                        
                        <TextField
                            label="Fecha de vencimiento"
                            type="date"
                            value={formData.fechaVencimiento}
                            onChange={(e) => setFormData(prev => ({ ...prev, fechaVencimiento: e.target.value }))}
                            InputLabelProps={{ shrink: true }}
                            fullWidth
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDialogOpen(false)}>
                        Cancelar
                    </Button>
                    <Button 
                        onClick={handleGuardarOrden} 
                        variant="contained"
                        sx={{ backgroundColor: theme.colores.azul }}
                    >
                        {editingOrden ? 'Actualizar' : 'Crear'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
