/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useContext, useEffect, useState } from "react";
import { Button, Dialog, IconButton, TextField, Box, Autocomplete } from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import DeleteEntidad from "../../dialogs/DeleteEntidad";
import useValidation from "../../hooks/useValidation";
import { ContextoGeneral } from "../../Contexto";
import { FormularioProps } from "../../../interfaces/FormularioProps";

const AcopladoForm: React.FC<FormularioProps> = ({
    seleccionado = {},
    datos,
    setDatos,
    handleClose,
}) => {
    const { backendURL } = useContext(ContextoGeneral);
    const [openDialogDelete, setOpenDialogDelete] = useState(false);

    const [tiposAcoplados, setTiposAcoplados] = useState<any[]>([]);
    const [tipoSeleccionado, setTipoSeleccionado] = useState<string | null>(seleccionado?.tipoAcoplado  || null);
    
    const { data, errors, handleChange, validateAll } = useValidation(
        {
            patente: "",
            tipoAcoplado: "",
            urlRTO: "",
            urlPolizaSeguro: "",
            urlRuta: "",
            ...seleccionado,
        },
        {
            patente: (value) =>
                !/^([A-Za-z]{3}\d{3}|[A-Za-z]{2}\d{3}[A-Za-z]{2})$/.test(value)
                    ? "La patente debe ser válida (LLLNNN o LLNNNLL)"
                    : null,
            tipoAcoplado: () => (!tipoSeleccionado ? "Debe seleccionar un tipo de acoplado" : null),
            urlRTO: (value) =>
                value && !/^https?:\/\//.test(value)
                    ? "Debe ser una URL válida"
                    : null,
            urlPolizaSeguro: (value) =>
                value && !/^https?:\/\//.test(value)
                    ? "Debe ser una URL válida"
                    : null,
            urlRuta: (value) =>
                value && !/^https?:\/\//.test(value)
                    ? "Debe ser una URL válida"
                    : null,
        }
    );

    useEffect(() => {
        fetch(`${backendURL}/acoplados/tiposacoplados`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "ngrok-skip-browser-warning": "true",
            },
        })
            .then((response) => response.json())
            .then((data) => setTiposAcoplados(data))
            .catch(() => console.error("Error al obtener los tipos de acoplados disponibles"));
    }, [backendURL]);


    const handleSubmit = () => {
        if (validateAll()) {
            const metodo = seleccionado?.patente ? "PUT" : "POST";
            const url = seleccionado?.patente
                ? `${backendURL}/acoplados/${data.patente}`
                : `${backendURL}/acoplados`;
    
            const idTipoAcoplado = tiposAcoplados.find(
                (tipo) => tipo.nombre === tipoSeleccionado
            )?.id;
            
            const payload = {
                patente: data.patente,
                urlRTO: data.urlRTO,
                urlPolizaSeguro: data.urlPolizaSeguro,
                urlRuta: data.urlRuta,
                idTipoAcoplado,
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
                            datos.map((acoplado: { patente: any; }) =>
                                acoplado.patente === data.patente ? newData : acoplado
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
                label="Patente"
                name="patente"
                variant="outlined"
                fullWidth
                value={data.patente}
                onChange={handleChange("patente")}
                error={!!errors.patente}
                helperText={errors.patente}
                disabled={!!seleccionado?.patente}
            />

        <Autocomplete
                disablePortal
                options={tiposAcoplados.map((tipo) => tipo.nombre)}
                value={tipoSeleccionado}
                onChange={(_, newValue) => setTipoSeleccionado(newValue)}
                renderInput={(params) => (
                    <TextField
                        {...params}
                        label="Tipo de Acoplado"
                        variant="outlined"
                        error={!!errors.tipoAcoplado}
                        helperText={!tipoSeleccionado ? "Seleccione un tipo de acoplado" : ""}
                    />
                )}
            />

            <TextField
                margin="dense"
                label="URL RTO"
                variant="outlined"
                fullWidth
                value={data.urlRTO}
                onChange={handleChange("urlRTO")}
                error={!!errors.urlRTO}
                helperText={errors.urlRTO}
            />

            <TextField
                label="URL Póliza de Seguro"
                variant="outlined"
                fullWidth
                value={data.urlPolizaSeguro}
                onChange={handleChange("urlPolizaSeguro")}
                error={!!errors.urlPolizaSeguro}
                helperText={errors.urlPolizaSeguro}
            />

            <TextField
                label="URL Ruta"
                variant="outlined"
                fullWidth
                value={data.urlRuta}
                onChange={handleChange("urlRuta")}
                error={!!errors.urlRuta}
                helperText={errors.urlRuta}
            />

            <Box display="flex" justifyContent="space-between">
                <Button onClick={handleClose} color="primary">
                    Cancelar
                </Button>
                <Button onClick={handleSubmit} color="primary">
                    Guardar
                </Button>
                {seleccionado && (
                    <IconButton onClick={handleClickDeleteCarga}>
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
                    idEntidad={data.patente}
                    endpointEntidad="acoplados"
                    handleCloseDialog={handleCloseDialog}
                    handleClose={handleClose}
                    datos={datos}
                    setDatos={setDatos}
                />
            </Dialog>
        </>
    );
};

export default AcopladoForm;
