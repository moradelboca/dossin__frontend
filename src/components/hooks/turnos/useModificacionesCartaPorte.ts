import { useState, useEffect, useCallback } from 'react';
import { useContext } from 'react';
import { ContextoGeneral } from '../../Contexto';
import { getTiposModificacion, createModificacionTurno } from '../../../lib/turnos-modificaciones-api';
import type { TipoModificacionCampo, ModificacionTurnoCreate } from '../../../types/turnos';
import { obtenerTipoModificacion, obtenerNombreCampo } from '../../../utils/cartaPorteFieldMapping';
import { axiosPut, axiosGet } from '../../../lib/axiosConfig';
import { registrarCambioEstado } from '../../../services/turnosEstadoHistorialService';
import { useAuth } from '../../autenticacion/ContextoAuth';
import { useNotificacion } from '../../Notificaciones/NotificacionSnackbar';

interface UseModificacionesCartaPorteReturn {
  tiposModificacion: TipoModificacionCampo[];
  loading: boolean;
  error: string | null;
  camposEditados: Record<string, any>;
  editarCampo: (label: string, valor: any) => void;
  obtenerValorCampo: (label: string, valorOriginal: any) => any;
  esCampoEditable: (label: string) => boolean;
  obtenerTipoModificacionCampo: (label: string) => TipoModificacionCampo | null;
  validarCampos: () => { valido: boolean; errores: string[] };
  guardarModificacionesYCambiarEstado: (emitirCPE: boolean) => Promise<any>;
  limpiarCamposEditados: () => void;
}

