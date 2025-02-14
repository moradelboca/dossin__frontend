import React, { useContext, useEffect, useState } from 'react';
import { Autocomplete, TextField } from '@mui/material';
import { ContextoGeneral } from '../../Contexto';

interface Colaborador {
  cuil: string;
  nombre: string;
  apellido: string;
}

interface AutocompleteColaboradoresProps {
  value: string | null; // Se espera que sea el cuil del colaborador
  onChange: (value: string | null) => void;
  error?: boolean;
  helperText?: string | null;
}

const AutocompleteColaboradores: React.FC<AutocompleteColaboradoresProps> = ({
  value,
  onChange,
  error = false,
  helperText = '',
}) => {
  const { backendURL } = useContext(ContextoGeneral);
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [localError, setLocalError] = useState<boolean>(false);

  useEffect(() => {
    fetch(`${backendURL}/colaboradores`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
      },
    })
      .then(response => response.json())
      .then((data: Colaborador[]) => setColaboradores(data))
      .catch(err => console.error('Error al obtener colaboradores', err));
  }, [backendURL]);

  // Cuando se cargan las opciones, verificamos si el valor actual existe
  useEffect(() => {
    if (value && colaboradores.length > 0) {
      const found = colaboradores.some(col => col.cuil === value);
      setLocalError(!found);
    }
  }, [value, colaboradores]);

  return (
    <Autocomplete
      disablePortal
      options={colaboradores}
      getOptionLabel={(option: Colaborador) => `${option.nombre} ${option.apellido}`}
      value={colaboradores.find(col => col.cuil === value) || null}
      onChange={(_, newValue) => onChange(newValue ? newValue.cuil : null)}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Colaborador"
          variant="outlined"
          error={error || localError}
          helperText={helperText || (localError ? "El colaborador no coincide con los datos disponibles" : "")}
        />
      )}
    />
  );
};

export default AutocompleteColaboradores;
