import { Autocomplete, Box, Button, TextField } from "@mui/material";
import { useContext, useEffect, useState } from "react";
import AutocompletarUbicacionLocalidad from "./AutocompletarUbicacionLocalidad";
import { ContextoGeneral } from "../Contexto";

interface Ubicacion {
    nombre: string;
    provincia: string;
    pais: string;
    latitud: number;
    longitud: number;
    tipoUbicacion: string;
    id: number;
}

export function CreadorUbicacion() {
    const { backendURL } = useContext(ContextoGeneral);
    const [ubicaciones, setUbicaciones] = useState<Ubicacion[]>([]);
    const datosNuevaUbicacion: any = {};
    console.log(datosNuevaUbicacion);

    const [_tipoUbicacionSeleccionado, setTipoUbicacionSeleccionado] =
        useState<string>("Todas");

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

    const seleccionarURLMaps = (e: any) => {
        datosNuevaUbicacion["urlMaps"] = e.target.value;
    };
    const tipoUbicacionOptions = ["Todas", "Carga", "Descarga", "Balanza"];

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
            >
                <TextField
                    id="outlined-basic"
                    label="URL Google Maps"
                    variant="outlined"
                    onChange={seleccionarURLMaps}
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
                    slotProps={{
                        htmlInput: {
                            maxLength: 50,
                        },
                    }}
                    sx={{ width: 350 }}
                />
                <Autocomplete
                    options={tipoUbicacionOptions}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            label="Tipo"
                            sx={{ width: 350 }}
                        />
                    )}
                    sx={{
                        width: 350,
                        background: "white",
                        borderRadius: "6px",
                    }}
                    onChange={(_event, value) => {
                        setTipoUbicacionSeleccionado(value || "Todas");
                    }}
                    defaultValue={tipoUbicacionOptions[0]}
                />
                <AutocompletarUbicacionLocalidad
                    ubicaciones={ubicaciones}
                    title="Ubicación"
                    datosNuevaUbicacion={datosNuevaUbicacion}
                />
            </Box>
            <Button>Cerrar</Button>
        </>
    );
}
