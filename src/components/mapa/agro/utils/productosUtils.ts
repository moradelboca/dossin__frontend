// Utilidades para manejo de productos activos
import productosActivos from '../data/productos_activos.json';

/**
 * Extrae todos los nombres de productos del archivo JSON de productos activos
 * @returns Array de nombres de productos únicos y ordenados
 */
export const obtenerNombresProductos = (): string[] => {
    const nombres: string[] = [];
    
    // Función auxiliar para extraer productos de un array
    const extraerProductos = (productos: any[]) => {
        if (Array.isArray(productos)) {
            productos.forEach((producto: any) => {
                nombres.push(producto.nombre);
            });
        }
    };
    
    // Función auxiliar para extraer productos de un objeto con categorías
    const extraerCategorias = (categorias: any) => {
        if (categorias && typeof categorias === 'object') {
            Object.values(categorias).forEach((categoria: any) => {
                if (Array.isArray(categoria)) {
                    categoria.forEach((producto: any) => {
                        nombres.push(producto.nombre);
                    });
                }
            });
        }
    };
    
    // Extraer de todas las categorías principales
    const categorias = [
        'Algodon',
        'Granos',
        'Insumos',
        'Combustibles y Lubricantes',
        'Maquinaria',
        'Veterinarios',
        'Varios',
        'Herbicidas',
        'Coadyuvantes',
        'Insecticidas',
        'Fungicidas',
        'Inoculantes',
        'Nut. Animal',
        'Bienes de Uso'
    ];
    
    categorias.forEach(categoria => {
        // Buscar primero en Productos, luego en el nivel raíz
        let categoriaData = (productosActivos.Productos as any)[categoria] || (productosActivos as any)[categoria];
        
        if (categoriaData) {
            if (categoria === 'Granos') {
                // Granos tiene subcategorías especiales
                if ((productosActivos.Productos as any).Granos["Granos puros"]) {
                    extraerProductos((productosActivos.Productos as any).Granos["Granos puros"]);
                }
                if ((productosActivos.Productos as any).Granos["Granos clasificados"]) {
                    extraerProductos((productosActivos.Productos as any).Granos["Granos clasificados"]);
                }
                // También extraer los productos directos de Granos
                extraerProductos((productosActivos.Productos as any).Granos);
            } else if (categoria === 'Insumos') {
                // Insumos tiene subcategorías especiales - buscar en el nivel raíz
                extraerCategorias((productosActivos as any).Insumos);
            } else {
                // Categorías simples - usar la data encontrada
                extraerProductos(categoriaData);
            }
        }
    });
    
    // Manejar las categorías que están mal anidadas en el JSON
    // "Granos puros" y "Granos clasificados" están al mismo nivel que "Granos"
    if ((productosActivos.Productos as any)["Granos puros"]) {
        extraerProductos((productosActivos.Productos as any)["Granos puros"]);
    }
    if ((productosActivos.Productos as any)["Granos clasificados"]) {
        extraerProductos((productosActivos.Productos as any)["Granos clasificados"]);
    }
    
    // Eliminar duplicados y ordenar
    return [...new Set(nombres)].sort();
};

/**
 * Verifica si un nombre de producto está en la lista de productos reconocidos
 * @param nombre - Nombre del producto a verificar
 * @returns true si el producto es reconocido, false en caso contrario
 */
export const esProductoReconocido = (nombre: string): boolean => {
    const nombresProductos = obtenerNombresProductos();
    return nombresProductos.includes(nombre);
};

