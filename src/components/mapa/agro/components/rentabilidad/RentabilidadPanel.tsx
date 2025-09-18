import { useState, useMemo } from 'react';
import {
    Box,
    Typography,
    Card,
    CardContent,
    Grid,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Alert,
    Chip,
    Divider,
    CircularProgress,
} from '@mui/material';
import {
    TrendingUp,
    Calculate,
    LocalShipping,
    AttachMoney,
    Agriculture,
} from '@mui/icons-material';
import { ContextoGeneral} from '../../../../Contexto';
import { useContext } from 'react';
import { PlaneacionLote } from '../../../../../types/agro';
import { useUbicaciones } from '../../hooks/useUbicaciones';
import { useCostos } from '../../hooks/useCostos';

interface RentabilidadPanelProps {
    planificacion: PlaneacionLote;
}

interface AnalisisRentabilidad {
    // Costos por categoría
    costoLabores: number;
    costoInsumos: number;
    costoTierra: number;
    costoEstructura: number;
    costoTotalProduccion: number;
    
    // Costos logísticos
    costoFlete: number;
    contraflete: number;
    costoLogisticoTotal: number;
    
    // Totales
    costoTotalPorHectarea: number;
    ingresoEstimadoPorHectarea: number;
    margenBrutoPorHectarea: number;
    margenPorcentual: number;
    
    // Punto de equilibrio
    puntoEquilibrioRinde: number;
    
    // Rendimiento estimado
    rendimientoEstimado: number;
    
    // Proyecciones
    proyecciones: Array<{
        rindeEscenario: number;
        produccionTotal: number;
        ingresoTotal: number;
        costoTotal: number;
        margenTotal: number;
        margenPorcentual: number;
    }>;
}

