import { 
    Autocomplete, 
    Box, 
    Button, 
    CircularProgress, 
    Dialog, 
    IconButton, 
    TextField,
    useTheme,
    useMediaQuery
  } from "@mui/material";
  import React, { useContext, useEffect, useState } from "react";
  import { FormularioProps } from "../../../interfaces/FormularioProps";
  import { ContextoGeneral } from "../../Contexto";
  import DeleteEntidad from "../../dialogs/DeleteEntidad";
  import useValidation from "../../hooks/useValidation";
  import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
  import AutocompletarPais from "../../cargas/autocompletar/AutocompletarPais";
  import CuilFormat from "../formatos/CuilFormat";
  import NumeroFormat from "../formatos/NumeroFormat";
  
  interface Localidad {
    id: string;
    displayName: string;
    nombre: string;
    provincia: string;
  }
  
  interface RolEmpresa {
    id: number;
    nombre: string;
  }
  
  const EmpresaForm: React.FC<FormularioProps> = ({
    seleccionado = {},
    datos,
    setDatos,
    handleClose,
  }) => {
    const { backendURL } = useContext(ContextoGeneral);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
    
    // Estados
    const [openDialogDelete, setOpenDialogDelete] = useState(false);
    const [localidades, setLocalidades] = useState<Localidad[]>([]);
    const [localidadSeleccionada, setLocalidadSeleccionada] = useState<string | null>(
      seleccionado?.localidad || null
    );
    const [codigoSeleccionado, setCodigoSeleccionado] = useState("");
    const [numeroCel, setNumeroCel] = useState("");
    const [roles, setRoles] = useState<RolEmpresa[]>([]);
    const [rolesSeleccionados, setRolesSeleccionados] = useState<string[]>([]);
    const [loading, setLoading] = useState({ localidades: false, roles: false });
  
    // Configuración de validación
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
                if (value.length !== 11 && !seleccionado?.cuit) {
                    return "El CUIT está incompleto";
                }
                return null;
            },
            razonSocial: (value) => (!value ? "La razón social es obligatoria" : null),
            nombreFantasia: (value) => (!value ? "El nombre de fantasía es obligatorio" : null),
            numeroCel: (value) => {
                const numeroCompleto = `${codigoSeleccionado}-${value}`;
                return !value || !/^\+\d{1,4}-\d{10}$/.test(numeroCompleto)
                    ? "Número de celular inválido (Ej: +54-1234567890)"
                    : null;
            },
            idLocalidad: () => (!localidadSeleccionada ? "Debe seleccionar una localidad" : null),
            roles: () => {
                const rolesValidos = rolesSeleccionados.length > 0 || (seleccionado?.roles.length > 0 && rolesSeleccionados.length > 0);
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
  
    // Efectos iniciales
    useEffect(() => {
      initializeFormData();
        fetch(`${backendURL}/ubicaciones/localidades`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
          },
        })
          .then((response) => response.json())
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
          .catch(() => console.error("Error al obtener localidades"))
        fetchData(`${backendURL}/empresas/roles`, setRoles, 'roles');
    }, [backendURL]);
  
    // Helpers
    const initializeFormData = () => {
      initializeLocalidad();
      initializeRoles();
      initializeTelefono();
    };
  
    const initializeLocalidad = () => {
      if (!seleccionado?.localidad) return;
      const displayName = typeof seleccionado.localidad === 'string' 
        ? seleccionado.localidad 
        : `${seleccionado.localidad.nombre} / ${seleccionado.localidad.provincia.nombre}`;
      setLocalidadSeleccionada(displayName);
    };
  
    const initializeRoles = () => {
      if (!seleccionado?.roles) return;
      const rolesIniciales = Array.isArray(seleccionado.roles)
        ? seleccionado.roles.map((r: RolEmpresa) => r.nombre)
        : seleccionado.roles.split(",");
      setRolesSeleccionados(rolesIniciales);
    };
  
    const initializeTelefono = () => {
      if (!seleccionado?.numeroCel) return;
      const [codigo, numero] = seleccionado.numeroCel.includes('-')
        ? seleccionado.numeroCel.split('-')
        : [`+${seleccionado.numeroCel.slice(0,3)}`, seleccionado.numeroCel.slice(3)];
      setCodigoSeleccionado(codigo);
      setNumeroCel(numero);
    };
  
    const fetchData = async (url: string, parser: (data: any) => any, type: 'localidades' | 'roles') => {
      try {
        setLoading(prev => ({ ...prev, [type]: true }));
        const response = await fetch(url, { headers: getHeaders() });
        const data = await response.json();
        parser(data);
      } catch (error) {
        console.error(`Error cargando ${type}:`, error);
      } finally {
        setLoading(prev => ({ ...prev, [type]: false }));
      }
    };
  
    
  
    const getHeaders = () => ({
      "Content-Type": "application/json",
      "ngrok-skip-browser-warning": "true",
    });
  
    // Handlers
    const handleNumeroCelularChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setNumeroCel(e.target.value);
      handleChange("numeroCel")(e);
    };
  
    const handleSubmit = async () => {
      if (!validateAll()) return;
  
      try {
        const metodo = seleccionado?.cuit ? "PUT" : "POST";
        const url = seleccionado?.cuit 
          ? `${backendURL}/empresas/${data.cuit}`
          : `${backendURL}/empresas`;
  
        const response = await fetch(url, {
          method: metodo,
          headers: getHeaders(),
          body: JSON.stringify(preparePayload()),
        });
  
        if (!response.ok) throw new Error(await response.text());
        
        updateDatos(await response.json());
        handleClose();
      } catch (error) {
        console.error("Error al guardar:", error);
      }
    };
  
    const preparePayload = () => ({
      cuit: Number(data.cuit),
      razonSocial: data.razonSocial,
      nombreFantasia: data.nombreFantasia,
      idLocalidad: localidades.find(l => l.displayName === localidadSeleccionada)?.id,
      numeroCel: `${codigoSeleccionado}-${numeroCel}`.replace(/[^0-9]/g, ''),
      urlConstanciaAfip: data.urlConstanciaAfip,
      urlConstanciaCBU: data.urlConstanciaCBU,
      idsRoles: rolesSeleccionados.map(nombre => roles.find(r => r.nombre === nombre)?.id).filter(Boolean),
      email: data.email,
    });
  
    const updateDatos = (newData: any) => 
      setDatos(seleccionado?.cuit 
        ? datos.map((e: any) => e.cuit === data.cuit ? newData : e)
        : [...datos, newData]
      );
  
    // Componente reutilizable
    const FormField = ({ name, label, type = 'text', ...props }: any) => (
      <TextField
        margin="dense"
        label={label}
        variant="outlined"
        fullWidth
        type={type}
        value={data[name]}
        onChange={handleChange(name)}
        error={!!errors[name]}
        helperText={errors[name]}
        {...props}
      />
    );
  
    return (
      <Box sx={{ p: isMobile ? 2 : 4 }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <FormField 
            name="cuit" 
            label="CUIT"
            slotProps={{ input: { inputComponent: CuilFormat as any } }}
            disabled={!!seleccionado?.cuit}
          />
          
          <FormField name="razonSocial" label="Razón Social" />
          <FormField name="nombreFantasia" label="Nombre de Fantasía" />
  
          <Autocomplete
            options={localidades}
            getOptionLabel={(l: Localidad) => l.displayName}
            value={localidades.find(l => l.displayName === localidadSeleccionada) || null}
            onChange={(_, v) => setLocalidadSeleccionada(v?.displayName || null)}
            loading={loading.localidades}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Localidad"
                error={!!errors.idLocalidad}
                helperText={errors.idLocalidad}
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {loading.localidades && <CircularProgress size={20} />}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
          />
  
          {/* Sección Teléfono Responsive */}
          <Box display="flex" gap={2} flexDirection={isMobile ? "column" : "row"}>
            <AutocompletarPais
              setCodigoSeleccionado={setCodigoSeleccionado}
              error={!!errors.numeroCel}
              defaultPhone={codigoSeleccionado}
              fullWidth={isMobile}
            />
            <TextField
              label="Número de Celular"
              value={numeroCel}
              onChange={handleNumeroCelularChange}
              error={!!errors.numeroCel}
              helperText={errors.numeroCel}
              slotProps={{ input: { inputComponent: NumeroFormat as any } }}
              sx={{ flex: 1, '& .MuiInputBase-root': { height: isMobile ? 56 : 'auto' } }}
            />
          </Box>
  
          <Autocomplete
            multiple
            limitTags={2}
            options={roles}
            getOptionLabel={(r: RolEmpresa) => r.nombre}
            value={roles.filter(r => rolesSeleccionados.includes(r.nombre))}
            onChange={(_, v) => setRolesSeleccionados(v.map(r => r.nombre))}
            loading={loading.roles}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Roles"
                placeholder="Seleccione roles"
                error={!!errors.roles}
                helperText={errors.roles}
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {loading.roles && <CircularProgress size={20} />}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
          />
  
          <FormField name="urlConstanciaAfip" label="URL Constancia AFIP" />
          <FormField name="urlConstanciaCBU" label="URL Constancia CBU" />
          <FormField name="email" label="Email" type="email" />
  
          {/* Botones Responsive */}
          <Box display="flex" gap={2} flexDirection={isMobile ? "column" : "row"}>
            <Button fullWidth variant="outlined" onClick={handleClose}>Cancelar</Button>
            <Button fullWidth variant="contained" onClick={handleSubmit}>Guardar</Button>
            {seleccionado && (
              <IconButton 
                onClick={() => setOpenDialogDelete(true)}
                sx={{ alignSelf: 'center', mx: isMobile ? 0 : 2 }}
              >
                <DeleteOutlineIcon sx={{ color: "#d68384" }} />
              </IconButton>
            )}
          </Box>
  
          <Dialog open={openDialogDelete} onClose={() => setOpenDialogDelete(false)} fullWidth maxWidth="sm">
            <DeleteEntidad
              idEntidad={Number(data.cuit)}
              endpointEntidad="empresas"
              handleCloseDialog={() => setOpenDialogDelete(false)}
              handleClose={handleClose}
              datos={datos}
              setDatos={setDatos}
            />
          </Dialog>
        </Box>
      </Box>
    );
  };
  
  export default EmpresaForm;