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
  data: _data,
  setData: _setData,
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
      {/* TEMPORALMENTE COMENTADO - Backend no está listo todavía */}
      {/* Campo turnoObservaciones */}
      {/* <Box sx={{ mt: 2 }}>
        <FormControlLabel
          control={
            <Switch
              checked={data.turnoObservaciones || false}
              onChange={(e) => setData({ ...data, turnoObservaciones: e.target.checked })}
              sx={{
                '& .MuiSwitch-switchBase.Mui-checked': {
                  color: theme.colores.azul,
                },
                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                  backgroundColor: theme.colores.azul,
                },
              }}
            />
          }
          label="Turno en Observaciones"
        />
        <Box sx={{ mt: 0.5, ml: 4 }}>
          <Typography variant="caption" color="text.secondary">
            Si está activado, el ID del turno se colocará en el campo "observaciones" de la CPE en lugar de "código de turno"
          </Typography>
        </Box>
      </Box> */}

      {/* TEMPORALMENTE COMENTADO - Backend no está listo todavía */}
      {/* Campo numeroDeTurno */}
      {/* <Box sx={{ mt: 2 }}>
        <TextField
          label="Número de Turno"
          type="number"
          value={data.numeroDeTurno || ''}
          onChange={(e) => setData({ ...data, numeroDeTurno: e.target.value ? Number(e.target.value) : undefined })}
          variant="outlined"
          fullWidth
          helperText="Número de turno asociado para la creación de la CPE"
          sx={{
            '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: theme.colores.azul,
            },
            '& .MuiInputLabel-root.Mui-focused': {
              color: theme.colores.azul,
            },
          }}
        />
      </Box> */}

      {roles.filter((rol) => rol.nombre !== "Empresa Transportista").map((rol) => {
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
              // Comparar CUIT como string para manejar números y strings
              return String(option.cuit) === String(value.cuit);
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
