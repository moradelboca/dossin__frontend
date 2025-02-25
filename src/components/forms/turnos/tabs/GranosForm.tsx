import React, { useContext, useState } from "react";
import { Box, Button, TextField, Stack } from "@mui/material";
import { ContextoGeneral } from "../../../Contexto";

interface GranosFormProps {
  turnoId: number;
  initialData?: {
    kgCargados?: number;
    kgDescargados?: number;
    precioGrano?: number;
  };
  onSuccess: (updatedData: any) => void;
  onCancel: () => void;
}

const GranosForm: React.FC<GranosFormProps> = ({
  turnoId,
  initialData,
  onSuccess,
  onCancel,
}) => {
  const { backendURL } = useContext(ContextoGeneral);
  const [kgCargados, setKgCargados] = useState<number | string>(
    initialData?.kgCargados ?? ""
  );
  const [kgDescargados, setKgDescargados] = useState<number | string>(
    initialData?.kgDescargados ?? ""
  );
  const [precioGrano, setPrecioGrano] = useState<number | string>(
    initialData?.precioGrano ?? ""
  );
  const [errors, setErrors] = useState<{ [key: string]: string | null }>({});

  const validate = () => {
    const newErrors: { [key: string]: string | null } = {};

    if (kgCargados === "" || isNaN(Number(kgCargados))) {
      newErrors.kgCargados =
        "Kilogramos cargados es obligatorio y debe ser un número";
    }
    if (kgDescargados === "" || isNaN(Number(kgDescargados))) {
      newErrors.kgDescargados =
        "Kilogramos descargados es obligatorio y debe ser un número";
    }
    if (precioGrano === "" || isNaN(Number(precioGrano))) {
      newErrors.precioGrano =
        "Precio grano es obligatorio y debe ser un número";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      console.log("Errores en la validación", errors);
      return;
    }
    try {
      const payload = {
        kgCargados: Number(kgCargados),
        kgDescargados: Number(kgDescargados),
        precioGrano: Number(precioGrano),
      };

      const url = `${backendURL}/turnos/${turnoId}`;
      const response = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error(await response.text());
      const updatedData = await response.json();
      onSuccess(updatedData);
    } catch (error: any) {
      console.error(`Error: ${error.message}`);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    setter: React.Dispatch<React.SetStateAction<number | string>>
  ) => {
    const value = e.target.value;
    if (/^\d*\.?\d*$/.test(value)) {
      setter(value);
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <TextField
        margin="dense"
        label="Kilogramos Cargados"
        name="kgCargados"
        variant="outlined"
        fullWidth
        value={kgCargados}
        onChange={(e) => handleInputChange(e, setKgCargados)}
        error={!!errors.kgCargados}
        helperText={errors.kgCargados}
        inputProps={{ inputMode: 'numeric', pattern: '[0-9]*', min: 0 }}
      />
      <TextField
        margin="dense"
        label="Kilogramos Descargados"
        name="kgDescargados"
        variant="outlined"
        fullWidth
        value={kgDescargados}
        onChange={(e) => handleInputChange(e, setKgDescargados)}
        error={!!errors.kgDescargados}
        helperText={errors.kgDescargados}
        inputProps={{ inputMode: 'numeric', pattern: '[0-9]*', min: 0 }} // Mismo cambio para evitar flechitas y negativos
      />
      <TextField
        margin="dense"
        label="Precio Grano"
        name="precioGrano"
        variant="outlined"
        fullWidth
        value={precioGrano}
        onChange={(e) => handleInputChange(e, setPrecioGrano)}
        error={!!errors.precioGrano}
        helperText={errors.precioGrano}
        inputProps={{ inputMode: 'numeric', pattern: '[0-9]*', min: 0 }} // Igual para precio grano
      />
      <Stack
        direction="row"
        spacing={2}
        justifyContent="flex-end"
        sx={{ marginTop: 2 }}
      >
        <Button color="secondary" onClick={onCancel}>
          Cancelar
        </Button>
        <Button color="primary" onClick={handleSubmit}>
          Guardar Granos
        </Button>
      </Stack>
    </Box>
  );
};

export default GranosForm;
