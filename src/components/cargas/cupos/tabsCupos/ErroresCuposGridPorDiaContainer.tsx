// ErroresCuposGridPorDiaContainer.tsx
import React, { useState, useEffect } from "react";
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  SelectChangeEvent,
} from "@mui/material";
import { ErroresCuposGridContainer } from "./ErroresCuposGridContainer";

interface Cupo {
  carga: number;
  cupos: number;
  fecha: string;
  turnosConErrores: any[];
}

interface ErroresCuposGridPorDiaContainerProps {
  cupos: Cupo[];
  refreshCupos: () => void;
}

export function ErroresCuposGridPorDiaContainer({
  cupos,
  refreshCupos,
}: ErroresCuposGridPorDiaContainerProps) {
  // Extraemos las fechas únicas de los cupos
  const availableDates = Array.from(new Set(cupos.map((cupo) => cupo.fecha)));
  
  const [selectedDate, setSelectedDate] = useState<string>(
    availableDates[0] || ""
  );
  const [filteredCupos, setFilteredCupos] = useState<Cupo[]>([]);

  useEffect(() => {
    if (selectedDate) {
      const filtered = cupos.filter((cupo) => cupo.fecha === selectedDate);
      setFilteredCupos(filtered);
    }
  }, [selectedDate, cupos]);

  const handleDateChange = (event: SelectChangeEvent<string>) => {
    setSelectedDate(event.target.value);
  };

  return (
    <Box m={3}>
      <FormControl fullWidth>
        <InputLabel id="date-select-label">Seleccionar Fecha</InputLabel>
        <Select
          labelId="date-select-label"
          value={selectedDate}
          label="Seleccionar Fecha"
          onChange={handleDateChange}
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
          <ErroresCuposGridContainer cupos={filteredCupos} refreshCupos={refreshCupos} />
        ) : (
          <Typography>No hay cupos para la fecha seleccionada</Typography>
        )}
      </Box>
    </Box>
  );
}
