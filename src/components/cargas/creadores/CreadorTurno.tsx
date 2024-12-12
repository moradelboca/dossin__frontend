import Box from "@mui/material/Box";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import { useState, useEffect, useContext } from "react";
import { ContextoGeneral } from "../../Contexto";
import Autocomplete from "@mui/material/Autocomplete";
import {
    Button,
    Dialog,
    DialogContent,
    DialogTitle,

    TextField,
} from "@mui/material";
import { CustomButtom } from "../../botones/CustomButtom";
import ClearSharpIcon from "@mui/icons-material/ClearSharp";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import DeleteTurno from "./DeleteTurno";

interface CreadorProps {
    fecha?: string;
    idCarga?: any;
    refreshCupos?: any;
    handleCloseDialog?: any;
    turno?: any;
    openDialog: any;
    seleccionado: any;
    idTurno?: any;
    actualizarTurno?: any;
}

export default function CreadorTurno(props: CreadorProps) {
    const {
        idCarga,
        fecha,
        refreshCupos,
        handleCloseDialog,
        openDialog,
        turno,
        seleccionado,
        idTurno,
        actualizarTurno,
    } = props;
    const { backendURL, theme } = useContext(ContextoGeneral);
    const [choferes, setChoferes] = useState<any[]>([]);
    const [patentesCamiones, setPatentesCamiones] = useState<any[]>([]);
    const [patentesAcoplados, setPatentesAcoplados] = useState<any[]>([]);
    const [empresasTransportistas, setEmpresasTransportistas] = useState<any[]>(
        []
    );
    const [chofer, setChofer] = useState<any | null>(null);
    const [
        empresaTransportistaSeleccionada,
        setEmpresaTransportistaSeleccionada,
    ] = useState<any | null>(null);
    const [patenteCamionSeleccionada, setPatenteCamionSeleccionada] = useState<
        string | null
    >(null);
    const [patenteAcopladoSeleccionada, setPatenteAcopladoSeleccionada] =
        useState<any | null>(null);
    const [
        patenteAcopladoSeleccionadaExtra,
        setPatenteAcopladoSeleccionadaExtra,
    ] = useState<any | null>(null);
    const [error, setError] = useState(false);
    const [nuevoTurno, setNuevoTurno] = useState({
        cuilChofer: turno?.textCuil,
        patenteCamion: turno?.textPatenteCamion,
        cuitEmpresa: turno?.textCuitEmpresa,
        patenteAcoplado: turno?.textPatenteSemi1,
        patenteAcopladoExtra: turno?.textPatenteSemi2,
        idEstado: 0,
    });
    useEffect(() => {
        fetch(`${backendURL}/choferes`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "ngrok-skip-browser-warning": "true",
            },
        })
            .then((response) => response.json())
            .then((data) => {
                setChoferes(data);
            })
            .catch(() =>
                console.error("Error al obtener los choferes disponibles")
            );
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
            })
            .catch(() =>
                console.error("Error al obtener los choferes disponibles")
            );
        fetch(`${backendURL}/camiones`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "ngrok-skip-browser-warning": "true",
            },
        })
            .then((response) => response.json())
            .then((data) => {
                setPatentesCamiones(data);
            })
            .catch(() =>
                console.error("Error al obtener las tiposAcoplados disponibles")
            );
        fetch(`${backendURL}/acoplados`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "ngrok-skip-browser-warning": "true",
            },
        })
            .then((response) => response.json())
            .then((data) => {
                setPatentesAcoplados(data);
            })
            .catch(() =>
                console.error("Error al obtener las tiposAcoplados disponibles")
            );
    }, []);
    const actualizarNuevoTurno = () => {
        setNuevoTurno({
            cuilChofer: chofer ?? nuevoTurno.cuilChofer,
            patenteCamion:
                patenteCamionSeleccionada ?? nuevoTurno.patenteCamion,
            cuitEmpresa:
                empresaTransportistaSeleccionada ?? nuevoTurno.cuitEmpresa,
            patenteAcoplado:
                patenteAcopladoSeleccionada ?? nuevoTurno.patenteAcoplado,
            patenteAcopladoExtra:
                patenteAcopladoSeleccionadaExtra ??
                nuevoTurno.patenteAcopladoExtra,
            idEstado: 1,
        });
    };

    useEffect(() => {
        actualizarNuevoTurno();
    }, [
        chofer,
        patenteCamionSeleccionada,
        empresaTransportistaSeleccionada,
        patenteAcopladoSeleccionada,
        patenteAcopladoSeleccionadaExtra,
    ]);

    const handleClick = (accion: any) => {
        // Asigna el idEstado basado en la acción
        nuevoTurno["idEstado"] = accion === "confirmar" ? 3 : 4;

        setError(false);

        // Validaciones comunes

        if (
            !nuevoTurno["cuilChofer"] ||
            !nuevoTurno["patenteCamion"] ||
            !nuevoTurno["cuitEmpresa"] ||
            !nuevoTurno["patenteAcoplado"]
        ) {
            setError(true);
            return;
        }

        const metodo = seleccionado ? "PUT" : "POST";
        const url = seleccionado
            ? `${backendURL}/turnos/${idTurno}`
            : `${backendURL}/cargas/${idCarga}/cupos/${fecha}`;

        fetch(url, {
            method: metodo,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(nuevoTurno),
        })
            .then((response) => {
                if (!response.ok) {
                    return response.text().then((text) => {
                        throw new Error(text);
                    });
                }
                return response.json();
            })
            .then(() => {
                handleCloseDialog();
                refreshCupos();
                actualizarTurno();
            })
            .catch((e) => console.error(e));
    };
    return (
        <Dialog
            open={openDialog}
            onClose={handleCloseDialog}
            fullWidth
            maxWidth="md"
        >
            <ClearSharpIcon
                onClick={handleCloseDialog}
                sx={{
                    position: "absolute",
                    top: "10px",
                    right: "10px",
                    cursor: "pointer",
                    color: theme.colores.azul,
                }}
            />
            <DialogTitle>Detalles del Cupo</DialogTitle>
            <DialogContent>
                <Box
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    minHeight="200px"
                >
                    <Box
                        sx={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <CardContent>
                            <Typography
                                variant="h5"
                                component="div"
                                sx={{ color: "#163660" }}
                            >
                                Turno
                            </Typography>
                        </CardContent>
                        <CardActions>
                            <Box
                                gap={5}
                                margin={3}
                                sx={{
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                <Box
                                    gap={5}
                                    sx={{
                                        display: "flex",
                                        flexDirection: "row",
                                        alignItems: "center",
                                        justifyContent: "center",
                                    }}
                                >
                                    <Autocomplete
                                        disablePortal
                                        options={choferes.map(
                                            (chofer) =>
                                                `${chofer.nombre} ${chofer.apellido} - ${chofer.cuil}`
                                        )}
                                        onChange={(_e, v: any) => {
                                            if (v && typeof v === "string") {
                                                setChofer(v.split(" - ")[1]);
                                                actualizarNuevoTurno();
                                            }

                                        }}
                                        sx={{ width: 300 }}
                                        renderInput={(params) => (
                                            <TextField
                                                error={error && !chofer}
                                                {...params}
                                                label="Cuil chofer"
                                            />
                                        )}
                                        value={nuevoTurno["cuilChofer"]}
                                        getOptionLabel={(option) =>
                                            option.toString()
                                        }
                                        defaultValue={nuevoTurno["cuilChofer"]}
                                    />
                                    <Autocomplete
                                        disablePortal
                                        options={patentesCamiones.map(
                                            (patenteCamion) =>
                                                patenteCamion.patente
                                        )}
                                        onChange={(_e, v) => {
                                            setPatenteCamionSeleccionada(v);
                                            actualizarNuevoTurno();
                                        }}
                                        sx={{ width: 300 }}
                                        renderInput={(params) => (
                                            <TextField
                                                error={
                                                    error &&
                                                    !patenteCamionSeleccionada
                                                }
                                                {...params}
                                                label="Patente camion"
                                            />
                                        )}
                                        value={nuevoTurno["patenteCamion"]}
                                        defaultValue={
                                            nuevoTurno["patenteCamion"]
                                        }
                                    />
                                </Box>
                                <Box
                                    gap={5}
                                    sx={{
                                        display: "flex",
                                        flexDirection: "row",
                                        alignItems: "center",
                                        justifyContent: "center",
                                    }}
                                >
                                    <Autocomplete
                                        disablePortal
                                        options={empresasTransportistas.map(
                                            (empresa) =>
                                                `${empresa.nombreFantasia} - ${empresa.cuit}`
                                        )}
                                        onChange={(_e, v: any) => {
                                            if (v && typeof v === "string") {
                                                const [_, empresa] =
                                                    v.split(" - ");
                                                setEmpresaTransportistaSeleccionada(
                                                    empresa
                                                );
                                                actualizarNuevoTurno();
                                            }

                                        }}
                                        sx={{ width: 300 }}
                                        renderInput={(params) => (
                                            <TextField
                                                error={error && !chofer}
                                                {...params}
                                                label="Cuit Empresa"
                                            />
                                        )}
                                        value={nuevoTurno["cuitEmpresa"]}
                                        getOptionLabel={(option) =>
                                            option.toString()
                                        }
                                        defaultValue={nuevoTurno["cuitEmpresa"]}
                                    />
                                    <Autocomplete
                                        disablePortal
                                        options={patentesAcoplados.map(
                                            (patenteAcoplado) =>
                                                patenteAcoplado.patente.toString()
                                        )}
                                        onChange={(_e, v) => {
                                            setPatenteAcopladoSeleccionada(v);
                                            actualizarNuevoTurno();
                                        }}
                                        sx={{ width: 300 }}
                                        renderInput={(params) => (
                                            <TextField
                                                error={
                                                    error &&
                                                    !patenteAcopladoSeleccionada
                                                }
                                                {...params}
                                                label="Patente semi"
                                            />
                                        )}
                                        value={nuevoTurno["patenteAcoplado"]}
                                        defaultValue={
                                            nuevoTurno["patenteAcoplado"]
                                        }
                                    />
                                </Box>
                                <Box
                                    gap={5}
                                    sx={{
                                        display: "flex",
                                        flexDirection: "row",
                                        alignItems: "center",
                                        justifyContent: "center",
                                    }}
                                >
                                    <Autocomplete
                                        disablePortal
                                        options={patentesAcoplados.map(
                                            (patenteAcoplado) =>
                                                patenteAcoplado.patente.toString()
                                        )}
                                        onChange={(_e, v) => {
                                            setPatenteAcopladoSeleccionadaExtra(
                                                v
                                            );
                                            actualizarNuevoTurno();
                                        }}
                                        sx={{ width: 300 }}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label="Patente semi 2 (opcional)"
                                            />
                                        )}
                                        value={
                                            nuevoTurno["patenteAcopladoExtra"]
                                        }
                                        defaultValue={
                                            nuevoTurno["patenteAcopladoExtra"]
                                        }
                                    />
                                </Box>
                                <Box
                                    gap={5}
                                    sx={{
                                        display: "flex",
                                        flexDirection: "row",
                                        alignItems: "center",
                                        justifyContent: "center",
                                    }}
                                >
                                    <CustomButtom
                                        onClick={() => handleClick("confirmar")}
                                        title="Confirmar"
                                    />
                                    <Button
                                        onClick={() => handleClick("rechazar")}
                                        color="error"
                                    >
                                        Rechazar
                                    </Button>

                                </Box>
                                <Dialog
                                    open={openDialogDelete}
                                    onClose={handleCloseDialog}
                                    maxWidth="sm"
                                    fullWidth
                                >
                                    <DeleteTurno
                                        idTurno={idTurno}
                                        handleCloseDialog={handleCloseDialog}
                                        handleClose={handleClose}
                                        refreshCupos={refreshCupos}
                                    />
                                </Dialog>
                            </Box>
                        </CardActions>
                    </Box>
                </Box>
            </DialogContent>
        </Dialog>
    );
}
