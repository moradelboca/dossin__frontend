import React, { useState } from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Collapse,
  IconButton,
  Paper,
  Chip,
} from "@mui/material";
import { KeyboardArrowDown, KeyboardArrowUp } from "@mui/icons-material";

interface Inconveniente {
  id: number;
  titulo: string;
  descripcion: string;
  urgencia: { id: number; nombre: string };
  fechaCreacion: string;
  tipoInconveniente: { id: number; nombre: string };
  creadoPor: string;
  asignadoA: string;
  estado: { id: number; nombre: string };
}

const mockInconvenientes: Inconveniente[] = [
  {
    id: 1,
    titulo: "Fuertes lluvias detectadas",
    descripcion: "Fuertes lluvias detectadas en la zona La Calera con una probabilidad del 94%",
    urgencia: { id: 2, nombre: "Media" },
    fechaCreacion: "2024-11-11",
    tipoInconveniente: { id: 1, nombre: "Lluvias" },
    creadoPor: "test@test.com",
    asignadoA: "test2@test.com",
    estado: { id: 2, nombre: "Con errores" },
  },
  {
    id: 2,
    titulo: "Problemas con la carga de combustible",
    descripcion: "El chofer reportó inconvenientes al cargar combustible.",
    urgencia: { id: 1, nombre: "Alta" },
    fechaCreacion: "2024-12-12",
    tipoInconveniente: { id: 2, nombre: "Sistema" },
    creadoPor: "soporte@test.com",
    asignadoA: "admin@test.com",
    estado: { id: 1, nombre: "Pendiente" },
  },
];

const getUrgenciaColor = (nombre: string) => {
  switch (nombre.toLowerCase()) {
    case "alta":
      return "error";
    case "media":
      return "warning";
    case "baja":
      return "success";
    default:
      return "default";
  }
};

const getTipoColor = (nombre: string) => {
  switch (nombre.toLowerCase()) {
    case "lluvias":
      return "info";
    case "sistema":
      return "primary";
    case "chatbot":
      return "secondary";
    default:
      return "default";
  }
};

const getEstadoColor = (nombre: string) => {
  switch (nombre.toLowerCase()) {
    case "pendiente":
      return "error";
    case "resuelto":
      return "success";
    case "con errores":
      return "warning";
    default:
      return "default";
  }
};

const Row: React.FC<{ row: Inconveniente }> = ({ row }) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <TableRow>
        <TableCell>{row.titulo}</TableCell>
        <TableCell>
          <Chip label={row.tipoInconveniente.nombre} color={getTipoColor(row.tipoInconveniente.nombre)} />
        </TableCell>
        <TableCell>
          <Chip label={row.estado.nombre} color={getEstadoColor(row.estado.nombre)} />
        </TableCell>
        <TableCell>
          <Chip label={row.urgencia.nombre} color={getUrgenciaColor(row.urgencia.nombre)} />
        </TableCell>
        <TableCell>{row.fechaCreacion}</TableCell>
        <TableCell>
          <IconButton size="small" onClick={() => setOpen(!open)}>
            {open ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
          </IconButton>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box margin={2}>
              <Typography variant="h6" gutterBottom>
                Detalles
              </Typography>
              <Typography><strong>Descripción:</strong> {row.descripcion}</Typography>
              <Typography><strong>Creado por:</strong> {row.creadoPor}</Typography>
              <Typography><strong>Asignado a:</strong> {row.asignadoA}</Typography>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};

const Inconvenientes: React.FC = () => {
  return (
    <Box m={3}>
      <Typography variant="h4" gutterBottom>
        Lista de Inconvenientes
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nombre</TableCell>
              <TableCell>Tipo</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Urgencia</TableCell>
              <TableCell>Fecha</TableCell>
              <TableCell />
            </TableRow>
          </TableHead>
          <TableBody>
            {mockInconvenientes.map((inconveniente) => (
              <Row key={inconveniente.id} row={inconveniente} />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default Inconvenientes;
