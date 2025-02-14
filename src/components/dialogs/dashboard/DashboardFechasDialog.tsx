import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Chip,
  Typography,
  TextField,
} from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";

interface DashboardFechasDialogProps {
  open: boolean;
  onClose: () => void;
  selectedFechas: string[]; // formato "YYYY-MM-DD"
  onAddFecha: (fecha: string) => void;
  onRemoveFecha: (fecha: string) => void;
}

const DashboardFechasDialog: React.FC<DashboardFechasDialogProps> = ({
  open,
  onClose,
  selectedFechas,
  onAddFecha,
  onRemoveFecha,
}) => {
  // Estado local para la fecha a agregar
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);

  const handleAgregarFecha = () => {
    if (selectedDate) {
      // Convertir a formato "YYYY-MM-DD"
      const fechaStr = selectedDate.format("YYYY-MM-DD");
      onAddFecha(fechaStr);
      setSelectedDate(null);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>Seleccionar Fechas</DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {/* Selección mediante DatePicker */}
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label="Elige una fecha"
              value={selectedDate}
              onChange={(newValue) => setSelectedDate(newValue)}
              renderInput={(params) => <TextField {...params} fullWidth />}
            />
          </LocalizationProvider>
          <Button
            variant="contained"
            onClick={handleAgregarFecha}
            disabled={!selectedDate}
          >
            Agregar Fecha
          </Button>
          {/* Fechas seleccionadas */}
          <Box>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
              Fechas Seleccionadas:
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
              {selectedFechas.map((fecha) => (
                <Chip
                  key={fecha}
                  label={fecha}
                  onDelete={() => onRemoveFecha(fecha)}
                />
              ))}
            </Box>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DashboardFechasDialog;
