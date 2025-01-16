import EditIcon from "@mui/icons-material/Edit";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  Box,
  Button,
  CircularProgress,
  Collapse,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
} from "@mui/material";
import React, { useContext, useEffect, useState } from "react";
import { ContextoGeneral } from "../Contexto";
import MobileEditToolbar from "./MobileEditToolbar";
import CreadorEntidad from "../dialogs/CreadorEntidad";
import FilterDialog from "../dialogs/tablas/FilterDialog";
import jsPDF from "jspdf";
import "jspdf-autotable";
import autoTable from "jspdf-autotable";

interface MobileCardListProps {
  titulo: string;
  entidad: string;
  endpoint: string;
  fields: string[];
  headerNames: string[];
  usarPruebas?: boolean;
  FormularioCreador: React.ComponentType<any>;
  customIcon?: string;
  tituloField?: string;
  subtituloField?: string;
}

const transformarCampo = (field: string, value: any) => {
  switch (field) {
    case "localidad":
      return value
        ? `${value.nombre} / ${value.provincia?.nombre || "Sin provincia"}`
        : "No especificado";
    case "empresas":
      return Array.isArray(value)
        ? value
            .map((empresa: any) => `${empresa.nombreFantasia} - ${empresa.cuit}`)
            .join(", ")
        : "No especificado";
    case "roles":
      if (Array.isArray(value)) {
          return value.map((rol: any) => `${rol.nombre}`).join(", ");
      }
      return "No especificado";
    case "rol":
      return value ? `${value.nombre}` : "Sin rol";
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

const MobileCardList: React.FC<MobileCardListProps> = ({
  titulo,
  entidad,
  endpoint,
  fields,
  headerNames,
  usarPruebas = false,
  FormularioCreador,
  customIcon,
  tituloField,
  subtituloField,
}) => {
  const { backendURL, pruebas, theme } = useContext(ContextoGeneral);
  const [datos, setDatos] = useState<any[]>([]);
  const [originalDatos, setOriginalDatos] = useState<any[]>([]);
  const [filteredDatos, setFilteredDatos] = useState<any[]>([]);

  const [estadoCarga, setEstadoCarga] = useState("Cargando");
  const [expandedCard, setExpandedCard] = useState<number | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [seleccionado, setSeleccionado] = useState<any>(null);

  const [openFilterDialog, setOpenFilterDialog] = useState(false);

  const apiURL = usarPruebas ? pruebas : backendURL;

  const refreshDatos = () => {
    setEstadoCarga("Cargando");
    fetch(`${apiURL}/${endpoint}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true",
      },
    })
      .then((response) => {
        if (!response.ok) throw new Error("Error en la respuesta del servidor");
        return response.json();
      })
      .then((data) => {
        setDatos(data);
        setOriginalDatos(data);
        setFilteredDatos(data);
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

  const handleSearch = (query: string) => {
    const lowercasedQuery = query.toLowerCase();
    const filtered = datos.filter((item) => {
      const matchesDirectFields = Object.values(item).some((value) =>
        typeof value === "string" &&
        value.toLowerCase().includes(lowercasedQuery)
      );

      const matchesNestedFields = [
        item.localidad?.nombre,
        item.localidad?.provincia?.nombre,
        ...(Array.isArray(item.empresas)
          ? item.empresas.map((empresa: any) => empresa.nombreFantasia)
          : []),
        ...(Array.isArray(item.empresas)
          ? item.empresas.map((empresa: any) => empresa.cuit.toString())
          : []),
        item.rol?.nombre,
      ]
        .filter((nestedValue) => nestedValue)
        .some((nestedValue) =>
          nestedValue.toLowerCase().includes(lowercasedQuery)
        );
  
      return matchesDirectFields || matchesNestedFields;
    });
  
    setFilteredDatos(filtered);
  };

  

  const applyOperator = (operator: unknown, variable: string, value: string) => {
    switch (operator) {
      case "contains":
        return variable.includes(value);
      case "does not contain":
        return !variable.includes(value);
      case "equals":
        return variable === value;
      case "does not equal":
        return variable !== value;
      case "starts with":
        return variable.startsWith(value);
      case "ends with":
        return variable.endsWith(value);
      default:
        return true;
    }
  };

  interface Filter {
    column: string;
    operator: string;
    value: string;
  }

  const handleFilterApply = (filter: Filter) => {
    const { column, operator, value } = filter;
    const filtered = datos.filter((item) => {
      const fieldValue = item[column];
  
      if (typeof fieldValue === "object") {
        if (Array.isArray(fieldValue)) {
          if (column === "empresas") {
            return fieldValue.some((empresa: any) =>
              applyOperator(operator, empresa.nombreFantasia, value)
            );
          } else {
            return fieldValue.some((nestedValue) =>
              applyOperator(operator, nestedValue.nombre || nestedValue.toString(), value)
            );
          }
        } else if (fieldValue.nombre) {
          return applyOperator(operator, fieldValue.nombre, value);
        }
        return false;
      }
      return applyOperator(operator, fieldValue, value);
    });
    setFilteredDatos(filtered);
  };

  const handleUndoFilter = () => {
    setFilteredDatos(originalDatos);
  };

  const handleOpenFilterDialog = () => {
    setOpenFilterDialog(true);
  };

  const handleCloseFilterDialog = () => {
    setOpenFilterDialog(false);
  };

  const exportarCSV = () => {
    const csvContent = [
      headerNames.join(","),
      ...filteredDatos.map((item) =>
        fields
          .map((field) => {
            const valor = transformarCampo(field, item[field]);
            const valorString = typeof valor === "string" ? valor : String(valor);
            return `"${valorString.replace(/"/g, '""')}"`;
          })
          .join(",")
      ),
    ].join("\n");
  
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
  
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${entidad}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportarPDF = () => {
    const doc = new jsPDF({ orientation: "landscape" });
  
    doc.setFontSize(18);
    doc.text(`Reporte de ${entidad}`, 14, 20);
    
    //Datos de la tabla
    const tableData = filteredDatos.map((item) =>
      fields.map((field) => transformarCampo(field, item[field]))
    );
  
    // Encabezados
    const tableHeaders = headerNames;
  
    // Crear la tabla
    autoTable(doc, {
      head: [tableHeaders],
      body: tableData,
      startY: 30,
      styles: { fontSize: 6 },
    });
  
    // Guardar el archivo
    doc.save(`${entidad}.pdf`);
  };

  const handleExport = (formato: "csv" | "pdf") => {
    if (formato === "csv") {
      exportarCSV();
    } else if (formato === "pdf") {
      exportarPDF();
    }
  };

  const handleExpandClick = (index: number) => {
    setExpandedCard(expandedCard === index ? null : index);
  };

  const handleOpenDialog = (item: any) => {
    setSeleccionado(item);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setSeleccionado(null);
    setOpenDialog(false);
  };

  const renderCards = (datos: any[]) =>
    datos.map((item, index) => (
      <Box
        key={index}
        sx={{
          border: "1px solid #ccc",
          marginBottom: 2,
          borderRadius: 2,
          boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
          overflow: "hidden",
        }}
      >
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          sx={{ padding: 2, backgroundColor: "#f5f5f5", cursor: "pointer" }}
          onClick={() => handleExpandClick(index)}
        >
          <Box display="flex" alignItems="center" gap={2}>
            <Box
              sx={{
                width: 40,
                height: 40,
                backgroundColor: theme.colores.azul,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "4px",
              }}
            >
              <img
                src={customIcon || "src/assets/CAMION.svg"}
                alt="Icono"
                style={{ width: "80%", height: "80%", objectFit: "contain" }}
              />
            </Box>
            <Box>
              <Typography variant="subtitle1" fontWeight="bold">
                {transformarCampo(tituloField || fields[0], item[tituloField || fields[0]]) || "Sin título"}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {subtituloField && item[subtituloField]
                  ? transformarCampo(subtituloField, item[subtituloField])
                  : ""}
              </Typography>
            </Box>
          </Box>
          <IconButton
            sx={{
              transform:
                expandedCard === index ? "rotate(180deg)" : "rotate(0deg)",
              transition: "0.3s",
            }}
          >
            <ExpandMoreIcon />
          </IconButton>
        </Box>
        <Collapse in={expandedCard === index} timeout="auto" unmountOnExit>
          <Box sx={{ padding: 2 }}>
            {fields.map((field, idx) => (
              <Box key={idx} marginBottom={1}>
                <Typography variant="body2" fontWeight="bold">
                  {headerNames[idx]}:
                </Typography>
                <Typography variant="body2">
                  {transformarCampo(field, item[field])}
                </Typography>
              </Box>
            ))}
            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              fullWidth
              sx={{ marginTop: 2 }}
              onClick={() => handleOpenDialog(item)}
            >
              Editar
            </Button>
          </Box>
        </Collapse>
      </Box>
    ));

  if (estadoCarga === "Cargando") {
    return (
      <Box
        display="flex"
        flexDirection="row"
        width="100%"
        height="100%"
        justifyContent="center"
        alignItems="center"
        gap={3}
      >
        <CircularProgress />
        <Typography variant="h5">
          <b>Cargando...</b>
        </Typography>
      </Box>
    );
  }

  return (
    <Box padding={2}>
      <Typography variant="h5" gutterBottom>
        {titulo}
      </Typography>
      <MobileEditToolbar
        onAdd={() => handleOpenDialog(null)}
        onFilter={handleOpenFilterDialog}
        onExport={handleExport}
        onSearch={handleSearch}
        name={entidad}
      />
      {renderCards(filteredDatos)}
      <FilterDialog
        open={openFilterDialog}
        onClose={handleCloseFilterDialog}
        onApplyFilter={handleFilterApply}
        columns={fields}
        onUndoFilter={handleUndoFilter}
      />
      
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>
          {seleccionado ? `Editar ${entidad}` : `Crear ${entidad}`}
        </DialogTitle>
        <DialogContent>
          <CreadorEntidad
            seleccionado={seleccionado}
            handleClose={handleCloseDialog}
            datos={datos}
            setDatos={setDatos}
            nombreEntidad={entidad}
            Formulario={FormularioCreador}
          />
        </DialogContent>
      </Dialog>
      
    </Box>
  );
};

export default MobileCardList;
