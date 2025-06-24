import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import { useState, useEffect, useContext } from "react";
import { ContextoGeneral } from "../Contexto";

interface AutocompletarProps {
  title: string;
  localidades: any[];
  datosNuevaUbicacion: any;
  setDatosNuevaUbicacion: (nuevo: any) => void;
  error: boolean;
  estadoCarga: boolean;
}

export default function AutocompletarUbicacionLocalidad(props: AutocompletarProps) {
  const { title, localidades, datosNuevaUbicacion, setDatosNuevaUbicacion, error, estadoCarga } = props;

  const { theme } = useContext(ContextoGeneral);

  // Busca la localidad inicial (si existe) comparando el id
  const initialLocalidad = localidades.find(
    (loca) => loca.id === datosNuevaUbicacion.idLocalidad
  ) || null;

  const [selectedLocalidad, setSelectedLocalidad] = useState<any>(initialLocalidad);

  // Actualiza el estado local si cambian los datos o las opciones
  useEffect(() => {
    const newLocalidad =
      localidades.find((loca) => loca.id === datosNuevaUbicacion.idLocalidad) || null;
    setSelectedLocalidad(newLocalidad);
  }, [datosNuevaUbicacion.idLocalidad, localidades]);

  const seleccionarUbicacion = (_event: any, newValue: any | null) => {
    setSelectedLocalidad(newValue);
    if (newValue) {
      setDatosNuevaUbicacion({
        ...datosNuevaUbicacion,
        idLocalidad: newValue.id,
        // Arma el nombre a partir del objeto seleccionado
        nombreLocalidad: `${newValue.nombre}, ${newValue.provincia.nombre}`,
      });
    } else {
      setDatosNuevaUbicacion({
        ...datosNuevaUbicacion,
        idLocalidad: null,
        nombreLocalidad: "",
      });
    }
  };

  const azulStyles = {
    '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: theme.colores.azul,
    },
    '& .MuiInputLabel-root.Mui-focused': {
      color: theme.colores.azul,
    },
  };

  return (
    <Autocomplete
      disablePortal
      options={localidades}
      getOptionLabel={(option) => `${option.nombre}, ${option.provincia.nombre}`}
      sx={{ width: '100%' }}
      value={selectedLocalidad}
      onChange={seleccionarUbicacion}
      renderInput={(params) => (
        <TextField {...params} error={error} label={title} sx={azulStyles} />
      )}
      loading={estadoCarga}
    />
  );
}
