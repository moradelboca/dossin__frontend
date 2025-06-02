import React, { useContext, useEffect, useState } from 'react';
import { Autocomplete, TextField } from '@mui/material';
import { ContextoGeneral } from '../../Contexto';
import AddIcon from '@mui/icons-material/Add';
import Dialog from '@mui/material/Dialog';
import CamionForm from '../camiones/CamionForm';
import { useTheme } from '@mui/material/styles';

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
  const { backendURL, theme } = useContext(ContextoGeneral);
  const [camiones, setCamiones] = useState<Camion[]>([]);
  const [localError, setLocalError] = useState<boolean>(false);
  const [openDialog, setOpenDialog] = useState(false);

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

  const handleAgregarNuevo = () => setOpenDialog(true);
  const handleCloseDialog = () => setOpenDialog(false);

  const opciones = [...camiones, '__add__'];

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
        <Autocomplete
          disablePortal
          options={opciones}
          getOptionLabel={(option) =>
            typeof option === 'string' && option === '__add__'
              ? ''
              : (option as Camion).patente
          }
          value={camiones.find(c => c.patente === value) || null}
          onChange={(_, newValue) => {
            if (typeof newValue === 'string' && newValue === '__add__') {
              handleAgregarNuevo();
              return;
            }
            onChange(newValue ? (newValue as Camion).patente : null);
          }}
          renderOption={(props, option) => {
            const { key, ...rest } = props;
            if ('key' in rest) delete (rest as any).key;
            if (typeof option === 'string' && option === '__add__') {
              return (
                <li key={key} {...rest} style={{ display: 'flex', alignItems: 'center', color: theme.colores.azul, fontWeight: 600 }}>
                  <AddIcon fontSize="small" style={{ marginRight: 8, color: theme.colores.azul }} />
                  <span>Agregar un camión</span>
                </li>
              );
            }
            const cam = option as Camion;
            return <li key={key} {...rest}>{cam.patente}</li>;
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
              label="Patente Camión"
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
        <CamionForm datos={camiones} setDatos={setCamiones} handleClose={handleCloseDialog} />
      </Dialog>
    </>
  );
};

export default AutocompleteCamiones;
