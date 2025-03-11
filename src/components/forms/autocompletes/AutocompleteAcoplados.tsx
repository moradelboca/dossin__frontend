import React, { useContext, useEffect, useState } from 'react';
import { Autocomplete, TextField } from '@mui/material';
import { ContextoGeneral } from '../../Contexto';

interface Acoplado {
  patente: string;
  // Otros campos si los necesitas...
}

interface AutocompleteAcopladosProps {
  value: string | null; // Se espera que sea la patente del acoplado
  onChange: (value: string | null) => void;
  error?: boolean;
  helperText?: string | null;
  tituloOpcional?: string | null; // Si se pasa este título, consideramos que es el campo opcional
}

const AutocompleteAcoplados: React.FC<AutocompleteAcopladosProps> = ({
  value,
  onChange,
  error = false,
  helperText = '',
  tituloOpcional,
}) => {
  const { backendURL } = useContext(ContextoGeneral);
  const [acoplados, setAcoplados] = useState<Acoplado[]>([]);
  const [localError, setLocalError] = useState<boolean>(false);

  useEffect(() => {
    fetch(`${backendURL}/acoplados`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
      },
    })
      .then(response => response.json())
      .then((data: Acoplado[]) => setAcoplados(data))
      .catch(err => console.error('Error al obtener los acoplados', err));
  }, [backendURL]);

  useEffect(() => {
    // Si es opcional y el valor es nulo, no se marca error.
    if (!value && tituloOpcional) {
      setLocalError(false);
      return;
    }
    if (value && acoplados.length > 0) {
      const found = acoplados.some(a => a.patente === value);
      setLocalError(!found);
    }
  }, [value, acoplados, tituloOpcional]);

  return (
    <Autocomplete
      disablePortal
      options={acoplados}
      getOptionLabel={(option: Acoplado) => option.patente}
      value={acoplados.find(a => a.patente === value) || null}
      onChange={(_, newValue) => onChange(newValue ? newValue.patente : null)}
      renderInput={(params) => (
        <TextField
          {...params}
          label={tituloOpcional ? tituloOpcional : "Patente Acoplado"}
          variant="outlined"
          error={error || localError}
          helperText={helperText || (localError ? "La patente ingresada no coincide con las disponibles" : "")}
        />
      )}
    />
  );
};

export default AutocompleteAcoplados;
