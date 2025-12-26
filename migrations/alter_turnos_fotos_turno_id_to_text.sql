-- Migración para cambiar turno_id de INTEGER a TEXT en turnos_fotos
-- Ejecutar este script si la tabla ya existe con turno_id como INTEGER

-- Cambiar tipo de columna de INTEGER a TEXT
ALTER TABLE public.turnos_fotos 
ALTER COLUMN turno_id TYPE TEXT USING turno_id::TEXT;

-- Nota: Si hay datos existentes con valores numéricos, estos se convertirán a texto
-- Si no hay datos, simplemente cambiará el tipo de columna




