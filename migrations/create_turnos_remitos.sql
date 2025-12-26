-- Create turnos_remitos table
CREATE TABLE IF NOT EXISTS public.turnos_remitos (
  id SERIAL PRIMARY KEY,
  turno_id TEXT NOT NULL,
  id_remito TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(turno_id) -- Solo un remito por turno
);

-- Create indexes for performance
CREATE INDEX idx_turnos_remitos_turno_id ON public.turnos_remitos(turno_id);
CREATE INDEX idx_turnos_remitos_id_remito ON public.turnos_remitos(id_remito);

-- Add RLS policies
ALTER TABLE public.turnos_remitos ENABLE ROW LEVEL SECURITY;

-- Allow public access to read (for public key usage)
CREATE POLICY "Allow public read turnos_remitos"
  ON public.turnos_remitos
  FOR SELECT
  USING (true);

-- Allow public access to insert (for public key usage)
CREATE POLICY "Allow public insert turnos_remitos"
  ON public.turnos_remitos
  FOR INSERT
  WITH CHECK (true);

-- Allow public access to update (for corrections if needed)
CREATE POLICY "Allow public update turnos_remitos"
  ON public.turnos_remitos
  FOR UPDATE
  USING (true);

-- Allow public access to delete (for cleanup if needed)
CREATE POLICY "Allow public delete turnos_remitos"
  ON public.turnos_remitos
  FOR DELETE
  USING (true);

-- Create trigger to update updated_at
CREATE OR REPLACE FUNCTION update_turnos_remitos_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_turnos_remitos_updated_at
  BEFORE UPDATE ON public.turnos_remitos
  FOR EACH ROW
  EXECUTE FUNCTION update_turnos_remitos_updated_at();




