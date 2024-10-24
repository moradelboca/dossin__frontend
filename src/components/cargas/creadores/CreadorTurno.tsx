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
}

export default function CreadorTurno(props: CreadorProps) {
    const { idCarga, fecha } = props;
    const { backendURL } = useContext(ContextoGeneral);
    const [choferes, setChoferes] = useState<any[]>([]);
    const [patentesCamiones, setPatentesCamiones] = useState<any[]>([]);
    const [patentesAcoplados, setPatentesAcoplados] = useState<any[]>([]);
    const [empresasTransportistas, setEmpresasTransportistas] = useState<any[]>(
        []
    );
    const [choferSeleccionado, setChoferSeleccionado] = useState<Number | null>(
        null
    );
    const [
        empresaTransportistaSeleccionada,
        setEmpresaTransportistaSeleccionada,
    ] = useState<Number | null>(null);
    const [patenteCamionSeleccionada, setPatenteCamionSeleccionada] = useState<
        string | null
    >(null);
    const [patenteAcopladoSeleccionada, setPatenteAcopladoSeleccionada] =
        useState<string | null>(null);
    const [
        patenteAcopladoSeleccionadaExtra,
        setPatenteAcopladoSeleccionadaExtra,
    ] = useState<string | null>(null);
    const [error, setError] = useState(false);

    useEffect(() => {
        fetch(`${backendURL}/choferes`)
            .then((response) => response.json())
            .then((car) => {
                setChoferes(car);
            })
            .catch(() =>
                console.error("Error al obtener los choferes disponibles")
            );
        fetch(`${backendURL}/empresasTransportistas`)
            .then((response) => response.json())
            .then((e) => {
                setEmpresasTransportistas(e);
            })
            .catch(() =>
                console.error("Error al obtener los choferes disponibles")
            );
        fetch(`${backendURL}/camiones`)
            .then((response) => response.json())
            .then((p) => setPatentesCamiones(p))
            .catch(() =>
                console.error("Error al obtener los patentes disponibles")
            );
        fetch(`${backendURL}/acoplados`)
            .then((response) => response.json())
            .then((a) => setPatentesAcoplados(a))
            .catch(() =>
                console.error("Error al obtener los patentes disponibles")
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
        };
        console.log(turno);
        fetch(`${backendURL}/cargas/${idCarga}/cupos/${fecha}/turnos`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(turno),
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Error al crear la turno");
                }
                response.json();
            })
            .catch(() => {});
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
                                options={choferes.map((chofer) =>
                                    chofer.cuil.toString()
                                )}
                                onChange={(e, v) => setChoferSeleccionado(v)}
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
                                options={patentesCamiones.map((patenteCamion) =>
                                    patenteCamion.patente.toString()
                                )}
                                onChange={(e, v) =>
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
                                options={empresasTransportistas.map((empresa) =>
                                    empresa.cuit.toString()
                                )}
                                onChange={(e, v) =>
                                    setEmpresaTransportistaSeleccionada(v)
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
                                onChange={(e, v) =>
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
                                onChange={(e, v) =>
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
