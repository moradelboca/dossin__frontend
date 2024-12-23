/* eslint-disable @typescript-eslint/no-explicit-any */
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { Box, Button, Dialog, IconButton, Stack, TextField } from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import * as React from "react";
import { useContext, useEffect, useState } from "react";
import AutocompletarPais from "../cargas/autocompletar/AutocompletarPais";
import { ContextoGeneral } from "../Contexto";
import ChoferForm from "../forms/Choferes/ChoferForm";
import EdadFormat from "../forms/formatos/EdadFormat";
import NumeroFormat from "../forms/formatos/NumeroFormat";
import CuilFormat from "../forms/formatos/CuilFormat";
import DeleteChoferes from "./DeleteChoferes";


// Otro archivo para hacer Interfaz
interface Choferes {
    handleClose: any;
    choferSeleccionado: any;
    choferes: any;
    setChoferes: any;
}

// Hay que dividirla en otros componente o que se pasen varios datos como props
export default function CreadorChoferes(props: Choferes) {
    const { backendURL } = useContext(ContextoGeneral);
    const [codigoSeleccionado, setCodigoSeleccionado] = React.useState("");
    const { handleClose, choferSeleccionado, choferes, setChoferes } = props;

    const [datosNuevoChofer, setDatosNuevoChofer] = React.useState<any>({
        cuil: choferSeleccionado?.cuil,
        numeroCel:
            choferSeleccionado?.numeroCel == "No especificado"
                ? null
                : choferSeleccionado?.numeroCel,
        nombre:
            choferSeleccionado?.nombre == "No especificado"
                ? null
                : choferSeleccionado?.nombre,
        apellido:
            choferSeleccionado?.apellido == "No especificado"
                ? null
                : choferSeleccionado?.apellido,
        edad:
            choferSeleccionado?.edad == "No especificado"
                ? null
                : choferSeleccionado?.edad,
        cuitEmpresa:
            choferSeleccionado?.cuitEmpresa == "No especificado"
                ? null
                : choferSeleccionado?.cuitEmpresa,
        urlLINTI:
            choferSeleccionado?.urlLINTI == "No especificado"
                ? null
                : choferSeleccionado?.urlLINTI,
        idUbicacion:
            choferSeleccionado?.idUbicacion == "No especificado"
                ? null
                : choferSeleccionado?.idUbicacion,
    });

    const [openDialogDelete, setOpenDialogDelete] = useState(false);

    // Todos estos sets hacerlos en otro componente tal vez o que se hereden/pasen como prop
    const setNumeroCel = (e: React.ChangeEvent<HTMLInputElement>) => {
        datosNuevoChofer["numeroCel"] = codigoSeleccionado + e.target.value;
        setDatosNuevoChofer({ ...datosNuevoChofer });
    };

    const setCuil = (e: React.ChangeEvent<HTMLInputElement>) => {
        const cuil = parseInt(e.target.value, 10);
        datosNuevoChofer["cuil"] = cuil;
        setDatosNuevoChofer({ ...datosNuevoChofer });
    };
    const setNombre = (e: React.ChangeEvent<HTMLInputElement>) => {
        datosNuevoChofer["nombre"] = e.target.value;
        setDatosNuevoChofer({ ...datosNuevoChofer });
    };
    const setApellido = (e: React.ChangeEvent<HTMLInputElement>) => {
        datosNuevoChofer["apellido"] = e.target.value;
        setDatosNuevoChofer({ ...datosNuevoChofer });
    };
    const setEdad = (e: React.ChangeEvent<HTMLInputElement>) => {
        datosNuevoChofer["edad"] = e.target.value;
        setDatosNuevoChofer({ ...datosNuevoChofer });
    };
    const setUrlLinti = (e: React.ChangeEvent<HTMLInputElement>) => {
        datosNuevoChofer["urlLINTI"] = e.target.value;
        setDatosNuevoChofer({ ...datosNuevoChofer });
    };
    const setIdUbicacion = (e: React.ChangeEvent<HTMLInputElement>) => {
        datosNuevoChofer["idUbicacion"] = e.target.value;
        setDatosNuevoChofer({ ...datosNuevoChofer });
    };
    const setEmpresa = (value: any) => {
        datosNuevoChofer["cuitEmpresa"] = value.value;
        setDatosNuevoChofer({ ...datosNuevoChofer });
    };
    const [empresasTransportistas, setEmpresasTransportistas] = useState<any[]>(
        []
    );

    const [estadoCarga, setEstadoCarga] = useState(true);

    // Se puede hacer generico el endpoint
    useEffect(() => {
        fetch(`${backendURL}/empresastransportistas`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "ngrok-skip-browser-warning": "true",
            },
        })
            .then((response) => response.json())
            .then((data) => {
                setEmpresasTransportistas(data);
                setEstadoCarga(false);
            })
            .catch(() =>
                console.error("Error al obtener los choferes disponibles")
            );
    }, []);

    // Ver de hacerlo generico, la cosa es que varia y no son todos los que se puede tener error, pero parece más un "no se cargo x dato"
    const [errorCuil, setErrorCuil] = React.useState(false);
    const [errorNumeroCel, setErrorNumeroCel] = React.useState(false);
    const [errorNombre, setErrorNombre] = React.useState(false);
    const [errorApellido, setErrorApellido] = React.useState(false);
    const [errorCuit, setErrorCuit] = React.useState(false);
    const handleSave = () => {
        let error = false;

        if (!datosNuevoChofer["cuil"]) {
            setErrorCuil(true);
            error = true;
        }
        if (!datosNuevoChofer["numeroCel"]) {
            setErrorNumeroCel(true);
            error = true;
        }
        if (!datosNuevoChofer["nombre"]) {
            setErrorNombre(true);
            error = true;
        }
        if (!datosNuevoChofer["apellido"]) {
            setErrorApellido(true);
            error = true;
        }
        if (!datosNuevoChofer["cuitEmpresa"]) {
            setErrorCuit(true);
            error = true;
        }

        if (error) {
            return;
        }

        // Porque es asignado el valor de 3 al idUbicacion?
        datosNuevoChofer["idUbicacion"] = 3;
        // Tambien se lo puede hacer generico a este junto con el fetch

        const metodo = choferSeleccionado ? "PUT" : "POST";
        const url = choferSeleccionado
            ? `${backendURL}/choferes/${datosNuevoChofer["cuil"]}`
            : `${backendURL}/choferes`;


        fetch(url, {
            method: metodo,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(datosNuevoChofer),
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
                    setChoferes((choferes: any) => [...choferes, data]);
                } else {
                    const index = choferes.findIndex(
                        (chofer: { cuil: any }) =>
                            chofer.cuil === datosNuevoChofer.cuil
                    );
                    if (index !== -1) {
                        choferes[index] = data;
                        setChoferes([...choferes]);
                    }
                }
            })
            .catch((e) => console.error(e));

        handleClose();
    };

    // Funciones genericas
    const handleClickDeleteCarga = () => {
        setOpenDialogDelete(true);
    };
    const handleCloseDialog = () => {
        setOpenDialogDelete(false);
    };

    // Hacerlo a esto como un form/componente que se le puede pasar a este componente para que lo ponga aqui
    return (
        <>
            <Stack direction="row" spacing={2}>
                <TextField
                    margin="dense"
                    label="Cuil"
                    name="numberformat"
                    id="formatted-numberformat-input"
                    fullWidth
                    variant="outlined"
                    slotProps={{
                        input: {
                            inputComponent: CuilFormat as any,
                        },
                    }}
                    value={choferSeleccionado && choferSeleccionado["cuil"]}
                    onChange={setCuil}
                    error={errorCuil}
                    disabled={choferSeleccionado !== null}
                    defaultValue={choferSeleccionado !== null ? "Disabled" : ""}
                />
            </Stack>
            <Box
                display="flex"
                flexDirection="row"
                gap={2}
                alignContent={"center"}
                alignItems={"center"}
                marginTop={2}
                marginBottom={1}
            >
                <Box width={"100px"}>
                    <AutocompletarPais
                        setCodigoSeleccionado={setCodigoSeleccionado}
                        error={errorNumeroCel}
                    />
                </Box>
                <>-</>
                <Stack width="400px" direction="row" spacing={2}>
                    <TextField
                        margin="dense"
                        label="Numero"
                        name="numberformat"
                        id="formatted-numberformat-input"
                        fullWidth
                        variant="outlined"
                        slotProps={{
                            input: {
                                inputComponent: NumeroFormat as any,
                            },
                        }}
                        value={
                            choferSeleccionado &&
                            choferSeleccionado["numeroCel"] &&
                            datosNuevoChofer["numeroCel"]
                        }
                        onChange={setNumeroCel}
                        error={errorNumeroCel}
                    />
                </Stack>
            </Box>
            <Box display="flex" flexDirection="row" gap={2}
                alignContent={"center"}
                alignItems={"center"}
                marginTop={2}
                marginBottom={1}
            >
            <TextField
                margin="dense"
                label="Nombre"
                type="text"
                fullWidth
                variant="outlined"
                value={
                    choferSeleccionado &&
                    choferSeleccionado["nombre"] &&
                    datosNuevoChofer["nombre"]
                }
                onChange={setNombre}
                error={errorNombre}
            />
            <TextField
                margin="dense"
                label="Apellido"
                type="text"
                fullWidth
                variant="outlined"
                value={
                    choferSeleccionado &&
                    choferSeleccionado["apellido"] &&
                    datosNuevoChofer["apellido"]
                }
                onChange={setApellido}
                error={errorApellido}
            />
            </Box>
            <Stack direction="row" spacing={2}>
                <TextField
                    margin="dense"
                    label="Edad"
                    name="numberformat"
                    id="formatted-numberformat-input"
                    fullWidth
                    variant="outlined"
                    slotProps={{
                        input: {
                            inputComponent: EdadFormat as any,
                        },
                    }}
                    value={
                        choferSeleccionado &&
                        choferSeleccionado["edad"] &&
                        datosNuevoChofer["edad"]
                    }
                    onChange={setEdad}
                />
            </Stack>
            <Autocomplete
                disablePortal
                options={empresasTransportistas.map((empresa) => ({
                    label: `${empresa.nombreFantasia} - ${empresa.cuit}`,
                    value: empresa.cuit,
                }))}
                onChange={(_e, value: any) => setEmpresa(value)}
                renderInput={(params: any) => (
                    <TextField
                        {...params}
                        label="Cuit empresa"
                        error={errorCuit}
                    />
                )}
                loading={estadoCarga}
            />
            <TextField
                margin="dense"
                label="URL Linti"
                type="text"
                fullWidth
                variant="outlined"
                value={
                    choferSeleccionado &&
                    choferSeleccionado["urlLINTI"] &&
                    datosNuevoChofer["urlLINTI"]
                }
                onChange={setUrlLinti}
            />
            <TextField
                margin="dense"
                label="Ubicacion"
                type="text"
                fullWidth
                variant="outlined"
                value={
                    choferSeleccionado &&
                    choferSeleccionado["idUbicacion"] &&
                    datosNuevoChofer["idUbicacion"]
                }
                onChange={setIdUbicacion}
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
                <DeleteChoferes
                    cuil={datosNuevoChofer["cuil"]}
                    handleCloseDialog={handleCloseDialog}
                    handleClose={handleClose}
                    choferes={choferes}
                    setChoferes={setChoferes}
                />
            </Dialog>
        </>
    );
}

/*
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { useState } from "react";
//import { Dialog, Button, IconButton } from "@mui/material";
import React from "react";

export default function CreadorChoferes({
    onSubmit,
    children,
    seleccionado, // Datos iniciales para el formulario
    handleClose,  // Función para cerrar el diálogo desde el componente padre
}: {
    onSubmit: (data: any) => void; // Función a ejecutar al enviar el formulario
    children: React.ReactNode;     // Componente de formulario a renderizar
    seleccionado?: any;            // Datos iniciales
    handleClose: () => void;       // Método para cerrar el diálogo
}) {
    const [openDialogDelete, setOpenDialogDelete] = useState(false);
    const handleClickDeleteCarga = () => {
        setOpenDialogDelete(true);
    };
    const handleCloseDialog = () => {
        setOpenDialogDelete(false);
    };
    return (
        <Dialog open onClose={handleCloseDialog}>
            <ChoferForm onSubmit={onSubmit}/>
            <Button onClick={handleCloseDialog} color="primary">
                Cancelar
            </Button>
            <IconButton onClick={() => handleClickDeleteCarga()}>
                <DeleteOutlineIcon sx={{ fontSize: 20, color: "#d68384" }} />
            </IconButton>
        </Dialog>
        
    );
}
    */