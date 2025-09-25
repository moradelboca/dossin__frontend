-- =====================================================
-- MIGRACIÓN: CONFIGURAR 10 AÑOS DE HISTORIAL PARA ÓRDENES DE TRABAJO
-- =====================================================

-- Actualizar configuración para 10 años de historial
UPDATE "SyncControl" 
SET "configuracion" = '{"maxAgeDays": 7, "historicalYears": 10, "incrementalSync": true}',
    "updated_at" = NOW()
WHERE "entidad" = 'ordenes_trabajo';

-- Si no existe el registro, crearlo
INSERT INTO "SyncControl" ("entidad", "configuracion") 
VALUES ('ordenes_trabajo', '{"maxAgeDays": 7, "historicalYears": 10, "incrementalSync": true}')
ON CONFLICT ("entidad") DO NOTHING;

-- =====================================================
-- FORZAR NUEVA CARGA HISTÓRICA
-- =====================================================

-- Resetear el estado de sincronización para forzar nueva carga histórica
UPDATE "SyncControl" 
SET "estado" = 'idle',
    "ultima_sincronizacion" = NULL,
    "ultima_fecha_consulta" = NULL,
    "total_registros" = 0,
    "error_message" = NULL,
    "updated_at" = NOW()
WHERE "entidad" = 'ordenes_trabajo';

-- =====================================================
-- ELIMINAR TODAS LAS ÓRDENES DE TRABAJO
-- =====================================================

-- IMPORTANTE: Este comando elimina TODAS las órdenes de trabajo de la base de datos
-- Se ejecuta en el siguiente orden para respetar las restricciones de clave foránea:

-- 1. Eliminar referencias en PlaneacionLote (establecer ordenTrabajo_id a NULL)
UPDATE "PlaneacionLote" 
SET "ordenTrabajo_id" = NULL,
    "updated_at" = NOW()
WHERE "ordenTrabajo_id" IS NOT NULL;

-- 2. Eliminar relaciones en la tabla intermedia PlaneacionLoteOrdenTrabajo
DELETE FROM "PlaneacionLoteOrdenTrabajo";

-- 3. Eliminar todas las órdenes de trabajo
DELETE FROM "OrdenTrabajo";

-- 4. Resetear el contador de registros en SyncControl
UPDATE "SyncControl" 
SET "total_registros" = 0,
    "ultima_sincronizacion" = NULL,
    "ultima_fecha_consulta" = NULL,
    "estado" = 'idle',
    "error_message" = NULL,
    "updated_at" = NOW()
WHERE "entidad" = 'ordenes_trabajo';

-- Mensaje de confirmación
DO $$
BEGIN
    RAISE NOTICE '🗑️  TODAS LAS ÓRDENES DE TRABAJO HAN SIDO ELIMINADAS';
    RAISE NOTICE '📊 Referencias en PlaneacionLote actualizadas';
    RAISE NOTICE '🔗 Relaciones en PlaneacionLoteOrdenTrabajo eliminadas';
    RAISE NOTICE '📋 Tabla OrdenTrabajo vaciada';
    RAISE NOTICE '🔄 Estado de sincronización reseteado';
END $$;



