import { useContext } from 'react';
import {
    Box,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    IconButton,
    Button,
    Chip,
    Divider,
    Card,
    CardContent,
    Collapse,
    Typography,
} from '@mui/material';
import {
    ExpandMore,
    ExpandLess,
    Upload,
    Visibility,
    VisibilityOff,
    Agriculture,
} from '@mui/icons-material';
import { ContextoGeneral } from '../../../../Contexto';
import { Lote } from './types';
import { ProtectedComponent } from '../../../../protectedComponent/ProtectedComponent';


interface LoteItemProps {
    lote: Lote;
    expandedLote: string | null;
    onToggleExpanded: (loteId: string) => void;
    onToggleVisibility: (loteId: string) => void;
    onOpenKmzDialog: (lote: Lote) => void;
    onRemoveKmz: (loteId: string) => void;
    onOpenPlanificacionForm: (lote: Lote) => void;
    onOpenPlanificacionDialog: (lote: Lote) => Promise<void>;
}

export function LoteItem({
    lote,
    expandedLote,
    onToggleExpanded,
    onToggleVisibility,
    onOpenKmzDialog,
    onRemoveKmz,
    onOpenPlanificacionForm,
    onOpenPlanificacionDialog,
}: LoteItemProps) {
    const { theme } = useContext(ContextoGeneral);
    const isExpanded = expandedLote === lote.id;

    return (
        <Card sx={{ mb: 1, border: 1, borderColor: 'divider' }}>
            <ListItem
                component="div"
                onClick={() => onToggleExpanded(lote.id)}
                sx={{ px: 1, cursor: 'pointer' }}
            >
                <ListItemText
                    primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Agriculture sx={{ fontSize: 20, color: theme.colores.azul }} />
                            <Box sx={{ fontSize: '1.25rem', fontWeight: 500 }}>
                                {lote.nombre}
                            </Box>
                            {lote.planificacion ? (
                                <Chip 
                                    label="Planificado" 
                                    size="small" 
                                    color="success"
                                />
                            ) : (
                                <Chip 
                                    label="Sin planificar" 
                                    size="small" 
                                    color="warning"
                                />
                            )}
                        </Box>
                    }
                    secondary={
                        lote.planificacion ? 
                            `${lote.cultivo} • ${lote.superficie} ha • ${lote.campania}` :
                            'No hay planificación para este lote'
                    }
                />
                <ListItemSecondaryAction>
                    <IconButton
                        size="small"
                        onClick={(e) => {
                            e.stopPropagation();
                            onToggleVisibility(lote.id);
                        }}
                        sx={{ mr: 1 }}
                    >
                        {lote.visible ? <Visibility /> : <VisibilityOff />}
                    </IconButton>
                    {isExpanded ? <ExpandLess /> : <ExpandMore />}
                </ListItemSecondaryAction>
            </ListItem>

            <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                <CardContent sx={{ pt: 0 }}>
                    <Divider sx={{ mb: 1 }} />
                    
                    {/* Información resumida */}
                    <Box sx={{ mb: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1, textAlign: 'center' }}>
                        {lote.planificacion ? (
                            <Box sx={{ textAlign: 'center' }}>
                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                    Planificación disponible para campaña {lote.campania}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    Haz click en "Ver Planificación" para gestionar todas las campañas
                                </Typography>
                            </Box>
                        ) : (
                            <Box sx={{ textAlign: 'center' }}>
                                <Typography variant="body2" color="text.secondary">
                                    No hay planificación para este lote
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    Haz click en "Planificar Campaña" para crear planificaciones
                                </Typography>
                            </Box>
                        )}
                    </Box>

                    {/* Acciones del lote */}
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        {!lote.planificacion ? (
                            <Button
                                size="small"
                                variant="contained"
                                startIcon={<Agriculture />}
                                onClick={() => onOpenPlanificacionForm(lote)}
                                sx={{
                                    backgroundColor: theme.colores.azul,
                                    '&:hover': { backgroundColor: theme.colores.azulOscuro }
                                }}
                            >
                                Planificar Campaña 2025/2026
                            </Button>
                        ) : (
                            <Button
                                size="small"
                                variant="outlined"
                                startIcon={<Agriculture />}
                                onClick={() => onOpenPlanificacionDialog(lote)}
                                sx={{
                                    borderColor: theme.colores.azul,
                                    color: theme.colores.azul,
                                    '&:hover': { 
                                        borderColor: theme.colores.azulOscuro,
                                        backgroundColor: 'rgba(22, 54, 96, 0.04)'
                                    }
                                }}
                            >
                                Ver Planificación
                            </Button>
                        )}
                        
                        <ProtectedComponent allowedRoles={[1]}>
                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                <Button
                                    size="small"
                                    variant="outlined"
                                    startIcon={<Upload />}
                                    onClick={() => onOpenKmzDialog(lote)}
                                    disabled={!!lote.kmzLayer}
                                    sx={{
                                        borderColor: theme.colores.azul,
                                        color: theme.colores.azul,
                                        '&:hover': { 
                                            borderColor: theme.colores.azulOscuro,
                                            backgroundColor: 'rgba(22, 54, 96, 0.04)'
                                        },
                                        '&:disabled': {
                                            borderColor: 'grey.300',
                                            color: 'grey.500'
                                        }
                                    }}
                                >
                                    {lote.kmzLayer ? 'KMZ Cargado' : 'Importar KMZ'}
                                </Button>
                                
                                {lote.kmzLayer && (
                                    <Button
                                        size="small"
                                        variant="outlined"
                                        color="error"
                                        onClick={() => onRemoveKmz(lote.id)}
                                    >
                                        Remover KMZ
                                    </Button>
                                )}
                            </Box>
                        </ProtectedComponent>
                    </Box>
                </CardContent>
            </Collapse>
        </Card>
    );
}
