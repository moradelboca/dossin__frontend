import * as React from "react";
import Box from "@mui/material/Box";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import { useState, useEffect, useContext } from "react";
import { ContextoGeneral } from "../../Contexto";
import Autocomplete from "@mui/material/Autocomplete";
import { TextField } from "@mui/material";
import { CustomButtom } from "../../botones/CustomButtom";

interface CreadorProps {
    fecha?: string;
    idCarga?: any;
    refreshCupos?: any;
    handleCloseDialog?: any;
}

export default function CreadorTurno(props: CreadorProps) {
    const { idCarga, fecha, refreshCupos, handleCloseDialog } = props;
    const { backendURL } = useContext(ContextoGeneral);
    const [choferes, setChoferes] = useState<any[]>([]);
    const [patentesCamiones, setPatentesCamiones] = useState<any[]>([]);
    const [patentesAcoplados, setPatentesAcoplados] = useState<any[]>([]);
    const [empresasTransportistas, setEmpresasTransportistas] = useState<any[]>(
        []
    );
    const [choferSeleccionado, setChoferSeleccionado] = useState<any | null>(
        null
    );
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

    const handleClickGuardar = () => {
        setError(false);
        if (
            !choferSeleccionado ||
            !patenteCamionSeleccionada ||
            !patenteAcopladoSeleccionada ||
            !empresaTransportistaSeleccionada
        ) {
            setError(true);
            return;
        }
        const turno = {
            cuilChofer: choferSeleccionado,
            patenteCamion: patenteCamionSeleccionada,
            cuitEmpresa: empresaTransportistaSeleccionada,
            patenteAcoplado: patenteAcopladoSeleccionada,
            patenteAcopladoExtra: patenteAcopladoSeleccionadaExtra,
            idEstado: 1,
        };
        fetch(`${backendURL}/cargas/${idCarga}/cupos/${fecha}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(turno),
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
            })
            .catch((e) => console.error(e));
    };
    return (
        <React.Fragment>
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
                        sx={{ color: "#163660" }} // Cambiar color a azul
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
                                onChange={(_e, v: any) =>
                                    setChoferSeleccionado(v.split(" - ")[1])
                                }
                                sx={{ width: 300 }}
                                renderInput={(params) => (
                                    <TextField
                                        error={error && !choferSeleccionado}
                                        {...params}
                                        label="Cuil chofer"
                                    />
                                )}
                            />
                            <Autocomplete
                                disablePortal
                                options={patentesCamiones.map(
                                    (patenteCamion) => patenteCamion.patente
                                )}
                                onChange={(_e, v) =>
                                    setPatenteCamionSeleccionada(v)
                                }
                                sx={{ width: 300 }}
                                renderInput={(params) => (
                                    <TextField
                                        error={
                                            error && !patenteCamionSeleccionada
                                        }
                                        {...params}
                                        label="Patente camion"
                                    />
                                )}
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
                                onChange={(_e, v: any) =>
                                    setEmpresaTransportistaSeleccionada(
                                        v.split(" - ")[1]
                                    )
                                }
                                sx={{ width: 300 }}
                                renderInput={(params) => (
                                    <TextField
                                        error={
                                            error &&
                                            !empresaTransportistaSeleccionada
                                        }
                                        {...params}
                                        label="Cuit empresa"
                                    />
                                )}
                            />
                            <Autocomplete
                                disablePortal
                                options={patentesAcoplados.map(
                                    (patenteAcoplado) =>
                                        patenteAcoplado.patente.toString()
                                )}
                                onChange={(_e, v) =>
                                    setPatenteAcopladoSeleccionada(v)
                                }
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
                                onChange={(_e, v) =>
                                    setPatenteAcopladoSeleccionadaExtra(v)
                                }
                                sx={{ width: 300 }}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Patente semi 2 (opcional)"
                                    />
                                )}
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
                                onClick={handleClickGuardar}
                                title="Confirmar"
                            />
                        </Box>
                    </Box>
                </CardActions>
            </Box>
        </React.Fragment>
    );
}
