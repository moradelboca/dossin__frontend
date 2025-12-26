-- Migración para agregar tipo 'remito' a turnos_fotos
-- Permite almacenar fotos de remitos además de tara y bruto

-- Eliminar el constraint existente
ALTER TABLE public.turnos_fotos 
DROP CONSTRAINT IF EXISTS turnos_fotos_tipo_foto_check;

-- Agregar el nuevo constraint que incluye 'remito'
ALTER TABLE public.turnos_fotos 
ADD CONSTRAINT turnos_fotos_tipo_foto_check 
CHECK (tipo_foto IN ('tara', 'bruto', 'remito'));




