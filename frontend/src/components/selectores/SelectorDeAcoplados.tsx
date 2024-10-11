import { Grid2 as Grid } from "@mui/material";
import { CustomBotonCamion } from "../botones/CustomBotonCamion";
import { useState, useEffect, useContext } from "react";
import { ContextoGeneral } from "../Contexto";

interface props {
    datosNuevaCarga: any;
}

export default function SelectorDeAcoplados(selectorProps: props) {
    const { datosNuevaCarga } = selectorProps;
    const { backendURL } = useContext(ContextoGeneral);
    const [tiposAcoplados, setTiposAcoplados] = useState<any[]>([]);
    const [tiposAcopladosSeleccionados] = useState([]);

    useEffect(() => {
        return () => {
            datosNuevaCarga["idsTiposAcoplados"] = tiposAcopladosSeleccionados;
        };
    }, []);

    useEffect(() => {
        fetch(`${backendURL}/tiposacoplados`)
            .then((response) => response.json())
            .then((tiposAcoplados) => setTiposAcoplados(tiposAcoplados))
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
                            imagenSeleccionada ? imagenSeleccionada.imagen : ""
                        } // Si se encuentra la imagen, la mostramos, si no, cadena vacía
                        title={tipoAcoplado.nombre}
                        array={tiposAcopladosSeleccionados}
                        id={tipoAcoplado.id} // Pasamos el id del acoplado
                    />
                );
            })}
        </Grid>
    );
}
