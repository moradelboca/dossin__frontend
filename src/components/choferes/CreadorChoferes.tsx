import {
    Box,
    Button,
    Dialog,
    IconButton,
    Stack,
    TextField,
} from "@mui/material";
import * as React from "react";
import { ContextoGeneral } from "../Contexto";
import { useContext, useEffect, useState } from "react";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { PatternFormat } from "react-number-format";
import AutocompletarPais from "../cargas/autocompletar/AutocompletarPais";
import DeleteChoferes from "./DeleteChoferes";
import Autocomplete from "@mui/material/Autocomplete";

interface Choferes {
    handleClose: any;
    choferSeleccionado: any;
    choferes: any;
    setChoferes: any;
}
interface CustomProps {
    onChange: (event: { target: { name: string; value: string } }) => void;
    name: string;
}

const CuilFormat = React.forwardRef<any, CustomProps>(
    function CuilFormat(props, ref) {
        const { onChange, ...other } = props;

        return (
            <PatternFormat
                {...other}
                getInputRef={ref}
                format="##-########-#"
                mask="_" // Puedes personalizar la máscara que desees
                onValueChange={(values) => {
                    // Verifica si el valor es negativo
                    if (Number(values.value) < 0) {
                        return; // No hacer nada si el valor es negativo
                    }

                    onChange({
                        target: {
                            name: props.name,
                            value: values.value,
                        },
                    });
                }}
            />
        );
    }
);
const NumeroFormat = React.forwardRef<any, CustomProps>(
    function NumeroFormat(props, ref) {
        const { onChange, ...other } = props;

        return (
            <PatternFormat
                {...other}
                getInputRef={ref}
                format="##########"
                mask="_" // Puedes personalizar la máscara que desees
                onValueChange={(values) => {
                    // Verifica si el valor es negativo
                    if (Number(values.value) < 0) {
                        return; // No hacer nada si el valor es negativo
                    }

                    onChange({
                        target: {
                            name: props.name,
                            value: values.value,
                        },
                    });
                }}
            />
        );
    }
);

const EdadFormat = React.forwardRef<any, CustomProps>(
    function EdadFortmat(props, ref) {
        const { onChange, ...other } = props;

        return (
            <PatternFormat
                {...other}
                getInputRef={ref}
                format="###"
                mask="_" // Puedes personalizar la máscara que desees
                onValueChange={(values) => {
                    // Verifica si el valor es negativo
                    if (Number(values.value) < 0) {
                        return; // No hacer nada si el valor es negativo
                    }

                    onChange({
                        target: {
                            name: props.name,
                            value: values.value,
                        },
                    });
                }}
            />
        );
    }
);
export default function CreadorChoferes(props: Choferes) {
    const { backendURL } = useContext(ContextoGeneral);
    const [codigoSeleccionado, setCodigoSeleccionado] = React.useState("");
    let { handleClose, choferSeleccionado, choferes, setChoferes } = props;

    let [datosNuevoChofer, setDatosNuevoChofer] = React.useState<any>({
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
    const [empresasTransportistas, setEmpresasTransportistas] = useState<any[]>(
        []
    );
    const [
        empresaTransportistaSeleccionada,
        setEmpresaTransportistaSeleccionada,
    ] = useState<Number | null>(null);
    const [estadoCarga, setEstadoCarga] = useState(true);

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
            setErrorNumeroCel(true);
            error = true;
        }
        if (!datosNuevoChofer["cuit"]) {
            setErrorCuit(true);
            error = true;
        }

        if (error) {
            return;
        }

        datosNuevoChofer["idUbicacion"] = 1;
        datosNuevoChofer["cuitEmpresa"] = empresaTransportistaSeleccionada;
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
                onChange={(_e, v) =>
                    setEmpresaTransportistaSeleccionada(
                        v?.value ? parseInt(v?.value) : null
                    )
                }
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
