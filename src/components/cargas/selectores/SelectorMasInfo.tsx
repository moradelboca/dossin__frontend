import { Box, TextField } from "@mui/material";
import { useState, useContext } from "react";
import { ContextoStepper } from "../creadores/CrearCargaStepper";
import { ContextoGeneral } from "../../Contexto";

export default function SelectorMasInfo() {
  const { datosNuevaCarga, setDatosNuevaCarga } = useContext(ContextoStepper);
  const { theme } = useContext(ContextoGeneral);
  const [focused, setFocused] = useState(false);

  // Actualizar descripción
  const handleDescripcionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDatosNuevaCarga((prev) => ({ ...prev, descripcion: e.target.value }));
  };

  // Actualizar tolerancia (asegurando que se guarde como número)
  const handleToleranciaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setDatosNuevaCarga((prev) => ({ ...prev, tolerancia: isNaN(value) ? 0 : value }));
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
    <Box display="flex" flexDirection="column" gap={2} width="800px">
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
        variant="outlined"
        type="number"
        value={datosNuevaCarga.tolerancia}
        onChange={handleToleranciaChange}
        fullWidth
        required
        helperText="Ingrese el valor de tolerancia para la carga"
        sx={azulStyles}
      />
    </Box>
  );
}