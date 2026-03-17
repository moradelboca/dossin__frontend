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
import { axiosGet, axiosPost, axiosPut, axiosDelete } from "../../../lib/axiosConfig";
import { createModificacionTurno } from "../../../lib/turnos-modificaciones-api";
import type { ModificacionTurnoCreate } from "../../../types/turnos";

const ContratoForm: React.FC<FormularioProps & { refreshContratos?: () => void }> = ({
  seleccionado,
  datos,
  setDatos,
  handleClose,
  refreshContratos,
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
    axiosGet<any[]>('empresas', backendURL)
      .then((data) => setAllEmpresas(data))
      .catch((err) => console.error("Error al obtener las empresas", err));

    axiosGet<any[]>('empresas/roles', backendURL)
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
      // Comparar con los datos originales del contrato seleccionado
      const datosOriginales = { ...safeSeleccionado };

      Object.keys(processedData).forEach((key) => {
        // Comparar valores, manejando objetos y arrays
        const valorNuevo = processedData[key];
        const valorOriginal = datosOriginales[key];
        
        // Comparar usando JSON para objetos/arrays, o comparación directa para primitivos
        if (typeof valorNuevo === 'object' && valorNuevo !== null) {
          if (JSON.stringify(valorNuevo) !== JSON.stringify(valorOriginal)) {
            payload[key] = valorNuevo;
          }
        } else if (valorNuevo !== valorOriginal) {
          payload[key] = valorNuevo;
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
        JSON.stringify(originalCargasIds.sort()) !== JSON.stringify(nuevasCargasIds.sort())
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
          axiosPost('cargas', carga.payload, backendURL)
        )
      );

      // 2. Actualizar cargas existentes
      const cargasActualizadas = await Promise.all(
        listaCargasModificadas.map((carga) =>
          axiosPut(`cargas/${carga.id}`, carga.payload, backendURL)
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
      // Construir el payload con los campos de empresa usando el mismo mapeo que en la inicialización
      const empresasPayload: { [key: string]: string | number | null } = {};
      
      // Helper para normalizar nombres de roles (ignora mayúsculas, espacios extra, puntos)
      const normalizarNombreRol = (nombre: string): string => {
        return nombre.trim().toLowerCase().replace(/\./g, '').replace(/\s+/g, ' ');
      };
      
      // Mapeo de roles a campos del contrato (debe coincidir con el mapeo de inicialización)
      const rolToFieldMapping: Array<{ rolNombre: string; field: string }> = [
        { rolNombre: "Titular Carta de Porte", field: "titularCartaDePorte" },
        { rolNombre: "Destino", field: "destino" },
        { rolNombre: "Destinatario", field: "destinatario" },
        { rolNombre: "Remitente Comercial Productor", field: "remitenteProductor" },
        { rolNombre: "Corredor Venta Primaria", field: "corredorVentaPrimaria" },
        { rolNombre: "Rte. Comercial Venta Primaria", field: "remitenteVentaPrimaria" },
        { rolNombre: "Rte Comercial Venta Primaria", field: "remitenteVentaPrimaria" }, // Variante sin punto
        { rolNombre: "Flete Pagador", field: "fletePagador" },
        { rolNombre: "Corredor Venta Secundaria", field: "corredorVentaSecundaria" },
        { rolNombre: "Representante entregador", field: "representanteEntregador" },
        { rolNombre: "Rte Comercial Venta Secundaria", field: "remitenteVentaSecundaria" },
        { rolNombre: "Rte. Comercial Venta Secundaria", field: "remitenteVentaSecundaria" }, // Variante con punto
        { rolNombre: "Rte Comercial Venta Secundaria 2", field: "rteComercialVentaSecundaria2" },
        { rolNombre: "Representante recibidor", field: "representanteRecibidor" },
      ];
      
      // Usar el mapeo para construir el payload
      // Solo incluir campos que tienen valores o que han cambiado respecto al original
      roles.forEach((rol: any) => {
        if (rol.nombre !== "Empresa Transportista" && rol.nombre !== "Transportista") {
          const empresa = empresasPorRol[rol.id];
          
          // Buscar el campo correspondiente usando comparación normalizada
          const mappingEncontrado = rolToFieldMapping.find(m => 
            normalizarNombreRol(m.rolNombre) === normalizarNombreRol(rol.nombre)
          );
          
          if (mappingEncontrado) {
            const fieldName = mappingEncontrado.field;
            const valorOriginal = safeSeleccionado[fieldName];
            const cuitActual = empresa?.cuit || null;
            
            // Solo incluir en el payload si:
            // 1. Hay una empresa seleccionada (valor actual), O
            // 2. El campo tenía un valor original (para poder limpiarlo si es necesario)
            if (empresa && empresa.cuit) {
              empresasPayload[fieldName] = empresa.cuit;
            } else if (valorOriginal !== undefined && valorOriginal !== null && cuitActual === null) {
              // El campo tenía un valor y ahora está vacío, incluir null para limpiarlo
              empresasPayload[fieldName] = null;
            }
            // Si no hay valor original ni actual, no incluir el campo en el payload
          } else {
            // Si no se encuentra en el mapeo, log para debug
            if (empresa && empresa.cuit) {
              console.warn(`Rol "${rol.nombre}" no encontrado en el mapeo, usando fallback camelCase`);
            }
            // Fallback: convertir a camelCase si no está en el mapeo
            const camelCaseKey = rol.nombre
              .replace(/\s(.)/g, (_: any, group1: any) => group1.toUpperCase())
              .replace(/^(.)/, function(_: any, group1: any) {
                return group1.toLowerCase();
              })
              .replace(/[^a-zA-Z0-9]/g, '');
            if (empresa && empresa.cuit) {
              empresasPayload[camelCaseKey] = empresa.cuit;
            }
          }
        }
      });
      
      const payloadOptimizado = getOptimizedPayload();
      const payloadContrato = {
        ...payloadOptimizado,
        ...empresasPayload,
        idsCargas,
      };
      
      const apiCall = safeSeleccionado.id
        ? axiosPut(`contratos/${safeSeleccionado.id}`, payloadContrato, backendURL)
        : axiosPost('contratos', payloadContrato, backendURL);

      // 6. Guardar contrato y, si corresponde, registrar modificaciones de CPE asociadas al turno
      const contratoActualizado = await apiCall;

      // Registrar modificaciones solo al editar un contrato existente que tenga un turno asociado
      const idTurnoAsociado = safeSeleccionado.numeroDeTurno;
      if (safeSeleccionado.id && idTurnoAsociado) {
        const modificaciones: ModificacionTurnoCreate[] = [];

        const processedData: any = { ...data, ...empresasPayload };

        const getCuitFromValor = (valor: any): string | null => {
          if (!valor) return null;
          if (typeof valor === "object" && valor.cuit != null) {
            return String(valor.cuit);
          }
          return String(valor);
        };

        // Campos escalares del contrato
        if ("tarifa" in safeSeleccionado || "tarifa" in processedData) {
          const original = safeSeleccionado.tarifa;
          const nuevo = processedData.tarifa;
          if (nuevo !== undefined && nuevo !== original) {
            modificaciones.push({
              nombreCampo: "tarifa",
              valor: nuevo,
            });
          }
        }

        if ("idUbicacionDescarga" in safeSeleccionado || "idUbicacionDescarga" in processedData) {
          const original = safeSeleccionado.idUbicacionDescarga;
          const nuevo = processedData.idUbicacionDescarga;
          if (nuevo !== original) {
            modificaciones.push({
              nombreCampo: "idUbicacionDescarga",
              valor: nuevo ?? null,
            });
          }
        }

        if ("idUbicacionBalanza" in safeSeleccionado || "idUbicacionBalanza" in processedData) {
          const original = safeSeleccionado.idUbicacionBalanza;
          const nuevo = processedData.idUbicacionBalanza;
          if (nuevo !== original) {
            modificaciones.push({
              nombreCampo: "idUbicacionBalanza",
              valor: nuevo ?? null,
            });
          }
        }

        if ("cantidadKm" in safeSeleccionado || "cantidadKm" in processedData) {
          const original = safeSeleccionado.cantidadKm;
          const nuevo = processedData.cantidadKm;
          if (nuevo !== undefined && nuevo !== original) {
            modificaciones.push({
              nombreCampo: "cantidadKm",
              valor: nuevo ?? null,
            });
          }
        }

        // Campos de CUIT asociados a empresas (según enums de backend)
        type CampoCuitConfig = {
          rolNombre: string;
          fieldContrato: string;
          nombreCampoModificacion: string;
        };

        const camposCuitConfig: CampoCuitConfig[] = [
          { rolNombre: "Remitente Comercial Productor", fieldContrato: "remitenteProductor", nombreCampoModificacion: "remitenteProductorCuit" },
          { rolNombre: "Rte. Comercial Venta Primaria", fieldContrato: "remitenteVentaPrimaria", nombreCampoModificacion: "remitenteVentaPrimariaCuit" },
          { rolNombre: "Rte Comercial Venta Primaria", fieldContrato: "remitenteVentaPrimaria", nombreCampoModificacion: "remitenteVentaPrimariaCuit" },
          { rolNombre: "Rte Comercial Venta Secundaria", fieldContrato: "remitenteVentaSecundaria", nombreCampoModificacion: "remitenteVentaSecundariaCuit" },
          { rolNombre: "Rte. Comercial Venta Secundaria", fieldContrato: "remitenteVentaSecundaria", nombreCampoModificacion: "remitenteVentaSecundariaCuit" },
          { rolNombre: "Rte Comercial Venta Secundaria 2", fieldContrato: "rteComercialVentaSecundaria2", nombreCampoModificacion: "remitenteVentaSecundaria2Cuit" },
          { rolNombre: "Corredor Venta Primaria", fieldContrato: "corredorVentaPrimaria", nombreCampoModificacion: "corredorVentaPrimariaCuit" },
          { rolNombre: "Corredor Venta Secundaria", fieldContrato: "corredorVentaSecundaria", nombreCampoModificacion: "corredorVentaSecundariaCuit" },
          { rolNombre: "Representante entregador", fieldContrato: "representanteEntregador", nombreCampoModificacion: "representanteEntregadorCuit" },
          { rolNombre: "Representante recibidor", fieldContrato: "representanteRecibidor", nombreCampoModificacion: "representanteRecibidorCuit" },
          { rolNombre: "Destinatario", fieldContrato: "destinatario", nombreCampoModificacion: "destinatarioCuit" },
          { rolNombre: "Destino", fieldContrato: "destino", nombreCampoModificacion: "destinoCuit" },
          { rolNombre: "Flete Pagador", fieldContrato: "fletePagador", nombreCampoModificacion: "fletePagadorCuit" },
        ];

        const normalizarNombreRol = (nombre: string): string =>
          nombre.trim().toLowerCase().replace(/\./g, "").replace(/\s+/g, " ");

        camposCuitConfig.forEach((cfg) => {
          const rol = roles.find(
            (r: any) => normalizarNombreRol(r.nombre) === normalizarNombreRol(cfg.rolNombre)
          );
          if (!rol) return;

          const empresaSeleccionada = empresasPorRol[rol.id];
          const cuitNuevo = getCuitFromValor(empresaSeleccionada);

          const valorOriginalCampo = safeSeleccionado[cfg.fieldContrato];
          const cuitOriginal =
            valorOriginalCampo && typeof valorOriginalCampo === "object"
              ? getCuitFromValor(valorOriginalCampo)
              : getCuitFromValor(valorOriginalCampo);

          if ((cuitNuevo || cuitOriginal) && cuitNuevo !== cuitOriginal) {
            modificaciones.push({
              nombreCampo: cfg.nombreCampoModificacion,
              valor: cuitNuevo ? Number(cuitNuevo.replace(/\D/g, "")) : null,
            });
          }
        });

        if (modificaciones.length > 0) {
          await Promise.all(
            modificaciones.map((mod) =>
              createModificacionTurno(idTurnoAsociado, mod, backendURL)
            )
          );
        }
      }
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
      
      // Mensaje de error más descriptivo
      let mensajeError = "Error desconocido";
      if (error.response) {
        // Error con respuesta del servidor
        const status = error.response.status;
        const statusText = error.response.statusText;
        const data = error.response.data;
        
        if (status === 404) {
          mensajeError = `El contrato con ID ${safeSeleccionado.id} no fue encontrado en el servidor. Verifique que el contrato existe.`;
        } else if (status === 400) {
          mensajeError = `Error de validación: ${typeof data === 'string' ? data : JSON.stringify(data)}`;
        } else if (status === 500) {
          mensajeError = `Error del servidor: ${statusText}`;
        } else {
          mensajeError = `Error ${status}: ${statusText}. ${typeof data === 'string' ? data : ''}`;
        }
      } else if (error.message) {
        mensajeError = error.message;
      }
      
      setSnackbarMessage(mensajeError);
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
    axiosDelete(`cargas/${cargaAEliminar.id}`, backendURL)
      .then(() => {
        setCargas((prev) => prev.filter((c) => c.id !== cargaAEliminar.id));
        if (refreshContratos) refreshContratos();
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

  // Helper para normalizar empresa desde el contrato al formato esperado
  const normalizarEmpresa = (empresaData: any, empresasDisponibles: any[]): any | null => {
    if (!empresaData) return null;
    
    // Si ya tiene la estructura correcta (viene de allEmpresas con roles como objetos), retornarla
    if (empresaData.cuit && empresaData.razonSocial && Array.isArray(empresaData.roles) && 
        empresaData.roles.length > 0 && typeof empresaData.roles[0] === 'object' && empresaData.roles[0].id) {
      return empresaData;
    }
    
    // Si viene del contrato como objeto, buscar en allEmpresas por CUIT
    if (empresaData.cuit) {
      const empresaEncontrada = empresasDisponibles.find(
        e => String(e.cuit) === String(empresaData.cuit)
      );
      if (empresaEncontrada) {
        return empresaEncontrada;
      }
      // Si no se encuentra pero tiene los datos básicos, normalizar roles y crear objeto
      let rolesNormalizados = [];
      if (Array.isArray(empresaData.roles)) {
        // Si los roles son strings, buscar los objetos de rol correspondientes
        if (typeof empresaData.roles[0] === 'string') {
          rolesNormalizados = empresaData.roles
            .map((rolNombre: string) => {
              const rolEncontrado = roles.find((r: any) => 
                r.nombre.trim().toLowerCase() === rolNombre.trim().toLowerCase()
              );
              return rolEncontrado || { nombre: rolNombre };
            })
            .filter((r: any) => r.id); // Solo incluir roles que tienen ID
        } else {
          rolesNormalizados = empresaData.roles;
        }
      }
      
      return {
        cuit: empresaData.cuit,
        razonSocial: empresaData.razonSocial || '',
        nombreFantasia: empresaData.nombreFantasia || '',
        roles: rolesNormalizados,
      };
    }
    
    return null;
  };

  // Inicializar empresasPorRol al editar un contrato
  useEffect(() => {
    if (safeSeleccionado && roles.length > 0 && allEmpresas.length > 0 && safeSeleccionado.id) {
      const mapping = [
        { rol: "Titular Carta de Porte", field: "titularCartaDePorte" },
        { rol: "Destino", field: "destino" },
        { rol: "Destinatario", field: "destinatario" },
        { rol: "Remitente Comercial Productor", field: "remitenteProductor" },
        { rol: "Corredor Venta Primaria", field: "corredorVentaPrimaria" },
        { rol: "Rte. Comercial Venta Primaria", field: "remitenteVentaPrimaria" },
        { rol: "Flete Pagador", field: "fletePagador" },
        { rol: "Corredor Venta Secundaria", field: "corredorVentaSecundaria" },
        { rol: "Representante entregador", field: "representanteEntregador" },
        { rol: "Rte Comercial Venta Secundaria", field: "remitenteVentaSecundaria" },
        { rol: "Rte. Comercial Venta Secundaria", field: "remitenteVentaSecundaria" }, // Variante con punto
        { rol: "Rte Comercial Venta Secundaria 2", field: "rteComercialVentaSecundaria2" },
        { rol: "Representante recibidor", field: "representanteRecibidor" },
      ];
      const nuevasEmpresasPorRol: { [rolId: number]: any | null } = {};
      
      mapping.forEach(({ rol, field }) => {
        const rolId = getRolIdByName(rol);
        const valor = safeSeleccionado[field];
        if (rolId !== undefined && valor) {
          const empresaNormalizada = normalizarEmpresa(valor, allEmpresas);
          if (empresaNormalizada) {
            nuevasEmpresasPorRol[rolId] = empresaNormalizada;
          }
        }
      });
      
      // Para otros roles dinámicos
      roles.forEach((rolObj: any) => {
        if (
          !nuevasEmpresasPorRol[rolObj.id] &&
          safeSeleccionado[rolObj.nombre]
        ) {
          const valor = safeSeleccionado[rolObj.nombre];
          const empresaNormalizada = normalizarEmpresa(valor, allEmpresas);
          if (empresaNormalizada) {
            nuevasEmpresasPorRol[rolObj.id] = empresaNormalizada;
          }
        }
      });
      
      setEmpresasPorRol(nuevasEmpresasPorRol);
    } else if (!safeSeleccionado || !safeSeleccionado.id) {
      setEmpresasPorRol({}); // Crear: vacíos
    }
  }, [safeSeleccionado?.id, roles.length, allEmpresas.length]);

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
          handleCloseDialog={() => {
            setOpenDialogDelete(false);
            if (refreshContratos) refreshContratos();
            handleClose();
          }}
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
