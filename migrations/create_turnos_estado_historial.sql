-- Create turnos_estado_historial table
CREATE TABLE IF NOT EXISTS public.turnos_estado_historial (
  id BIGSERIAL PRIMARY KEY,
  turno_id TEXT NOT NULL,
  estado_anterior_id INTEGER,
  estado_nuevo_id INTEGER NOT NULL,
  fecha_cambio TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  usuario_id INTEGER,
  observaciones TEXT
);

-- Create indexes for performance
CREATE INDEX idx_turnos_estado_historial_turno_id ON public.turnos_estado_historial(turno_id);
CREATE INDEX idx_turnos_estado_historial_fecha_cambio ON public.turnos_estado_historial(fecha_cambio);
CREATE INDEX idx_turnos_estado_historial_turno_fecha ON public.turnos_estado_historial(turno_id, fecha_cambio);

-- Add RLS policies
ALTER TABLE public.turnos_estado_historial ENABLE ROW LEVEL SECURITY;

-- Allow public access to read (for public key usage)
CREATE POLICY "Allow public read turnos_estado_historial"
  ON public.turnos_estado_historial
  FOR SELECT
  USING (true);

-- Allow public access to insert (for public key usage)
CREATE POLICY "Allow public insert turnos_estado_historial"
  ON public.turnos_estado_historial
  FOR INSERT
  WITH CHECK (true);

-- Allow public access to update (for corrections if needed)
CREATE POLICY "Allow public update turnos_estado_historial"
  ON public.turnos_estado_historial
  FOR UPDATE
  USING (true);

-- Allow public access to delete (for cleanup if needed)
CREATE POLICY "Allow public delete turnos_estado_historial"
  ON public.turnos_estado_historial
  FOR DELETE
  USING (true);

