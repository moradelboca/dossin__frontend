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
import EmpresaForm from "../empresas/EmpresaForm";

const ContratoForm: React.FC<FormularioProps> = ({
  seleccionado,
  datos,
  setDatos,
  handleClose,
}) => {
  const safeSeleccionado = seleccionado || {};
  const { backendURL} = useContext(ContextoGeneral);
  const { theme } = useContext(ContextoGeneral);

  const isMobile = useMediaQuery("(max-width:768px)");

  // Estados para eliminación de contrato y cargas
  const [openDialogDelete, setOpenDialogDelete] = useState(false);
  const [openDialogCargasWarning, setOpenDialogCargasWarning] = useState(false);
  // Estados para cargas y diálogo de cargas
  const [openAddCarga, setOpenAddCarga] = useState(false);
  const [selectedCarga, setSelectedCarga] = useState<any>(null);
  const [expandedCard, setExpandedCard] = useState<number | null>(null);
  const [listaCargasCreadas, setListaCargasCreadas] = useState<any[]>([]);
  const [listaCargasModificadas, setListaCargasModificadas] = useState<any[]>(
    []
  );

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

  // Estados para el modal de EmpresaForm
  const [openEmpresaForm, setOpenEmpresaForm] = useState(false);
  const [empresaFieldKey, setEmpresaFieldKey] = useState<string | null>(null);
  const [nuevaEmpresaSeleccionada, setNuevaEmpresaSeleccionada] = useState<any>(null);

  // Estados para los valores seleccionados por rol
  const [empresasPorRol, setEmpresasPorRol] = useState<{ [rolId: number]: any | null }>({});
  // Estados de error para autocompletes obligatorios
  const [erroresEmpresas, setErroresEmpresas] = useState<{ [rolId: number]: boolean }>({});

  // Helper para obtener el ID de un rol por nombre
  const getRolIdByName = (nombre: string) => {
    const found = roles.find((r: any) => r.nombre.trim().toLowerCase() === nombre.trim().toLowerCase());
    return found ? found.id : undefined;
  };

  // IDs de roles obligatorios robusto
  const ROLES_OBLIGATORIOS = [
    getRolIdByName("Titular Carta de Porte"),
    getRolIdByName("Destino"),
    getRolIdByName("Destinatario"),
  ].filter((id) => id !== undefined);

  // Validación de empresas obligatorias SOLO al guardar
  const validarEmpresasObligatorias = () => {
    const nuevosErrores: { [rolId: number]: boolean } = {};
    let faltan = false;
    ROLES_OBLIGATORIOS.forEach(rolId => {
      if (!empresasPorRol[rolId] || empresasPorRol[rolId] === null || empresasPorRol[rolId] === undefined) {
        nuevosErrores[rolId] = true;
        faltan = true;
      }
    });
    setErroresEmpresas(nuevosErrores);
    return !faltan;
  };

  const handleEmpresaChange = (rolId: number, empresa: any | null) => {
    setEmpresasPorRol(prev => ({ ...prev, [rolId]: empresa }));
    setErroresEmpresas(prev => ({ ...prev, [rolId]: false }));
  };

  // Fetch empresas
  useEffect(() => {
    fetch(`${backendURL}/empresas`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true",
      },
    })
      .then((response) => response.json())
      .then((data) => setAllEmpresas(data))
      .catch((err) => console.error("Error al obtener las empresas", err));

    //--------------------------------------

    fetch(`${backendURL}/empresas/roles`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true",
      },
    })
      .then((response) => response.json())
      .then((data) => setRoles(data))
      .catch((err) => console.error("Error al obtener los roles", err));
  }, [backendURL]);

  // Configuración de validación del formulario
  const { data, errors, setData } = useValidation(
    {
      titularCartaDePorte: "",
      ...safeSeleccionado,
    },
    {
      titularCartaDePorte: (value) =>
        !value && !seleccionado ? "Campo requerido" : null,
    }
  );

  // Generar payload optimizado
  const getOptimizedPayload = () => {
    const processedData = { ...data };

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
      const originalProcesado = { ...processedData };

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

      if (
        JSON.stringify(originalCargasIds) !== JSON.stringify(nuevasCargasIds)
      ) {
        payload.idsCargas = nuevasCargasIds;
      }

      return payload;
    }
  };

  const handleCargaCreated = (nuevaCarga: any) => {
    setListaCargasCreadas((prev) => [...prev, nuevaCarga]);
  };

  const handleCargaUpdated = (cargaActualizada: any) => {
    if (cargaActualizada.id) {
      // Guardar estado original
      const original = cargas.find((c) => c.id === cargaActualizada.id);
      const cargaConOriginal = { ...cargaActualizada, original };

      setListaCargasModificadas((prev) =>
        prev.some((c) => c.id === cargaActualizada.id)
          ? prev.map((c) =>
              c.id === cargaActualizada.id ? cargaConOriginal : c
            )
          : [...prev, cargaConOriginal]
      );

      // Eliminar de cargas originales
      setCargas((prev) => prev.filter((c) => c.id !== cargaActualizada.id));
    } else {
      setListaCargasCreadas((prev) =>
        prev.some((c) => c.tempId === cargaActualizada.tempId)
          ? prev.map((c) =>
              c.tempId === cargaActualizada.tempId ? cargaActualizada : c
            )
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
    if (!validarEmpresasObligatorias()) {
      setSnackbarMessage("Debe seleccionar Titular Carta de Porte, Destino y Destinatario.");
      setSnackbarOpen(true);
      return;
    }
    // Validar que los campos obligatorios estén en el payload antes de postear
    let faltanObligatorios = false;
    ROLES_OBLIGATORIOS.forEach(rolId => {
      if (!empresasPorRol[rolId] || empresasPorRol[rolId] === null || empresasPorRol[rolId] === undefined) {
        faltanObligatorios = true;
      }
    });
    if (faltanObligatorios) {
      setSnackbarMessage("Debe seleccionar Titular Carta de Porte, Destino y Destinatario.");
      setSnackbarOpen(true);
      return;
    }
    
    try {
      // 1. Crear nuevas cargas (usar carga.payload y URL con /api)
      const nuevasCargasResponses = await Promise.all(
        listaCargasCreadas.map((carga) =>
          fetch(`${backendURL}/cargas`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "ngrok-skip-browser-warning": "true",
            },
            body: JSON.stringify(carga.payload),
          }).then((res) => res.json())
        )
      );

      // 2. Actualizar cargas existentes
      const cargasActualizadas = await Promise.all(
        listaCargasModificadas.map((carga) =>
          fetch(`${backendURL}/cargas/${carga.id}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              "ngrok-skip-browser-warning": "true",
            },
            body: JSON.stringify(carga.payload),
          }).then((res) => res.json())
        )
      );

      // 3. Actualizar estado local de cargas
      const cargasActualizadasIds = new Set(
        cargasActualizadas.map((c) => c.id)
      );
      const cargasNoModificadas = cargas.filter(
        (c) => !cargasActualizadasIds.has(c.id)
      );

      // Combinar cargas manteniendo referencias temporales
      setCargas([
        ...cargasNoModificadas,
        ...listaCargasModificadas,
        ...nuevasCargasResponses.map((nc) => ({
          ...nc,
        })),
      ]);

      // 4. Preparar IDs para el contrato
      const idsCargas = [
        ...cargasNoModificadas.map((c) => c.id),
        ...cargasActualizadas.map((c) => c.id),
        ...nuevasCargasResponses.map((c) => c.id),
      ];

      // 5. Guardar contrato
      const metodo = safeSeleccionado.id ? "PUT" : "POST";
      const url = safeSeleccionado.id
        ? `${backendURL}/contratos/${safeSeleccionado.id}`
        : `${backendURL}/contratos`;
      // Construir el payload con los campos de empresa en camelCase
      const empresasPayload: { [key: string]: string | number | null } = {};
      roles.forEach((rol: any) => {
        if (rol.nombre !== "Transportista") {
          const empresa = empresasPorRol[rol.id];
          if (empresa && empresa.cuit) {
            // Convertir el nombre del rol a camelCase
            const camelCaseKey = rol.nombre
              .replace(/\s(.)/g, (_: any, group1: any) => group1.toUpperCase())
              .replace(/^(.)/, function(_: any, group1: any) {
                return group1.toLowerCase();
              })
              .replace(/[^a-zA-Z0-9]/g, '');
            empresasPayload[camelCaseKey] = empresa.cuit;
          }
        }
      });
      const payloadContrato = {
        ...getOptimizedPayload(),
        ...empresasPayload,
        idsCargas,
      };
      const resContrato = await fetch(url, {
        method: metodo,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payloadContrato),
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
          : prev.map((ct) =>
              ct.id === contratoActualizado.id ? contratoActualizado : ct
            )
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
        .filter((c) => c.original)
        .map((c) => c.original);

      setCargas((prev) => [
        ...prev.filter(
          (c) => !listaCargasModificadas.some((m) => m.id === c.id)
        ),
        ...originalesRestaurados,
      ]);
    }

    // Limpiar todos los estados temporales
    setListaCargasCreadas([]);
    setListaCargasModificadas([]);

    handleClose();
  };

  // Función para iniciar la eliminación de una carga.
  const handleDeleteCarga = (carga: any) => {
    // Si la carga tiene cupos asignados con valores > 0, se muestra una notificación.
    if (carga.cupos && carga.cupos.some((cupo: any) => cupo.cupos > 0)) {
      setSnackbarMessage(
        "No se puede eliminar la carga. Primero elimine los cupos relacionados."
      );
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
    setListaCargasCreadas((prev) =>
      prev.filter((c) => c.tempId !== carga.tempId)
    );
  };

  // Función para eliminar cargas a actualizar
  const handleDeleteCargaAActualizar = (carga: any) => {
    setListaCargasModificadas((prev) => prev.filter((c) => c.id !== carga.id));

    // Si existe una versión original, restaurarla
    if (carga.original) {
      setCargas((prev) => [...prev, carga.original]);
    }
  };

  // Función para eliminar el contrato (verifica que no tenga cargas asociadas)
  const handleClickDeleteContrato = () => {
    const tieneCargasAsociadas =
      cargas.length > 0 ||
      listaCargasModificadas.length > 0 ||
      listaCargasCreadas.length > 0;

    if (tieneCargasAsociadas) {
      setOpenDialogCargasWarning(true);
    } else {
      setOpenDialogDelete(true);
    }
  };

  // Callback para abrir el modal de empresa
  const handleAgregarEmpresa = (fieldKey: string) => {
    setEmpresaFieldKey(fieldKey);
    setOpenEmpresaForm(true);
  };

  // Cuando se crea una nueva empresa desde el modal
  const handleEmpresaCreada = (empresasActualizadas: any[]) => {
    // La última empresa agregada es la nueva
    const nuevaEmpresa = empresasActualizadas[empresasActualizadas.length - 1];
    setAllEmpresas(empresasActualizadas);
    setNuevaEmpresaSeleccionada(nuevaEmpresa);
    setOpenEmpresaForm(false);
  };

  // Efecto para seleccionar la nueva empresa en el autocomplete correspondiente
  useEffect(() => {
    if (nuevaEmpresaSeleccionada && empresaFieldKey) {
      setData((prev: any) => ({
        ...prev,
        [empresaFieldKey]: nuevaEmpresaSeleccionada
      }));
      setNuevaEmpresaSeleccionada(null);
      setEmpresaFieldKey(null);
    }
  }, [nuevaEmpresaSeleccionada, empresaFieldKey, setData]);

  // Inicializar empresasPorRol al editar un contrato
  useEffect(() => {
    if (safeSeleccionado && roles.length > 0 && safeSeleccionado.id) {
      // Solo inicializar si empresasPorRol está vacío
      if (Object.keys(empresasPorRol).length === 0) {
        const mapping = [
          { rol: "Titular Carta de Porte", field: "titularCartaDePorte" },
          { rol: "Destino", field: "destino" },
          { rol: "Destinatario", field: "destinatario" },
        ];
        const nuevasEmpresasPorRol: { [rolId: number]: any | null } = {};
        mapping.forEach(({ rol, field }) => {
          const rolId = getRolIdByName(rol);
          if (rolId !== undefined && safeSeleccionado[field]) {
            nuevasEmpresasPorRol[rolId] = safeSeleccionado[field];
          }
        });
        // Para otros roles dinámicos
        roles.forEach((rolObj: any) => {
          if (
            !nuevasEmpresasPorRol[rolObj.id] &&
            safeSeleccionado[rolObj.nombre]
          ) {
            nuevasEmpresasPorRol[rolObj.id] = safeSeleccionado[rolObj.nombre];
          }
        });
        setEmpresasPorRol(nuevasEmpresasPorRol);
      }
    } else if (!safeSeleccionado || !safeSeleccionado.id) {
      setEmpresasPorRol({}); // Crear: vacíos
    }
    // eslint-disable-next-line
  }, [safeSeleccionado?.id, roles.length]);

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
        roles={roles}
        empresas={allEmpresas}
        empresasPorRol={empresasPorRol}
        erroresEmpresas={erroresEmpresas}
        onEmpresaChange={handleEmpresaChange}
        onAgregarEmpresa={handleAgregarEmpresa}
      />

      {/* Mostrar CargasSection solo en edición */}
      {seleccionado && (
        <CargasSection
          cargasOriginales={cargas.filter(
            (c) => !listaCargasModificadas.some((m) => m.id === c.id)
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
            onCargaCreated={handleCargaCreated}
            onCargaUpdated={handleCargaUpdated}
          />
        </DialogContent>
      </Dialog>

      <Box display="flex" justifyContent="space-between" mt={2}>
        <Button
          onClick={handleCancel}
          sx={{
            backgroundColor: theme.colores.azul,
            color: '#fff',
            borderRadius: '8px',
            px: 3,
            py: 1,
            fontWeight: 100,
            '&:hover': {
              backgroundColor: theme.colores.azulOscuro,
              color: '#fff',
            },
          }}
        >
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          sx={{
            backgroundColor: theme.colores.azul,
            color: '#fff',
            borderRadius: '8px',
            px: 3,
            py: 1,
            fontWeight: 100,
            '&:hover': {
              backgroundColor: theme.colores.azulOscuro,
              color: '#fff',
            },
          }}
        >
          Guardar
        </Button>
        {safeSeleccionado.id && (
          <IconButton onClick={handleClickDeleteContrato}>
            <DeleteOutlineIcon sx={{ fontSize: 20, color: "#d68384" }} />
          </IconButton>
        )}
      </Box>

      {/* Diálogos para eliminar contrato y advertencias se extraen de forma similar */}
      <Dialog
        open={openDialogDelete}
        onClose={() => setOpenDialogDelete(false)}
        maxWidth="sm"
        fullWidth
      >
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
            alignItems: "center",
            p: 3,
          }}
        >
          <Typography variant="h6" align="center">
            Para eliminar este contrato, primero debe eliminar las cargas
            relacionadas.
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
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity="warning"
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>

      <Dialog open={openEmpresaForm} onClose={() => setOpenEmpresaForm(false)} maxWidth="md" fullWidth>
        <DialogTitle>Agregar nueva empresa</DialogTitle>
        <DialogContent>
          <EmpresaForm
            datos={allEmpresas}
            setDatos={handleEmpresaCreada}
            handleClose={() => setOpenEmpresaForm(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ContratoForm;
