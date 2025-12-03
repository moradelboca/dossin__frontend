// src/components/TablaTemplate.tsx
import BorderColorIcon from "@mui/icons-material/BorderColor";
import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  useMediaQuery,
  Avatar,
} from "@mui/material";
import { GridColDef } from "@mui/x-data-grid";
import React, { useContext, useEffect, useMemo, useState } from "react";
import { ContextoGeneral } from "../Contexto";
import CreadorEntidad from "../dialogs/CreadorEntidad";
import { GridTemplate } from "../grid/GridTemplate";
import MobileCardList from "../mobile/MobileCardList";
import { axiosGet } from "../../lib/axiosConfig";

interface TablaTemplateProps {
  titulo: string;
  entidad: string;
  endpoint: string;
  fields: string[];
  headerNames: string[];
  FormularioCreador: React.ComponentType<any>;
  usarAuthURL?: boolean;
  renderFullScreen?: boolean;
  tituloField?: string;
  subtituloField?: string;
}

function limpiarNoEspecificados<T extends Record<string, any>>(obj: T | null): T | null {
  if (!obj) return null;
  const clean: any = {};
  Object.entries(obj).forEach(([key, val]) => {
    // si es exactamente la cadena "No especificado", lo pasamos a null
    if (typeof val === "string" && val === "No especificado") {
      clean[key] = null;
    } else {
      clean[key] = val;
    }
  });
  return clean;
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
  const isMobile = useMediaQuery("(max-width:768px)");
  const [open, setOpen] = useState(false);
  const [seleccionado, setSeleccionado] = useState<any>(null);
  const { backendURL, authURL, theme } = useContext(ContextoGeneral);
  const [datos, setDatos] = useState<any[]>([]);
  const [estadoCarga, setEstadoCarga] = useState<"Cargando"|"Cargado"|"Error">("Cargando");

  // 1️⃣ Limpiamos el seleccionado cada vez que cambie:
  const seleccionadoLimpio = useMemo(
    () => limpiarNoEspecificados(seleccionado),
    [seleccionado]
  );
  

  const apiURL = usarAuthURL ? authURL : backendURL;
  const refreshDatos = () => {
    axiosGet<any[]>(endpoint, apiURL)
      .then(d => { setDatos(d); setEstadoCarga("Cargado"); })
      .catch(() => { setEstadoCarga("Error"); });
  };
  useEffect(() => { refreshDatos(); }, [apiURL, endpoint]);

  const handleOpen = (item: any) => { setSeleccionado(item); setOpen(true); };
  const handleClose = () => { setSeleccionado(null); setOpen(false); refreshDatos(); };

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
      case "cartaDePorte":
        if (Array.isArray(value) && value.length > 0) {
          return value.map((carta: any) => `${carta.numeroCartaPorte}`).join(", ");
        }
        return "No especificado";
      case "cartaDePorte.numeroCartaPorte":
        if (Array.isArray(value) && value.length > 0) {
          return value.map((carta: any) => `${carta.numeroCartaPorte}`).join(", ");
        }
        return "No especificado";
      case "cartaDePorte.CTG":
        if (Array.isArray(value) && value.length > 0) {
          return value.map((carta: any) => `${carta.CTG}`).join(", ");
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

  // Para calcular ancho mínimo basado en el contenido
  const factorPxPorChar = 12;
  const calcMinWidth = (field: string, header: string) => {
    const maxLen = Math.max(
      header.length,
      ...datos.map(item => String(transformarCampo(field, item[field] || "")).length)
    );
    return maxLen * factorPxPorChar;
  };

  // Columnas con minWidth + flex + resizable
  const columns: GridColDef[] = fields.map((field, i) => ({
    field,
    headerName: headerNames[i],
    minWidth: field === 'roles' ? 120 : calcMinWidth(field, headerNames[i]),
    flex: field === 'roles' ? 0.7 : 1,
    resizable: true,
    renderHeader: () => (
      <strong style={{ color: theme.colores.grisOscuro }}>
        {headerNames[i]}
      </strong>
    ),
    ...(field === "imagen"
      ? {
          renderCell: (params: any) => {
            const imageUrl = typeof params.value === 'string' && params.value.startsWith("http") ? params.value : undefined;
            const email = params.row.email || "";
            return (
              <Avatar
                src={imageUrl}
                alt={email}
                imgProps={{ referrerPolicy: "no-referrer" }}
                sx={{ bgcolor: imageUrl ? 'transparent' : theme.colores.azul }}
              >
                {!imageUrl && email ? email[0].toUpperCase() : null}
              </Avatar>
            );
          },
        }
      : {}),
  }));
  // Columna editar
  columns.push({
  field: "edit",
  headerName: "Editar",
  width: 120, // Ancho fijo
  renderHeader: () => (
    <strong style={{ color: theme.colores.grisOscuro }}>Editar</strong>
  ),
  renderCell: params => (
    <div style={{ 
      position: 'sticky',
      right: 0,
      backgroundColor: theme.colores.grisClaro,
      padding: '0 16px',
      margin: '0 -16px 0 0',
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center'
    }}>
      <BorderColorIcon
        onClick={() => handleOpen(params.row)}
        fontSize="small"
        style={{ cursor: "pointer", color: theme.colores.azul }}
      />
    </div>
  ),
  sortable: false,
  filterable: false,
  disableColumnMenu: true,
  headerClassName: 'sticky-header-right',
  cellClassName: 'sticky-cell-right'
});

  const rows = datos.map(item => {
    const r: any = { ...item };
    fields.forEach(f => r[f] = transformarCampo(f, item[f]));
    return r;
  });

  

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

  return (
    <>
      {open && renderFullScreen ? (
        <Box sx={{ p: 3 }}>
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
            rows={rows}
            columns={columns}
            loading={estadoCarga === "Cargando"}
            theme={theme}
            getRowId={row => row[fields[0]]}
            onAdd={() => handleOpen(null)}
            entityName={entidad}
          />
          {!renderFullScreen && (
            <Dialog open={open} onClose={handleClose}>
              <DialogTitle>
                {seleccionado ? `Editar ${entidad}` : `Crear ${entidad}`}
              </DialogTitle>
              <DialogContent>
                <CreadorEntidad
                  seleccionado={seleccionadoLimpio}
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
