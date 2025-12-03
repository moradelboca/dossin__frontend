import { useState, useEffect } from 'react';
import { axiosGet } from '../../../lib/axiosConfig';

interface Cargamento {
  id: number;
  nombre: string;
  tipoCargamento?: {
    id: number;
    nombre: string;
  };
}

const useCargamentos = (backendURL: string) => {
  const [cargamentos, setCargamentos] = useState<Cargamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCargamentos = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await axiosGet<Cargamento[]>("cargas/cargamentos", backendURL);
        setCargamentos(data);
      } catch (err) {
        console.error('Error fetching cargamentos:', err);
        setError('Error al cargar los cargamentos');
      } finally {
        setLoading(false);
      }
    };

    if (backendURL) {
      fetchCargamentos();
    }
  }, [backendURL]);

  return {
    cargamentos,
    loading,
    error
  };
};

export default useCargamentos;


