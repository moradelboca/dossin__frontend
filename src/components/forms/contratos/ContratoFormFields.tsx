import React, { useContext } from "react";
import { Autocomplete, TextField } from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import { ContextoGeneral } from '../../Contexto';

export interface Empresa {
  cuit: number | string;
  razonSocial: string;
  nombreFantasia: string;
  roles?: { nombre: string; id: number }[];
}

interface FormFieldsProps {
  data: any;
  errors: any;
  setData: (data: any) => void;
  roles: any[];
  empresas: Empresa[];
  empresasPorRol: { [rolId: number]: Empresa | null };
  erroresEmpresas: { [rolId: number]: boolean };
  onEmpresaChange: (rolId: number, empresa: Empresa | null) => void;
  onAgregarEmpresa: (fieldKey: string) => void;
}

const ContratoFormFields: React.FC<FormFieldsProps> = ({
  roles,
  empresas,
  empresasPorRol,
  erroresEmpresas,
  onEmpresaChange,
  onAgregarEmpresa
}) => {
  const { theme } = useContext(ContextoGeneral);
  return (
    <>
      {roles.filter((rol) => rol.nombre !== "Transportista").map((rol) => {
        // Filtrar empresas que tengan este rol
        const empresasDelRol = empresas.filter(e => e.roles?.some(r => r.id === rol.id));
        // Opción especial para agregar empresa
        const opciones = [...empresasDelRol, { cuit: '__add__', nombreFantasia: '', razonSocial: '' }];
        const value = empresasPorRol[rol.id] || null;
        return (
          <Autocomplete
            key={rol.id}
            options={opciones}
            sx={{ mt: 2,
              '& .MuiAutocomplete-option': {
                fontWeight: 400,
              },
              '& .Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: theme.colores.azul,
              },
              '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: theme.colores.azul,
              },
            }}
            getOptionLabel={(option: Empresa) =>
              option.cuit === '__add__'
                ? 'Agregar una empresa'
                : `${option.razonSocial} - ${option.cuit}`
            }
            isOptionEqualToValue={(option, value) => {
              if (!value) return false;
              if (typeof value === 'string') {
                return `${option.razonSocial} - ${option.cuit}` === value;
              }
              return option.cuit === value.cuit;
            }}
            value={value}
            onChange={(_, newValue) => {
              if (newValue && newValue.cuit === '__add__') {
                if (typeof onAgregarEmpresa === 'function') onAgregarEmpresa(rol.id.toString());
                return;
              }
              onEmpresaChange(rol.id, newValue || null);
            }}
            renderOption={(props, option) => {
              const { key, ...rest } = props;
              if (option.cuit === '__add__') {
                return (
                  <li key={key} {...rest} style={{ display: 'flex', alignItems: 'center', color: theme.colores.azul, fontWeight: 600 }}>
                    <AddIcon fontSize="small" style={{ marginRight: 8, color: theme.colores.azul }} />
                    <span>Agregar una empresa</span>
                  </li>
                );
              }
              return (
                <li key={key} {...rest}>
                  {`${option.razonSocial} - ${option.cuit}`}
                </li>
              );
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label={rol.nombre}
                variant="outlined"
                error={!!erroresEmpresas[rol.id]}
                helperText={erroresEmpresas[rol.id] ? "Campo obligatorio" : ""}
                sx={{
                  '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: theme.colores.azul,
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: theme.colores.azul,
                  },
                }}
              />
            )}
          />
        );
      })}
    </>
  );
};

export default ContratoFormFields;
