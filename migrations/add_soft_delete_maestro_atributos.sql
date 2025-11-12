-- Add soft delete support to maestro_atributos_turnos
-- This migration adds a deleted_at column to enable logical deletion
-- instead of physical deletion, preserving historical data

-- Add deleted_at column
ALTER TABLE public.maestro_atributos_turnos 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE NULL;

-- Create partial index for efficient filtering of active attributes
CREATE INDEX IF NOT EXISTS idx_maestro_atributos_deleted_at 
ON public.maestro_atributos_turnos(deleted_at) 
WHERE deleted_at IS NULL;

-- Add comment to document the column purpose
COMMENT ON COLUMN public.maestro_atributos_turnos.deleted_at IS 
'Timestamp when the attribute was logically deleted. NULL means the attribute is active.';

