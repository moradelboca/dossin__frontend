import React, { useContext, useEffect, useState } from 'react';
import { Autocomplete, TextField } from '@mui/material';
import { ContextoGeneral } from '../../Contexto';
import AddIcon from '@mui/icons-material/Add';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import ChoferForm from '../Choferes/ChoferForm';
import { axiosGet } from '../../../lib/axiosConfig';

interface Colaborador {
  cuil: string;
  nombre: string;
  apellido: string;
  empresas?: { cuit: string }[];
}

interface AutocompleteColaboradoresProps {
  value: string | null; // Se espera que sea el cuil del colaborador
  onChange: (value: string | null) => void;
  error?: boolean;
  helperText?: string | null;
  empresaSeleccionada?: string | null; // cuit de la empresa seleccionada
  disabled?: boolean;
}

const AutocompleteColaboradores: React.FC<AutocompleteColaboradoresProps> = ({
  value,
  onChange,
  error = false,
  helperText = '',
  empresaSeleccionada = null,
  disabled = false,
}) => {
  const { backendURL, theme } = useContext(ContextoGeneral);
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [localError, setLocalError] = useState<boolean>(false);
  const [openDialog, setOpenDialog] = useState(false);

  useEffect(() => {
    axiosGet<Colaborador[]>('colaboradores', backendURL)
      .then((data: Colaborador[]) => {
        // Fuerzo que todos los cuil sean string
        const normalizados = data.map(col => ({ ...col, cuil: col.cuil.toString() }));
        setColaboradores(normalizados);
      })
      .catch(err => console.error('Error al obtener colaboradores', err));
  }, [backendURL]);

  // Cuando se cargan las opciones, verificamos si el valor actual existe
  useEffect(() => {
    if (value && colaboradores.length > 0) {
      const found = colaboradores.some(col => col.cuil === value);
      setLocalError(!found);
    }
  }, [value, colaboradores]);

  // Filtrar colaboradores por empresa seleccionada si existe
  const colaboradoresFiltrados = React.useMemo(() => {
    if (!empresaSeleccionada) return colaboradores;
    return colaboradores.filter(col =>
      col.empresas && Array.isArray(col.empresas) &&
      col.empresas.some(emp => emp.cuit && emp.cuit.toString() === empresaSeleccionada)
    );
  }, [colaboradores, empresaSeleccionada]);

  const handleAgregarNuevo = () => setOpenDialog(true);
  const handleCloseDialog = () => setOpenDialog(false);

  const opciones = disabled ? [] : ['__add__', ...colaboradoresFiltrados];

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: 400, margin: '0 auto' }}>
        <Autocomplete
          disablePortal
          options={opciones}
          getOptionLabel={(option) =>
            typeof option === 'string' && option === '__add__'
              ? ''
              : (option as any).nombre + ' ' + (option as any).apellido
          }
          value={
            value ? colaboradoresFiltrados.find(col => col.cuil === value) || null : null
          }
          onChange={(_, newValue) => {
            if (typeof newValue === 'string' && newValue === '__add__') {
              handleAgregarNuevo();
              return;
            }
            onChange(newValue ? (newValue as any).cuil : null);
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
            const col = option as any;
            return <li key={key} {...rest}>{`${col.nombre} ${col.apellido}`}</li>;
          }}
          sx={{
            width: 300,
            '& .MuiAutocomplete-option': { fontWeight: 400 },
            '& .Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: theme.colores.azul },
            '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: theme.colores.azul },
          }}
          ListboxProps={{
            style: {
              maxHeight: '200px',
              overflow: 'auto'
            }
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label={disabled ? "Seleccione primero una empresa transportista" : "Camionero"}
              variant="outlined"
              error={error || localError}
              helperText={helperText || (localError ? "El colaborador no coincide con los datos disponibles" : "")}
              sx={{
                '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: theme.colores.azul },
                '& .MuiInputLabel-root.Mui-focused': { color: theme.colores.azul },
              }}
              disabled={disabled}
            />
          )}
          disabled={disabled}
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
