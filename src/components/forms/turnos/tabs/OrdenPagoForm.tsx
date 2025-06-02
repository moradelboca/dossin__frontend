import React, { useContext, useState } from "react";
import { TextField, Box, useTheme, useMediaQuery } from "@mui/material";
import { ContextoGeneral } from "../../../Contexto";
import MainButton from "../../../botones/MainButtom";

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
