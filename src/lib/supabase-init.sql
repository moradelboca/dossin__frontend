-- =====================================================
-- SUPABASE INITIALIZATION FILE
-- Archivo principal para inicializar la base de datos
-- Se actualiza manualmente cuando se hacen cambios estructurales
-- =====================================================

-- =====================================================
-- MÓDULO DE PLANIFICACIÓN AGRÍCOLA
-- =====================================================

-- Tabla para estructuras de fechas por cultivo (NUEVO MODELO)
CREATE TABLE IF NOT EXISTS "EstructuraFechasCultivo" (
    "cultivo" INTEGER PRIMARY KEY,
    "items" JSONB DEFAULT '[]',
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla principal de planificación por lote
CREATE TABLE IF NOT EXISTS "PlaneacionLote" (
    "campania" TEXT NOT NULL,
    "idLote" TEXT NOT NULL,
    "idUbicacion" INTEGER NOT NULL,
    "linkKMZ" TEXT,
    "cultivo" INTEGER NOT NULL,
    "superficie" DECIMAL(10,2) NOT NULL,
    "estructura" JSONB DEFAULT '[]',
    "extras" JSONB DEFAULT '[]',
    "lluvias" JSONB DEFAULT '[]', -- Array de registros de lluvias con fecha, cantidad y observaciones
    "fechaSiembra" DATE,
    "ordenTrabajo_id" INTEGER, -- Referencia opcional a una orden de trabajo principal
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY ("campania", "idLote"),
    FOREIGN KEY ("cultivo") REFERENCES "EstructuraFechasCultivo"("cultivo") ON DELETE RESTRICT,
    FOREIGN KEY ("ordenTrabajo_id") REFERENCES "OrdenTrabajo"("transaccionId") ON DELETE CASCADE
);

-- Tabla para órdenes de trabajo
CREATE TABLE IF NOT EXISTS "OrdenTrabajo" (
    "transaccionId" INTEGER PRIMARY KEY,
    "establecimiento" VARCHAR(255),
    "estado" VARCHAR(100),
    "fecha" DATE,
    "laboreo" VARCHAR(255),
    "laboreoId" INTEGER,
    "datos" JSONB,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de relación entre PlaneacionLote y OrdenTrabajo (muchos a muchos)
CREATE TABLE IF NOT EXISTS "PlaneacionLoteOrdenTrabajo" (
    "id" SERIAL PRIMARY KEY,
    "planeacionLote_campania" TEXT,
    "planeacionLote_idLote" TEXT,
    "ordenTrabajo_id" INTEGER,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY ("planeacionLote_campania", "planeacionLote_idLote") 
        REFERENCES "PlaneacionLote"("campania", "idLote") 
        ON DELETE CASCADE,
    FOREIGN KEY ("ordenTrabajo_id") 
        REFERENCES "OrdenTrabajo"("transaccionId") 
        ON DELETE CASCADE,
    UNIQUE("planeacionLote_campania", "planeacionLote_idLote", "ordenTrabajo_id")
);

-- =====================================================
-- ÍNDICES PARA OPTIMIZACIÓN
-- =====================================================

-- Índices para PlaneacionLote
CREATE INDEX IF NOT EXISTS idx_planeacion_lote_cultivo ON "PlaneacionLote"("cultivo");
CREATE INDEX IF NOT EXISTS idx_planeacion_lote_campania ON "PlaneacionLote"("campania");
CREATE INDEX IF NOT EXISTS idx_planeacion_lote_ubicacion ON "PlaneacionLote"("idUbicacion");
CREATE INDEX IF NOT EXISTS idx_planeacion_lote_compuesto ON "PlaneacionLote"("campania", "idLote", "idUbicacion");
CREATE INDEX IF NOT EXISTS idx_planeacion_lote_lluvias ON "PlaneacionLote" USING GIN ("lluvias");
CREATE INDEX IF NOT EXISTS idx_planeacion_lote_orden_trabajo ON "PlaneacionLote"("ordenTrabajo_id");

-- Índices para OrdenTrabajo
CREATE INDEX IF NOT EXISTS idx_orden_trabajo_laboreo_id ON "OrdenTrabajo"("laboreoId");
CREATE INDEX IF NOT EXISTS idx_orden_trabajo_estado ON "OrdenTrabajo"("estado");
CREATE INDEX IF NOT EXISTS idx_orden_trabajo_fecha ON "OrdenTrabajo"("fecha");
CREATE INDEX IF NOT EXISTS idx_orden_trabajo_datos ON "OrdenTrabajo" USING GIN("datos");
CREATE INDEX IF NOT EXISTS idx_orden_trabajo_establecimiento ON "OrdenTrabajo"("establecimiento");

-- Índices para tabla de relación
CREATE INDEX IF NOT EXISTS idx_planeacion_orden_campania_lote ON "PlaneacionLoteOrdenTrabajo"("planeacionLote_campania", "planeacionLote_idLote");
CREATE INDEX IF NOT EXISTS idx_planeacion_orden_trabajo_id ON "PlaneacionLoteOrdenTrabajo"("ordenTrabajo_id");

-- =====================================================
-- FUNCIONES Y TRIGGERS
-- =====================================================

-- Función para actualizar timestamp automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para actualizar timestamps automáticamente
DROP TRIGGER IF EXISTS update_planeacion_lote_updated_at ON "PlaneacionLote";
CREATE TRIGGER update_planeacion_lote_updated_at BEFORE UPDATE ON "PlaneacionLote"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_estructura_fechas_cultivo_updated_at ON "EstructuraFechasCultivo";
CREATE TRIGGER update_estructura_fechas_cultivo_updated_at BEFORE UPDATE ON "EstructuraFechasCultivo"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_orden_trabajo_updated_at ON "OrdenTrabajo";
CREATE TRIGGER update_orden_trabajo_updated_at BEFORE UPDATE ON "OrdenTrabajo"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- DATOS INICIALES
-- =====================================================

-- NOTA: Los datos iniciales completos se cargan desde supabase-migrations.sql
-- Este archivo solo crea la estructura de la base de datos
-- Para cargar los datos completos de cultivos, ejecutar supabase-migrations.sql después

-- =====================================================
-- MENSAJE DE CONFIRMACIÓN
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '✅ Base de datos inicializada exitosamente!';
    RAISE NOTICE '📊 Tabla EstructuraFechasCultivo creada con NUEVO MODELO (columna items)';
    RAISE NOTICE '📊 Tabla PlaneacionLote creada con estructura completa';
    RAISE NOTICE '🌧️ Campo lluvias agregado para registro de precipitaciones por lote';
    RAISE NOTICE '🔗 Relación con ubicaciones de dev.dossin mediante idUbicacion';
    RAISE NOTICE '📋 Tabla OrdenTrabajo creada para gestión de órdenes de trabajo';
    RAISE NOTICE '🔗 Relación muchos a muchos entre PlaneacionLote y OrdenTrabajo';
    RAISE NOTICE '📝 IMPORTANTE: Ejecutar supabase-migrations.sql para cargar datos de cultivos';
    RAISE NOTICE '✅ NUEVO MODELO: Estructura con items separados por tipo (labor, insumo, costo)';
    RAISE NOTICE '🏗️ Clasificación "estructura" separada de "tierra" para mejor organización';
    RAISE NOTICE '📈 Índices GIN creados para optimizar consultas en campos JSONB';
    RAISE NOTICE '🔄 Triggers automáticos para actualización de timestamps';
    RAISE NOTICE '📋 Tabla OrdenTrabajo con transaccionId como PK para sincronización';
    RAISE NOTICE '🔄 Sistema de sincronización con control de estado';
END $$;

-- =====================================================
-- TABLA DE CONTROL DE SINCRONIZACIÓN
-- =====================================================

CREATE TABLE IF NOT EXISTS "SyncControl" (
    "id" SERIAL PRIMARY KEY,
    "entidad" VARCHAR(100) NOT NULL UNIQUE,
    "ultima_sincronizacion" TIMESTAMP WITH TIME ZONE,
    "ultima_fecha_consulta" TIMESTAMP WITH TIME ZONE, -- Para consultas incrementales
    "total_registros" INTEGER DEFAULT 0,
    "estado" VARCHAR(50) DEFAULT 'idle',
    "error_message" TEXT,
    "configuracion" JSONB DEFAULT '{}',
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para SyncControl
CREATE INDEX IF NOT EXISTS idx_sync_control_entidad ON "SyncControl"("entidad");
CREATE INDEX IF NOT EXISTS idx_sync_control_ultima_sync ON "SyncControl"("ultima_sincronizacion");

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_sync_control_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_sync_control_updated_at ON "SyncControl";
CREATE TRIGGER update_sync_control_updated_at 
    BEFORE UPDATE ON "SyncControl"
    FOR EACH ROW EXECUTE FUNCTION update_sync_control_updated_at();

-- Insertar configuración inicial para órdenes de trabajo
INSERT INTO "SyncControl" ("entidad", "configuracion") 
VALUES ('ordenes_trabajo', '{"maxAgeDays": 7, "historicalYears": 2, "incrementalSync": true}')
ON CONFLICT ("entidad") DO NOTHING;
