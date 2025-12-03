// Utilidades para cálculo de fletes
import Papa from "papaparse";
import { calcularDistanciaReal, redondearDistanciaParaTarifa } from "../../../../utils/distanciaUtils";
import axios from "axios";

/**
 * Calcula la distancia entre dos puntos usando la fórmula de Haversine
 * @param lat1 - Latitud del punto 1
 * @param lon1 - Longitud del punto 1
 * @param lat2 - Latitud del punto 2
 * @param lon2 - Longitud del punto 2
 * @returns Distancia en kilómetros
 */
// Re-exportar calcularDistanciaHaversine desde distanciaUtils
export { calcularDistanciaHaversine } from "../../../../utils/distanciaUtils";

/**
 * Calcula la distancia real considerando rutas de carretera
 * @param lat1 - Latitud del punto 1
 * @param lon1 - Longitud del punto 1
 * @param lat2 - Latitud del punto 2
 * @param lon2 - Longitud del punto 2
 * @returns Distancia estimada en kilómetros considerando rutas
 */
export function calcularDistanciaFlete(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
): number {
    const distanciaReal = calcularDistanciaReal(lat1, lon1, lat2, lon2);
    return redondearDistanciaParaTarifa(distanciaReal);
}

/**
 * Obtiene la tarifa de flete según la distancia
 * @param distanciaKm - Distancia en kilómetros
 * @returns Tarifa por tonelada o null si no se encuentra
 */
export async function obtenerTarifaFlete(distanciaKm: number): Promise<number | null> {
    try {
        const res = await axios.get("/tarifas.csv", { 
            responseType: 'text',
            withCredentials: false 
        });
        const text = res.data;
        const data = Papa.parse<string[]>(text, { header: false }).data;
        
        // Buscar la fila que coincida con la distancia
        const fila = data.find((f) => parseInt(f[0]) === distanciaKm);
        if (!fila) {
            // Si no encuentra la distancia exacta, buscar la más cercana
            const distancias = data
                .map(f => parseInt(f[0]))
                .filter(d => !isNaN(d))
                .sort((a, b) => a - b);
            
            // Encontrar la distancia más cercana
            const distanciaCercana = distancias.reduce((prev, curr) => 
                Math.abs(curr - distanciaKm) < Math.abs(prev - distanciaKm) ? curr : prev
            );
            
            const filaCercana = data.find((f) => parseInt(f[0]) === distanciaCercana);
            if (filaCercana) {
                const tarifa = parseFloat(filaCercana[1]);
                return tarifa;
            }
            return null;
        }
        
        const tarifa = parseFloat(fila[1]);
        return tarifa;
    } catch (error) {
        return null;
    }
}

/**
 * Calcula el costo total de flete
 * @param distanciaKm - Distancia en kilómetros
 * @param toneladas - Cantidad de toneladas
 * @param contraflete - Contraflete por tonelada (opcional)
 * @param descuento - Porcentaje de descuento (opcional)
 * @param tipoCambio - Tipo de cambio para convertir de ARS a USD (opcional)
 * @returns Objeto con costos calculados
 */
export async function calcularCostoFlete(
    distanciaKm: number,
    toneladas: number = 1,
    contraflete: number = 0,
    descuento: number = 0,
    tipoCambio?: number
): Promise<{
    tarifaPorTonelada: number;
    tarifaPorToneladaUSD?: number;
    costoFlete: number;
    costoFleteUSD?: number;
    costoContraflete: number;
    costoContrafleteUSD?: number;
    costoTotal: number;
    costoTotalUSD?: number;
    costoConDescuento: number;
    costoConDescuentoUSD?: number;
} | null> {
    const tarifaPorTonelada = await obtenerTarifaFlete(distanciaKm);
    if (tarifaPorTonelada === null) {
        return null;
    }

    const costoFlete = tarifaPorTonelada * toneladas;
    const costoContraflete = contraflete * toneladas;
    const costoFleteConDescuento = costoFlete - (costoFlete * descuento / 100);
    const costoTotal = costoFlete + costoContraflete;
    const costoConDescuento = costoFleteConDescuento + costoContraflete;

    const resultado = {
        tarifaPorTonelada,
        costoFlete,
        costoContraflete,
        costoTotal,
        costoConDescuento,
    };

    // Si hay tipo de cambio, convertir a USD
    if (tipoCambio && tipoCambio > 0) {
        return {
            ...resultado,
            tarifaPorToneladaUSD: tarifaPorTonelada / tipoCambio,
            costoFleteUSD: costoFlete / tipoCambio,
            costoContrafleteUSD: costoContraflete / tipoCambio,
            costoTotalUSD: costoTotal / tipoCambio,
            costoConDescuentoUSD: costoConDescuento / tipoCambio,
        };
    }

    return resultado;
}

/**
 * Obtiene las coordenadas de carga desde la planificación
 * @param _planificacion - Planificación del lote
 * @returns Coordenadas de carga o null
 */
export function obtenerCoordenadasCarga(_planificacion: any): { lat: number; lon: number } | null {
    // Aquí necesitarías obtener las coordenadas del lote desde la planificación
    // Por ahora retorno null, pero esto se puede implementar cuando tengas
    // las coordenadas del lote en la planificación
    return null;
}

/**
 * Obtiene las coordenadas de descarga desde la ubicación seleccionada
 * @param ubicacion - Ubicación de descarga
 * @returns Coordenadas de descarga
 */
export function obtenerCoordenadasDescarga(ubicacion: any): { lat: number; lon: number } | null {
    if (!ubicacion || !ubicacion.latitud || !ubicacion.longitud) {
        return null;
    }
    
    const coords = {
        lat: ubicacion.latitud,
        lon: ubicacion.longitud
    };
    return coords;
}
