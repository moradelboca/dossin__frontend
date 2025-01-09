/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useContext, useEffect, useState } from "react";
import { Button, Dialog, IconButton, TextField, Autocomplete, Box } from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import DeleteEntidad from "../../dialogs/DeleteEntidad";
import useValidation from "../../hooks/useValidation";
import { ContextoGeneral } from "../../Contexto";
import { FormularioProps } from "../../../interfaces/FormularioProps";
import AutocompletarPais from "../../cargas/autocompletar/AutocompletarPais";
import NumeroFormat from "../formatos/NumeroFormat";
import CuilFormat from "../formatos/CuilFormat";

const EmpresaForm: React.FC<FormularioProps> = ({
    seleccionado = {},
    datos,
    setDatos,
    handleClose,
}) => {
    const { backendURL } = useContext(ContextoGeneral);
    const [openDialogDelete, setOpenDialogDelete] = useState(false);

    const [localidades, setLocalidades] = useState<any[]>([]);
    const [localidadSeleccionada, setlocalidadSeleccionada] = useState<string | null>(seleccionado?.idLocalidad || null);

    const { data, errors, handleChange, validateAll } = useValidation(
        {
            cuit: "",
            razonSocial: "",
            nombreFantasia: "",
            idLocalidad: "",
            numeroCel: "",
            urlConstanciaAfip: "",
            urlConstanciaCBU: "",
            email: "",
            ...seleccionado,
        },
        {
            cuit: (value) => (!value ? "El CUIT es obligatorio" : null),
            razonSocial: (value) => (!value ? "La razón social es obligatoria" : null),
            nombreFantasia: (value) => (!value ? "El nombre de fantasía es obligatorio" : null),
            numeroCel: (value) =>
                value && !/^\+?[0-9]{7,15}$/.test(value)
                    ? "El número de celular debe ser válido"
                    : null,
            idLocalidad: () => (!localidadSeleccionada ? "Debe seleccionar una localidad" : null),
            urlConstanciaAfip: (value) =>
                value && !/^https?:\/\//.test(value)
                    ? "Debe ser una URL válida"
                    : null,
            urlConstanciaCBU: (value) =>
                value && !/^https?:\/\//.test(value)
                    ? "Debe ser una URL válida"
                    : null,
            email: (value) =>
                value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
                    ? "Debe ser un correo válido"
                    : null,
        }
    );

    useEffect(() => {
        fetch(`${backendURL}/ubicaciones/localidades`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
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
            .catch(() => console.error("Error al obtener localidades"));
    }, [backendURL]);
    

    const handleSubmit = () => {
        if (validateAll()) {
            const metodo = seleccionado?.cuit ? "PUT" : "POST";
            const url = seleccionado?.cuit
                ? `${backendURL}/empresastransportistas/${data.cuit}`
                : `${backendURL}/empresastransportistas`;
    
            const localidadObjeto = localidades.find((loc) => loc.id === localidadSeleccionada);
            
            console.log("localidades")
            console.log(localidadSeleccionada);
            console.log(localidadObjeto);
            console.log("xddd")
            const payload = {
                cuit: data.cuit,
                razonSocial: data.razonSocial,
                nombreFantasia: data.nombreFantasia,
                idLocalidad: localidadObjeto?.id,
                numeroCel: data.numeroCel,
                urlConstanciaAfip: data.urlConstanciaAfip,
                urlConstanciaCBU: data.urlConstanciaCBU,
                email: data.email,
            };
            console.log("Localidades: \n",localidades)
            console.log("Objeto para enviar:", JSON.stringify(payload, null, 2));

            fetch(url, {
                method: metodo,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            })
                .then(async (response) => {
                    if (!response.ok) {
                        const errorMessage = await response.text();
                        console.log(response);
                        throw new Error(`Error del servidor: ${errorMessage}`);
                    }
                    console.log(response);
                    return response.json();
                })
                .then((newData) => {
                    console.log("Objeto que se va a guardar:");
                    console.log(newData);
                    if (metodo === "POST") {
                        console.log("Metodo POST:");
                        console.log(newData);
                        setDatos([...datos, newData]);
                    } else {
                        console.log("Metodo PUT:");
                        console.log(newData);
                        setDatos(
                            datos.map((empresa) =>
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
                value={localidades.find((loc) => loc.id === localidadSeleccionada) || null}
                onChange={(_, newValue) => setlocalidadSeleccionada(newValue ? newValue.id : null)}
                renderInput={(params) => (
                    <TextField
                        {...params}
                        label="Localidad"
                        variant="outlined"
                        error={!!errors.idLocalidad}
                        helperText={errors.idLocalidad}
                    />
                )}
            />
            <TextField
                margin="dense"
                label="Número de Celular"
                name="numeroCel"
                variant="outlined"
                slotProps={{
                    input: {
                        inputComponent: NumeroFormat as any,
                    },
                }}
                fullWidth
                value={data.numeroCel}
                onChange={handleChange("numeroCel")}
                error={!!errors.numeroCel}
                helperText={errors.numeroCel}
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
