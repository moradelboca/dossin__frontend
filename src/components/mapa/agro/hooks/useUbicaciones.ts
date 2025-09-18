import { useState, useEffect } from 'react';
import { ContextoGeneral } from '../../../Contexto';
import { useContext } from 'react';

export function useUbicaciones() {
    const { backendURL } = useContext(ContextoGeneral);
    const [ubicaciones, setUbicaciones] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchUbicaciones = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const response = await fetch(`${backendURL}/ubicaciones`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "ngrok-skip-browser-warning": "true",
                },
            });

            if (!response.ok) {
                throw new Error('Error al obtener las ubicaciones');
            }

            const data = await response.json();
            setUbicaciones(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error desconocido');
            console.error('Error al obtener las ubicaciones:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUbicaciones();
    }, [backendURL]);

    return {
        ubicaciones,
        loading,
        error,
        refetch: fetchUbicaciones
    };
}

