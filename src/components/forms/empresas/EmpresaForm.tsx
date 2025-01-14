/* eslint-disable @typescript-eslint/no-explicit-any */
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { Autocomplete, Box, Button, CircularProgress, Dialog, IconButton, Stack, TextField } from "@mui/material";
import React, { useContext, useEffect, useState } from "react";
import { FormularioProps } from "../../../interfaces/FormularioProps";
import { ContextoGeneral } from "../../Contexto";
import DeleteEntidad from "../../dialogs/DeleteEntidad";
import useValidation from "../../hooks/useValidation";
//import AutocompletarPais from "../../cargas/autocompletar/AutocompletarPais";
import AutocompletarPais from "../../cargas/autocompletar/AutocompletarPais";
import CuilFormat from "../formatos/CuilFormat";
import NumeroFormat from "../formatos/NumeroFormat";

const EmpresaForm: React.FC<FormularioProps> = ({
    seleccionado = {},
    datos,
    setDatos,
    handleClose,
}) => {
    const { backendURL } = useContext(ContextoGeneral);
    const [openDialogDelete, setOpenDialogDelete] = useState(false);

    const [localidades, setLocalidades] = useState<any[]>([]);
    const [localidadSeleccionada, setlocalidadSeleccionada] = useState<string | null>(seleccionado?.localidad || null);

    const [codigoSeleccionado, setCodigoSeleccionado] = useState<string>("");
    const [numeroCel, setNumeroCel] = useState<string>("");

    const [roles, setRoles] = useState<any[]>([]);
    const [rolesSeleccionados, setRolesSeleccionados] = useState<any[]>([]);  

    // Estados para que se carguen las localidades'
    const [loadingLocalidades, setLoadingLocalidades] = useState(false);
        const [loadingRoles, setLoadingRoles] = useState(false);

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

    useEffect(() => {
            if (typeof seleccionado?.roles === "string") {
                const rolesIniciales = seleccionado.roles.split(",")
                setRolesSeleccionados(rolesIniciales);
            }
        }, [seleccionado?.roles]);

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
        setLoadingRoles(true);
        fetch(`${backendURL}/empresas/roles`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "ngrok-skip-browser-warning": "true",
            },
        })
            .then((response) => response.json())
            .then((data) => setRoles(data))
            .catch(() => console.error("Error al obtener las empresas"))
            .finally(() => setLoadingRoles(false));
    }, [backendURL]);
    
    
    useEffect(() => {
        if (seleccionado?.localidad && localidades.length > 0) {
            const localidad = localidades.find(
                (loc) => loc.displayName === seleccionado.localidad
            );
            if (localidad) {
                setlocalidadSeleccionada(localidad.id);
            }
        }
    }, [seleccionado?.localidad]);

    useEffect(() => {
            if (seleccionado?.numeroCel) {
                const [codigo, numero] = seleccionado.numeroCel.split("-");
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
    
            if (isNaN(data.cuit)) {
                const cuitLimpio = data.cuit.replace(/[^0-9]/g, '');
                data.cuit = Number(cuitLimpio);
            }
            
            const numeroCompleto = `${codigoSeleccionado}-${numeroCel}`.replace(/[^0-9]/g, '');
            data.numeroCel = numeroCompleto;

            const localidadObjeto = localidades.find((loc) => loc.displayName === localidadSeleccionada);

            // Paso 1: Obtener los id de los roles seleccionados
            const rolesLista = rolesSeleccionados.map((rolNombre) => {
                const rol = roles.find((r) => r.nombre === rolNombre);
                return rol ? rol.id : null;
            }).filter((id) => id !== null);

            const payload = {
                cuit: data.cuit,
                razonSocial: data.razonSocial,
                nombreFantasia: data.nombreFantasia,
                idLocalidad: localidadObjeto?.id,
                numeroCel: data.numeroCel,
                idsRoles: rolesLista,
                urlConstanciaAfip: data.urlConstanciaAfip,
                urlConstanciaCBU: data.urlConstanciaCBU,
                email: data.email,
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
                            datos.map((empresa: { cuit: any; }) =>
                                empresa.cuit === data.cuit ? newData : empresa
                            )
                        );
                    }
                    handleClose();
                })
                .catch((error) => console.error(`Error: ${error.message}`));
        }
    };
    
    const handleClickDeleteCarga = () => setOpenDialogDelete(true);
    const handleCloseDialog = () => setOpenDialogDelete(false);

    return (
        <>
            <TextField
                margin="dense"
                label="CUIT"
                name="cuit"
                variant="outlined"
                slotProps={{
                    input: {
                        inputComponent: CuilFormat as any,
                    },
                }}
                fullWidth
                value={data.cuit}
                onChange={handleChange("cuit")}
                error={!!errors.cuit}
                helperText={errors.cuit}
                disabled={!!seleccionado?.cuit}
            />
            <TextField
                margin="dense"
                label="Razón Social"
                name="razonSocial"
                variant="outlined"
                fullWidth
                value={data.razonSocial}
                onChange={handleChange("razonSocial")}
                error={!!errors.razonSocial}
                helperText={errors.razonSocial}
            />
            <TextField
                margin="dense"
                label="Nombre Fantasía"
                name="nombreFantasia"
                variant="outlined"
                fullWidth
                value={data.nombreFantasia}
                onChange={handleChange("nombreFantasia")}
                error={!!errors.nombreFantasia}
                helperText={errors.nombreFantasia}
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
            <Box
                display="flex"
                flexDirection="row"
                gap={2}
                alignContent={"center"}
                alignItems={"center"}
                marginTop={2}
                marginBottom={1}
            >
                {/**/}
                <Box width={"100px"}>
                    <AutocompletarPais
                        setCodigoSeleccionado={setCodigoSeleccionado}
                        error={!!errors.numeroCel}
                        defaultPhone={codigoSeleccionado}
                    />
                </Box>
                <>-</>
                <Stack width="400px" direction="row" spacing={2}>
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
                    />
                </Stack>
            </Box>

            <Autocomplete
                multiple
                limitTags={2}
                id="roles-autocomplete"
                options={roles}
                getOptionLabel={(option) => option.nombre}
                value={roles.filter((roles) => rolesSeleccionados.includes(roles.nombre))}
                onChange={(_, newValue) => setRolesSeleccionados(newValue.map((rol) => rol.nombre))}
                loading={loadingRoles}
                renderInput={(params) => (
                    <TextField
                        {...params}
                        label="Roles"
                        placeholder="Selecciona roles"
                        error={!!errors.roles}
                        helperText={errors.roles}
                        InputProps={{
                            ...params.InputProps,
                            endAdornment: (
                                <>
                                    {loadingRoles ? <CircularProgress size={20} /> : null}
                                    {params.InputProps.endAdornment}
                                </>
                            ),
                        }}
                    />
                )}
            />

            <TextField
                margin="dense"
                label="URL Constancia Afip"
                variant="outlined"
                fullWidth
                value={data.urlConstanciaAfip}
                onChange={handleChange("urlConstanciaAfip")}
                error={!!errors.urlConstanciaAfip}
                helperText={errors.urlConstanciaAfip}
            />
            
            <TextField
                margin="dense"
                label="URL Constancia CBU"
                variant="outlined"
                fullWidth
                value={data.urlConstanciaCBU}
                onChange={handleChange("urlConstanciaCBU")}
                error={!!errors.urlConstanciaCBU}
                helperText={errors.urlConstanciaCBU}
            />
                        
            <TextField
                margin="dense"
                label="Email"
                name="email"
                variant="outlined"
                fullWidth
                value={data.email}
                onChange={handleChange("email")}
                error={!!errors.email}
                helperText={errors.email}
            />
            <Button onClick={handleClose} color="primary">
                Cancelar
            </Button>
            <Button onClick={handleSubmit} color="primary">
                Guardar
            </Button>
            <IconButton onClick={handleClickDeleteCarga}>
                <DeleteOutlineIcon sx={{ fontSize: 20, color: "#d68384" }} />
            </IconButton>
            <Dialog open={openDialogDelete} onClose={handleCloseDialog}>
                <DeleteEntidad
                    idEntidad={data.cuit}
                    endpointEntidad="empresastransportistas"
                    handleCloseDialog={handleCloseDialog}
                    handleClose={handleClose}
                    datos={datos}
                    setDatos={setDatos}
                />
            </Dialog>
        </>
    );
};

export default EmpresaForm;
