import { useState, useEffect } from 'react';
import { supabaseAgro } from '../../../../lib/supabase';

export interface Campaña {
    id: string;
    nombre: string;
    activa: boolean;
    fechaInicio: string;
    fechaFin: string;
}

export function useCampañas() {
    const [campañas, setCampañas] = useState<Campaña[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Obtener campañas disponibles desde Supabase
    const obtenerCampañas = async () => {
        try {
            setLoading(true);
            setError(null);

            // Obtener campañas únicas desde PlaneacionLote
            const { data, error: queryError } = await supabaseAgro
                .from('PlaneacionLote')
                .select('campania')
                .order('campania', { ascending: false });

            if (queryError) {
                throw queryError;
            }

            // Procesar campañas únicas y crear objetos Campaña
            const campañasUnicas = [...new Set(data?.map(item => item.campania) || [])];
            
            const campañasProcesadas: Campaña[] = campañasUnicas.map(campania => {
                // Determinar si es la campaña actual basándose en el año
                const añoActual = new Date().getFullYear();
                const [añoInicio, añoFin] = campania.split('/');
                
                // La campaña actual es la que incluye el año actual en el rango
                const esCampañaActual = añoInicio === añoActual.toString();
                
                // Generar fechas estimadas basadas en el nombre de la campaña
                const fechaInicio = `01-10-${añoInicio}`; // Octubre del año de inicio
                const fechaFin = `30-09-${añoFin}`; // Septiembre del año de fin

                return {
                    id: campania,
                    nombre: `Campaña ${campania}`,
                    activa: esCampañaActual,
                    fechaInicio,
                    fechaFin
                };
            });

            // Agregar campaña actual si no existe
            const añoActual = new Date().getFullYear();
            const campañaActualId = `${añoActual}/${añoActual + 1}`;
            const existeCampañaActual = campañasProcesadas.some(c => c.id === campañaActualId);
            
            if (!existeCampañaActual) {
                campañasProcesadas.push({
                    id: campañaActualId,
                    nombre: `Campaña ${campañaActualId}`,
                    activa: true,
                    fechaInicio: `01-10-${añoActual}`,
                    fechaFin: `30-09-${añoActual + 1}`
                });
            }

            // Agregar campañas del pasado y futuras si no existen
            const campañasPasadas = generarCampañasPasadas(campañasProcesadas);
            const campañasFuturas = generarCampañasFuturas(campañasProcesadas);
            const todasLasCampañas = [...campañasPasadas, ...campañasProcesadas, ...campañasFuturas];

            setCampañas(todasLasCampañas);

        } catch (err: any) {
            setError(err.message || 'Error al cargar campañas');
            console.error('Error cargando campañas:', err);
        } finally {
            setLoading(false);
        }
    };

    // Generar campañas del pasado (últimos 3 años)
    const generarCampañasPasadas = (campañasExistentes: Campaña[]): Campaña[] => {
        const añoActual = new Date().getFullYear();
        const campañasPasadas: Campaña[] = [];
        
        // Generar campañas para los últimos 3 años
        for (let i = 3; i >= 1; i--) {
            const añoInicio = añoActual - i;
            const añoFin = añoInicio + 1;
            const nombreCampaña = `${añoInicio}/${añoFin}`;
            
            // Solo agregar si no existe
            const existe = campañasExistentes.some(c => c.id === nombreCampaña);
            if (!existe) {
                campañasPasadas.push({
                    id: nombreCampaña,
                    nombre: `Campaña ${nombreCampaña}`,
                    activa: false, // Las del pasado no son activas
                    fechaInicio: `01-10-${añoInicio}`,
                    fechaFin: `30-09-${añoFin}`
                });
            }
        }
        
        return campañasPasadas;
    };

    // Generar campañas futuras (próximos 2 años)
    const generarCampañasFuturas = (campañasExistentes: Campaña[]): Campaña[] => {
        const añoActual = new Date().getFullYear();
        const campañasFuturas: Campaña[] = [];
        
        // Generar campañas para los próximos 2 años
        for (let i = 1; i <= 2; i++) {
            const añoInicio = añoActual + i;
            const añoFin = añoInicio + 1;
            const nombreCampaña = `${añoInicio}/${añoFin}`;
            
            // Solo agregar si no existe
            const existe = campañasExistentes.some(c => c.id === nombreCampaña);
            if (!existe) {
                campañasFuturas.push({
                    id: nombreCampaña,
                    nombre: `Campaña ${nombreCampaña}`,
                    activa: false, // Las futuras no son activas
                    fechaInicio: `01-10-${añoInicio}`,
                    fechaFin: `30-09-${añoFin}`
                });
            }
        }
        
        return campañasFuturas;
    };

    // Obtener campaña actual (la más reciente activa)
    const getCampañaActual = (): Campaña | null => {
        return campañas.find(c => c.activa) || campañas[0] || null;
    };

    // Obtener campaña por ID
    const getCampañaPorId = (id: string): Campaña | null => {
        return campañas.find(c => c.id === id) || null;
    };

    useEffect(() => {
        obtenerCampañas();
    }, []);

    return {
        campañas,
        loading,
        error,
        getCampañaActual,
        getCampañaPorId,
        refetch: obtenerCampañas
    };
}
