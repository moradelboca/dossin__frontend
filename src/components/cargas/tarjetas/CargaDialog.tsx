import { useParams, useNavigate } from "react-router-dom";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import DialogContentText from "@mui/material/DialogContentText";
import { useEffect, useState, useContext } from "react";
import { ContextoGeneral } from "../../Contexto";
import { axiosGet } from "../../../lib/axiosConfig";

export function CargaDialog() {
    const { idCarga } = useParams();
    const navigate = useNavigate();
    const { backendURL } = useContext(ContextoGeneral);
    const [open, setOpen] = useState(false);
    const [carga, setCarga] = useState<any>({});

    useEffect(() => {
        if (idCarga) {
            axiosGet<any>(`cargas/${idCarga}`, backendURL)
                .then((data) => {
                    setOpen(true);
                    setCarga(data);
                    console.log(data);
                })
                .catch(() =>
                    console.error("Error al obtener las cargas disponibles")
                );
        }
    }, [idCarga, backendURL]);

    const handleClickCerrarDialog = () => {
        navigate(`/cargas`);
        setOpen(false);
    };

    return (
        <Dialog open={open} onClose={handleClickCerrarDialog}>
            <DialogTitle textAlign={"center"}>
                {carga.emojiCargamento} Carga N° {carga.id} -{" "}
                {carga.nombreCargamento} {carga.emojiCargamento}
            </DialogTitle>
            <DialogContent>
                <hr />
                <DialogContentText>
                    <b>Tarifa:</b> {carga.tarifa}/{carga.tipoTarifa}{" "}
                    {!carga.incluyeIVA ? "+ IVA" : null}
                </DialogContentText>
                <DialogContentText>
                    <b>Ubicación de carga:</b>
                </DialogContentText>
                <DialogContentText>
                    {carga.ubicacionCargaNombre} - {carga.localidadCargaNombre}{" "}
                    (
                    <a href={carga.urlMapsCarga} target="_blank">
                        {carga.urlMapsCarga}
                    </a>
                    )
                </DialogContentText>
                <DialogContentText>
                    <b>Ubicación de descarga:</b>
                </DialogContentText>
                <DialogContentText>
                    {carga.ubicacionDescargaNombre} -{" "}
                    {carga.localidadDescargaNombre} (
                    <a href={carga.urlMapsDescarga} target="_blank">
                        {carga.urlMapsDescarga}
                    </a>
                    )
                </DialogContentText>
                <DialogContentText>
                    <b>Ubicación de balanza:</b>
                </DialogContentText>
                {carga.ubicacionBalanzaNombre ? (
                    <DialogContentText>
                        {carga.ubicacionDescargaNombre} -{" "}
                        {carga.localidadDescargaNombre} (
                        <a href={carga.urlMapsDescarga} target="_blank">
                            {carga.urlMapsDescarga}
                        </a>
                        )
                    </DialogContentText>
                ) : (
                    <DialogContentText>
                        No se ha especificado una ubicación de balanza
                    </DialogContentText>
                )}
                <DialogContentText>
                    <b>Tipos de acoplados:</b> {carga.tiposDeAcoplados}
                </DialogContentText>
                <DialogContentText>
                    <b>Cantidad de kilómetros:</b> {carga.cantidadKm}
                </DialogContentText>
                <DialogContentText>
                    <b>Fecha mínima de disponibilidad:</b>{" "}
                    {carga.fechaMinimaDisponible}
                </DialogContentText>
                <DialogContentText>
                    <b>Fecha máxima de disponibilidad:</b>{" "}
                    {carga.fechaMaximaDisponible}
                </DialogContentText>
                <DialogContentText>
                    <b>Hora de carga:</b> {carga.horarioCarga}
                </DialogContentText>
                <DialogContentText>
                    <b>Hora de descarga:</b> {carga.horarioDescarga}
                </DialogContentText>
                <hr />
                <DialogContentText>
                    <b>
                        {carga.descripcion ??
                            "No se ha especificado una descripción."}
                    </b>
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClickCerrarDialog}>Cerrar</Button>
            </DialogActions>
        </Dialog>
    );
}
