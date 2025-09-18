import {
    Box,
    List,
    Button,
} from '@mui/material';
import { Settings } from '@mui/icons-material';
import { LotesPanelHeader } from './LotesPanelHeader';
import { LoteItem } from './LoteItem';
import { KmzImportDialog } from './KmzImportDialog';
import { PlanificacionForm } from '../planificacion';
import { PlanificacionDialog } from '../planificacion';
import { EditorEstructuraPlanificacion } from '../editor-estructura';
import { useLotesPanel } from './useLotesPanel';
import { LotesPanelProps } from './types';

export function LotesPanel({ ubicacion, map, onClose, onTogglePins, onLoteClick }: LotesPanelProps) {
    const {
        lotes,
        establecimiento,
        expandedLote,
        loading,
        kmzDialogOpen,
        selectedLote,
        planificacionFormOpen,
        planificacionDialogOpen,
        planificacion,
        editorEstructuraOpen,
        openEditorEstructura,
        closeEditorEstructura,

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
        setPlanificacion,
    } = useLotesPanel(ubicacion, map, onTogglePins, onLoteClick);

    if (!ubicacion) return null;

    return (
        <Box
            sx={{
                position: 'absolute',
                top: 100,
                left: 10,
                zIndex: 1000,
                backgroundColor: 'white',
                borderRadius: 2,
                boxShadow: 3,
                width: 350,
                maxHeight: 'calc(90vh - 200px)',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column'
            }}
        >
            {/* Header */}
            <LotesPanelHeader 
                establecimiento={establecimiento}
                onClose={onClose}
                onAddLote={openNuevoLoteForm}
            />
            
            {/* Contenido */}
            <Box sx={{ flex: 1, overflow: 'auto', p: 1 }}>
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                        <Box>Cargando lotes...</Box>
                    </Box>
                ) : lotes.length === 0 ? (
                    <Box sx={{ p: 2, textAlign: 'center' }}>
                        <Box sx={{ color: 'text.secondary' }}>
                            No hay lotes disponibles para esta ubicación
                        </Box>
                    </Box>
                ) : (
                    <List dense>
                        {lotes.map((lote) => (
                                                         <LoteItem
                                 key={lote.id}
                                 lote={lote}
                                 expandedLote={expandedLote}
                                 onToggleExpanded={toggleExpandedLote}
                                 onToggleVisibility={toggleLoteVisibility}
                                 onOpenKmzDialog={openKmzDialog}
                                 onRemoveKmz={removeLoteKMZ}
                                 onOpenPlanificacionForm={openPlanificacionForm}
                                 onOpenPlanificacionDialog={(lote) => openPlanificacionDialog(lote)}
                             />
                        ))}
                    </List>
                )}
                
                {/* Botón sutil para editar estructuras de planificación */}
                <Box sx={{ p: 1, borderTop: '1px solid', borderColor: 'grey.200' }}>
                    <Button
                        variant="text"
                        startIcon={<Settings />}
                        onClick={openEditorEstructura}
                        fullWidth
                        size="small"
                        sx={{
                            color: 'text.secondary',
                            fontSize: '0.75rem',
                            textTransform: 'none',
                            '&:hover': {
                                backgroundColor: 'rgba(0, 0, 0, 0.04)',
                                color: 'text.primary'
                            }
                        }}
                    >
                        Configurar Estructuras Maestras
                    </Button>
                </Box>
            </Box>

            {/* Formulario de Planificación */}
            {planificacionFormOpen && (selectedLote || lotes[0]) && ubicacion && (
                <PlanificacionForm
                    open={planificacionFormOpen}
                    onClose={closePlanificacionForm}
                    lote={selectedLote || lotes[0]}
                    ubicacion={ubicacion}
                    onPlanificacionCreada={onPlanificacionCreada}
                />
            )}

            {/* Dialog de Planificación Agrícola */}
            {planificacionDialogOpen && planificacion && (selectedLote || lotes[0]) && ubicacion && (
                <PlanificacionDialog
                    open={planificacionDialogOpen}
                    onClose={closePlanificacionDialog}
                    planificacion={planificacion}
                    lote={selectedLote || lotes[0]}
                    ubicacion={ubicacion}
                    onDeleteLote={() => deleteLote(selectedLote?.id || lotes[0]?.id)}
                    onPlanificacionUpdated={(updatedPlan) => {
                        // Actualizar el estado local de la planificación
                        setPlanificacion(updatedPlan);
                    }}
                    onCampañaChange={(_nuevaCampaña) => {
                        // Manejar cambio de campaña
                        // En el futuro aquí se podría cargar una nueva planificación
                    }}
                />
            )}

            {/* Diálogo para importar KMZ */}
            <KmzImportDialog
                open={kmzDialogOpen}
                onClose={() => setKmzDialogOpen(false)}
                selectedLote={selectedLote}
                onFileSelect={handleFileUpload}
            />

            {/* Formulario para nuevo lote */}
            {nuevoLoteFormOpen && ubicacion && (
                <PlanificacionForm
                    open={nuevoLoteFormOpen}
                    onClose={closeNuevoLoteForm}
                    lote={{
                        id: '',
                        nombre: '',
                        estado: 'Nuevo'
                    }}
                    ubicacion={ubicacion}
                    onPlanificacionCreada={onNuevoLoteCreado}
                />
            )}

            {/* Editor de Estructura de Planificación */}
            {editorEstructuraOpen && (
                <EditorEstructuraPlanificacion
                    open={editorEstructuraOpen}
                    onClose={closeEditorEstructura}
                />
            )}
        </Box>
    );
}
