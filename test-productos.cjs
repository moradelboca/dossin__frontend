const fs = require('fs');
const path = require('path');

// Leer el archivo JSON
const productosActivos = JSON.parse(fs.readFileSync(path.join(__dirname, 'src/components/mapa/agro/data/productos_activos.json'), 'utf8'));

// Función auxiliar para extraer productos de un array
const extraerProductos = (productos) => {
    const nombres = [];
    if (Array.isArray(productos)) {
        productos.forEach((producto) => {
            nombres.push(producto.nombre);
        });
    }
    return nombres;
};

// Función auxiliar para extraer productos de un objeto con categorías
const extraerCategorias = (categorias) => {
    const nombres = [];
    if (categorias && typeof categorias === 'object') {
        Object.values(categorias).forEach((categoria) => {
            if (Array.isArray(categoria)) {
                categoria.forEach((producto) => {
                    nombres.push(producto.nombre);
                });
            } else if (categoria && typeof categoria === 'object') {
                // Recursivamente extraer de subcategorías
                const subNombres = extraerCategorias(categoria);
                nombres.push(...subNombres);
            }
        });
    }
    return nombres;
};

const obtenerNombresProductos = () => {
    const nombres = [];
    
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
        'Bienes de Uso',
        'Servicios'
    ];
    
    categorias.forEach(categoria => {
        // Buscar primero en Productos, luego en el nivel raíz
        let categoriaData = productosActivos.Productos[categoria] || productosActivos[categoria];
        
        if (categoriaData) {
            if (categoria === 'Granos') {
                // Granos tiene subcategorías especiales - buscar en el nivel raíz
                const granosNombres = extraerCategorias(productosActivos.Productos.Granos);
                nombres.push(...granosNombres);
            } else if (categoria === 'Insumos') {
                // Insumos tiene subcategorías especiales - buscar en el nivel raíz
                const insumosNombres = extraerCategorias(productosActivos.Productos.Insumos);
                nombres.push(...insumosNombres);
            } else if (categoria === 'Servicios') {
                // Servicios tiene subcategorías especiales - buscar en el nivel raíz
                const serviciosNombres = extraerCategorias(productosActivos.Productos.Servicios);
                nombres.push(...serviciosNombres);
            } else {
                // Categorías simples - usar la data encontrada
                const categoriaNombres = extraerProductos(categoriaData);
                nombres.push(...categoriaNombres);
            }
        }
    });
    
    // Manejar las categorías que están al mismo nivel que "Granos" en el JSON
    if (productosActivos.Productos["Granos puros"]) {
        const granosPurosNombres = extraerProductos(productosActivos.Productos["Granos puros"]);
        nombres.push(...granosPurosNombres);
    }
    if (productosActivos.Productos["Granos clasificados"]) {
        const granosClasificadosNombres = extraerProductos(productosActivos.Productos["Granos clasificados"]);
        nombres.push(...granosClasificadosNombres);
    }
    
    // Eliminar duplicados y ordenar
    return [...new Set(nombres)].sort();
};

const nombres = obtenerNombresProductos();
console.log('Total de productos:', nombres.length);
console.log('Primeros 10 productos:', nombres.slice(0, 10));
console.log('Últimos 10 productos:', nombres.slice(-10));
