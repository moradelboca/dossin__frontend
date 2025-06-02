import React, { useContext, useEffect, useState } from 'react';
import { Autocomplete, TextField } from '@mui/material';
import { ContextoGeneral } from '../../Contexto';
import AddIcon from '@mui/icons-material/Add';
import Dialog from '@mui/material/Dialog';
import AcopladoForm from '../acoplados/AcopladoForm';
import { useTheme } from '@mui/material/styles';

interface Acoplado {
  patente: string;
}

interface AutocompleteAcopladosProps {
  value: string | null;
  onChange: (value: string | null) => void;
  error?: boolean;
  helperText?: string | null;
  tituloOpcional?: string | null; 
}

const AutocompleteAcoplados: React.FC<AutocompleteAcopladosProps> = ({
  value,
  onChange,
  error = false,
  helperText = '',
  tituloOpcional,
}) => {
  const { backendURL, theme } = useContext(ContextoGeneral);
  const [acoplados, setAcoplados] = useState<Acoplado[]>([]);
  const [localError, setLocalError] = useState<boolean>(false);
  const [openDialog, setOpenDialog] = useState(false);
  const handleAgregarNuevo = () => setOpenDialog(true);
  const handleCloseDialog = () => setOpenDialog(false);

  useEffect(() => {
    fetch(`${backendURL}/acoplados`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
      },
    })
      .then(response => response.json())
      .then((data: any) => {
        const lista: Acoplado[] = Array.isArray(data)
          ? data
          : Array.isArray(data?.data)
            ? data.data
            : [];
        setAcoplados(lista);
      })
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

  const opciones = [...acoplados, '__add__'];

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
        <Autocomplete
          disablePortal
          options={opciones}
          getOptionLabel={(option) =>
            typeof option === 'string' && option === '__add__'
              ? ''
              : (option as Acoplado).patente
          }
          value={acoplados.find(a => a.patente === value) || null}
          onChange={(_, newValue) => {
            if (typeof newValue === 'string' && newValue === '__add__') {
              handleAgregarNuevo();
              return;
            }
            onChange(newValue ? (newValue as Acoplado).patente : null);
          }}
          renderOption={(props, option) => {
            const { key, ...rest } = props;
            if ('key' in rest) delete (rest as any).key;
            if (typeof option === 'string' && option === '__add__') {
              return (
                <li key={key} {...rest} style={{ display: 'flex', alignItems: 'center', color: theme.colores.azul, fontWeight: 600 }}>
                  <AddIcon fontSize="small" style={{ marginRight: 8, color: theme.colores.azul }} />
                  <span>Agregar un acoplado</span>
                </li>
              );
            }
            const acoplado = option as Acoplado;
            return <li key={key} {...rest}>{acoplado.patente}</li>;
          }}
          sx={{
            width: 300,
            '& .MuiAutocomplete-option': { fontWeight: 400 },
            '& .Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: theme.colores.azul },
            '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: theme.colores.azul },
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label={tituloOpcional ? tituloOpcional : "Patente Acoplado"}
              variant="outlined"
              error={error || localError}
              helperText={helperText || (localError ? "La patente ingresada no coincide con las disponibles" : "")}
              sx={{
                '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: theme.colores.azul },
                '& .MuiInputLabel-root.Mui-focused': { color: theme.colores.azul },
              }}
            />
          )}
        />
      </div>
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <AcopladoForm datos={acoplados} setDatos={setAcoplados} handleClose={handleCloseDialog} />
      </Dialog>
    </>
  );
};

export default AutocompleteAcoplados;
