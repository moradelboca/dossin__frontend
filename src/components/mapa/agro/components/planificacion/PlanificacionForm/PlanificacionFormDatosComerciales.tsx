import React, { useState, useEffect } from 'react';
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
    Grid,
    Chip,
    Alert,
    Autocomplete,
    CircularProgress,
} from '@mui/material';
import { PatternFormat } from 'react-number-format';
import {
    LocationOn,
    LocalShipping,
    AttachMoney,
    Add as AddIcon,
} from '@mui/icons-material';

// Componente de formato para porcentaje (igual que en la calculadora)
const PorcentajeFormat = React.forwardRef<any, any>(function PorcentajeFormat(props, ref) {
    const { onChange, ...other } = props;
    return (
        <PatternFormat
            {...other}
            getInputRef={ref}
            format="##%"
            mask=""
            onValueChange={(values) => {
                const num = Number(values.value.replace("%", ""));
                if (num < 0) return;
                onChange({ target: { name: props.name, value: values.value } });
            }}
        />
    );
});
import { ContextoGeneral } from '../../../../../Contexto';
import { useContext } from 'react';
import { DatosComerciales } from '../../../../../../types/agro';
import { useUbicaciones } from '../../../hooks/useUbicaciones';
import { useCalculoDistancia } from '../../../hooks/useCalculoDistancia';
import { useRendimientosDepartamento } from '../../../hooks/useRendimientosDepartamento';
import { calcularCostoFlete } from '../../../utils/fleteUtils';
import AutocompleteEmpresas from '../../../../../forms/autocompletes/AutocompleteEmpresas';


interface PlanificacionFormDatosComercialesProps {
    datosComerciales: DatosComerciales;
    setDatosComerciales: (datos: DatosComerciales) => void;
    idUbicacionCarga: number; // ID de la ubicación del lote (carga)
}


const MONEDAS = [
    { codigo: 'USD', nombre: 'Dólar Americano' },
    { codigo: 'ARS', nombre: 'Peso Argentino' },
    { codigo: 'EUR', nombre: 'Euro' },
];

const CONDICIONES_PAGO = [
    'Contado',
    '30 días',
    '60 días',
    '90 días',
    '120 días',
];