export function useModificacionesCartaPorte(
  turnoId: string | number | undefined
): UseModificacionesCartaPorteReturn {
  const { backendURL } = useContext(ContextoGeneral);
  const { user } = useAuth();
  const { showNotificacion } = useNotificacion();
  const [tiposModificacion, setTiposModificacion] = useState<TipoModificacionCampo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [camposEditados, setCamposEditados] = useState<Record<string, any>>({});

  // Cargar tipos de modificación
  useEffect(() => {
    const cargarTipos = async () => {
      setLoading(true);
      try {
        const tipos = await getTiposModificacion(backendURL);
        setTiposModificacion(tipos);
      } catch (err: any) {
        setError(err.message || 'Error al cargar tipos de modificación');
      } finally {
        setLoading(false);
      }
    };
    if (turnoId) {
      cargarTipos();
    }
  }, [turnoId, backendURL]);

  const editarCampo = useCallback((label: string, valor: any) => {
    const nombreCampo = obtenerNombreCampo(label, tiposModificacion);
    if (!nombreCampo) return;
    
    setCamposEditados(prev => ({
      ...prev,
      [nombreCampo]: valor,
    }));
  }, [tiposModificacion]);

  const obtenerValorCampo = useCallback((label: string, valorOriginal: any): any => {
    const nombreCampo = obtenerNombreCampo(label, tiposModificacion);
    if (!nombreCampo) return valorOriginal;
    
    // Si el campo fue editado, retornar el valor editado
    if (nombreCampo in camposEditados) {
      return camposEditados[nombreCampo];
    }
    
    return valorOriginal;
  }, [camposEditados, tiposModificacion]);

  const esCampoEditable = useCallback((label: string): boolean => {
    const nombreCampo = obtenerNombreCampo(label, tiposModificacion);
    return nombreCampo !== null;
  }, [tiposModificacion]);

  const obtenerTipoModificacionCampo = useCallback((label: string): TipoModificacionCampo | null => {
    const nombreCampo = obtenerNombreCampo(label, tiposModificacion);
    if (!nombreCampo) return null;
    return obtenerTipoModificacion(nombreCampo, tiposModificacion);
  }, [tiposModificacion]);

  const validarCampos = useCallback((): { valido: boolean; errores: string[] } => {
    const errores: string[] = [];
    
    // Validar campos obligatorios (nullable: false) que fueron editados
    Object.entries(camposEditados).forEach(([nombreCampo, valor]) => {
      const tipoMod = obtenerTipoModificacion(nombreCampo, tiposModificacion);
      if (tipoMod && !tipoMod.nullable) {
        if (valor === null || valor === undefined || valor === '') {
          errores.push(`El campo ${nombreCampo} es obligatorio`);
        }
      }
    });
    
    return {
      valido: errores.length === 0,
      errores,
    };
  }, [camposEditados, tiposModificacion]);

  const guardarModificacionesYCambiarEstado = useCallback(async (emitirCPE: boolean) => {
    if (!turnoId) {
      throw new Error('No se puede guardar sin ID de turno');
    }

    // Validar campos obligatorios
    const validacion = validarCampos();
    if (!validacion.valido) {
      throw new Error(`Campos obligatorios sin completar: ${validacion.errores.join(', ')}`);
    }

    setLoading(true);
    setError(null);

    try {
      // Guardar todas las modificaciones solo si hay campos editados
      if (Object.keys(camposEditados).length > 0) {
        const modificacionesPromises = Object.entries(camposEditados).map(async ([nombreCampo, valor]) => {
          const tipoMod = obtenerTipoModificacion(nombreCampo, tiposModificacion);
          if (!tipoMod) return null;

          // El payload debe incluir el nombreCampo y el valor en la descripción
          // El backend espera idTipoModificacion, pero como tenemos nombreCampo,
          // necesitamos buscar el tipo de modificación correspondiente
          // Por ahora, enviamos el nombreCampo en la descripción y el backend lo procesará
          const payload: ModificacionTurnoCreate = {
            nombreCampo: nombreCampo,
            valor: valor,
            descripcion: JSON.stringify({ [nombreCampo]: valor }),
          };

          return await createModificacionTurno(turnoId, payload, backendURL);
        });

        await Promise.all(modificacionesPromises.filter(p => p !== null));
      }

      // Obtener estado anterior antes de cambiarlo
      let estadoAnteriorId = 7; // Default a "Cargado"
      try {
        const turnoActual = await axiosGet<any>(`turnos/${turnoId}`, backendURL);
        estadoAnteriorId = turnoActual?.estado?.id || 7;
      } catch (err) {
        console.warn('No se pudo obtener el estado anterior del turno:', err);
      }

      // Cambiar estado a "En Viaje" con query parameter emitircpe
      // Usar el mismo patrón que EstadoTurnoForm.tsx
      const payload = {
        idEstado: 8,
      };
      let url = `turnos/${turnoId}`;
      url += `?emitircpe=${emitirCPE}`;
      const updatedTurno = await axiosPut(url, payload, backendURL);

      // Registrar cambio de estado en historial
      if (updatedTurno?.estado && estadoAnteriorId) {
        registrarCambioEstado(
          turnoId,
          estadoAnteriorId,
          8,
          user?.id,
          emitirCPE ? 'Emisión de CPE desde carta de porte' : 'Continuar sin emitir CPE'
        ).catch(() => {
          // Error silencioso
        });
      }

      showNotificacion(
        emitirCPE ? 'CPE emitida correctamente' : 'Estado actualizado correctamente',
        'success'
      );

      // Limpiar campos editados después de guardar
      setCamposEditados({});

      return updatedTurno;
    } catch (err: any) {
      const errorMsg = err.message || 'Error al guardar modificaciones y cambiar estado';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [turnoId, camposEditados, tiposModificacion, backendURL, user?.id, validarCampos]);

  const limpiarCamposEditados = useCallback(() => {
    setCamposEditados({});
  }, []);

  return {
    tiposModificacion,
    loading,
    error,
    camposEditados,
    editarCampo,
    obtenerValorCampo,
    esCampoEditable,
    obtenerTipoModificacionCampo,
    validarCampos,
    guardarModificacionesYCambiarEstado,
    limpiarCamposEditados,
  };
}
