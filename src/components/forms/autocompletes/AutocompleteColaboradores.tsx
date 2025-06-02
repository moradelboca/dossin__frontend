import React, { useContext, useEffect, useState } from 'react';
import { Autocomplete, TextField } from '@mui/material';
import { ContextoGeneral } from '../../Contexto';
import AddIcon from '@mui/icons-material/Add';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import ChoferForm from '../Choferes/ChoferForm';

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
  const { backendURL, theme } = useContext(ContextoGeneral);
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [localError, setLocalError] = useState<boolean>(false);
  const [openDialog, setOpenDialog] = useState(false);

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

  const handleAgregarNuevo = () => setOpenDialog(true);
  const handleCloseDialog = () => setOpenDialog(false);

  const opciones = [...colaboradores, '__add__'];

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: 400, margin: '0 auto' }}>
        <Autocomplete
          disablePortal
          options={opciones}
          getOptionLabel={(option) =>
            typeof option === 'string' && option === '__add__'
              ? ''
              : (option as Colaborador).nombre + ' ' + (option as Colaborador).apellido
          }
          value={
            value ? colaboradores.find(col => col.cuil === value) || null : null
          }
          onChange={(_, newValue) => {
            if (typeof newValue === 'string' && newValue === '__add__') {
              handleAgregarNuevo();
              return;
            }
            onChange(newValue ? (newValue as Colaborador).cuil : null);
          }}
          renderOption={(props, option) => {
            const { key, ...rest } = props;
            if ('key' in rest) delete (rest as any).key;
            if (typeof option === 'string' && option === '__add__') {
              return (
                <li key={key} {...rest} style={{ display: 'flex', alignItems: 'center', color: theme.colores.azul, fontWeight: 600 }}>
                  <AddIcon fontSize="small" style={{ marginRight: 8, color: theme.colores.azul }} />
                  <span>Agregar un camionero</span>
                </li>
              );
            }
            const col = option as Colaborador;
            return <li key={key} {...rest}>{`${col.nombre} ${col.apellido}`}</li>;
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
              label="Camionero"
              variant="outlined"
              error={error || localError}
              helperText={helperText || (localError ? "El colaborador no coincide con los datos disponibles" : "")}
              sx={{
                '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: theme.colores.azul },
                '& .MuiInputLabel-root.Mui-focused': { color: theme.colores.azul },
              }}
            />
          )}
        />
      </div>
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogContent sx={{ p: 3 }}>
          <ChoferForm datos={colaboradores} setDatos={setColaboradores} handleClose={handleCloseDialog} />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AutocompleteColaboradores;
