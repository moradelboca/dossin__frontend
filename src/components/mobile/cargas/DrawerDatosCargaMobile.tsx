import { Box, Typography, IconButton } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import { useContext } from "react";
import { ContextoCargas } from "../../cargas/containers/ContainerTajetasCargas";

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
    plantaProcedenciaRuca,
    destinoRuca
  } = cargaSeleccionada || {};

  const { handleClickAbrirDialog } = useContext(ContextoCargas);

  // Ejemplo de función para manejar la edición de cada campo
  const handleEdit = (fieldLabel: string) => {
    // Mapeo de campo a paso del stepper según CrearCargaStepper
    const pasoPorCampo: Record<string, number> = {
      // Paso 0: Ubicación y horarios
      "Hora Inicio Carga": 0,
      "Hora Fin Carga": 0,
      "Ubicación Carga": 0,
      "Hora Inicio Descarga": 0,
      "Hora Fin Descarga": 0,
      "Ubicación Descarga": 0,
      "Hora Inicio Balanza": 0,
      "Hora Fin Balanza": 0,
      "Ubicación Balanza": 0,
      // Paso 1: Kilómetros y cargamento
      "Kilómetros": 1,
      "Cargamento": 1,
      // Paso 2: Tarifa
      "Tarifa": 2,
      "Incluye IVA": 2,
      // Paso 3: Tipos de Acoplados
      "Tipos de Acoplados": 3,
      // Paso 4: Más información
      "Tolerancia": 4,
      "Creado Por": 4,
      "Descripción": 4,
      "Planta Procedencia Ruca": 4,
      "Destino Ruca": 4,
    };
    const paso = pasoPorCampo[fieldLabel] ?? 0;
    if (handleClickAbrirDialog) handleClickAbrirDialog(paso);
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
    { label: "Planta Procedencia Ruca", value: plantaProcedenciaRuca || "-" },
    { label: "Destino Ruca", value: destinoRuca || "-" },
  ];

  return (
    <Box sx={{ p: 2, backgroundColor: "#ffffff", height: '100%', display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
      <Box sx={{ flex: 1, overflowY: 'auto' }}>
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
    </Box>
  );
}
