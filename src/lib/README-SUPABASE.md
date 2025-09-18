# Supabase Database Management

Este directorio contiene los archivos para gestionar la base de datos de Supabase.

## Archivos

### `supabase-init.sql`
- **Propósito**: Archivo principal para inicializar la base de datos
- **Cuándo usar**: 
  - Primera instalación
  - Recrear la estructura completa
  - Cambios estructurales importantes
- **Contenido**: Estructura completa de tablas, índices, datos iniciales y triggers

### `supabase-migrations.sql`
- **Propósito**: Archivo para actualizaciones incrementales
- **Cuándo usar**: 
  - Aplicar cambios específicos
  - Actualizaciones de producción
  - Cambios menores sin recrear toda la estructura
- **Contenido**: Comandos SQL incrementales organizados por migración

## Flujo de Trabajo

### 1. Desarrollo Inicial
```sql
-- Ejecutar en Supabase SQL Editor
\i 'supabase-init.sql'
```

### 2. Actualizaciones Incrementales
```sql
-- Ejecutar solo las migraciones necesarias
-- Por ejemplo, para agregar una nueva columna:
ALTER TABLE "PlaneacionLote" ADD COLUMN "nuevaColumna" TEXT;
```

### 3. Actualizar Archivos
- **Cambios estructurales**: Actualizar `supabase-init.sql`
- **Cambios incrementales**: Agregar a `supabase-migrations.sql`

## Estructura de Migraciones

Cada migración debe seguir este formato:

```sql
-- =====================================================
-- MIGRACIÓN XXX - NOMBRE
-- Fecha: YYYY-MM-DD
-- Descripción: Descripción del cambio
-- =====================================================

-- Comandos SQL aquí
ALTER TABLE "Tabla" ADD COLUMN "Columna" TYPE;

-- =====================================================
```

## Buenas Prácticas

1. **Nunca modificar `supabase-init.sql` sin documentar**
2. **Cada migración debe ser incremental y no destructiva**
3. **Probar en desarrollo antes de producción**
4. **Documentar fecha y descripción de cada cambio**
5. **Usar `IF NOT EXISTS` para evitar errores de duplicación**

## Ejemplo de Uso

### Agregar Nueva Columna
1. Agregar comando a `supabase-migrations.sql`:
```sql
-- MIGRACIÓN 002 - Nueva columna
ALTER TABLE "PlaneacionLote" ADD COLUMN "observaciones" TEXT;
```

2. Ejecutar en Supabase:
```sql
\i 'supabase-migrations.sql'
```

3. Actualizar `supabase-init.sql` para futuras instalaciones:
```sql
CREATE TABLE IF NOT EXISTS "PlaneacionLote" (
    -- ... columnas existentes ...
    "observaciones" TEXT,
    -- ... resto de la estructura ...
);
```

## Notas Importantes

- Los archivos usan `CREATE TABLE IF NOT EXISTS` para evitar errores
- Los índices usan `CREATE INDEX IF NOT EXISTS`
- Los triggers se recrean con `DROP TRIGGER IF EXISTS` antes de crear
- Los datos iniciales usan `ON CONFLICT DO NOTHING` para evitar duplicados
