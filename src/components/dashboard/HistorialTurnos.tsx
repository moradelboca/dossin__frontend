import React, { useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  Table,
  TableHead,
  TableBody,
  TableCell,
  TableRow,
  TableContainer,
  Paper,
  Divider,
} from "@mui/material";

const HistorialTurnos: React.FC = () => {
  // Estado para controlar el Tab seleccionado
  const [tabValue, setTabValue] = useState(0);

  // Maneja el cambio de pestañas
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Card>
      <CardContent>
        {/* Título centrado */}
        <Typography
          variant="h6"
          sx={{ textAlign: "center", fontWeight: "bold", mb: 2 }}
        >
          Historial de turnos
        </Typography>

        {/* Línea divisoria */}
        <Divider sx={{ mb: 2 }} />

        {/* Tabs */}
        <Tabs
          value={tabValue} // Vinculado al estado
          onChange={handleTabChange} // Maneja el cambio
          indicatorColor="primary"
          textColor="primary"
          sx={{
            display: "flex",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <Tab label="Recientes" sx={{ flex: 1 }} />
          <Tab label="En camino" sx={{ flex: 1 }} />
        </Tabs>

        {/* Contenido dinámico basado en la pestaña seleccionada */}
        {tabValue === 0 && (
          <TableContainer component={Paper} sx={{ mt: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Turno</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell>Detalles</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>123</TableCell>
                  <TableCell>Finalizado</TableCell>
                  <TableCell>Detalles del turno 123</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>124</TableCell>
                  <TableCell>Finalizado</TableCell>
                  <TableCell>Detalles del turno 124</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {tabValue === 1 && (
          <TableContainer component={Paper} sx={{ mt: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Turno</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell>Detalles</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>125</TableCell>
                  <TableCell>En camino</TableCell>
                  <TableCell>Detalles del turno 125</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </CardContent>
    </Card>
  );
};

export default HistorialTurnos;
