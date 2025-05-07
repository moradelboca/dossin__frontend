import React, { useContext, useState } from "react";
import { Box, TextField, useTheme, useMediaQuery } from "@mui/material";
import { ContextoGeneral } from "../../../Contexto";
import MainButton from "../../../botones/MainButtom";

interface PesajeFormProps {
  turnoId: number;
  initialData?: {
    kgCargados?: number;
    kgDescargados?: number;
    precioPorKilogramo?: number;
  };
  onSuccess: (updatedData: any) => void;
  onCancel: () => void;
}

const PesajeForm: React.FC<PesajeFormProps> = ({
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
  const [precioPorKilogramo, setPrecioPorKilogramo] = useState<number | string>(
    initialData?.precioPorKilogramo ?? ""
  );
  
  const [errors, setErrors] = useState<{ [key: string]: string | null }>({});
  const {theme} = useContext(ContextoGeneral);

  const tema = useTheme();
  const isMobile = useMediaQuery(tema.breakpoints.down("sm"));

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
    if (precioPorKilogramo === "" || isNaN(Number(precioPorKilogramo))) {
      newErrors.precioPorKilogramo =
        "Precio por kg es obligatorio y debe ser un número";
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
        precioGrano: Number(precioPorKilogramo),
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
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
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
        label="Precio Por Kilogramo"
        name="precioPorKilogramo"
        variant="outlined"
        fullWidth
        value={precioPorKilogramo}
        onChange={(e) => handleInputChange(e, setPrecioPorKilogramo)}
        error={!!errors.precioPorKilogramo}
        helperText={errors.precioPorKilogramo}
        inputProps={{ inputMode: 'numeric', pattern: '[0-9]*', min: 0 }}
      />
      <Box
              sx={{
                display: "flex",
                flexDirection: isMobile ? "column" : "row",
                gap: 1,
                justifyContent: "flex-end",
                alignItems: "center",
                position: 'relative',
                mt: 1,
              }}
            >
        <MainButton
          onClick={onCancel}
          text="Cancelar"
          backgroundColor="transparent"
          textColor={theme.colores.azul}
          width={isMobile ? '100%' : 'auto'}
          borderRadius="8px"
          hoverBackgroundColor="rgba(22, 54, 96, 0.1)"
          divWidth={isMobile ? '100%' : 'auto'}
        />

        <MainButton
          onClick={handleSubmit}
          text='Guardar'
          backgroundColor={theme.colores.azul}
          textColor="#fff"
          width={isMobile ? '100%' : 'auto'}
          borderRadius="8px"
          hoverBackgroundColor={theme.colores.azulOscuro}
          divWidth={isMobile ? '100%' : 'auto'}
        />
      </Box>
    </Box>
  );
};

export default PesajeForm;
