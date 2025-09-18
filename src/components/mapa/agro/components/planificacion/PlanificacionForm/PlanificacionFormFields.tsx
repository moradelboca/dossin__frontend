import {
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Box,
    Typography,
    Card,
    CardContent,
    Chip,
    Button,
} from '@mui/material';
import {
    Agriculture,
    CalendarToday,
    Straighten,
    Upload,
} from '@mui/icons-material';
import { ContextoGeneral } from '../../../../../Contexto';
import { useContext } from 'react';
import { useCampañas } from '../../../hooks/useCampañas';

// Nueva estructura de cultivos argentinos
const CULTIVOS = [
    { id: 1, nombre: 'Soja de Primera', descripcion: 'Ciclo completo con 7 etapas', temporada: 'Oct-Nov a Mar-Abr' },
    { id: 2, nombre: 'Soja de Segunda', descripcion: 'Ciclo simplificado con 5 etapas', temporada: 'Dic-Ene a Abr-May' },
    { id: 3, nombre: 'Maíz de Primera', descripcion: 'Ciclo completo con 7 etapas', temporada: 'Sep-Oct a Mar-Abr' },
    { id: 4, nombre: 'Maíz de Segunda', descripcion: 'Ciclo simplificado con 5 etapas', temporada: 'Dic-Ene a May-Jun' },
    { id: 5, nombre: 'Trigo', descripcion: 'Cultivo de invierno con 7 etapas', temporada: 'Jun-Jul a Dic-Ene' },
    { id: 6, nombre: 'Girasol de Primera', descripcion: 'Ciclo de verano con 6 etapas', temporada: 'Oct-Nov a Feb-Mar' },
    { id: 7, nombre: 'Girasol de Segunda', descripcion: 'Ciclo tardío con 5 etapas', temporada: 'Dic-Ene a Mar-Abr' },
    { id: 8, nombre: 'Centeno', descripcion: 'Cultivo de cobertura con 6 etapas', temporada: 'May-Jun a Dic-Ene' },
    { id: 9, nombre: 'Sorgo', descripcion: 'Cultivo forrajero con 7 etapas', temporada: 'Oct-Nov a Mar-Abr' },
];

