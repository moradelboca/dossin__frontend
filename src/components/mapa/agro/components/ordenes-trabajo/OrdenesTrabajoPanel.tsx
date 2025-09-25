import { useState, useContext, useEffect } from 'react';
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
    Tooltip,
} from '@mui/material';
import {
    Add,
    Edit,
    Delete,
    Person,
    CloudUpload,
} from '@mui/icons-material';
import { ContextoGeneral } from '../../../../Contexto';
import { supabaseAgro } from '../../../../../lib/supabase';
import { OrdenTrabajo } from './types';
import { useCsvUpload } from '../../hooks/useCsvUpload';
import { CsvUploadDialog } from './CsvUploadDialog';

interface OrdenesTrabajoPanelProps {
    ubicacion?: any;
}

export function OrdenesTrabajoPanel({ ubicacion }: OrdenesTrabajoPanelProps) {
    const { theme } = useContext(ContextoGeneral);
    
    // Extraer el nombre del establecimiento de la ubicación
    const establecimientoFiltro = ubicacion?.establecimiento?.nombre || ubicacion?.nombre;
    
    const [ordenes, setOrdenes] = useState<OrdenTrabajo[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [csvUploadOpen, setCsvUploadOpen] = useState(false);
    const [editingOrden, setEditingOrden] = useState<OrdenTrabajo | null>(null);
    const [formData, setFormData] = useState({
        titulo: '',
        descripcion: '',
        prioridad: 'media' as 'baja' | 'media' | 'alta',
        estado: 'pendiente' as 'pendiente' | 'en_progreso' | 'completada',
        asignadoA: '',
        fechaVencimiento: '',
    });
    
    const [ordenesExpandidas, setOrdenesExpandidas] = useState<Set<string>>(new Set());

    // Hook para carga de CSV
    const { uploadCsvFile, isUploading } = useCsvUpload();

    // Cargar órdenes al montar el componente
    useEffect(() => {
        cargarOrdenesLocales();
    }, []);

    // Recargar órdenes cuando cambie el filtro de establecimiento
    useEffect(() => {
        if (establecimientoFiltro) {
            cargarOrdenesLocales();
        }
    }, [establecimientoFiltro]);

    const cargarOrdenesLocales = async () => {
        setLoading(true);
        setError(null);
        try {
            const ordenesLocales = await getOrdenesFromSupabase();
            setOrdenes(ordenesLocales);
        } catch (err) {
            console.error('Error cargando órdenes locales:', err);
            setError((err as Error)?.message || 'Error cargando órdenes');
        } finally {
            setLoading(false);
        }
    };

    const getOrdenesFromSupabase = async (): Promise<OrdenTrabajo[]> => {
        try {
            
            let query = supabaseAgro
                .from('OrdenTrabajo')
                .select('*')
                .order('created_at', { ascending: false });

            // Aplicar filtro por establecimiento si se proporciona
            if (establecimientoFiltro) {
                query = query.ilike('establecimiento', `%${establecimientoFiltro}%`);
                console.log(`🔍 Consultando Supabase con filtro de establecimiento: "${establecimientoFiltro}"`);
            }

            const { data, error } = await query;

            if (error) {
                console.error('❌ Error en consulta a Supabase:', error);
                throw error;
            }

            const ordenesTransformadas = data?.map((item: any) => {
                return {
                    id: item.transaccionId?.toString() || 'sin-id',
                    titulo: item.datos?.titulo || item.laboreo || 'Sin título',
                    descripcion: item.datos?.descripcion || '',
                    prioridad: item.datos?.prioridad || 'media',
                    estado: item.estado as 'pendiente' | 'en_progreso' | 'completada',
                    asignadoA: item.datos?.asignadoA,
                    fechaVencimiento: item.fecha 
                        ? new Date(item.fecha).toISOString() 
                        : item.datos?.fechaEjecucion 
                            ? new Date(item.datos.fechaEjecucion).toISOString()
                            : undefined,
                    ubicacionId: item.establecimiento,
                    creadoPor: item.datos?.creadoPor || 'Sistema',
                    creadoEn: item.created_at,
                    actualizadoEn: item.updated_at,
                    codigoFinnegans: undefined,
                    activo: item.datos?.activo !== false,
                    situacion: item.datos?.situacion,
                    // Campos adicionales
                    laboreo: item.laboreo || item.datos?.laboreo,
                    codigo: item.datos?.codigo || item.datos?.numeroInterno,
                    establecimiento: item.establecimiento || item.datos?.establecimiento,
                    laboreoId: item.laboreoId || item.datos?.laboreoId,
                    transaccionId: item.transaccionId || item.datos?.transaccionId,
                    datos: item.datos // Guardar datos originales
                };
            }) || [];

            return ordenesTransformadas;
        } catch (error) {
            console.error('Error getting orders from Supabase:', error);
            return [];
        }
    };

    const handleCsvUpload = async (file: File) => {
        const result = await uploadCsvFile(file);
        
        if (result.success) {
            // Recargar las órdenes después de una carga exitosa
            await cargarOrdenesLocales();
        }
        
        return result;
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

    const toggleExpandirOrden = (ordenId: string) => {
        setOrdenesExpandidas(prev => {
            const nuevo = new Set(prev);
            if (nuevo.has(ordenId)) {
                nuevo.delete(ordenId);
            } else {
                nuevo.add(ordenId);
            }
            return nuevo;
        });
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
                    
                    <Tooltip title="Cargar órdenes desde archivo CSV">
                        <Button
                            variant="outlined"
                            startIcon={<CloudUpload />}
                            onClick={() => setCsvUploadOpen(true)}
                            disabled={loading || isUploading}
                            sx={{
                                borderColor: theme.colores.azul,
                                color: theme.colores.azul,
                                '&:hover': {
                                    borderColor: theme.colores.azul,
                                    backgroundColor: 'rgba(25, 118, 210, 0.04)'
                                }
                            }}
                        >
                            {isUploading ? 'Cargando...' : 'Cargar CSV'}
                        </Button>
                    </Tooltip>
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
                            Haz clic en "Cargar CSV" para subir un archivo con las órdenes de trabajo
                        </Typography>
                    </Box>
                ) : (
                    <List dense>
                        {ordenes.map((orden, index) => (
                            <Card key={`${orden.transaccionId || orden.id}-${index}`} sx={{ mb: 1 }}>
                                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                                        <Box sx={{ flex: 1 }}>
                                            <Typography variant="subtitle1" sx={{ fontWeight: 500, mb: 0.5 }}>
                                                {orden.titulo || orden.laboreo || 'Sin título'}
                                            </Typography>
                                            {orden.establecimiento && (
                                                <Typography variant="body2" color="primary" sx={{ fontWeight: 500, mb: 0.5 }}>
                                                    🏢 {orden.establecimiento}
                                                </Typography>
                                            )}
                                            {orden.transaccionId && (
                                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                                                    ID: {orden.transaccionId}
                                        </Typography>
                                            )}
                                        </Box>
                                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                                            <IconButton 
                                                size="small" 
                                                onClick={() => toggleExpandirOrden(orden.id)}
                                                title={ordenesExpandidas.has(orden.id) ? "Contraer" : "Expandir"}
                                            >
                                                {ordenesExpandidas.has(orden.id) ? '▼' : '▶'}
                                            </IconButton>
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
                                    
                                    {/* Información básica */}
                                    <Box sx={{ mb: 1 }}>
                                        {orden.descripcion && (
                                            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                                📝 {orden.descripcion}
                                            </Typography>
                                        )}
                                        {(orden.fechaVencimiento || (orden as any).datos?.FECHA) && (
                                            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                                📅 Fecha: {(() => {
                                                    const fecha = orden.fechaVencimiento || (orden as any).datos?.fechaEjecucion;
                                                    
                                                    if (!fecha) return 'Sin fecha';
                                                    
                                                    // Si es formato YYYY-MM-DD (ISO), convertir a Date
                                                    if (fecha.includes('-') && fecha.length === 10 && !fecha.includes('T')) {
                                                        const [año, mes, dia] = fecha.split('-');
                                                        
                                                        // Crear fecha usando el constructor Date(año, mes-1, dia)
                                                        const fechaDate = new Date(parseInt(año), parseInt(mes) - 1, parseInt(dia));
                                                        
                                                        // Verificar si la fecha es válida
                                                        if (isNaN(fechaDate.getTime())) {
                                                            return fecha; // Mostrar original si no se puede convertir
                                                        }
                                                        
                                                        return fechaDate.toLocaleDateString('es-AR');
                                                    }
                                                    
                                                    // Si es formato ISO, usar directamente
                                                    try {
                                                        const fechaDate = new Date(fecha);
                                                        if (isNaN(fechaDate.getTime())) {
                                                            return fecha;
                                                        }
                                                        return fechaDate.toLocaleDateString('es-AR');
                                                    } catch (error) {
                                                        return fecha; // Mostrar como está si no se puede convertir
                                                    }
                                                })()}
                                            </Typography>
                                        )}
                                    </Box>

                                    {/* Información detallada (expandible) */}
                                    {ordenesExpandidas.has(orden.id) && (
                                        <Box sx={{ 
                                            mb: 1, 
                                            p: 2, 
                                            bgcolor: 'grey.50', 
                                            borderRadius: 1, 
                                            border: 1, 
                                            borderColor: 'grey.200' 
                                        }}>
                                            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, color: 'primary.main' }}>
                                                📋 Información Detallada
                                            </Typography>
                                            
                                            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, mb: 1 }}>
                                                {orden.fechaVencimiento && (
                                                    <Typography variant="body2" color="text.secondary">
                                                        📅 <strong>Fecha de la orden:</strong> {(() => {
                                                            const fecha = orden.fechaVencimiento;
                                                            if (!fecha) return 'Sin fecha';
                                                            
                                                            // Si es formato YYYY-MM-DD (ISO), usar directamente
                                                            if (fecha.includes('-') && fecha.length === 10 && !fecha.includes('T')) {
                                                                try {
                                                                    const fechaDate = new Date(fecha);
                                                                    if (isNaN(fechaDate.getTime())) {
                                                                        return fecha;
                                                                    }
                                                                    return fechaDate.toLocaleDateString('es-AR');
                                                                } catch {
                                                                    return fecha;
                                                                }
                                                            }
                                                            
                                                            // Si es formato ISO, usar directamente
                                                            try {
                                                                return new Date(fecha).toLocaleDateString('es-AR');
                                                            } catch {
                                                                return fecha; // Mostrar como está si no se puede convertir
                                                            }
                                                        })()}
                                                    </Typography>
                                                )}
                                                {orden.asignadoA && (
                                                    <Typography variant="body2" color="text.secondary">
                                                        👤 <strong>Asignado a:</strong> {orden.asignadoA}
                                                    </Typography>
                                                )}
                                                {orden.situacion && (
                                                    <Typography variant="body2" color="text.secondary">
                                                        ℹ️ <strong>Situación:</strong> {orden.situacion}
                                                    </Typography>
                                                )}
                                                {orden.creadoPor && (
                                                    <Typography variant="body2" color="text.secondary">
                                                        👨‍💼 <strong>Creado por:</strong> {orden.creadoPor}
                                                    </Typography>
                                                )}
                                                {orden.creadoEn && (
                                                    <Typography variant="body2" color="text.secondary">
                                                        📅 <strong>Creado:</strong> {new Date(orden.creadoEn).toLocaleString('es-AR')}
                                                    </Typography>
                                                )}
                                                {orden.actualizadoEn && (
                                                    <Typography variant="body2" color="text.secondary">
                                                        🔄 <strong>Actualizado:</strong> {new Date(orden.actualizadoEn).toLocaleString('es-AR')}
                                                    </Typography>
                                                )}
                                                {orden.laboreoId && (
                                                    <Typography variant="body2" color="text.secondary">
                                                        🔢 <strong>Laboreo ID:</strong> {orden.laboreoId}
                                                    </Typography>
                                                )}
                                                {orden.codigo && (
                                                    <Typography variant="body2" color="text.secondary">
                                                        🏷️ <strong>Código:</strong> {orden.codigo}
                                                    </Typography>
                                                )}
                                            </Box>

                                            {/* Datos JSON completos (solo para debugging) */}
                                            {(orden as any).datos && (
                                                <Box sx={{ mt: 1 }}>
                                                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                                                        🔍 Datos completos del CSV:
                                    </Typography>
                                                    <Box sx={{ 
                                                        p: 1, 
                                                        bgcolor: 'grey.100', 
                                                        borderRadius: 0.5, 
                                                        fontFamily: 'monospace', 
                                                        fontSize: '0.75rem',
                                                        maxHeight: '200px',
                                                        overflow: 'auto'
                                                    }}>
                                                        <pre>{JSON.stringify((orden as any).datos, null, 2)}</pre>
                                                    </Box>
                                                </Box>
                                            )}
                                        </Box>
                                    )}
                                    
                                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
                                        <Chip 
                                            label={`Prioridad: ${orden.prioridad}`} 
                                            size="small" 
                                            color={getPrioridadColor(orden.prioridad) as any}
                                        />
                                        <Chip 
                                            label={`Estado: ${orden.estado}`} 
                                            size="small" 
                                            color={getEstadoColor(orden.estado) as any}
                                        />
                                        {orden.laboreo && (
                                            <Chip 
                                                label={`Laboreo: ${orden.laboreo}`} 
                                                size="small" 
                                                variant="outlined"
                                                color="secondary"
                                            />
                                        )}
                                        {orden.transaccionId && (
                                            <Chip 
                                                label={`ID: ${orden.transaccionId}`} 
                                                size="small" 
                                                variant="outlined"
                                                color="info"
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

            {/* Dialog para carga de CSV */}
            <CsvUploadDialog
                open={csvUploadOpen}
                onClose={() => setCsvUploadOpen(false)}
                onUpload={handleCsvUpload}
            />
        </Box>
    );
}
