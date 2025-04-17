import BorderColorIcon from "@mui/icons-material/BorderColor";
import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  useMediaQuery,
} from "@mui/material";
import { GridColDef } from "@mui/x-data-grid";
import React, { useContext, useEffect, useState } from "react";
import { ContextoGeneral } from "../Contexto";
import CreadorEntidad from "../dialogs/CreadorEntidad";
import { GridTemplate } from "../grid/GridTemplate";
import MobileCardList from "../mobile/MobileCardList";
//import { dataPruebas } from "./dataauthURL";

interface TablaTemplateProps {
  titulo: string;
  entidad: string;
  endpoint: string;
  fields: string[];
  headerNames: string[];
  FormularioCreador: React.ComponentType<any>;
  usarAuthURL?: boolean;
  renderFullScreen?: boolean; // Activa el modo pantalla completa
  // Props extras para la vista mobile
  tituloField?: string;
  subtituloField?: string;
}

export default function TablaTemplate({
  titulo,
  entidad,
  endpoint,
  fields,
  headerNames,
  FormularioCreador,
  usarAuthURL = false,
  renderFullScreen = false,
  tituloField,
  subtituloField,
}: TablaTemplateProps) {
  // Uso de media query para detectar dispositivos móviles
  const isMobile = useMediaQuery("(max-width:768px)");

  // Estados compartidos para la edición/creación
  const [open, setOpen] = useState(false);
  const [seleccionado, setSeleccionado] = useState<any>(null);
  const { backendURL, authURL, theme } = useContext(ContextoGeneral);
  const [datos, setDatos] = useState<any[]>([]);
  const [estadoCarga, setEstadoCarga] = useState("Cargando");

  const apiURL = usarAuthURL ? authURL : backendURL;
  const refreshDatos = () => {
    fetch(`${apiURL}/${endpoint}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true",
      },
    })
      .then((response) => {
        if (!response.ok) throw new Error("Error en el servidor");
        return response.json();
      })
      .then((data) => {
        setDatos(data);
        setEstadoCarga("Cargado");
      })
      .catch((error) => {
        console.error(`Error al cargar datos para ${entidad}:`, error);
        setEstadoCarga("Error");
      });
  };

  useEffect(() => {
    refreshDatos();
    //setDatos(dataPruebas);
    //setEstadoCarga("Cargado");
  }, [apiURL]);

  const handleOpen = (item: any) => {
    // Se asigna el item seleccionado (puede ser null para crear)
    setSeleccionado(item);
    setOpen(true);
  };

  const handleClose = () => {
    setSeleccionado(null);
    setOpen(false);
    refreshDatos();
  };

  // Función para transformar campos según sea necesario (para escritorio)
  const transformarCampo = (field: string, value: any) => {
    switch (field) {
      case "localidad":
        if (value) {
          return `${value.nombre} / ${value.provincia?.nombre || "Sin provincia"}`;
        }
        return "No especificado";
      case "empresas":
        if (Array.isArray(value)) {
          return value
            .map((empresa: any) => `${empresa.nombreFantasia} - ${empresa.cuit}`)
            .join(", ");
        }
        return "No especificado";
      case "roles":
        if (Array.isArray(value)) {
          return value.map((rol: any) => `${rol.nombre}`).join(", ");
        }
        return "No especificado";
      case "rol":
        if (value) {
          return `${value.nombre}` || "Sin rol";
        }
        return "No especificado";
      case "numeroCel":
        if (value) {
          const numero = value.toString();
          if (numero.length >= 10) {
            const codigo = numero.slice(0, numero.length - 10);
            const celular = numero.slice(-10);
            return `+${codigo}-${celular}`;
          }
        }
        return value || "No especificado";
      case "titularCartaDePorte":
      case "remitenteProductor":
      case "remitenteVentaPrimaria":
      case "remitenteVentaSecundaria":
      case "corredorVentaPrimaria":
      case "corredorVentaSecundaria":
      case "representanteEntregador":
      case "representanteRecibidor":
      case "destinatario":
      case "destino":
      case "intermediarioDeFlete":
      case "fletePagador":
        if (value) {
          const { razonSocial, nombreFantasia } = value;
          return `${nombreFantasia} - ${razonSocial}`;
        }
        return "No especificado";
      case "cargas":
        if (Array.isArray(value)) {
          return value.map((carga: any) => `${carga.id}`).join(", ");
        }
        return "No especificado";
        case "activo":
          return typeof value === "boolean" 
            ? value ? "Activo" : "Inactivo" 
            : "No especificado"
      default:
        return value || "No especificado";
    }
  };

  // Genera las columnas del grid a partir de los arrays de props (versión escritorio)
  const columns: GridColDef[] = fields.map((field, index) => ({
    field: field,
    headerName: headerNames[index],
    flex: 1,
    renderHeader: () => (
      <strong style={{ color: theme.colores.grisOscuro }}>
        {headerNames[index]}
      </strong>
    ),
  }));

  // Columna de edición
  columns.push({
    field: "edit",
    headerName: "Edit",
    width: 100,
    renderHeader: () => (
      <strong style={{ color: theme.colores.grisOscuro }}>Editar</strong>
    ),
    renderCell: (params) => (
      <BorderColorIcon
        onClick={() => handleOpen(params.row)}
        fontSize="small"
        style={{ cursor: "pointer", color: theme.colores.azul }}
      />
    ),
  });

  // Transforma los datos para el grid (versión escritorio)
  const transformedRows = datos.map((item) => {
    const datosNormalizado = { ...item };
    fields.forEach((field) => {
      datosNormalizado[field] = transformarCampo(field, item[field]);
    });
    return datosNormalizado;
  });

  // Si es móvil, delega la renderización en MobileCardList
  if (isMobile) {
    return (
      <MobileCardList
        titulo={titulo}
        entidad={entidad}
        fields={fields}
        headerNames={headerNames}
        usarAuthURL={usarAuthURL}
        FormularioCreador={FormularioCreador}
        tituloField={tituloField}
        subtituloField={subtituloField}
        datos={datos}      
        setDatos={setDatos}
        seleccionado={seleccionado}
        openDialog={open}
        handleOpenDialog={handleOpen}
        handleCloseDialog={handleClose}
      />
    );
  }

  // Versión escritorio
  return (
    <>
      {open && renderFullScreen ? (
        // Modo pantalla completa
        <Box sx={{ padding: 3 }}>
          <FormularioCreador
            seleccionado={seleccionado}
            handleClose={handleClose}
            datos={datos}
            setDatos={setDatos}
            nombreEntidad={entidad}
          />
        </Box>
      ) : (
        <>
          <GridTemplate
            titulo={titulo}
            rows={transformedRows}
            columns={columns}
            loading={estadoCarga === "Cargando"}
            theme={theme}
            getRowId={(row) => row[fields[0]]}
            onAdd={() => handleOpen(null)}
            entityName={entidad}
          />
          {/* Dialog para edición/creación */}
          {!renderFullScreen && (
            <Dialog open={open} onClose={handleClose}>
              <DialogTitle>
                {seleccionado ? `Editar ${entidad}` : `Crear ${entidad}`}
              </DialogTitle>
              <DialogContent>
                <CreadorEntidad
                  seleccionado={seleccionado}
                  handleClose={handleClose}
                  datos={datos}
                  setDatos={setDatos}
                  nombreEntidad={entidad}
                  Formulario={FormularioCreador}
                />
              </DialogContent>
            </Dialog>
          )}
        </>
      )}
    </>
  );
}
