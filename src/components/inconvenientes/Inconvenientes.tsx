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
  useMediaQuery,
  Dialog,
} from "@mui/material";
import { KeyboardArrowDown, KeyboardArrowUp } from "@mui/icons-material";
import CreadorEntidad from "../dialogs/CreadorEntidad";
import InconvenienteForm from "../forms/inconvenientes/InconvenienteForm";
import { inconvenientesPruebas } from "./inconvenientePruebas";
import InconvenientesMobile from "./InconvenientesMobile";
import { usuariosPruebas } from "./usuariosPruebas";
import { useAuth } from "../autenticacion/ContextoAuth";
import TurnoConErroresForm from '../forms/turnos/tabs/turnosConErrores/TurnoConErroresForm';

// interface Usuario { ... } // Elimino o comento esta interfaz

export interface Inconveniente {
  id: number;
  titulo: string;
  descripcion: string;
  urgencia: { id: number; nombre: string };
  fechaCreacion: string;
  fechaResolucion: string | null;
  tipoInconveniente: { id: number; nombre: string };
  creadoPor: string; // email
  asignadoA: string | null; // email o null
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
    case "activo":
      return { color: "#FFD600", fontWeight: "bold" };
    default:
      return { color: "black" };
  }
};

const getUrgenciaStyles = (nombre: string) => {
  switch (nombre.toLowerCase()) {
    case "leve":
      return { backgroundColor: "#BFE4DC", color: "#418C75" };
    case "media":
      return { backgroundColor: "#FFF9C4", color: "#FFD600" };
    case "alta":
      return { backgroundColor: "#F8D7DA", color: "#C62828" };
    case "urgente":
      return { backgroundColor: "#F8D7DA", color: "#C62828" };
    default:
      return { backgroundColor: "transparent", color: "black" };
  }
};

