// Hook para manejo de costos de planificación
import { useMemo } from 'react';
import { PlaneacionLote } from '../../../../types/agro';
import { calcularCostos, agruparCostosPorCategoria } from '../utils/costosUtils';

/**
 * Hook para cálculo y manejo de costos
 * @param planificacion - Planificación del lote
 * @returns Objeto con costos calculados y agrupados
 */
export const useCostos = (planificacion: PlaneacionLote) => {
    const costosCalculados = useMemo(() => {
        return calcularCostos(planificacion);
    }, [planificacion.estructura, planificacion.extras]);

    const categoriasCostos = useMemo(() => {
        return agruparCostosPorCategoria(costosCalculados);
    }, [costosCalculados]);

    const totalGeneral = useMemo(() => {
        return categoriasCostos.reduce((sum, cat) => sum + cat.total, 0);
    }, [categoriasCostos]);

    const costoPorHectarea = useMemo(() => {
        return totalGeneral;
    }, [totalGeneral]);

    const costoTotalReal = useMemo(() => {
        return totalGeneral * planificacion.superficie;
    }, [totalGeneral, planificacion.superficie]);

    return {
        costos: costosCalculados,
        categorias: categoriasCostos,
        totalGeneral,
        costoPorHectarea,
        costoTotalReal,
        superficie: planificacion.superficie
    };
};

