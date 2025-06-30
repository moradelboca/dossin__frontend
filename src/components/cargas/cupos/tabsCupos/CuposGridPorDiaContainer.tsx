import { useState, useEffect, useContext } from "react";
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  SelectChangeEvent,
} from "@mui/material";
import { CuposGridContainer } from "./CuposGridContainer";
import { ContextoGeneral } from "../../../Contexto";

// Si ya tenés el tipo Cupo exportado desde otro lado, podés importarlo.
// Por ejemplo: import { Cupo } from "./types";
interface Cupo {
  carga: number;
  cupos: number;
  fecha: string;
  turnos: any[];
}

interface CuposGridPorDiaContainerProps {
  cupos: Cupo[];
  refreshCupos: () => void;
}

export function CuposGridPorDiaContainer({
  cupos,
  refreshCupos,
  estadoCarga
}: CuposGridPorDiaContainerProps & { estadoCarga: string }) {
  const { theme } = useContext(ContextoGeneral);
  // Extraer todas las fechas únicas de los cupos
  const availableDates = Array.from(new Set(cupos.map((cupo) => cupo.fecha)));

  // Si no hay fechas disponibles, el valor por defecto será una cadena vacía
  const [selectedDate, setSelectedDate] = useState<string>(
    availableDates[0] || ""
  );
  const [filteredCupos, setFilteredCupos] = useState<Cupo[]>([]);

  // Cada vez que se modifique la fecha seleccionada o los cupos, filtramos
  useEffect(() => {
    if (selectedDate) {
      const filtered = cupos.filter((cupo) => cupo.fecha === selectedDate);
      setFilteredCupos(filtered);
    }
  }, [selectedDate, cupos]);

  // Actualizar la fecha seleccionada cuando se modifique el select
  const handleDateChange = (event: SelectChangeEvent<string>) => {
    setSelectedDate(event.target.value);
  };

  return (
    <Box m={3}>
      <FormControl fullWidth>
        <InputLabel id="date-select-label"
          sx={{
            '&.Mui-focused': { color: theme.colores.azul },
          }}
        >Seleccionar Fecha</InputLabel>
        <Select
          labelId="date-select-label"
          value={selectedDate}
          label="Seleccionar Fecha"
          onChange={handleDateChange}
          sx={{
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: theme.colores.azul,
            },
            '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: theme.colores.azul,
            },
          }}
        >
          {availableDates.map((date) => (
            <MenuItem key={date} value={date}>
              {date}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Box mt={3}>
        {filteredCupos.length > 0 ? (
          <CuposGridContainer cupos={filteredCupos} refreshCupos={refreshCupos} estadoCarga={estadoCarga} />
        ) : (
          estadoCarga === 'Cargado' && <Typography>No hay cupos para la fecha seleccionada</Typography>
        )}
      </Box>
    </Box>
  );
}
