
-- =====================================================
-- MIGRACIÓN: CREAR TABLA DE CONTRATOS COMERCIALES
-- =====================================================

-- Tabla principal de contratos comerciales
CREATE TABLE IF NOT EXISTS "ContratosComerciales" (
    "id" SERIAL PRIMARY KEY,
    "numeroContrato" VARCHAR(50) UNIQUE NOT NULL, -- Número único del contrato
    "fechaContrato" DATE NOT NULL, -- Fecha de firma del contrato
    "fechaInicioEntrega" DATE NOT NULL, -- Fecha de inicio del período de entrega
    "fechaFinEntrega" DATE NOT NULL, -- Fecha límite de entrega
    
    -- Partes del contrato (referencias al backend de dossin)
    "productorId" INTEGER NOT NULL, -- FK al backend de dossin (productor)
    "productorNombre" VARCHAR(255) NOT NULL, -- Nombre del productor (cache local)
    "exportadorId" INTEGER NOT NULL, -- FK al backend de dossin (exportador)
    "exportadorNombre" VARCHAR(255) NOT NULL, -- Nombre del exportador (cache local)
    
    -- Detalles del grano
    "tipoGrano" INTEGER NOT NULL, -- FK a los cultivos (1-9 según sistema existente)
    "tipoGranoNombre" VARCHAR(100) NOT NULL, -- Cache del nombre del grano
    "calidad" VARCHAR(50), -- Calidad específica del grano (ej: "Primera", "Segunda")
    "humedadMaxima" DECIMAL(5,2), -- Humedad máxima permitida (%)
    "impurezasMaximas" DECIMAL(5,2), -- Impurezas máximas permitidas (%)
    
    -- Cantidades y precios
    "cantidadTotalKg" DECIMAL(15,2) NOT NULL, -- Cantidad total a entregar en kg
    "cantidadEntregadaKg" DECIMAL(15,2) DEFAULT 0, -- Cantidad ya entregada
    "precioPorKg" DECIMAL(10,4) NOT NULL, -- Precio por kg en la moneda base
    "moneda" VARCHAR(3) DEFAULT 'USD', -- Moneda del contrato
    
    -- Condiciones comerciales
    "condicionesPago" TEXT, -- Condiciones de pago (ej: "30 días", "Contado")
    "lugarEntrega" VARCHAR(255), -- Lugar específico de entrega
    "condicionesEntrega" TEXT, -- Condiciones específicas (ej: "FOB", "CIF")
    
    -- Estado y control
    "estado" VARCHAR(50) DEFAULT 'activo', -- activo, cumplido, cancelado, vencido
    "observaciones" TEXT, -- Observaciones adicionales
    
    -- Relación con cargas del backend (array de IDs)
    "cargasIds" INTEGER[], -- Array de IDs de cargas asociadas del backend dossin
    
    -- Metadatos
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "created_by" INTEGER, -- Usuario que creó el contrato
    "updated_by" INTEGER -- Usuario que lo modificó por última vez
);

-- =====================================================
-- ÍNDICES PARA OPTIMIZACIÓN DE CONTRATOS COMERCIALES
-- =====================================================

-- Índices para búsquedas frecuentes
CREATE INDEX IF NOT EXISTS idx_contratos_productor ON "ContratosComerciales"("productorId");
CREATE INDEX IF NOT EXISTS idx_contratos_exportador ON "ContratosComerciales"("exportadorId");
CREATE INDEX IF NOT EXISTS idx_contratos_tipo_grano ON "ContratosComerciales"("tipoGrano");
CREATE INDEX IF NOT EXISTS idx_contratos_estado ON "ContratosComerciales"("estado");
CREATE INDEX IF NOT EXISTS idx_contratos_fecha_entrega ON "ContratosComerciales"("fechaInicioEntrega", "fechaFinEntrega");
CREATE INDEX IF NOT EXISTS idx_contratos_numero ON "ContratosComerciales"("numeroContrato");
CREATE INDEX IF NOT EXISTS idx_contratos_fecha_contrato ON "ContratosComerciales"("fechaContrato");

