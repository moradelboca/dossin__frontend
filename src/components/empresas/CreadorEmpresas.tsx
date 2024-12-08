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
import DeleteEmpresas from "./DeleteEmpresas";

interface Empresas {
    handleClose: any;
    empresaSeleccionada: any;
    empresas: any;
    setEmpresas: any;
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

export default function CreadorEmpresas(props: Empresas) {
    const { backendURL } = useContext(ContextoGeneral);
    const [codigoSeleccionado, setCodigoSeleccionado] = React.useState("");
    let {
        handleClose,
        empresaSeleccionada,
        empresas: empresas,
        setEmpresas: setEmpresas,
    } = props;

    let [datosNuevaEmpresa, SetDatosNuevaEmpresa] = React.useState<any>({
        cuit: empresaSeleccionada?.cuit,
        razonSocial:
            empresaSeleccionada?.razonSocial == "No especificado"
                ? null
                : empresaSeleccionada?.razonSocial,
        nombreFantasia:
            empresaSeleccionada?.nombreFantasia == "No especificado"
                ? null
                : empresaSeleccionada?.nombreFantasia,
        numeroCel:
            empresaSeleccionada?.numeroCel == "No especificado"
                ? null
                : empresaSeleccionada?.numeroCel,
        idUbicacion:
            empresaSeleccionada?.idUbicacion == "No especificado"
                ? null
                : empresaSeleccionada?.idUbicacion,
        urlConstanciaAfip:
            empresaSeleccionada?.urlConstanciaAfip == "No especificado"
                ? null
                : empresaSeleccionada?.urlConstanciaAfip,
        urlConstanciaCbu:
            empresaSeleccionada?.urlConstanciaCbu == "No especificado"
                ? null
                : empresaSeleccionada?.urlConstanciaCbu,
        email:
            empresaSeleccionada?.email == "No especificado"
                ? null
                : empresaSeleccionada?.email,
    });
    const [openDialogDelete, setOpenDialogDelete] = useState(false);

    const setRazonSocial = (e: React.ChangeEvent<HTMLInputElement>) => {
        datosNuevaEmpresa["razonSocial"] = e.target.value;
        SetDatosNuevaEmpresa({ ...datosNuevaEmpresa });
    };

    const setCuit = (e: React.ChangeEvent<HTMLInputElement>) => {
        const cuit = parseInt(e.target.value, 10);
        datosNuevaEmpresa["cuit"] = cuit;
        SetDatosNuevaEmpresa({ ...datosNuevaEmpresa });
    };
    const setNombreFantasia = (e: React.ChangeEvent<HTMLInputElement>) => {
        datosNuevaEmpresa["nombreFantasia"] = e.target.value;
        SetDatosNuevaEmpresa({ ...datosNuevaEmpresa });
    };
    const setNumeroCel = (e: React.ChangeEvent<HTMLInputElement>) => {
        datosNuevaEmpresa["numeroCel"] = codigoSeleccionado + e.target.value;
        SetDatosNuevaEmpresa({ ...datosNuevaEmpresa });
    };

    const setUrlConstanciaAfip = (e: React.ChangeEvent<HTMLInputElement>) => {
        datosNuevaEmpresa["urlConstanciaAfip"] = e.target.value;
        SetDatosNuevaEmpresa({ ...datosNuevaEmpresa });
    };
    const setUrlConstanciaCbu = (e: React.ChangeEvent<HTMLInputElement>) => {
        datosNuevaEmpresa["urlConstanciaCbu"] = e.target.value;
        SetDatosNuevaEmpresa({ ...datosNuevaEmpresa });
    };
    const setEmail = (e: React.ChangeEvent<HTMLInputElement>) => {
        datosNuevaEmpresa["email"] = e.target.value;
        SetDatosNuevaEmpresa({ ...datosNuevaEmpresa });
    };

    const [errorCuit, setErrorCuit] = React.useState(false);
    const [errorRazonSocial, setErrorRazonSocial] = React.useState(false);
    const [errorNombreFantasia, setErrorNombreFantasia] = React.useState(false);
    const [errorNumeroCel, setErrorNumeroCel] = React.useState(false);

    const handleSave = () => {
        let error = false;

        if (!datosNuevaEmpresa["cuit"]) {
            setErrorCuit(true);
            error = true;
        }
        if (!datosNuevaEmpresa["razonSocial"]) {
            setErrorRazonSocial(true);
            error = true;
        }
        if (!datosNuevaEmpresa["nombreFantasia"]) {
            setErrorNombreFantasia(true);
            error = true;
        }
        if (!datosNuevaEmpresa["numeroCel"]) {
            setErrorNumeroCel(true);
            error = true;
        }

        if (error) {
            return;
        }

        datosNuevaEmpresa["idUbicacion"] = 3;
        const metodo = empresaSeleccionada ? "PUT" : "POST";
        const url = empresaSeleccionada
            ? `${backendURL}/empresastransportistas/${datosNuevaEmpresa["cuit"]}`
            : `${backendURL}/empresastransportistas`;

        fetch(url, {
            method: metodo,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(datosNuevaEmpresa),
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
                    setEmpresas((empresas: any) => [...empresas, data]);
                } else {
                    const index = empresas.findIndex(
                        (empresa: { cuil: any }) =>
                            empresa.cuil === datosNuevaEmpresa.cuil
                    );
                    if (index !== -1) {
                        empresas[index] = data;
                        setEmpresas([...empresas]);
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
                    label="Cuit"
                    name="numberformat"
                    id="formatted-numberformat-input"
                    fullWidth
                    variant="outlined"
                    slotProps={{
                        input: {
                            inputComponent: CuilFormat as any,
                        },
                    }}
                    value={empresaSeleccionada && empresaSeleccionada["cuit"]}
                    onChange={setCuit}
                    error={errorCuit}
                    disabled={empresaSeleccionada !== null}
                    defaultValue={
                        empresaSeleccionada !== null ? "Disabled" : ""
                    }
                />
            </Stack>
            <TextField
                margin="dense"
                label="razonSocial"
                type="text"
                fullWidth
                variant="outlined"
                value={
                    empresaSeleccionada &&
                    empresaSeleccionada["razonSocial"] &&
                    datosNuevaEmpresa["razonSocial"]
                }
                onChange={setRazonSocial}
                error={errorRazonSocial}
            />
            <TextField
                margin="dense"
                label="nombreFantasia"
                type="text"
                fullWidth
                variant="outlined"
                value={
                    empresaSeleccionada &&
                    empresaSeleccionada["nombreFantasia"] &&
                    datosNuevaEmpresa["nombreFantasia"]
                }
                onChange={setNombreFantasia}
                error={errorNombreFantasia}
            />
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
                            empresaSeleccionada &&
                            empresaSeleccionada["numeroCel"] &&
                            datosNuevaEmpresa["numeroCel"]
                        }
                        onChange={setNumeroCel}
                        error={errorNumeroCel}
                    />
                </Stack>
            </Box>

            <TextField
                margin="dense"
                label="URL Constancia Afip"
                type="text"
                fullWidth
                variant="outlined"
                slotProps={{
                    input: {
                        inputComponent: CuilFormat as any,
                    },
                }}
                value={
                    empresaSeleccionada &&
                    empresaSeleccionada["urlConstanciaAfip"] &&
                    datosNuevaEmpresa["urlConstanciaAfip"]
                }
                onChange={setUrlConstanciaAfip}
            />
            <TextField
                margin="dense"
                label="URL Linti"
                type="text"
                fullWidth
                variant="outlined"
                value={
                    empresaSeleccionada &&
                    empresaSeleccionada["urlConstanciaCbu"] &&
                    datosNuevaEmpresa["urlConstanciaCbu"]
                }
                onChange={setUrlConstanciaCbu}
            />
            <TextField
                margin="dense"
                label="Email"
                type="text"
                fullWidth
                variant="outlined"
                value={
                    empresaSeleccionada &&
                    empresaSeleccionada["email"] &&
                    datosNuevaEmpresa["email"]
                }
                onChange={setEmail}
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
                <DeleteEmpresas
                    cuit={datosNuevaEmpresa["cuit"]}
                    handleCloseDialog={handleCloseDialog}
                    handleClose={handleClose}
                    empresas={empresas}
                    setEmpresas={setEmpresas}
                />
            </Dialog>
        </>
    );
}
