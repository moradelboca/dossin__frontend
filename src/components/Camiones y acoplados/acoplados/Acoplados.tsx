/* eslint-disable @typescript-eslint/no-explicit-any */
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { Box, CircularProgress, Dialog, DialogContent, DialogTitle, Typography } from "@mui/material";
import { ContextoGeneral } from "../../Contexto";
import BorderColorIcon from "@mui/icons-material/BorderColor";
import { useContext, useEffect, useState } from "react";
import CreadorAcoplados from "./CreadorAcoplados";
import { EditToolbar } from "../../botones/EditToolbar";

export default function Acoplados() {
    const [ open, setOpen ] = useState(false);
    const [ acopladoSeleccionado, setAcopladoSeleccionado ] = useState<any>(null);
    const { backendURL, theme } = useContext(ContextoGeneral);
    const [ acoplados, setAcoplados ] = useState<any[]>([]);
    const [ estadoCarga, setEstadoCarga ] = useState("Cargando");

    const refreshAcoplados = () => {
        fetch(`${backendURL}/acoplados`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "ngrok-skip-browser-warning": "true",
            },
        })
            .then((response) => response.json())
            .then((data) => {
                setAcoplados(data);
                setEstadoCarga("Cargado");
            })
            .catch(() =>
                console.error("Error al obtener las tiposAcoplados disponibles")
            );
    };

    useEffect(() => {
        refreshAcoplados();
    }, []);

    const handleOpen = (acoplado: any) => {
        if (acoplado) {
            setAcopladoSeleccionado(acoplado);
        }
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setAcopladoSeleccionado(null);
    };

    // A partir de aca definimos las columnas
    const fields = [
        "patente",
        "tipoAcoplado",
        "urlRTO",
        "urlPolizaSeguro",
        "urlRuta",
    ];
    const headerNames = [
        "Patente",
        "Tipo Acoplado",
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
                            rows={acoplados.map((acoplado) => ({
                                patente: acoplado.patente,
                                tipoAcoplado: acoplado.tipoAcoplado,
                                urlRTO: acoplado.urlRTO || "No especificado",
                                urlPolizaSeguro:
                                    acoplado.urlPolizaSeguro ||
                                    "No especificado",
                                urlRuta: acoplado.urlRuta || "No especificado",
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
                                        name = "Acoplado"
                                    />
                                ),
                            }}
                        />
                    )}
                    <Dialog open={open} onClose={handleClose}>
                        <DialogTitle>
                            {acopladoSeleccionado
                                ? "Editar acoplado"
                                : "Crear acoplado"}
                        </DialogTitle>
                        <DialogContent>
                            <CreadorAcoplados
                                acopladoSeleccionado={acopladoSeleccionado}
                                handleClose={handleClose}
                                acoplados={acoplados}
                                setAcoplados={setAcoplados}
                            />
                        </DialogContent>
                    </Dialog>
                </Box>
            </Box>
        </>
    );
}
