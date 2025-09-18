import L from 'leaflet';
import * as toGeoJSON from '@mapbox/togeojson';
import JSZip from 'jszip';

export const parseKML = (kmlString: string): L.LayerGroup => {
    try {
        const parser = new DOMParser();
        const kmlDoc = parser.parseFromString(kmlString, 'text/xml');
        const geoJson = toGeoJSON.kml(kmlDoc);
        const layerGroup = L.layerGroup();
        
        geoJson.features.forEach((feature: any) => {
            if (feature.geometry.type === 'Polygon') {
                const coordinates = feature.geometry.coordinates[0].map((coord: number[]) => [coord[1], coord[0]]);
                const polygon = L.polygon(coordinates, {
                    color: '#ff7800',
                    weight: 2,
                    fillColor: '#ff7800',
                    fillOpacity: 0.3
                });
                
                // Agregar evento click personalizado al polígono
                polygon.on('click', () => {
                    // Este evento será manejado por el componente padre
                    // que pasará la función handlePolygonClick
                });
                
                polygon.addTo(layerGroup);
            }
        });
        
        return layerGroup;
    } catch (error) {
        console.error('Error parsing KML:', error);
        throw new Error('Error al parsear el archivo KML');
    }
};

export const parseKMZ = async (kmzData: ArrayBuffer): Promise<L.LayerGroup> => {
    try {
        const zip = new JSZip();
        const zipContent = await zip.loadAsync(kmzData);
        
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
        return parseKML(kmlString);
    } catch (error) {
        console.error('Error parsing KMZ:', error);
        throw new Error('Error al parsear el archivo KMZ');
    }
};

export const addClickHandlerToLayer = (layer: L.LayerGroup, handlePolygonClick: (lote: any) => void, lote: any) => {
    layer.eachLayer((layer: any) => {
        if (layer instanceof L.Polygon) {
            layer.on('click', () => {
                handlePolygonClick(lote);
            });
        }
    });
};
