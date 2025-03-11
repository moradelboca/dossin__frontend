/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useContext, useState, useEffect } from "react";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Box,
  Typography,
  TextField,
  Snackbar,
  Alert,
} from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import AddIcon from "@mui/icons-material/Add";
import DeleteEntidad from "../../dialogs/DeleteEntidad";
import useValidation from "../../hooks/useValidation";
import { ContextoGeneral } from "../../Contexto";
import AutocompleteEmpresas from "../autocompletes/AutocompleteEmpresas";
import { FormularioProps } from "../../../interfaces/FormularioProps";
import CardMobile from "../../cards/mobile/CardMobile";
import CrearCargaStepper from "../../cargas/creadores/CrearCargaStepper";
import useBuscarEmpresa from "../../hooks/busquedas/useBuscarEmpresa";

const ContratoForm: React.FC<FormularioProps> = ({
  seleccionado,
  datos,
  setDatos,
  handleClose,
}) => {
  const safeSeleccionado = seleccionado || {};
  const { backendURL } = useContext(ContextoGeneral);

  // Estados para eliminación de contrato y cargas
  const [openDialogDelete, setOpenDialogDelete] = useState(false);
  const [openDialogCargasWarning, setOpenDialogCargasWarning] = useState(false);

  // Estados para cargas y diálogo de cargas
  const [cargas, setCargas] = useState<any[]>([]);
  const [openAddCarga, setOpenAddCarga] = useState(false);
  const [selectedCarga, setSelectedCarga] = useState<any>(null);
  const [expandedCard, setExpandedCard] = useState<number | null>(null);
  const [listaCargasCreadas, setListaCargasCreadas] = useState<any[]>([]);

  // Estado para notificación emergente en caso de carga con cupos
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  // Estados para el diálogo de confirmación de eliminación de carga
  const [openDialogConfirmDeleteCarga, setOpenDialogConfirmDeleteCarga] = useState(false);
  const [cargaAEliminar, setCargaAEliminar] = useState<any>(null);

  // Cargar cargas existentes según el contrato.
  useEffect(() => {
    if (safeSeleccionado.cargas && safeSeleccionado.cargas !== "No especificado") {
      const ids = safeSeleccionado.cargas
        .split(",")
        .map((id: string) => id.trim());

      Promise.all(
        ids.map((id: any) =>
          fetch(`${backendURL}/cargas/${id}`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "ngrok-skip-browser-warning": "true",
            },
          }).then((response) => response.json())
        )
      )
        .then((cargasData) => {
          setCargas(cargasData);
        })
        .catch((error) => console.error("Error al cargar las cargas:", error));
    } else {
      setCargas([]);
    }
  }, [backendURL, safeSeleccionado.cargas]);

  // Configuración de validación del formulario
  const { data, errors, validateAll, setData } = useValidation(
    {
      titularCartaDePorte: "",
      destino: "",
      remitente: "",
      plantaProcedenciaRuca: "",
      destinoRuca: "",
      ...safeSeleccionado,
    },
    {
      titularCartaDePorte: (value) => (!value ? "Campo requerido" : null),
      destino: (value) => (!value ? "Campo requerido" : null),
      remitente: (value) => (!value ? "Campo requerido" : null),
      plantaProcedenciaRuca: (value) => (!value ? "Campo requerido" : null),
      destinoRuca: (value) => (!value ? "Campo requerido" : null),
    }
  );

  // Buscar empresas asociadas a cada campo
  const { empresa: empresaTitular, error: errorTitular } = useBuscarEmpresa(data.titularCartaDePorte);
  const { empresa: empresaDestino, error: errorDestino } = useBuscarEmpresa(data.destino);
  const { empresa: empresaRemitente, error: errorRemitente } = useBuscarEmpresa(data.remitente);

  useEffect(() => {
    if (empresaTitular) {
      setData((prevData: any) => ({
        ...prevData,
        titularCartaDePorte: empresaTitular.cuit,
      }));
    }
  }, [empresaTitular, setData]);

  useEffect(() => {
    if (empresaDestino) {
      setData((prevData: any) => ({
        ...prevData,
        destino: empresaDestino.cuit,
      }));
    }
  }, [empresaDestino, setData]);

  useEffect(() => {
    if (empresaRemitente) {
      setData((prevData: any) => ({
        ...prevData,
        remitente: empresaRemitente.cuit,
      }));
    }
  }, [empresaRemitente, setData]);

  const handleExpandClick = (index: number) => {
    setExpandedCard(expandedCard === index ? null : index);
  };

  const handleOpenDialog = (carga: any) => {
    setSelectedCarga(carga);
    setOpenAddCarga(true);
  };

  const handleSubmit = () => {
    if (validateAll()) {
      // Combina cargas existentes y creadas
      const todasLasCargas = [...cargas, ...listaCargasCreadas];
      if (todasLasCargas.length === 0) {
        alert("Debe crear al menos una carga.");
        return;
      }

      const metodo = safeSeleccionado.id ? "PUT" : "POST";
      const url = safeSeleccionado.id
        ? `${backendURL}/contratos/${data.id || safeSeleccionado.id}`
        : `${backendURL}/contratos`;

      const payload = {
        titularCartaDePorte: data.titularCartaDePorte,
        destino: data.destino,
        remitente: data.remitente,
        plantaProcedenciaRuca: data.plantaProcedenciaRuca,
        destinoRuca: data.destinoRuca,
        idsCargas:
          todasLasCargas.length > 0 ? todasLasCargas.map((carga) => carga.id) : [],
      };
      console.log("PAYLOAD: \n", payload);
      fetch(url, {
        method: metodo,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
        .then((response) => {
          if (!response.ok) {
            return response.text().then((text) => {
              throw new Error(`Error ${response.status}: ${text}`);
            });
          }
          return response.json();
        })
        .then((newData) => {
          if (metodo === "POST") {
            setDatos([...datos, newData]);
          } else {
            const datosActualizados = datos.map((contrato: any) =>
              contrato.id === (data.id || safeSeleccionado.id) ? newData : contrato
            );
            setDatos(datosActualizados);
          }
        })
        .catch((error) =>
          console.error("Error al guardar el contrato: ", error.message)
        );
      handleClose();
    }
  };

  // Combina todas las cargas: las obtenidas y las creadas en el form.
  const allCargas = [...cargas, ...listaCargasCreadas];

  // Función para iniciar la eliminación de una carga.
  const handleDeleteCarga = (carga: any) => {
    // Si la carga tiene cupos asignados con valores > 0, se muestra una notificación.
    if (carga.cupos && carga.cupos.some((cupo: any) => cupo.cupos > 0)) {
      setSnackbarMessage("No se puede eliminar la carga. Primero elimine los cupos relacionados.");
      setSnackbarOpen(true);
      return;
    }
    // En lugar de usar window.confirm, se abre un diálogo de confirmación.
    setCargaAEliminar(carga);
    setOpenDialogConfirmDeleteCarga(true);
  };

  // Función que se ejecuta cuando el usuario confirma la eliminación en el diálogo.
  const handleConfirmDeleteCarga = () => {
    if (!cargaAEliminar) return;
    if (cargaAEliminar.id) {
      fetch(`${backendURL}/cargas/${cargaAEliminar.id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
      })
        .then((response) => response.json())
        .then(() => {
          setCargas((prev) => prev.filter((c) => c.id !== cargaAEliminar.id));
          setListaCargasCreadas((prev) => prev.filter((c) => c.id !== cargaAEliminar.id));
        })
        .catch((error) =>
          console.error("Error al borrar la carga", error)
        );
    } else {
      setListaCargasCreadas((prev) => prev.filter((c) => c !== cargaAEliminar));
    }
    setOpenDialogConfirmDeleteCarga(false);
    setCargaAEliminar(null);
  };

  // Función para eliminar el contrato (verifica que no tenga cargas asociadas)
  const handleClickDeleteContrato = () => {
    if (allCargas.length > 0) {
      setOpenDialogCargasWarning(true);
    } else {
      setOpenDialogDelete(true);
    }
  };

  const handleCloseDialogDelete = () => setOpenDialogDelete(false);

  const fields = [
    "id",
    "tarifa",
    "tipoTarifa.nombre",
    "incluyeIVA",
    "cantidadKm",
    "proveedor.nombre",
    "cargamento.nombre",
    "cargamento.tipoCargamento.nombre",
    "tiposAcoplados",
    "horaInicioCarga",
    "horaFinCarga",
    "ubicacionCarga.nombre",
    "horaInicioDescarga",
    "horaFinDescarga",
    "ubicacionDescarga.nombre",
    "horaInicioBalanza",
    "horaFinBalanza",
    "ubicacionBalanza.nombre",
    "tolerancia",
    "creadoPor",
    "descripcion",
  ];
  const headerNames = [
    "ID",
    "Tarifa",
    "Tipo Tarifa",
    "Incluye IVA",
    "Cantidad Km",
    "Proveedor",
    "Nombre Cargamento",
    "Tipo Cargamento",
    "Tipos Acoplados",
    "Hora Inicio Carga",
    "Hora Fin Carga",
    "Ubicación Carga",
    "Hora Inicio Descarga",
    "Hora Fin Descarga",
    "Ubicación Descarga",
    "Hora Inicio Balanza",
    "Hora Fin Balanza",
    "Ubicación Balanza",
    "Tolerancia",
    "Creado Por",
    "Descripcion",
  ];

  return (
    <>
      <Typography variant="h6" mb={2}>
        {safeSeleccionado.id ? "Editar Contrato" : "Crear Contrato"}
      </Typography>

      <AutocompleteEmpresas
        value={data.titularCartaDePorte || null}
        onChange={(newValue) =>
          setData({ ...data, titularCartaDePorte: newValue })
        }
        error={!!errors.titularCartaDePorte || !!errorTitular}
        helperText={
          errors.titularCartaDePorte || (errorTitular ? errorTitular : "")
        }
        labelText="Empresa Titular"
        rolEmpresa="remitente comercial"
      />
      <AutocompleteEmpresas
        value={data.destino || null}
        onChange={(newValue) =>
          setData({ ...data, destino: newValue })
        }
        error={!!errors.destino || !!errorDestino}
        helperText={errors.destino || (errorDestino ? errorDestino : "")}
        labelText="Empresa Destino"
        rolEmpresa="transportista"
      />
      <AutocompleteEmpresas
        value={data.remitente || null}
        onChange={(newValue) =>
          setData({ ...data, remitente: newValue })
        }
        error={!!errors.remitente || !!errorRemitente}
        helperText={errors.remitente || (errorRemitente ? errorRemitente : "")}
        labelText="Empresa Remitente"
        rolEmpresa="remitente comercial"
      />
      <TextField
        label="Planta Procedencia Ruca"
        value={data.plantaProcedenciaRuca || ""}
        onChange={(e) =>
          setData({ ...data, plantaProcedenciaRuca: e.target.value })
        }
        error={!!errors.plantaProcedenciaRuca}
        helperText={errors.plantaProcedenciaRuca}
        fullWidth
        margin="normal"
      />
      <TextField
        label="Destino Ruca"
        value={data.destinoRuca || ""}
        onChange={(e) =>
          setData({ ...data, destinoRuca: e.target.value })
        }
        error={!!errors.destinoRuca}
        helperText={errors.destinoRuca}
        fullWidth
        margin="normal"
      />

      {/* Sección de cargas */}
      <Box mt={4}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Cargas</Typography>
          <IconButton
            color="primary"
            onClick={() => {
              setSelectedCarga(null);
              setOpenAddCarga(true);
            }}
          >
            <AddIcon />
          </IconButton>
        </Box>
        {allCargas.length === 0 ? (
          <Typography>No hay cargas registradas.</Typography>
        ) : (
          allCargas.map((carga, index) => (
            <CardMobile
              key={carga.id || index}
              item={carga}
              index={index}
              fields={fields}
              headerNames={headerNames}
              expandedCard={expandedCard}
              handleExpandClick={handleExpandClick}
              handleOpenDialog={handleOpenDialog}
              tituloField="ubicacionCarga.nombre"
              subtituloField="tarifa"
              mostrarBotonEditar={true}
              // Se pasa la función de eliminación como botón secundario
              textoSecondaryButton="Eliminar"
              handleSecondButton={handleDeleteCarga}
              colorSecondaryButton="#d68384"
            />
          ))
        )}
      </Box>

      {/* Diálogo para crear/editar carga */}
      <Dialog
        open={openAddCarga}
        onClose={() => setOpenAddCarga(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          {selectedCarga ? "Modificando Carga" : "Crear Nueva Carga"}
        </DialogTitle>
        <DialogContent sx={{ height: "80vh", alignContent: "center" }}>
          <CrearCargaStepper
            datosCarga={selectedCarga || {}}
            pasoSeleccionado={0}
            handleCloseDialog={() => setOpenAddCarga(false)}
            creando={!selectedCarga}
            refreshCargas={() => {
              // Actualizar cargas si es necesario
            }}
            listaCargasCreadas={listaCargasCreadas}
          />
        </DialogContent>
      </Dialog>

      <Box display="flex" justifyContent="space-between" mt={2}>
        <Button onClick={handleClose} color="primary">
          Cancelar
        </Button>
        <Button onClick={handleSubmit} color="primary">
          Guardar
        </Button>
        {safeSeleccionado.id && (
          <IconButton onClick={handleClickDeleteContrato}>
            <DeleteOutlineIcon sx={{ fontSize: 20, color: "#d68384" }} />
          </IconButton>
        )}
      </Box>

      {/* Diálogo para eliminación del contrato */}
      <Dialog
        open={openDialogDelete}
        onClose={handleCloseDialogDelete}
        maxWidth="sm"
        fullWidth
      >
        <DeleteEntidad
          idEntidad={data.id || safeSeleccionado.id}
          endpointEntidad="contratos"
          handleCloseDialog={handleCloseDialogDelete}
          handleClose={handleClose}
          datos={datos}
          setDatos={setDatos}
        />
      </Dialog>

      {/* Diálogo de advertencia para eliminar contrato con cargas relacionadas */}
      <Dialog
        open={openDialogCargasWarning}
        onClose={() => setOpenDialogCargasWarning(false)}
        maxWidth="sm"
        fullWidth
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
            maxWidth: "400px",
            padding: 3,
            borderRadius: 2,
            margin: "auto",
            gap: 2,
          }}
        >
          <Typography variant="h6" color="textPrimary" align="center">
            Para eliminar este contrato, primero debe eliminar las cargas relacionadas.
          </Typography>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-around",
              alignItems: "center",
              width: "100%",
              gap: 2,
              marginTop: 2,
            }}
          >
            <Button
              variant="text"
              onClick={() => setOpenDialogCargasWarning(false)}
              sx={{
                color: "#d68384",
                width: "100%",
                maxWidth: "100px",
                fontWeight: "bold",
              }}
            >
              Aceptar
            </Button>
          </Box>
        </Box>
      </Dialog>

      {/* Diálogo de confirmación para eliminar carga */}
      <Dialog
        open={openDialogConfirmDeleteCarga}
        onClose={() => {
          setOpenDialogConfirmDeleteCarga(false);
          setCargaAEliminar(null);
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent>
          <Typography>¿Está seguro de que desea eliminar esta carga?</Typography>
        </DialogContent>
        <Box display="flex" justifyContent="flex-end" p={2} gap={2}>
          <Button
            onClick={() => {
              setOpenDialogConfirmDeleteCarga(false);
              setCargaAEliminar(null);
            }}
          >
            No
          </Button>
          <Button onClick={handleConfirmDeleteCarga} color="error" variant="contained">
            Sí
          </Button>
        </Box>
      </Dialog>

      {/* Snackbar para notificación emergente de advertencia de carga */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity="warning" sx={{ width: "100%" }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default ContratoForm;
