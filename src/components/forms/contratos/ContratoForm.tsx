/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useContext, useState, useMemo, useEffect } from "react";
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
  useMediaQuery,
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
  const { backendURL} = useContext(ContextoGeneral);

  const isMobile = useMediaQuery("(max-width:768px)");

  // Estados para eliminación de contrato y cargas
  const [openDialogDelete, setOpenDialogDelete] = useState(false);
  const [openDialogCargasWarning, setOpenDialogCargasWarning] = useState(false);
  console.log(seleccionado);
  // Estados para cargas y diálogo de cargas
  const [openAddCarga, setOpenAddCarga] = useState(false);
  const [selectedCarga, setSelectedCarga] = useState<any>(null);
  const [expandedCard, setExpandedCard] = useState<number | null>(null);
  const [listaCargasCreadas, setListaCargasCreadas] = useState<any[]>([]);
  const [listaCargasModificadas, setListaCargasModificadas] = useState<any[]>([]);

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
      titularCartaDePorte: (value) => ((!value && !seleccionado) ? "Campo requerido" : null),
    }
  );  

  // Generar payload optimizado
  const getOptimizedPayload = () => {
    // Procesar campos de empresas para enviar solo CUIT
    const procesarEmpresas = (dataObj: any) => {
      const processed = { ...dataObj };
      empresaFields.forEach((field) => {
        const value = processed[field.key];
        if (value && typeof value === 'object' && value.cuit) {
          processed[field.key] = value.cuit;  // Extraer CUIT
        } else if (value === null) {
          processed[field.key] = null;        // Mantener null si no hay valor
        }
      });
      return processed;
    };
  
    const processedData = procesarEmpresas(data);
  
    if (!safeSeleccionado.id) {
      return {
        ...processedData,
        idsCargas: [
          ...cargas.map((c) => c.id),
          ...listaCargasCreadas.map((c) => c.id),
          ...listaCargasModificadas.map((c) => c.id),
        ],
      };
    } else {
      const payload: any = {};
      const originalProcesado = procesarEmpresas(safeSeleccionado);
  
      Object.keys(processedData).forEach((key) => {
        if (processedData[key] !== originalProcesado[key]) {
          payload[key] = processedData[key];
        }
      });
  
      // Manejamos IDs de cargas
      const originalCargasIds = Array.isArray(safeSeleccionado.cargas)
        ? safeSeleccionado.cargas.map((c: any) => c.id)
        : [];
      const nuevasCargasIds = [
        ...cargas.map((c) => c.id),
        ...listaCargasCreadas.map((c) => c.id),
        ...listaCargasModificadas.map((c) => c.id),
      ];
  
      if (JSON.stringify(originalCargasIds) !== JSON.stringify(nuevasCargasIds)) {
        payload.idsCargas = nuevasCargasIds;
      }
  
      return payload;
    }
  };


  const handleCargaCreated = (nuevaCarga: any) => {
    setListaCargasCreadas(prev => [...prev, nuevaCarga]);
  };
  
  const handleCargaUpdated = (cargaActualizada: any) => {
    if (cargaActualizada.id) {
      // Guardar estado original
      const original = cargas.find(c => c.id === cargaActualizada.id);
      const cargaConOriginal = { ...cargaActualizada, original };
      
      setListaCargasModificadas(prev => 
        prev.some(c => c.id === cargaActualizada.id) 
          ? prev.map(c => c.id === cargaActualizada.id ? cargaConOriginal : c) 
          : [...prev, cargaConOriginal]
      );
      
      // Eliminar de cargas originales
      setCargas(prev => prev.filter(c => c.id !== cargaActualizada.id));
    } else {
      setListaCargasCreadas(prev => 
        prev.some(c => c.tempId === cargaActualizada.tempId) 
          ? prev.map(c => c.tempId === cargaActualizada.tempId ? cargaActualizada : c) 
          : [...prev, cargaActualizada]
      );
    }
  };

  const handleExpandClick = (index: number) => {
    setExpandedCard(expandedCard === index ? null : index);
  };

  const handleOpenDialog = (carga: any) => {
    setSelectedCarga(carga);
    setOpenAddCarga(true);
  };

  const handleSubmit = async () => {
    if (!validateAll()) return;
  
    if (seleccionado && allCargas.length === 0) {
      setSnackbarMessage("Debe crear al menos una carga.");
      setSnackbarOpen(true);
      return;
    }
  
    try {  
      // 1. Crear nuevas cargas (usar carga.payload y URL con /api)
      const nuevasCargasResponses = await Promise.all(
        listaCargasCreadas.map(carga =>
          fetch(`${backendURL}/cargas`, {
            method: "POST",
            headers: {
              'Content-Type': 'application/json',
              'ngrok-skip-browser-warning': 'true'
            },
            body: JSON.stringify(carga.payload)
          }).then(res => res.json())
        )
      );
  
      // 2. Actualizar cargas existentes
      const cargasActualizadas = await Promise.all(
        listaCargasModificadas.map(carga =>
          fetch(`${backendURL}/cargas/${carga.id}`, {
            method: "PUT",
            headers: {
              'Content-Type': 'application/json',
              'ngrok-skip-browser-warning': 'true'
            },
            body: JSON.stringify(carga.payload)
          }).then(res => res.json())
        )
      );
  
      // 3. Actualizar estado local de cargas
      const cargasActualizadasIds = new Set(cargasActualizadas.map(c => c.id));
      const cargasNoModificadas = cargas.filter(c => !cargasActualizadasIds.has(c.id));
      
      // Combinar cargas manteniendo referencias temporales
    setCargas([
      ...cargasNoModificadas,
      ...listaCargasModificadas,
      ...nuevasCargasResponses.map(nc => ({
        ...nc
      }))
    ]);
  
      // 4. Preparar IDs para el contrato
      const idsCargas = [
        ...cargasNoModificadas.map(c => c.id),
        ...cargasActualizadas.map(c => c.id),
        ...nuevasCargasResponses.map(c => c.id)
      ];
  
      // 5. Guardar contrato
      const metodo = safeSeleccionado.id ? "PUT" : "POST";
      const url = safeSeleccionado.id 
        ? `${backendURL}/contratos/${safeSeleccionado.id}`
        : `${backendURL}/contratos`;
  
      const payloadContrato = {
        ...getOptimizedPayload(),
        idsCargas
      };
      
      console.log(payloadContrato)
      const resContrato = await fetch(url, {
        method: metodo,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payloadContrato)
      });
      
      if (!resContrato.ok) {
        const errorData = await resContrato.json();
        throw new Error(errorData.message || "Error guardando contrato");
      }
  
      // 6. Actualizar estado global
      const contratoActualizado = await resContrato.json();
      setDatos((prev: any[]) => 
        metodo === "POST" 
          ? [...prev, contratoActualizado] 
          : prev.map(ct => ct.id === contratoActualizado.id ? contratoActualizado : ct)
      );
  
      // 7. Limpiar estados y cerrar
      setListaCargasCreadas([]);
      setListaCargasModificadas([]);
      handleClose();
  
    } catch (error: any) {
      console.error("Error en el proceso:", error);
      setSnackbarMessage(error.message || "Error desconocido");
      setSnackbarOpen(true);
    }
  };
  
  
  const handleCancel = () => {
    // Restaurar cargas originales si hay modificaciones
    if (listaCargasModificadas.length > 0) {
      const originalesRestaurados = listaCargasModificadas
        .filter(c => c.original)
        .map(c => c.original);
        
      setCargas(prev => [
        ...prev.filter(c => !listaCargasModificadas.some(m => m.id === c.id)),
        ...originalesRestaurados
      ]);
    }
  
    // Limpiar todos los estados temporales
    setListaCargasCreadas([]);
    setListaCargasModificadas([]);
    
    handleClose();
  };

  // Combina todas las cargas: las obtenidas y las creadas en el form.
  const allCargas = [
    ...cargas,
    ...listaCargasModificadas,
    ...listaCargasCreadas
  ];

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
    
    // Solo para cargas originales
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
      })
      .catch((error) => console.error("Error al borrar la carga", error));
    
    setOpenDeleteCarga(false);
    setCargaAEliminar(null);
  };

  // Función para eliminar cargas a crear
  const handleDeleteCargaACrear = (carga: any) => {
    setListaCargasCreadas(prev => 
      prev.filter(c => c.tempId !== carga.tempId)
    );
  };

  // Función para eliminar cargas a actualizar
  const handleDeleteCargaAActualizar = (carga: any) => {
    setListaCargasModificadas(prev => 
      prev.filter(c => c.id !== carga.id)
    );

    // Si existe una versión original, restaurarla
    if (carga.original) {
      setCargas(prev => [...prev, carga.original]);
    }
  };

  // Función para eliminar el contrato (verifica que no tenga cargas asociadas)
  const handleClickDeleteContrato = () => {
    const tieneCargasAsociadas = cargas.length > 0 || 
                                listaCargasModificadas.length > 0 || 
                                listaCargasCreadas.length > 0;
  
    if (tieneCargasAsociadas) {
      setOpenDialogCargasWarning(true);
    } else {
      setOpenDialogDelete(true);
    }
  };

  return (
    <>
      {!isMobile && (
      <Typography variant="h6" mb={2}>
        {safeSeleccionado.id ? "Editar Contrato" : "Crear Contrato"}
      </Typography>
      )}
      <ContratoFormFields
        data={data}
        errors={errors}
        setData={setData}
        empresaFields={empresaFields}
        sorteredEmpresasSegunRol={sorteredEmpresasSegunRol}
      />

      {/* Mostrar CargasSection solo en edición */}
      {seleccionado && (
      <CargasSection
          cargasOriginales={cargas.filter(c => 
            !listaCargasModificadas.some(m => m.id === c.id)
          )}
          cargasACrear={listaCargasCreadas}
          cargasAActualizar={listaCargasModificadas}
          expandedCard={expandedCard}
          handleExpandClick={handleExpandClick}
          handleOpenDialog={handleOpenDialog}
          handleDeleteCarga={handleDeleteCarga}
          handleDeleteCargaACrear={handleDeleteCargaACrear}
          handleDeleteCargaAActualizar={handleDeleteCargaAActualizar}
        />
      )}

      {/* Diálogo para crear/editar carga */}
      <Dialog open={openAddCarga} onClose={() => setOpenAddCarga(false)} maxWidth="lg" fullWidth>
        <DialogTitle>{selectedCarga ? "Modificando Carga" : "Crear Nueva Carga"}</DialogTitle>
        <DialogContent sx={{ height: "80vh", alignContent: "center" }}>
          <CrearCargaStepper
            datosCarga={selectedCarga || {}}
            pasoSeleccionado={0}
            handleCloseDialog={() => setOpenAddCarga(false)}
            creando={!selectedCarga}
            onCargaCreated={handleCargaCreated}
            onCargaUpdated={handleCargaUpdated}
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

      {/*Diálogo de advertencia */}
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
