import { useState, useEffect } from 'react';
import { ContextoGeneral } from '../../../Contexto';
import { useContext } from 'react';
import { axiosGet } from '../../../../lib/axiosConfig';

export function useUbicaciones() {
    const { backendURL } = useContext(ContextoGeneral);
    const [ubicaciones, setUbicaciones] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchUbicaciones = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const data = await axiosGet<any[]>('ubicaciones', backendURL);
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