export function RentabilidadPanel({ planificacion }: RentabilidadPanelProps) {
    const { theme } = useContext(ContextoGeneral);
    const { ubicaciones } = useUbicaciones();
    const { categorias, costoPorHectarea } = useCostos(planificacion);
    const [calculando, setCalculando] = useState(false);

    // Calcular análisis de rentabilidad
    const analisis: AnalisisRentabilidad | null = useMemo(() => {
        if (!planificacion || !planificacion.superficie || planificacion.superficie <= 0) {
            return null;
        }

        setCalculando(true);

        const superficie = planificacion.superficie;
        const datosComerciales = planificacion.datos_comerciales;

        // Obtener costos por categoría usando el hook useCostos
        const costoLabores = categorias.find(cat => cat.nombre === 'Labores')?.total || 0;
        const costoInsumos = categorias.find(cat => cat.nombre === 'Insumos')?.total || 0;
        const costoTierra = categorias.find(cat => cat.nombre === 'Tierra')?.total || 0;
        const costoEstructura = categorias.find(cat => cat.nombre === 'Estructura')?.total || 0;
        const costoTotalProduccion = costoPorHectarea; // Ya está calculado por hectárea

        // Calcular costos logísticos
        const costoFlete = datosComerciales?.flete?.costo_por_tn || 0;
        const contraflete = datosComerciales?.flete?.contraflete || 0;
        const rendimientoEstimado = datosComerciales?.venta?.rendimiento_estimado_tn_ha || 1; // Usar rendimiento estimado o 1 como fallback
        
        // Calcular costo logístico total: (costo por tn + contraflete) × rendimiento × superficie
        const costoLogisticoTotal = (costoFlete + contraflete) * rendimientoEstimado * superficie;

        // Calcular totales por hectárea
        const costoTotalPorHectarea = costoTotalProduccion + (costoLogisticoTotal / superficie);
        
        const precioVenta = datosComerciales?.venta?.precio_venta_por_tn || 0;
        const ingresoEstimadoPorHectarea = datosComerciales?.venta?.ingreso_por_hectarea || 0; // Usar ingreso calculado en USD
        const margenBrutoPorHectarea = ingresoEstimadoPorHectarea - costoTotalPorHectarea;
        const margenPorcentual = ingresoEstimadoPorHectarea > 0 
            ? (margenBrutoPorHectarea / ingresoEstimadoPorHectarea) * 100 
            : 0;

        // Punto de equilibrio: costo total / precio por tn
        // El punto de equilibrio considera el costo logístico variable por rendimiento
        const costoLogisticoPorHectarea = (costoFlete + contraflete) * rendimientoEstimado;
        const costoTotalPorHectareaConFlete = costoTotalProduccion + costoLogisticoPorHectarea;
        
        const puntoEquilibrioRinde = costoTotalPorHectareaConFlete > 0 && precioVenta > 0
            ? costoTotalPorHectareaConFlete / precioVenta
            : 0;

        // Proyecciones para diferentes escenarios de rendimiento
        const escenarios = [
            rendimientoEstimado * 0.5, // 50% del rendimiento estimado
            rendimientoEstimado * 0.75, // 75% del rendimiento estimado
            rendimientoEstimado, // 100% del rendimiento estimado
            rendimientoEstimado * 1.25, // 125% del rendimiento estimado
            rendimientoEstimado * 1.5, // 150% del rendimiento estimado
        ];
        
        // Calcular precio en USD para las proyecciones
        const moneda = datosComerciales?.venta?.moneda || 'USD';
        const tipoCambio = datosComerciales?.venta?.tipo_de_cambio;
        let precioEnUSD = precioVenta;
        if (moneda !== 'USD' && tipoCambio) {
            precioEnUSD = precioVenta / tipoCambio;
        }
        
        const proyecciones = escenarios.map(rindeEscenario => {
            const produccionTotal = rindeEscenario * superficie;
            const ingresoTotal = precioEnUSD * produccionTotal; // Usar precio en USD
            
            // Calcular costo total considerando flete variable por rendimiento
            const costoLogisticoPorHectareaEscenario = (costoFlete + contraflete) * rindeEscenario;
            const costoTotalPorHectareaEscenario = costoTotalProduccion + costoLogisticoPorHectareaEscenario;
            const costoTotal = costoTotalPorHectareaEscenario * superficie;
            
            const margenTotal = ingresoTotal - costoTotal;
            const margenPorcentual = ingresoTotal > 0 ? (margenTotal / ingresoTotal) * 100 : 0;

            return {
                rindeEscenario,
                produccionTotal,
                ingresoTotal,
                costoTotal,
                margenTotal,
                margenPorcentual,
            };
        });

        setCalculando(false);

        return {
            costoLabores,
            costoInsumos,
            costoTierra,
            costoEstructura,
            costoTotalProduccion,
            costoFlete,
            contraflete,
            costoLogisticoTotal,
            costoTotalPorHectarea,
            ingresoEstimadoPorHectarea,
            margenBrutoPorHectarea,
            margenPorcentual,
            puntoEquilibrioRinde,
            rendimientoEstimado,
            proyecciones,
        };
    }, [planificacion, ubicaciones, categorias, costoPorHectarea]);

    if (!analisis) {
        return (
            <Box sx={{ p: 3, textAlign: 'center' }}>
                <Alert severity="info">
                    No se puede calcular la rentabilidad. Verifica que la planificación tenga superficie válida.
                </Alert>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3, color: theme.colores.azul }}>
                <TrendingUp />
                Análisis de Rentabilidad
                {calculando && <CircularProgress size={20} />}
            </Typography>

            {/* Resumen de Costos por Categoría */}
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <Calculate color="primary" />
                        Desglose de Costos por Hectárea
                    </Typography>
                    
                    <Grid container spacing={2}>
                        <Grid item xs={6} md={3}>
                            <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'rgba(25, 118, 210, 0.05)', borderRadius: 1 }}>
                                <Typography variant="h6" color="primary">
                                    ${analisis.costoLabores.toFixed(2)}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    Labores
                                </Typography>
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                                    {((analisis.costoLabores / analisis.costoTotalPorHectarea) * 100).toFixed(1)}%
                                </Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={6} md={3}>
                            <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'rgba(76, 175, 80, 0.05)', borderRadius: 1 }}>
                                <Typography variant="h6" color="success.main">
                                    ${analisis.costoInsumos.toFixed(2)}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    Insumos
                                </Typography>
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                                    {((analisis.costoInsumos / analisis.costoTotalPorHectarea) * 100).toFixed(1)}%
                                </Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={6} md={3}>
                            <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'rgba(255, 152, 0, 0.05)', borderRadius: 1 }}>
                                <Typography variant="h6" color="warning.main">
                                    ${analisis.costoTierra.toFixed(2)}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    Tierra
                                </Typography>
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                                    {((analisis.costoTierra / analisis.costoTotalPorHectarea) * 100).toFixed(1)}%
                                </Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={6} md={3}>
                            <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'rgba(156, 39, 176, 0.05)', borderRadius: 1 }}>
                                <Typography variant="h6" color="secondary.main">
                                    ${analisis.costoEstructura.toFixed(2)}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    Estructura
                                </Typography>
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                                    {((analisis.costoEstructura / analisis.costoTotalPorHectarea) * 100).toFixed(1)}%
                                </Typography>
                            </Box>
                        </Grid>
                    </Grid>

                    <Divider sx={{ my: 2 }} />

                    {/* Costos Logísticos */}
                    <Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <LocalShipping color="primary" />
                        Costos Logísticos
                    </Typography>
                    
                    <Grid container spacing={2}>
                        <Grid item xs={4}>
                            <Box sx={{ textAlign: 'center', p: 1 }}>
                                <Typography variant="h6" color="info.main">
                                    ${analisis.costoFlete.toFixed(2)}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    Flete por TN
                                </Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={4}>
                            <Box sx={{ textAlign: 'center', p: 1 }}>
                                <Typography variant="h6" color="info.main">
                                    ${analisis.contraflete.toFixed(2)}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    Contraflete por TN
                                </Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={4}>
                            <Box sx={{ textAlign: 'center', p: 1 }}>
                                <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold', fontSize: '1.2rem' }}>
                                    ${((analisis.costoFlete + analisis.contraflete)).toFixed(2)}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    Total por TN
                                </Typography>
                            </Box>
                        </Grid>
                    </Grid>
                    
                    {/* Costo logístico por hectárea */}
                    <Box sx={{ mt: 2, p: 2, bgcolor: 'rgba(25, 118, 210, 0.05)', borderRadius: 1 }}>
                        <Typography variant="subtitle2" color="primary" sx={{ mb: 1 }}>
                            Costo Logístico por Hectárea
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                            ${((analisis.costoFlete + analisis.contraflete) * analisis.rendimientoEstimado).toFixed(2)} USD/ha
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                            {(((analisis.costoFlete + analisis.contraflete) * analisis.rendimientoEstimado / analisis.costoTotalPorHectarea) * 100).toFixed(1)}% del costo total
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            Calculado: ${(analisis.costoFlete + analisis.contraflete).toFixed(2)}/tn × {analisis.rendimientoEstimado.toFixed(1)} tn/ha
                        </Typography>
                    </Box>
                </CardContent>
            </Card>

            {/* Resumen de Rentabilidad */}
            <Card sx={{ mb: 3, bgcolor: 'grey.50' }}>
                <CardContent>
                    <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <AttachMoney color="primary" />
                        Resumen de Rentabilidad
                    </Typography>
                    
                    <Grid container spacing={2}>
                        <Grid item xs={6} md={3}>
                            <Box sx={{ textAlign: 'center', p: 1 }}>
                                <Typography variant="h5" color="primary">
                                    ${analisis.costoTotalPorHectarea.toFixed(2)}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    Costo Total por Hectárea
                                </Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={6} md={3}>
                            <Box sx={{ textAlign: 'center', p: 1 }}>
                                <Typography variant="h5" color="info.main">
                                    ${analisis.ingresoEstimadoPorHectarea.toFixed(2)}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    Ingreso por Hectárea (USD)
                                </Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={6} md={3}>
                            <Box sx={{ textAlign: 'center', p: 1 }}>
                                <Typography 
                                    variant="h5" 
                                    color={analisis.margenBrutoPorHectarea > 0 ? 'success.main' : 'error.main'}
                                >
                                    ${analisis.margenBrutoPorHectarea.toFixed(2)}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    Margen por Hectárea
                                </Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={6} md={3}>
                            <Box sx={{ textAlign: 'center', p: 1 }}>
                                <Typography 
                                    variant="h5" 
                                    color={analisis.margenPorcentual > 0 ? 'success.main' : 'error.main'}
                                >
                                    {analisis.margenPorcentual.toFixed(1)}%
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    Margen Porcentual
                                </Typography>
                            </Box>
                        </Grid>
                    </Grid>

                    {/* Punto de Equilibrio */}
                    <Box sx={{ mt: 2, p: 2, bgcolor: 'rgba(255, 152, 0, 0.1)', borderRadius: 1 }}>
                        <Typography variant="subtitle2" color="warning.main" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Agriculture />
                            Punto de Equilibrio: {analisis.puntoEquilibrioRinde.toFixed(1)} tn/ha
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            Rendimiento mínimo necesario para cubrir todos los costos
                        </Typography>
                    </Box>
                </CardContent>
            </Card>

            {/* Tabla de Proyecciones */}
            <Card>
                <CardContent>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                        Proyecciones por Escenario de Rendimiento
                        {analisis.rendimientoEstimado > 1 && (
                            <Typography variant="caption" sx={{ ml: 1, color: 'text.secondary' }}>
                                (Basado en {analisis.rendimientoEstimado.toFixed(1)} tn/ha estimado)
                            </Typography>
                        )}
                    </Typography>
                    
                    <TableContainer component={Paper} variant="outlined">
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell><strong>Rinde (tn/ha)</strong></TableCell>
                                    <TableCell align="right"><strong>Producción Total (tn)</strong></TableCell>
                                    <TableCell align="right"><strong>Ingreso Total (USD)</strong></TableCell>
                                    <TableCell align="right"><strong>Costo Total ($)</strong></TableCell>
                                    <TableCell align="right"><strong>Margen Total ($)</strong></TableCell>
                                    <TableCell align="right"><strong>Margen %</strong></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {analisis.proyecciones.map((proyeccion, index) => (
                                    <TableRow key={index}>
                                        <TableCell>
                                            <Chip 
                                                label={`${proyeccion.rindeEscenario} tn/ha`} 
                                                size="small" 
                                                color={proyeccion.rindeEscenario >= analisis.puntoEquilibrioRinde ? 'success' : 'warning'}
                                            />
                                        </TableCell>
                                        <TableCell align="right">{proyeccion.produccionTotal.toFixed(1)}</TableCell>
                                        <TableCell align="right">${proyeccion.ingresoTotal.toFixed(2)}</TableCell>
                                        <TableCell align="right">${proyeccion.costoTotal.toFixed(2)}</TableCell>
                                        <TableCell 
                                            align="right"
                                            sx={{ 
                                                color: proyeccion.margenTotal > 0 ? 'success.main' : 'error.main',
                                                fontWeight: 'bold'
                                            }}
                                        >
                                            ${proyeccion.margenTotal.toFixed(2)}
                                        </TableCell>
                                        <TableCell 
                                            align="right"
                                            sx={{ 
                                                color: proyeccion.margenPorcentual > 0 ? 'success.main' : 'error.main',
                                                fontWeight: 'bold'
                                            }}
                                        >
                                            {proyeccion.margenPorcentual.toFixed(1)}%
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
