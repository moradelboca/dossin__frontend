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
import { useContext, useState } from "react";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { PatternFormat } from "react-number-format";
import AutocompletarPais from "../cargas/autocompletar/AutocompletarPais";
import DeleteChoferes from "./DeleteChoferes";

interface Acoplados {
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
export default function CreadorChoferes(props: Acoplados) {
    const { backendURL } = useContext(ContextoGeneral);

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
        datosNuevoChofer["numeroCel"] = e.target.value;
        setDatosNuevoChofer({ ...datosNuevoChofer });
    };

    const setCuil = (e: React.ChangeEvent<HTMLInputElement>) => {
        datosNuevoChofer["cuil"] = e.target.value;
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
    const setCuitEmpresa = (e: React.ChangeEvent<HTMLInputElement>) => {
        datosNuevoChofer["cuitEmpresa"] = e.target.value;
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

    const [errorCuil, setErrorCuil] = React.useState(false);

    const handleSave = () => {
        if (!datosNuevoChofer["cuil"]) {
            setErrorCuil(true);
            return;
        }

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
                if (!response.ok) throw new Error("Error al crear el acoplado");
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
                    <AutocompletarPais />
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
            <TextField
                margin="dense"
                label="Cuit Empresa"
                type="text"
                fullWidth
                variant="outlined"
                slotProps={{
                    input: {
                        inputComponent: CuilFormat as any,
                    },
                }}
                value={
                    choferSeleccionado &&
                    choferSeleccionado["cuitEmpresa"] &&
                    datosNuevoChofer["cuitEmpresa"]
                }
                onChange={setCuitEmpresa}
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
