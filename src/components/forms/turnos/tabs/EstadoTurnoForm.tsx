import React, { useContext, useState, useEffect } from "react";
import { Autocomplete, TextField, useTheme, useMediaQuery, Box } from "@mui/material";
import { ContextoGeneral } from "../../../Contexto";
import MainButton from "../../../botones/MainButtom";

interface EstadoTurnoFormProps {
  turnoId: number;
  /** El estado actual del turno, por ejemplo: { id: 2, nombre: "Asignado" } */
  initialEstado: { id: number; nombre: string } | null;
  onSuccess: (updatedData: any) => void;
  onCancel: () => void;
}

const EstadoTurnoForm: React.FC<EstadoTurnoFormProps> = ({
  turnoId,
  initialEstado,
  onSuccess,
  onCancel,
}) => {
  const { backendURL } = useContext(ContextoGeneral);
  const [estados, setEstados] = useState<{ id: number; nombre: string }[]>([]);
  const [selectedEstado, setSelectedEstado] = useState<{ id: number; nombre: string } | null>(initialEstado);
  const [error, setError] = useState<string | null>(null);
  const {theme} = useContext(ContextoGeneral);
  
  const tema = useTheme();
  const isMobile = useMediaQuery(tema.breakpoints.down("sm"));

  useEffect(() => {
    fetch(`${backendURL}/turnos/estados`)
      .then(res => res.json())
      .then(data => {
        setEstados(data);
        // Si no hay estado seleccionado, seteo el primero
        if (!selectedEstado && data.length > 0) setSelectedEstado(data[0]);
      })
      .catch(() => setEstados([]));
  }, [backendURL]);

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
    <Box p={2}>
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
    </Box>
  );
};

export default EstadoTurnoForm;
