import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Alert,
    Grid,
    Box,
} from '@mui/material';
import { supabaseAgro, uploadKMZToSupabase } from '../../../../../../lib/supabase';
import { PlaneacionLote, EstructuraFechasCultivo, ItemEstructura } from '../../../../../../types/agro';
import { calcularSuperficieKMZ } from '../../../utils/kmzUtils';
import { useEstructuraCultivo } from '../../../hooks';
import { useCampañas } from '../../../hooks/useCampañas';
import { convertirItemsAItemsPlanificacion } from '../../../utils';
import { PlanificacionFormHeader } from './PlanificacionFormHeader';
import { PlanificacionFormFields } from './PlanificacionFormFields';
import { PlanificacionFormPreview } from './PlanificacionFormPreview';
import { PlanificacionFormActions } from './PlanificacionFormActions';
import { PlanificacionFormDatosComerciales } from './PlanificacionFormDatosComerciales';

interface PlanificacionFormProps {
    open: boolean;
    onClose: () => void;
    lote: any;
    ubicacion: any;
    onPlanificacionCreada: (planificacion: PlaneacionLote) => void;
    campaniaPrecargada?: string; // Nueva prop para precargar campaña
    onDatosComercialesChange?: (datosComerciales: any) => void; // Nueva prop para notificar cambios
}

