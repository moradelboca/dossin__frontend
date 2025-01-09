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
  Box,
} from "@mui/material";

const HistorialTurnos: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Card
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      <CardContent sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <Typography
          variant="h6"
          sx={{ textAlign: "center", fontWeight: "bold", mb: 2 }}
        >
          Historial de turnos
        </Typography>

        <Divider sx={{ mb: 2 }} />

        {/* Tabs */}
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          sx={{ display: "flex", justifyContent: "space-between" }}
        >
          <Tab label="Recientes" sx={{ flex: 1 }} />
          <Tab label="En camino" sx={{ flex: 1 }} />
        </Tabs>

        {/* Contenido dinámico */}
        <Box sx={{ flex: 1, overflow: "auto", mt: 2 }}>
          {tabValue === 0 && (
            <TableContainer component={Paper}>
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
            <TableContainer component={Paper}>
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
        </Box>
      </CardContent>
    </Card>
  );
};

export default HistorialTurnos;

