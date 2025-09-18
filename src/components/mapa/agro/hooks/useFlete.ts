import { useState, useEffect, useMemo } from 'react';
import { calcularCostoFlete, obtenerCoordenadasDescarga } from '../utils/fleteUtils';
import { calcularDistancia, redondearDistanciaParaTarifa } from '../../../../utils/distanciaUtils';
import { useUbicaciones } from './useUbicaciones';

interface UseFleteProps {
    ubicacionEntrega: any; // Ubicación de descarga seleccionada
    idUbicacionCarga: number; // ID de la ubicación de carga (lote)
    toneladas?: number; // Toneladas a transportar (por defecto 1)
    contraflete?: number; // Contraflete por tonelada
    descuento?: number; // Porcentaje de descuento
}

interface FleteCalculado {
    distanciaKm: number;
    tarifaPorTonelada: number;
    costoFlete: number;
    costoContraflete: number;
    costoTotal: number;
    costoConDescuento: number;
    costoPorHectarea: number;
    calculando: boolean;
    error: string | null;
}

export function useFlete({
    ubicacionEntrega,
    idUbicacionCarga,
    toneladas = 1,
    contraflete = 0,
    descuento = 0
}: UseFleteProps): FleteCalculado {
    // const [calculando, setCalculando] = useState(false); // No se usa
    // const [error, setError] = useState<string | null>(null); // No se usa
    const { ubicaciones } = useUbicaciones();

    const fleteCalculado = useMemo(async (): Promise<FleteCalculado> => {
        // Si no hay ubicación de entrega, retornar valores por defecto
        if (!ubicacionEntrega) {
            return {
                distanciaKm: 0,
                tarifaPorTonelada: 0,
                costoFlete: 0,
                costoContraflete: 0,
                costoTotal: 0,
                costoConDescuento: 0,
                costoPorHectarea: 0,
                calculando: false,
                error: null
            };
        }

        // Buscar la ubicación de carga en la lista de ubicaciones
        const ubicacionCarga = ubicaciones.find(u => u.id === idUbicacionCarga);
        if (!ubicacionCarga) {
            return {
                distanciaKm: 0,
                tarifaPorTonelada: 0,
                costoFlete: 0,
                costoContraflete: 0,
                costoTotal: 0,
                costoConDescuento: 0,
                costoPorHectarea: 0,
                calculando: false,
                error: "No se encontró la ubicación de carga"
            };
        }

        // setCalculando(true); // Comentado
        // setError(null); // Comentado

        try {
            // Obtener coordenadas de descarga
            const coordsDescarga = obtenerCoordenadasDescarga(ubicacionEntrega);
            if (!coordsDescarga) {
                throw new Error("No se pudieron obtener las coordenadas de descarga");
            }

            // Obtener coordenadas de carga
            const coordsCarga = obtenerCoordenadasDescarga(ubicacionCarga);
            if (!coordsCarga) {
                throw new Error("No se pudieron obtener las coordenadas de carga");
            }

            // Calcular distancia real usando OpenRouteService (con fallback a cálculo local)
            const distanciaCalculada = await calcularDistancia(
                coordsCarga.lat,
                coordsCarga.lon,
                coordsDescarga.lat,
                coordsDescarga.lon
            );
            const distanciaKm = redondearDistanciaParaTarifa(distanciaCalculada);

            // Calcular costo de flete
            const costoFlete = await calcularCostoFlete(
                distanciaKm,
                toneladas,
                contraflete,
                descuento
            );

            if (!costoFlete) {
                throw new Error("No se pudo calcular la tarifa de flete");
            }

            return {
                distanciaKm,
                tarifaPorTonelada: costoFlete.tarifaPorTonelada,
                costoFlete: costoFlete.costoFlete,
                costoContraflete: costoFlete.costoContraflete,
                costoTotal: costoFlete.costoTotal,
                costoConDescuento: costoFlete.costoConDescuento,
                costoPorHectarea: costoFlete.costoConDescuento, // Por hectárea (asumiendo 1 tn/ha)
                calculando: false,
                error: null
            };
        } catch (err: any) {
            // setError(err.message); // Comentado
            return {
                distanciaKm: 0,
                tarifaPorTonelada: 0,
                costoFlete: 0,
                costoContraflete: 0,
                costoTotal: 0,
                costoConDescuento: 0,
                costoPorHectarea: 0,
                calculando: false,
                error: err.message
            };
        } finally {
            // setCalculando(false); // Comentado
        }
    }, [ubicacionEntrega, idUbicacionCarga, ubicaciones, toneladas, contraflete, descuento]);

    // Como useMemo no puede ser async, usamos useEffect para manejar el estado
    const [resultado, setResultado] = useState<FleteCalculado>({
        distanciaKm: 0,
        tarifaPorTonelada: 0,
        costoFlete: 0,
        costoContraflete: 0,
        costoTotal: 0,
        costoConDescuento: 0,
        costoPorHectarea: 0,
        calculando: false,
        error: null
    });

    useEffect(() => {
        fleteCalculado.then(setResultado);
    }, [fleteCalculado]);

    return resultado;
}