-- Índice GIN para búsquedas en array de cargas
CREATE INDEX IF NOT EXISTS idx_contratos_cargas_ids ON "ContratosComerciales" USING GIN("cargasIds");

-- Índices compuestos para consultas complejas
CREATE INDEX IF NOT EXISTS idx_contratos_productor_estado ON "ContratosComerciales"("productorId", "estado");
CREATE INDEX IF NOT EXISTS idx_contratos_exportador_estado ON "ContratosComerciales"("exportadorId", "estado");
CREATE INDEX IF NOT EXISTS idx_contratos_grano_estado ON "ContratosComerciales"("tipoGrano", "estado");

-- =====================================================
-- TRIGGERS PARA CONTRATOS COMERCIALES
-- =====================================================

-- Trigger para actualizar updated_at automáticamente
DROP TRIGGER IF EXISTS update_contratos_comerciales_updated_at ON "ContratosComerciales";
CREATE TRIGGER update_contratos_comerciales_updated_at 
    BEFORE UPDATE ON "ContratosComerciales"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- VALIDACIONES Y RESTRICCIONES DE NEGOCIO
-- =====================================================

-- Función para validar fechas del contrato
CREATE OR REPLACE FUNCTION validate_contrato_fechas()
RETURNS TRIGGER AS $$
BEGIN
    -- Validar que fechaFinEntrega sea posterior a fechaInicioEntrega
    IF NEW."fechaFinEntrega" <= NEW."fechaInicioEntrega" THEN
        RAISE EXCEPTION 'La fecha de fin de entrega debe ser posterior a la fecha de inicio de entrega';
    END IF;
    
    -- Validación de sobreentrega:
    -- Permitimos que "cantidadEntregadaKg" exceda "cantidadTotalKg" cuando el contrato
    -- se está cerrando como 'cumplido'. Mientras el contrato esté activo, se mantiene la restricción.
    IF NEW."cantidadEntregadaKg" > NEW."cantidadTotalKg" AND NEW."estado" <> 'cumplido' THEN
        RAISE EXCEPTION 'La cantidad entregada no puede exceder la cantidad total del contrato a menos que el contrato esté "cumplido"';
    END IF;
    
    -- Validar que precioPorKg sea mayor a 0
    IF NEW."precioPorKg" <= 0 THEN
        RAISE EXCEPTION 'El precio por kg debe ser mayor a 0';
    END IF;
    
    -- Validar que cantidadTotalKg sea mayor a 0
    IF NEW."cantidadTotalKg" <= 0 THEN
        RAISE EXCEPTION 'La cantidad total debe ser mayor a 0';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar validaciones
DROP TRIGGER IF EXISTS validate_contrato_fechas_trigger ON "ContratosComerciales";
CREATE TRIGGER validate_contrato_fechas_trigger 
    BEFORE INSERT OR UPDATE ON "ContratosComerciales"
    FOR EACH ROW EXECUTE FUNCTION validate_contrato_fechas();

-- =====================================================
-- FUNCIONES AUXILIARES PARA CONTRATOS
-- =====================================================

-- Función para calcular el porcentaje de cumplimiento del contrato
CREATE OR REPLACE FUNCTION calcular_porcentaje_cumplimiento(contrato_id INTEGER)
RETURNS DECIMAL(5,2) AS $$
DECLARE
    total_kg DECIMAL(15,2);
    entregado_kg DECIMAL(15,2);
    porcentaje DECIMAL(5,2);
BEGIN
    SELECT "cantidadTotalKg", "cantidadEntregadaKg"
    INTO total_kg, entregado_kg
    FROM "ContratosComerciales"
    WHERE "id" = contrato_id;
    
    IF total_kg IS NULL OR total_kg = 0 THEN
        RETURN 0;
    END IF;
    
    porcentaje := (entregado_kg / total_kg) * 100;
    RETURN ROUND(porcentaje, 2);
