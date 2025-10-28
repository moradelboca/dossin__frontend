import { useState, useEffect } from 'react';

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

        const response = await fetch(`${backendURL}/cargas/cargamentos`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
          },
        });

        if (!response.ok) {
          throw new Error('Error al obtener los cargamentos');
        }

        const data = await response.json();
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


