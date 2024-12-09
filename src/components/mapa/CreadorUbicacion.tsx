import {
    Autocomplete,
    Box,
    Button,
    Dialog,
    IconButton,
    TextField,
} from "@mui/material";
import { useContext, useEffect, useState } from "react";
import AutocompletarUbicacionLocalidad from "./AutocompletarUbicacionLocalidad";
import { ContextoGeneral } from "../Contexto";
import React from "react";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import DeleteUbicacion from "./DeleteUbicaciones";

interface Ubicacion {
    handleClose: any;
    ubicacionSeleccionada: any;
    ubicaciones: any[];
    setUbicaciones: any;
    refreshUbicaciones: any;
}

export function CreadorUbicacion(props: Ubicacion) {
    const { backendURL } = useContext(ContextoGeneral);
    // const [ubicaciones, setUbicaciones] = useState<Ubicacion[]>([]);
    let {
        handleClose,
        ubicacionSeleccionada,
        ubicaciones,
        setUbicaciones,
        refreshUbicaciones,
    } = props;
    const [tipoUbicacion, setTipoUbicacion] = useState<any[]>([]);
    const [openDialogDelete, setOpenDialogDelete] = useState(false);
    const [estadoCarga, setEstadoCarga] = useState(true);
    const [localidades, setLocalidades] = useState<any[]>([]);

    useEffect(() => {
        fetch(`${backendURL}/ubicaciones`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "ngrok-skip-browser-warning": "true",
            },
        })
            .then((response) => response.json())
            .then((ubicaciones) => {
                setUbicaciones(ubicaciones);
                setEstadoCarga(false);
            })
            .catch(() =>
                console.error("Error al obtener las ubicaciones disponibles")
            );
    }, []);
    useEffect(() => {
        fetch(`${backendURL}/ubicaciones/tiposUbicaciones`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "ngrok-skip-browser-warning": "true",
            },
        })
            .then((response) => response.json())
            .then((tipoUbicacion) => {
                setTipoUbicacion(tipoUbicacion);
                setEstadoCarga(false);
            })
            .catch(() =>
                console.error("Error al obtener las ubicaciones disponibles")
            );
    }, []);
    useEffect(() => {
        fetch(`${backendURL}/ubicaciones/localidades`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "ngrok-skip-browser-warning": "true",
            },
        })
            .then((response) => response.json())
            .then((localidades) => {
                setLocalidades(localidades);
                setEstadoCarga(false);
            })
            .catch(() =>
                console.error("Error al obtener las ubicaciones disponibles")
            );
    }, []);

    let [datosNuevaUbicacion, setDatosNuevaUbicacion] = React.useState<any>({
        urlMaps: ubicacionSeleccionada?.urlMaps,
        nombre: ubicacionSeleccionada?.nombre,
        nombreLocalidad: ubicacionSeleccionada?.localidad.nombre,
        idLocalidad: ubicacionSeleccionada?.localidad.id,
        idTipoUbicacion: ubicacionSeleccionada?.tipoUbicacion.id,
        nombreTipoUbicacion: ubicacionSeleccionada?.tipoUbicacion.nombre,
        id: ubicacionSeleccionada?.id,
    });
    const seleccionarURLMaps = (e: any) => {
        datosNuevaUbicacion["urlMaps"] = e.target.value;
        setDatosNuevaUbicacion({ ...datosNuevaUbicacion });
    };
    const setNombre = (e: React.ChangeEvent<HTMLInputElement>) => {
        datosNuevaUbicacion["nombre"] = e.target.value;
        setDatosNuevaUbicacion({ ...datosNuevaUbicacion });
    };
    const seleccionarTipo = (_event: any, seleccionado: any | null) => {
        if (seleccionado) {
            const tiposStrings = tipoUbicacion.map((tipo) => tipo.nombre);
            const index = tiposStrings.indexOf(seleccionado);
            const tiposIds = tipoUbicacion.map((tipo) => tipo.id);
            datosNuevaUbicacion["idTipoUbicacion"] = tiposIds[index];
            datosNuevaUbicacion["nombreTipoUbicacion"] = seleccionado;
        }
    };
    const [errorUrl, setErrorUrl] = React.useState(false);
    const [errorTipo, setErrorTipo] = React.useState(false);
    const [erroLocalidad, setErrorLocalidad] = React.useState(false);

    const regexUrl =
        /^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)\.[a-z]{2,5}(:[0-9]{1,5})?(\/.)?$/;
    const handleSave = () => {
        if (!datosNuevaUbicacion) return;

        const validUrl = regexUrl.test(datosNuevaUbicacion["urlMaps"]);
        setErrorUrl(!validUrl);

        const validTipo = !datosNuevaUbicacion["tipo"];
        setErrorTipo(!validTipo);

        const validLocalidad = !datosNuevaUbicacion["localidad"];
        setErrorLocalidad(!validLocalidad);

        const metodo = ubicacionSeleccionada ? "PUT" : "POST";
        const url = ubicacionSeleccionada
            ? `${backendURL}/ubicaciones/${datosNuevaUbicacion["id"]}`
            : `${backendURL}/ubicaciones`;

        fetch(url, {
            method: metodo,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(datosNuevaUbicacion),
        })
            .then((response) => {
                if (!response.ok) {
                    return response.text().then((text) => {
                        throw new Error(text);
                    });
                }
                return response.json();
            })
            .then((data) => {
                if (metodo === "POST") {
                    setUbicaciones((ubicaciones: any) => [
                        ...ubicaciones,
                        data,
                    ]);
                } else {
                    const index = ubicaciones.findIndex(
                        (ubicacion: { id: any }) =>
                            ubicacion.id === datosNuevaUbicacion.id
                    );
                    if (index !== -1) {
                        ubicaciones[index] = data;
                        setUbicaciones([...ubicaciones]);
                    }
                }
            })
            .catch((e) => console.error(e));

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
            <Box
                display="flex"
                flexDirection="column"
                gap={2}
                alignContent={"center"}
                alignItems={"center"}
                marginTop={2}
                marginBottom={1}
                margin={3}
            >
                <TextField
                    id="outlined-basic"
                    label="URL Google Maps"
                    variant="outlined"
                    onChange={seleccionarURLMaps}
                    error={errorUrl}
                    value={datosNuevaUbicacion["urlMaps"]}
                    slotProps={{
                        htmlInput: {
                            maxLength: 200,
                        },
                    }}
                    sx={{ width: 350 }}
                />
                <TextField
                    id="outlined-basic"
                    label="Nombre"
                    variant="outlined"
                    onChange={setNombre}
                    value={datosNuevaUbicacion["nombre"]}
                    slotProps={{
                        htmlInput: {
                            maxLength: 50,
                        },
                    }}
                    sx={{ width: 350 }}
                />
                <Autocomplete
                    options={tipoUbicacion.map((tipo) => tipo.nombre)}
                    value={datosNuevaUbicacion["nombreTipoUbicacion"]}
                    defaultValue={datosNuevaUbicacion["nombreTipoUbicacion"]}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            label="Tipo"
                            sx={{ width: 350 }}
                            error={errorTipo}
                        />
                    )}
                    sx={{
                        width: 350,
                        background: "white",
                        borderRadius: "6px",
                    }}
                    onChange={seleccionarTipo}
                    loading={estadoCarga}
                />
                <AutocompletarUbicacionLocalidad
                    localidades={localidades}
                    title="Localidad"
                    datosNuevaUbicacion={datosNuevaUbicacion}
                    error={erroLocalidad}
                    estadoCarga={estadoCarga}
                />
            </Box>
            <Box
                margin={2}
                sx={{ display: "flex", justifyContent: "flex-start" }}
            >
                <Button onClick={handleClose} color="primary">
                    Cancelar
                </Button>
                <Button onClick={handleSave} color="primary">
                    Guardar
                </Button>
                <IconButton onClick={() => handleClickDeleteCarga()}>
                    <DeleteOutlineIcon
                        sx={{ fontSize: 20, color: "#d68384" }}
                    />
                </IconButton>
            </Box>
            <Dialog
                open={openDialogDelete}
                onClose={handleCloseDialog}
                maxWidth="sm"
                fullWidth
            >
                <DeleteUbicacion
                    id={datosNuevaUbicacion["id"]}
                    handleCloseDialog={handleCloseDialog}
                    handleClose={handleClose}
                    refreshUbicaciones={refreshUbicaciones}
                />
            </Dialog>
        </>
    );
}
