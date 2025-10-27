import { useState, useEffect } from 'react';
import { 
  getContratosComerciales, 
  updateCargasAsociadas 
} from '../../../lib/contratos-comerciales-api';
import { 
  ContratoComercial, 
  ContratoWithStats, 
  CargaAsociada
} from '../../../types/contratosComerciales';

const useContratosComerciales = (backendURL: string) => {
  const [contratos, setContratos] = useState<ContratoWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Note: company name fetching handled elsewhere if needed

  // Fetch associated loads data from backend
  const fetchCargasAsociadas = async (cargasIds: number[]): Promise<CargaAsociada[]> => {
    if (!cargasIds.length) return [];

    try {
      const cargas = await Promise.all(
        cargasIds.map(async (id) => {
          try {
            const response = await fetch(`${backendURL}/cargas/kgDescargadosTotales/${id}`, {
              headers: { "ngrok-skip-browser-warning": "true" }
            });
            if (response.ok) {
              const data = await response.json();
              const carga = data.carga;
              const kgDescargadosTotales = parseFloat(data.kgDescargadosTotales) || 0;
              
              return {
                id: carga.id,
                numeroCartaPorte: carga.numeroCartaPorte,
                fecha: carga.fecha,
                titular: carga.titularCartaDePorte || { razonSocial: 'N/A' },
                destinatario: carga.destinatario || { razonSocial: 'N/A' },
                kgNeto: carga.kgNeto || 0,
                kgDescargadosTotales: kgDescargadosTotales,
                cultivo: carga.cultivo || 1,
                estado: carga.estado?.nombre || 'N/A'
              };
            }
          } catch (error) {
            console.error(`Error fetching carga ${id}:`, error);
          }
          return null;
        })
      );

      return cargas.filter(carga => carga !== null) as CargaAsociada[];
    } catch (error) {
      console.error('Error fetching associated loads:', error);
      return [];
    }
  };

  // Calculate delivery statistics
  const calculateStats = (contrato: ContratoComercial, cargas: CargaAsociada[]): Partial<ContratoWithStats> => {
    const kgEntregado = cargas.reduce((total, carga) => total + (carga.kgDescargadosTotales || 0), 0);
    const porcentajeCumplimiento = contrato.cantidadTotalKg > 0 
      ? Math.round((kgEntregado / contrato.cantidadTotalKg) * 100) 
      : 0;
    const kgPendientes = Math.max(0, contrato.cantidadTotalKg - kgEntregado);

    return {
      cantidadEntregadaKg: kgEntregado,
      porcentajeCumplimiento,
      kgPendientes
    };
  };

  // Fetch all contracts with statistics
  const fetchContratos = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch contracts from Dossin backend
      const contratosData = await getContratosComerciales();
      
      if (!contratosData.length) {
        setContratos([]);
        setLoading(false);
        return;
      }

      // Process each contract
      const contratosWithStats = await Promise.all(
        contratosData.map(async (contrato: ContratoComercial) => {
          // Fetch associated loads
          const cargas = await fetchCargasAsociadas(contrato.cargasIds || []);

          // Calculate statistics
          const stats = calculateStats(contrato, cargas);

          return {
            ...contrato,
            cargas,
            ...stats
          } as ContratoWithStats;
        })
      );

      setContratos(contratosWithStats);
    } catch (err) {
      console.error('Error fetching contratos comerciales:', err);
      setError('Error al cargar los contratos comerciales');
    } finally {
      setLoading(false);
    }
  };

  // Update associated loads for a contract
  const updateCargas = async (contratoId: number, cargasIds: number[]): Promise<boolean> => {
    try {
      const success = await updateCargasAsociadas(contratoId, cargasIds);
      
      if (success) {
        // Refresh the specific contract
        await fetchContratos();
      }
      return success;
    } catch (error) {
      console.error('Error updating cargas:', error);
      return false;
    }
  };

  // Refresh all contracts
  const refreshContratos = () => {
    fetchContratos();
  };

  useEffect(() => {
    if (backendURL) {
      fetchContratos();
    }
  }, [backendURL]);

  return {
    contratos,
    loading,
    error,
    refreshContratos,
    updateCargas
  };
};

export default useContratosComerciales;
