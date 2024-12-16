/* eslint-disable @typescript-eslint/no-explicit-any */
/*
import { Button, Dialog, IconButton, TextField } from "@mui/material";
import * as React from "react";
import { ContextoGeneral } from "../../Contexto";
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
    const { handleClose, camionSeleccionado, camiones, setCamiones } = props;
    const [datosNuevoCamion, setDatosNuevoCamion] = React.useState<any>({
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
    const [errorPatente, setErrorPatente] = React.useState(false);
    const [errorRto, setErrorRto] = React.useState(false);
    const [errorPoliza, setErrorPoliza] = React.useState(false);
    const [errorRuta, setErrorRuta] = React.useState(false);

    // Expresión regular que valida los formatos de patente "LLLNNN" o "LLNNNLL"
    const regex = /^([A-Za-z]{3}\d{3}|[A-Za-z]{2}\d{3}[A-Za-z]{2})$/;
    const regexUrl =
        /^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)\.[a-z]{2,5}(:[0-9]{1,5})?(\/.)?$/;

    const handleSave = () => {
        if (!datosNuevoCamion) return;

        const validPatente = regex.test(datosNuevoCamion["patente"]);
        setErrorPatente(!validPatente);

        const validRto =
            !datosNuevoCamion["urlRTO"] ||
            regexUrl.test(datosNuevoCamion["urlRTO"]);
        setErrorRto(!validRto);

        const validPoliza =
            !datosNuevoCamion["urlPolizaSeguro"] ||
            regexUrl.test(datosNuevoCamion["urlPolizaSeguro"]);
        setErrorPoliza(!validPoliza);

        const validRuta =
            !datosNuevoCamion["urlRuta"] ||
            regexUrl.test(datosNuevoCamion["urlRuta"]);
        setErrorRuta(!validRuta);

        if (!validPatente || !validRto || !validPoliza || !validRuta) return;

        const metodo = camionSeleccionado ? "PUT" : "POST";
        const url = camionSeleccionado
            ? `${backendURL}/camiones/${datosNuevoCamion["patente"]}`
            : `${backendURL}/camiones`;

        fetch(url, {
            method: metodo,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(datosNuevoCamion),
        })
            .then((response) => {
                if (!response.ok) throw new Error("Error al crear la turno");
                return response.json();
            })
            .then((data) => {
                if (metodo === "POST") {
                    setCamiones((camiones: any) => [...camiones, data]);
                } else {
                    const index = camiones.findIndex(
                        (camion: { patente: any }) =>
                            camion.patente === datosNuevoCamion.patente
                    );
                    if (index !== -1) {
                        camiones[index] = data;
                        setCamiones([...camiones]);
                    }
                }
            })
            .catch(() => {});

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
            <TextField
                margin="dense"
                label="Patente"
                name="patente"
                fullWidth
                variant="outlined"
                value={camionSeleccionado && camionSeleccionado["patente"]}
                onChange={setPatente}
                error={errorPatente}
                disabled={camionSeleccionado !== null}
                defaultValue={camionSeleccionado !== null ? "Disabled" : ""}
            />
            <TextField
                margin="dense"
                label="URL RTO"
                type="text"
                fullWidth
                variant="outlined"
                value={
                    camionSeleccionado &&
                    camionSeleccionado["urlRTO"] &&
                    datosNuevoCamion["urlRTO"]
                }
                onChange={setUrlRTO}
                error={errorRto}
            />
            <TextField
                margin="dense"
                label="URL Póliza de Seguro"
                type="text"
                fullWidth
                variant="outlined"
                value={
                    camionSeleccionado &&
                    camionSeleccionado["urlPolizaSeguro"] &&
                    datosNuevoCamion["urlPolizaSeguro"]
                }
                onChange={urlPoliza}
                error={errorPoliza}
            />
            <TextField
                margin="dense"
                label="URL Ruta"
                type="text"
                fullWidth
                variant="outlined"
                value={
                    camionSeleccionado &&
                    camionSeleccionado["urlRuta"] &&
                    datosNuevoCamion["urlRuta"]
                }
                onChange={urlRuta}
                error={errorRuta}
            />

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

*/

//import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent } from '@mui/material';
import CamionForm from '../../forms/camiones/CamionForm';

const CreadorCamiones = ({ seleccionado, handleClose, datos, setDatos }) => {

  return (
    <Dialog open onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>{seleccionado ? 'Editar Camión' : 'Crear Camión'}</DialogTitle>
      <DialogContent>
        <CamionForm
          seleccionado={seleccionado}
          datos={datos}
          setDatos={setDatos}
          handleClose={handleClose}
        />
      </DialogContent>
    </Dialog>
  );
};

export default CreadorCamiones;