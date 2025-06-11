import { Box, TextField } from "@mui/material";
import { useState, useContext } from "react";
import { ContextoStepper } from "../creadores/CrearCargaStepper";
import { ContextoGeneral } from "../../Contexto";
import { PatternFormat } from "react-number-format";
import React from "react";
import { CustomProps } from "../../../interfaces/CustomProps";

// Definir el inputComponent fuera del componente principal
const ToleranciaInput = React.forwardRef<any, CustomProps>(
  function ToleranciaInput(props, ref) {
    const { onChange, ...other } = props;
    return (
      <PatternFormat
        {...other}
        getInputRef={ref}
        format="####"
        mask=""
        onValueChange={(values) => {
          if (Number(values.value) < 0) {
            return;
          }
          onChange({
            target: {
              name: props.name,
              value: values.value,
            },
          });
        }}
      />
    );
  }
);

export default function SelectorMasInfo() {
  const { datosNuevaCarga, setDatosNuevaCarga } = useContext(ContextoStepper);
  const { theme } = useContext(ContextoGeneral);
  const [focused, setFocused] = useState(false);

  // Actualizar descripción
  const handleDescripcionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDatosNuevaCarga((prev) => ({ ...prev, descripcion: e.target.value }));
  };

  // Actualizar tolerancia (permitir vacío y no mostrar 0 por defecto, pero mantener tipo number)
  const handleToleranciaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDatosNuevaCarga((prev) => ({
      ...prev,
      tolerancia: value === '' ? undefined : parseFloat(value)
    }));
  };

  const handlePlantaRucaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDatosNuevaCarga((prev) => ({ 
      ...prev, 
      plantaProcedenciaRuca: e.target.value 
    }));
  };

  const handleDestinoRucaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDatosNuevaCarga((prev) => ({ 
      ...prev, 
      destinoRuca: e.target.value 
    }));
  };

  const azulStyles = {
    '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: theme.colores.azul,
    },
    '& .MuiInputLabel-root.Mui-focused': {
      color: theme.colores.azul,
    },
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        width: '100%',
        maxWidth: { xs: '95vw', sm: 600, md: 800 },
        mx: 'auto',
        px: { xs: 1, sm: 2 },
      }}
    >
      {/* Sección Descripción */}
      <Box>
        <strong>Descripción</strong>
      </Box>
      <TextField
        label="Ingresar máximo 100 caracteres"
        variant="outlined"
        inputProps={{ maxLength: 100 }}
        multiline
        value={datosNuevaCarga.descripcion || ""}
        rows={focused ? 4 : 1}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onChange={handleDescripcionChange}
        fullWidth
        required
        sx={azulStyles}
      />
      
      {/* Nuevos Campos */}
      <TextField
        label="Planta Procedencia RUCA"
        variant="outlined"
        value={datosNuevaCarga.plantaProcedenciaRuca || ""}
        onChange={handlePlantaRucaChange}
        fullWidth
        required
        sx={azulStyles}
      />
      
      <TextField
        label="Destino RUCA"
        variant="outlined"
        value={datosNuevaCarga.destinoRuca || ""}
        onChange={handleDestinoRucaChange}
        fullWidth
        required
        sx={azulStyles}
      />

      {/* Campo Tolerancia */}
      <TextField
        label="Tolerancia"
        value={datosNuevaCarga.tolerancia === undefined || datosNuevaCarga.tolerancia === 0 ? '' : datosNuevaCarga.tolerancia}
        onChange={handleToleranciaChange}
        name="numberformat"
        id="formatted-numberformat-input"
        slotProps={{
          input: {
            inputComponent: ToleranciaInput as any,
          },
        }}
        variant="outlined"
        sx={{
          width: { xs: '100%', sm: 220, md: 300 },
          '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#163660',
          },
          '& .MuiInputLabel-root.Mui-focused': {
            color: '#163660',
          },
        }}
      />
      
    </Box>
  );
}