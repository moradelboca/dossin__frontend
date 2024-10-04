import { Grid2 as Grid } from "@mui/material";
import { CustomBotonCamion } from "./botones/CustomBotonCamion";
import { useState, useEffect, useContext } from "react";
import { ContextoGeneral } from "./Contexto";

interface props {
    datosNuevaCarga: any;
}

export default function SelectorDeAcoplados(selectorProps: props) {
    const { datosNuevaCarga } = selectorProps;
    const { backendURL } = useContext(ContextoGeneral);
    const [tiposAcoplados, setTiposAcoplados] = useState<any[]>([]);
    const tiposAcopladosSeleccionados: number[] = [];
    let tiposAcopladosStrings: string[];

    useEffect(() => {
        return () => {
            datosNuevaCarga["idsAcopladosPermitidos"] = tiposAcopladosIds;
        };
    }, []);

    useEffect(() => {
        fetch(`${backendURL}/tiposacoplados`)
            .then((response) => response.json())
            .then((tiposAcoplados) => setTiposAcoplados(tiposAcoplados))
            .catch(() =>
                console.error("Error al obtener las tiposAcoplados disponibles")
            );
    }, [backendURL]);

    tiposAcopladosStrings = tiposAcoplados.map((tipoAcoplado) => {
        return `${tipoAcoplado.nombre}`;
    });
    const tiposAcopladosIds = tiposAcoplados.map(
        (tipoAcoplado) => tipoAcoplado.id
    );

    const imagenes = [
        "https://i.imgur.com/KmmClLu.png",
        "https://i.imgur.com/fUnL2CF.png",
        "https://i.imgur.com/JFHczdM.png",
        "https://i.imgur.com/UMkk15q.png",
        "https://i.imgur.com/UbJRJjz.png",
        "https://i.imgur.com/3kZfptL.png",
        "https://i.imgur.com/rJXPRGw.png",
        "https://i.imgur.com/VNQNsnN.png",
    ];
    return (
        <Grid
            container
            sx={{
                maxWidth: 800,
                margin: "0",
                gap: "15px",
            }}
        >
            {tiposAcopladosStrings.map((tipoAcoplado, indice) => (
                <CustomBotonCamion
                    key={tipoAcoplado}
                    imageSrc={imagenes[indice]}
                    title={tipoAcoplado}
                    array={tiposAcopladosSeleccionados}
                    id={indice + 1} // Pasamos el `id` que comienza en 1
                />
            ))}
        </Grid>
    );
}
