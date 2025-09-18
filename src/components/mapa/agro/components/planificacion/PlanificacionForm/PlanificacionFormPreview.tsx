import {
    Box,
    Typography,
    CircularProgress,
    Card,
    CardContent,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Chip,
} from '@mui/material';
import {
    Timeline,
    CalendarToday,
    Schedule,
    AttachMoney,
    ExpandMore,
} from '@mui/icons-material';
import { ContextoGeneral } from '../../../../../Contexto';
import { useContext } from 'react';
import { ItemEstructura } from '../../../../../../types/agro';
import { RotacionRecomendacion } from './RotacionRecomendacion';
import { useRotacionCultivos } from '../../../hooks/useRotacionCultivos';

interface PlanificacionFormPreviewProps {
    fechaSiembra: string;
    estructuraCultivo: any;
    etapasGeneradas: ItemEstructura[];
    costoTotalEstimado: number;
    idLote?: string;
    idUbicacion?: number;
    campania?: string;
    cultivo?: number;
}

export function PlanificacionFormPreview({
    fechaSiembra,
    estructuraCultivo,
    etapasGeneradas,
    costoTotalEstimado,
    idLote,
    idUbicacion,
    campania,
    cultivo
}: PlanificacionFormPreviewProps) {
    const { theme } = useContext(ContextoGeneral);

    // Hook para evaluar rotación de cultivos
    const { 
        recomendacion, 
        cultivoAnterior, 
        loading: loadingRotacion, 
        // error: errorRotacion // No se usa 
    } = useRotacionCultivos({
        idLote: idLote || '',
        idUbicacion: idUbicacion || 0,
        campaniaActual: campania || '',
        cultivoNuevo: cultivo || 1
    });

    return (
        <>
            <Typography variant="h6" gutterBottom sx={{ color: theme.colores.azul }}>
                <Timeline sx={{ mr: 1, verticalAlign: 'middle' }} />
                Vista Previa del Cultivo
            </Typography>

            {/* Recomendación de Rotación */}
            {cultivo && (
                <RotacionRecomendacion
                    recomendacion={recomendacion}
                    cultivoAnterior={cultivoAnterior}
                    cultivoNuevo={estructuraCultivo?.nombre || 'Cultivo'}
                    loading={loadingRotacion}
                />
            )}

            {!fechaSiembra ? (
                <Box sx={{ p: 3, textAlign: 'center', color: 'text.secondary' }}>
                    <CalendarToday sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
                    <Typography variant="body2">
                        Selecciona una fecha de siembra para ver las etapas del cultivo
                    </Typography>
                </Box>
            ) : !estructuraCultivo ? (
                <Box sx={{ p: 3, textAlign: 'center', color: 'text.secondary' }}>
                    <CircularProgress size={32} />
                    <Typography variant="body2" sx={{ mt: 2 }}>
                        Cargando estructura del cultivo...
                    </Typography>
                </Box>
            ) : (
                <Box>
                    {/* Resumen del Cultivo */}
                    <Card variant="outlined" sx={{ mb: 2, bgcolor: 'primary.50' }}>
                        <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
                            <Box display="flex" justifyContent="space-between" alignItems="center">
                                <Box>
                                    <Typography variant="h6" color="primary">
                                        {etapasGeneradas.length} etapas
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        {etapasGeneradas.length > 0 ? `${etapasGeneradas.length} labores programadas` : 'Sin labores'}
                                    </Typography>
                                </Box>
                                <Box textAlign="right">
                                    <Typography variant="h6" color="success.main">
                                        ${costoTotalEstimado.toLocaleString()}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        Costo total estimado
                                    </Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>

                    {/* Lista de Etapas */}
                    <Accordion defaultExpanded>
                        <AccordionSummary expandIcon={<ExpandMore />}>
                            <Typography variant="subtitle1">
                                <Schedule sx={{ mr: 1, verticalAlign: 'middle' }} />
                                Etapas del Cultivo
                            </Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                {etapasGeneradas.map((etapa, index) => {
                                    // Calcular fechas basadas en fechaRelativa
                                    const fechaSiembraDate = new Date(fechaSiembra);
                                    const fechaDesde = new Date(fechaSiembraDate);
                                    fechaDesde.setDate(fechaDesde.getDate() + etapa.fechaRelativa);
                                    
                                    const fechaHasta = new Date(fechaDesde);
                                    if (etapa.duracion) {
                                        fechaHasta.setDate(fechaDesde.getDate() + etapa.duracion - 1);
                                    }

                                    return (
                                        <Card key={etapa.id} variant="outlined" sx={{ bgcolor: 'grey.50' }}>
                                            <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                                                <Box display="flex" justifyContent="space-between" alignItems="center">
                                                    <Box>
                                                        <Typography variant="subtitle2">
                                                            {index + 1}. {etapa.nombre}
                                                        </Typography>
                                                        <Typography variant="caption" color="text.secondary">
                                                            {fechaDesde.toLocaleDateString('es-AR')} - {fechaHasta.toLocaleDateString('es-AR')} ({etapa.duracion || 1} días)
                                                        </Typography>
                                                    </Box>
                                                    <Chip
                                                        label={`$${etapa.costo?.toLocaleString() || 0}`}
                                                        size="small"
                                                        icon={<AttachMoney />}
                                                        color="success"
                                                    />
                                                </Box>
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                            </Box>
                        </AccordionDetails>
                    </Accordion>
                </Box>
            )}
        </>
    );
}

