import { useState, useEffect, useCallback } from 'react';
import L from 'leaflet';
import { 
    uploadKMZToSupabase, 
    deleteKMZFromSupabase,
    supabase,
    supabaseAgro,
    KMZ_BUCKET_NAME
} from '../../../../../lib/supabase';
import { parseKML, parseKMZ, addClickHandlerToLayer } from './kmzUtils';
import { Lote, Establecimiento } from './types';
import { PlaneacionLote } from '../../../../../types/agro';
import { useAuth } from '../../../../autenticacion/ContextoAuth';

export function useLotesPanel(
    ubicacion: any,
    map: L.Map | null,
    onTogglePins?: (show: boolean) => void,
    onLoteClick?: (lote: any) => void
) {
    const { user } = useAuth();
    const isAdmin = user?.rol?.id === 1;
    
    const [lotes, setLotes] = useState<Lote[]>([]);
    const [establecimiento, setEstablecimiento] = useState<Establecimiento | null>(null);
    const [expandedLote, setExpandedLote] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [kmzDialogOpen, setKmzDialogOpen] = useState(false);
    const [selectedLote, setSelectedLote] = useState<Lote | null>(null);
    const [hasVisibleKMZ, setHasVisibleKMZ] = useState(false);
    const [planificacionFormOpen, setPlanificacionFormOpen] = useState(false);
    const [planificacionDialogOpen, setPlanificacionDialogOpen] = useState(false);
    const [planificacion, setPlanificacion] = useState<PlaneacionLote | null>(null);
    const [nuevoLoteFormOpen, setNuevoLoteFormOpen] = useState(false);
    const [editorEstructuraOpen, setEditorEstructuraOpen] = useState(false);

    // Función para manejar el click en el polígono
    const handlePolygonClick = useCallback((lote: Lote) => {
        // Verificar que el lote existe y tiene un ID válido
        if (!lote || !lote.id) {
            console.warn('Lote inválido en handlePolygonClick:', lote);
            return;
        }

        // Buscar el lote completo en el estado actual
        const loteCompleto = lotes.find(l => l.id === lote.id);
        
        // Si el lote tiene planificación, abrir el diálogo directamente
        if (loteCompleto && loteCompleto.planificacion) {
            openPlanificacionDialog(loteCompleto);
        }
        // También llamar al callback del componente padre si existe
        if (onLoteClick) {
            onLoteClick(loteCompleto || lote);
        }
    }, [onLoteClick, lotes]);

    // Efecto para controlar la visibilidad de los pines cuando cambia el estado de los lotes
    useEffect(() => {
        if (onTogglePins && isAdmin) {
            const hasKMZ = lotes.some(lote => lote.kmzLayer && lote.visible);
            if (hasKMZ !== hasVisibleKMZ) {
                setHasVisibleKMZ(hasKMZ);
                onTogglePins(!hasKMZ);
            }
        }
    }, [lotes, onTogglePins, hasVisibleKMZ, isAdmin]);

    // Efecto para restaurar los pines cuando se cierra el panel
    useEffect(() => {
        return () => {
            if (onTogglePins) {
                onTogglePins(true);
            }
        };
    }, [onTogglePins]);

    // Obtener datos reales de establecimiento y lotes
    useEffect(() => {
        if (ubicacion) {
            setLoading(true);
            
            // Obtener información del establecimiento desde la ubicación
            setEstablecimiento({
                id: ubicacion.establecimiento?.id || ubicacion.id,
                nombre: ubicacion.establecimiento?.nombre || ubicacion.nombre,
                razonSocial: ubicacion.establecimiento?.razonSocial || 'Establecimiento',
                cuit: ubicacion.establecimiento?.cuit || 'Sin CUIT',
                provincia: ubicacion.localidad?.provincia?.nombre || 'Sin provincia',
                localidad: ubicacion.localidad?.nombre || 'Sin localidad'
            });

            // Cargar lotes reales de la base de datos
            loadLotesFromDatabase();
        }
    }, [ubicacion]);

    const loadLotesFromDatabase = async (showLoading: boolean = true) => {
        try {
            if (showLoading) {
                setLoading(true);
            }
            
            // Obtener todos los lotes de esta ubicación desde la base de datos
            const { data: planificaciones, error } = await supabaseAgro
                .from('PlaneacionLote')
                .select('*')
                .eq('idUbicacion', ubicacion.id)
                .order('campania', { ascending: false });

            if (error) {
                console.error('Error cargando lotes:', error);
                setLotes([]);
                if (showLoading) {
                    setLoading(false);
                }
                return;
            }

            if (!planificaciones || planificaciones.length === 0) {
                // No hay lotes planificados para esta ubicación
                setLotes([]);
                if (showLoading) {
                    setLoading(false);
                }
                return;
            }

            // Agrupar por idLote y obtener la planificación más reciente de cada lote
            const lotesMap = new Map();
            planificaciones.forEach(planificacion => {
                if (!lotesMap.has(planificacion.idLote)) {
                    lotesMap.set(planificacion.idLote, planificacion);
                }
            });

            // Convertir a array de lotes
            const lotesReales = Array.from(lotesMap.values()).map(planificacion => ({
                id: planificacion.idLote,
                nombre: planificacion.idLote,
                superficie: planificacion.superficie,
                cultivo: planificacion.cultivo?.toString(),
                estado: 'Planificado',
                visible: false,
                campania: planificacion.campania
            }));

            setLotes(lotesReales);
            
            // Verificar archivos KMZ y planificaciones para cada lote
            lotesReales.forEach(lote => {
                checkExistingKMZFile(lote.id);
                checkExistingPlanificacion(lote.id);
            });

        } catch (error) {
            console.error('Error cargando lotes de la base de datos:', error);
            setLotes([]);
        } finally {
            if (showLoading) {
                setLoading(false);
            }
        }
    };

    const checkExistingPlanificacion = async (loteId: string) => {
        try {
            // Buscar planificaciones para diferentes campañas
            const { data, error } = await supabaseAgro
                .from('PlaneacionLote')
                .select('*')
                .eq('idLote', loteId)
                .eq('idUbicacion', ubicacion.id)
                .order('campania', { ascending: false })
                .limit(1);

            if (error && error.code !== 'PGRST116') {
                console.error('Error verificando planificación:', error);
                return;
            }

            if (data && data.length > 0) {
                // Actualizar la planificación del lote específico
                setLotes(prev => prev.map(lote => 
                    lote.id === loteId 
                        ? { ...lote, planificacion: data[0] }
                        : lote
                ));
            }
        } catch (error) {
            console.error('Error verificando planificación:', error);
        }
    };

    const checkExistingKMZFile = async (loteId: string) => {
        if (!ubicacion) return;
        
        try {
            const { data: files, error } = await supabase.storage
                .from(KMZ_BUCKET_NAME)
                .list(`${ubicacion.id}/${loteId}`);
            
            if (error) return;
            
            if (files && files.length > 0) {
                const latestFile = files[files.length - 1];
                
                setLotes(prev => prev.map(lote => {
                    if (lote.id === loteId) {
                        return {
                            ...lote,
                            kmzFile: {
                                path: `${ubicacion.id}/${loteId}/${latestFile.name}`,
                                url: `${supabase.storage.from(KMZ_BUCKET_NAME).getPublicUrl(`${ubicacion.id}/${loteId}/${latestFile.name}`).data.publicUrl}`,
                                fileName: latestFile.name
                            }
                        };
                    }
                    return lote;
                }));
                
                try {
                    const { data: fileData, error: downloadError } = await supabase.storage
                        .from(KMZ_BUCKET_NAME)
                        .download(`${ubicacion.id}/${loteId}/${latestFile.name}`);
                    
                    if (downloadError) {
                        console.error('Error descargando archivo:', downloadError);
                        return;
                    }
                    
                    let layerGroup: L.LayerGroup;
                    
                    if (latestFile.name.toLowerCase().endsWith('.kmz')) {
                        layerGroup = await parseKMZ(await fileData.arrayBuffer());
                    } else {
                        const kmlString = await fileData.text();
                        layerGroup = parseKML(kmlString);
                    }
                    
                    // Agregar el manejador de click al layer
                    // Crear un objeto lote temporal para el click handler
                    const loteTemp = {
                        id: loteId,
                        nombre: loteId,
                        superficie: undefined,
                        cultivo: undefined,
                        estado: 'Planificado',
                        visible: false,
                        campania: undefined,
                        planificacion: undefined
                    };
                    addClickHandlerToLayer(layerGroup, handlePolygonClick, loteTemp);
                    
                    setLotes(prev => prev.map(lote => {
                        if (lote.id === loteId) {
                            return {
                                ...lote,
                                kmzLayer: layerGroup,
                                visible: true
                            };
                        }
                        return lote;
                    }));
                    
                    if (map && isAdmin) {
                        layerGroup.addTo(map);
                    }
                    
                    if (onTogglePins) {
                        onTogglePins(false);
                    }
                    
                } catch (error) {
                    console.error('Error cargando archivo KMZ al mapa:', error);
                }
            }
            
        } catch (error) {
            console.error('Error verificando archivo KMZ existente:', error);
        }
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!map || !selectedLote || !ubicacion) return;
        
        const files = event.target.files;
        if (!files || files.length === 0) return;

        const file = files[0];
        if (file.name.toLowerCase().endsWith('.kmz') || file.name.toLowerCase().endsWith('.kml')) {
            try {
                setLoading(true);
                
                const uploadResult = await uploadKMZToSupabase(
                    file, 
                    selectedLote.id, 
                    ubicacion.id.toString()
                );
                
                if (!uploadResult) {
                    throw new Error('Error al subir el archivo a Supabase');
                }
                
                let layerGroup: L.LayerGroup;
                
                if (file.name.toLowerCase().endsWith('.kmz')) {
                    layerGroup = await parseKMZ(await file.arrayBuffer());
                } else {
                    const kmlString = await file.text();
                    layerGroup = parseKML(kmlString);
                }
                
                // Agregar el manejador de click al layer
                addClickHandlerToLayer(layerGroup, handlePolygonClick, selectedLote);
                
                setLotes(prev => prev.map(lote => {
                    if (lote.id === selectedLote.id) {
                        if (lote.kmzLayer && map) {
                            map.removeLayer(lote.kmzLayer);
                        }
                        
                        return {
                            ...lote,
                            kmzLayer: layerGroup,
                            visible: true,
                            kmzFile: {
                                path: uploadResult.path,
                                url: uploadResult.url,
                                fileName: file.name
                            }
                        };
                    }
                    return lote;
                }));
                
                if (map && isAdmin) {
                    layerGroup.addTo(map);
                }
                
                if (onTogglePins) {
                    onTogglePins(false);
                }
                
                setKmzDialogOpen(false);
                setSelectedLote(null);
                setLoading(false);
                
                alert(`Archivo ${file.name} subido exitosamente a Supabase`);
                
            } catch (error) {
                console.error('Error processing file:', error);
                setLoading(false);
                alert(`Error al procesar el archivo: ${error instanceof Error ? error.message : 'Error desconocido'}`);
            }
        }
    };

    const toggleLoteVisibility = (loteId: string) => {
        if (!map) return;
        
        setLotes(prev => prev.map(lote => {
            if (lote.id === loteId) {
                const newVisible = !lote.visible;
                if (lote.kmzLayer && isAdmin) {
                    if (newVisible) {
                        lote.kmzLayer.addTo(map);
                    } else {
                        map.removeLayer(lote.kmzLayer);
                    }
                }
                return { ...lote, visible: newVisible };
            }
            return lote;
        }));
        
        if (onTogglePins && isAdmin) {
            const hasKMZ = lotes.some(lote => 
                lote.id === loteId ? 
                (lote.kmzLayer && !lote.visible) : 
                (lote.kmzLayer && lote.visible)
            );
            onTogglePins(!hasKMZ);
        }
    };

    const removeLoteKMZ = async (loteId: string) => {
        if (!map) return;
        
        const lote = lotes.find(l => l.id === loteId);
        if (!lote) return;
        
        try {
            if (lote.kmzFile?.path) {
                const deleted = await deleteKMZFromSupabase(lote.kmzFile.path);
                if (!deleted) {
                    console.warn('No se pudo eliminar el archivo de Supabase');
                }
            }
            
            if (lote.kmzLayer) {
                map.removeLayer(lote.kmzLayer);
            }
            
            setLotes(prev => prev.map(l => {
                if (l.id === loteId) {
                    return { 
                        ...l, 
                        kmzLayer: undefined, 
                        visible: false,
                        kmzFile: undefined
                    };
                }
                return l;
            }));
            
            if (onTogglePins) {
                const hasKMZ = lotes.some(l => 
                    l.id !== loteId && l.kmzLayer && l.visible
                );
                onTogglePins(!hasKMZ);
            }
            
        } catch (error) {
            console.error('Error removing KMZ:', error);
            alert('Error al eliminar el archivo KMZ');
        }
    };

    const openKmzDialog = (lote: Lote) => {
        setSelectedLote(lote);
        setKmzDialogOpen(true);
    };

    const toggleExpandedLote = (loteId: string) => {
        setExpandedLote(expandedLote === loteId ? null : loteId);
    };

    const openPlanificacionForm = (lote: Lote) => {
        setSelectedLote(lote);
        setPlanificacionFormOpen(true);
    };

    const openPlanificacionDialog = async (lote: Lote) => {
        try {
            setSelectedLote(lote);
            
            // Recargar la planificación desde la base de datos para obtener los cambios más recientes
            const { data: planificacionActualizada, error } = await supabaseAgro
                .from('PlaneacionLote')
                .select('*')
                .eq('idLote', lote.id)
                .eq('idUbicacion', ubicacion.id)
                .single();

            if (error) {
                console.error('Error cargando planificación actualizada:', error);
                // Si hay error, usar la planificación en memoria como fallback
                if (lote.planificacion) {
                    setPlanificacion(lote.planificacion);
                    setPlanificacionDialogOpen(true);
                }
                return;
            }

            if (planificacionActualizada) {
                setPlanificacion(planificacionActualizada);
                setPlanificacionDialogOpen(true);
            } else if (lote.planificacion) {
                // Si no hay en BD, usar la de memoria como fallback
                setPlanificacion(lote.planificacion);
                setPlanificacionDialogOpen(true);
            }
        } catch (error) {
            console.error('Error al abrir diálogo de planificación:', error);
            // Fallback a la planificación en memoria
            if (lote.planificacion) {
                setPlanificacion(lote.planificacion);
                setPlanificacionDialogOpen(true);
            }
        }
    };

    const closePlanificacionForm = () => {
        setPlanificacionFormOpen(false);
    };

    const closePlanificacionDialog = () => {
        setPlanificacionDialogOpen(false);
    };

    const onPlanificacionCreada = async (planificacion: PlaneacionLote) => {
        // Cerrar el formulario primero
        setPlanificacionFormOpen(false);
        
        // Recargar la lista completa desde la base de datos para asegurar sincronización
        // No mostrar loading para evitar interrumpir la experiencia del usuario
        await loadLotesFromDatabase(false);
        
        // Establecer la planificación
        setPlanificacion(planificacion);
    };

    const openNuevoLoteForm = () => {
        setNuevoLoteFormOpen(true);
    };

    const closeNuevoLoteForm = () => {
        setNuevoLoteFormOpen(false);
    };

    const onNuevoLoteCreado = async (planificacion: PlaneacionLote) => {
        // Cerrar el formulario primero
        setNuevoLoteFormOpen(false);
        
        // Recargar la lista completa desde la base de datos para asegurar sincronización
        // No mostrar loading para evitar interrumpir la experiencia del usuario
        await loadLotesFromDatabase(false);
        
        // Establecer la planificación para el nuevo lote
        setPlanificacion(planificacion);
    };

    const deleteLote = async (loteId: string) => {
        try {
            setLoading(true);
            
            // 1. Eliminar la planificación de la base de datos
            const { error: planificacionError } = await supabaseAgro
                .from('PlaneacionLote')
                .delete()
                .eq('idLote', loteId)
                .eq('idUbicacion', ubicacion.id);

            if (planificacionError) {
                console.error('Error eliminando planificación:', planificacionError);
                throw new Error('Error al eliminar la planificación del lote');
            }

            // 2. Eliminar archivos KMZ del storage
            if (ubicacion) {
                try {
                    const { data: files, error: listError } = await supabase.storage
                        .from(KMZ_BUCKET_NAME)
                        .list(`${ubicacion.id}/${loteId}`);
                    
                    if (!listError && files && files.length > 0) {
                        // Eliminar todos los archivos del lote
                        for (const file of files) {
                            await deleteKMZFromSupabase(`${ubicacion.id}/${loteId}/${file.name}`);
                        }
                    }
                } catch (storageError) {
                    console.warn('Error eliminando archivos KMZ:', storageError);
                    // No fallar si hay error eliminando archivos
                }
            }

            // 3. Remover el layer KMZ del mapa ANTES de eliminar del estado
            const loteAEliminar = lotes.find(lote => lote.id === loteId);
            if (loteAEliminar?.kmzLayer && map) {
                map.removeLayer(loteAEliminar.kmzLayer);
            }

            // 4. Remover el lote del estado local
            setLotes(prev => prev.filter(lote => lote.id !== loteId));
            
            // 5. Limpiar la planificación si era la del lote eliminado
            if (planificacion?.idLote === loteId) {
                setPlanificacion(null);
            }

            // 6. Cerrar diálogos si estaban abiertos
            setPlanificacionDialogOpen(false);
            setSelectedLote(null);

            // 7. Restaurar pines si no hay más lotes con KMZ
            if (onTogglePins) {
                // Calcular si quedan lotes con KMZ visible después de la eliminación
                const lotesRestantes = lotes.filter(lote => lote.id !== loteId);
                const hasVisibleKMZ = lotesRestantes.some(lote => lote.kmzLayer && lote.visible);
                onTogglePins(!hasVisibleKMZ);
            }

            alert(`Lote "${loteId}" eliminado exitosamente`);
            
        } catch (error: any) {
            console.error('Error eliminando lote:', error);
            alert(`Error al eliminar el lote: ${error.message || 'Error desconocido'}`);
        } finally {
            setLoading(false);
        }
    };

    // Funciones para el editor de estructura
    const openEditorEstructura = () => {
        setEditorEstructuraOpen(true);
    };

    const closeEditorEstructura = () => {
        setEditorEstructuraOpen(false);
    };

    const handleEstructuraUpdated = () => {
        // Las estructuras maestras se guardarían en la base de datos
        console.log('Estructuras maestras actualizadas');
    };

    return {
        lotes,
        establecimiento,
        expandedLote,
        loading,
        kmzDialogOpen,
        selectedLote,
        planificacionFormOpen,
        planificacionDialogOpen,
        planificacion,
        setPlanificacion, // Agregado para poder actualizar la planificación
        editorEstructuraOpen,
        openEditorEstructura,
        closeEditorEstructura,
        handleEstructuraUpdated,
        handleFileUpload,
        toggleLoteVisibility,
        removeLoteKMZ,
        openKmzDialog,
        toggleExpandedLote,
        openPlanificacionForm,
        openPlanificacionDialog,
        closePlanificacionForm,
        closePlanificacionDialog,
        onPlanificacionCreada,
        nuevoLoteFormOpen,
        openNuevoLoteForm,
        closeNuevoLoteForm,
        onNuevoLoteCreado,
        deleteLote,
        setKmzDialogOpen,
        setSelectedLote,
    };
}
