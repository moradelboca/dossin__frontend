// AutocompleteEmpresas.tsx
import React, { useContext, useEffect, useState, useMemo } from 'react';
import { Autocomplete, TextField } from '@mui/material';
import { ContextoGeneral } from '../../Contexto';
import AddIcon from '@mui/icons-material/Add';
import Dialog from '@mui/material/Dialog';
import EmpresaForm from '../empresas/EmpresaForm';

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
  const { backendURL, theme } = useContext(ContextoGeneral);
  const [allEmpresas, setAllEmpresas] = useState<Empresa[]>([]);
  const [localError, setLocalError] = useState<boolean>(false);
  const [openDialog, setOpenDialog] = useState(false);

  useEffect(() => {
    fetch(`${backendURL}/empresas`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true'
      }
    })
      .then(response => response.json())
      .then((data: Empresa[]) => {
        // Fuerzo que todos los cuit sean string
        const normalizados = data.map(emp => ({ ...emp, cuit: emp.cuit.toString() }));
        setAllEmpresas(normalizados);
      })
      .catch(err => console.error('Error al obtener las empresas', err));
  }, [backendURL]);
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

  const handleAgregarNuevo = () => setOpenDialog(true);
  const handleCloseDialog = () => setOpenDialog(false);

  const opciones = [...empresas, '__add__'];

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
        <Autocomplete
          disablePortal
          options={opciones}
          getOptionLabel={(option) =>
            typeof option === 'string' && option === '__add__'
              ? ''
              : `${(option as Empresa).razonSocial} - ${(option as Empresa).nombreFantasia}`
          }
          value={selectedEmpresa || null}
          onChange={(_, newValue) => {
            if (typeof newValue === 'string' && newValue === '__add__') {
              handleAgregarNuevo();
              return;
            }
            onChange(newValue ? (newValue as Empresa).cuit : null);
          }}
          renderOption={(props, option) => {
            const { key, ...rest } = props;
            if ('key' in rest) delete (rest as any).key;
            if (typeof option === 'string' && option === '__add__') {
              return (
                <li key={key} {...rest} style={{ display: 'flex', alignItems: 'center', color: theme.colores.azul, fontWeight: 600 }}>
                  <AddIcon fontSize="small" style={{ marginRight: 8, color: theme.colores.azul }} />
                  <span>Agregar una empresa</span>
                </li>
              );
            }
            const emp = option as Empresa;
            return <li key={key} {...rest}>{`${emp.razonSocial} - ${emp.nombreFantasia}`}</li>;
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
              label={labelText || "Empresa"}
              variant="outlined"
              error={error || localError}
              helperText={helperText || (localError ? "La empresa no coincide con los datos disponibles" : "")}
              sx={{
                '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: theme.colores.azul },
                '& .MuiInputLabel-root.Mui-focused': { color: theme.colores.azul },
              }}
            />
          )}
        />
      </div>
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <EmpresaForm datos={allEmpresas} setDatos={setAllEmpresas} handleClose={handleCloseDialog} />
      </Dialog>
    </>
  );
};

export default AutocompleteEmpresas;
