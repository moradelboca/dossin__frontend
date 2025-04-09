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
  import React, { useContext, useEffect, useState, useMemo } from "react";
  import { ContextoGeneral } from "../../Contexto";
  import useValidation from "../../hooks/useValidation";
  import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
  import DeleteEntidad from "../../dialogs/DeleteEntidad";
  import { FormularioProps } from "../../../interfaces/FormularioProps";
  import NumeroFormat from "../formatos/NumeroFormat";
  import AutocompletarPais from "../../cargas/autocompletar/AutocompletarPais";
  import CuilFormat from "../formatos/CuilFormat";
  
  const ChoferForm: React.FC<FormularioProps> = ({ 
    seleccionado = {}, 
    datos = [], 
    setDatos, 
    handleClose 
  }) => {
    const { backendURL } = useContext(ContextoGeneral);
    const [openDialogDelete, setOpenDialogDelete] = useState(false);
    const [choferExistente, setChoferExistente] = useState(false);
  
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  
    const [empresas, setEmpresas] = useState<any[]>([]);
    const [empresasSeleccionadas, setEmpresasSeleccionadas] = useState<any[]>([]); 
  
    const [codigoSeleccionado, setCodigoSeleccionado] = useState<string>("");
    const [numeroCel, setNumeroCel] = useState<string>("");
  
    const roles = useMemo(() => [
      { id: 1, nombre: "Camionero" },
      { id: 2, nombre: "Encargado" },
    ], []);
    
    const [rolSeleccionado, setRolSeleccionado] = useState<{ id: number; nombre: string } | null>(
      roles.find((rol) => rol.nombre === seleccionado?.rol) || null
    );
  
    // Estados para cargar empresas y localidades
    const [loadingEmpresas, setLoadingEmpresas] = useState(false);
    const [loadingLocalidades, setLoadingLocalidades] = useState(false);
    
    const { data, errors, handleChange, validateAll } = useValidation(
      {
        cuil: "",
        numeroCel: "",
        nombre: "",
        apellido: "",
        fechaNacimiento: "",
        empresas: [],
        urlLINTI: "",
        idLocalidad: "",
        idRol: "",
        ...seleccionado,
      },
      {
        cuil: (value) => (!value ? "El CUIL es obligatorio" : null),
        numeroCel: (value) => {
            if (!codigoSeleccionado) {
              return "Seleccione el código de país";
            }
            if (!value) {
              return "El número de celular es obligatorio";
            }
            const numeroCompleto = `${codigoSeleccionado}-${value}`;
            // Si deseas permitir también números de 9 dígitos, podrías usar {9,10} en lugar de {10}
            if (!/^\+\d{1,4}-\d{10}$/.test(numeroCompleto)) {
              return "Número de celular inválido (Ej: +54-1234567890)";
            }
            return null;
          },
        nombre: (value) => (!value ? "El nombre es obligatorio" : null),
        apellido: (value) => (!value ? "El apellido es obligatorio" : null),
        fechaNacimiento: (value) => (!value ? "La fecha de nacimiento es obligatoria" : null),
        empresas: () => {
          const empresasValidas = empresasSeleccionadas.length > 0 || (seleccionado?.empresas?.length > 0 && empresasSeleccionadas.length > 0);
          if (!empresasValidas) {
            return "Debe seleccionar al menos una empresa";
          }
          return null;
        },
        urlLINTI: (value) =>
          value && !/^https?:\/\//.test(value)
            ? "Debe ser una URL válida o dejarlo vacío"
            : null,
        idLocalidad: () => (!localidadSeleccionada ? "Debe seleccionar una localidad" : null),
        idRol: () => (!rolSeleccionado ? "El rol es obligatorio" : null),
      }
    );
    
    useEffect(() => {
      if (Array.isArray(seleccionado?.empresas)) {
        const iniciales = seleccionado.empresas.map((empresa: { cuit: number }) => empresa.cuit);
        setEmpresasSeleccionadas(iniciales);
      } else if (typeof seleccionado?.empresas === "string") {
        const iniciales = seleccionado.empresas.split(",")
          .map((empresa: string) => {
            const cuit = empresa.split(" - ").pop();
            return cuit ? Number(cuit) : null;
          })
          .filter((cuit: number | null) => cuit !== null);
        setEmpresasSeleccionadas(iniciales);
      }
    }, [seleccionado?.empresas]);
  
    const [localidades, setLocalidades] = useState<any[]>([]);
    const [localidadSeleccionada, setlocalidadSeleccionada] = useState<string | null>(
      seleccionado?.localidad || null
    );
  
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
      setLoadingEmpresas(true);
      fetch(`${backendURL}/empresas`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
      })
        .then((response) => response.json())
        .then((data) => setEmpresas(data))
        .catch(() => console.error("Error al obtener las empresas"))
        .finally(() => setLoadingEmpresas(false));
    }, [backendURL]);
  
    useEffect(() => {
      setLoadingLocalidades(true);
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
        .finally(() => setLoadingLocalidades(false));
    }, [backendURL]);
  
    useEffect(() => {
      if (typeof seleccionado?.rol === "string") {
        const rolEncontrado = roles.find((rol) => rol.nombre === seleccionado.rol);
        setRolSeleccionado(rolEncontrado || null);
      } else if (seleccionado?.rol && typeof seleccionado.rol === "object") {
        setRolSeleccionado(seleccionado.rol);
      }
    }, [seleccionado?.rol, roles]);
  
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
  
    // Función para verificar si ya existe un colaborador con el CUIL ingresado
    const checkIfChoferExists = () => {
      // Solo se verifica si se ingresó un CUIL y no está en modo edición
      if (!data.cuil || seleccionado?.cuil) return;
      fetch(`${backendURL}/colaboradores/${data.cuil}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((response) => {
          if (response.ok) {
            setChoferExistente(true);
          } else {
            setChoferExistente(false);
          }
        })
        .catch(() => setChoferExistente(false));
    };
  
    const handleSubmit = () => {
      if (choferExistente) {
        alert("Ya existe un colaborador con este CUIL.");
        return;
      }
      if (validateAll()) {
        const metodo = seleccionado?.cuil ? "PUT" : "POST";
        const url = seleccionado?.cuil
          ? `${backendURL}/colaboradores/${data.cuil}`
          : `${backendURL}/colaboradores`;
  
        const numeroCompleto = `${codigoSeleccionado}-${numeroCel}`.replace(/[^0-9]/g, '');
  
        const localidadObjeto = localidades.find((loc) => loc.displayName === localidadSeleccionada);
        const rolObjeto = roles.find((rol) => rol.id === rolSeleccionado?.id);
  
        const payload: any = {
          cuil: data.cuil,
          numeroCel: numeroCompleto,
          nombre: data.nombre,
          apellido: data.apellido,
          fechaNacimiento: data.fechaNacimiento,
          empresas: empresasSeleccionadas,
          urlLINTI: data.urlLINTI,
          idLocalidad: localidadObjeto?.id,
          idRol: rolObjeto?.id,
        };
        
        fetch(url, {
          method: metodo,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
          .then(async (response) => {
            if (!response.ok) {
              const errorMessage = await response.text();
              throw new Error(`Error del servidor: ${errorMessage}`);
            }
            return response.json();
          })
          .then((newData) => {
            if (metodo === "POST") {
              setDatos([...datos, newData]);
            } else {
              setDatos(
                datos.map((colaborador: { cuil: any }) =>
                  colaborador.cuil === data.cuil ? newData : colaborador
                )
              );
            }
            handleClose();
          })
          .catch((error) => console.error(`Error: ${error.message}`));
      }
    };
  
    const handleClickDelete = () => setOpenDialogDelete(true);
    const handleCloseDialog = () => setOpenDialogDelete(false);
  
    return (
      <Box sx={{ p: isMobile ? 2 : 4 }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField
            margin="dense"
            label="CUIL"
            name="cuil"
            variant="outlined"
            fullWidth
            slotProps={{
              input: {
                inputComponent: CuilFormat as any,
              },
            }}
            value={data.cuil}
            onChange={handleChange("cuil")}
            onBlur={checkIfChoferExists}
            error={!!errors.cuil || choferExistente}
            helperText={choferExistente ? "Ya existe un colaborador con este CUIL" : errors.cuil}
            disabled={!!seleccionado?.cuil}
          />
  
  <Box
          display="flex"
          flexDirection={isMobile ? "column" : "row"}
          gap={2}
          alignItems={isMobile ? "flex-start" : "center"}
          mt={2}
          mb={1}
        >
          <Box width={isMobile ? "100%" : "160px"}>
            <AutocompletarPais
              setCodigoSeleccionado={setCodigoSeleccionado}
              error={!!errors.numeroCel}
              defaultPhone={codigoSeleccionado}
              fullWidth={isMobile}
            />
          </Box>
          
          <TextField
            margin="dense"
            label="Número de Celular"
            variant="outlined"
            fullWidth
            slotProps={{
              input: {
                inputComponent: NumeroFormat as any,
              },
            }}
            value={numeroCel}
            onChange={handleNumeroCelularChange}
            error={!!errors.numeroCel}
            helperText={errors.numeroCel}
            sx={{
              width: isMobile ? '100%' : 'calc(100% - 176px)',
              '& .MuiInputBase-root': {
                height: isMobile ? '56px' : 'auto'
              }
            }}
          />
        </Box>
  
          <TextField
            margin="dense"
            label="Nombre"
            variant="outlined"
            fullWidth
            value={data.nombre}
            onChange={handleChange("nombre")}
            error={!!errors.nombre}
            helperText={errors.nombre}
          />
  
          <TextField
            margin="dense"
            label="Apellido"
            variant="outlined"
            fullWidth
            value={data.apellido}
            onChange={handleChange("apellido")}
            error={!!errors.apellido}
            helperText={errors.apellido}
          />
  
          <TextField
            margin="dense"
            label="Fecha de Nacimiento"
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={data.fechaNacimiento}
            onChange={handleChange("fechaNacimiento")}
            error={!!errors.fechaNacimiento}
            helperText={errors.fechaNacimiento}
          />
  
          <Autocomplete
            multiple
            limitTags={2}
            id="empresas-autocomplete"
            options={empresas}
            getOptionLabel={(option) => option.nombreFantasia}
            value={empresas.filter((empresa) => empresasSeleccionadas.includes(empresa.cuit))}
            onChange={(_, newValue) => setEmpresasSeleccionadas(newValue.map((empresa) => empresa.cuit))}
            loading={loadingEmpresas}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Empresas"
                placeholder="Selecciona empresas"
                error={!!errors.empresas}
                helperText={errors.empresas}
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {loadingEmpresas ? <CircularProgress size={20} /> : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
          />
  
          <TextField
            margin="dense"
            label="URL LINTI"
            variant="outlined"
            fullWidth
            value={data.urlLINTI}
            onChange={handleChange("urlLINTI")}
            error={!!errors.urlLINTI}
            helperText={errors.urlLINTI}
          />
  
          <Autocomplete
            disablePortal
            options={localidades}
            getOptionLabel={(option) => option.displayName}
            value={localidades.find((loc) => loc.displayName === localidadSeleccionada) || null}
            onChange={(_, newValue) => setlocalidadSeleccionada(newValue ? newValue.displayName : null)}
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
                      {loadingLocalidades ? <CircularProgress size={20} /> : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
          />
  
          <Autocomplete
            value={rolSeleccionado}
            onChange={(_, newValue) => setRolSeleccionado(newValue)}
            options={roles}
            getOptionLabel={(option) => option.nombre}
            isOptionEqualToValue={(option, value) => option.id === value?.id}
            renderInput={(params) => (
              <TextField {...params} label="Rol" variant="outlined" fullWidth />
            )}
          />
  
          <Box
            display="flex"
            flexDirection={isMobile ? "column" : "row"}
            gap={isMobile ? 1 : 2}
            justifyContent="space-between"
            mt={2}
          >
            <Button onClick={handleClose} color="primary" variant="outlined" fullWidth={isMobile}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} color="primary" variant="contained" fullWidth={isMobile}>
              Guardar
            </Button>
            {seleccionado && (
              <IconButton onClick={handleClickDelete}>
                <DeleteOutlineIcon sx={{ fontSize: 20, color: "#d68384" }} />
              </IconButton>
            )}
          </Box>
        </Box>
  
        <Dialog open={openDialogDelete} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DeleteEntidad
            idEntidad={data.cuil}
            endpointEntidad="colaboradores"
            handleCloseDialog={handleCloseDialog}
            handleClose={handleClose}
            datos={datos}
            setDatos={setDatos}
          />
        </Dialog>
      </Box>
    );
  };
  
  export default ChoferForm;
  