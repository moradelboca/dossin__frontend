const fs = require('fs');
const path = require('path');

// Leer el archivo JSON
const productosData = JSON.parse(fs.readFileSync(path.join('src', 'components', 'mapa', 'agro', 'data', 'productos_activos.json'), 'utf8'));

// Función recursiva para extraer productos
const nombres = [];
const extraerProductosRecursivo = (obj) => {
    if (obj === null || obj === undefined) return;
    
    if (Array.isArray(obj)) {
        obj.forEach(item => {
            if (typeof item === 'object' && item !== null) {
                if (item.nombre && typeof item.nombre === 'string') {
                    nombres.push(item.nombre);
                } else {
                    extraerProductosRecursivo(item);
                }
            }
        });
    } else if (typeof obj === 'object') {
        Object.values(obj).forEach(value => {
            extraerProductosRecursivo(value);
        });
    }
};

extraerProductosRecursivo(productosData);
const productosUnicos = [...new Set(nombres)].sort();

console.log('Total de productos encontrados:', productosUnicos.length);
console.log('Primeros 10 productos:', productosUnicos.slice(0, 10));
console.log('Últimos 10 productos:', productosUnicos.slice(-10));
