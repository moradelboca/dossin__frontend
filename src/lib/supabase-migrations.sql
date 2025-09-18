-- Migración para crear tabla OrdenTrabajo y su relación con PlaneacionLote

-- 1. Crear tabla OrdenTrabajo
CREATE TABLE IF NOT EXISTS "OrdenTrabajo" (
    "id" SERIAL PRIMARY KEY,
    "establecimiento" VARCHAR(255),
    "estado" VARCHAR(100),
    "fecha" DATE,
    "laboreo" VARCHAR(255),
    "laboreoId" INTEGER,
    "transaccionId" INTEGER,
    "datos" JSONB,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Crear tabla de relación entre PlaneacionLote y OrdenTrabajo
-- Esto permite que múltiples órdenes de trabajo se asocien con un lote
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
        REFERENCES "OrdenTrabajo"("id") 
        ON DELETE CASCADE,
    UNIQUE("planeacionLote_campania", "planeacionLote_idLote", "ordenTrabajo_id")
);

-- 3. Agregar campo opcional en PlaneacionLote para referenciar órdenes de trabajo
-- Esto permite asociar elementos específicos de la estructura con órdenes de trabajo
ALTER TABLE "PlaneacionLote" 
ADD COLUMN IF NOT EXISTS "ordenTrabajo_id" INTEGER REFERENCES "OrdenTrabajo"("id") ON DELETE SET NULL;

-- 4. Crear índices para optimizar consultas
CREATE INDEX IF NOT EXISTS "idx_orden_trabajo_transaccion_id" ON "OrdenTrabajo"("transaccionId");
CREATE INDEX IF NOT EXISTS "idx_orden_trabajo_laboreo_id" ON "OrdenTrabajo"("laboreoId");
CREATE INDEX IF NOT EXISTS "idx_orden_trabajo_estado" ON "OrdenTrabajo"("estado");
CREATE INDEX IF NOT EXISTS "idx_orden_trabajo_fecha" ON "OrdenTrabajo"("fecha");
CREATE INDEX IF NOT EXISTS "idx_orden_trabajo_datos" ON "OrdenTrabajo" USING GIN("datos");

-- 5. Crear función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 6. Crear trigger para actualizar updated_at en OrdenTrabajo
CREATE TRIGGER update_orden_trabajo_updated_at 
    BEFORE UPDATE ON "OrdenTrabajo" 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 7. Comentarios para documentar la estructura
COMMENT ON TABLE "OrdenTrabajo" IS 'Tabla para almacenar órdenes de trabajo con datos estructurados en JSONB';
COMMENT ON COLUMN "OrdenTrabajo"."datos" IS 'Campo JSONB para almacenar información adicional de la orden de trabajo';
COMMENT ON TABLE "PlaneacionLoteOrdenTrabajo" IS 'Tabla de relación muchos a muchos entre PlaneacionLote y OrdenTrabajo';
COMMENT ON COLUMN "PlaneacionLote"."ordenTrabajo_id" IS 'Referencia opcional a una orden de trabajo principal para el lote';
