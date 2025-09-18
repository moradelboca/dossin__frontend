import {
    Card,
    CardContent,
    Typography,
    Grid,
    Box,
    Chip,
    Alert,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
} from '@mui/material';
import {
    TrendingUp,
    Calculate,
} from '@mui/icons-material';
import { useAnalisisMargen } from '../../../hooks/useAnalisisMargen';
import { DatosComerciales } from '../../../../../../types/agro';

interface PlanificacionFormAnalisisMargenProps {
    datosComerciales: DatosComerciales;
    superficie: number | null;
    costoTotalProduccion: number;
}

export function PlanificacionFormAnalisisMargen({
    datosComerciales,
    superficie,
    costoTotalProduccion
}: PlanificacionFormAnalisisMargenProps) {
    const { analisisMargen, proyecciones, calculando } = useAnalisisMargen({
        datosComerciales,
        superficie,
        costoTotalProduccion,
        rindeObjetivo: 3,
        rendimientoEstimado: 3
    });

    if (!analisisMargen) {
        return null;
    }

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Typography variant="h6" color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TrendingUp />
                Análisis de Rentabilidad
                {calculando && <Chip label="Calculando..." size="small" color="info" />}
            </Typography>

            {/* Resumen de Márgenes */}
            <Card variant="outlined" sx={{ bgcolor: 'grey.50' }}>
                <CardContent>
                    <Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <Calculate color="primary" />
                        Resumen de Márgenes
                    </Typography>

                    <Grid container spacing={2}>
                        <Grid item xs={6} md={3}>
                            <Box sx={{ textAlign: 'center', p: 1 }}>
                                <Typography variant="h6" color="primary">
                                    ${analisisMargen.costo_total_por_hectarea.toFixed(2)}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    Costo por hectárea
                                </Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={6} md={3}>
                            <Box sx={{ textAlign: 'center', p: 1 }}>
                                <Typography 
                                    variant="h6" 
                                    color={analisisMargen.margen_bruto_por_hectarea > 0 ? 'success.main' : 'error.main'}
                                >
                                    ${analisisMargen.margen_bruto_por_hectarea.toFixed(2)}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    Margen por hectárea
                                </Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={6} md={3}>
                            <Box sx={{ textAlign: 'center', p: 1 }}>
                                <Typography 
                                    variant="h6" 
                                    color={analisisMargen.margen_porcentual > 0 ? 'success.main' : 'error.main'}
                                >
                                    {analisisMargen.margen_porcentual.toFixed(1)}%
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    Margen porcentual
                                </Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={6} md={3}>
                            <Box sx={{ textAlign: 'center', p: 1 }}>
                                <Typography variant="h6" color="info.main">
                                    {analisisMargen.punto_equilibrio_rinde.toFixed(1)} tn/ha
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    Punto de equilibrio
                                </Typography>
                            </Box>
                        </Grid>
                    </Grid>

                    {/* Proyección con rinde objetivo */}
                    <Alert severity="info" sx={{ mt: 2 }}>
                        <Typography variant="body2">
                            <strong>Proyección con {analisisMargen.rinde_objetivo} tn/ha:</strong><br />
                            Ganancia estimada: ${analisisMargen.ganancia_estimada_rinde_objetivo.toFixed(2)} por hectárea
                        </Typography>
                    </Alert>
                </CardContent>
            </Card>

            {/* Tabla de Proyecciones */}
            <Card variant="outlined">
                <CardContent>
                    <Typography variant="subtitle1" sx={{ mb: 2 }}>
                        Proyecciones por Escenario de Rendimiento
                    </Typography>
                    
                    <TableContainer component={Paper} variant="outlined">
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell><strong>Rinde (tn/ha)</strong></TableCell>
                                    <TableCell align="right"><strong>Producción Total (tn)</strong></TableCell>
                                    <TableCell align="right"><strong>Ingreso Total ($)</strong></TableCell>
                                    <TableCell align="right"><strong>Costo Total ($)</strong></TableCell>
                                    <TableCell align="right"><strong>Margen Total ($)</strong></TableCell>
                                    <TableCell align="right"><strong>Margen %</strong></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {proyecciones.map((proyeccion, index) => (
                                    <TableRow key={index}>
                                        <TableCell>{proyeccion.rinde_escenario}</TableCell>
                                        <TableCell align="right">{proyeccion.produccion_total.toFixed(1)}</TableCell>
                                        <TableCell align="right">${proyeccion.ingreso_total.toFixed(2)}</TableCell>
                                        <TableCell align="right">${proyeccion.costo_total.toFixed(2)}</TableCell>
                                        <TableCell 
                                            align="right"
                                            sx={{ 
                                                color: proyeccion.margen_total > 0 ? 'success.main' : 'error.main',
                                                fontWeight: 'bold'
                                            }}
                                        >
                                            ${proyeccion.margen_total.toFixed(2)}
                                        </TableCell>
                                        <TableCell 
                                            align="right"
                                            sx={{ 
                                                color: proyeccion.margen_porcentual > 0 ? 'success.main' : 'error.main',
                                                fontWeight: 'bold'
                                            }}
                                        >
                                            {proyeccion.margen_porcentual.toFixed(1)}%
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </CardContent>
            </Card>
        </Box>
    );
}