const Row: React.FC<{
  row: Inconveniente & { creadoPorImagen?: string | null; asignadoAImagen?: string | null };
  handleEstadoChange: (id: number, nuevoEstado: number) => void;
  theme: any;
}> = ({ row, handleEstadoChange, theme }) => {
  const [open, setOpen] = useState(false);
  const [openCorregir, setOpenCorregir] = useState(false);
  const [turnoConErrores, setTurnoConErrores] = useState<any>(null);
  const [loadingTurno, setLoadingTurno] = useState(false);
  const [turnoErrorMsg, setTurnoErrorMsg] = useState<string | null>(null);
  const { backendURL } = useContext(ContextoGeneral);

  // Renderizar Avatar con imagen o inicial
  const renderAvatar = (email: string | undefined, imagen?: string | null) => (
    <Avatar
      src={imagen || undefined}
      alt={email}
      sx={{
        bgcolor: imagen ? 'transparent' : theme.colores.azul,
        width: 40,
        height: 40,
        border: imagen ? '1px solid #ccc' : undefined,
      }}
      imgProps={{ referrerPolicy: "no-referrer" }}
    >
      {!imagen && email ? email[0].toUpperCase() : null}
    </Avatar>
  );

  // Determinar el próximo estado y texto del botón
  let actionButton = null;
  if (row.estado.nombre.toLowerCase() === "pendiente") {
    actionButton = (
      <Button
        sx={{ color: theme.colores.azul, background: "transparent", boxShadow: "none", textTransform: "none" }}
        onClick={() => handleEstadoChange(row.id, 2)} // 2 = Activo
      >
        Atender
      </Button>
    );
  } else if (row.estado.nombre.toLowerCase() === "activo") {
    actionButton = (
      <Button
        sx={{ color: theme.colores.azul, background: "transparent", boxShadow: "none", textTransform: "none" }}
        onClick={() => handleEstadoChange(row.id, 3)} // 3 = Resuelto
      >
        Resolver
      </Button>
    );
  }

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
            {renderAvatar(row.creadoPor, row.creadoPorImagen)}
            <Typography variant="body2">{row.creadoPor}</Typography>
          </Stack>
        </TableCell>
        <TableCell>
          {row.asignadoA ? (
            <Stack direction="row" spacing={2} alignItems="center">
              {renderAvatar(row.asignadoA, row.asignadoAImagen)}
              <Typography variant="body2">{row.asignadoA}</Typography>
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
              {/* Botón corregir turno si corresponde */}
              {row.tipoInconveniente.nombre.toLowerCase() === 'turno con errores' && row.estado.nombre.toLowerCase() === 'activo' && (
                <Button
                  sx={{ color: theme.colores.azul, background: 'transparent', boxShadow: 'none', textTransform: 'none', mt: 2 }}
                  onClick={async () => {
                    setLoadingTurno(true);
                    setOpenCorregir(true);
                    setTurnoErrorMsg(null);
                    try {
                      const res = await fetch(`${backendURL}/turnos/${row.titulo}`);
                      if (!res.ok) {
                        const errorText = await res.text();
                        throw new Error(`Error al buscar turno: ${errorText}`);
                      }
                      const data = await res.json();
                      setTurnoConErrores(data);
                    } catch (e: any) {
                      setTurnoConErrores(null);
                      setTurnoErrorMsg(e?.message || 'Error desconocido al cargar el turno');
                    } finally {
                      setLoadingTurno(false);
                    }
                  }}
                >
                  Corregir turno
                </Button>
              )}
              {/* Modal de corrección */}
              {openCorregir && (
                <Dialog open={openCorregir} onClose={() => setOpenCorregir(false)} maxWidth="xs" fullWidth>
                  <Box sx={{ p: 2 }}>
                    {loadingTurno ? (
                      <Typography>Cargando turno...</Typography>
                    ) : turnoConErrores ? (
                      <TurnoConErroresForm
                        seleccionado={turnoConErrores}
                        datos={[]}
                        setDatos={() => {}}
                        handleClose={() => setOpenCorregir(false)}
                        idCarga={turnoConErrores.carga || turnoConErrores.idCarga}
                      />
                    ) : (
                      <Typography color="error">{turnoErrorMsg || 'No se pudo cargar el turno.'}</Typography>
                    )}
                  </Box>
                </Dialog>
              )}
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};

const Inconvenientes: React.FC = () => {
  const { theme, backendURL, stage, authURL } = useContext(ContextoGeneral);
  const { user } = useAuth();
  const [inconvenientes, setInconvenientes] = useState<Inconveniente[]>([]);
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const selectedInconveniente = null;
  const isMobile = useMediaQuery("(max-width:768px)");

  // Filtro de visibilidad según rol
  const filtrarInconvenientesPorRol = (inconvenientes: Inconveniente[]) => {
    if (!user) return [];
    // Admin (id: 1) ve todos
    if (user.rol.id === 1) return inconvenientes;
    // Contable (2), Ingeniero (3), Logistica (4): solo los creados por o asignados a ellos
    if ([2, 3, 4].includes(user.rol.id)) {
      return inconvenientes.filter(
        (inc) => inc.creadoPor === user.email || inc.asignadoA === user.email
      );
    }
    // Otros roles: nada
    return [];
  };

  useEffect(() => {
    if (stage === "development") {
      setUsuarios(usuariosPruebas);
      return;
    }
    fetch(`${authURL}/auth/usuarios`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true",
      },
    })
      .then((response) => response.json())
      .then((data) => setUsuarios(data))
      .catch(() => setUsuarios([]));
  }, [authURL, stage]);

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

  // Ordenar inconvenientes según reglas de prioridad
  const getUrgenciaRank = (urgencia: string) => {
    switch (urgencia.toLowerCase()) {
      case "alta": return 1;
      case "media": return 2;
      case "leve": return 3;
      default: return 4;
    }
  };
  const getEstadoRank = (estado: string) => {
    switch (estado.toLowerCase()) {
      case "activo": return 1;
      case "pendiente": return 2;
      case "resuelto": return 3;
      default: return 4; // otros, pero 'resuelto' se maneja aparte
    }
  };

  const inconvenientesOrdenados = [...inconvenientes].sort((a, b) => {
    // 1. Resueltos siempre al fondo
    const aResuelto = a.estado.nombre.toLowerCase() === "resuelto";
    const bResuelto = b.estado.nombre.toLowerCase() === "resuelto";
    if (aResuelto && !bResuelto) return 1;
    if (!aResuelto && bResuelto) return -1;
    if (aResuelto && bResuelto) return 0;
    // 2. Estado: Atendiendo > Pendiente > Activo > otros
    const estadoA = getEstadoRank(a.estado.nombre);
    const estadoB = getEstadoRank(b.estado.nombre);
    if (estadoA !== estadoB) return estadoA - estadoB;
    // 3. Urgencia: alta < media < leve
    const urgenciaA = getUrgenciaRank(a.urgencia.nombre);
    const urgenciaB = getUrgenciaRank(b.urgencia.nombre);
    if (urgenciaA !== urgenciaB) return urgenciaA - urgenciaB;
    // 4. Fecha: más viejo primero
    const fechaA = new Date(a.fechaCreacion).getTime();
    const fechaB = new Date(b.fechaCreacion).getTime();
    return fechaA - fechaB;
  });

  // Mapear imágenes solo en desktop y solo si ambos arrays están cargados
  let inconvenientesConImagen: (Inconveniente & { creadoPorImagen?: string | null; asignadoAImagen?: string | null })[] = filtrarInconvenientesPorRol(inconvenientesOrdenados);
  if (!isMobile && usuarios.length && inconvenientesConImagen.length) {
    inconvenientesConImagen = inconvenientesConImagen.map((inc: Inconveniente) => {
      const creadoPorUser = usuarios.find((u) => u.email === inc.creadoPor);
      const asignadoAUser = inc.asignadoA ? usuarios.find((u) => u.email === inc.asignadoA) : null;
      const obj = {
        ...inc,
        creadoPorImagen: creadoPorUser?.imagen || null,
        asignadoAImagen: asignadoAUser?.imagen || null,
      };
      return obj;
    });
  }

  if (isMobile) {
    return (
      <InconvenientesMobile
        inconvenientes={inconvenientesConImagen}
        setInconvenientes={setInconvenientes}
        open={open}
        setOpen={setOpen}
        handleEstadoChange={handleEstadoChange}
        selectedInconveniente={selectedInconveniente}
      />
    );
  }

  return (
    <Box sx={{ backgroundColor: theme.colores.grisClaro, height: '100%', minHeight: 0, minWidth: 0, width: '100%', p: 3, m: 0 }}>
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
            {inconvenientesConImagen.map((inconveniente: Inconveniente & { creadoPorImagen?: string | null; asignadoAImagen?: string | null }) => (
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
