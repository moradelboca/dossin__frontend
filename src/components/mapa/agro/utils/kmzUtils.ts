// Utilidades para manejo de archivos KMZ/KML
import * as toGeoJSON from '@mapbox/togeojson';
import JSZip from 'jszip';

/**
 * Calcula la superficie de un polígono en coordenadas geográficas
 * @param coordinates - Coordenadas del polígono
 * @returns Superficie en metros cuadrados
 */
export const calcularSuperficiePoligono = (coordinates: number[][]): number => {
    // Algoritmo de Gauss para calcular área de polígono en coordenadas geográficas
    let area = 0;
    const n = coordinates.length;
    
    for (let i = 0; i < n; i++) {
        const j = (i + 1) % n;
        const xi = coordinates[i][0]; // longitud
        const yi = coordinates[i][1]; // latitud
        const xj = coordinates[j][0]; // longitud
        const yj = coordinates[j][1]; // latitud
        
        area += xi * yj;
        area -= xj * yi;
    }
    
    area = Math.abs(area) / 2;
    
    // Convertir coordenadas geográficas a área en metros cuadrados
    // Usar la fórmula de Haversine para calcular el área real
    const R = 6371000; // Radio de la Tierra en metros
    
    // Calcular el área aproximada usando la proyección de Mercator
    // Para latitudes medias (como Argentina), esta aproximación es razonable
    const latPromedio = coordinates.reduce((sum, coord) => sum + coord[1], 0) / n;
    const cosLat = Math.cos(latPromedio * Math.PI / 180);
    
    // Convertir grados a metros (aproximadamente)
    const areaMetrosCuadrados = area * (Math.PI * R / 180) * (Math.PI * R * cosLat / 180);
    
    return areaMetrosCuadrados;
};

/**
 * Calcula la superficie total de un archivo KML
 * @param kmlString - Contenido del archivo KML como string
 * @returns Superficie en hectáreas
 */
export const calcularSuperficieKML = (kmlString: string): number => {
    try {
        const parser = new DOMParser();
        const kmlDoc = parser.parseFromString(kmlString, 'text/xml');
        const geoJson = toGeoJSON.kml(kmlDoc);
        
        let superficieTotal = 0;
        
        geoJson.features.forEach((feature: any) => {
            if (feature.geometry.type === 'Polygon') {
                const coordinates = feature.geometry.coordinates[0];
                const superficie = calcularSuperficiePoligono(coordinates);
                superficieTotal += superficie;
            }
        });
        
        // Convertir de metros cuadrados a hectáreas
        return Math.round(superficieTotal / 10000 * 100) / 100;
    } catch (error) {
        console.error('Error procesando KML:', error);
        throw new Error('Error al procesar el archivo KML');
    }
};

/**
 * Calcula la superficie de un archivo KMZ
 * @param file - Archivo KMZ
 * @returns Promise con la superficie en hectáreas
 */
export const calcularSuperficieKMZ = async (file: File): Promise<number> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = async (e) => {
            try {
                if (file.name.toLowerCase().endsWith('.kmz')) {
                    // Procesar KMZ - usar ArrayBuffer
                    const arrayBuffer = e.target?.result as ArrayBuffer;
                    const zip = new JSZip();
                    const zipContent = await zip.loadAsync(arrayBuffer);
                    
                    let kmlFile: JSZip.JSZipObject | null = null;
                    for (const [filename, file] of Object.entries(zipContent.files)) {
                        if (filename.toLowerCase().endsWith('.kml')) {
                            kmlFile = file;
                            break;
                        }
                    }
                    
                    if (!kmlFile) {
                        throw new Error('No se encontró archivo KML en el KMZ');
                    }
                    
                    const kmlString = await kmlFile.async('string');
                    const superficie = calcularSuperficieKML(kmlString);
                    resolve(superficie);
                } else {
                    // Procesar KML directamente - usar string
                    const kmlString = e.target?.result as string;
                    const superficie = calcularSuperficieKML(kmlString);
                    resolve(superficie);
                }
            } catch (error) {
                reject(error);
            }
        };
        
        reader.onerror = () => reject(new Error('Error leyendo el archivo'));
        
        if (file.name.toLowerCase().endsWith('.kmz')) {
            reader.readAsArrayBuffer(file);
        } else {
            reader.readAsText(file);
        }
    });
};

