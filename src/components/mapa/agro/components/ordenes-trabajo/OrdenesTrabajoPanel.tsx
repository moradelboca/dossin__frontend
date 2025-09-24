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
    CloudSync,
    History,
    CheckCircle,
    Error,
    Upload,
} from '@mui/icons-material';
import { ContextoGeneral } from '../../../../Contexto';
import { finnegansApi } from '../finnegans/finnegansApi';
import { OrdenTrabajo } from './types';
import { useSyncOrdenesTrabajo } from '../../hooks/useSyncOrdenesTrabajo';

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
    const [editingOrden, setEditingOrden] = useState<OrdenTrabajo | null>(null);
    const [formData, setFormData] = useState({
        titulo: '',
        descripcion: '',
        prioridad: 'media' as 'baja' | 'media' | 'alta',
        estado: 'pendiente' as 'pendiente' | 'en_progreso' | 'completada',
        asignadoA: '',
        fechaVencimiento: '',
    });
    
    // Estados para el buscador de facturas
    const [codigoFactura, setCodigoFactura] = useState('');
    const [buscandoFactura, setBuscandoFactura] = useState(false);
    const [ordenesExpandidas, setOrdenesExpandidas] = useState<Set<string>>(new Set());

    const buscarFactura = async () => {
        if (!codigoFactura.trim()) {
            setError('Por favor ingresa un código de factura');
            return;
        }

        setBuscandoFactura(true);
        setError(null);
        
        try {
            console.log('🔍 Buscando factura con código:', codigoFactura);
            
            // Obtener token
            const token = await finnegansApi.getAccessToken();
            console.log('🔑 Token obtenido para búsqueda de factura:', token);
            
            // Construir URL según el endpoint proporcionado
            const url = `https://api.finneg.com/api/facturaCompra/${codigoFactura}?ACCESS_TOKEN=${token}`;
            
            console.log('🌐 URL de búsqueda de factura:', url);
            
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                },
            });
            
            if (response.ok) {
                const facturaData = await response.json();
                console.log('✅ Factura encontrada - Datos completos:', facturaData);
                console.log('📊 Estructura de la factura:', JSON.stringify(facturaData, null, 2));
                
                // Log detallado de todos los campos
                if (facturaData) {
                    console.log('🔍 Análisis detallado de la factura:');
                    Object.keys(facturaData).forEach(key => {
                        console.log(`  - ${key}:`, facturaData[key]);
                    });
                }
                
                // Mostrar mensaje de éxito
                setError(null);
                alert(`Factura encontrada! Revisa la consola para ver todos los datos. Código: ${codigoFactura}`);
                
            } else {
                const errorText = await response.text();
                console.error('❌ Error buscando factura:', response.status, response.statusText);
                console.error('❌ Detalles del error:', errorText);
                setError(`Error ${response.status}: No se encontró la factura con código ${codigoFactura}`);
            }
        } catch (err) {
            console.error('❌ Error en la búsqueda de factura:', err);
            setError((err as Error)?.message || 'Error desconocido al buscar factura');
        } finally {
            setBuscandoFactura(false);
        }
    };

    // Hook de sincronización
    const { 
        syncOrdenesTrabajo, 
        fetchDatosHistoricosCompletos,
        isSyncing, 
        syncControl, 
        getOrdenesFromSupabase 
    } = useSyncOrdenesTrabajo(establecimientoFiltro);

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


    const cargarOrdenes = async (forceRefresh = false) => {
        setLoading(true);
        setError(null);
        try {
            console.log('🔄 Iniciando sincronización de órdenes de trabajo...');
            
            const result = await syncOrdenesTrabajo(forceRefresh);
            
            if (result.success) {
                setOrdenes(result.data || []);
                setError(null);
            } else {
                setError(result.message || 'Error en sincronización');
            }
        } catch (err) {
            console.error('Error en sincronización:', err);
            setError((err as Error)?.message || 'Error en sincronización');
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

    const subirTodasLasOrdenes = async () => {
        if (ordenes.length === 0) {
            setError('No hay órdenes para subir');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const token = await finnegansApi.getAccessToken();
            let exitosas = 0;
            let errores = 0;

            for (const orden of ordenes) {
                try {
                    // Preparar datos para Finnegans
                    const datosFinnegans = {
                        TRANSACCIONID: orden.transaccionId || orden.id,
                        ESTABLECIMIENTO: orden.establecimiento || establecimientoFiltro,
                        ESTADO: orden.estado === 'completada' ? 'Ejecutada' : 
                               orden.estado === 'en_progreso' ? 'En ejecucion' : 'Pendiente',
                        FECHA: orden.fechaVencimiento ? 
                               new Date(orden.fechaVencimiento).toLocaleDateString('es-AR') : 
                               new Date().toLocaleDateString('es-AR'),
                        LABOREO: orden.titulo || orden.laboreo || 'Sin título',
                        LABOREOID: orden.laboreoId || null,
                        DESCRIPCION: orden.descripcion || '',
                        ASIGNADO_A: orden.asignadoA || '',
                        PRIORIDAD: orden.prioridad || 'media'
                    };

                    // Subir a Finnegans (asumiendo que hay un endpoint POST)
                    const response = await fetch('https://api.finneg.com/api/ordenes-trabajo', {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(datosFinnegans)
                    });

                    if (response.ok) {
                        exitosas++;
                    } else {
                        errores++;
                        console.error(`Error subiendo orden ${orden.id}:`, response.status);
                    }
                } catch (err) {
                    errores++;
                    console.error(`Error subiendo orden ${orden.id}:`, err);
                }
            }

            setError(null);
            alert(`Subida completada: ${exitosas} exitosas, ${errores} errores`);
        } catch (err) {
            console.error('Error en subida masiva:', err);
            setError((err as Error)?.message || 'Error subiendo órdenes');
        } finally {
            setLoading(false);
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

            {/* Contenido */}
            <Box sx={{ flex: 1, overflow: 'auto', p: 1 }}>
                {/* Buscador de Facturas */}
                <Box sx={{ mb: 2, p: 2, border: 1, borderColor: 'divider', borderRadius: 1, backgroundColor: 'background.paper' }}>
                    <Typography variant="subtitle2" sx={{ mb: 1, color: theme.colores.azul }}>
                        🔍 Buscar Factura
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                        <TextField
                            label="Código de Factura"
                            value={codigoFactura}
                            onChange={(e) => setCodigoFactura(e.target.value)}
                            size="small"
                            sx={{ flex: 1 }}
                            placeholder="Ingresa el código de la factura"
                            onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                    buscarFactura();
                                }
                            }}
                        />
                        <Button
                            variant="contained"
                            onClick={buscarFactura}
                            disabled={buscandoFactura || !codigoFactura.trim()}
                            sx={{
                                backgroundColor: theme.colores.azul,
                                minWidth: 80,
                                '&:hover': {
                                    backgroundColor: theme.colores.azul,
                                    opacity: 0.9
                                }
                            }}
                        >
                            {buscandoFactura ? (
                                <CircularProgress size={16} color="inherit" />
                            ) : (
                                'OK'
                            )}
                        </Button>
                    </Box>
                </Box>

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
                    
                    <Tooltip title="Sincronizar con Finnegans">
                        <Button
                            variant="outlined"
                            startIcon={<CloudSync />}
                            onClick={() => cargarOrdenes(false)}
                            disabled={loading || isSyncing}
                            sx={{
                                borderColor: theme.colores.azul,
                                color: theme.colores.azul,
                                '&:hover': {
                                    borderColor: theme.colores.azul,
                                    backgroundColor: 'rgba(25, 118, 210, 0.04)'
                                }
                            }}
                        >
                            {isSyncing ? 'Sincronizando...' : 'Sincronizar'}
                        </Button>
                    </Tooltip>
                    
                    <Tooltip title="Cargar datos históricos completos">
                        <Button
                            variant="contained"
                            startIcon={<History />}
                            onClick={async () => {
                                setLoading(true);
                                setError(null);
                                try {
                                    const result = await fetchDatosHistoricosCompletos();
                                    if (result.success) {
                                        setOrdenes(result.data || []);
                                        setError(null);
                                    } else {
                                        setError(result.message || 'Error en carga histórica');
                                    }
                                } catch (err) {
                                    console.error('Error en carga histórica:', err);
                                    setError((err as Error)?.message || 'Error en carga histórica');
                                } finally {
                                    setLoading(false);
                                }
                            }}
                            disabled={loading || isSyncing}
                            sx={{
                                backgroundColor: '#d32f2f',
                                '&:hover': {
                                    backgroundColor: '#d32f2f',
                                    opacity: 0.9
                                }
                            }}
                        >
                            Carga Histórica
                        </Button>
                    </Tooltip>
                    
                    <Tooltip title="Subir todas las órdenes locales a Finnegans">
                        <Button
                            variant="contained"
                            startIcon={<Upload />}
                            onClick={subirTodasLasOrdenes}
                            disabled={loading || isSyncing || ordenes.length === 0}
                            sx={{
                                backgroundColor: '#2e7d32',
                                '&:hover': {
                                    backgroundColor: '#2e7d32',
                                    opacity: 0.9
                                }
                            }}
                        >
                            Subir a Finnegans
                        </Button>
                    </Tooltip>
                </Box>

                {/* Indicador de estado de sincronización */}
                {syncControl && (
                    <Box sx={{ mb: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            {syncControl.estado === 'syncing' && <CircularProgress size={16} />}
                            {syncControl.estado === 'idle' && <CheckCircle color="success" fontSize="small" />}
                            {syncControl.estado === 'error' && <Error color="error" fontSize="small" />}
                            
                            <Typography variant="body2" color="text.secondary">
                                {syncControl.estado === 'syncing' && 'Sincronizando...'}
                                {syncControl.estado === 'idle' && 'Sincronizado'}
                                {syncControl.estado === 'error' && 'Error en sincronización'}
                            </Typography>
                        </Box>
                        
                        {syncControl.ultima_sincronizacion && (
                            <Typography variant="caption" color="text.secondary">
                                Última sincronización: {new Date(syncControl.ultima_sincronizacion).toLocaleString()}
                            </Typography>
                        )}
                        
                        {syncControl.total_registros > 0 && (
                            <Typography variant="caption" color="text.secondary" sx={{ ml: 2 }}>
                                {syncControl.total_registros} órdenes sincronizadas
                            </Typography>
                        )}
                    </Box>
                )}

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
                            Haz clic en "Sincronizar" para obtener las órdenes desde Finnegans
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
                                                    const fecha = orden.fechaVencimiento || (orden as any).datos?.FECHA;
                                                    
                                                    if (!fecha) return 'Sin fecha';
                                                    
                                                    // Si es formato DD-MM-YYYY, convertir a Date
                                                    if (fecha.includes('-') && fecha.length === 10 && !fecha.includes('T')) {
                                                        const [dia, mes, año] = fecha.split('-');
                                                        
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
                                                            
                                                            // Si es formato DD-MM-YYYY, convertir a Date
                                                            if (fecha.includes('-') && fecha.length === 10 && !fecha.includes('T')) {
                                                                const [dia, mes, año] = fecha.split('-');
                                                                const fechaConvertida = new Date(`${año}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`);
                                                                return fechaConvertida.toLocaleDateString('es-AR');
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
                                                        🔍 Datos completos de Finnegans:
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
