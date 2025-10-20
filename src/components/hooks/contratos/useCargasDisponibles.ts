import { useState, useEffect } from 'react';
import { CargaDisponible, CULTIVOS_MAP } from '../../../types/contratosComerciales';

const useCargasDisponibles = (backendURL: string, contratosConCargas: any[] = []) => {
  const [cargas, setCargas] = useState<CargaDisponible[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get all associated load IDs from contracts
  const getCargasAsociadas = (): Set<number> => {
    const asociadas = new Set<number>();
    contratosConCargas.forEach(contrato => {
      if (contrato.cargasIds && Array.isArray(contrato.cargasIds)) {
        contrato.cargasIds.forEach((id: number) => asociadas.add(id));
      }
    });
    return asociadas;
  };

  // Fetch all loads from backend
  const fetchCargas = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${backendURL}/cargas`, {
        headers: { "ngrok-skip-browser-warning": "true" }
      });

      if (!response.ok) {
        throw new Error('Error fetching cargas');
      }

      const cargasData = await response.json();
      console.log('Cargas fetched from backend:', cargasData);
      const cargasAsociadas = getCargasAsociadas();

      // Process loads and mark as associated or not
      const cargasProcesadas: CargaDisponible[] = cargasData.map((carga: any) => {
        const isAsociada = cargasAsociadas.has(carga.id);
        const contratoId = isAsociada 
          ? contratosConCargas.find(c => c.cargasIds?.includes(carga.id))?.id
          : undefined;

        return {
          id: carga.id,
          numeroCartaPorte: carga.numeroCartaPorte,
          fecha: carga.fecha || carga.fechaCreacion || new Date().toISOString().split('T')[0],
          titular: carga.titularCartaDePorte,
          destinatario: carga.destinatario,
          kgNeto: carga.kgNeto || carga.cantidadKg,
          kgDescargadosTotales: carga.kgDescargadosTotales, // Will be undefined for regular /cargas endpoint
          cultivo: carga.cultivo || carga.cargamento?.tipoCargamento?.id || 1,
          estado: carga.estado?.nombre || carga.estado || 'N/A',
          // Location data
          ubicacionCarga: carga.ubicacionCarga,
          ubicacionDescarga: carga.ubicacionDescarga,
          // Tariff and distance
          tarifa: carga.tarifa,
          tipoTarifa: carga.tipoTarifa,
          cantidadKm: carga.cantidadKm,
          // Cargamento and provider
          cargamento: carga.cargamento,
          proveedor: carga.proveedor,
          // Association status
          asociada: isAsociada,
          contratoId
        };
      });

      // Filter to show only relevant loads (e.g., delivered status)
      // For now, show all loads to debug - we can filter later
      const cargasRelevantes = cargasProcesadas;

      console.log('Cargas procesadas:', cargasRelevantes);
      setCargas(cargasRelevantes);
    } catch (err) {
      console.error('Error fetching cargas disponibles:', err);
      setError('Error al cargar las cargas disponibles');
    } finally {
      setLoading(false);
    }
  };

  // Get unassociated loads only
  const getCargasNoAsociadas = (): CargaDisponible[] => {
    return cargas.filter(carga => !carga.asociada);
  };

  // Get loads associated with a specific contract
  const getCargasPorContrato = (contratoId: number): CargaDisponible[] => {
    return cargas.filter(carga => carga.contratoId === contratoId);
  };

  // Filter loads by grain type
  const getCargasPorCultivo = (cultivo: number): CargaDisponible[] => {
    return cargas.filter(carga => carga.cultivo === cultivo);
  };

  // Search loads by text
  const buscarCargas = (query: string): CargaDisponible[] => {
    if (!query.trim()) return cargas;
    
    const searchTerm = query.toLowerCase();
  return cargas.filter(carga => 
      String(carga.numeroCartaPorte ?? '').toLowerCase().includes(searchTerm) ||
      (carga.titular?.razonSocial?.toLowerCase() || '').includes(searchTerm) ||
      (carga.destinatario?.razonSocial?.toLowerCase() || '').includes(searchTerm) ||
      (CULTIVOS_MAP[carga.cultivo]?.toLowerCase() || '').includes(searchTerm)
    );
  };

  // Refresh loads
  const refreshCargas = () => {
    fetchCargas();
  };

  useEffect(() => {
    if (backendURL) {
      fetchCargas();
    }
  }, [backendURL, contratosConCargas]);

  return {
    cargas,
    loading,
    error,
    getCargasNoAsociadas,
    getCargasPorContrato,
    getCargasPorCultivo,
    buscarCargas,
    refreshCargas
  };
};

export default useCargasDisponibles;
