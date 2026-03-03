import { useEffect, useState } from 'react';
import { getContratosComerciales } from '../../../lib/contratos-comerciales-api';

const ESTADOS_HISTORICOS = ['cumplido', 'cancelado', 'vencido'] as const;

export function useHistoricalCargasIds(backendURL: string) {
  const [historicalIds, setHistoricalIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!backendURL) return;
    getContratosComerciales()
      .then((contratos) => {
        const ids = new Set<number>(
          contratos
            .filter((c) => (ESTADOS_HISTORICOS as readonly string[]).includes(c.estado))
            .flatMap((c) => c.cargasIds)
        );
        setHistoricalIds(ids);
      })
      .catch(() => {
        setHistoricalIds(new Set());
      })
      .finally(() => setLoading(false));
  }, [backendURL]);

  return { historicalIds, loading };
}
