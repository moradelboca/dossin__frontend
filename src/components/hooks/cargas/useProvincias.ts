import { useMemo } from 'react';

export const useProvincias = (cargas: any[]) => {
  const provinciasCarga = useMemo(() => {
    const provincias = new Map<number, any>();
    cargas.forEach(carga => {
      const provincia = carga.ubicacionCarga.localidad.provincia;
      if (!provincias.has(provincia.id)) {
        provincias.set(provincia.id, provincia);
      }
    });
    return Array.from(provincias.values());
  }, [cargas]);

  const provinciasDescarga = useMemo(() => {
    const provincias = new Map<number, any>();
    cargas.forEach(carga => {
      const provincia = carga.ubicacionDescarga?.localidad?.provincia;
      if (provincia && !provincias.has(provincia.id)) {
        provincias.set(provincia.id, provincia);
      }
    });
    return Array.from(provincias.values());
  }, [cargas]);

  return { provinciasCarga, provinciasDescarga };
};