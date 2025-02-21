/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useContext, useEffect, useState } from "react";
import { Dialog, DialogTitle, DialogContent } from "@mui/material";
import { GridColDef } from "@mui/x-data-grid";
import BorderColorIcon from "@mui/icons-material/BorderColor";
import { ContextoGeneral } from "../Contexto";
import CreadorEntidad from "../dialogs/CreadorEntidad";
import { GridTemplate } from "../grid/GridTemplate"; // Asegúrate de ajustar la ruta
// import useTransformarCampo from "../hooks/useTransformarCampo"; // Si lo usas en otro lado

export default function TablaTemplate({
  titulo,
  entidad,
  endpoint,
  fields,
  headerNames,
  FormularioCreador,
  usarPruebas = false,
}: {
  titulo: string;
  entidad: string;
  endpoint: string;
  fields: string[];
  headerNames: string[];
  FormularioCreador: React.ComponentType<any>;
  usarPruebas?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [seleccionado, setSeleccionado] = useState<any>(null);
  const { backendURL, pruebas, theme } = useContext(ContextoGeneral);
  const [datos, setDatos] = useState<any[]>([]);
  const [estadoCarga, setEstadoCarga] = useState("Cargando");

  const apiURL = usarPruebas ? pruebas : backendURL;

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
  }, []);

  const handleOpen = (item: any) => {
    if (item) {
      setSeleccionado(item);
    }
    setOpen(true);
  };

  const handleClose = () => {
    setSeleccionado(null);
    setOpen(false);
  };

  // Función para transformar campos (puedes moverla o reutilizar el hook si lo prefieres)
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
      default:
        return value || "No especificado";
    }
  };

  // Genera las columnas a partir de los arrays de props
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

  // Agrega la columna de edición
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

  // Transforma los datos para el grid
  const transformedRows = datos.map((item) => {
    const datosNormalizado = { ...item };
    fields.forEach((field) => {
      datosNormalizado[field] = transformarCampo(field, item[field]);
    });
    return datosNormalizado;
  });

  return (
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
    </>
  );
}