interface PlanificacionFormFieldsProps {
    nombreLote: string;
    setNombreLote: (value: string) => void;
    campania: string;
    setCampania: (value: string) => void;
    cultivo: number;
    setCultivo: (value: number) => void;
    fechaSiembra: string;
    setFechaSiembra: (value: string) => void;
    superficieCalculada: number | null;
    setSuperficieCalculada: (value: number | null) => void;
    kmzFile: File | null;
    onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export function PlanificacionFormFields({
    nombreLote,
    setNombreLote,
    campania,
    setCampania,
    cultivo,
    setCultivo,
    fechaSiembra,
    setFechaSiembra,
    superficieCalculada,
    setSuperficieCalculada,
    kmzFile,
    onFileChange
}: PlanificacionFormFieldsProps) {
    const { theme } = useContext(ContextoGeneral);
    const { campañas, loading: cargandoCampañas } = useCampañas();
    const cultivoSeleccionado = CULTIVOS.find(c => c.id === cultivo);

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Nombre del Lote */}
            <TextField
                label="Nombre del Lote"
                value={nombreLote}
                onChange={(e) => setNombreLote(e.target.value)}
                placeholder="Ej: LOTE NORTE, LOTE SUR, etc."
                fullWidth
                required
                InputProps={{
                    startAdornment: <Agriculture sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
            />

            {/* Campaña */}
            <FormControl fullWidth>
                <InputLabel>Campaña</InputLabel>
                <Select
                    value={cargandoCampañas ? '' : campania}
                    onChange={(e) => setCampania(e.target.value)}
                    label="Campaña"
                    disabled={cargandoCampañas}
                    error={!cargandoCampañas && campania ? !campañas.some(c => c.id === campania) : false}
                >
                    {cargandoCampañas ? (
                        <MenuItem disabled>Cargando campañas...</MenuItem>
                    ) : campañas.length === 0 ? (
                        <MenuItem disabled>No hay campañas disponibles</MenuItem>
                    ) : (
                        campañas.map((campaña) => (
                            <MenuItem key={campaña.id} value={campaña.id}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                                    <CalendarToday fontSize="small" color="action" />
                                    <Typography variant="body2">
                                        {campaña.nombre}
                                    </Typography>
                                    {campaña.activa && (
                                        <Chip 
                                            label="Actual" 
                                            size="small" 
                                            color="primary" 
                                            variant="outlined"
                                            sx={{ fontSize: '0.7rem', height: 20 }}
                                        />
                                    )}
                                </Box>
                            </MenuItem>
                        ))
                    )}
                </Select>
            </FormControl>

            {/* Cultivo */}
            <FormControl fullWidth>
                <InputLabel>Cultivo</InputLabel>
                <Select
                    value={cultivo}
                    onChange={(e) => setCultivo(e.target.value as number)}
                    label="Cultivo"
                >
                    {CULTIVOS.map((c) => (
                        <MenuItem key={c.id} value={c.id}>
                            <Box display="flex" alignItems="center" gap={1}>
                                <Agriculture sx={{ fontSize: 16 }} />
                                {c.nombre}
                            </Box>
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>

            {/* Información del Cultivo */}
            {cultivoSeleccionado && (
                <Card variant="outlined" sx={{ bgcolor: 'grey.50' }}>
                    <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                            <strong>{cultivoSeleccionado.nombre}</strong>
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            {cultivoSeleccionado.descripcion}
                        </Typography>
                        <Box sx={{ mt: 1 }}>
                            <Chip
                                label={`Temporada: ${cultivoSeleccionado.temporada}`}
                                size="small"
                                icon={<CalendarToday />}
                                variant="outlined"
                            />
                        </Box>
                    </CardContent>
                </Card>
            )}

            {/* Fecha de Siembra */}
            <TextField
                type="date"
                label="Fecha de Siembra"
                value={fechaSiembra}
                onChange={(e) => setFechaSiembra(e.target.value)}
                InputLabelProps={{ shrink: true }}
                fullWidth
                required
                InputProps={{
                    startAdornment: <CalendarToday sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
            />

            {/* Superficie Manual */}
            <TextField
                type="number"
                label="Superficie (hectáreas)"
                placeholder="Ingresa la superficie del lote"
                value={superficieCalculada || ''}
                fullWidth
                required
                InputProps={{
                    startAdornment: <Straighten sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
                onChange={(e) => {
                    const value = parseFloat(e.target.value);
                    if (!isNaN(value) && value > 0) {
                        setSuperficieCalculada(value);
                    } else {
                        setSuperficieCalculada(null);
                    }
                }}
            />

            {/* KMZ/KML Upload */}
            <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                    Archivo KMZ/KML (opcional)
                </Typography>
                <Button
                    variant="outlined"
                    component="label"
                    startIcon={<Upload />}
                    fullWidth
                    sx={{
                        borderColor: theme.colores.azul,
                        color: theme.colores.azul,
                        '&:hover': {
                            borderColor: theme.colores.azul,
                            backgroundColor: 'rgba(25, 118, 210, 0.04)'
                        }
                    }}
                >
                    {kmzFile ? kmzFile.name : 'Seleccionar archivo KMZ/KML'}
                    <input
                        type="file"
                        hidden
                        accept=".kmz,.kml"
                        onChange={onFileChange}
                    />
                </Button>
                {kmzFile && superficieCalculada && (
                    <Chip
                        label={`Superficie calculada: ${superficieCalculada} ha`}
                        color="success"
                        size="small"
                        sx={{ mt: 1 }}
                        icon={<Straighten />}
                    />
                )}
            </Box>

            {/* Superficie Final */}
            <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                    Superficie del lote:
                </Typography>
                {superficieCalculada ? (
                    <>
                        <Typography variant="h6" color="primary">
                            {superficieCalculada} hectáreas
                        </Typography>
                        {kmzFile ? (
                            <Typography variant="caption" color="success.main">
                                ✓ Calculada automáticamente del KMZ
                            </Typography>
                        ) : (
                            <Typography variant="caption" color="info.main">
                                ✓ Ingresada manualmente
                            </Typography>
                        )}
                    </>
                ) : (
                    <Typography variant="body2" color="text.secondary">
                        Ingresa la superficie o sube un archivo KMZ
                    </Typography>
                )}
            </Box>
        </Box>
    );
}

