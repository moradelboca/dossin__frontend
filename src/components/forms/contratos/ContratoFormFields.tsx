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

type EmpresaField = {
  key: string;
  label: string;
  rol: number;
};

interface FormFieldsProps {
  data: any;
  errors: any;
  setData: (data: any) => void;
  empresaFields: EmpresaField[];
  sorteredEmpresasSegunRol: Empresa[][];
  onAgregarEmpresa: (fieldKey: string) => void;
}

const ContratoFormFields: React.FC<FormFieldsProps> = ({
  data,
  errors,
  setData,
  empresaFields,
  sorteredEmpresasSegunRol,
  onAgregarEmpresa
}) => {
  const { theme } = useContext(ContextoGeneral);
  return (
    <>
      {empresaFields.map((field) => {
        const empresasDelRol = sorteredEmpresasSegunRol[field.rol] || [];
        // Opción especial para agregar empresa
        const opciones = [...empresasDelRol, { cuit: '__add__', nombreFantasia: '', razonSocial: '' }];

        const getEmpresaValue = () => {
          const val = data[field.key];
          
          if (!val) return null;
          
          // Si ya es un objeto empresa
          if (typeof val === 'object') {
            return empresasDelRol.find(e => e.cuit === val.cuit) || null;
          }
          
          // Si es string, buscar por formato o CUIT
          if (typeof val === 'string') {
            const empresaPorCuit = empresasDelRol.find(e => e.cuit.toString() === val);
            if (empresaPorCuit) return empresaPorCuit;
            
            const [nombre, razon] = val.split(' - ');
            return empresasDelRol.find(e => 
              e.nombreFantasia === nombre && 
              e.razonSocial === razon
            ) || null;
          }
          
          return null;
        };

        return (
          <Autocomplete
            key={field.key}
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
                : `${option.nombreFantasia} - ${option.razonSocial}`
            }
            isOptionEqualToValue={(option, value) => {
              if (!value) return false;
              if (typeof value === 'string') {
                return `${option.nombreFantasia} - ${option.razonSocial}` === value;
              }
              return option.cuit === value.cuit;
            }}
            value={getEmpresaValue()}
            onChange={(_, newValue) => {
              if (newValue && newValue.cuit === '__add__') {
                // Disparar callback para abrir modal
                if (typeof onAgregarEmpresa === 'function') onAgregarEmpresa(field.key);
                return;
              }
              setData({ 
                ...data, 
                [field.key]: newValue || null // Guardar objeto completo
              });
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
                  {`${option.nombreFantasia} - ${option.razonSocial}`}
                </li>
              );
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label={field.label}
                variant="outlined"
                error={!!errors[field.key]}
                helperText={errors[field.key] || ""}
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
