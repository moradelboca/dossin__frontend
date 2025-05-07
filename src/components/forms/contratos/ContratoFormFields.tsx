import React from "react";
import { Autocomplete, TextField } from "@mui/material";

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
}

const ContratoFormFields: React.FC<FormFieldsProps> = ({
  data,
  errors,
  setData,
  empresaFields,
  sorteredEmpresasSegunRol
}) => {
  return (
    <>
      {empresaFields.map((field) => {
        const empresasDelRol = sorteredEmpresasSegunRol[field.rol] || [];

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
            options={empresasDelRol}
            sx={{mt:2}}
            getOptionLabel={(option: Empresa) =>
              `${option.nombreFantasia} - ${option.razonSocial}`
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
              setData({ 
                ...data, 
                [field.key]: newValue || null // Guardar objeto completo
              });
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label={field.label}
                variant="outlined"
                error={!!errors[field.key]}
                helperText={errors[field.key] || ""}
              />
            )}
          />
        );
      })}
    </>
  );
};

export default ContratoFormFields;
