// Hook para manejo de estructura de cultivos
import { useState, useEffect, useCallback } from 'react';
import { EstructuraFechasCultivo } from '../../../../types/agro';
import { supabaseAgro } from '../../../../lib/supabase';

/**
 * Hook para cargar y manejar estructuras de cultivos
 * @returns Objeto con estructuras y funciones de manejo
 */
export const useEstructuraCultivo = () => {
    const [estructuras, setEstructuras] = useState<EstructuraFechasCultivo[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const cargarEstructuras = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            
            
            const { data, error: fetchError } = await supabaseAgro
                .from('EstructuraFechasCultivo')
                .select('*');

            if (fetchError) {
                throw fetchError;
            }

            setEstructuras(data || []);
        } catch (err: any) {
            setError(err.message || 'Error cargando estructuras');
            console.error('Error cargando estructuras:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    const obtenerEstructuraPorCultivo = useCallback((cultivoId: number): EstructuraFechasCultivo | null => {
        return estructuras.find(e => e.cultivo === cultivoId) || null;
    }, [estructuras]);

    const actualizarEstructura = useCallback(async (cultivoId: number, items: any[]) => {
        try {
            setLoading(true);
            setError(null);

            const { error: updateError } = await supabaseAgro
                .from('EstructuraFechasCultivo')
                .update({ items })
                .eq('cultivo', cultivoId);

            if (updateError) {
                console.error('🔍 actualizarEstructura - error:', updateError);
                throw updateError;
            }

            // Actualizar solo la estructura específica en el estado local
            setEstructuras(prev => prev.map(estructura => 
                estructura.cultivo === cultivoId 
                    ? { ...estructura, items }
                    : estructura
            ));
        } catch (err: any) {
            console.error('🔍 actualizarEstructura - error catch:', err);
            setError(err.message || 'Error actualizando estructura');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        cargarEstructuras();
    }, []); // Solo se ejecuta una vez al montar

    return {
        estructuras,
        loading,
        error,
        cargarEstructuras,
        obtenerEstructuraPorCultivo,
        actualizarEstructura
    };
};
