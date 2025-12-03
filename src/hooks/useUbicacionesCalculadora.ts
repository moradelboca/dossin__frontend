import { useState, useEffect, useContext } from 'react';
import { ContextoGeneral } from '../components/Contexto';
import { axiosGet } from '../lib/axiosConfig';

interface Ubicacion {
  id: number;
  nombre: string;
  latitud: number;
  longitud: number;
  tipoUbicacion: {
    nombre: string;
    id: number;
  };
  localidad: {
    nombre: string;
    id: number;
    provincia: {
      nombre: string;
      id: number;
      pais: {
        nombre: string;
        id: number;
      };
    };
  };
}

export function useUbicacionesCalculadora() {
  const { backendURL } = useContext(ContextoGeneral);
  const [ubicaciones, setUbicaciones] = useState<Ubicacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cargarUbicaciones = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const data = await axiosGet<Ubicacion[]>('ubicaciones', backendURL);
        setUbicaciones(data);
      } catch (err) {
        console.error('Error cargando ubicaciones:', err);
        setError(err instanceof Error ? err.message : 'Error desconocido');
        
        // Datos de ejemplo para desarrollo
        setUbicaciones([
          {
            id: 1,
            nombre: "Padeador",
            latitud: -31.3519631,
            longitud: -64.2378208,
            tipoUbicacion: {
              nombre: "Carga",
              id: 1
            },
            localidad: {
              nombre: "Caminiaga",
              id: 532,
              provincia: {
                nombre: "Córdoba",
                id: 7,
                pais: {
                  nombre: "Argentina",
                  id: 1
                }
              }
            }
          },
          {
            id: 2,
            nombre: "Quorum",
            latitud: -31.3374302,
            longitud: -64.207154,
            tipoUbicacion: {
              nombre: "Descarga",
              id: 2
            },
            localidad: {
              nombre: "3 de febrero",
              id: 2,
              provincia: {
                nombre: "Buenos Aires",
                id: 1,
                pais: {
                  nombre: "Argentina",
                  id: 1
                }
              }
            }
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    cargarUbicaciones();
  }, [backendURL]);

  return {
    ubicaciones,
    loading,
    error
  };
}

