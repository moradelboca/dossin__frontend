import React, { useContext, useState } from "react";
import { Box, TextField, Typography, useTheme, useMediaQuery } from "@mui/material";
import { ContextoGeneral } from "../../../Contexto";
import MainButton from "../../../botones/MainButtom";
import { MedicionesCalidadForm } from "./MedicionesCalidadForm";
import { createMedicionesLote } from "../../../../lib/parametros-calidad-api";

interface PesajeFormProps {
  turnoId: number;
  initialData?: {
    kgDescargados?: number;
    precioGrano?: number;
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
  const { theme, backendURL } = useContext(ContextoGeneral);
  const [kgDescargados, setKgDescargados] = useState<number | string>(
    initialData?.kgDescargados ?? ""
  );
  const [precioGrano, setPrecioGrano] = useState<number | string>(
    initialData?.precioGrano ?? ""
  );
  const [errors, setErrors] = useState<{ [key: string]: string | null }>({});
  const [mediciones, setMediciones] = useState<Record<number, number | ''>>({});

  const tema = useTheme();
  const isMobile = useMediaQuery(tema.breakpoints.down("sm"));

  const validate = () => {
    const newErrors: { [key: string]: string | null } = {};
    if (kgDescargados === "" || isNaN(Number(kgDescargados))) {
      newErrors.kgDescargados =
        "Kilogramos descargados es obligatorio y debe ser un número";
    }
    if (precioGrano === "" || isNaN(Number(precioGrano))) {
      newErrors.precioGrano =
        "Precio del grano es obligatorio y debe ser un número";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      return;
    }
    try {
      const payload = {
        kgDescargados: Number(kgDescargados),
        precioGrano: Number(precioGrano) / 1000, // Convertir de precio por tonelada a precio por kg
      };
      const url = `${backendURL}/turnos/${turnoId}`;
      const response = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error(await response.text());
      const updatedData = await response.json();

      // Guardar mediciones de calidad si hay alguna
      const medicionesValidas = Object.entries(mediciones)
        .filter(([_, valor]) => valor !== '' && valor !== null && valor !== undefined)
        .map(([idParametro, valorMedido]) => ({
          idParametroCalidad: Number(idParametro),
          valorMedido: Number(valorMedido),
        }));

      if (medicionesValidas.length > 0) {
        try {
          await createMedicionesLote(turnoId.toString(), {
            etapaMedicion: 'descarga',
            mediciones: medicionesValidas,
          });
        } catch (error) {
          console.error("Error al guardar mediciones de calidad:", error);
          // No bloqueamos el flujo si falla guardar las mediciones
        }
      }

      onSuccess(updatedData);
    } catch (error: any) {
      console.error(`Error: ${error.message}`);
    }
  };
  // Estilos para el borde azul al enfocar
  const azulStyles = {
    '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: theme.colores.azul,
    },
    '& .MuiInputLabel-root.Mui-focused': {
      color: theme.colores.azul,
    },
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <TextField
        margin="dense"
        label="Kilogramos Descargados"
        name="kgDescargados"
        variant="outlined"
        fullWidth
        value={kgDescargados}
        onChange={(e) => {
          const value = e.target.value;
          if (/^\d{0,5}$/.test(value)) {
            setKgDescargados(value);
          }
        }}
        error={!!errors.kgDescargados}
        helperText={errors.kgDescargados}
        inputProps={{ inputMode: 'numeric', pattern: '[0-9]*', min: 0, maxLength: 5 }}
        sx={{ ...azulStyles, mt: 2 }}
      />
      <TextField
        margin="dense"
        label="Precio del Grano"
        name="precioGrano"
        variant="outlined"
        fullWidth
        value={precioGrano}
        onChange={(e) => {
          const value = e.target.value;
          if (/^\d{0,7}(\.\d{0,2})?$/.test(value)) {
            setPrecioGrano(value);
          }
        }}
        error={!!errors.precioGrano}
        helperText={errors.precioGrano}
        inputProps={{ inputMode: 'decimal', pattern: '[0-9]*' }}
        sx={azulStyles}
      />
      {/* ADVERTENCIA: precio por tonelada debajo y en gris */}
      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, ml: 0.5 }}>
        Ingrese el precio del grano por tonelada. El sistema lo convertirá automáticamente a precio por kg.
      </Typography>

      <MedicionesCalidadForm
        etapaMedicion="descarga"
        mediciones={mediciones}
        onMedicionesChange={setMediciones}
        errors={Object.fromEntries(
          Object.entries(errors).map(([key, value]) => [key, value ?? ''])
        )}
      />

      <Box
        sx={{
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          gap: 1,
          justifyContent: "center",
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
