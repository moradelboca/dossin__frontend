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



