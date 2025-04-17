/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useContext, useState,useMemo, useEffect } from "react";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Box,
  Typography,
  Snackbar,
  Alert,
} from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import DeleteEntidad from "../../dialogs/DeleteEntidad";
import useValidation from "../../hooks/useValidation";
import { ContextoGeneral } from "../../Contexto";
import { FormularioProps } from "../../../interfaces/FormularioProps";
import CrearCargaStepper from "../../cargas/creadores/CrearCargaStepper";
import useCargas from "../../hooks/contratos/useCargas";
import ContratoFormFields from "./ContratoFormFields";
import CargasSection from "./CargasSection";
import DeleteCarga from "../../dialogs/contratos/DeleteCarga";
import useSortEmpresasPorRol from "../../hooks/contratos/useSortEmpresasPorRol";

type EmpresaField = {
  key: string;
  label: string;
  rol: number;
};

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
  const [openAddCarga, setOpenAddCarga] = useState(false);
  const [selectedCarga, setSelectedCarga] = useState<any>(null);
  const [expandedCard, setExpandedCard] = useState<number | null>(null);
  const [listaCargasCreadas, setListaCargasCreadas] = useState<any[]>([]);

  // Estado para notificación emergente en caso de carga con cupos
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  // Estados para el diálogo de confirmación de eliminación de carga
  const [openDeleteCarga, setOpenDeleteCarga] = useState(false);
  const [cargaAEliminar, setCargaAEliminar] = useState<any>(null);

  // Hook para cargar las cargas existentes
  const { cargas, setCargas } = useCargas(safeSeleccionado.cargas, backendURL);

  // Empresas y sus roles
  const [allEmpresas, setAllEmpresas] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);

  // Fetch empresas
  useEffect(() => {

    fetch(`${backendURL}/empresas`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true'
      }
    })
      .then(response => response.json())
      .then((data) => setAllEmpresas(data))
      .catch(err => console.error('Error al obtener las empresas', err));

    //--------------------------------------

    fetch(`${backendURL}/empresas/roles`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true'
      }
    })
      .then(response => response.json())
      .then(data => setRoles(data))
      .catch(err => console.error('Error al obtener los roles', err));
    
  }, [backendURL]);

  const sorteredEmpresasSegunRol = useSortEmpresasPorRol(allEmpresas, roles);

  // Lista de campos de empresas con sus configuraciones
  const empresaFields: EmpresaField[] = useMemo(() => [
    { key: 'titularCartaDePorte', label: 'Titular Carta de Porte', rol: 1 },
    { key: 'remitenteProductor', label: 'Remitente Productor', rol: 1 },
    { key: 'remitenteVentaPrimaria', label: 'Remitente Venta Primaria', rol: 1 },
    { key: 'remitenteVentaSecundaria', label: 'Remitente Venta Secundaria', rol: 1 },
    { key: 'remitenteVentaSecundaria2', label: 'Remitente Venta Secundaria 2', rol: 1 },
    { key: 'corredorVentaPrimaria', label: 'Corredor Venta Primaria', rol: 1 },
    { key: 'corredorVentaSecundaria', label: 'Corredor Venta Secundaria', rol: 1 },
    { key: 'representanteEntregador', label: 'Representante Entregador', rol: 1 },
    { key: 'representanteRecibidor', label: 'Representante Recibidor', rol: 1 },
    { key: 'destinatario', label: 'Destinatario', rol: 1 },
    { key: 'destino', label: 'Destino', rol: 1 },
    { key: 'intermediarioDeFlete', label: 'Intermediario de Flete', rol: 1 },
    { key: 'fletePagador', label: 'Flete Pagador', rol: 1 },
  ], []);

  

  // Configuración de validación del formulario
  const { data, errors, validateAll, setData } = useValidation(
    {
      titularCartaDePorte: "",
      ...safeSeleccionado,
    },
    {
      titularCartaDePorte: (value) => (!value ? "Campo requerido" : null),
    }
  );

   // Buscar empresas
  

  // Generar payload optimizado
  const getOptimizedPayload = () => {
    if (!safeSeleccionado.id) return data;
    
    const payload: any = {};
    Object.keys(data).forEach(key => {
      if (data[key] !== safeSeleccionado[key]) {
        payload[key] = data[key];
      }
    });
    
    const originalCargasIds = safeSeleccionado.cargas?.map((c: any) => c.id) || [];
    const nuevasCargasIds = [...cargas, ...listaCargasCreadas].map(c => c.id);
    if (JSON.stringify(originalCargasIds) !== JSON.stringify(nuevasCargasIds)) {
      payload.idsCargas = nuevasCargasIds;
    }
    
    return payload;
  };

  const handleExpandClick = (index: number) => {
    setExpandedCard(expandedCard === index ? null : index);
  };

  const handleOpenDialog = (carga: any) => {
    setSelectedCarga(carga);
    setOpenAddCarga(true);
  };

  const handleSubmit = () => {
    if (validateAll()) {
      const todasLasCargas = [...cargas, ...listaCargasCreadas];
      if (todasLasCargas.length === 0) {
        alert("Debe crear al menos una carga.");
        return;
      }
  
      const metodo = safeSeleccionado.id ? "PUT" : "POST";
      const url = safeSeleccionado.id
        ? `${backendURL}/contratos/${data.id || safeSeleccionado.id}`
        : `${backendURL}/contratos`;
  
      const payload = getOptimizedPayload();
      
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
          handleClose();
        })
        .catch((error) =>
          console.error("Error al guardar el contrato: ", error.message)
        );
    }
  };
  
  // Agrega esta función dentro del componente ContratoForm
  const handleCancel = () => {
    // Si es creación y hay cargas nuevas, se eliminan
    if (!safeSeleccionado.id && listaCargasCreadas.length > 0) {
      Promise.all(
        listaCargasCreadas.map((carga) => {
          // Si la carga tiene id, se asume que se persistió y se debe borrar.
          if (carga.id) {
            return fetch(`${backendURL}/cargas/${carga.id}`, {
              method: "DELETE",
              headers: {
                "Content-Type": "application/json",
                "ngrok-skip-browser-warning": "true",
              },
            });
          }
          return Promise.resolve();
        })
      )
        .then(() => {
          // Limpiamos la lista y cerramos el formulario
          setListaCargasCreadas([]);
          handleClose();
        })
        .catch((error) => {
          console.error("Error al borrar las cargas creadas:", error);
          handleClose();
        });
    } else {
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
    setCargaAEliminar(carga);
    setOpenDeleteCarga(true);
  };

  // Eliminamos la carga con esta func
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
    setOpenDeleteCarga(false);
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

  return (
    <>
      <Typography variant="h6" mb={2}>
        {safeSeleccionado.id ? "Editar Contrato" : "Crear Contrato"}
      </Typography>
      
      <ContratoFormFields
        data={data}
        errors={errors}
        setData={setData}
        empresaFields={empresaFields}
        sorteredEmpresasSegunRol={sorteredEmpresasSegunRol}
      />

      <CargasSection
        cargas={allCargas}
        expandedCard={expandedCard}
        handleExpandClick={handleExpandClick}
        handleOpenDialog={handleOpenDialog}
        handleDeleteCarga={handleDeleteCarga}
      />

      {/* Diálogo para crear/editar carga */}
      <Dialog open={openAddCarga} onClose={() => setOpenAddCarga(false)} maxWidth="lg" fullWidth>
        <DialogTitle>{selectedCarga ? "Modificando Carga" : "Crear Nueva Carga"}</DialogTitle>
        <DialogContent sx={{ height: "80vh", alignContent: "center" }}>
          <CrearCargaStepper
            datosCarga={selectedCarga || {}}
            pasoSeleccionado={0}
            handleCloseDialog={() => setOpenAddCarga(false)}
            creando={!selectedCarga}
            refreshCargas={() => { /* actualizar cargas si es necesario */ }}
            listaCargasCreadas={listaCargasCreadas}
          />
        </DialogContent>
      </Dialog>

      <Box display="flex" justifyContent="space-between" mt={2}>
        <Button onClick={handleCancel} color="primary">
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

      {/* Diálogos para eliminar contrato y advertencias se extraen de forma similar */}
      <Dialog open={openDialogDelete} onClose={() => setOpenDialogDelete(false)} maxWidth="sm" fullWidth>
        <DeleteEntidad
          idEntidad={data.id || safeSeleccionado.id}
          endpointEntidad="contratos"
          handleCloseDialog={() => setOpenDialogDelete(false)}
          handleClose={handleClose}
          datos={datos}
          setDatos={setDatos}
        />
      </Dialog>

      {/* Ejemplo: Diálogo de advertencia */}
      <Dialog open={openDialogCargasWarning} onClose={() => setOpenDialogCargasWarning(false)} maxWidth="sm" fullWidth>
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", p: 3 }}>
          <Typography variant="h6" align="center">
            Para eliminar este contrato, primero debe eliminar las cargas relacionadas.
          </Typography>
          <Button
            variant="text"
            onClick={() => setOpenDialogCargasWarning(false)}
            sx={{ color: "#d68384", mt: 2 }}
          >
            Aceptar
          </Button>
        </Box>
      </Dialog>

      <DeleteCarga
        open={openDeleteCarga}
        onClose={() => {
          setOpenDeleteCarga(false);
          setCargaAEliminar(null);
        }}
        onConfirm={handleConfirmDeleteCarga}
      />

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
