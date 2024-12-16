/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useContext, useState } from "react";
import { Button, Dialog, IconButton, TextField, Box } from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import DeleteCamion from "../../Camiones y acoplados/camiones/DeleteCamion";
import useValidation from "../../hooks/useValidation";
import { ContextoGeneral } from "../../Contexto";

interface CamionFormProps {
    seleccionado?: any;
    datos: any;
    setDatos: any;
    handleClose: () => void;
}

const CamionForm: React.FC<CamionFormProps> = ({
    seleccionado = {},
    datos, 
    setDatos,
    handleClose,
}) => {
    const { backendURL } = useContext(ContextoGeneral);
    const [openDialogDelete, setOpenDialogDelete] = useState(false);

    // Validaciones y datos iniciales
    const { data, errors, handleChange, validateAll } = useValidation(
        {
            patente: "",
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

    const handleSubmit = () => {
        if (validateAll()) {
            const metodo = seleccionado?.patente ? "PUT" : "POST";
            const url = seleccionado?.patente
                ? `${backendURL}/camiones/${data.patente}`
                : `${backendURL}/camiones`;

            fetch(url, {
                method: metodo,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            })
                .then((response) => {
                    if (!response.ok) {
                        return response.text().then((text) => {
                            throw new Error(`Error ${response.status}: ${text}`);
                        });
                    }
                    return response.json();
                })
                .then((newData) => {
                    if (metodo === "POST") {
                        setDatos([...datos, newData]);
                    } else {
                        const datosActualizados = datos.map((camion: { patente: string }) =>
                            camion.patente === data.patente ? newData : camion
                        );
                        setDatos(datosActualizados);
                    }
                })
                .catch((error) => console.error(`Error al guardar el camión: ${error.message}`));
            handleClose();
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
                <DeleteCamion
                    patente={data.patente}
                    handleCloseDialog={handleCloseDialog}
                    handleClose={handleClose}
                    camiones={datos}
                    setCamiones={setDatos}
                />
            </Dialog>
        </>
    );
};

export default CamionForm;
