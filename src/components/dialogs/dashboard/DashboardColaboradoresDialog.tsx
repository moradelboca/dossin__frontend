// DashboardColaboradoresDialog.tsx
import React, { useState, useContext } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { ContextoGeneral } from "../../Contexto";
import CardMobile from "../../cards/mobile/CardMobile";

// Define las interfaces según tu modelo de datos (ajústalas si es necesario)
interface Pais {
  nombre: string;
  id: number;
}

interface Provincia {
  nombre: string;
  id: number;
  pais: Pais;
}

interface Localidad {
  nombre: string;
  id: number;
  provincia: Provincia;
}

interface Rol {
  nombre: string;
  id: number;
}

interface Empresa {
  cuit: number;
  razonSocial: string;
  nombreFantasia: string;
  localidad: Localidad;
  numeroCel: string;
  urlConstanciaAfip: string;
  urlConstanciaCBU: string;
  roles: { nombre: string; id: number }[];
  email: string;
}

export interface Colaborador {
  cuil: number;
  nombre: string;
  numeroCel: string;
  apellido: string;
  fechaNacimiento: string;
  urlLINTI: string;
  localidad: Localidad;
  empresas: Empresa[];
  rol: Rol;
  nuevoColaborador: boolean;
}

export interface ColaboradoresData {
  Cantidad: number;
  Colaboradores: Colaborador[];
}

interface DashboardColaboradoresDialogProps {
  open: boolean;
  handleClose: () => void;
  colaboradores: ColaboradoresData | undefined;
}

const DashboardColaboradoresDialog: React.FC<DashboardColaboradoresDialogProps> = ({
  open,
  handleClose,
  colaboradores
}) => {
  const { theme } = useContext(ContextoGeneral);
  const [expandedCard, setExpandedCard] = useState<number | null>(null);

  const handleExpandClick = (index: number) => {
    setExpandedCard(expandedCard === index ? null : index);
  };

  // Estos son los fields y headerNames para la CardMobile.
  // Puedes modificarlos si necesitas acceder a propiedades anidadas o formatear el contenido.
  const fields = [
    "cuil",
    "nombre",
    "numeroCel",
    "apellido",
    "urlLINTI",
    "localidad",   // Si necesitas mostrar propiedades específicas de la localidad, podrías crear un método o transformar el dato.
    "empresas",    // Similarmente, podrías extraer el cuit o nombre de la(s) empresa(s)
    "rol"
  ];
  const headerNames = [
    "Cuil",
    "Nombre",
    "Número Celular",
    "Apellido",
    "URL Linti",
    "Localidad",
    "Cuit Empresas",
    "Rol"
  ];

  // Definimos el título y subtítulo (opcional) para la CardMobile.
  const tituloField = "nombre";
  const subtituloField = "apellido";
  const customIcon = undefined; // Puedes pasar un ícono personalizado si lo requieres

  const renderCards = (datos: Colaborador[]) =>
    datos.map((item, index) => (
      <CardMobile
        key={item.cuil || index}
        item={item}
        index={index}
        fields={fields}
        headerNames={headerNames}
        expandedCard={expandedCard}
        handleExpandClick={handleExpandClick}
        tituloField={tituloField}
        subtituloField={subtituloField}
        customIcon={customIcon}
        mostrarBotonEditar={false}
      />
    ));

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
      <DialogTitle sx={{ m: 0, p: 2 }}>
        Colaboradores
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
            color: theme.colores.azul
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Typography variant="subtitle1">
          Cantidad: {colaboradores ? colaboradores.Cantidad : 0}
        </Typography>
        {colaboradores && colaboradores.Colaboradores && colaboradores.Colaboradores.length > 0 ? (
          renderCards(colaboradores.Colaboradores)
        ) : (
          <Typography>No hay colaboradores</Typography>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default DashboardColaboradoresDialog;