END;
$$ LANGUAGE plpgsql;

-- Función para obtener contratos vencidos
CREATE OR REPLACE FUNCTION obtener_contratos_vencidos()
RETURNS TABLE(
    id INTEGER,
    numero_contrato VARCHAR(50),
    productor_nombre VARCHAR(255),
    exportador_nombre VARCHAR(255),
    fecha_fin_entrega DATE,
    dias_vencido INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c."id",
        c."numeroContrato",
        c."productorNombre",
        c."exportadorNombre",
        c."fechaFinEntrega",
        (CURRENT_DATE - c."fechaFinEntrega")::INTEGER as dias_vencido
    FROM "ContratosComerciales" c
    WHERE c."estado" = 'activo' 
    AND c."fechaFinEntrega" < CURRENT_DATE
    AND c."cantidadEntregadaKg" < c."cantidadTotalKg"
    ORDER BY c."fechaFinEntrega" ASC;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- DATOS INICIALES DE EJEMPLO (OPCIONAL)
-- =====================================================

-- Insertar algunos contratos de ejemplo para testing
INSERT INTO "ContratosComerciales" (
    "numeroContrato",
    "fechaContrato",
    "fechaInicioEntrega",
    "fechaFinEntrega",
    "productorId",
    "productorNombre",
    "exportadorId",
    "exportadorNombre",
    "tipoGrano",
    "tipoGranoNombre",
    "calidad",
    "humedadMaxima",
    "impurezasMaximas",
    "cantidadTotalKg",
    "cantidadEntregadaKg",
    "precioPorKg",
    "moneda",
    "condicionesPago",
    "lugarEntrega",
    "condicionesEntrega",
    "estado",
    "observaciones",
    "cargasIds"
) VALUES 
(
    'CC-2025-001',
    '2025-01-15',
    '2025-03-01',
    '2025-03-31',
    1001,
    'Productor Ejemplo S.A.',
    2001,
    'Exportador Global S.A.',
    1,
    'Soja de Primera',
    'Primera',
    13.5,
    2.0,
    100000.00,
    0.00,
    450.50,
    'USD',
    '30 días',
    'Puerto Rosario',
    'FOB',
    'activo',
    'Contrato de prueba para soja de primera',
    ARRAY[1001, 1002, 1003]
),
(
    'CC-2025-002',
    '2025-01-20',
    '2025-04-01',
    '2025-04-30',
    1002,
    'Campo Norte S.R.L.',
    2002,
    'Agroexport S.A.',
    3,
    'Maíz de Primera',
    'Primera',
    14.0,
    1.5,
    150000.00,
    25000.00,
    380.75,
    'USD',
    'Contado',
    'Planta Industrial',
    'CIF',
    'activo',
    'Contrato de maíz con entrega parcial',
    ARRAY[2001, 2002]
)
ON CONFLICT ("numeroContrato") DO NOTHING;

-- =====================================================
-- MENSAJE DE CONFIRMACIÓN
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '✅ TABLA CONTRATOS COMERCIALES CREADA EXITOSAMENTE';
    RAISE NOTICE '📊 Campos principales: número, fechas, partes, grano, cantidades, precios';
    RAISE NOTICE '🔗 Relación con cargas del backend mediante array de IDs';
    RAISE NOTICE '📈 Índices optimizados para consultas frecuentes';
    RAISE NOTICE '🔄 Triggers automáticos para validaciones y timestamps';
    RAISE NOTICE '⚡ Funciones auxiliares para cálculos y consultas';
    RAISE NOTICE '📋 Datos de ejemplo insertados para testing';
    RAISE NOTICE '🎯 Integración completa con sistema de cultivos existente (1-9)';
    RAISE NOTICE '💼 Soporte para múltiples monedas y condiciones comerciales';
END $$;



