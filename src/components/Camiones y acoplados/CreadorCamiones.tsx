import {
    Button,
    Dialog,
    IconButton,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import * as React from "react";
import { ContextoGeneral } from "../Contexto";
import { useContext, useState } from "react";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import DeleteCamion from "./DeleteCamion";

interface Camiones {
    handleClose: any;
    camionSeleccionado: any;
    camiones: any;
    setCamiones: any;
}

export default function CreadorCamiones(props: Camiones) {
    const { backendURL } = useContext(ContextoGeneral);
    let { handleClose, camionSeleccionado, camiones, setCamiones } = props;
    let [datosNuevoCamion, setDatosNuevoCamion] = React.useState<any>({
        patente: camionSeleccionado?.patente,
        urlRTO:
            camionSeleccionado?.urlRTO == "No especificado"
                ? null
                : camionSeleccionado?.urlRTO,
        urlPolizaSeguro:
            camionSeleccionado?.urlPolizaSeguro == "No especificado"
                ? null
                : camionSeleccionado?.urlRTO,
        urlRuta:
            camionSeleccionado?.urlRuta == "No especificado"
                ? null
                : camionSeleccionado?.urlRTO,
    });
    const [openDialogDelete, setOpenDialogDelete] = useState(false);

    const setPatente = (e: React.ChangeEvent<HTMLInputElement>) => {
        datosNuevoCamion["patente"] = e.target.value;
        setDatosNuevoCamion({ ...datosNuevoCamion });
    };
    const setUrlRTO = (e: React.ChangeEvent<HTMLInputElement>) => {
        datosNuevoCamion["urlRTO"] = e.target.value;
        setDatosNuevoCamion({ ...datosNuevoCamion });
    };
    const urlPoliza = (e: React.ChangeEvent<HTMLInputElement>) => {
        datosNuevoCamion["urlPolizaSeguro"] = e.target.value;
        setDatosNuevoCamion({ ...datosNuevoCamion });
    };
    const urlRuta = (e: React.ChangeEvent<HTMLInputElement>) => {
        datosNuevoCamion["urlRuta"] = e.target.value;
        setDatosNuevoCamion({ ...datosNuevoCamion });
    };
    const [errorMessage, setErrorMessage] = React.useState("");

    // Expresión regular que valida los formatos de patente "LLLNNN" o "LLNNNLL"
    const regex = /^([A-Za-z]{3}\d{3}|[A-Za-z]{2}\d{3}[A-Za-z]{2})$/;

    const handleSave = () => {
        if (datosNuevoCamion) {
            if (!regex.test(datosNuevoCamion["patente"])) {
                setErrorMessage("Ingresaste mal la patente!");
                return;
            }
            const metodo = !camionSeleccionado ? "POST" : "PUT";
            const url = !camionSeleccionado
                ? `${backendURL}/camiones`
                : `${backendURL}/camiones/${datosNuevoCamion["patente"]}`;
            fetch(url, {
                method: metodo,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(datosNuevoCamion),
            })
                .then((response) => {
                    if (!response.ok) {
                        throw new Error("Error al crear la turno");
                    }
                    if (metodo == "POST") {
                        response.json().then((data) => {
                            setCamiones((camiones: any) => [...camiones, data]);
                        });
                    }
                    if (metodo == "PUT") {
                        response.json().then((data) => {
                            const index = camiones.findIndex(
                                (camion: { patente: any }) =>
                                    camion.patente === datosNuevoCamion.patente
                            );
                            if (index !== -1) {
                                camiones[index] = data;
                                setCamiones([...camiones]);
                            }
                        });
                    }
                })
                .catch(() => {});
        }
        handleClose();
    };

    const handleClickDeleteCarga = () => {
        setOpenDialogDelete(true);
    };
    const handleCloseDialog = () => {
        setOpenDialogDelete(false);
    };

    return (
        <>
            <Stack direction="row" spacing={2}>
                <TextField
                    margin="dense"
                    label="Patente"
                    name="patente"
                    fullWidth
                    variant="outlined"
                    value={datosNuevoCamion["patente"]}
                    onChange={setPatente}
                />
            </Stack>
            <TextField
                margin="dense"
                label="URL RTO"
                type="text"
                fullWidth
                variant="outlined"
                value={datosNuevoCamion["urlRTO"]}
                onChange={setUrlRTO}
            />
            <TextField
                margin="dense"
                label="URL Póliza de Seguro"
                type="text"
                fullWidth
                variant="outlined"
                value={datosNuevoCamion?.urlPolizaSeguro}
                onChange={urlPoliza}
            />
            <TextField
                margin="dense"
                label="URL Ruta"
                type="text"
                fullWidth
                variant="outlined"
                value={urlRuta}
            />
            {errorMessage && ( // Mostrar mensaje de error si existe
                <Typography color="#ff3333">{errorMessage}</Typography>
            )}
            <Button onClick={handleClose} color="primary">
                Cancelar
            </Button>
            <Button onClick={handleSave} color="primary">
                Guardar
            </Button>
            <IconButton onClick={() => handleClickDeleteCarga()}>
                <DeleteOutlineIcon sx={{ fontSize: 20, color: "#d68384" }} />
            </IconButton>
            <Dialog
                open={openDialogDelete}
                onClose={handleCloseDialog}
                maxWidth="sm"
                fullWidth
            >
                <DeleteCamion
                    patente={datosNuevoCamion["patente"]}
                    handleCloseDialog={handleCloseDialog}
                    handleClose={handleClose}
                    camiones={camiones}
                    setCamiones={setCamiones}
                />
            </Dialog>
        </>
    );
}
