-- Create datos_extra_turnos table
CREATE TABLE IF NOT EXISTS public.datos_extra_turnos (
  id SERIAL PRIMARY KEY,
  turno_id INTEGER NOT NULL,
  ctg TEXT,
  empresa_titular_carta_de_porte TEXT,
  datos JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(turno_id)
);

-- Add RLS policies
ALTER TABLE public.datos_extra_turnos ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read
CREATE POLICY "Allow authenticated users to read datos_extra_turnos"
  ON public.datos_extra_turnos
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users to insert
CREATE POLICY "Allow authenticated users to insert datos_extra_turnos"
  ON public.datos_extra_turnos
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow authenticated users to update
CREATE POLICY "Allow authenticated users to update datos_extra_turnos"
  ON public.datos_extra_turnos
  FOR UPDATE
  TO authenticated
  USING (true);

-- Allow authenticated users to delete
CREATE POLICY "Allow authenticated users to delete datos_extra_turnos"
  ON public.datos_extra_turnos
  FOR DELETE
  TO authenticated
  USING (true);

-- Create indexes
CREATE INDEX idx_datos_extra_turno_id ON public.datos_extra_turnos(turno_id);
CREATE INDEX idx_datos_extra_ctg ON public.datos_extra_turnos(ctg);
CREATE INDEX idx_datos_extra_datos ON public.datos_extra_turnos USING GIN (datos);

-- Create trigger to update updated_at
CREATE OR REPLACE FUNCTION update_datos_extra_turnos_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_datos_extra_turnos_updated_at
  BEFORE UPDATE ON public.datos_extra_turnos
  FOR EACH ROW
  EXECUTE FUNCTION update_datos_extra_turnos_updated_at();

