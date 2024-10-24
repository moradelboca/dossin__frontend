import { Box, Grid2 as Grid, Typography } from "@mui/material";
import { CustomBotonCamion } from "../CustomBotonCamion";
import { useState, useEffect, useContext } from "react";
import { ContextoGeneral } from "../../Contexto";
import { ContextoStepper } from "../creadores/CrearCargaStepper";

export default function SelectorDeAcoplados() {
    const { backendURL } = useContext(ContextoGeneral);
    const { datosSinCompletar } = useContext(ContextoStepper);
    const [tiposAcoplados, setTiposAcoplados] = useState<any[]>([]);

    useEffect(() => {
        fetch(`${backendURL}/acoplados/tiposacoplados`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "ngrok-skip-browser-warning": "true",
            },
        })
            .then((response) => response.json())
            .then((data) => setTiposAcoplados(data))
            .catch(() =>
                console.error("Error al obtener las tiposAcoplados disponibles")
            );
    }, []);

    const imagenes: any = [
        { nombre: "Batea", imagen: "https://i.imgur.com/KmmClLu.png" },
        { nombre: "Semirremolque", imagen: "https://i.imgur.com/fUnL2CF.png" },
        { nombre: "Sider", imagen: "https://i.imgur.com/JFHczdM.png" },
        { nombre: "Equipo", imagen: "https://i.imgur.com/UMkk15q.png" },
        { nombre: "Tolva", imagen: "https://i.imgur.com/UbJRJjz.png" },
        { nombre: "Bitren", imagen: "https://i.imgur.com/3kZfptL.png" },
        { nombre: "Carreton", imagen: "https://i.imgur.com/rJXPRGw.png" },
        { nombre: "PortaCont", imagen: "https://i.imgur.com/VNQNsnN.png" },
    ];
    return (
        <Box>
            <Grid
                container
                sx={{
                    maxWidth: 800,
                    margin: "0",
                    gap: "15px",
                }}
            >
                {tiposAcoplados.map((tipoAcoplado) => {
                    const imagenSeleccionada = imagenes.find(
                        (imagen: any) => imagen.nombre === tipoAcoplado.nombre
                    );

                    return (
                        <CustomBotonCamion
                            key={tipoAcoplado.id}
                            imageSrc={
                                imagenSeleccionada
                                    ? imagenSeleccionada.imagen
                                    : ""
                            }
                            title={tipoAcoplado.nombre}
                            id={tipoAcoplado.id}
                        />
                    );
                })}
            </Grid>
            {datosSinCompletar ? (
                <Typography color="red">
                    Debes seleccionar al menos un tipo de acoplado!
                </Typography>
            ) : null}
        </Box>
    );
}