export function PlanificacionFormDatosComerciales({
    datosComerciales,
    setDatosComerciales,
    idUbicacionCarga
}: PlanificacionFormDatosComercialesProps) {
    const { theme } = useContext(ContextoGeneral);
    const { ubicaciones, loading: cargandoUbicaciones, error: errorUbicaciones } = useUbicaciones();
    const { obtenerRendimientoEstimado, loading: cargandoRendimientos, error: errorRendimientos } = useRendimientosDepartamento();
    const [ubicacionSeleccionada, setUbicacionSeleccionada] = useState<string | null>(null);
    const [calculandoFlete, setCalculandoFlete] = useState(false);
    const [valoresFleteUSD, setValoresFleteUSD] = useState<{
        tarifaPorToneladaUSD?: number;
        costoFleteUSD?: number;
        costoContrafleteUSD?: number;
        costoTotalUSD?: number;
        costoConDescuentoUSD?: number;
    }>({});
    
    // Valores originales en ARS para mostrar en los campos (separados de datosComerciales)
    const [valoresEntradaARS, setValoresEntradaARS] = useState<{
        contrafleteARS?: number | null;
        costoPorTnARS?: number | null;
    }>({});
    
    // Estado local para la empresa seleccionada (no se actualiza datosComerciales hasta el final)
    const [empresaSeleccionada, setEmpresaSeleccionada] = useState<{
        cuit: string | null;
        razon_social: string | null;
        nombre_fantasia: string | null;
    }>({
        cuit: datosComerciales.titular_carta_porte.cuit,
        razon_social: datosComerciales.titular_carta_porte.razon_social,
        nombre_fantasia: datosComerciales.titular_carta_porte.nombre_fantasia
    });

    // Sincronizar estado local cuando cambien los datos comerciales desde afuera
    useEffect(() => {
        setEmpresaSeleccionada({
            cuit: datosComerciales.titular_carta_porte.cuit,
            razon_social: datosComerciales.titular_carta_porte.razon_social,
            nombre_fantasia: datosComerciales.titular_carta_porte.nombre_fantasia
        });
    }, [datosComerciales.titular_carta_porte.cuit, datosComerciales.titular_carta_porte.razon_social, datosComerciales.titular_carta_porte.nombre_fantasia]);

    // Sincronizar datos comerciales cuando cambie el estado local de la empresa (con delay para evitar actualizaciones constantes)
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            sincronizarEmpresaConDatosComerciales();
        }, 100); // Delay de 100ms para evitar actualizaciones constantes

        return () => clearTimeout(timeoutId);
    }, [empresaSeleccionada.cuit, empresaSeleccionada.razon_social, empresaSeleccionada.nombre_fantasia]);

    // Obtener ubicación de carga
    const ubicacionCarga = ubicaciones.find(u => u.id === idUbicacionCarga);
    
    // Obtener ubicación de entrega seleccionada
    const ubicacionEntrega = datosComerciales.ubicacion_entrega.idUbicacion 
        ? ubicaciones.find(u => u.id === datosComerciales.ubicacion_entrega.idUbicacion)
        : null;

    // Hook para cálculo de distancia
    const { calculando: calculandoDistancia, error: errorDistancia, calcularDistanciaEntrega } = useCalculoDistancia({
        ubicacionCarga,
        ubicacionEntrega
    });

    // Efecto para calcular distancia automáticamente cuando se selecciona una ubicación
    useEffect(() => {
        if (ubicacionEntrega && ubicacionCarga) {
            // Limpiar distancia anterior antes de calcular la nueva
            actualizarDatos('ubicacion_entrega', 'distancia_km', null);
            
            calcularDistanciaEntrega().then((distancia) => {
                if (distancia) {
                    actualizarDatos('ubicacion_entrega', 'distancia_km', distancia);
                    // Calcular flete automáticamente
                    calcularFleteAutomatico(distancia);
                }
            });
        } else if (!ubicacionEntrega) {
            // Si no hay ubicación de entrega, limpiar distancia
            actualizarDatos('ubicacion_entrega', 'distancia_km', null);
        }
    }, [ubicacionEntrega?.id, ubicacionCarga?.id]); // Solo dependemos de los IDs, no de las funciones

    // Efecto para calcular rendimiento estimado cuando se selecciona una ubicación de carga
    useEffect(() => {
        if (ubicacionCarga && !cargandoRendimientos) {
            const rendimientoEstimado = obtenerRendimientoEstimado(
                ubicacionCarga.localidad.provincia.nombre,
                ubicacionCarga.localidad.nombre
            );
            
            if (rendimientoEstimado && !datosComerciales.venta.rendimiento_estimado_tn_ha) {
                // Solo establecer el rendimiento si no hay uno ya establecido
                actualizarDatos('venta', 'rendimiento_estimado_tn_ha', rendimientoEstimado);
            }
        }
    }, [ubicacionCarga?.id, cargandoRendimientos]);

    // Efecto para recalcular ingreso por hectárea cuando cambia precio o rendimiento
    useEffect(() => {
        const precio = datosComerciales.venta.precio_venta_por_tn;
        const rendimiento = datosComerciales.venta.rendimiento_estimado_tn_ha;
        const moneda = datosComerciales.venta.moneda;
        const tipoCambio = datosComerciales.venta.tipo_de_cambio;
        
        if (precio && rendimiento) {
            // Convertir precio a USD si es necesario
            let precioEnUSD = precio;
            if (moneda !== 'USD' && tipoCambio) {
                precioEnUSD = precio / tipoCambio;
            } else if (moneda !== 'USD' && !tipoCambio) {
                // Si no hay tipo de cambio, no podemos calcular el ingreso en USD
                actualizarDatos('venta', 'ingreso_por_hectarea', null);
                return;
            }
            
            const ingresoPorHectarea = precioEnUSD * rendimiento;
            actualizarDatos('venta', 'ingreso_por_hectarea', ingresoPorHectarea);
        } else {
            actualizarDatos('venta', 'ingreso_por_hectarea', null);
        }
    }, [datosComerciales.venta.precio_venta_por_tn, datosComerciales.venta.rendimiento_estimado_tn_ha, datosComerciales.venta.moneda, datosComerciales.venta.tipo_de_cambio]);

    // Efecto para recalcular flete cuando cambia la distancia manualmente
    useEffect(() => {
        const distancia = datosComerciales.ubicacion_entrega.distancia_km;
        if (distancia && distancia > 0) {
            calcularFleteAutomatico(distancia);
        }
    }, [datosComerciales.ubicacion_entrega.distancia_km]);

    // Efecto para recalcular flete cuando cambia el contraflete o descuento
    useEffect(() => {
        const distancia = datosComerciales.ubicacion_entrega.distancia_km;
        if (distancia && distancia > 0) {
            calcularFleteAutomatico(distancia);
        }
    }, [valoresEntradaARS.contrafleteARS, valoresEntradaARS.costoPorTnARS, datosComerciales.flete.descuento_porcentaje]);

    // Efecto para recalcular flete cuando cambia el tipo de cambio
    useEffect(() => {
        const distancia = datosComerciales.ubicacion_entrega.distancia_km;
        if (distancia && distancia > 0) {
            const tipoCambioActual = datosComerciales.venta.tipo_de_cambio;
            calcularFleteAutomatico(distancia, tipoCambioActual || undefined);
        }
    }, [datosComerciales.venta.tipo_de_cambio]);

    // Filtrar ubicaciones de descarga
    const ubicacionesDescarga = ubicaciones.filter(({ tipoUbicacion }) => {
        const nombreUbi = tipoUbicacion?.nombre;
        if (nombreUbi === "Carga/Descarga") {
            return true; // Incluir ubicaciones mixtas
        }
        return nombreUbi === "Descarga";
    });

    // Crear opciones para el autocompletar
    const opcionesUbicaciones = ubicacionesDescarga.map(
        (ubicacion) =>
            `${ubicacion.nombre}, ${ubicacion.localidad.nombre}, ${ubicacion.localidad.provincia.nombre}`
    );

    // Opción especial para agregar ubicación
    const opciones = [...opcionesUbicaciones, "__add__"];

    // Función para calcular flete automáticamente
    const calcularFleteAutomatico = async (distancia: number, tipoCambioOverride?: number) => {
        if (!distancia || distancia <= 0) {
            return;
        }

        setCalculandoFlete(true);
        try {
            const contraflete = valoresEntradaARS.contrafleteARS || datosComerciales.flete.contraflete || 0;
            const descuento = datosComerciales.flete.descuento_porcentaje || 0;
            const tipoCambio = tipoCambioOverride || datosComerciales.venta.tipo_de_cambio;
            const costoFlete = await calcularCostoFlete(distancia, 1, contraflete, descuento, tipoCambio || undefined);
            
            if (costoFlete) {
                // Guardar valores originales en ARS para mostrar en los campos (solo si no están ya establecidos)
                if (valoresEntradaARS.contrafleteARS === undefined) {
                    setValoresEntradaARS(prev => ({
                        ...prev,
                        contrafleteARS: contraflete
                    }));
                }
                if (valoresEntradaARS.costoPorTnARS === undefined) {
                    setValoresEntradaARS(prev => ({
                        ...prev,
                        costoPorTnARS: costoFlete.tarifaPorTonelada
                    }));
                }
                
                // Guardar todos los valores calculados del flete de una vez
                if (costoFlete.tarifaPorToneladaUSD !== undefined) {
                    
                    // Actualizar todo el objeto flete de una vez
                    const nuevoEstado: DatosComerciales = {
                        ...datosComerciales,
                        flete: {
                            costoFlete: costoFlete.costoFleteUSD || null,
                            contraflete: costoFlete.costoContrafleteUSD || null,
                            costo_por_tn: costoFlete.costoConDescuentoUSD || null,
                            descuento_porcentaje: datosComerciales.flete.descuento_porcentaje
                        }
                    };
                    setDatosComerciales(nuevoEstado);
                }
                
                
                // Almacenar valores convertidos a USD si están disponibles
                if (costoFlete.tarifaPorToneladaUSD !== undefined) {
                    setValoresFleteUSD({
                        tarifaPorToneladaUSD: costoFlete.tarifaPorToneladaUSD,
                        costoFleteUSD: costoFlete.costoFleteUSD,
                        costoContrafleteUSD: costoFlete.costoContrafleteUSD,
                        costoTotalUSD: costoFlete.costoTotalUSD,
                        costoConDescuentoUSD: costoFlete.costoConDescuentoUSD,
                    });
                } else {
                    setValoresFleteUSD({});
                }

            } else {
                setValoresFleteUSD({});
            }
        } catch (error) {
            console.error('Error calculando flete:', error);
        } finally {
            setCalculandoFlete(false);
        }
    };

    // Manejar selección de ubicación
    const seleccionarUbicacion = (_event: any, seleccionado: string | null) => {
        if (seleccionado === "__add__") {
            // TODO: Implementar modal para agregar nueva ubicación
            return;
        }
        
        if (seleccionado) {
            const index = opcionesUbicaciones.indexOf(seleccionado);
            if (index !== -1) {
                const ubicacion = ubicacionesDescarga[index];
                // Limpiar valores anteriores antes de establecer la nueva ubicación
                actualizarDatos('ubicacion_entrega', 'distancia_km', null);
                actualizarDatos('flete', 'costo_por_tn', null);
                setValoresFleteUSD({});
                
                actualizarDatos('ubicacion_entrega', 'idUbicacion', ubicacion.id);
                setUbicacionSeleccionada(seleccionado);
            }
        } else {
            actualizarDatos('ubicacion_entrega', 'idUbicacion', null);
            actualizarDatos('ubicacion_entrega', 'distancia_km', null);
            actualizarDatos('flete', 'costo_por_tn', null);
            setValoresFleteUSD({});
            setUbicacionSeleccionada(null);
        }
    };


    const actualizarDatos = (seccion: keyof DatosComerciales, campo: string, valor: any) => {
        const nuevoEstado: DatosComerciales = {
            ...datosComerciales,
            [seccion]: {
                ...datosComerciales[seccion],
                [campo]: valor
            }
        };
        setDatosComerciales(nuevoEstado);
    };

    // Función para actualizar solo el estado local de la empresa
    const actualizarEmpresaLocal = (campo: 'cuit' | 'razon_social' | 'nombre_fantasia', valor: string | null) => {
        setEmpresaSeleccionada(prev => ({
            ...prev,
            [campo]: valor
        }));
    };

    // Función para sincronizar el estado local de la empresa con los datos comerciales
    const sincronizarEmpresaConDatosComerciales = () => {
        const nuevoEstado: DatosComerciales = {
            ...datosComerciales,
            titular_carta_porte: {
                cuit: empresaSeleccionada.cuit,
                razon_social: empresaSeleccionada.razon_social,
                nombre_fantasia: empresaSeleccionada.nombre_fantasia
            }
        };
        setDatosComerciales(nuevoEstado);
    };


    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Typography variant="h6" color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AttachMoney />
                Datos Comerciales
            </Typography>

            {/* Ubicación de Entrega */}
            <Card variant="outlined">
                <CardContent>
                    <Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <LocationOn color="primary" />
                        Ubicación de Entrega
                        {cargandoUbicaciones && <Chip label="Cargando..." size="small" color="info" />}
                    </Typography>

                    {errorUbicaciones && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            Error al cargar ubicaciones: {errorUbicaciones}
                        </Alert>
                    )}
                    
                    <Autocomplete
                        disablePortal
                        options={opciones}
                        loading={cargandoUbicaciones}
                        value={ubicacionSeleccionada && opcionesUbicaciones.includes(ubicacionSeleccionada) ? ubicacionSeleccionada : null}
                        onChange={seleccionarUbicacion}
                        sx={{
                            width: '100%',
                            '& .MuiAutocomplete-option': {
                                fontWeight: 400,
                            },
                            '& .Mui-focused .MuiOutlinedInput-notchedOutline': {
                                borderColor: theme.colores.azul,
                            },
                            '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                borderColor: theme.colores.azul,
                            },
                        }}
                        renderOption={(props, option) => {
                            const { key, ...rest } = props;
                            if (option === "__add__") {
                                return (
                                    <li key={key} {...rest} style={{ 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        color: theme.colores.azul, 
                                        fontWeight: 600 
                                    }}>
                                        <AddIcon fontSize="small" style={{ marginRight: 8, color: theme.colores.azul }} />
                                        <span>Agregar una ubicación</span>
                                    </li>
                                );
                            }
                            return <li key={key} {...rest}>{option}</li>;
                        }}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Punto de Entrega"
                                variant="outlined"
                                error={!!errorUbicaciones}
                                helperText={errorUbicaciones ? 'Error al cargar ubicaciones' : 'Selecciona una ubicación de descarga'}
                                sx={{
                                    '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                        borderColor: theme.colores.azul,
                                    },
                                    '& .MuiInputLabel-root.Mui-focused': {
                                        color: theme.colores.azul,
                                    },
                                }}
                            />
                        )}
                    />

                    <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                        <TextField
                            label="Distancia (km)"
                            type="number"
                            value={datosComerciales.ubicacion_entrega.distancia_km || ''}
                            onChange={(e) => actualizarDatos('ubicacion_entrega', 'distancia_km', parseFloat(e.target.value) || null)}
                            fullWidth
                            disabled={calculandoDistancia}
                            helperText={calculandoDistancia ? "Calculando distancia..." : "Se calcula automáticamente con las coordenadas"}
                        />
                        {calculandoDistancia && <CircularProgress size={24} />}
                    </Box>
                    
                    {errorDistancia && (
                        <Alert severity="error" sx={{ mt: 1 }}>
                            Error al calcular distancia: {errorDistancia}
                        </Alert>
                    )}
                </CardContent>
            </Card>

            {/* Flete */}
            <Card variant="outlined">
                <CardContent>
                    <Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <LocalShipping color="primary" />
                        Costos de Flete
                    </Typography>
                    
                    <Grid container spacing={2}>
                        <Grid item xs={4}>
                            <TextField
                                label="Contraflete por TN ($)"
                                type="number"
                                value={valoresEntradaARS.contrafleteARS ?? ''}
                                onChange={(e) => {
                                    const valor = parseFloat(e.target.value) || null;
                                    setValoresEntradaARS(prev => ({ ...prev, contrafleteARS: valor }));
                                    // Solo actualizar datosComerciales con el valor en USD cuando se calcule
                                }}
                                fullWidth
                                helperText={valoresFleteUSD.costoContrafleteUSD ? `USD: $${valoresFleteUSD.costoContrafleteUSD.toFixed(2)}` : ''}
                            />
                        </Grid>
                        <Grid item xs={4}>
                            <TextField
                                label="Descuento (%)"
                                value={datosComerciales.flete.descuento_porcentaje || ''}
                                onChange={(e) => actualizarDatos('flete', 'descuento_porcentaje', parseFloat(e.target.value) || null)}
                                slotProps={{ input: { inputComponent: PorcentajeFormat as any } }}
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={4}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <TextField
                                    label="Costo por TN ($)"
                                    type="number"
                                    value={valoresEntradaARS.costoPorTnARS ?? ''}
                                    onChange={(e) => {
                                        const valor = parseFloat(e.target.value) || null;
                                        setValoresEntradaARS(prev => ({ ...prev, costoPorTnARS: valor }));
                                        // Solo actualizar datosComerciales con el valor en USD cuando se calcule
                                    }}
                                    fullWidth
                                    disabled={calculandoFlete}
                                    helperText={
                                        calculandoFlete 
                                            ? "Calculando flete..." 
                                            : valoresFleteUSD.costoConDescuentoUSD 
                                                ? `USD: $${valoresFleteUSD.costoConDescuentoUSD.toFixed(2)}` 
                                                : "Se calcula automáticamente"
                                    }
                                />
                                {calculandoFlete && <CircularProgress size={20} />}
                            </Box>
                        </Grid>
                    </Grid>
                    
                    {/* Mostrar resumen de costos en USD si hay tipo de cambio */}
                    {datosComerciales.venta.tipo_de_cambio && valoresFleteUSD.costoTotalUSD && (
                        <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                            <Typography variant="subtitle2" color="primary" sx={{ mb: 1 }}>
                                Resumen de Costos de Flete (USD)
                            </Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={6}>
                                    <Typography variant="body2">
                                        <strong>Costo Flete:</strong> ${valoresFleteUSD.costoFleteUSD?.toFixed(2) || '0.00'}
                                    </Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="body2">
                                        <strong>Contraflete:</strong> ${valoresFleteUSD.costoContrafleteUSD?.toFixed(2) || '0.00'}
                                    </Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="body2">
                                        <strong>Total:</strong> ${valoresFleteUSD.costoTotalUSD?.toFixed(2) || '0.00'}
                                    </Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="body2">
                                        <strong>Total Con Descuento:</strong> ${valoresFleteUSD.costoConDescuentoUSD?.toFixed(2) || '0.00'}
                                    </Typography>
                                </Grid>
                            </Grid>
                        </Box>
                    )}
                    
                
                </CardContent>
            </Card>

            {/* Venta */}
            <Card variant="outlined">
                <CardContent>
                    <Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <AttachMoney color="primary" />
                        Datos de Venta
                    </Typography>
                    
                    <Grid container spacing={2}>
                        <Grid item xs={6}>
                            <TextField
                                label="Precio por TN"
                                type="number"
                                value={datosComerciales.venta.precio_venta_por_tn || ''}
                                onChange={(e) => actualizarDatos('venta', 'precio_venta_por_tn', parseFloat(e.target.value) || null)}
                                fullWidth
                                required
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <FormControl fullWidth>
                                <InputLabel>Moneda</InputLabel>
                                <Select
                                    value={datosComerciales.venta.moneda}
                                    onChange={(e) => actualizarDatos('venta', 'moneda', e.target.value)}
                                    label="Moneda"
                                >
                                    {MONEDAS.map((moneda) => (
                                        <MenuItem key={moneda.codigo} value={moneda.codigo}>
                                            {moneda.nombre} ({moneda.codigo})
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                label="Rendimiento Estimado (tn/ha)"
                                type="number"
                                value={datosComerciales.venta.rendimiento_estimado_tn_ha || ''}
                                onChange={(e) => actualizarDatos('venta', 'rendimiento_estimado_tn_ha', parseFloat(e.target.value) || null)}
                                fullWidth
                                disabled={cargandoRendimientos}
                                helperText={
                                    cargandoRendimientos 
                                        ? "Cargando datos de rendimientos..." 
                                        : errorRendimientos 
                                            ? "Error al cargar rendimientos" 
                                            : datosComerciales.venta.rendimiento_estimado_tn_ha
                                                ? "Valor estimado según ubicación del lote"
                                                : "Ingrese manualmente el rendimiento esperado"
                                }
                                error={!!errorRendimientos}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                label="Ingreso por Hectárea (USD)"
                                type="number"
                                value={datosComerciales.venta.ingreso_por_hectarea || ''}
                                fullWidth
                                disabled
                                helperText="Se calcula automáticamente: (Precio × Rendimiento) convertido a USD"
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                label="Fecha de Venta"
                                type="date"
                                value={datosComerciales.venta.fecha_venta}
                                onChange={(e) => actualizarDatos('venta', 'fecha_venta', e.target.value)}
                                fullWidth
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <FormControl fullWidth>
                                <InputLabel>Condiciones de Pago</InputLabel>
                                <Select
                                    value={datosComerciales.venta.condiciones_pago}
                                    onChange={(e) => actualizarDatos('venta', 'condiciones_pago', e.target.value)}
                                    label="Condiciones de Pago"
                                >
                                    {CONDICIONES_PAGO.map((condicion) => (
                                        <MenuItem key={condicion} value={condicion}>
                                            {condicion}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        {datosComerciales.venta.moneda !== 'ARS' && (
                            <Grid item xs={12}>
                                <TextField
                                    label="Tipo de Cambio"
                                    type="number"
                                    value={datosComerciales.venta.tipo_de_cambio || ''}
                                    onChange={(e) => actualizarDatos('venta', 'tipo_de_cambio', parseFloat(e.target.value) || null)}
                                    fullWidth
                                    helperText={`1 ${datosComerciales.venta.moneda} = X ARS`}
                                />
                            </Grid>
                        )}
                    </Grid>
                </CardContent>
            </Card>

            {/* Sección Empresa Productora */}
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <AddIcon color="primary" />
                        Empresa Productora
                    </Typography>
                    
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <AutocompleteEmpresas
                                value={empresaSeleccionada.cuit}
                                onChange={(cuit: string | null) => {
                                    actualizarEmpresaLocal('cuit', cuit);
                                }}
                                onChangeEmpresa={(empresa) => {
                                    if (empresa) {
                                        actualizarEmpresaLocal('cuit', empresa.cuit);
                                        actualizarEmpresaLocal('razon_social', empresa.razonSocial);
                                        actualizarEmpresaLocal('nombre_fantasia', empresa.nombreFantasia);
                                    } else {
                                        actualizarEmpresaLocal('cuit', null);
                                        actualizarEmpresaLocal('razon_social', null);
                                        actualizarEmpresaLocal('nombre_fantasia', null);
                                    }
                                }}
                                labelText="Seleccionar Empresa Productora"
                                rolEmpresa="Titular Carta de Porte"
                                error={false}
                                helperText="Seleccione la empresa productora que será el titular de la carta de porte"
                            />
                        </Grid>
                        
                        {/* Mostrar empresa seleccionada */}
                        {empresaSeleccionada.cuit && (
                            <Grid item xs={12}>
                                <Alert severity="success" sx={{ mt: 1 }}>
                                    <Typography variant="body2">
                                        <strong>Empresa seleccionada:</strong><br />
                                        {empresaSeleccionada.razon_social || empresaSeleccionada.nombre_fantasia || `CUIT: ${empresaSeleccionada.cuit}`}
                                    </Typography>
                                </Alert>
                            </Grid>
                        )}
                    </Grid>
                </CardContent>
            </Card>
                    
                    {/* Mensaje informativo sobre rendimiento */}
                    {ubicacionCarga && !cargandoRendimientos && !errorRendimientos && !datosComerciales.venta.rendimiento_estimado_tn_ha && (
                        <Alert severity="info" sx={{ mt: 2 }}>
                            <Typography variant="body2">
                                No se encontró información de rendimiento para {ubicacionCarga.localidad.nombre}, {ubicacionCarga.localidad.provincia.nombre}. 
                                Por favor, ingrese manualmente el rendimiento estimado.
                            </Typography>
                        </Alert>
                    )}
                    
                    {/* Mensaje informativo sobre tipo de cambio */}
                    {datosComerciales.venta.moneda !== 'USD' && !datosComerciales.venta.tipo_de_cambio && datosComerciales.venta.precio_venta_por_tn && (
                        <Alert severity="warning" sx={{ mt: 2 }}>
                            <Typography variant="body2">
                                Para calcular el ingreso por hectárea en USD, es necesario ingresar el tipo de cambio.
                            </Typography>
                        </Alert>
                    )}
        </Box>
    );
}
