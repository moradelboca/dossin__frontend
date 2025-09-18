import { useState, useMemo } from 'react';
import { DatosComerciales, AnalisisMargen, ProyeccionMargen } from '../../../../types/agro';

interface UseAnalisisMargenProps {
    datosComerciales: DatosComerciales;
    superficie: number | null;
    costoTotalProduccion: number;
    rendimientoEstimado: number; // tn/ha estimadas
    rindeObjetivo?: number; // tn/ha esperadas, por defecto 3
}

export function useAnalisisMargen({
    datosComerciales,
    superficie,
    costoTotalProduccion,
    rendimientoEstimado,
    rindeObjetivo = 3
}: UseAnalisisMargenProps) {
    const [calculando, setCalculando] = useState(false);

    // Calcular análisis de margen en tiempo real
    const analisisMargen: AnalisisMargen | null = useMemo(() => {
        if (!superficie || superficie <= 0) return null;

        setCalculando(true);

        const costoTotalProduccionCalculado = costoTotalProduccion || 0;
        const costoFlete = datosComerciales.flete.costo_por_tn || 0;
        const contraflete = datosComerciales.flete.contraflete || 0;
        const costoLogisticoTotal = (costoFlete + contraflete) * rendimientoEstimado * superficie;
        const costoTotalPorHectarea = (costoTotalProduccionCalculado + costoLogisticoTotal) / superficie;
        
        const precioVenta = datosComerciales.venta.precio_venta_por_tn || 0;
        const ingresoEstimadoPorHectarea = precioVenta * rendimientoEstimado;
        const margenBrutoPorHectarea = ingresoEstimadoPorHectarea - costoTotalPorHectarea;
        const margenPorcentual = ingresoEstimadoPorHectarea > 0 
            ? (margenBrutoPorHectarea / ingresoEstimadoPorHectarea) * 100 
            : 0;

        // Punto de equilibrio: (costo fijo + costo logístico por tn) / precio por tn
        const costoFijoPorHectarea = costoTotalProduccionCalculado / superficie;
        const costoLogisticoPorHectarea = (costoFlete + contraflete) * rendimientoEstimado;
        const puntoEquilibrioRinde = precioVenta > 0
            ? (costoFijoPorHectarea + costoLogisticoPorHectarea) / precioVenta
            : 0;

        // Ganancia estimada con rinde objetivo
        const gananciaEstimadaRindeObjetivo = (precioVenta * rindeObjetivo) - (costoFijoPorHectarea + (costoFlete + contraflete) * rindeObjetivo);

        setCalculando(false);

        return {
            costo_total_produccion: costoTotalProduccionCalculado,
            costo_logistico_total: costoLogisticoTotal,
            costo_total_por_hectarea: costoTotalPorHectarea,
            ingreso_estimado_por_hectarea: ingresoEstimadoPorHectarea,
            margen_bruto_por_hectarea: margenBrutoPorHectarea,
            margen_porcentual: margenPorcentual,
            punto_equilibrio_rinde: puntoEquilibrioRinde,
            ganancia_estimada_rinde_objetivo: gananciaEstimadaRindeObjetivo,
            rinde_objetivo: rindeObjetivo,
        };
    }, [
        datosComerciales.venta.precio_venta_por_tn,
        datosComerciales.flete.costo_por_tn,
        datosComerciales.flete.contraflete,
        superficie,
        costoTotalProduccion,
        rendimientoEstimado,
        rindeObjetivo
    ]);

    // Calcular proyecciones para diferentes escenarios de rendimiento
    const proyecciones: ProyeccionMargen[] = useMemo(() => {
        if (!analisisMargen || !superficie || superficie <= 0) return [];

        const escenarios = [0.5, 0.75, 1, 1.25, 1.5].map(factor => rendimientoEstimado * factor); // Factores del rendimiento estimado
        const precioVenta = datosComerciales.venta.precio_venta_por_tn || 0;
        const costoFlete = datosComerciales.flete.costo_por_tn || 0;
        const contraflete = datosComerciales.flete.contraflete || 0;
        const costoFijoPorHectarea = analisisMargen.costo_total_produccion / superficie;

        return escenarios.map(rindeEscenario => {
            const produccionTotal = rindeEscenario * superficie;
            const ingresoTotal = precioVenta * produccionTotal;
            const costoLogisticoPorHectarea = (costoFlete + contraflete) * rindeEscenario;
            const costoTotalPorHectarea = costoFijoPorHectarea + costoLogisticoPorHectarea;
            const costoTotal = costoTotalPorHectarea * superficie;
            const margenTotal = ingresoTotal - costoTotal;
            const margenPorcentual = ingresoTotal > 0 ? (margenTotal / ingresoTotal) * 100 : 0;

            return {
                rinde_escenario: rindeEscenario,
                produccion_total: produccionTotal,
                ingreso_total: ingresoTotal,
                costo_total: costoTotal,
                margen_total: margenTotal,
                margen_porcentual: margenPorcentual,
            };
        });
    }, [analisisMargen, superficie, datosComerciales.venta.precio_venta_por_tn, rendimientoEstimado, datosComerciales.flete.costo_por_tn, datosComerciales.flete.contraflete]);

    return {
        analisisMargen,
        proyecciones,
        calculando
    };
}

