import React, { useState, useEffect, useRef } from 'react';
import {
    Dialog,
    DialogContent,
    IconButton,
    Box,
    Typography,
    Tabs,
    Tab,
    Button,
    Snackbar,
    Alert,
    CircularProgress,
    Card,
    CardContent,
} from '@mui/material';
import {
    Close,
    Timeline,
    AttachMoney,
    CloudQueue,
    Campaign as CampaignIcon,
    Add as AddIcon,
    Info as InfoIcon,
    TrendingUp,
    Assignment,
} from '@mui/icons-material';
import { ContextoGeneral } from '../../../../Contexto';
import { PlaneacionLote } from '../../../../../types/agro';
import { CostosPanel } from '../CostosPanel';
import { TimelinePERT } from '../timeline';
import { ClimaPanel } from '../clima';
import { RentabilidadPanel } from '../rentabilidad';
import { OrdenesTrabajoPanel } from '../ordenes-trabajo';
import { supabaseAgro } from '../../../../../lib/supabase';
import { CampañaSelector } from './CampañaSelector';
import { PlanificacionForm } from './PlanificacionForm';

interface PlanificacionDialogProps {
    open: boolean;
    onClose: () => void;
    planificacion: PlaneacionLote;
    lote: any;
    ubicacion: any;
    onDeleteLote?: () => void;
    onPlanificacionUpdated?: (planificacion: PlaneacionLote) => void; // Nueva prop para notificar cambios
    onCampañaChange?: (campaña: string) => void; // Nueva prop para notificar cambio de campaña
}

