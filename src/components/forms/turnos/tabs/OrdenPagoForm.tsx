import React, { useContext, useState } from "react";
import { Button, TextField, Stack } from "@mui/material";
import { ContextoGeneral } from "../../../Contexto";

interface OrdenPagoFormProps {
  turnoId: number;
  initialData: any;
  onSuccess: (updatedData: any) => void;
  onCancel: () => void;
}

const OrdenPagoForm: React.FC<OrdenPagoFormProps> = ({ turnoId, initialData, onSuccess, onCancel }) => {
  const [numeroOrdenPago, setNumeroOrdenPago] = useState<number | null>(initialData || null);
  const [error, setError] = useState<string | null>(null);
  const {theme} = useContext(ContextoGeneral);
  const { backendURL } = useContext(ContextoGeneral);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNumeroOrdenPago(Number(event.target.value));
  };

  const handleSubmit = async () => {
    if (!numeroOrdenPago) {
      setError("El número de orden de pago es obligatorio.");
      return;
    }

    try {
      const url = `${backendURL}/turnos/${turnoId}`;
      const response = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ numeroOrdenPago }),
      });

      if (!response.ok) throw new Error(await response.text());
      const updatedData = await response.json();
      onSuccess(updatedData);
    } catch (error: any) {
      console.error(`Error: ${error.message}`);
    }
  };

  return (
    <div>
      <TextField
        margin="dense"
        label="Número de Orden de Pago"
        name="numeroOrdenPago"
        variant="outlined"
        fullWidth
        value={numeroOrdenPago || ""}
        onChange={handleChange}
        error={!!error}
        helperText={error}
      />
      <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ marginTop: 2 }}>
        <Button color="error" onClick={onCancel}>
          Cancelar
        </Button>
        <Button sx={{color: theme.colores.azul }} onClick={handleSubmit}>
          Guardar Número de Orden de Pago
        </Button>
      </Stack>
    </div>
  );
};

export default OrdenPagoForm;
