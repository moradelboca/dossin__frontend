import React from "react";
import { Autocomplete, TextField } from "@mui/material";

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
        const selectedEmpresa = empresasDelRol.find(emp => emp.cuit === data[field.key]);
        return (
          <Autocomplete
            key={field.key}
            disablePortal
            options={empresasDelRol}
            getOptionLabel={(option: Empresa) => 
              `${option.razonSocial} - ${option.nombreFantasia}`
            }
            value={selectedEmpresa || null}
            onChange={(_, newValue) => {
              setData({ ...data, [field.key]: newValue?.cuit || null });
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label={field.label}
                variant="outlined"
                error={!!errors[field.key]}
                helperText={errors[field.key] || ""}
                InputProps={{ ...params.InputProps }}
              />
            )}
          />
        );
      })}
    </>
  );
};

export default ContratoFormFields;