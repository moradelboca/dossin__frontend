import React, { useContext } from "react";
import MobileCardList from "../mobile/MobileCardList";
import InconvenienteForm from "../forms/inconvenientes/InconvenienteForm";
import { Inconveniente } from "./Inconvenientes";
import { Button, Box } from "@mui/material";
import { ContextoGeneral } from "../Contexto";

interface InconvenientesMobileProps {
  inconvenientes: Inconveniente[];
  setInconvenientes: React.Dispatch<React.SetStateAction<Inconveniente[]>>;
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  handleEstadoChange: (id: number, nuevoEstado: number) => void;
  selectedInconveniente: Inconveniente | null;
}

const fields = [
  "titulo",
  "tipoInconveniente.nombre",
  "estado.nombre",
  "urgencia.nombre",
  "fechaCreacion",
  "creadoPor.email",
  "asignadoA.email",
  "descripcion"
];
const headerNames = [
  "Título",
  "Tipo",
  "Estado",
  "Urgencia",
  "Fecha",
  "Creado Por",
  "Asignado A",
  "Descripción"
];

const InconvenientesMobile: React.FC<InconvenientesMobileProps> = ({
  inconvenientes,
  setInconvenientes,
  open,
  setOpen,
  handleEstadoChange,
  selectedInconveniente,
}) => {
  const { theme } = useContext(ContextoGeneral);

  const getActionButton = (inconveniente: Inconveniente) => {
    if (inconveniente.estado.nombre.toLowerCase() === "pendiente") {
      return (
        <Button
          fullWidth
          sx={{ color: theme.colores.azul, background: "transparent", boxShadow: "none", textTransform: "none", mt: 2 }}
          onClick={() => handleEstadoChange(inconveniente.id, 2)}
        >
          Atender
        </Button>
      );
    } else if (inconveniente.estado.nombre.toLowerCase() === "activo") {
      return (
        <Button
          fullWidth
          sx={{ color: theme.colores.azul, background: "transparent", boxShadow: "none", textTransform: "none", mt: 2 }}
          onClick={() => handleEstadoChange(inconveniente.id, 3)}
        >
          Resolver
        </Button>
      );
    }
    return null;
  };

  return (
    <MobileCardList
      titulo="Inconvenientes"
      entidad="Inconveniente"
      fields={fields}
      headerNames={headerNames}
      FormularioCreador={InconvenienteForm}
      datos={inconvenientes}
      setDatos={setInconvenientes}
      seleccionado={selectedInconveniente}
      openDialog={open}
      handleOpenDialog={() => setOpen(true)}
      handleCloseDialog={() => setOpen(false)}
      tituloField="titulo"
      subtituloField="estado.nombre"
      ocultarBotonesAccion={true}
      childrenCollapseFn={(item: Inconveniente) => (
        <Box>
          {getActionButton(item)}
        </Box>
      )}
    />
  );
};

export default InconvenientesMobile; 