/* eslint-disable @typescript-eslint/no-explicit-any */
//import { DataGrid, GridColDef } from "@mui/x-data-grid";
//import { Box, CircularProgress, Dialog, DialogContent, DialogTitle, Typography } from "@mui/material";
//import BorderColorIcon from "@mui/icons-material/BorderColor";
//import { ContextoGeneral } from "../../Contexto";
//import { useContext, useEffect, useState } from "react";
//import { EditToolbar } from "../../botones/EditToolbar";
/*
export default function Camiones() {
    const [ open, setOpen ] = useState(false);
    const [ camionSeleccionado, setCamionSeleccionado ] = useState<any>(null);
    const { backendURL, theme } = useContext(ContextoGeneral);
    const [ camiones, setCamiones ] = useState<any[]>([]);
    const [ estadoCarga, setEstadoCarga ] = useState("Cargando");

    const refreshCamiones = () => {
        fetch(`${backendURL}/camiones`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "ngrok-skip-browser-warning": "true",
            },
        })
            .then((response) => response.json())
            .then((data) => {
                setCamiones(data);
                setEstadoCarga("Cargado");
                console.log(data);
            })
            .catch(() =>
                console.error("Error al obtener las tiposAcoplados disponibles")
            );
    };
    useEffect(() => {
        refreshCamiones();
    }, []);

    const handleOpen = (camion: any) => {
        if (camion) {
            setCamionSeleccionado(camion);
        }
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setCamionSeleccionado(null);
    };

    // A partir de aca definimos las columnas
    const fields = ["patente", "urlRTO", "urlPolizaSeguro", "urlRuta"];
    const headerNames = [
        "Patente",
        "URL RTO",
        "URL Póliza de Seguro",
        "URL Ruta",
    ];
    const columns: GridColDef[] = fields.map((field, index) => ({
        field: field,
        headerName: headerNames[index],
        flex: 1,
        renderHeader: () => (
            <strong style={{ color: theme.colores.grisOscuro }}>
                {headerNames[index]}
            </strong>
        ),
    }));
    // Esta la definimos aparte porque renderiza un componente adentro.
    columns.push({
        field: "edit",
        headerName: "Edit",
        width: 100,
        renderHeader: () => (
            <strong style={{ color: theme.colores.grisOscuro }}>Editar</strong>
        ),
        renderCell: (params) => (
            <BorderColorIcon
                onClick={() => handleOpen(params.row)}
                fontSize="small"
                style={{ cursor: "pointer", color: theme.colores.azul }}
            />
        ),
    });

    return (
        <>
            <Box
                sx={{
                    backgroundColor: theme.colores.grisClaro,
                    height: "82vh",
                    width: "100%",
                    padding: 3,
                }}
            >
                <Box margin="10px" sx={{ height: "90%", width: "100%" }}>
                    {estadoCarga === "Cargando" && (
                        <Box
                            display={"flex"}
                            flexDirection={"row"}
                            width={"100%"}
                            height={"100%"}
                            justifyContent={"center"}
                            alignItems={"center"}
                            gap={3}
                        >
                            <CircularProgress
                                sx={{
                                    padding: "5px",
                                    width: "30px",
                                    height: "30px",
                                }}
                            />
                            <Typography variant="h5">
                                <b>Cargando...</b>
                            </Typography>
                        </Box>
                    )}
                    {estadoCarga === "Cargado" && (
                        <DataGrid
                            rows={camiones.map((camion) => ({
                                patente: camion.patente,
                                urlRTO: camion.urlRTO || "No especificado",
                                urlPolizaSeguro:
                                    camion.urlPolizaSeguro || "No especificado",
                                urlRuta: camion.urlRuta || "No especificado",
                            }))}
                            columns={columns}
                            getRowId={(row) => row.patente}
                            sx={{
                                "& .MuiDataGrid-columnHeader": {
                                    backgroundColor: theme.colores.grisClaro,
                                    color: theme.colores.grisOscuro,
                                },
                                border: "none",
                            }}
                            slots={{
                                toolbar: (props) => (
                                    <EditToolbar
                                        setRows={function (): void {
                                            throw new Error(
                                                "Function not implemented."
                                            );
                                        }}
                                        setRowModesModel={function (): void {
                                            throw new Error(
                                                "Function not implemented."
                                            );
                                        }}
                                        {...props}
                                        onAdd={() => handleOpen(null)}
                                        name = "Camion"
                                    />
                                ),
                            }}
                        />
                    )}
                    <Dialog open={open} onClose={handleClose}>
                        <DialogTitle>
                            {camionSeleccionado
                                ? "Editar camion"
                                : "Crear camion"}
                        </DialogTitle>
                        <DialogContent>
                            <CreadorCamiones
                                camionSeleccionado={camionSeleccionado}
                                handleClose={handleClose}
                                camiones={camiones}
                                setCamiones={setCamiones}
                            />
                        </DialogContent>
                    </Dialog>
                </Box>
            </Box>
        </>
    );
}
*/
import TablaTemplate from "../../tablas/TablaTemplate";
//import { ContextoGeneral } from "../Contexto";
import CreadorCamiones from "./CreadorCamiones";

export default function Choferes() {
    //const { backendURL } = useContext(ContextoGeneral);

    // Aca definis los fields del json que mandan del back y abajo los nombres de las columnas
    const fields = ["patente", "urlRTO", "urlPolizaSeguro", "urlRuta"];
    const headerNames = [
        "Patente",
        "URL RTO",
        "URL Póliza de Seguro",
        "URL Ruta",
    ];

    return (
        <TablaTemplate
            titulo="Camiones"
            entidad="camion"
            endpoint="camiones"
            fields={fields}
            headerNames={headerNames}
            DialogoCreador={CreadorCamiones}
        />
    );
}