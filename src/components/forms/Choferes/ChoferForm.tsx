/* eslint-disable @typescript-eslint/no-explicit-any */
import { Autocomplete, Box, Button, CircularProgress, Dialog, IconButton, Stack, TextField } from "@mui/material";
import React, { useContext, useEffect, useState } from "react";
import { ContextoGeneral } from "../../Contexto";
import useValidation from "../../hooks/useValidation";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import DeleteEntidad from "../../dialogs/DeleteEntidad";
import { FormularioProps } from "../../../interfaces/FormularioProps";
import NumeroFormat from "../formatos/NumeroFormat";
import AutocompletarPais from "../../cargas/autocompletar/AutocompletarPais";
import CuilFormat from "../formatos/CuilFormat";
//import CuilFormat from "../forms/formatos/CuilFormat";

const ChoferForm: React.FC<FormularioProps> = ({ 
    seleccionado = {}, 
    datos = [], 
    setDatos, 
    handleClose 
}) => {
    const { backendURL } = useContext(ContextoGeneral);
    const [openDialogDelete, setOpenDialogDelete] = useState(false);
    const [empresas, setEmpresas] = useState<any[]>([]);
    const [empresasSeleccionadas, setEmpresasSeleccionadas] = useState<any[]>([]);  
    const [codigoSeleccionado, setCodigoSeleccionado] = useState<string>("");
    const [numeroCel, setNumeroCel] = useState<string>("");
    const roles = [
      { id: 1, nombre: "Camionero" },
      { id: 2, nombre: "Encargado" },
    ];
    const [rolSeleccionado, setRolSeleccionado] = useState<{ id: number; nombre: string } | null>(
        roles.find((rol) => rol.nombre === seleccionado?.rol) || null
    );

    // Estados para que se carguen las empresas y localidades
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
                const numeroCompleto = `${codigoSeleccionado}-${value}`;
                return !value || !/^\+\d{1,4}-\d{10}$/.test(numeroCompleto)
                    ? "Número de celular inválido (Ej: +54-1234567890)"
                    : null;
            },
            nombre: (value) => (!value ? "El nombre es obligatorio" : null),
            apellido: (value) => (!value ? "El apellido es obligatorio" : null),
            fechaNacimiento: (value) => (!value ? "La fecha de nacimiento es obligatoria" : null),
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
        if (typeof seleccionado?.empresas === "string") {
            const iniciales = seleccionado.empresas.split(",")
                .map((empresa: string) => {
                    const cuit = empresa.split(" - ").pop();
                    return cuit ? Number(cuit) : null;
                })
            setEmpresasSeleccionadas(iniciales);
        }
    }, [seleccionado?.empresas]);

    const [localidades, setLocalidades] = useState<any[]>([]);
    const [localidadSeleccionada, setlocalidadSeleccionada] = useState<string | null>(
        seleccionado?.localidad || null
    );

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
        setLoadingEmpresas(true);
        fetch(`${backendURL}/empresastransportistas`, {
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
            const metodo = seleccionado?.cuil ? "PUT" : "POST";
            const url = seleccionado?.cuil
                ? `${backendURL}/colaboradores/${data.cuil}`
                : `${backendURL}/colaboradores`;

            const numeroCompleto = `${codigoSeleccionado}-${numeroCel}`;
            data.numeroCel = numeroCompleto;

            const localidadObjeto = localidades.find((loc) => loc.displayName === localidadSeleccionada);

            const rolObjeto = roles.find((rol) => rol.nombre === rolSeleccionado?.nombre);

            const payload: any = {
                cuil: data.cuil,
                numeroCel: data.numeroCel,
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
        <>
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
                value={data.cuil}
                onChange={handleChange("cuil")}
                error={!!errors.cuil}
                helperText={errors.cuil}
                disabled={!!seleccionado?.cuil}
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
                isOptionEqualToValue={(option, value) => option.id === value?.id} // Comparación personalizada
                renderInput={(params) => (
                    <TextField {...params} label="Rol" variant="outlined" fullWidth />
                )}
            />

            <Box display="flex" justifyContent="space-between" mt={2}>
                <Button onClick={handleClose} color="primary">
                    Cancelar
                </Button>
                <Button onClick={handleSubmit} color="primary">
                    Guardar
                </Button>
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
