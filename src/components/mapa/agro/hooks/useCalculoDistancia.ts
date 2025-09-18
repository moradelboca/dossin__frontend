import { useState, useCallback } from 'react';
import { calcularDistancia, redondearDistanciaParaTarifa } from '../../../../utils/distanciaUtils';
import { obtenerCoordenadasDescarga } from '../utils/fleteUtils';

interface UseCalculoDistanciaProps {
    ubicacionCarga: any; // Ubicación del lote (carga)
    ubicacionEntrega: any; // Ubicación de entrega seleccionada
}

interface CalculoDistanciaResult {
    distanciaKm: number | null;
    calculando: boolean;
    error: string | null;
}

export function useCalculoDistancia({ ubicacionCarga, ubicacionEntrega }: UseCalculoDistanciaProps) {
    const [resultado, setResultado] = useState<CalculoDistanciaResult>({
        distanciaKm: null,
        calculando: false,
        error: null
    });

    const calcularDistanciaEntrega = useCallback(async () => {
        if (!ubicacionCarga || !ubicacionEntrega) {
            setResultado({
                distanciaKm: null,
                calculando: false,
                error: null
            });
            return;
        }

        setResultado(prev => ({ ...prev, calculando: true, error: null }));

        try {
            // Obtener coordenadas de carga
            const coordsCarga = obtenerCoordenadasDescarga(ubicacionCarga);
            if (!coordsCarga) {
                throw new Error("No se pudieron obtener las coordenadas de carga");
            }

            // Obtener coordenadas de entrega
            const coordsEntrega = obtenerCoordenadasDescarga(ubicacionEntrega);
            if (!coordsEntrega) {
                throw new Error("No se pudieron obtener las coordenadas de entrega");
            }

            // Calcular distancia real usando OpenRouteService (con fallback a cálculo local)
            const distanciaCalculada = await calcularDistancia(
                coordsCarga.lat,
                coordsCarga.lon,
                coordsEntrega.lat,
                coordsEntrega.lon
            );
            const distanciaKm = redondearDistanciaParaTarifa(distanciaCalculada);

            setResultado({
                distanciaKm,
                calculando: false,
                error: null
            });

            return distanciaKm;
        } catch (error: any) {
            console.error('Error en calcularDistanciaEntrega:', error);
            setResultado({
                distanciaKm: null,
                calculando: false,
                error: error.message
            });
            return null;
        }
    }, [ubicacionCarga, ubicacionEntrega]);

    return {
        ...resultado,
        calcularDistanciaEntrega
    };
}
