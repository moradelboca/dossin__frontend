/**
 * Utilidades para el cálculo de distancias geográficas
 */

// API Key de OpenRouteService desde variables de entorno
const OPENROUTE_API_KEY = import.meta.env.VITE_OPENROUTE_API_KEY;

/**
 * Calcula la distancia entre dos puntos geográficos usando la fórmula de Haversine
 * @param lat1 Latitud del primer punto
 * @param lon1 Longitud del primer punto
 * @param lat2 Latitud del segundo punto
 * @param lon2 Longitud del segundo punto
 * @returns Distancia en kilómetros
 */
export function calcularDistanciaHaversine(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Radio de la Tierra en kilómetros
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distancia = R * c;
  
  return distancia;
}

/**
 * Convierte grados a radianes
 */
function toRadians(grados: number): number {
  return grados * (Math.PI / 180);
}

/**
 * Calcula la distancia real considerando rutas de carretera
 * Aplica un factor de corrección para simular las rutas reales
 * @param lat1 Latitud del punto de origen
 * @param lon1 Longitud del punto de origen
 * @param lat2 Latitud del punto de destino
 * @param lon2 Longitud del punto de destino
 * @param factorCorreccion Factor de corrección para rutas reales (default: 1.4)
 * @returns Distancia estimada en kilómetros considerando rutas
 */
export function calcularDistanciaReal(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
  factorCorreccion: number = 1.4
): number {
  const distanciaLineaRecta = calcularDistanciaHaversine(lat1, lon1, lat2, lon2);
  return distanciaLineaRecta * factorCorreccion;
}

/**
 * Calcula la distancia usando OpenRouteService API (gratuita)
 * @param lat1 Latitud del punto de origen
 * @param lon1 Longitud del punto de origen
 * @param lat2 Latitud del punto de destino
 * @param lon2 Longitud del punto de destino
 * @param apiKey API key de OpenRouteService
 * @returns Distancia real en kilómetros por carretera
 */
export async function calcularDistanciaOpenRoute(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
  apiKey: string
): Promise<number> {
  try {
    const response = await fetch(
      `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${apiKey}&start=${lon1},${lat1}&end=${lon2},${lat2}`
    );
    
    if (!response.ok) {
      throw new Error(`Error en la API: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.features || data.features.length === 0) {
      throw new Error('No se encontró ruta');
    }
    
    // Retorna la distancia en kilómetros
    return data.features[0].properties.segments[0].distance / 1000;
  } catch (error) {
    console.error('Error calculando distancia con OpenRouteService:', error);
    throw error;
  }
}

/**
 * Función principal que calcula la distancia usando el mejor método disponible
 * @param lat1 Latitud del punto de origen
 * @param lon1 Longitud del punto de origen
 * @param lat2 Latitud del punto de destino
 * @param lon2 Longitud del punto de destino
 * @param apiKey API key de OpenRouteService (opcional, usa la de .env si no se proporciona)
 * @returns Distancia en kilómetros
 */
export async function calcularDistancia(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
  apiKey?: string
): Promise<number> {
  // Usar la API key proporcionada o la de la variable de entorno
  const key = apiKey || OPENROUTE_API_KEY;
  
  // Si hay API key, intentar con OpenRouteService primero
  if (key) {
    try {
      const distancia = await calcularDistanciaOpenRoute(lat1, lon1, lat2, lon2, key);
      return distancia;
    } catch (error) {
    }
  }
  
  // Fallback: usar Haversine con factor de corrección
  const distancia = calcularDistanciaReal(lat1, lon1, lat2, lon2);
  return distancia;
}

/**
 * Redondea la distancia al kilómetro más cercano para usar con el CSV de tarifas
 * @param distancia Distancia en kilómetros
 * @returns Distancia redondeada
 */
export function redondearDistanciaParaTarifa(distancia: number): number {
  return Math.round(distancia);
}
