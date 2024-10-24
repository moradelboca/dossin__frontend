import * as React from "react";
import {
    DataGrid,
    GridColDef,
    GridRowsProp,
    GridToolbarQuickFilter,
} from "@mui/x-data-grid";
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import { GridRowModesModel } from "@mui/x-data-grid";
import {
    GridToolbarContainer,
    GridToolbarExport,
    GridToolbarColumnsButton,
    GridToolbarFilterButton,
} from "@mui/x-data-grid";
import { Add } from "@mui/icons-material";
import BorderColorIcon from "@mui/icons-material/BorderColor";
import { ContextoGeneral } from "../Contexto";

interface EditToolbarProps {
    setRows: (newRows: (oldRows: GridRowsProp) => GridRowsProp) => void;
    setRowModesModel: (
        newModel: (oldModel: GridRowModesModel) => GridRowModesModel
    ) => void;
    onAdd: () => void; // Nueva prop para manejar el diálogo de agregar
}

function EditToolbar(props: EditToolbarProps) {
    const { setRows, setRowModesModel, onAdd } = props;
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
    const [isEditMode, setIsEditMode] = React.useState(false);
    const [selectedRow, setSelectedRow] = React.useState<any>(null);
    const [editedRow, setEditedRow] = React.useState<any>(null);
    const [errorMessage, setErrorMessage] = React.useState("");
    const { backendURL, theme } = React.useContext(ContextoGeneral);
    const [camiones, setCamiones] = React.useState<any[]>([]);

    React.useEffect(() => {
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
                const formattedData = data.map(
                    (item: {
                        patente: any;
                        urlRTO: any;
                        urlPolizaSeguro: any;
                        urlRuta: any;
                    }) => ({
                        ...item,
                        patente: item.patente || "No especificado",
                        urlRTO: item.urlRTO || "No especificado",
                        urlPolizaSeguro:
                            item.urlPolizaSeguro || "No especificado",
                        urlRuta: item.urlRuta || "No especificado",
                    })
                );
                setRows(formattedData);
            })
            .catch(() =>
                console.error("Error al obtener las tiposAcoplados disponibles")
            );
    }, []);

    const [rows, setRows] = React.useState(camiones);

    // Expresión regular que valida los formatos de patente "LLLNNN" o "LLNNNLL"
    const regex = /^([A-Za-z]{3}\d{3}|[A-Za-z]{2}\d{3}[A-Za-z]{2})$/;

    const handleOpen = (row: any) => {
        setSelectedRow(row);
        setEditedRow({ ...row });
        setIsEditMode(true);
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setIsEditMode(false);
        setErrorMessage("");
    };

    const handleSave = () => {
        if (editedRow) {
            if (!regex.test(editedRow.patente)) {
                setErrorMessage("Ingresaste mal la patente!");
                return;
            }

            if (isEditMode) {
                setRows((prevRows) =>
                    prevRows.map((row) =>
                        row.id === selectedRow?.id ? editedRow : row
                    )
                );
            } else {
                const newId = Math.max(...rows.map((row) => row.id)) + 1;
                setRows((prevRows) => [
                    ...prevRows,
                    { ...editedRow, id: newId },
                ]);
            }
        }
        handleClose();
    };

    const handleAddClick = () => {
        setEditedRow({
            id: 0,
            patente: "",
            urlRTO: "",
            urlPolizaSeguro: "",
            urlRuta: "",
        });
        setIsEditMode(false);
        setOpen(true);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target;
        setEditedRow({ ...editedRow, patente: value });
    };

    const columns: GridColDef[] = [
        {
            field: "patente",
            headerName: "Patente",
            flex: 1,
            renderHeader: () => (
                <strong style={{ color: theme.colores.grisOscuro }}>
                    Patente
                </strong>
            ),
        },
        {
            field: "urlRTO",
            headerName: "URL RTO",
            flex: 1,
            renderHeader: () => (
                <strong style={{ color: theme.colores.grisOscuro }}>
                    URL RTO
                </strong>
            ),
        },
        {
            field: "urlPolizaSeguro",
            headerName: "URL Póliza de Seguro",
            flex: 1,
            renderHeader: () => (
                <strong style={{ color: theme.colores.grisOscuro }}>
                    URL Póliza de Seguro
                </strong>
            ),
        },
        {
            field: "urlRuta",
            headerName: "URL Ruta",
            flex: 1,
            renderHeader: () => (
                <strong style={{ color: theme.colores.grisOscuro }}>
                    URL Ruta
                </strong>
            ),
        },
        {
            field: "edit",
            headerName: "Edit",
            width: 100,
            renderHeader: () => (
                <strong style={{ color: theme.colores.grisOscuro }}>
                    Edit
                </strong>
            ),
            renderCell: (params) => (
                <BorderColorIcon
                    onClick={() => handleOpen(params.row)}
                    fontSize="small"
                    style={{ cursor: "pointer", color: theme.colores.azul }}
                />
            ),
        },
    ];

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
                        rows={rows}
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
                                    setRows={function (
                                        newRows: (
                                            oldRows: GridRowsProp
                                        ) => GridRowsProp
                                    ): void {
                                        throw new Error(
                                            "Function not implemented."
                                        );
                                    }}
                                    setRowModesModel={function (
                                        newModel: (
                                            oldModel: GridRowModesModel
                                        ) => GridRowModesModel
                                    ): void {
                                        throw new Error(
                                            "Function not implemented."
                                        );
                                    }}
                                    {...props}
                                    onAdd={handleAddClick}
                                />
                            ),
                        }}
                    />
                    <Dialog open={open} onClose={handleClose}>
                        <DialogTitle>
                            {isEditMode ? "Edit Row" : "Add Row"}
                        </DialogTitle>
                        <DialogContent>
                            <Stack direction="row" spacing={2}>
                                <TextField
                                    margin="dense"
                                    label="Patente"
                                    name="patente"
                                    fullWidth
                                    variant="outlined"
                                    value={editedRow?.patente || ""}
                                    onChange={handleChange}
                                />
                            </Stack>
                            <TextField
                                margin="dense"
                                label="URL RTO"
                                type="text"
                                fullWidth
                                variant="outlined"
                                value={editedRow?.urlRTO || ""}
                                onChange={(e) =>
                                    setEditedRow({
                                        ...editedRow,
                                        urlRTO: e.target.value,
                                    })
                                }
                            />
                            <TextField
                                margin="dense"
                                label="URL Póliza de Seguro"
                                type="text"
                                fullWidth
                                variant="outlined"
                                value={editedRow?.urlPolizaSeguro || ""}
                                onChange={(e) =>
                                    setEditedRow({
                                        ...editedRow,
                                        urlPolizaSeguro: e.target.value,
                                    })
                                }
                            />
                            <TextField
                                margin="dense"
                                label="URL Ruta"
                                type="text"
                                fullWidth
                                variant="outlined"
                                value={editedRow?.urlRuta || ""}
                                onChange={(e) =>
                                    setEditedRow({
                                        ...editedRow,
                                        urlRuta: e.target.value,
                                    })
                                }
                            />
                            {errorMessage && ( // Mostrar mensaje de error si existe
                                <Typography color="#ff3333">
                                    {errorMessage}
                                </Typography>
                            )}
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={handleClose} color="primary">
                                Cancelar
                            </Button>
                            <Button onClick={handleSave} color="primary">
                                Guardar
                            </Button>
                        </DialogActions>
                    </Dialog>
                </Box>
            </Box>
        </>
    );
}
