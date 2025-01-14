import React, { useContext, useState } from "react";
import { ContextoGeneral } from "../Contexto";
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
  Avatar,
  Stack,
  Button,
} from "@mui/material";
import { KeyboardArrowDown, KeyboardArrowUp } from "@mui/icons-material";

interface Usuario {
  id: number;
  email: string;
  imagen: string | null;
}

interface Inconveniente {
  id: number;
  titulo: string;
  descripcion: string;
  urgencia: { id: number; nombre: string };
  fechaCreacion: string;
  tipoInconveniente: { id: number; nombre: string };
  creadoPor: Usuario;
  asignadoA: Usuario;
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
    creadoPor: {
      id: 5,
      email: "zullolau@gmail.com",
      imagen: "https://lh3.googleusercontent.com/a/ACg8ocLXi_TSo20Zq4M0Gt-iNU45V2bn32CL1IDasP0nyZIKm4Rv0V1i=s96-c",
    },
    asignadoA: {
      id: 6,
      email: "test@test.com",
      imagen: null,
    },
    estado: { id: 2, nombre: "Resuelto" },
  },
  {
    id: 2,
    titulo: "Problemas con la carga de combustible",
    descripcion: "El chofer reportó inconvenientes al cargar combustible.",
    urgencia: { id: 1, nombre: "Alta" },
    fechaCreacion: "2024-12-12",
    tipoInconveniente: { id: 2, nombre: "Sistema" },
    creadoPor: {
      id: 7,
      email: "soporte@test.com",
      imagen: null,
    },
    asignadoA: {
      id: 8,
      email: "admin@test.com",
      imagen: "https://lh3.googleusercontent.com/a/ACg8ocLXi_TSo20Zq4M0Gt-iNU45V2bn32CL1IDasP0nyZIKm4Rv0V1i=s96-c",
    },
    estado: { id: 1, nombre: "Pendiente" },
  },
  {
    id: 3,
    titulo: "Problemas con la carga de combustible",
    descripcion: "El chofer reportó inconvenientes al cargar combustible.",
    urgencia: { id: 2, nombre: "Baja" },
    fechaCreacion: "2024-12-12",
    tipoInconveniente: { id: 3, nombre: "Chatbot" },
    creadoPor: {
      id: 7,
      email: "soporte@test.com",
      imagen: null,
    },
    asignadoA: {
      id: 8,
      email: "admin@test.com",
      imagen: "https://lh3.googleusercontent.com/a/ACg8ocLXi_TSo20Zq4M0Gt-iNU45V2bn32CL1IDasP0nyZIKm4Rv0V1i=s96-c",
    },
    estado: { id: 1, nombre: "Pendiente" },
  },
];

const getTipoStyles = (nombre: string) => {
  switch (nombre.toLowerCase()) {
    case "sistema":
      return { backgroundColor: "#C2DCF0", color: "#307FA6", borderColor: "#307FA6" };
    case "lluvias":
    case "clima":
      return { backgroundColor: "#BFE4DC", color: "#418C75", borderColor: "#418C75" };
    case "chatbot":
      return { backgroundColor: "#F3D3C6", color: "#CB723A", borderColor: "#CB723A" };
    default:
      return { backgroundColor: "transparent", color: "black", borderColor: "#CB723A" };
  }
};

const getEstadoStyles = (nombre: string) => {
  switch (nombre.toLowerCase()) {
    case "resuelto":
      return { color: "#008000", fontWeight: "bold" };
    case "pendiente":
    case "con errores":
      return { color: "#FF0000", fontWeight: "bold" };
    default:
      return { color: "black" };
  }
};

const getUrgenciaStyles = (nombre: string) => {
  switch (nombre.toLowerCase()) {
    case "baja":
      return { backgroundColor: "#BFE4DC", color: "#418C75" };
    case "media":
      return { backgroundColor: "#F3D3C6", color: "#CB723A" };
    case "alta":
      return { backgroundColor: "#E9BBC6", color: "#892233" };
    default:
      return { backgroundColor: "transparent", color: "black" };
  }
};


const Row: React.FC<{ row: Inconveniente }> = ({ row }) => {
  const [open, setOpen] = useState(false);
  const [estado, setEstado] = useState(row.estado.nombre);

  const handleEstadoChange = () => {
    setEstado((prev) => (prev === "Resuelto" ? "Pendiente" : "Resuelto"));
  };

  return (
    <>
      <TableRow>
        <TableCell >{row.titulo}</TableCell>
        <TableCell>
  <Chip
    label={row.tipoInconveniente.nombre}
    sx={{
      ...getTipoStyles(row.tipoInconveniente.nombre),
      border: "1px solid",
    }}
  />
</TableCell>
<TableCell>
  <Chip
    label={estado}
    sx={{
      ...getEstadoStyles(estado),
      backgroundColor: "transparent",
      border: "none",
    }}
  />
</TableCell>
<TableCell>
  <Chip
    label={row.urgencia.nombre}
    sx={{
      ...getUrgenciaStyles(row.urgencia.nombre),
      border: "1px solid",
    }}
  />
</TableCell>
        <TableCell>{row.fechaCreacion}</TableCell>
        <TableCell>
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar src={row.creadoPor.imagen || undefined} alt={row.creadoPor.email} />
            <Typography variant="body2">{row.creadoPor.email}</Typography>
          </Stack>
        </TableCell>
        <TableCell>
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar src={row.asignadoA.imagen || undefined} alt={row.asignadoA.email} />
            <Typography variant="body2">{row.asignadoA.email}</Typography>
          </Stack>
        </TableCell>
        <TableCell>
          <IconButton size="small" onClick={() => setOpen(!open)}>
            {open ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
          </IconButton>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={8}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box margin={2}>
              <Typography variant="h6" gutterBottom>
                Descripción
              </Typography>
              <Typography>{row.descripcion}</Typography>
              <Box mt={2}>
                <Button
                  variant="contained"
                  color={estado === "Resuelto" ? "error" : "success"}
                  onClick={handleEstadoChange}
                >
                  Cambiar a {estado === "Resuelto" ? "Pendiente" : "Resuelto"}
                </Button>
              </Box>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};

const Inconvenientes: React.FC = () => {
  const { theme } = useContext(ContextoGeneral);
  return (
    <Box m={3}>
      <Typography
                          variant="h5"
                          component="div"
                          sx={{
                              color: theme.colores.azul,
                              fontWeight: "bold",
                              mb: 2,
                              fontSize: "2rem",
                              pb: 1,
                              marginLeft: 1,
                          }}
                      >
        Inconvenientes
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
              <TableCell>Creado Por</TableCell>
              <TableCell>Asignado A</TableCell>
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
