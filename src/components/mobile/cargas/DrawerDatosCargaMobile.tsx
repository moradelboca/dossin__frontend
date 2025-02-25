import { Box, Typography, IconButton } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";

interface DrawerDatosCargaMobileProps {
  cargaSeleccionada: any;
}

export default function DrawerDatosCargaMobile({
  cargaSeleccionada,
}: DrawerDatosCargaMobileProps) {
  const {
    tarifa,
    tipoTarifa,
    incluyeIVA,
    cantidadKm,
    proveedor,
    cargamento,
    tiposAcoplados,
    horaInicioCarga,
    horaFinCarga,
    ubicacionCarga,
    horaInicioDescarga,
    horaFinDescarga,
    ubicacionDescarga,
    horaInicioBalanza,
    horaFinBalanza,
    ubicacionBalanza,
    tolerancia,
    creadoPor,
    descripcion,
  } = cargaSeleccionada || {};

  // Ejemplo de función para manejar la edición de cada campo
  const handleEdit = (fieldLabel: string) => {
    console.log("Editar:", fieldLabel);
    // Aquí abrirías tu diálogo o la lógica de edición correspondiente
  };

  // Array con la definición de los campos que se van a mostrar
  const fields = [
    {
      label: "Tarifa",
      value: tarifa
        ? `$${tarifa} / ${tipoTarifa?.nombre || "Sin tipoTarifa"}`
        : "Sin definir",
    },
    { label: "Incluye IVA", value: incluyeIVA ? "Sí" : "No" },
    { label: "Kilómetros", value: cantidadKm || 0 },
    { label: "Proveedor", value: proveedor?.nombre || "No definido" },
    {
      label: "Cargamento",
      value: `${cargamento?.nombre || "No definido"} / ${
        cargamento?.tipoCargamento?.nombre || "Sin tipo"
      }`,
    },
    {
      label: "Tipos de Acoplados",
      value:
        tiposAcoplados && tiposAcoplados.length > 0
          ? tiposAcoplados.map((acoplado: any) => acoplado.nombre).join(", ")
          : "No especificado",
    },
    { label: "Hora Inicio Carga", value: horaInicioCarga || "-" },
    { label: "Hora Fin Carga", value: horaFinCarga || "-" },
    {
      label: "Ubicación Carga",
      value: ubicacionCarga?.nombre || "No definida",
    },
    { label: "Hora Inicio Descarga", value: horaInicioDescarga || "-" },
    { label: "Hora Fin Descarga", value: horaFinDescarga || "-" },
    {
      label: "Ubicación Descarga",
      value: ubicacionDescarga?.nombre || "No definida",
    },
    { label: "Hora Inicio Balanza", value: horaInicioBalanza || "-" },
    { label: "Hora Fin Balanza", value: horaFinBalanza || "-" },
    {
      label: "Ubicación Balanza",
      value: ubicacionBalanza?.nombre || "No definida",
    },
    { label: "Tolerancia", value: tolerancia !== undefined ? tolerancia : "-" },
    { label: "Creado Por", value: creadoPor || "-" },
    { label: "Descripción", value: descripcion || "-" },
  ];

  return (
    <Box sx={{ p: 2, overflowY: "auto", backgroundColor: "#ffffff" }}>
      {fields.map((field, idx) => (
        <Box
          key={idx}
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 2,
          }}
        >
          {/* Sección de Label + Valor (en vertical) */}
          <Box sx={{ display: "flex", flexDirection: "column" }}>
            <Typography variant="body2" fontWeight="bold">
              {field.label}
            </Typography>
            <Typography variant="body2" sx={{ color: "#90979f" }}>
              {field.value}
            </Typography>
          </Box>

          {/* Ícono de edición a la derecha */}
          <IconButton onClick={() => handleEdit(field.label)}>
            <EditIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Box>
      ))}
    </Box>
  );
}
