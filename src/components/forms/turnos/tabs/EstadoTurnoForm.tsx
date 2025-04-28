import React, { useContext, useState } from "react";
import { Autocomplete, TextField, Button, Stack } from "@mui/material";
import { ContextoGeneral } from "../../../Contexto";

interface EstadoTurnoFormProps {
  turnoId: number;
  /** El estado actual del turno, por ejemplo: { id: 2, nombre: "Asignado" } */
  initialEstado: { id: number; nombre: string } | null;
  onSuccess: (updatedData: any) => void;
  onCancel: () => void;
}

// Definimos la lista de estados disponibles (basada en los INSERT que proporcionaste)
const estados = [
  { id: 1, nombre: "ConErrores" },
  { id: 2, nombre: "Asignado" },
  { id: 3, nombre: "Confirmado" },
  { id: 4, nombre: "Finalizado" },
  { id: 8, nombre: "Cargando" },
  { id: 9, nombre: "Descargando" },
  { id: 10, nombre: "Rechazado" },
];

const EstadoTurnoForm: React.FC<EstadoTurnoFormProps> = ({
  turnoId,
  initialEstado,
  onSuccess,
  onCancel,
}) => {
  const { backendURL } = useContext(ContextoGeneral);
  // Si no hay estado inicial se toma el primero de la lista
  const [selectedEstado, setSelectedEstado] = useState(initialEstado || estados[0]);
  const [error, setError] = useState<string | null>(null);
  const {theme} = useContext(ContextoGeneral);

  const handleSubmit = async () => {
    if (!selectedEstado) {
      setError("Debe seleccionar un estado.");
      return;
    }

    try {
      const url = `${backendURL}/turnos/${turnoId}`;
      const payload = {
        idEstado: selectedEstado.id,
      };
      const response = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error(await response.text());
      const updatedData = await response.json();
      onSuccess(updatedData);
    } catch (err: any) {
      console.error(`Error: ${err.message}`);
    }
  };

  return (
    <div>
      <Autocomplete
        options={estados}
        getOptionLabel={(option) => option.nombre}
        value={selectedEstado}
        onChange={(_event, newValue) => {
          if (newValue) {
            setSelectedEstado(newValue);
            setError(null);
          }
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Estado"
            variant="outlined"
            error={!!error}
            helperText={error}
          />
        )}
      />
      <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ marginTop: 2 }}>
        <Button color="error" onClick={onCancel}>
          Cancelar
        </Button>
        <Button sx={{color: theme.colores.azul}} onClick={handleSubmit}>
          Guardar Estado
        </Button>
      </Stack>
    </div>
  );
};

export default EstadoTurnoForm;
