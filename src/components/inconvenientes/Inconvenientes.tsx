import React, { useContext, useEffect, useState } from "react";
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
import CreadorEntidad from "../dialogs/CreadorEntidad";
import InconvenienteForm from "../forms/inconvenientes/InconvenienteForm";
import { inconvenientesPruebas } from "./inconvenientePruebas";

interface Usuario {
  id: number;
  email: string;
  imagen: string | null;
}

export interface Inconveniente {
  id: number;
  titulo: string;
  descripcion: string;
  urgencia: { id: number; nombre: string };
  fechaCreacion: string;
  fechaResolucion: string | null;
  tipoInconveniente: { id: number; nombre: string };
  creadoPor: Usuario;
  asignadoA: Usuario | null;
  estado: { id: number; nombre: string };
}

const getTipoStyles = (nombre: string) => {
  switch (nombre.toLowerCase()) {
    case "turno con errores":
    case "generado por chofer":
      return {
        backgroundColor: "#C2DCF0",
        color: "#307FA6",
        borderColor: "#307FA6",
      };
    case "lluvias":
    case "clima":
      return {
        backgroundColor: "#BFE4DC",
        color: "#418C75",
        borderColor: "#418C75",
      };
    default:
      return {
        backgroundColor: "transparent",
        color: "black",
        borderColor: "#CB723A",
      };
  }
};

const getEstadoStyles = (nombre: string) => {
  switch (nombre.toLowerCase()) {
    case "resuelto":
      return { color: "#008000", fontWeight: "bold" };
    case "pendiente":
      return { color: "#FF0000", fontWeight: "bold" };
    default:
      return { color: "black" };
  }
};

const getUrgenciaStyles = (nombre: string) => {
  switch (nombre.toLowerCase()) {
    case "leve":
      return { backgroundColor: "#BFE4DC", color: "#418C75" };
    case "media":
      return { backgroundColor: "#F3D3C6", color: "#CB723A" };
    case "urgente":
      return { backgroundColor: "#E9BBC6", color: "#892233" };
    default:
      return { backgroundColor: "transparent", color: "black" };
  }
};

const Row: React.FC<{
  row: Inconveniente;
  handleEstadoChange: (id: number, nuevoEstado: number) => void;
  theme: any;
}> = ({ row, handleEstadoChange, theme }) => {
  const [open, setOpen] = useState(false);

  // Determinar el próximo estado y texto del botón
  let actionButton = null;
  if (row.estado.nombre.toLowerCase() === "pendiente") {
    actionButton = (
      <Button
        sx={{ color: theme.colores.azul, background: "transparent", boxShadow: "none", textTransform: "none" }}
        onClick={() => handleEstadoChange(row.id, 4)} // 4 = Atendiendo
      >
        Atender
      </Button>
    );
  } else if (row.estado.nombre.toLowerCase() === "atendiendo") {
    actionButton = (
      <Button
        sx={{ color: theme.colores.azul, background: "transparent", boxShadow: "none", textTransform: "none" }}
        onClick={() => handleEstadoChange(row.id, 2)} // 2 = Resuelto
      >
        Resolver
      </Button>
    );
  }

  // Función para renderizar Avatar correctamente
  const renderAvatar = (usuario: Usuario) => (
    <Avatar
      src={usuario.imagen && usuario.imagen.startsWith("http") ? usuario.imagen : undefined}
      alt={usuario.email}
      imgProps={{ referrerPolicy: "no-referrer" }}
    />
  );

  return (
    <>
      <TableRow>
        <TableCell>{row.titulo}</TableCell>
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
            label={row.estado.nombre}
            sx={{
              ...getEstadoStyles(row.estado.nombre),
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
            {renderAvatar(row.creadoPor)}
            <Typography variant="body2">{row.creadoPor.email}</Typography>
          </Stack>
        </TableCell>
        <TableCell>
          {row.asignadoA ? (
            <Stack direction="row" spacing={2} alignItems="center">
              {renderAvatar(row.asignadoA)}
              <Typography variant="body2">{row.asignadoA.email}</Typography>
            </Stack>
          ) : (
            <Typography variant="body2">Sin asignar</Typography>
          )}
        </TableCell>
        <TableCell>
          {actionButton}
        </TableCell>
        <TableCell>
          <IconButton size="small" onClick={() => setOpen(!open)}>
            {open ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
          </IconButton>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={9}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box margin={2}>
              <Typography variant="h6" gutterBottom>
                Descripción
              </Typography>
              <Typography>{row.descripcion}</Typography>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};

const Inconvenientes: React.FC = () => {
  const { theme, backendURL, stage } = useContext(ContextoGeneral);
  const [inconvenientes, setInconvenientes] = useState<Inconveniente[]>([]);
  const [open, setOpen] = useState(false);
  const selectedInconveniente = null;

  useEffect(() => {
    if (stage === "development") {
      setInconvenientes(inconvenientesPruebas);
      return;
    }
    const fetchData = async () => {
      try {
        const response = await fetch(`${backendURL}/inconvenientes`, {
          headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
          },
        });
        if (!response.ok) throw new Error("Error en el servidor");
        const data = await response.json();
        setInconvenientes(data);
      } catch (error) {
        console.error("Error fetching inconvenientes:", error);
      }
    };
    fetchData();
  }, [backendURL, stage]);

  // Cambiar el estado: 1=Pendiente, 4=Atendiendo, 2=Resuelto
  const handleEstadoChange = (inconvenienteId: number, nuevoEstado: number) => {
    const metodo = "PUT";
    const url = `${backendURL}/inconvenientes/${inconvenienteId}`;

    const payload = {
      estado: nuevoEstado,
    };

    fetch(url, {
      method: metodo,
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true",
      },
      body: JSON.stringify(payload),
    })
      .then(async (response) => {
        if (!response.ok) {
          const errorMessage = await response.text();
          throw new Error(`Error del servidor: ${errorMessage}`);
        }
        return response.json();
      })
      .then((updatedData) => {
        setInconvenientes((prevDatos) =>
          prevDatos.map((inconveniente) =>
            inconveniente.id === updatedData.id ? updatedData : inconveniente
          )
        );
      })
      .catch((error) => console.error(`Error: ${error.message}`));
  };

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
      <Button sx={{ color: theme.colores.azul }} onClick={() => setOpen(true)}>
        + Agregar Inconveniente
      </Button>
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
              <TableCell>Acción</TableCell>
              <TableCell />
            </TableRow>
          </TableHead>
          <TableBody>
            {inconvenientes.map((inconveniente) => (
              <Row
                key={inconveniente.id}
                row={inconveniente}
                handleEstadoChange={handleEstadoChange}
                theme={theme}
              />
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {open && (
        <CreadorEntidad
          seleccionado={selectedInconveniente}
          handleClose={() => setOpen(false)}
          datos={inconvenientes}
          setDatos={setInconvenientes}
          nombreEntidad="Inconveniente"
          Formulario={InconvenienteForm}
        />
      )}
    </Box>
  );
};

export default Inconvenientes;
