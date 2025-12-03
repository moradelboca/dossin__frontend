/* eslint-disable @typescript-eslint/no-explicit-any */
import { Autocomplete, Box, CircularProgress, Dialog, IconButton, Stack, TextField, useMediaQuery, useTheme } from "@mui/material";
import React, { useContext, useEffect, useState } from "react";
import { ContextoGeneral } from "../../Contexto";
import useValidation from "../../hooks/useValidation";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import DeleteEntidad from "../../dialogs/DeleteEntidad";
import { FormularioProps } from "../../../interfaces/FormularioProps";
import NumeroFormat from "../formatos/NumeroFormat";
import AutocompletarPais from "../../cargas/autocompletar/AutocompletarPais";
import CuilFormat from "../formatos/CuilFormat";
import { useMemo } from 'react';
import { useNotificacion } from "../../Notificaciones/NotificacionSnackbar";
import MainButton from "../../botones/MainButtom";
import EmpresaForm from '../empresas/EmpresaForm';
import { axiosGet, axiosPost, axiosPut } from "../../../lib/axiosConfig";

const ChoferForm: React.FC<FormularioProps> = ({ 
    seleccionado = {}, 
    datos = [], 
    setDatos, 
    handleClose 
}) => {
    const { backendURL, theme } = useContext(ContextoGeneral);
    // States para el tema de las notificaciones
    const { showNotificacion } = useNotificacion();

    const [openDialogDelete, setOpenDialogDelete] = useState(false);
    const [openEmpresaDialog, setOpenEmpresaDialog] = useState(false);

    const [empresas, setEmpresas] = useState<any[]>([]);
    const [empresasSeleccionadas, setEmpresasSeleccionadas] = useState<any[]>([]); 

    const [codigoSeleccionado, setCodigoSeleccionado] = useState<string>("");
    const [numeroCel, setNumeroCel] = useState<string>("");

    const tema = useTheme();
    const isMobile = useMediaQuery(tema.breakpoints.down("sm"));

    const roles = useMemo(() => [
      { id: 1, nombre: "Encargado" },
      { id: 2, nombre: "Chofer" },

    ], []);
    
    const [rolSeleccionado, setRolSeleccionado] = useState<{ id: number; nombre: string } | null>(
        roles.find((rol) => rol.nombre === seleccionado?.rol) || null
    );

    // Estados para que se carguen las empresas y localidades
    const [loadingEmpresas, setLoadingEmpresas] = useState(false);
    const [loadingLocalidades, setLoadingLocalidades] = useState(false);
    
    // Estilos para azul en focus
    const azulStyles = {
        '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: theme.colores.azul,
        },
        '& .MuiInputLabel-root.Mui-focused': {
            color: theme.colores.azul,
        },
    };

    const { data, errors, handleChange, validateAll } = useValidation(
        {
            cuil: null,
            numeroCel: "",
            nombre: "",
            apellido: "",
            empresas: [],
            urlLINTI: "",
            idLocalidad: "",
            idRol: "",
            ...seleccionado,
        },
        {
            cuil: (value) => {
              if (!value) {
                return "El CUIL es obligatorio";
              }
              const valStr = typeof value === "number"
                ? value.toString()
                : value.trim(); 
                
              if (valStr.length !== 11 && !seleccionado?.cuil) {
                return "El CUIL está incompleto";
              }
              
              const prefijosValidos = ['20', '23', '24', '27', '30', '33'];
              const prefijo = valStr.slice(0, 2);
              if (!prefijosValidos.includes(prefijo)) {
                return `Prefijo inválido (‘${prefijo}’). Debe ser uno de: ${prefijosValidos.join(', ')}`;
              }
              
              return null;
            },
            numeroCel: (value) => {
                return !value || !/^\+\d{1,4}-\d{10}$/.test(`${codigoSeleccionado}-${value}`)
                    ? "Número de celular inválido (Ej: +54-1234567890)"
                    : null;
            },
            nombre: (value) => (!value ? "El nombre es obligatorio" : null),
            apellido: (value) => (!value ? "El apellido es obligatorio" : null),
            empresas: () => {
                const empresasValidas = empresasSeleccionadas.length > 0 || (seleccionado?.empresas.length > 0 && empresasSeleccionadas.length > 0);
                if (!empresasValidas) {
                    return "Debe seleccionar al menos una empresa";
                }
                return null;
            },
            urlLINTI: (value) =>
                value && !/^https?:\/\//.test(value)
                    ? "Debe ser una URL válida o dejarlo vacio"
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
                .filter((cuit: null) => cuit !== null);
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
        axiosGet<any[]>('empresas', backendURL)
        .then((data) => setEmpresas(data))
        .catch((error) => {
          throw new Error(`Error al obtener las empresas: ${error}`);
        })
        .finally(() => setLoadingEmpresas(false));
    }, [backendURL]);

    
    useEffect(() => {
        setLoadingLocalidades(true);
        axiosGet<any[]>('ubicaciones/localidades', backendURL)
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
            }
            
            else if (/^\d{12,15}$/.test(seleccionado.numeroCel)) {
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
            // const metodo = seleccionado?.cuil ? "PUT" : "POST";
            // const url = seleccionado?.cuil
            //     ? `${backendURL}/colaboradores/${data.cuil}`
            //     : `${backendURL}/colaboradores`;

            const localidadObjeto = localidades.find((loc) => loc.displayName === localidadSeleccionada);

            const rolObjeto = roles.find((rol) => rol.id === rolSeleccionado?.id);

            const payload: any = {
                cuil: data.cuil,
                numeroCel: `${codigoSeleccionado}-${numeroCel}`.replace(/[^0-9]/g, ''),
                nombre: data.nombre,
                apellido: data.apellido,
                empresas: empresasSeleccionadas,
                urlLINTI: data.urlLINTI,
                idLocalidad: localidadObjeto?.id,
                idRol: rolObjeto?.id,
            };
            
            const apiCall = seleccionado?.cuil
                ? axiosPut(`colaboradores/${data.cuil}`, payload, backendURL)
                : axiosPost('colaboradores', payload, backendURL);

            apiCall
            .then((newData) => {
                if (!seleccionado?.cuil) {
                    setDatos([...datos, newData]);
                    showNotificacion('Colaborador creado exitosamente', 'success');
                } else {
                    setDatos(
                        datos.map((colaborador: { cuil: any }) =>
                            colaborador.cuil === data.cuil ? newData : colaborador
                        )
                    );
                    showNotificacion('Colaborador actualizado exitosamente', 'success');
                }
                handleClose();
            })
            .catch((error: any) => {
              console.error('Error:', error);
              const errorMessage = error?.response?.data?.message || error?.message || 'Error al procesar la solicitud';
              showNotificacion(
                `Error al procesar la solicitud: ${errorMessage}`,
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

    const handleClickDelete = () => setOpenDialogDelete(true);
    const handleCloseDialog = () => setOpenDialogDelete(false);

    return (
        <>
            <Stack spacing={2} sx={{ mt: 3 }}>
                <TextField
                    margin="dense"
                    label="CUIL"
                    name="cuil"
                    variant="outlined"
                    slotProps={{
                        input: {
                            inputComponent: CuilFormat as any,
                        },
                    }}
                    fullWidth
                    value={data.cuil ?? ""}
                    onChange={handleChange("cuil")}
                    error={!!errors.cuil}
                    helperText={errors.cuil}
                    disabled={!!seleccionado?.cuil}
                    sx={azulStyles}
                />
                <Box display="flex" gap={2} width="100%" alignItems="center">
                    <Box minWidth={120} maxWidth={160} flexShrink={0}>
                        <AutocompletarPais
                            setCodigoSeleccionado={setCodigoSeleccionado}
                            error={!!errors.numeroCel}
                            defaultPhone={codigoSeleccionado}
                            fullWidth
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
                        sx={azulStyles}
                    />
                </Box>
                <TextField
                    margin="dense"
                    label="Nombre"
                    variant="outlined"
                    fullWidth
                    value={data.nombre ?? ""}
                    onChange={handleChange("nombre")}
                    error={!!errors.nombre}
                    helperText={errors.nombre}
                    sx={azulStyles}
                />
                <TextField
                    margin="dense"
                    label="Apellido"
                    variant="outlined"
                    fullWidth
                    value={data.apellido ?? ""}
                    onChange={handleChange("apellido")}
                    error={!!errors.apellido}
                    helperText={errors.apellido}
                    sx={azulStyles}
                />
                <Autocomplete
                    multiple
                    limitTags={2}
                    id="empresas-autocomplete"
                    options={(() => {
                        const base = empresas.filter(
                            (empresa) =>
                                empresa.roles &&
                                empresa.roles.some(
                                    (rol: { nombre?: string }) =>
                                        rol.nombre &&
                                        rol.nombre.toLowerCase().replace(/\s+/g, '') === 'empresatransportista'
                                )
                        );
                        return [...base, { cuit: '__add__', nombreFantasia: '', razonSocial: '' }];
                    })()}
                    getOptionLabel={(option) =>
                        option.cuit === '__add__'
                            ? 'Agregar una empresa'
                            : `${option.nombreFantasia} - ${option.cuit}`
                    }
                    value={empresas.filter((empresa) => empresasSeleccionadas.includes(empresa.cuit))}
                    onChange={(_, newValue) => {
                        // Si se selecciona la opción de agregar empresa, abrir el dialog
                        if (newValue && newValue.length > 0 && newValue[newValue.length - 1]?.cuit === '__add__') {
                            setOpenEmpresaDialog(true);
                            // Remover la opción especial del array
                            setEmpresasSeleccionadas(newValue.slice(0, -1).map((empresa) => empresa.cuit));
                        } else {
                            setEmpresasSeleccionadas(newValue.map((empresa) => empresa.cuit));
                        }
                    }}
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
                            sx={azulStyles}
                        />
                    )}
                    renderOption={(props, option) => {
                        // Extraer key del objeto props
                        const { key, ...rest } = props;
                        if (option.cuit === '__add__') {
                            return (
                                <li
                                    key={key}
                                    {...rest}
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        color: theme.colores.azul,
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        padding: '10px 0',
                                        borderTop: '1px solid #eee',
                                        background: props['aria-selected'] ? theme.colores.grisClaro : 'white',
                                        transition: 'background 0.2s',
                                    }}
                                >
                                    + Agregar una empresa
                                </li>
                            );
                        }
                        return (
                            <li key={key} {...rest}>
                                {option.nombreFantasia} - {option.cuit}
                            </li>
                        );
                    }}
                />
                <Dialog open={openEmpresaDialog} onClose={() => setOpenEmpresaDialog(false)} maxWidth="sm" fullWidth>
                    <EmpresaForm
                        seleccionado={{}}
                        datos={empresas}
                        setDatos={(nuevasEmpresas: any[]) => {
                            setEmpresas(nuevasEmpresas);
                            // Selecciona la última empresa agregada automáticamente
                            if (nuevasEmpresas.length > 0) {
                                const nueva = nuevasEmpresas[nuevasEmpresas.length - 1];
                                setEmpresasSeleccionadas((prev: any[]) => [...prev, nueva.cuit]);
                            }
                        }}
                        handleClose={() => setOpenEmpresaDialog(false)}
                    />
                </Dialog>
                <TextField
                    margin="dense"
                    label="URL LINTI"
                    variant="outlined"
                    fullWidth
                    value={data.urlLINTI ?? ""}
                    onChange={handleChange("urlLINTI")}
                    error={!!errors.urlLINTI}
                    helperText={errors.urlLINTI}
                    sx={azulStyles}
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
                            sx={azulStyles}
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
                        <TextField 
                            {...params} 
                            label="Rol" 
                            variant="outlined" 
                            fullWidth 
                            sx={azulStyles}
                            error={!!errors.idRol}
                            helperText={errors.idRol}
                        />
                    )}
                />
            </Stack>

            <Box
                sx={{
                    display: "flex",
                    flexDirection: isMobile ? "column" : "row",
                    gap: 2,
                    justifyContent: "flex-end",
                    alignItems: "center",
                    mt: 4,
                    position: 'relative'
                }}
            >
                <MainButton
                    onClick={handleClose}
                    text="Cancelar"
                    backgroundColor="transparent"
                    textColor={theme.colores.azul}
                    width={isMobile ? '100%' : 'auto'}
                    borderRadius="8px"
                    hoverBackgroundColor="rgba(22, 54, 96, 0.1)"
                    divWidth={isMobile ? '100%' : 'auto'}
                />

                <MainButton
                    onClick={handleSubmit}
                    text="Guardar"
                    backgroundColor={theme.colores.azul}
                    textColor="#fff"
                    width={isMobile ? '100%' : 'auto'}
                    borderRadius="8px"
                    hoverBackgroundColor={theme.colores.azulOscuro}
                    divWidth={isMobile ? '100%' : 'auto'}
                />
                {seleccionado && (
                    <IconButton onClick={handleClickDelete}>
                        <DeleteOutlineIcon sx={{ fontSize: 20, color: "#d68384" }} />
                    </IconButton>
                )}
            </Box>

            <Dialog 
                open={openDialogDelete} 
                onClose={handleCloseDialog} 
                maxWidth="sm" 
                fullWidth
            >
                <DeleteEntidad
                    idEntidad={data.cuil}
                    endpointEntidad="colaboradores"
                    handleCloseDialog={handleCloseDialog}
                    handleClose={handleClose}
                    datos={datos}
                    setDatos={setDatos}
                />
            </Dialog>
        </>
    );
};

export default ChoferForm;
