import * as React from "react";
import {
    DataGrid,
    GridColDef,
    GridRowsProp,
    GridToolbarQuickFilter,
} from "@mui/x-data-grid";
import { Box, Button, Dialog, DialogContent, DialogTitle } from "@mui/material";
import { GridRowModesModel } from "@mui/x-data-grid";
import {
    GridToolbarContainer,
    GridToolbarExport,
    GridToolbarColumnsButton,
    GridToolbarFilterButton,
} from "@mui/x-data-grid";
import { Add } from "@mui/icons-material";
import BorderColorIcon from "@mui/icons-material/BorderColor";
import { ContextoGeneral } from "../../Contexto";
import CreadorCamiones from "./CreadorCamiones";
import { useEffect } from "react";

interface EditToolbarProps {
    setRows: (newRows: (oldRows: GridRowsProp) => GridRowsProp) => void;
    setRowModesModel: (
        newModel: (oldModel: GridRowModesModel) => GridRowModesModel
    ) => void;
    onAdd: () => void; // Nueva prop para manejar el diálogo de agregar
}

function EditToolbar(props: EditToolbarProps) {
    const { onAdd } = props;
    const { theme } = React.useContext(ContextoGeneral);

    return (
        <GridToolbarContainer sx={{ marginBottom: 1 }}>
            <Box
                sx={{
                    flexGrow: 1,
                    display: "flex",
                    justifyContent: "flex-start",
                }}
            >
                <GridToolbarQuickFilter />
            </Box>
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "flex-end",
                    marginRight: 3,
                }}
            >
                <Button
                    color="primary"
                    startIcon={<Add />}
                    onClick={onAdd}
                    sx={{ color: theme.colores.azul }}
                >
                    Agregar camión
                </Button>
                <GridToolbarFilterButton
                    slotProps={{
                        button: {
                            sx: {
                                color: theme.colores.azul,
                            },
                        },
                    }}
                />
                <GridToolbarExport
                    slotProps={{
                        button: {
                            sx: {
                                color: theme.colores.azul,
                            },
                        },
                    }}
                />
                <GridToolbarColumnsButton
                    slotProps={{
                        button: {
                            sx: {
                                color: theme.colores.azul,
                            },
                        },
                    }}
                />
            </Box>
        </GridToolbarContainer>
    );
}
export default function Camiones() {
    const [open, setOpen] = React.useState(false);
    const [camionSeleccionado, setCamionSeleccionado] =
        React.useState<any>(null);
    const { backendURL, theme } = React.useContext(ContextoGeneral);
    const [camiones, setCamiones] = React.useState<any[]>([]);

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
                                />
                            ),
                        }}
                    />
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
