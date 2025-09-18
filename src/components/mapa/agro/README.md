# Módulo Agro - Planificación Agrícola

Este módulo maneja la planificación agrícola de lotes, incluyendo la gestión de costos, estructuras de cultivos y visualización de cronogramas.

## Estructura del Módulo

```
agro/
├── components/           # Componentes principales
│   ├── CostosPanel.tsx
│   ├── EditorEstructuraPlanificacion.tsx
│   ├── PlanificacionDialog.tsx
│   ├── PlanificacionForm.tsx
│   └── TimelinePERT.tsx
├── data/                # Datos estáticos
│   └── productos_activos.json
├── hooks/               # Hooks personalizados
│   ├── useCostos.ts
│   ├── useEstructuraCultivo.ts
│   ├── useProductos.ts
│   └── index.ts
├── utils/               # Utilidades
│   ├── costosUtils.ts
│   ├── fechasUtils.ts
│   ├── kmzUtils.ts
│   ├── productosUtils.ts
│   └── index.ts
└── lotes-panel/         # Panel de lotes
    ├── index.ts
    ├── KmzImportDialog.tsx
    ├── kmzUtils.ts
    └── ...
```

## Componentes Principales

### CostosPanel
Panel para visualizar y gestionar los costos de planificación de un lote.
- **Props**: `planificacion`, `onUpdate`
- **Funcionalidades**: 
  - Cálculo automático de costos por categoría
  - Edición inline de items
  - Exportación a CSV
  - Agregar items personalizados

### EditorEstructuraPlanificacion
Editor para modificar las estructuras maestras de cultivos.
- **Props**: `open`, `onClose`
- **Funcionalidades**:
  - Edición de estructuras por cultivo
  - Gestión de items (labores, insumos, costos)
  - Persistencia en Supabase

### PlanificacionDialog
Diálogo principal para visualizar y editar planificaciones.
- **Props**: `open`, `onClose`, `planificacion`, `lote`, `ubicacion`
- **Funcionalidades**:
  - Tabs para Timeline PERT y Costos
  - Sincronización con base de datos
  - Eliminación de lotes

### PlanificacionForm
Formulario para crear nuevas planificaciones de lotes.
- **Props**: `open`, `onClose`, `lote`, `ubicacion`, `onPlanificacionCreada`
- **Funcionalidades**:
  - Selección de cultivo y campaña
  - Carga de archivos KMZ/KML
  - Cálculo automático de superficie
  - Generación de estructura inicial

### TimelinePERT
Visualización de cronograma usando diagrama de Gantt.
- **Props**: `planificacion`, `estructuraCultivo`, `fechaSiembra`, `onUpdate`
- **Funcionalidades**:
  - Visualización de tareas en timeline
  - Edición de fechas y duraciones
  - Diferentes vistas (día, semana, mes)

## Hooks Personalizados

### useProductos
Hook para manejo de productos activos.
```typescript
const { nombres, esReconocido, total } = useProductos();
```

### useCostos
Hook para cálculo de costos de planificación.
```typescript
const { categorias, costoPorHectarea, costoTotalReal } = useCostos(planificacion);
```

### useEstructuraCultivo
Hook para gestión de estructuras de cultivos.
```typescript
const { estructuras, loading, cargarEstructuras, actualizarEstructura } = useEstructuraCultivo();
```

## Utilidades

### productosUtils
- `obtenerNombresProductos()`: Extrae nombres de productos del JSON
- `esProductoReconocido(nombre)`: Verifica si un producto es reconocido

### costosUtils
- `calcularCostos(planificacion)`: Calcula costos de una planificación
- `agruparCostosPorCategoria(costos)`: Agrupa costos por categoría
- `calcularPrecioPorQuintalUSD()`: Calcula precios en USD

### fechasUtils
- `convertirItemsAItemsPlanificacion()`: Convierte estructura a planificación
- `convertirItemsAItemsEstructura()`: Convierte planificación a estructura
- `getNombreCultivo()`: Obtiene nombre descriptivo del cultivo

### kmzUtils
- `calcularSuperficieKMZ()`: Calcula superficie de archivos KMZ/KML
- `calcularSuperficieKML()`: Calcula superficie de archivos KML
- `calcularSuperficiePoligono()`: Calcula superficie de polígonos

## Tipos de Datos

### PlaneacionLote
```typescript
interface PlaneacionLote {
    campania: string;
    idLote: string;
    idUbicacion: number;
    cultivo: number;
    superficie: number;
    estructura: ItemPlanificacion[];
    extras: ItemPlanificacion[];
    fechaSiembra?: string;
    linkKMZ?: string;
}
```

### ItemPlanificacion
```typescript
interface ItemPlanificacion {
    id: string;
    nombre: string;
    precio: number;
    fechaDeRealizacion: string;
    fechaHasta?: string;
    clasificacion: 'labor' | 'insumo' | 'tierra' | 'estructura';
    cantidad?: number;
    unidad?: string;
    custom?: boolean;
}
```

## Flujo de Datos

1. **Creación de Planificación**: `PlanificacionForm` → Supabase
2. **Visualización**: `PlanificacionDialog` → `TimelinePERT` + `CostosPanel`
3. **Edición de Estructuras**: `EditorEstructuraPlanificacion` → Supabase
4. **Cálculo de Costos**: `useCostos` hook → `CostosPanel`
5. **Gestión de Productos**: `useProductos` hook → Autocompletados

## Dependencias Externas

- **@mui/material**: Componentes de UI
- **gantt-task-react**: Diagrama de Gantt
- **@mapbox/togeojson**: Conversión de KML a GeoJSON
- **jszip**: Manejo de archivos KMZ
- **supabase**: Base de datos

## Consideraciones de Rendimiento

- Los hooks utilizan `useMemo` para evitar recálculos innecesarios
- Las utilidades están optimizadas para manejar grandes volúmenes de datos
- Los componentes grandes están divididos en subcomponentes más pequeños
- Se evita la duplicación de lógica mediante hooks y utilidades reutilizables

