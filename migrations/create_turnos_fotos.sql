-- Create turnos_fotos table
CREATE TABLE IF NOT EXISTS public.turnos_fotos (
  id SERIAL PRIMARY KEY,
  turno_id TEXT NOT NULL,
  tipo_foto TEXT NOT NULL CHECK (tipo_foto IN ('tara', 'bruto')),
  path TEXT NOT NULL,
  url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(turno_id, tipo_foto) -- Solo una foto por tipo por turno
);

-- Create indexes for performance
CREATE INDEX idx_turnos_fotos_turno_id ON public.turnos_fotos(turno_id);
CREATE INDEX idx_turnos_fotos_tipo ON public.turnos_fotos(tipo_foto);

-- Add RLS policies
ALTER TABLE public.turnos_fotos ENABLE ROW LEVEL SECURITY;

-- Allow public access to read (for public key usage)
CREATE POLICY "Allow public read turnos_fotos"
  ON public.turnos_fotos
  FOR SELECT
  USING (true);

-- Allow public access to insert (for public key usage)
CREATE POLICY "Allow public insert turnos_fotos"
  ON public.turnos_fotos
  FOR INSERT
  WITH CHECK (true);

-- Allow public access to update (for corrections if needed)
CREATE POLICY "Allow public update turnos_fotos"
  ON public.turnos_fotos
  FOR UPDATE
  USING (true);

-- Allow public access to delete (for cleanup if needed)
CREATE POLICY "Allow public delete turnos_fotos"
  ON public.turnos_fotos
  FOR DELETE
  USING (true);

-- Create trigger to update updated_at
CREATE OR REPLACE FUNCTION update_turnos_fotos_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_turnos_fotos_updated_at
  BEFORE UPDATE ON public.turnos_fotos
  FOR EACH ROW
  EXECUTE FUNCTION update_turnos_fotos_updated_at();

