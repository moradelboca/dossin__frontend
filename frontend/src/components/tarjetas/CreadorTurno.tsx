import * as React from "react";
import Box from "@mui/material/Box";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import { useState, useEffect, useContext } from "react";
import { ContextoGeneral } from "../Contexto";
import Autocomplete from "@mui/material/Autocomplete";
import { TextField } from "@mui/material";
import { CustomButtom } from "../botones/CustomButtom";

interface Props {
    datosNuevaCarga?: any;
}

export default function Turno({ datosNuevaCarga }: Props) {
    const { backendURL } = useContext(ContextoGeneral);
    const [cargamentos, setCargamentos] = useState<any[]>([]);
    const [patentesCamiones, setPatentesCamiones] = useState<any[]>([]);

    useEffect(() => {
        fetch(`${backendURL}/cargas/cargamentos`)
            .then((response) => response.json())
            .then((car) => {
                setCargamentos(car);
            })
            .catch(() =>
                console.error("Error al obtener los Cargamentos disponibles")
            );

        fetch(`${backendURL}/camiones`)
            .then((response) => response.json())
            .then((p) => setPatentesCamiones(p))
            .catch(() =>
                console.error("Error al obtener los Proveedores disponibles")
            );
    }, []);

    const cargamentosStrings = cargamentos.map(
        (cargamento) => cargamento.nombre
    );
    const cargamentosIds = cargamentos.map((cargamento) => cargamento.id);
    const seleccionarCargamento = (event: any, newValue: string | null) => {
        if (newValue) {
            const index = cargamentosStrings.indexOf(newValue);
            datosNuevaCarga["idCargamento"] = cargamentosIds[index];
        }
    };
    const patentesCamionesStrings = patentesCamiones.map(
        (patenteCamion) => patenteCamion.patente
    );

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
                                options={cargamentosStrings}
                                onChange={seleccionarCargamento}
                                sx={{ width: 300 }}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Cuil chofer"
                                    />
                                )}
                            />
                            <Autocomplete
                                disablePortal
                                options={patentesCamionesStrings}
                                sx={{ width: 300 }}
                                renderInput={(params) => (
                                    <TextField
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
                                options={cargamentosStrings}
                                onChange={seleccionarCargamento} // Maneja el cambio de cargamento
                                sx={{ width: 300 }}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Cuit empresa"
                                    />
                                )}
                            />
                            <Autocomplete
                                disablePortal
                                options={cargamentosStrings}
                                onChange={seleccionarCargamento} // Maneja el cambio de cargamento
                                sx={{ width: 300 }}
                                renderInput={(params) => (
                                    <TextField
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
                                options={cargamentosStrings}
                                onChange={seleccionarCargamento} // Maneja el cambio de cargamento
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
                            <CustomButtom title="Confirmar" />
                        </Box>
                    </Box>
                </CardActions>
            </Box>
        </React.Fragment>
    );
}

export function CreadorTurno({ datosNuevaCarga }: Props) {
    return (
        <Box sx={{ height: "570px", width: "720px" }}>
            <Turno datosNuevaCarga={datosNuevaCarga} />
        </Box>
    );
}
