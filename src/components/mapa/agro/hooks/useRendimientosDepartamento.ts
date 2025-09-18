import { useState, useEffect } from 'react';

interface RendimientoDepartamento {
    provincia: string;
    departamento: string;
    rendimientoPromedio: number;
    desviacionEstandar: number;
}

interface LocalidadDepartamento {
    provincia: string;
    departamento: string;
    localidad: string;
}

export function useRendimientosDepartamento() {
    const [rendimientos, setRendimientos] = useState<RendimientoDepartamento[]>([]);
    const [localidades, setLocalidades] = useState<LocalidadDepartamento[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const cargarDatos = async () => {
            try {
                setLoading(true);
                setError(null);

                // Cargar datos de rendimientos
                const responseRendimientos = await fetch('/src/components/mapa/agro/components/rendimiento/resumen_rendimientos_ultra_mejorado.csv');
                const textRendimientos = await responseRendimientos.text();
                const rendimientosData = parseCSVRendimientos(textRendimientos);
                setRendimientos(rendimientosData);

                // Cargar datos de localidades por departamento
                const responseLocalidades = await fetch('/src/components/mapa/agro/components/rendimiento/localidades_por_departamentos_maiz_correcto.csv');
                const textLocalidades = await responseLocalidades.text();
                const localidadesData = parseCSVLocalidades(textLocalidades);
                setLocalidades(localidadesData);

            } catch (err) {
                setError(err instanceof Error ? err.message : 'Error desconocido');
                console.error('Error al cargar datos de rendimientos:', err);
            } finally {
                setLoading(false);
            }
        };

        cargarDatos();
    }, []);

    // Función para obtener el departamento de una localidad
    const obtenerDepartamento = (provincia: string, localidad: string): string | null => {
        const localidadEncontrada = localidades.find(
            loc => 
                loc.provincia.toLowerCase() === provincia.toLowerCase() && 
                loc.localidad.toLowerCase() === localidad.toLowerCase()
        );
        return localidadEncontrada?.departamento || null;
    };

    // Función para obtener el rendimiento promedio de un departamento (convertido de kg/ha a tn/ha)
    const obtenerRendimientoPromedio = (provincia: string, departamento: string): number | null => {
        const rendimiento = rendimientos.find(
            rend => 
                rend.provincia.toLowerCase() === provincia.toLowerCase() && 
                rend.departamento.toLowerCase() === departamento.toLowerCase()
        );
        // Convertir de kg/ha a tn/ha (dividir por 1000)
        return rendimiento ? rendimiento.rendimientoPromedio / 1000 : null;
    };

    // Función para obtener el rendimiento estimado basado en ubicación
    const obtenerRendimientoEstimado = (provincia: string, localidad: string): number | null => {
        const departamento = obtenerDepartamento(provincia, localidad);
        if (!departamento) return null;
        return obtenerRendimientoPromedio(provincia, departamento);
    };

    return {
        rendimientos,
        localidades,
        loading,
        error,
        obtenerDepartamento,
        obtenerRendimientoPromedio,
        obtenerRendimientoEstimado
    };
}

// Función para parsear el CSV de rendimientos
function parseCSVRendimientos(csvText: string): RendimientoDepartamento[] {
    const lines = csvText.split('\n');
    const data: RendimientoDepartamento[] = [];

    for (let i = 1; i < lines.length; i++) { // Saltar header
        const line = lines[i].trim();
        if (!line) continue;

        const columns = line.split(',');
        if (columns.length >= 4) {
            data.push({
                provincia: columns[0].trim(),
                departamento: columns[1].trim(),
                rendimientoPromedio: parseFloat(columns[2]) || 0,
                desviacionEstandar: parseFloat(columns[3]) || 0
            });
        }
    }

    return data;
}

// Función para parsear el CSV de localidades
function parseCSVLocalidades(csvText: string): LocalidadDepartamento[] {
    const lines = csvText.split('\n');
    const data: LocalidadDepartamento[] = [];

    for (let i = 1; i < lines.length; i++) { // Saltar header
        const line = lines[i].trim();
        if (!line) continue;

        const columns = line.split(',');
        if (columns.length >= 4) {
            data.push({
                provincia: columns[1].trim(),
                departamento: columns[2].trim(),
                localidad: columns[3].trim()
            });
        }
    }

    return data;
}
