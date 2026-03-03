import { useState, useEffect, useCallback } from 'react';
import { useContext } from 'react';
import { ContextoGeneral } from '../../Contexto';
import {
  getTiposModificacion,
  createModificacionTurno,
  deleteModificacionTurno,
} from '../../../lib/turnos-modificaciones-api';
import type {
  ModificacionTurno,
  ModificacionTurnoCreate,
  TipoModificacionCampo,
} from '../../../types/turnos';
import { useNotificacion } from '../../Notificaciones/NotificacionSnackbar';

interface UseModificacionesTurnoReturn {
  modificaciones: ModificacionTurno[];
  tiposModificacion: TipoModificacionCampo[];
  loading: boolean;
  error: string | null;
  agregarModificacion: (modificacion: ModificacionTurnoCreate) => Promise<void>;
  eliminarModificacion: (idModificacion: number) => Promise<void>;
  refreshModificaciones: () => Promise<void>;
}

export function useModificacionesTurno(
  idTurno: string | number | undefined,
  modificacionesIniciales?: ModificacionTurno[]
): UseModificacionesTurnoReturn {
  const { backendURL } = useContext(ContextoGeneral);
  const { showNotificacion } = useNotificacion();
  const [modificaciones, setModificaciones] = useState<ModificacionTurno[]>(
    modificacionesIniciales || []
  );
  const [tiposModificacion, setTiposModificacion] = useState<TipoModificacionCampo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar tipos de modificación al montar el componente
  useEffect(() => {
    const loadTipos = async () => {
      try {
        const tipos = await getTiposModificacion(backendURL);
        setTiposModificacion(tipos);
      } catch (err) {
        console.error('Error loading tipos de modificación:', err);
      }
    };
    loadTipos();
  }, [backendURL]);

  // Cargar modificaciones del turno si se proporciona idTurno y no hay modificaciones iniciales
  useEffect(() => {
    if (idTurno && !modificacionesIniciales) {
      refreshModificaciones();
    } else if (modificacionesIniciales) {
      setModificaciones(modificacionesIniciales);
    }
  }, [idTurno, modificacionesIniciales]);

  const refreshModificaciones = useCallback(async () => {
    if (!idTurno) return;
    
    setLoading(true);
    setError(null);
    try {
      // Las modificaciones vienen en el objeto turno, así que no necesitamos hacer un fetch separado
      // Si el backend las incluye en el turno, las usamos directamente
      // Si no, podríamos hacer un GET a turnos/:idTurno/modificaciones si existe ese endpoint
      setLoading(false);
    } catch (err: any) {
      setError(err.message || 'Error al cargar modificaciones');
      setLoading(false);
    }
  }, [idTurno]);

  const agregarModificacion = useCallback(
    async (modificacion: ModificacionTurnoCreate) => {
      if (!idTurno) {
        showNotificacion('No se puede agregar modificación sin ID de turno', 'error');
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const nuevaModificacion = await createModificacionTurno(
          idTurno,
          modificacion,
          backendURL
        );
        if (nuevaModificacion) {
          setModificaciones((prev) => [...prev, nuevaModificacion]);
          showNotificacion('Modificación agregada correctamente', 'success');
        }
      } catch (err: any) {
        const errorMsg = err.message || 'Error al agregar modificación';
        setError(errorMsg);
        showNotificacion(errorMsg, 'error');
      } finally {
        setLoading(false);
      }
    },
    [idTurno, backendURL, showNotificacion]
  );

  const eliminarModificacion = useCallback(
    async (idModificacion: number) => {
      if (!idTurno) {
        showNotificacion('No se puede eliminar modificación sin ID de turno', 'error');
        return;
      }

      setLoading(true);
      setError(null);
      try {
        await deleteModificacionTurno(idTurno, idModificacion, backendURL);
        setModificaciones((prev) => prev.filter((m) => m.id !== idModificacion));
        showNotificacion('Modificación eliminada correctamente', 'success');
      } catch (err: any) {
        const errorMsg = err.message || 'Error al eliminar modificación';
        setError(errorMsg);
        showNotificacion(errorMsg, 'error');
      } finally {
        setLoading(false);
      }
    },
    [idTurno, backendURL, showNotificacion]
  );

  return {
    modificaciones,
    tiposModificacion,
    loading,
    error,
    agregarModificacion,
    eliminarModificacion,
    refreshModificaciones,
  };
}
