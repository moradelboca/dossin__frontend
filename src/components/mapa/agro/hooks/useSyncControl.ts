import { useState, useEffect } from 'react';
import { supabaseAgro } from '../../../../lib/supabase';

interface SyncConfig {
  maxAgeDays: number;
  historicalYears: number;
  incrementalSync: boolean;
}

interface SyncControl {
  id: number;
  entidad: string;
  ultima_sincronizacion: string | null;
  ultima_fecha_consulta: string | null;
  total_registros: number;
  estado: string;
  error_message: string | null;
  configuracion: SyncConfig;
  created_at: string;
  updated_at: string;
}

export const useSyncControl = (entidad: string) => {
  const [syncControl, setSyncControl] = useState<SyncControl | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar configuración de sincronización
  const loadSyncControl = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabaseAgro
        .from('SyncControl')
        .select('*')
        .eq('entidad', entidad)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setSyncControl(data);
    } catch (err) {
      console.error('Error loading sync control:', err);
      setError(err instanceof Error ? err.message : 'Error cargando configuración');
    } finally {
      setLoading(false);
    }
  };

  // Cargar al montar el componente
  useEffect(() => {
    loadSyncControl();
  }, [entidad]);

  // Verificar si necesita sincronización
  const checkSyncNeeded = (forceRefresh = false) => {
    if (!syncControl) {
      return { shouldSync: false, needsHistoricalLoad: false };
    }

    const now = new Date();
    const lastSync = syncControl.ultima_sincronizacion 
      ? new Date(syncControl.ultima_sincronizacion) 
      : null;

    // Si es forzado, siempre sincronizar
    if (forceRefresh) {
      return { 
        shouldSync: true, 
        needsHistoricalLoad: !lastSync,
        incrementalFrom: lastSync 
      };
    }

    // Si nunca se sincronizó, hacer carga histórica
    if (!lastSync) {
      return { 
        shouldSync: true, 
        needsHistoricalLoad: true 
      };
    }

    // Verificar si necesita sincronización incremental
    const daysSinceSync = Math.floor((now.getTime() - lastSync.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysSinceSync >= syncControl.configuracion.maxAgeDays) {
      return { 
        shouldSync: true, 
        needsHistoricalLoad: false,
        incrementalFrom: lastSync 
      };
    }

    return { shouldSync: false, needsHistoricalLoad: false };
  };

  // Actualizar estado de sincronización
  const updateSyncStatus = async (
    estado: string, 
    errorMessage?: string, 
    totalRegistros?: number, 
    ultimaConsulta?: Date
  ) => {
    try {
      const updateData: any = {
        estado,
        updated_at: new Date().toISOString()
      };

      if (errorMessage) {
        updateData.error_message = errorMessage;
      }

      if (totalRegistros !== undefined) {
        updateData.total_registros = totalRegistros;
      }

      if (ultimaConsulta) {
        updateData.ultima_sincronizacion = ultimaConsulta.toISOString();
        updateData.ultima_fecha_consulta = ultimaConsulta.toISOString();
      }

      const { error } = await supabaseAgro
        .from('SyncControl')
        .update(updateData)
        .eq('entidad', entidad);

      if (error) {
        throw error;
      }

      // Recargar configuración
      await loadSyncControl();
    } catch (err) {
      console.error('Error updating sync status:', err);
      setError(err instanceof Error ? err.message : 'Error actualizando estado');
    }
  };

  // Obtener fecha de inicio para carga histórica (10 años atrás)
  const getHistoricalStartDate = (): Date => {
    const now = new Date();
    const tenYearsAgo = new Date(now.getFullYear() - 10, now.getMonth(), now.getDate());
    return tenYearsAgo;
  };

  // Obtener fecha de inicio para sincronización incremental
  const getIncrementalStartDate = (): Date => {
    if (!syncControl?.ultima_fecha_consulta) {
      return getHistoricalStartDate();
    }
    return new Date(syncControl.ultima_fecha_consulta);
  };

  return {
    syncControl,
    loading,
    error,
    checkSyncNeeded,
    updateSyncStatus,
    getHistoricalStartDate,
    getIncrementalStartDate,
    loadSyncControl
  };
};






