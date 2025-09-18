# Sistema de Recomendaciones de Rotación de Cultivos

## Descripción

Este sistema proporciona recomendaciones inteligentes para la rotación de cultivos basadas en:

1. **Cultivo anterior**: Evalúa qué cultivo se sembró en la campaña anterior
2. **Insumos residuales**: Analiza herbicidas y fertilizantes que pueden afectar al nuevo cultivo
3. **Tiempo transcurrido**: Considera el tiempo entre campañas
4. **Buenas prácticas agrícolas**: Aplica reglas de rotación establecidas

## Características

### Niveles de Recomendación

- **Excelente** ✅: Rotación altamente recomendada
- **Buena** ℹ️: Rotación recomendada con beneficios
- **Regular** ⚠️: Rotación aceptable pero con consideraciones
- **Desfavorable** ❌: Rotación no recomendada

### Insumos Analizados

#### Herbicidas Residuales
- **Atrazina**: 365 días de residualidad, afecta Soja y Girasol
- **S-Metolacloro**: 120 días de residualidad, afecta Soja y Girasol
- **Imazetapir**: 180 días de residualidad, afecta gramíneas
- **Imazamox**: 150 días de residualidad, afecta gramíneas
- **2,4-D**: 30 días de residualidad, afecta cultivos de hoja ancha

#### Fertilizantes
- **Urea**: Efecto positivo residual
- **Fertilizante Fósforo**: Efecto positivo residual

### Reglas de Rotación

#### Soja de Primera (ID: 1)
- **Excelentes predecesores**: Trigo, Centeno
- **Buenos predecesores**: Maíz, Sorgo
- **Regulares**: Girasol
- **Desfavorables**: Soja (monocultivo)

#### Maíz de Primera (ID: 3)
- **Excelentes predecesores**: Soja
- **Buenos predecesores**: Trigo, Centeno
- **Regulares**: Girasol, Sorgo
- **Desfavorables**: Maíz (monocultivo)

## Uso

### En el Formulario de Planificación

```tsx
import { useRotacionCultivos } from '../hooks/useRotacionCultivos';

const { 
    recomendacion, 
    cultivoAnterior, 
    loading, 
    error 
} = useRotacionCultivos({
    idLote: 'Lote-001',
    idUbicacion: 123,
    campaniaActual: '2024-25',
    cultivoNuevo: 1 // Soja de Primera
});
```

### Componente de Recomendación

```tsx
<RotacionRecomendacion
    recomendacion={recomendacion}
    cultivoAnterior={cultivoAnterior}
    cultivoNuevo="Soja de Primera"
    loading={loading}
/>
```

## Ejemplos de Recomendaciones

### Caso 1: Excelente Rotación
**Cultivo anterior**: Trigo → **Cultivo nuevo**: Soja de Primera
- ✅ **Excelente rotación**
- Las leguminosas fijan nitrógeno que beneficia al trigo siguiente
- Mejora la estructura del suelo
- Reduce problemas de plagas y enfermedades

### Caso 2: Rotación Desfavorable
**Cultivo anterior**: Soja → **Cultivo nuevo**: Soja de Primera
- ❌ **Monocultivo no recomendado**
- Agotamiento de nutrientes específicos
- Aumento de plagas y enfermedades
- Deterioro de la estructura del suelo

### Caso 3: Insumos Residuales Problemáticos
**Cultivo anterior**: Maíz (con Atrazina) → **Cultivo nuevo**: Soja de Primera
- ❌ **Rotación no recomendada**
- Atrazina residual puede afectar la soja
- Tiempo de residualidad: 365 días
- Sugerencia: Esperar más tiempo o elegir cultivo tolerante

## Configuración

### Agregar Nuevos Cultivos

```typescript
export const CULTIVOS = {
  // ... cultivos existentes
  10: { nombre: 'Nuevo Cultivo', familia: 'leguminosa', ciclo: 'corto' }
} as const;
```

### Agregar Nuevos Insumos

```typescript
export const INSUMOS_RESIDUALES: InsumoResidual[] = [
  // ... insumos existentes
  {
    nombre: 'Nuevo Herbicida',
    tiempoResidual: 180,
    cultivosAfectados: [1, 2],
    efecto: 'negativo',
    descripcion: 'Descripción del efecto'
  }
];
```

### Modificar Reglas de Rotación

```typescript
export const ROTACIONES_RECOMENDADAS = {
  [1]: { // Soja de Primera
    excelentes: [5, 8, 10], // Agregar nuevo cultivo
    buenas: [3, 4, 9],
    regulares: [6, 7],
    desfavorables: [1, 2]
  }
};
```

## Consideraciones Técnicas

1. **Base de datos**: Requiere acceso a `PlaneacionLote` y `Campañas`
2. **Rendimiento**: Las consultas se cachean para evitar llamadas repetitivas
3. **Escalabilidad**: Fácil agregar nuevos cultivos e insumos
4. **Mantenimiento**: Reglas centralizadas y fáciles de actualizar

## Beneficios

1. **Prevención de problemas**: Evita rotaciones problemáticas
2. **Optimización de rendimientos**: Sugiere las mejores secuencias
3. **Manejo de residuos**: Considera efectos de herbicidas
4. **Educación**: Enseña buenas prácticas agrícolas
5. **Flexibilidad**: Permite al usuario tomar decisiones informadas
