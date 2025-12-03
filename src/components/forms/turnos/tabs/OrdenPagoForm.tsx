import React, { useContext, useState } from "react";
import { TextField, Box, useTheme, useMediaQuery } from "@mui/material";
import { ContextoGeneral } from "../../../Contexto";
import MainButton from "../../../botones/MainButtom";
import { axiosPut } from "../../../../lib/axiosConfig";

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
  
    const tema = useTheme();
    const isMobile = useMediaQuery(tema.breakpoints.down("sm"));

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value.replace(/\D/g, ''); // Solo números
    if (value.length <= 5) {
      setNumeroOrdenPago(value === '' ? null : Number(value));
    }
  };

  const handleSubmit = async () => {
    if (!numeroOrdenPago) {
      setError("El número de orden de pago es obligatorio.");
      return;
    }

    try {
      const updatedData = await axiosPut(`turnos/${turnoId}`, { numeroOrdenPago }, backendURL);
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
        inputProps={{ maxLength: 5, inputMode: 'numeric', pattern: '[0-9]*' }}
        sx={{
          '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: theme.colores.azul,
          },
          '& .MuiInputLabel-root.Mui-focused': {
            color: theme.colores.azul,
          },
        }}
      />
      <Box
        sx={{
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          gap: 1,
          justifyContent: "center",
          alignItems: "center",
          position: 'relative',
          mt: 2
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
          text='Actualizar'
          backgroundColor={theme.colores.azul}
          textColor="#fff"
          width={isMobile ? '100%' : 'auto'}
          borderRadius="8px"
          hoverBackgroundColor={theme.colores.azulOscuro}
          divWidth={isMobile ? '100%' : 'auto'}
        />
      </Box>
    </div>
  );
};

export default OrdenPagoForm;