export function PlanificacionDialog({ 
    open, 
    onClose, 
    planificacion: initialPlanificacion, 
    lote, 
    ubicacion, 
    onDeleteLote,
    onPlanificacionUpdated,
    onCampañaChange 
}: PlanificacionDialogProps) {
    const { theme } = React.useContext(ContextoGeneral);
    const [activeTab, setActiveTab] = useState(0);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    
    // Estado para la campaña seleccionada
    const [campañaSeleccionada, setCampañaSeleccionada] = useState<string>(initialPlanificacion.campania);
    
    // Convertir planificación a estado local para poder actualizarla
    const [planificacion, setPlanificacion] = useState<PlaneacionLote>(initialPlanificacion);
    
    // Estado para controlar si hay planificación para la campaña seleccionada
    const [tienePlanificacion, setTienePlanificacion] = useState<boolean>(true);
    const [cargandoPlanificacion, setCargandoPlanificacion] = useState<boolean>(false);
    const [mostrarFormularioCreacion, setMostrarFormularioCreacion] = useState<boolean>(false);

    const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const initialized = useRef(false); // Para evitar inicialización múltiple

    // Resetear el estado cuando se cierre el diálogo
    const handleClose = () => {
        initialized.current = false; // Resetear para la próxima apertura
        onClose();
    };

    // Sincronizar estado local cuando cambie la prop inicial
    // PERO solo si no tenemos cambios locales pendientes
    useEffect(() => {
        // Solo inicializar una vez para evitar bucles
        if (!initialized.current) {
            setPlanificacion(initialPlanificacion);
            initialized.current = true;
        } else if (!planificacion || planificacion.estructura.length === 0) {
            setPlanificacion(initialPlanificacion);
        }
        // Si ya tenemos una planificación local, NO la sobrescribamos
        // para preservar los cambios del usuario
    }, [initialPlanificacion]); // Solo depende de initialPlanificacion

    const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
        setActiveTab(newValue);
    };

    const handleDeleteClick = () => {
        setShowDeleteConfirm(true);
    };

    const handleConfirmDelete = () => {
        if (onDeleteLote) {
            onDeleteLote();
            setShowDeleteConfirm(false);
            onClose();
        }
    };

    const handleCancelDelete = () => {
        setShowDeleteConfirm(false);
    };

    // Función para manejar el cambio de campaña
    const handleCampañaChange = async (nuevaCampaña: string) => {
        setCampañaSeleccionada(nuevaCampaña);
        setCargandoPlanificacion(true);
        
        // Notificar al componente padre sobre el cambio de campaña
        if (onCampañaChange) {
            onCampañaChange(nuevaCampaña);
        }

        // Cargar la planificación de la nueva campaña
        try {
            const { data, error } = await supabaseAgro
                .from('PlaneacionLote')
                .select('*')
                .eq('campania', nuevaCampaña)
                .eq('idLote', planificacion.idLote)
                .eq('idUbicacion', planificacion.idUbicacion)
                .single();

            if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
                throw error;
            }

            if (data) {
                // Si existe planificación para esta campaña, cargarla
                setPlanificacion(data);
                setTienePlanificacion(true);
            } else {
                // Si no existe, marcar que no hay planificación
                setTienePlanificacion(false);
            }
        } catch (error) {
            console.error('Error cargando planificación de la campaña:', error);
            setSaveStatus('error');
            setTienePlanificacion(false);
        } finally {
            setCargandoPlanificacion(false);
        }
    };

    // Función para abrir el formulario de creación de planificación
    const handleCrearPlanificacion = () => {
        setMostrarFormularioCreacion(true);
    };

    // Función para manejar cuando se crea una nueva planificación
    const handlePlanificacionCreada = (nuevaPlanificacion: PlaneacionLote) => {
        setPlanificacion(nuevaPlanificacion);
        setTienePlanificacion(true);
        setMostrarFormularioCreacion(false);
        
        // Notificar al componente padre
        if (onPlanificacionUpdated) {
            onPlanificacionUpdated(nuevaPlanificacion);
        }
    };

    // Función para manejar cambios en datos comerciales
    const handleDatosComercialesChange = (datosComerciales: any) => {
        console.log('📝 Datos comerciales cambiaron:', datosComerciales);
        setPlanificacion(prev => ({
            ...prev,
            datos_comerciales: datosComerciales
        }));
    };

    // Función para manejar actualizaciones desde TimelinePERT
    const handlePlanificacionUpdate = async (updatedPlan: PlaneacionLote) => {
        setSaveStatus('idle');

        try {
            // Guardar en Supabase
            const { error } = await supabaseAgro
                .from('PlaneacionLote')
                .update({
                    estructura: updatedPlan.estructura,
                    extras: updatedPlan.extras,
                    updated_at: new Date().toISOString()
                })
                .eq('campania', updatedPlan.campania)
                .eq('idLote', updatedPlan.idLote);

            if (error) {
                throw error;
            }

            // IMPORTANTE: Actualizar estado local ANTES de notificar al padre
            setPlanificacion(updatedPlan);
            
            // Notificar al componente padre sobre la actualización
            if (onPlanificacionUpdated) {
                onPlanificacionUpdated(updatedPlan);
            }
            
            // También actualizar la prop inicial para que se mantenga sincronizada
            // Esto es importante para que cuando se vuelva a abrir el diálogo
            // se mantengan los cambios guardados

            setSaveStatus('success');

            // Ocultar mensaje de éxito después de 3 segundos
            setTimeout(() => setSaveStatus('idle'), 3000);

        } catch (error) {
            setSaveStatus('error');
            
            // Ocultar mensaje de error después de 5 segundos
            setTimeout(() => setSaveStatus('idle'), 5000);
        }
    };

    return (
        <Dialog 
            open={open} 
            onClose={handleClose} 
            maxWidth="xl" 
            fullWidth
            PaperProps={{
                sx: {
                    height: '90vh',
                    maxHeight: '90vh',
                    overflow: 'hidden' // El dialog no hace scroll
                }
            }}
        >
            <DialogContent sx={{ 
                p: 0, 
                overflow: 'hidden', // El content no hace scroll
                display: 'flex',
                flexDirection: 'column',
                height: '100%'
            }}>
                {/* Header - Fijo */}
                <Box sx={{ 
                    p: 3, 
                    borderBottom: 1, 
                    borderColor: 'divider',
                    flexShrink: 0 // No se encoge
                }}>
                    {/* Primera fila - Título y botones */}
                    <Box sx={{ 
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mb: 2
                    }}>
                        <Box>
                            <Typography variant="h4" sx={{ color: theme.colores.azul, mb: 1 }}>
                                Planificación Agrícola - {lote?.nombre} • {ubicacion?.nombre}
                            </Typography>
                            <Typography variant="body1" color="text.secondary">
                                Superficie: {planificacion.superficie} ha
                            </Typography>
                            {planificacion.datos_comerciales?.titular_carta_porte?.cuit && (
                                <Typography variant="body1" color="text.secondary">
                                    Empresa Productora: {planificacion.datos_comerciales.titular_carta_porte.razon_social || `CUIT: ${planificacion.datos_comerciales.titular_carta_porte.cuit}`}
                                </Typography>
                            )}
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                            <Button
                                variant="outlined"
                                color="error"
                                onClick={handleDeleteClick}
                                sx={{ 
                                    borderColor: '#d32f2f',
                                    color: '#d32f2f',
                                    '&:hover': { 
                                        borderColor: '#d32f2f',
                                        backgroundColor: 'rgba(211, 47, 47, 0.04)' 
                                    }
                                }}
                            >
                                Eliminar Lote
                            </Button>

                            <IconButton onClick={handleClose} size="large">
                                <Close />
                            </IconButton>
                        </Box>
                    </Box>

                    {/* Segunda fila - Selector de campaña */}
                    <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 2,
                        flexWrap: 'wrap'
                    }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 200 }}>
                            <CampaignIcon color="primary" />
                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                Seleccionar Campaña:
                            </Typography>
                        </Box>
                        <Box sx={{ minWidth: 300, maxWidth: 400 }}>
                            <CampañaSelector
                                campañaSeleccionada={campañaSeleccionada}
                                onCampañaChange={handleCampañaChange}
                                showLabel={false}
                                size="small"
                                fullWidth={true}
                            />
                        </Box>
                    </Box>
                </Box>

                {/* Tabs */}
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs 
                        value={activeTab} 
                        onChange={handleTabChange} 
                        sx={{ 
                            px: 3,
                            '& .MuiTab-root': {
                                color: 'text.secondary',
                                '&.Mui-selected': {
                                    color: theme.colores.azul,
                                },
                                '&:hover': {
                                    color: theme.colores.azul,
                                }
                            },
                            '& .MuiTabs-indicator': {
                                backgroundColor: theme.colores.azul,
                            }
                        }}
                    >
                        <Tab 
                            icon={<Timeline />} 
                            label="TIMELINE PERT" 
                            iconPosition="start"
                        />
                        <Tab 
                            icon={<TrendingUp />} 
                            label="💰 RENTABILIDAD" 
                            iconPosition="start"
                        />
                        <Tab 
                            icon={<AttachMoney />} 
                            label="$ COSTOS" 
                            iconPosition="start"
                        />
                        <Tab 
                            icon={<CloudQueue />} 
                            label="🌤️ CLIMA" 
                            iconPosition="start"
                        />
                        <Tab 
                            icon={<Assignment />} 
                            label="📋 ÓRDENES" 
                            iconPosition="start"
                        />
                    </Tabs>
                </Box>

                {/* Tab Content - Con scroll */}
                <Box sx={{ 
                    flex: 1, 
                    overflow: 'auto', // Solo los tabs hacen scroll
                    p: 3,
                    display: 'flex',
                    flexDirection: 'column',
                    minHeight: 0 // Importante para que funcione el flex
                }}>
                    {/* Mostrar mensaje si no hay planificación */}
                    {!tienePlanificacion && !cargandoPlanificacion && (
                        <Box sx={{ 
                            display: 'flex', 
                            justifyContent: 'center', 
                            alignItems: 'center',
                            minHeight: '60vh', // Asegurar altura mínima
                            p: 2
                        }}>
                            <Card sx={{ 
                                maxWidth: 600, 
                                width: '100%',
                                border: `2px dashed ${theme.colores.azul}`,
                                backgroundColor: 'rgba(25, 118, 210, 0.02)',
                                boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                            }}>
                                <CardContent sx={{ textAlign: 'center', p: 4 }}>
                                    <InfoIcon sx={{ 
                                        fontSize: 64, 
                                        color: theme.colores.azul, 
                                        mb: 2 
                                    }} />
                                    <Typography variant="h5" sx={{ 
                                        color: theme.colores.azul, 
                                        mb: 2,
                                        fontWeight: 600
                                    }}>
                                        No hay planificación para esta campaña
                                    </Typography>
                                    <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                                        La campaña <strong>{campañaSeleccionada}</strong> no tiene ninguna planificación 
                                        para el lote <strong>{lote?.nombre}</strong>.
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                                        ¿Deseas crear una nueva planificación para esta campaña?
                                    </Typography>
                                    <Button
                                        variant="contained"
                                        startIcon={<AddIcon />}
                                        onClick={handleCrearPlanificacion}
                                        sx={{
                                            backgroundColor: theme.colores.azul,
                                            '&:hover': {
                                                backgroundColor: theme.colores.azul,
                                                opacity: 0.9
                                            },
                                            px: 4,
                                            py: 1.5,
                                            fontSize: '1.1rem'
                                        }}
                                    >
                                        Crear Planificación
                                    </Button>
                                </CardContent>
                            </Card>
                        </Box>
                    )}

                    {/* Mostrar loading si está cargando */}
                    {cargandoPlanificacion && (
                        <Box sx={{ 
                            display: 'flex', 
                            flexDirection: 'column',
                            alignItems: 'center', 
                            justifyContent: 'center',
                            flex: 1,
                            gap: 2
                        }}>
                            <CircularProgress size={48} sx={{ color: theme.colores.azul }} />
                            <Typography variant="h6" color="text.secondary">
                                Cargando planificación...
                            </Typography>
                        </Box>
                    )}

                    {/* Mostrar contenido normal si hay planificación */}
                    {tienePlanificacion && !cargandoPlanificacion && (
                        <>
                            {activeTab === 0 && (
                                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                                 
                                    <Box sx={{ flex: 1, minHeight: 0 }}>
                                        <TimelinePERT 
                                            planificacion={planificacion}
                                            estructuraCultivo={null} // Por ahora null, se puede cargar después
                                            fechaSiembra={planificacion.fechaSiembra || ''}
                                            onUpdate={handlePlanificacionUpdate}
                                        />
                                    </Box>
                                </Box>
                            )}

                            {activeTab === 1 && (
                                <RentabilidadPanel 
                                    planificacion={planificacion}
                                />
                            )}

                            {activeTab === 2 && (
                                <CostosPanel 
                                    planificacion={planificacion}
                                    onUpdate={handlePlanificacionUpdate}
                                />
                            )}

                            {activeTab === 3 && (
                                <ClimaPanel 
                                    ubicacion={ubicacion}
                                    planificacion={planificacion}
                                    onPlanificacionUpdated={handlePlanificacionUpdate}
                                />
                            )}

                            {activeTab === 4 && (
                                <OrdenesTrabajoPanel 
                                    ubicacion={ubicacion}
                                />
                            )}
                        </>
                    )}
                </Box>
            </DialogContent>

            {/* Diálogo de confirmación para eliminar */}
            <Dialog open={showDeleteConfirm} onClose={handleCancelDelete} maxWidth="sm" fullWidth>
                <DialogContent sx={{ p: 3 }}>
                    <Typography variant="h6" sx={{ mb: 2, color: '#d32f2f' }}>
                        ⚠️ Confirmar Eliminación
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 3 }}>
                        ¿Estás seguro de que quieres eliminar el lote <strong>"{lote?.nombre}"</strong>?
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        Esta acción eliminará:
                        <br />• El lote completo
                        <br />• Toda la planificación de la campaña {planificacion.campania}
                        <br />• Archivos KMZ asociados
                        <br />• <strong>Esta acción no se puede deshacer</strong>
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                        <Button onClick={handleCancelDelete} variant="outlined">
                            Cancelar
                        </Button>
                        <Button 
                            onClick={handleConfirmDelete} 
                            variant="contained" 
                            color="error"
                            sx={{ 
                                backgroundColor: '#d32f2f',
                                '&:hover': { backgroundColor: '#b71c1c' }
                            }}
                        >
                            Eliminar Definitivamente
                        </Button>
                    </Box>
                </DialogContent>
            </Dialog>

            {/* Snackbar para mostrar el estado de guardado */}
            <Snackbar open={saveStatus !== 'idle'} autoHideDuration={6000} onClose={() => setSaveStatus('idle')}>
                <Alert onClose={() => setSaveStatus('idle')} severity={saveStatus === 'success' ? 'success' : saveStatus === 'error' ? 'error' : 'info'} sx={{ width: '100%' }}>
                    {saveStatus === 'success' ? 'Planificación actualizada exitosamente!' : saveStatus === 'error' ? 'Error al actualizar la planificación.' : ''}
                </Alert>
            </Snackbar>

            {/* Diálogo de formulario de creación de planificación */}
            {mostrarFormularioCreacion && (
                <PlanificacionForm
                    open={mostrarFormularioCreacion}
                    onClose={() => setMostrarFormularioCreacion(false)}
                    lote={lote}
                    ubicacion={ubicacion}
                    onPlanificacionCreada={handlePlanificacionCreada}
                    campaniaPrecargada={campañaSeleccionada}
                    onDatosComercialesChange={handleDatosComercialesChange}
                />
            )}
        </Dialog>
    );
}
