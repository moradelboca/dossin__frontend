import {
    Autocomplete,
    Box,
    Button,
    IconButton,
    TextField,
} from "@mui/material";
import { useContext, useEffect, useState } from "react";
import AutocompletarUbicacionLocalidad from "./AutocompletarUbicacionLocalidad";
import { ContextoGeneral } from "../Contexto";
import React from "react";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

interface Ubicacion {
    handleClose: any;
    ubicacionSeleccionada: any;
    ubicaciones: any[];
    setUbicaciones: any;
}

export function CreadorUbicacion(props: Ubicacion) {
    const { backendURL } = useContext(ContextoGeneral);
    // const [ubicaciones, setUbicaciones] = useState<Ubicacion[]>([]);
    let { handleClose, ubicacionSeleccionada, ubicaciones, setUbicaciones } =
        props;
    const [tipoUbicacion, setTipoUbicacion] = useState<Ubicacion[]>([]);

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
            })
            .catch(() =>
                console.error("Error al obtener las ubicaciones disponibles")
            );
    }, []);
    useEffect(() => {
        fetch(`${backendURL}/ubicaciones/tipoUbicaciones`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "ngrok-skip-browser-warning": "true",
            },
        })
            .then((response) => response.json())
            .then((tipoUbicacion) => {
                setTipoUbicacion(tipoUbicacion);
            })
            .catch(() =>
                console.error("Error al obtener las ubicaciones disponibles")
            );
    }, []);
    let [datosNuevaUbicacion, setDatosNuevaUbicacion] = React.useState<any>({
        urlMaps: ubicacionSeleccionada?.urlMaps,
        nombre: ubicacionSeleccionada?.nombre,
        localidad: ubicacionSeleccionada?.localidad,
        tipo: ubicacionSeleccionada?.tipo,
    });

    const seleccionarURLMaps = (e: any) => {
        datosNuevaUbicacion["urlMaps"] = e.target.value;
    };
    const setNombre = (e: React.ChangeEvent<HTMLInputElement>) => {
        datosNuevaUbicacion["nombre"] = e.target.value;
        setDatosNuevaUbicacion({ ...datosNuevaUbicacion });
    };
    const seleccionarTipo = (_event: any, seleccionado: any | null) => {
        if (seleccionado) {
            const tipoUbicacionesStrings = tipoUbicacion.map(
                (tipo) => `${tipo}`
            );
            const index = tipoUbicacionesStrings.indexOf(seleccionado);
            const tipoUbicacionesIds = ubicaciones.map(
                (ubicacion) => ubicacion.id
            );
            datosNuevaUbicacion["idTipoUbicacion"] = tipoUbicacionesIds[index];
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

        const validUrl = regexUrl.test(datosNuevaUbicacion["patente"]);
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
                if (!response.ok) throw new Error("Error al crear la turno");
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
            .catch(() => {});

        handleClose();
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
                    slotProps={{
                        htmlInput: {
                            maxLength: 50,
                        },
                    }}
                    sx={{ width: 350 }}
                />
                <Autocomplete
                    options={tipoUbicacion}
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
                />
                <AutocompletarUbicacionLocalidad
                    ubicaciones={ubicaciones}
                    title="Ubicación"
                    datosNuevaUbicacion={datosNuevaUbicacion}
                    error={erroLocalidad}
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
                <IconButton>
                    <DeleteOutlineIcon
                        sx={{ fontSize: 20, color: "#d68384" }}
                    />
                </IconButton>
            </Box>
        </>
    );
}
