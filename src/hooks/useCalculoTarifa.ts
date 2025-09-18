import { useState, useCallback } from 'react';
import Papa from 'papaparse';
import { calcularDistancia, redondearDistanciaParaTarifa } from '../utils/distanciaUtils';

export interface Ubicacion {
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

export interface ResultadoTarifa {
  distanciaCalculada: number;
  tarifaPorTonelada: number;
  tarifaSinDescuento: number;
  tarifaConDescuento: number;
  tarifaPorToneladaConDescuento: number;
  tarifaPorToneladaConDescuentoContra: number;
  tarifaPorKm: number;
  tarifaPorKmConDescuento: number;
  incidenciaConDescuento: number;
  incidenciaConDescContra: number;
}

export interface ParametrosCalculo {
  ubicacionOrigen: Ubicacion | null;
  ubicacionDestino: Ubicacion | null;
  toneladas: number | null;
  precioGrano: number | null;
  descuento: number;
  contraFlete: number | null;
  distanciaManual?: number | null; // Para override manual
}

export const useCalculoTarifa = () => {
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calcularTarifa = useCallback(async (parametros: ParametrosCalculo): Promise<ResultadoTarifa | null> => {
    setCargando(true);
    setError(null);

    try {
      const {
        ubicacionOrigen,
        ubicacionDestino,
        toneladas,
        precioGrano,
        descuento,
        contraFlete,
        distanciaManual
      } = parametros;

      // Validaciones
      if (!toneladas || toneladas <= 0) {
        throw new Error('Las toneladas deben ser mayor a 0');
      }

      if (toneladas > 50) {
        throw new Error('Las toneladas no pueden ser mayor a 50');
      }

      let distanciaKm: number;

      // Calcular distancia
      if (distanciaManual !== null && distanciaManual !== undefined) {
        // Usar distancia manual si se proporciona
        distanciaKm = distanciaManual;
      } else if (ubicacionOrigen && ubicacionDestino) {
        // Calcular distancia automáticamente
        const distanciaCalculada = await calcularDistancia(
          ubicacionOrigen.latitud,
          ubicacionOrigen.longitud,
          ubicacionDestino.latitud,
          ubicacionDestino.longitud
        );
        distanciaKm = redondearDistanciaParaTarifa(distanciaCalculada);
      } else {
        throw new Error('Debe proporcionar ubicaciones o distancia manual');
      }

      if (distanciaKm > 1500) {
        throw new Error('La distancia no puede ser mayor a 1500 km');
      }

      // Cargar tarifas del CSV
      const res = await fetch("/tarifas.csv");
      const text = await res.text();
      const data = Papa.parse<string[]>(text, { header: false }).data;
      
      // Buscar la tarifa para la distancia calculada
      const fila = data.find((f) => parseInt(f[0]) === distanciaKm);
      if (!fila) {
        throw new Error(`No se encontró tarifa para ${distanciaKm} km`);
      }

      const tarifaPorTonelada = parseFloat(fila[1]);

      // Calcular tarifas
      const tarifaSinDescuento = tarifaPorTonelada * toneladas;
      const tarifaConDescuento = tarifaSinDescuento - (tarifaSinDescuento * descuento) / 100;
      const tarifaPorToneladaConDescuento = tarifaPorTonelada - (tarifaPorTonelada * descuento) / 100;

      // Calcular con contraflete
      const tarifaPorToneladaConDescuentoContra = (tarifaPorToneladaConDescuento + (contraFlete || 0)) * toneladas;

      // Calcular tarifas por km
      const tarifaPorKm = tarifaSinDescuento / distanciaKm;
      const tarifaPorKmConDescuento = tarifaConDescuento / distanciaKm;

      // Calcular incidencias
      let incidenciaConDescuento = 0;
      let incidenciaConDescContra = 0;
      
      if (precioGrano && toneladas) {
        incidenciaConDescuento = (tarifaConDescuento / (precioGrano * toneladas)) * 100;
        incidenciaConDescContra = (tarifaPorToneladaConDescuentoContra / (precioGrano * toneladas)) * 100;
      }

      const resultado: ResultadoTarifa = {
        distanciaCalculada: distanciaKm,
        tarifaPorTonelada,
        tarifaSinDescuento,
        tarifaConDescuento,
        tarifaPorToneladaConDescuento,
        tarifaPorToneladaConDescuentoContra,
        tarifaPorKm,
        tarifaPorKmConDescuento,
        incidenciaConDescuento,
        incidenciaConDescContra
      };

      return resultado;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      return null;
    } finally {
      setCargando(false);
    }
  }, []);

  return {
    calcularTarifa,
    cargando,
    error
  };
};

