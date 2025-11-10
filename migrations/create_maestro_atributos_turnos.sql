-- Create maestro_atributos_turnos table
CREATE TABLE IF NOT EXISTS public.maestro_atributos_turnos (
  id SERIAL PRIMARY KEY,
  nombre_atributo TEXT NOT NULL UNIQUE,
  tipo_dato TEXT NOT NULL CHECK (tipo_dato IN ('text', 'number', 'date')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE public.maestro_atributos_turnos ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read
CREATE POLICY "Allow authenticated users to read maestro_atributos_turnos"
  ON public.maestro_atributos_turnos
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users to insert
CREATE POLICY "Allow authenticated users to insert maestro_atributos_turnos"
  ON public.maestro_atributos_turnos
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow authenticated users to update
CREATE POLICY "Allow authenticated users to update maestro_atributos_turnos"
  ON public.maestro_atributos_turnos
  FOR UPDATE
  TO authenticated
  USING (true);

-- Allow authenticated users to delete
CREATE POLICY "Allow authenticated users to delete maestro_atributos_turnos"
  ON public.maestro_atributos_turnos
  FOR DELETE
  TO authenticated
  USING (true);

-- Create index on nombre_atributo
CREATE INDEX idx_maestro_atributos_nombre ON public.maestro_atributos_turnos(nombre_atributo);

