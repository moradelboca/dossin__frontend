// Hook para manejo de productos activos
import { useState, useMemo } from 'react';
import { obtenerNombresProductos, esProductoReconocido } from '../utils/productosUtils';

/**
 * Hook para manejo de productos activos
 * @returns Objeto con funciones y datos relacionados a productos
 */
export const useProductos = () => {
    const [nombresProductos] = useState<string[]>(obtenerNombresProductos());

    const productosMemo = useMemo(() => ({
        nombres: nombresProductos,
        esReconocido: esProductoReconocido,
        total: nombresProductos.length
    }), [nombresProductos]);

    return productosMemo;
};

