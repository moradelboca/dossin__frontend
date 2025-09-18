import { useState, useEffect } from 'react';
import { supabaseAgro } from '../../../../lib/supabase';
import { 
    evaluarRotacionCultivo, 
    // obtenerCultivoAnterior, // No se usa 
    RecomendacionRotacion,
    CULTIVOS 
} from '../../../../lib/rotacionCultivos';

interface UseRotacionCultivosProps {
    idLote: string;
    idUbicacion: number;
    campaniaActual: string;
    cultivoNuevo: number;
}

export function useRotacionCultivos({
    idLote,
    idUbicacion,
    campaniaActual,
    cultivoNuevo
}: UseRotacionCultivosProps) {
    const [recomendacion, setRecomendacion] = useState<RecomendacionRotacion | null>(null);
    const [cultivoAnterior, setCultivoAnterior] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!idLote || !idUbicacion || !campaniaActual || !cultivoNuevo) {
            return;
        }

        evaluarRotacion();
    }, [idLote, idUbicacion, campaniaActual, cultivoNuevo]);

    const evaluarRotacion = async () => {
        setLoading(true);
        setError(null);

        try {
            // Buscar planificaciones anteriores del mismo lote y ubicación
            const { data: planificacionesAnteriores, error } = await supabaseAgro
                .from('PlaneacionLote')
                .select('*')
                .eq('idLote', idLote)
                .eq('idUbicacion', idUbicacion)
                .neq('campania', campaniaActual) // Excluir la campaña actual
                .order('campania', { ascending: false }); // Ordenar por campaña descendente

            if (error) {
                throw error;
            }


            if (!planificacionesAnteriores || planificacionesAnteriores.length === 0) {
                // No hay planificaciones anteriores, es la primera siembra
                const recomendacionInicial = evaluarRotacionCultivo(null, cultivoNuevo, [], 0);
                setRecomendacion(recomendacionInicial);
                setCultivoAnterior(null);
                return;
            }

            // Tomar la planificación más reciente (primera del array ordenado)
            const planificacionAnterior = planificacionesAnteriores[0];
            

            // Extraer insumos utilizados de la estructura anterior
            const insumosUtilizados = extraerInsumosDeEstructura(planificacionAnterior.estructura);
            
            // Calcular días transcurridos (aproximado)
            const diasTranscurridos = calcularDiasTranscurridos(
                planificacionAnterior.fechaSiembra,
                new Date().toISOString()
            );


            // Evaluar la rotación
            const nuevaRecomendacion = evaluarRotacionCultivo(
                planificacionAnterior.cultivo,
                cultivoNuevo,
                insumosUtilizados,
                diasTranscurridos
            );


            setRecomendacion(nuevaRecomendacion);
            setCultivoAnterior(
                CULTIVOS[planificacionAnterior.cultivo as keyof typeof CULTIVOS]?.nombre || 'Cultivo desconocido'
            );

        } catch (err: any) {
            console.error('Error evaluando rotación:', err);
            setError(err.message || 'Error al evaluar la rotación de cultivos');
        } finally {
            setLoading(false);
        }
    };

    return {
        recomendacion,
        cultivoAnterior,
        loading,
        error,
        reevaluar: evaluarRotacion
    };
}


// Función auxiliar para extraer insumos de la estructura
function extraerInsumosDeEstructura(estructura: any[]): string[] {
    const insumos: string[] = [];
    
    if (!estructura || !Array.isArray(estructura)) {
        return insumos;
    }

    estructura.forEach(item => {
        if (item.tipo === 'insumo' && item.nombre) {
            insumos.push(item.nombre);
        }
    });

    return insumos;
}

// Función auxiliar para calcular días transcurridos
function calcularDiasTranscurridos(fechaSiembra: string, fechaActual: string): number {
    try {
        const fechaSiembraDate = new Date(fechaSiembra);
        const fechaActualDate = new Date(fechaActual);
        const diferenciaMs = fechaActualDate.getTime() - fechaSiembraDate.getTime();
        return Math.floor(diferenciaMs / (1000 * 60 * 60 * 24));
    } catch (error) {
        console.error('Error calculando días transcurridos:', error);
        return 0;
    }
}
