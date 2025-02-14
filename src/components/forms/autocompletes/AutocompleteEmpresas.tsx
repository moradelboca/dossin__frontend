import React, { useContext, useEffect, useState } from 'react';
import { Autocomplete, TextField } from '@mui/material';
import { ContextoGeneral } from '../../Contexto';

// Define la interfaz para la Empresa (ajusta los tipos según corresponda)
interface Empresa {
  cuit: string;
  razonSocial: string;
  nombreFantasia: string;
}

interface AutocompleteEmpresasProps {
  value: string | null;
  onChange: (value: string | null) => void;
  error?: boolean;
  helperText?: string | null;
}

const AutocompleteEmpresas: React.FC<AutocompleteEmpresasProps> = ({
  value,
  onChange,
  error = false,
  helperText = '',
}) => {
  const { backendURL } = useContext(ContextoGeneral);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [localError, setLocalError] = useState<boolean>(false);

  useEffect(() => {
    fetch(`${backendURL}/empresas`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true'
      }
    })
      .then(response => response.json())
      .then((data: Empresa[]) => setEmpresas(data))
      .catch(err => console.error('Error al obtener las empresas', err));
  }, [backendURL]);

  // Cuando se cargan las opciones, verificamos si el valor actual existe
  useEffect(() => {
    if (value && empresas.length > 0) {
      const found = empresas.some(emp => emp.cuit === value);
      setLocalError(!found);
    }
  }, [value, empresas]);

  return (
    <Autocomplete
      disablePortal
      options={empresas}
      getOptionLabel={(option: Empresa) =>
        `${option.razonSocial} - ${option.nombreFantasia}`
      }
      // Se asume que "value" es el cuit de la empresa
      value={empresas.find(emp => emp.cuit === value) || null}
      onChange={(_, newValue) => onChange(newValue ? newValue.cuit : null)}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Empresa"
          variant="outlined"
          error={error || localError}
          helperText={helperText || (localError ? "La empresa no coincide con los datos disponibles" : "")}
          InputProps={{ ...params.InputProps }}
        />
      )}
    />
  );
};

export default AutocompleteEmpresas;