export function PlanificacionForm({ open, onClose, lote, ubicacion, onPlanificacionCreada, campaniaPrecargada, onDatosComercialesChange }: PlanificacionFormProps) {
    const { obtenerEstructuraPorCultivo } = useEstructuraCultivo();
    const { campañas, loading: cargandoCampañas, getCampañaActual } = useCampañas();
    
    const [loading, setLoading] = useState(false);
    const [nombreLote, setNombreLote] = useState<string>(lote?.nombre || '');
    const [campania, setCampania] = useState<string>('');
    const [cultivo, setCultivo] = useState<number>(1);
    const [fechaSiembra, setFechaSiembra] = useState<string>('');
    const [kmzFile, setKmzFile] = useState<File | null>(null);
    const [superficieCalculada, setSuperficieCalculada] = useState<number | null>(null);
    const [error, setError] = useState<string>('');
    const [estructuraCultivo, setEstructuraCultivo] = useState<EstructuraFechasCultivo | null>(null);
    const [etapasGeneradas, setEtapasGeneradas] = useState<ItemEstructura[]>([]);
    const [costoTotalEstimado, setCostoTotalEstimado] = useState<number>(0);
    
    // Estado para datos comerciales (solo datos de entrada, no cálculos)
    const [datosComerciales, setDatosComerciales] = useState({
        venta: {
            moneda: 'USD',
            fecha_venta: '',
            tipo_de_cambio: null as number | null,
            condiciones_pago: 'Contado',
            precio_venta_por_tn: null as number | null,
            rendimiento_estimado_tn_ha: null as number | null,
            ingreso_por_hectarea: null as number | null,
        },
        ubicacion_entrega: {
            distancia_km: null as number | null,
            idUbicacion: null as number | null,
        },
        flete: {
            costoFlete: null as number | null,
            contraflete: null as number | null,
            costo_por_tn: null as number | null,
            descuento_porcentaje: null as number | null,
        },
        titular_carta_porte: {
            cuit: null as string | null,
            razon_social: null as string | null,
            nombre_fantasia: null as string | null,
        },
    });

    // Notificar cambios en datos comerciales
    useEffect(() => {
        if (onDatosComercialesChange) {
            onDatosComercialesChange(datosComerciales);
        }
    }, [datosComerciales, onDatosComercialesChange]);

    // Establecer campaña inicial una vez que las campañas se hayan cargado
    useEffect(() => {
        if (!cargandoCampañas && campañas.length > 0 && !campania) {
            if (campaniaPrecargada) {
                // Verificar que la campaña precargada existe en las opciones
                const existeCampaña = campañas.some(c => c.id === campaniaPrecargada);
                if (existeCampaña) {
                    setCampania(campaniaPrecargada);
                } else {
                    // Si no existe, usar la campaña actual
                    const campañaActual = getCampañaActual();
                    if (campañaActual) {
                        setCampania(campañaActual.id);
                    }
                }
            } else {
                // Usar la campaña actual por defecto
                const campañaActual = getCampañaActual();
                if (campañaActual) {
                    setCampania(campañaActual.id);
                }
            }
        }
    }, [cargandoCampañas, campañas, campania, campaniaPrecargada, getCampañaActual]);

    // Cargar estructura del cultivo cuando cambie
    useEffect(() => {
        if (cultivo) {
            const estructura = obtenerEstructuraPorCultivo(cultivo);
            setEstructuraCultivo(estructura);
        }
    }, [cultivo, obtenerEstructuraPorCultivo]);

    // Generar etapas cuando cambie la fecha de siembra o estructura
    useEffect(() => {
        if (fechaSiembra && estructuraCultivo) {
            generarEtapasCultivo();
        }
    }, [fechaSiembra, estructuraCultivo]);

    // Generar etapas del cultivo basadas en la fecha de siembra
    const generarEtapasCultivo = () => {
        if (!estructuraCultivo || !fechaSiembra) return;

        const etapas: ItemEstructura[] = [];

        // Generar etapas basadas en la nueva estructura del cultivo (items)
        if (estructuraCultivo.items) {
            estructuraCultivo.items.forEach((item) => {
                // Solo procesar labores para las etapas
                if (item.tipo === 'labor') {
                    etapas.push(item);
                }
            });
        }

        // Ordenar por fecha relativa
        etapas.sort((a, b) => a.fechaRelativa - b.fechaRelativa);

        setEtapasGeneradas(etapas);

        // Calcular costo total estimado (solo labores, los insumos se calculan por separado)
        const costoTotal = etapas.reduce((total, etapa) => total + (etapa.costo || 0), 0);
        setCostoTotalEstimado(costoTotal);
    };

    // Generar estructura inicial de planificación
    const generarEstructuraInicial = () => {
        if (!estructuraCultivo || !fechaSiembra) return;

        return convertirItemsAItemsPlanificacion(estructuraCultivo.items, fechaSiembra);
    };

    // Validar que lote y ubicacion existan
    if (!lote || !ubicacion) {
        return null;
    }

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setKmzFile(file);
            
            try {
                // Calcular superficie del KMZ usando la utilidad
                const superficie = await calcularSuperficieKMZ(file);
                setSuperficieCalculada(superficie);
            } catch (error) {
                setError('Error al procesar el archivo KMZ. Verifica que sea un archivo válido.');
            }
        }
    };

    const handleSubmit = async () => {
        // Validaciones
        if (!nombreLote.trim()) {
            setError('Por favor ingresa el nombre del lote');
            return;
        }

        if (!fechaSiembra) {
            setError('Por favor selecciona una fecha de siembra');
            return;
        }

        if (!superficieCalculada || superficieCalculada <= 0) {
            setError('Por favor ingresa una superficie válida del lote');
            return;
        }

        if (etapasGeneradas.length === 0) {
            setError('No se pudo generar la estructura del cultivo. Verifica la fecha de siembra.');
            return;
        }

        // Validar datos comerciales opcionales pero importantes
        if (datosComerciales.venta.precio_venta_por_tn && datosComerciales.venta.precio_venta_por_tn <= 0) {
            setError('El precio de venta debe ser mayor a 0');
            return;
        }

        setLoading(true);
        setError('');

        try {
            // Generar la estructura inicial basada en las etapas generadas
            const estructuraInicial = generarEstructuraInicial();
            if (!estructuraInicial || estructuraInicial.length === 0) {
                setError('No se pudo generar la estructura del cultivo. Verifica la fecha de siembra.');
                return;
            }

            // Crear la planificación
            const nuevaPlanificacion: PlaneacionLote = {
                campania: campania,
                idLote: nombreLote.trim(),
                idUbicacion: Number(ubicacion.id), // Asegurar que sea número
                cultivo,
                superficie: superficieCalculada,
                estructura: estructuraInicial,
                extras: [],
                fechaSiembra,
                linkKMZ: undefined, // Se actualizará si se sube KMZ
                datos_comerciales: datosComerciales, // Incluir datos comerciales
                lluvias: [], // Inicializar array vacío
            };


            // INSERT en Supabase
            const { data, error: insertError } = await supabaseAgro
                .from('PlaneacionLote')
                .insert([nuevaPlanificacion])
                .select()
                .single();

            if (insertError) {
                throw insertError;
            }

            // Si hay KMZ, subirlo al bucket y actualizar linkKMZ
            if (kmzFile) {
                try {
                    const uploadResult = await uploadKMZToSupabase(
                        kmzFile,
                        nombreLote.trim(),
                        ubicacion.id.toString() // Convertir a string como espera la función
                    );

                    if (!uploadResult) {
                        throw new Error('Error subiendo KMZ: No se pudo procesar el archivo');
                    }

                    // Actualizar el linkKMZ con la ruta real del archivo subido
                    nuevaPlanificacion.linkKMZ = uploadResult.path;
                    
                    // Actualizar la planificación en Supabase con el linkKMZ
                    const { error: updateError } = await supabaseAgro
                        .from('PlaneacionLote')
                        .update({ linkKMZ: uploadResult.path })
                        .eq('campania', nuevaPlanificacion.campania)
                        .eq('idLote', nuevaPlanificacion.idLote);

                    if (updateError) {
                        // Error silencioso para mantener el código limpio
                    }
                } catch (uploadError: any) {
                    // No fallar la planificación si falla la subida del KMZ
                    setError(`Planificación creada pero error subiendo KMZ: ${uploadError.message}`);
                }
            }

            // Notificar que se creó la planificación
            onPlanificacionCreada(data);
            onClose();

        } catch (error: any) {
            setError(error.message || 'Error al crear la planificación');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>
                <PlanificacionFormHeader 
                    campania={campania}
                    ubicacion={ubicacion}
                    onClose={onClose}
                />
            </DialogTitle>

            <DialogContent>
                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                <Grid container spacing={3}>
                    {/* Columna Izquierda - Formulario */}
                    <Grid item xs={12} md={6}>
                        <PlanificacionFormFields
                            nombreLote={nombreLote}
                            setNombreLote={setNombreLote}
                            campania={campania}
                            setCampania={setCampania}
                            cultivo={cultivo}
                            setCultivo={setCultivo}
                            fechaSiembra={fechaSiembra}
                            setFechaSiembra={setFechaSiembra}
                            superficieCalculada={superficieCalculada}
                            setSuperficieCalculada={setSuperficieCalculada}
                            kmzFile={kmzFile}
                            onFileChange={handleFileChange}
                        />
                    </Grid>

                    {/* Columna Derecha - Vista Previa */}
                    <Grid item xs={12} md={6}>
                        <PlanificacionFormPreview
                            fechaSiembra={fechaSiembra}
                            estructuraCultivo={estructuraCultivo}
                            etapasGeneradas={etapasGeneradas}
                            costoTotalEstimado={costoTotalEstimado}
                            idLote={nombreLote}
                            idUbicacion={Number(ubicacion.id)}
                            campania={campania}
                            cultivo={cultivo}
                        />
                    </Grid>
                </Grid>

                {/* Datos Comerciales - Nueva sección */}
                <Box sx={{ mt: 4 }}>
                    <PlanificacionFormDatosComerciales
                        datosComerciales={datosComerciales}
                        setDatosComerciales={setDatosComerciales}
                        idUbicacionCarga={Number(ubicacion.id)}
                    />
                </Box>
            </DialogContent>

            <DialogActions sx={{ p: 3, justifyContent: 'flex-end' }}>
                <PlanificacionFormActions
                    loading={loading}
                    nombreLote={nombreLote}
                    campania={campania}
                    fechaSiembra={fechaSiembra}
                    superficieCalculada={superficieCalculada}
                    etapasGeneradas={etapasGeneradas}
                    onClose={onClose}
                    onSubmit={handleSubmit}
                />
            </DialogActions>
        </Dialog>
    );
}
