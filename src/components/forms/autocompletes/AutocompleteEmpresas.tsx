// AutocompleteEmpresas.tsx
import React, { useContext, useEffect, useState, useMemo } from 'react';
import { Autocomplete, TextField } from '@mui/material';
import { ContextoGeneral } from '../../Contexto';

interface Rol {
  nombre: string;
  id: number;
}

export interface Empresa {
  cuit: string;
  razonSocial: string;
  nombreFantasia: string;
  roles?: Rol[];
}

interface AutocompleteEmpresasProps {
  value: string | null;
  onChange: (value: string | null) => void;
  error?: boolean;
  helperText?: string | null;
  labelText?: string;
  rolEmpresa?: string; // Para filtrar empresas (ej.: "transportista")
}

const AutocompleteEmpresas: React.FC<AutocompleteEmpresasProps> = ({
  value,
  onChange,
  error = false,
  helperText = '',
  labelText = '',
  rolEmpresa = '',
}) => {
  const { backendURL } = useContext(ContextoGeneral);
  const [allEmpresas, setAllEmpresas] = useState<Empresa[]>([]);
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
      .then((data: Empresa[]) => setAllEmpresas(data))
      .catch(err => console.error('Error al obtener las empresas', err));
  }, [backendURL]);
  console.log(value)
  // Filtra las empresas según el rol (si se pasa)
  const empresas = useMemo(() => {
    if (rolEmpresa) {
      return allEmpresas.filter(emp =>
        emp.roles && emp.roles.some(role => role.nombre === rolEmpresa)
      );
    }
    return allEmpresas;
  }, [allEmpresas, rolEmpresa]);

  // Se selecciona la empresa comparando por CUIT
  const selectedEmpresa = empresas.find(emp => emp.cuit === value);

  // Verifica si el valor ingresado existe
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
      value={selectedEmpresa || null}
      onChange={(_, newValue) => {
        onChange(newValue ? newValue.cuit : null);
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          label={labelText || "Empresa"}
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
