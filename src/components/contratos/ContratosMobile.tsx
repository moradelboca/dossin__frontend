import React, { useState, useEffect } from "react";
import { Box, Typography, Button, Dialog, DialogContent, DialogTitle, TextField, InputAdornment } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import CardMobile from "../cards/mobile/CardMobile";
import ContratoForm from "../forms/contratos/ContratoForm";
import { CustomButtom } from "../botones/CustomButtom";
import CrearCargaStepper from "../cargas/creadores/CrearCargaStepper";

interface ContratosMobileProps {
  contratos: any[];
  refreshContratos: () => void;
  handleOpenDialog: (item: any) => void;
  seleccionado: any;
  open: boolean;
  handleClose: () => void;
  theme: any;
}

const ContratosMobile: React.FC<ContratosMobileProps> = ({
  contratos,
  refreshContratos,
  handleOpenDialog,
  seleccionado,
  open,
  handleClose,
  theme,
}) => {
  // Para expandir cards de contratos
  const [expandedContrato, setExpandedContrato] = useState<number | null>(null);
  // Para expandir cards de cargas
  const [expandedCarga, setExpandedCarga] = useState<number | null>(null);
  // Estado para crear carga
  const [openCrearCarga, setOpenCrearCarga] = useState(false);
  const [contratoParaCarga, setContratoParaCarga] = useState<any>(null);
  // Estado para búsqueda
  const [busqueda, setBusqueda] = useState("");
  const [contratosFiltrados, setContratosFiltrados] = useState<any[]>([]);

  // Campos a mostrar en la card de contrato
  const contratoFields = [
    "titularCartaDePorte.razonSocial",
    "destinatario.razonSocial",
  ];
  const contratoHeaderNames = [
    "Titular",
    "Destinatario",
  ];

  // Campos a mostrar en la card de carga
  const cargaFields = [
    "cantidadKm",
    "tarifa",
    "tipoTarifa.nombre",
    "cargamento.nombre",
  ];
  const cargaHeaderNames = [
    "Kilómetros",
    "Tarifa",
    "Unidad",
    "Cargamento",
  ];

  // Inicializar contratos filtrados cuando se cargan los contratos
  useEffect(() => {
    setContratosFiltrados(contratos);
  }, [contratos]);

  // Filtrar contratos basado en la búsqueda
  useEffect(() => {
    if (!busqueda) {
      setContratosFiltrados(contratos);
    } else {
      const filtered = contratos.filter((contrato) => {
        const searchLower = busqueda.toLowerCase();
        return (
          contrato.id.toString().includes(searchLower) ||
          contrato.titularCartaDePorte?.razonSocial?.toLowerCase().includes(searchLower) ||
          contrato.destinatario?.razonSocial?.toLowerCase().includes(searchLower) ||
          JSON.stringify(contrato).toLowerCase().includes(searchLower)
        );
      });
      // Mantener el orden descendente por ID
      const sortedFiltered = [...filtered].sort((a, b) => b.id - a.id);
      setContratosFiltrados(sortedFiltered);
    }
  }, [busqueda, contratos]);

  const handleExpandContrato = (index: number) => {
    setExpandedContrato(expandedContrato === index ? null : index);
  };
  const handleExpandCarga = (index: number) => {
    setExpandedCarga(expandedCarga === index ? null : index);
  };

  // Handler para crear carga
  const handleCrearCarga = (contrato: any) => {
    setContratoParaCarga(contrato);
    setOpenCrearCarga(true);
  };

  // Handler para cuando se crea la carga
  const handleCargaCreated = async (nuevaCarga: any) => {
    try {
      // 1. Crear la carga
      const backendURL = import.meta.env.VITE_BACKEND_URL || '';
      const resCarga = await fetch(`${backendURL}/cargas`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify(nuevaCarga.payload),
      });
      if (!resCarga.ok) throw new Error("Error creando carga");
      const cargaCreada = await resCarga.json();
      // 2. Actualizar contrato con la nueva carga
      const idsExistentes = contratoParaCarga.cargas?.map((c: any) => c.id) || [];
      const payloadContrato = {
        idsCargas: [
          ...(contratoParaCarga.idsCargas || []),
          ...idsExistentes,
          cargaCreada.id,
        ],
      };
      await fetch(`${backendURL}/contratos/${contratoParaCarga.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify(payloadContrato),
      });
      refreshContratos();
      setOpenCrearCarga(false);
      setContratoParaCarga(null);
    } catch (error) {
      console.error("Error en el proceso de crear carga:", error);
    }
  };

  return (
    <Box padding={2}>
      <Typography variant="h5" gutterBottom color={theme.colores.azul}>
        Contratos
      </Typography>
      <Box display="flex" justifyContent="flex-end" mb={2}>
        <Button
          sx={{ color: theme.colores.azul, fontWeight: 600 }}
          onClick={() => handleOpenDialog(null)}
        >
          Agregar contrato +
        </Button>
      </Box>
      
      {/* Campo de búsqueda */}
      <TextField
        variant="outlined"
        size="small"
        placeholder="Buscar contratos..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        fullWidth
        sx={{
          mb: 1,
          backgroundColor: "#fff",
          borderRadius: "50px",
          maxWidth: "400px",
        }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon color="action" />
            </InputAdornment>
          ),
        }}
      />
      
      {contratosFiltrados.length > 0 ? (
        contratosFiltrados.map((contrato, idx) => (
          <Box key={contrato.id || idx} mb={3}>
            <CardMobile
              item={contrato}
              index={idx}
              fields={contratoFields}
              headerNames={contratoHeaderNames}
              expandedCard={expandedContrato}
              handleExpandClick={handleExpandContrato}
              tituloField="titularCartaDePorte.razonSocial"
              subtituloField="destinatario.razonSocial"
              usarSinDesplegable={false}
              noEsTurno={true}
              childrenCollapse={
                expandedContrato === idx && (
                  <Box display="flex" gap={2} mt={1}>
                    <CustomButtom
                      title="Editar contrato"
                      onClick={() => handleOpenDialog(contrato)}
                    />
                    <CustomButtom
                      title="Crear carga +"
                      onClick={() => handleCrearCarga(contrato)}
                    />
                  </Box>
                )
              }
            />
            {/* Cargas asociadas */}
            {expandedContrato === idx && contrato.cargas && contrato.cargas.length > 0 && (
              <Box mt={1} ml={2}>
                <Typography variant="subtitle1" color={theme.colores.azul} mb={1}>
                  Cargas asociadas
                </Typography>
                {contrato.cargas.map((carga: any, cidx: number) => (
                  <CardMobile
                    key={carga.id || cidx}
                    item={carga}
                    index={cidx}
                    fields={cargaFields}
                    headerNames={cargaHeaderNames}
                    expandedCard={expandedCarga}
                    handleExpandClick={handleExpandCarga}
                    tituloField="ubicacionCarga.nombre"
                    subtituloField="ubicacionDescarga.nombre"
                    usarSinDesplegable={false}
                    noEsTurno={true}
                  />
                ))}
              </Box>
            )}
          </Box>
        ))
      ) : (
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          height="50vh"
          gap={2}
        >
          <Typography variant="h6" color="textSecondary">
            {contratos.length > 0 ? "No se encontraron resultados" : "No hay contratos disponibles"}
          </Typography>
          <Typography variant="body2" color="textSecondary" textAlign="center">
            {contratos.length > 0 ? "Intenta con otros términos de búsqueda" : "Hacé clic en \"Agregar contrato +\" para crear tu primer contrato"}
          </Typography>
        </Box>
      )}
      {/* Dialog para crear/editar contrato */}
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
        <DialogTitle>{seleccionado ? "Editar Contrato" : "Crear Contrato"}</DialogTitle>
        <DialogContent>
          <ContratoForm
            seleccionado={seleccionado}
            datos={contratos}
            setDatos={() => {}}
            handleClose={handleClose}
            refreshContratos={refreshContratos}
          />
        </DialogContent>
      </Dialog>
      {/* Dialog para crear carga */}
      <Dialog open={openCrearCarga} onClose={() => setOpenCrearCarga(false)} fullWidth maxWidth="lg">
        <DialogTitle>Crear Nueva Carga</DialogTitle>
        <DialogContent sx={{ height: "80vh" }}>
          <CrearCargaStepper
            datosCarga={{}}
            creando={true}
            handleCloseDialog={() => setOpenCrearCarga(false)}
            onCargaCreated={handleCargaCreated}
          />
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default ContratosMobile; 