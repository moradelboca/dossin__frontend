/* eslint-disable @typescript-eslint/no-explicit-any */
import {
    Autocomplete,
    Button,
    Dialog,
    IconButton,
    TextField,
} from "@mui/material";
import * as React from "react";
import { ContextoGeneral } from "../../Contexto";
import { useContext, useState } from "react";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import DeleteAcoplados from "./DeleteAcoplados";

interface Acoplados {
    handleClose: any;
    acopladoSeleccionado: any;
    acoplados: any;
    setAcoplados: any;
}

export default function CreadorAcoplados(props: Acoplados) {
    const { backendURL } = useContext(ContextoGeneral);

    const { handleClose, acopladoSeleccionado, acoplados, setAcoplados } = props;
    const [datosNuevoAcoplado, setDatosNuevoAcoplado] = React.useState<any>({
        patente: acopladoSeleccionado?.patente,
        idTipoAcoplado: acopladoSeleccionado?.idTipoAcoplado,
        nombreTipoAcoplado: acopladoSeleccionado?.tipoAcoplado,
        urlRTO:
            acopladoSeleccionado?.urlRTO == "No especificado"
                ? null
                : acopladoSeleccionado?.urlRTO,
        urlPolizaSeguro:
            acopladoSeleccionado?.urlPolizaSeguro == "No especificado"
                ? null
                : acopladoSeleccionado?.urlRTO,
        urlRuta:
            acopladoSeleccionado?.urlRuta == "No especificado"
                ? null
                : acopladoSeleccionado?.urlRTO,
    });
    const [openDialogDelete, setOpenDialogDelete] = useState(false);
    const [tipoSeleccionado, setTipoSeleccionado] = useState<any>(
        datosNuevoAcoplado["nombreTipoAcoplado"] || null
    );
    const setPatente = (e: React.ChangeEvent<HTMLInputElement>) => {
        datosNuevoAcoplado["patente"] = e.target.value;
        setDatosNuevoAcoplado({ ...datosNuevoAcoplado });
    };
    const setTipoAcoplado = (_event: any, seleccionado: any | null) => {
        if (seleccionado) {
            const tiposStrings = tiposAcoplados.map(
                (tiposAcoplados) => tiposAcoplados.nombre
            );
            const index = tiposStrings.indexOf(seleccionado);
            const tiposIds = tiposAcoplados.map(
                (tiposAcoplados) => tiposAcoplados.id
            );
            datosNuevoAcoplado["idTipoAcoplado"] = tiposIds[index];
            setDatosNuevoAcoplado({ ...datosNuevoAcoplado });
            datosNuevoAcoplado["nombreTipoAcoplado"] = seleccionado;
            setTipoSeleccionado(seleccionado);
        }
    };
    const setUrlRTO = (e: React.ChangeEvent<HTMLInputElement>) => {
        datosNuevoAcoplado["urlRTO"] = e.target.value;
        setDatosNuevoAcoplado({ ...datosNuevoAcoplado });
    };
    const urlPoliza = (e: React.ChangeEvent<HTMLInputElement>) => {
        datosNuevoAcoplado["urlPolizaSeguro"] = e.target.value;
        setDatosNuevoAcoplado({ ...datosNuevoAcoplado });
    };
    const urlRuta = (e: React.ChangeEvent<HTMLInputElement>) => {
        datosNuevoAcoplado["urlRuta"] = e.target.value;
        setDatosNuevoAcoplado({ ...datosNuevoAcoplado });
    };
    const [errorPatente, setErrorPatente] = React.useState(false);
    const [errorRto, setErrorRto] = React.useState(false);
    const [errorPoliza, setErrorPoliza] = React.useState(false);
    const [errorRuta, setErrorRuta] = React.useState(false);
    const [errorTipo, setErrorTipo] = React.useState(false);
    const [tiposAcoplados, setTiposAcoplados] = useState<any[]>([]);

    // Expresión regular que valida los formatos de patente "LLLNNN" o "LLNNNLL"
    const regex = /^([A-Za-z]{3}\d{3}|[A-Za-z]{2}\d{3}[A-Za-z]{2})$/;
    const regexUrl =
        /^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)\.[a-z]{2,5}(:[0-9]{1,5})?(\/.)?$/;

    const handleSave = () => {
        if (!datosNuevoAcoplado) return;

        const validPatente = regex.test(datosNuevoAcoplado["patente"]);
        setErrorPatente(!validPatente);

        const validRto =
            !datosNuevoAcoplado["urlRTO"] ||
            regexUrl.test(datosNuevoAcoplado["urlRTO"]);
        setErrorRto(!validRto);

        const validPoliza =
            !datosNuevoAcoplado["urlPolizaSeguro"] ||
            regexUrl.test(datosNuevoAcoplado["urlPolizaSeguro"]);
        setErrorPoliza(!validPoliza);

        const validRuta =
            !datosNuevoAcoplado["urlRuta"] ||
            regexUrl.test(datosNuevoAcoplado["urlRuta"]);
        setErrorRuta(!validRuta);
        const validTipo = !tipoSeleccionado;
        setErrorTipo(validTipo);

        if (!validPatente || !validRto || !validPoliza || !validRuta) return;

        const metodo = acopladoSeleccionado ? "PUT" : "POST";
        const url = acopladoSeleccionado
            ? `${backendURL}/acoplados/${datosNuevoAcoplado["patente"]}`
            : `${backendURL}/acoplados`;

        fetch(url, {
            method: metodo,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(datosNuevoAcoplado),
        })
            .then((response) => {
                if (!response.ok) throw new Error("Error al crear el acoplado");
                return response.json();
            })
            .then((data) => {
                if (metodo === "POST") {
                    setAcoplados((acoplados: any) => [...acoplados, data]);
                } else {
                    const index = acoplados.findIndex(
                        (acoplado: { patente: any }) =>
                            acoplado.patente === datosNuevoAcoplado.patente
                    );
                    if (index !== -1) {
                        acoplados[index] = data;
                        setAcoplados([...acoplados]);
                    }
                }
            })
            .catch(() => {});

        handleClose();
    };
    React.useEffect(() => {
        fetch(`${backendURL}/acoplados/tiposacoplados`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "ngrok-skip-browser-warning": "true",
            },
        })
            .then((response) => response.json())
            .then((data) => setTiposAcoplados(data))
            .catch(() =>
                console.error("Error al obtener las tiposAcoplados disponibles")
            );
    }, []);
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
                value={acopladoSeleccionado && acopladoSeleccionado["patente"]}
                onChange={setPatente}
                error={errorPatente}
                disabled={acopladoSeleccionado !== null}
                defaultValue={acopladoSeleccionado !== null ? "Disabled" : ""}
            />
            <Autocomplete
                disablePortal
                options={tiposAcoplados.map(
                    (tipoAcoplado) => tipoAcoplado.nombre
                )}
                value={tipoSeleccionado}
                defaultValue={tipoSeleccionado}
                onChange={setTipoAcoplado}
                renderInput={(params) => (
                    <TextField
                        {...params}
                        error={errorTipo}
                        label={"Tipo Acoplado"}
                    />
                )}
            />
            <TextField
                margin="dense"
                label="URL RTO"
                type="text"
                fullWidth
                variant="outlined"
                value={
                    acopladoSeleccionado &&
                    acopladoSeleccionado["urlRTO"] &&
                    datosNuevoAcoplado["urlRTO"]
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
                    acopladoSeleccionado &&
                    acopladoSeleccionado["urlPolizaSeguro"] &&
                    datosNuevoAcoplado["urlPolizaSeguro"]
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
                    acopladoSeleccionado &&
                    acopladoSeleccionado["urlRuta"] &&
                    datosNuevoAcoplado["urlRuta"]
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
                <DeleteAcoplados
                    patente={datosNuevoAcoplado["patente"]}
                    handleCloseDialog={handleCloseDialog}
                    handleClose={handleClose}
                    acoplados={acoplados}
                    setAcoplados={setAcoplados}
                />
            </Dialog>
        </>
    );
}
