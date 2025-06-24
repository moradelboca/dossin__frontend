/* eslint-disable @typescript-eslint/no-explicit-any */
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { Autocomplete, Box, CircularProgress, Dialog, DialogContent, IconButton, Stack, TextField, Typography } from "@mui/material";
import React, { useContext, useEffect, useState } from "react";
import { FormularioProps } from "../../../interfaces/FormularioProps";
import { ContextoGeneral } from "../../Contexto";
import DeleteEntidad from "../../dialogs/DeleteEntidad";
import useValidation from "../../hooks/useValidation";
import AutocompletarPais from "../../cargas/autocompletar/AutocompletarPais";
import CuilFormat from "../formatos/CuilFormat";
import NumeroFormat from "../formatos/NumeroFormat";
import { useNotificacion } from "../../Notificaciones/NotificacionSnackbar";
import MainButton from '../../botones/MainButtom';


const EmpresaForm: React.FC<FormularioProps> = ({
  seleccionado = {},
  datos,
  setDatos,
  handleClose,
}) => {
  const { backendURL } = useContext(ContextoGeneral);
  const [openDialogDelete, setOpenDialogDelete] = useState(false);

  const [localidades, setLocalidades] = useState<any[]>([]);
  const [localidadSeleccionada, setlocalidadSeleccionada] = useState<string | null>(
    seleccionado?.localidad || null
  );

  const [codigoSeleccionado, setCodigoSeleccionado] = useState<string>("");
  const [numeroCel, setNumeroCel] = useState<string>("");

  const [roles, setRoles] = useState<any[]>([]);
  const [rolesSeleccionados, setRolesSeleccionados] = useState<any[]>([]);

  // Estados para que se carguen las localidades y roles
  const [loadingLocalidades, setLoadingLocalidades] = useState(false);
  const [loadingRoles, setLoadingRoles] = useState(false);

  // States para el tema de las notificaciones
  const { showNotificacion } = useNotificacion();

  const { theme } = useContext(ContextoGeneral);
  // Estilos para azul en focus
  const azulStyles = {
    '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: theme.colores.azul,
    },
    '& .MuiInputLabel-root.Mui-focused': {
      color: theme.colores.azul,
    },
  };

  // Validations
  const { data, errors, handleChange, validateAll } = useValidation(
    {
      cuit: null,
      razonSocial: "",
      nombreFantasia: "",
      idLocalidad: "",
      numeroCel: "",
      roles: [],
      urlConstanciaAfip: "",
      urlConstanciaCBU: "",
      email: "",
      ...seleccionado,
    },
    {
      cuit: (value) => {
        if (!value) {
          return "El CUIT es obligatorio";
        }
        const valStr = typeof value === "number"
          ? value.toString()
          : value.trim(); 
          
        if (valStr.length !== 11 && !seleccionado?.cuit) {
          return "El CUIT está incompleto";
        }
        
        const prefijosValidos = ['20', '23', '24', '27', '30', '33'];
        const prefijo = valStr.slice(0, 2);
        if (!prefijosValidos.includes(prefijo)) {
          return `Prefijo inválido (‘${prefijo}’). Debe ser uno de: ${prefijosValidos.join(', ')}`;
        }
        
        return null;
      },
      razonSocial: (value) => (!value ? "La razón social es obligatoria" : null),
      nombreFantasia: (value) => (!value ? "El nombre de fantasía es obligatorio" : null),
      numeroCel: (value) => {
          return !value || !/^\+\d{1,4}-\d{10}$/.test(`${codigoSeleccionado}-${value}`)
              ? "Número de celular inválido (Ej: +54-1234567890)"
              : null;
      },
      idLocalidad: () => (!localidadSeleccionada ? "Debe seleccionar una localidad" : null),
      roles: () => {
        const rolesValidos = rolesSeleccionados.length > 0;
        if (!rolesValidos) {
          return "Debe seleccionar al menos una empresa";
        }
        return null;
      },
      urlConstanciaAfip: (value) =>
        value && !/^https?:\/\//.test(value)
          ? "Debe ser una URL válida o dejarlo vacio"
          : null,
      urlConstanciaCBU: (value) =>
        value && !/^https?:\/\//.test(value)
          ? "Debe ser una URL válida o dejarlo vacio"
          : null,
      email: (value) =>
        value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
          ? "Debe ser un correo válido"
          : null,
    }
  );

  useEffect(() => {
    if (roles.length > 0 && seleccionado?.roles) {
      let rolesIniciales: any[] = [];
      if (Array.isArray(seleccionado.roles)) {
        rolesIniciales = seleccionado.roles.map((rolSel: any) => {
          const rolEncontrado = roles.find(
            (r) => r.id === rolSel.id || r.nombre === rolSel.nombre
          );
          return rolEncontrado || rolSel;
        });
      }
      else if (typeof seleccionado.roles === "string") {
        const nombres = seleccionado.roles.split(",").map((s: string) => s.trim());
        rolesIniciales = roles.filter((r) => nombres.includes(r.nombre));
      }
      setRolesSeleccionados(rolesIniciales);
    }
  }, [seleccionado?.roles, roles]);

  useEffect(() => {
    setLoadingLocalidades(true);
    fetch(`${backendURL}/ubicaciones/localidades`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true",
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Error HTTP: ${response.status}`);
        }
        return response.json();
      })
      .then((data) =>
        setLocalidades(
          data.map((ubicacion: any) => ({
            id: ubicacion.id,
            displayName: `${ubicacion.nombre} / ${ubicacion.provincia?.nombre || "Sin provincia"}`,
            nombre: ubicacion.nombre,
            provincia: ubicacion.provincia?.nombre || "Sin provincia",
          }))
        )
      )
      .catch((error) => {
        throw new Error(`Error al obetener las localidades: ${error}`);
      })
      .finally(() => setLoadingLocalidades(false));
  }, [backendURL]);

  useEffect(() => {
    setLoadingRoles(true);
    fetch(`${backendURL}/empresas/roles`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true",
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Error HTTP: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => setRoles(data))
      .catch((error) => {
        throw new Error(`Error: ${error}`);
      })
      .finally(() => setLoadingRoles(false));
  }, [backendURL]);

  useEffect(() => {
    if (typeof seleccionado?.localidad === "string") {
      const [nombreLocalidad, nombreProvincia] = seleccionado.localidad.split(" / ").map((str: string) => str.trim());
      const localidadEncontrada = localidades.find(
        (loc) => loc.nombre === nombreLocalidad && loc.provincia === nombreProvincia
      );
      if (localidadEncontrada) {
        setlocalidadSeleccionada(localidadEncontrada.displayName);
      }
    } else if (seleccionado?.localidad && typeof seleccionado.localidad === "object") {
      const displayName = `${seleccionado.localidad.nombre} / ${seleccionado.localidad.provincia.nombre}`;
      setlocalidadSeleccionada(displayName);
    }
  }, [seleccionado?.localidad, localidades]);

  useEffect(() => {
    if (seleccionado?.numeroCel) {
      let codigo = "";
      let numero = "";
      if (/^\+\d{1,4}-\d{10}$/.test(seleccionado.numeroCel)) {
        [codigo, numero] = seleccionado.numeroCel.split("-");
      } else if (/^\d{12,15}$/.test(seleccionado.numeroCel)) {
        codigo = `+${seleccionado.numeroCel.slice(0, 3)}`;
        numero = seleccionado.numeroCel.slice(3);
      }
      setCodigoSeleccionado(codigo || "");
      setNumeroCel(numero || "");
    }
  }, [seleccionado?.numeroCel]);

  const handleNumeroCelularChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const numeroNuevo = event.target.value;
    setNumeroCel(numeroNuevo);
    handleChange("numeroCel")(event);
  };

  const handleSubmit = () => {
    if (validateAll()) {
      const metodo = seleccionado?.cuit ? "PUT" : "POST";
      const url = seleccionado?.cuit
        ? `${backendURL}/empresas/${data.cuit}`
        : `${backendURL}/empresas`;

      const localidadObjeto = localidades.find(
        (loc) => loc.displayName === localidadSeleccionada
      );

      const rolesLista = rolesSeleccionados.map((rol) => rol.id);

      const payload = {
        cuit: Number(data.cuit),
        razonSocial: data.razonSocial,
        nombreFantasia: data.nombreFantasia,
        idLocalidad: localidadObjeto?.id,
        numeroCel: `${codigoSeleccionado}-${numeroCel}`.replace(/[^0-9]/g, ""),
        urlConstanciaAfip: data.urlConstanciaAfip,
        urlConstanciaCBU: data.urlConstanciaCBU,
        idsRoles: rolesLista,
        email: data.email,
      };

      fetch(url, {
        method: metodo,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      .then(async (response) => {
        if (!response.ok) {
          let errorMessage = await response.text();
          try {
            const errorData = JSON.parse(errorMessage);
            errorMessage = errorData.message || errorMessage;
          } catch (e) {
            // Si no es JSON, quedarse con el texto plano
          }
          throw new Error(errorMessage);
        }
        return response.json();
      })
        .then((newData) => {
          if (metodo === "POST") {
            setDatos([...datos, newData]);
            showNotificacion('Empresa creada exitosamente', 'success');
          } else {
            setDatos(
              datos.map((empresa: { cuit: any }) =>
                empresa.cuit === data.cuit ? newData : empresa
              )
            );
            showNotificacion('Empresa actualizada exitosamente', 'success');
          }
          handleClose();
        })
        .catch((error) => {
          console.error('Error:', error);
          showNotificacion(
            `Error al procesar la solicitud: ${error.message}`,
            'error'
          );
        });
    } else {
      // Mostrar error de validación
      showNotificacion(
        'Por favor corrija los errores en el formulario',
        'error'
      );
    }
  };

  const handleClickDeleteCarga = () => setOpenDialogDelete(true);
  const handleCloseDialog = () => setOpenDialogDelete(false);

  return (
    <Stack spacing={3} sx={{ p: 2 }}>
      {/* CUIT */}
      <TextField
        label="CUIT"
        name="cuit"
        variant="outlined"
        fullWidth
        InputProps={{
          inputComponent: CuilFormat as any,
        }}
        value={data.cuit !== null && data.cuit !== undefined ? String(data.cuit) : ""}
        onChange={handleChange("cuit")}
        error={!!errors.cuit}
        helperText={errors.cuit}
        disabled={!!seleccionado?.cuit}
        sx={{ mb: 1, ...azulStyles }}
      />
  
      {/* Razón Social y Nombre Fantasía */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <TextField
          label="Razón Social"
          name="razonSocial"
          variant="outlined"
          fullWidth
          value={data.razonSocial ?? ""}
          onChange={handleChange("razonSocial")}
          error={!!errors.razonSocial}
          helperText={errors.razonSocial}
          sx={azulStyles}
        />
        <TextField
          label="Nombre Fantasía"
          name="nombreFantasia"
          variant="outlined"
          fullWidth
          value={data.nombreFantasia ?? ""}
          onChange={handleChange("nombreFantasia")}
          error={!!errors.nombreFantasia}
          helperText={errors.nombreFantasia}
          sx={azulStyles}
        />
      </Stack>
  
      {/* Localidad */}
      <Autocomplete
        disablePortal
        options={localidades}
        getOptionLabel={(option) => option.displayName}
        value={localidades.find((loc) => loc.displayName === localidadSeleccionada) || null}
        onChange={(_, newValue) => setlocalidadSeleccionada(newValue?.displayName || null)}
        loading={loadingLocalidades}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Localidad"
            variant="outlined"
            error={!!errors.idLocalidad}
            helperText={errors.idLocalidad}
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <>
                  {loadingLocalidades && <CircularProgress color="inherit" size={20} />}
                  {params.InputProps.endAdornment}
                </>
              ),
            }}
            sx={azulStyles}
          />
        )}
      />
  
      {/* Teléfono */}
      <Box display="flex" alignItems="center" gap={1}>
        <Box sx={{ width: 120, flexShrink: 0 }}>
          <AutocompletarPais
            setCodigoSeleccionado={setCodigoSeleccionado}
            error={!!errors.numeroCel}
            defaultPhone={codigoSeleccionado}
          />
        </Box>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          -
        </Typography>
        <TextField
          label="Número de Celular"
          variant="outlined"
          fullWidth
          InputProps={{
            inputComponent: NumeroFormat as any,
          }}
          value={numeroCel ?? ""}
          onChange={handleNumeroCelularChange}
          error={!!errors.numeroCel}
          helperText={errors.numeroCel}
          sx={azulStyles}
        />
      </Box>
  
      {/* Roles */}
      <Autocomplete
        multiple
        limitTags={3}
        options={roles}
        getOptionLabel={(option) => option.nombre}
        value={rolesSeleccionados}
        onChange={(_, newValue) => setRolesSeleccionados(newValue)}
        loading={loadingRoles}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Roles"
            placeholder="Selecciona roles"
            variant="outlined"
            error={!!errors.roles}
            helperText={errors.roles}
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <>
                  {loadingRoles && <CircularProgress color="inherit" size={20} />}
                  {params.InputProps.endAdornment}
                </>
              ),
            }}
            sx={azulStyles}
          />
        )}
      />
  
      {/* URLs y Email */}
      <Stack spacing={2}>
        <TextField
          label="URL Constancia Afip"
          variant="outlined"
          fullWidth
          value={data.urlConstanciaAfip ?? ""}
          onChange={handleChange("urlConstanciaAfip")}
          error={!!errors.urlConstanciaAfip}
          helperText={errors.urlConstanciaAfip}
          sx={azulStyles}
        />
        <TextField
          label="URL Constancia CBU"
          variant="outlined"
          fullWidth
          value={data.urlConstanciaCBU ?? ""}
          onChange={handleChange("urlConstanciaCBU")}
          error={!!errors.urlConstanciaCBU}
          helperText={errors.urlConstanciaCBU}
          sx={azulStyles}
        />
        <TextField
          label="Email"
          name="email"
          variant="outlined"
          fullWidth
          value={data.email ?? ""}
          onChange={handleChange("email")}
          error={!!errors.email}
          helperText={errors.email}
          sx={azulStyles}
        />
      </Stack>
  
      {/* Acciones */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          gap: 2,
          justifyContent: 'flex-end',
          alignItems: 'center',
          mt: 4,
          position: 'relative',
        }}
      >
        <MainButton
          onClick={handleClose}
          text="Cancelar"
          backgroundColor="transparent"
          textColor={theme.colores.azul}
          borderRadius="8px"
          hoverBackgroundColor="rgba(22, 54, 96, 0.1)"
          width="120px"
          divWidth="120px"
        />
        <MainButton
          onClick={handleSubmit}
          text="Guardar"
          backgroundColor={theme.colores.azul}
          textColor="#fff"
          borderRadius="8px"
          hoverBackgroundColor={theme.colores.azulOscuro}
          width="120px"
          divWidth="120px"
        />
        <IconButton
          onClick={handleClickDeleteCarga}
          sx={{ ml: 1, width: 40, height: 40, borderRadius: '50%', background: 'transparent', transition: 'background 0.2s', '&:hover': { background: 'rgba(214, 131, 132, 0.12)' }, display: 'flex', alignItems: 'center', justifyContent: 'center', p: 0 }}
          title="Eliminar entidad"
        >
          <DeleteOutlineIcon sx={{ fontSize: 20, color: '#d68384' }} />
        </IconButton>
      </Box>
  
      {/* Diálogo de Confirmación */}
      <Dialog 
        open={openDialogDelete} 
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogContent sx={{ py: 3 }}>
          <DeleteEntidad
            idEntidad={Number(data.cuit)}
            endpointEntidad="empresas"
            handleCloseDialog={handleCloseDialog}
            handleClose={handleClose}
            datos={datos}
            setDatos={setDatos}
          />
        </DialogContent>
       
      </Dialog>
    </Stack>
  );
};

export default EmpresaForm;
