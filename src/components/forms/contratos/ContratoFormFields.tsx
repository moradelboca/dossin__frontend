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

        // 1. Detectar el valor seleccionado en base al tipo de `data[field.key]`
        const selectedEmpresa = empresasDelRol.find(emp => {
          const val = data[field.key];
          if (!val) return false;

          // Caso: viene un objeto Empresa
          if (typeof val === "object" && val.cuit) {
            return emp.cuit.toString() === val.cuit.toString();
          }

          // Caso: viene un string
          if (typeof val === "string") {
            // 1a. Igual por CUIT
            if (emp.cuit.toString() === val) return true;
            // 1b. Igual por etiqueta
            const etiqueta = `${emp.razonSocial} - ${emp.nombreFantasia}`;
            if (etiqueta === val) return true;
          }

          return false;
        }) || null;

        return (
          <Autocomplete
            key={field.key}
            disablePortal
            options={empresasDelRol}
            getOptionLabel={(option: Empresa) =>
              `${option.razonSocial} - ${option.nombreFantasia}`
            }
            // 2. Asignamos el objeto encontrado (o null)
            value={selectedEmpresa}
            onChange={(_, newValue) => {
              // 3. Normalizamos al CUIT en string (o null)
              const nuevo = newValue
                ? newValue.cuit.toString()
                : null;
              setData({ ...data, [field.key]: nuevo });
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
