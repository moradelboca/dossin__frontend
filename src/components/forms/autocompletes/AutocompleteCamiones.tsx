import React, { useContext, useEffect, useState } from 'react';
import { Autocomplete, TextField } from '@mui/material';
import { ContextoGeneral } from '../../Contexto';

interface Camion {
  patente: string;
  // Otros campos si son necesarios...
}

interface AutocompleteCamionesProps {
  value: string | null; // Se espera que sea la patente del camión
  onChange: (value: string | null) => void;
  error?: boolean;
  helperText?: string | null;
}

const AutocompleteCamiones: React.FC<AutocompleteCamionesProps> = ({
  value,
  onChange,
  error = false,
  helperText = '',
}) => {
  const { backendURL } = useContext(ContextoGeneral);
  const [camiones, setCamiones] = useState<Camion[]>([]);
  const [localError, setLocalError] = useState<boolean>(false);

  useEffect(() => {
    fetch(`${backendURL}/camiones`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
      },
    })
      .then(response => response.json())
      .then((data: Camion[]) => setCamiones(data))
      .catch(err => console.error('Error al obtener los camiones', err));
  }, [backendURL]);

  useEffect(() => {
    if (value && camiones.length > 0) {
      const found = camiones.some(c => c.patente === value);
      setLocalError(!found);
    }
  }, [value, camiones]);

  return (
    <Autocomplete
      disablePortal
      options={camiones}
      getOptionLabel={(option: Camion) => option.patente}
      value={camiones.find(c => c.patente === value) || null}
      onChange={(_, newValue) => onChange(newValue ? newValue.patente : null)}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Patente Camión"
          variant="outlined"
          error={error || localError}
          helperText={helperText || (localError ? "La patente ingresada no coincide con las disponibles" : "")}
        />
      )}
    />
  );
};

export default AutocompleteCamiones;
