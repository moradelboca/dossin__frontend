import { useState, useEffect, useCallback, useRef, useMemo, useContext } from 'react';
import {
    Box,
    Typography,
    Button,
    Alert,
    Paper,
    Snackbar,
    IconButton,
    Tooltip,
    Chip,
    CircularProgress,
} from '@mui/material';
import {
    Add,
    Timeline,
    Save,
    CheckCircle,
    Warning,
} from '@mui/icons-material';
import { Gantt, Task, ViewMode } from 'gantt-task-react';
import 'gantt-task-react/dist/index.css';
// Código de idioma español para el Gantt
const spanishLocale = 'es';
import { PlaneacionLote, EstructuraFechasCultivo, ItemPlanificacion } from '../../../../../types/agro';
import { ContextoGeneral } from '../../../../Contexto';

interface TimelinePERTProps {
    planificacion: PlaneacionLote | null;
    estructuraCultivo: EstructuraFechasCultivo | null;
    fechaSiembra: string;
    onUpdate: (planificacion: PlaneacionLote) => void;
}

export function TimelinePERT({ planificacion, estructuraCultivo, fechaSiembra, onUpdate }: TimelinePERTProps) {
    const { theme } = useContext(ContextoGeneral);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.Day);
    const [hasChanges, setHasChanges] = useState(false);
    const [saving, setSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

    const hasInitialized = useRef(false);
    const lastPlanificacionId = useRef<string | null>(null);
    
    // Estabilizar la referencia de onUpdate para evitar re-renders innecesarios
    const stableOnUpdate = useCallback((updatedPlan: PlaneacionLote) => {
        onUpdate(updatedPlan);
    }, [onUpdate]);

    // Convertir planificación a tareas de Gantt - Memoizado para evitar recreaciones
    const planificacionToTasks = useCallback((plan: PlaneacionLote): Task[] => {
        const allItems = [...plan.estructura, ...plan.extras];
        const tasks: Task[] = [];
        
        // Ordenar items por fecha
        const sortedItems = allItems.sort((a, b) => 
            new Date(a.fechaDeRealizacion).getTime() - new Date(b.fechaDeRealizacion).getTime()
        );

        sortedItems.forEach((item) => {
            const startDate = new Date(item.fechaDeRealizacion);
            
            // Usar fechaHasta si existe, sino calcular duración
            let endDate;
            if (item.fechaHasta) {
                endDate = new Date(item.fechaHasta);
            } else {
                endDate = new Date(startDate);
                // Para labores, duración de 3-5 días, para insumos 1 día
                if (item.clasificacion === 'labor') {
                    endDate.setDate(startDate.getDate() + (item.nombre.includes('Siembra') ? 5 : 3));
                } else {
                    endDate.setDate(startDate.getDate() + 1);
                }
            }

            const task: Task = {
                id: item.id,
                name: item.nombre,
                start: startDate,
                end: endDate,
                progress: item.clasificacion === 'labor' ? 0 : 100, // Labores empiezan en 0%, insumos en 100%
                type: item.clasificacion === 'labor' ? 'task' : 'milestone',
                hideChildren: false,
                styles: {
                    backgroundColor: item.clasificacion === 'labor' ? theme.colores.azul : '#388e3c',
                    backgroundSelectedColor: item.clasificacion === 'labor' ? theme.colores.azulOscuro : '#2e7d32',
                    progressColor: item.clasificacion === 'labor' ? theme.colores.azul : '#4caf50',
                    progressSelectedColor: item.clasificacion === 'labor' ? theme.colores.azulOscuro : '#66bb6a',
                },
                dependencies: [], // Sin dependencias para evitar flechas
                project: item.clasificacion === 'labor' ? 'Labores' : 'Insumos',
            };

            tasks.push(task);
        });

        return tasks;
    }, []);

    // Convertir tareas de Gantt a planificación - Memoizado sin dependencias problemáticas
    const tasksToPlanificacion = useCallback((tasks: Task[], originalPlanificacion: PlaneacionLote | null): ItemPlanificacion[] => {
        const resultado = tasks.map(task => {
            const originalItem = originalPlanificacion?.estructura.find(item => item.id === task.id) ||
                                originalPlanificacion?.extras.find(item => item.id === task.id);
            
            if (originalItem) {
                // Convertir fechas correctamente sin problemas de zona horaria
                // Usar UTC para evitar problemas de zona horaria
                const fechaInicio = task.start.toISOString().split('T')[0];
                const fechaFin = task.end.toISOString().split('T')[0];
                
                const itemActualizado = {
                    ...originalItem,
                    fechaDeRealizacion: fechaInicio,
                    fechaHasta: fechaFin,
                };
                
                return itemActualizado;
            }

            // Si no existe, crear uno nuevo
            const fechaInicio = task.start.toISOString().split('T')[0];
            const fechaFin = task.end.toISOString().split('T')[0];
            
            const nuevoItem = {
                id: task.id,
                nombre: task.name,
                precio: 0,
                fechaDeRealizacion: fechaInicio,
                fechaHasta: fechaFin,
                clasificacion: (task.type === 'task' ? 'labor' : 'insumo') as 'labor' | 'insumo',
                custom: true,
            };
            
            return nuevoItem;
        });
        
        return resultado;
    }, []);

    // Generar estructura inicial basada en el cultivo
    const generarEstructuraInicial = useCallback(() => {
        if (!estructuraCultivo || !fechaSiembra) return;

        const fechaSiembraDate = new Date(fechaSiembra);
        const items: ItemPlanificacion[] = [];

        // Agregar labores estándar basadas en la estructura del cultivo
        Object.entries(estructuraCultivo).forEach(([key, diasRelativos]) => {
            if (key === 'cultivo' || key === 'created_at' || key === 'updated_at') return;

            const fecha = new Date(fechaSiembraDate);
            fecha.setDate(fecha.getDate() + diasRelativos);

            const item: ItemPlanificacion = {
                id: `estructura-${key}`,
                nombre: key,
                precio: 0,
                fechaDeRealizacion: fecha.toISOString().split('T')[0],
                clasificacion: key.includes('Siembra') || key.includes('Cosecha') ? 'labor' : 'insumo',
                custom: false,
            };

            items.push(item);
        });

        // Actualizar planificación
        if (planificacion) {
            const updatedPlan = {
                ...planificacion,
                estructura: items,
            };
            stableOnUpdate(updatedPlan);
        }
    }, [estructuraCultivo, fechaSiembra, planificacion, stableOnUpdate]);

    // Guardar cambios en Supabase
    const guardarCambios = async () => {
        if (!planificacion || !hasChanges) {
            return;
        }

        setSaving(true);
        setSaveStatus('idle');

        try {
            // Convertir tareas actuales a planificación
            const estructuraActualizada = tasksToPlanificacion(tasks, planificacion);
            
            // Actualizar la planificación local
            const planificacionActualizada = {
                ...planificacion,
                estructura: estructuraActualizada,
            };

            // NOTA: Ya NO guardamos directamente en Supabase aquí
            // En su lugar, notificamos al componente padre para que maneje la persistencia
            
            // Notificar al componente padre sobre la actualización
            stableOnUpdate(planificacionActualizada);
            
            // Actualizar estado local
            setHasChanges(false);
            setSaveStatus('success');
            
            // Resetear el flag de inicialización para permitir recarga si es necesario
            hasInitialized.current = false;
            
            // Ocultar mensaje de éxito después de 3 segundos
            setTimeout(() => setSaveStatus('idle'), 3000);

        } catch (error) {
            setSaveStatus('error');
            
            // Ocultar mensaje de error después de 5 segundos
            setTimeout(() => setSaveStatus('idle'), 5000);
        } finally {
            setSaving(false);
        }
    };

    // Manejadores de eventos del Gantt
    const onTaskChange = useCallback((task: Task) => {
        // Actualizar tareas locales
        setTasks(prevTasks => {
            const newTasks = prevTasks.map(t => t.id === task.id ? task : t);
            return newTasks;
        });
        
        // Marcar que hay cambios inmediatamente
        setHasChanges(true);
    }, []);

    const onTaskDelete = useCallback((task: Task) => {
        // Actualizar tareas locales
        setTasks(prevTasks => prevTasks.filter(t => t.id !== task.id));
        
        // Marcar que hay cambios
        setHasChanges(true);
    }, []);

    const onProgressChange = useCallback((task: Task) => {
        // Actualizar tareas locales
        setTasks(prevTasks => 
            prevTasks.map(t => t.id === task.id ? task : t)
        );
        
        // Marcar que hay cambios
        setHasChanges(true);
    }, []);

    const onDoubleClick = useCallback(() => {
        // Aquí podrías implementar la lógica para editar la tarea
    }, []);

    const onSelect = useCallback(() => {
    }, []);

    // Detección de cambios ahora se hace directamente en onTaskChange
    // para evitar bucles infinitos con useEffect

    // Memoizar el ID de la planificación para detectar cambios reales
    const planificacionId = useMemo(() => {
        if (!planificacion) return null;
        return `${planificacion.campania}-${planificacion.idLote}-${JSON.stringify(planificacion.estructura)}-${JSON.stringify(planificacion.extras)}`;
    }, [planificacion?.campania, planificacion?.idLote, planificacion?.estructura, planificacion?.extras]);

    // Actualizar tareas cuando cambie la planificación - SOLO cuando realmente cambie
    useEffect(() => {
        if (planificacion && planificacion.estructura.length > 0) {
            // Solo cargar tareas si la planificación realmente cambió
            if (lastPlanificacionId.current !== planificacionId) {
                const newTasks = planificacionToTasks(planificacion);
                setTasks(newTasks);
                setHasChanges(false);
                hasInitialized.current = true;
                lastPlanificacionId.current = planificacionId;
            }
        } else if (!planificacion) {
            // Solo limpiar si no hay planificación
            setTasks([]);
            setHasChanges(false);
            hasInitialized.current = false;
            lastPlanificacionId.current = null;
        }
    }, [planificacionId, planificacion, planificacionToTasks]);

    // Memoizar las props del Gantt para evitar re-renders innecesarios
    const ganttProps = useMemo(() => ({
        tasks,
        viewMode,
        onDateChange: onTaskChange,
        onDelete: onTaskDelete,
        onProgressChange: onProgressChange,
        onDoubleClick: onDoubleClick,
        onSelect: onSelect,
        listCellWidth: "",
        columnWidth: 65,
        rowHeight: 22,
        ganttHeight: Math.max(400, tasks.length * 22),
        headerHeight: 50,
        barCornerRadius: 4,
        barFill: 100,
        handleWidth: 8,
        fontFamily: "Roboto, Arial, sans-serif",
        fontSize: "12px",
        todayColor: "#ff6b6b",
        arrowColor: "#666",
        arrowIndent: 20,
        locale: spanishLocale,
    }), [tasks, viewMode, onTaskChange, onTaskDelete, onProgressChange, onDoubleClick, onSelect]);

    if (!planificacion) {
        return (
            <Box sx={{ p: 3, textAlign: 'center' }}>
                <Alert severity="info">
                    No hay planificación disponible para este lote.
                </Alert>
            </Box>
        );
    }

    return (
        <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Controles del Gantt */}
            <Box sx={{ 
                p: 2, 
                borderBottom: 1, 
                borderColor: 'divider', 
                display: 'flex', 
                gap: 2, 
                alignItems: 'center',
                justifyContent: 'space-between'
            }}>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <Typography variant="h6" sx={{ color: theme.colores.azul }}>Timeline PERT</Typography>
                    
                    
                    
                    {/* Indicador de cambios */}
                    {hasChanges && (
                        <Chip
                            icon={<Warning />}
                            label="Cambios pendientes"
                            color="warning"
                            size="small"
                        />
                    )}
                    
                    {/* Botón de guardado */}
                    <Tooltip title={hasChanges ? "Aplicar cambios" : "Sin cambios para aplicar"}>
                        <span>
                            <IconButton
                                onClick={guardarCambios}
                                disabled={!hasChanges || saving}
                                color={hasChanges ? "primary" : "default"}
                                sx={{
                                    backgroundColor: hasChanges ? theme.colores.azul : 'transparent',
                                    color: hasChanges ? 'white' : 'text.secondary',
                                    '&:hover': {
                                        backgroundColor: hasChanges ? theme.colores.azulOscuro : 'action.hover',
                                    }
                                }}
                            >
                                {saving ? <CircularProgress size={20} /> : <Save />}
                            </IconButton>
                        </span>
                    </Tooltip>
                </Box>

                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                        size="small"
                        variant={viewMode === ViewMode.Day ? 'contained' : 'outlined'}
                        onClick={() => setViewMode(ViewMode.Day)}
                        sx={{
                            ...(viewMode === ViewMode.Day && {
                                backgroundColor: theme.colores.azul,
                                '&:hover': { backgroundColor: theme.colores.azulOscuro }
                            }),
                            ...(viewMode !== ViewMode.Day && {
                                borderColor: theme.colores.azul,
                                color: theme.colores.azul,
                                '&:hover': { 
                                    borderColor: theme.colores.azulOscuro,
                                    backgroundColor: 'rgba(22, 54, 96, 0.04)'
                                }
                            })
                        }}
                    >
                        Día
                    </Button>
                    <Button
                        size="small"
                        variant={viewMode === ViewMode.Week ? 'contained' : 'outlined'}
                        onClick={() => setViewMode(ViewMode.Week)}
                        sx={{
                            ...(viewMode === ViewMode.Week && {
                                backgroundColor: theme.colores.azul,
                                '&:hover': { backgroundColor: theme.colores.azulOscuro }
                            }),
                            ...(viewMode !== ViewMode.Week && {
                                borderColor: theme.colores.azul,
                                color: theme.colores.azul,
                                '&:hover': { 
                                    borderColor: theme.colores.azulOscuro,
                                    backgroundColor: 'rgba(22, 54, 96, 0.04)'
                                }
                            })
                        }}
                    >
                        Semana
                    </Button>
                    <Button
                        size="small"
                        variant={viewMode === ViewMode.Month ? 'contained' : 'outlined'}
                        onClick={() => setViewMode(ViewMode.Month)}
                        sx={{
                            ...(viewMode === ViewMode.Month && {
                                backgroundColor: theme.colores.azul,
                                '&:hover': { backgroundColor: theme.colores.azulOscuro }
                            }),
                            ...(viewMode !== ViewMode.Month && {
                                borderColor: theme.colores.azul,
                                color: theme.colores.azul,
                                '&:hover': { 
                                    borderColor: theme.colores.azulOscuro,
                                    backgroundColor: 'rgba(22, 54, 96, 0.04)'
                                }
                            })
                        }}
                    >
                        Mes
                    </Button>
                </Box>
            </Box>

            {/* Gantt Chart */}
            <Paper elevation={1} sx={{ flex: 1}}>
                {tasks.length > 0 ? (
                    <Box sx={{ 
                        width: '100%',
                        minHeight: '100px',
                        maxHeight: '5000px', // Alto dinámico sin padding extra
                        overflow: 'auto' // Scroll tanto vertical como horizontal
                    }}>
                        <Gantt {...ganttProps} />
                    </Box>
                ) : (
                    <Box sx={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        minHeight: '400px',
                        p: 3,
                        textAlign: 'center'
                    }}>
                        <Timeline sx={{ fontSize: 48, color: theme.colores.azul, mb: 2 }} />
                        <Typography variant="h6" color="text.secondary" gutterBottom>
                            No hay estructura de planificación
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            {planificacion?.estructura.length === 0 
                                ? 'La planificación no tiene estructura definida. Usa "Generar Estructura Inicial" para crear la estructura base del cultivo.'
                                : 'Cargando estructura de planificación...'
                            }
                        </Typography>
                        {planificacion?.estructura.length === 0 && (
                            <Button
                                variant="contained"
                                startIcon={<Add />}
                                onClick={generarEstructuraInicial}
                                disabled={!estructuraCultivo || !fechaSiembra}
                                sx={{
                                    backgroundColor: theme.colores.azul,
                                    '&:hover': { backgroundColor: theme.colores.azulOscuro }
                                }}
                            >
                                Generar Estructura Inicial
                            </Button>
                        )}
                    </Box>
                )}
            </Paper>

            {/* Snackbar para mensajes de guardado */}
            <Snackbar
                open={saveStatus !== 'idle'}
                autoHideDuration={saveStatus === 'success' ? 3000 : 5000}
                onClose={() => setSaveStatus('idle')}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert
                    onClose={() => setSaveStatus('idle')}
                    severity={saveStatus === 'success' ? 'success' : 'error'}
                    sx={{ width: '100%' }}
                    icon={saveStatus === 'success' ? <CheckCircle /> : <Warning />}
                >
                    {saveStatus === 'success' 
                        ? '✅ Cambios notificados exitosamente' 
                        : '❌ Error al notificar los cambios'
                    }
                </Alert>
            </Snackbar>
        </Box>
    );
}
