import * as React from "react";
import {
    DataGrid,
    GridColDef,
    GridRowModes,
    GridRowsProp,
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
import SettingsIcon from "@mui/icons-material/Settings";
import { camiones } from "./listacamiones"; // Importar los datos de listacamiones.ts
import { GridRowModesModel } from "@mui/x-data-grid";
import {
    GridToolbarContainer,
    GridToolbarExport,
    GridToolbarColumnsButton,
    GridToolbarFilterButton,
} from "@mui/x-data-grid";
import { Add } from "@mui/icons-material";
import { PatternFormat } from "react-number-format";

interface EditToolbarProps {
    setRows: (newRows: (oldRows: GridRowsProp) => GridRowsProp) => void;
    setRowModesModel: (
        newModel: (oldModel: GridRowModesModel) => GridRowModesModel
    ) => void;
    onAdd: () => void; // Nueva prop para manejar el diálogo de agregar
}

function EditToolbar(props: EditToolbarProps) {
    const { setRows, setRowModesModel, onAdd } = props;

    return (
        <GridToolbarContainer>
            <Button color="primary" startIcon={<Add />} onClick={onAdd}>
                Agregar camión
            </Button>
            <GridToolbarFilterButton />
            <GridToolbarExport />
            <GridToolbarColumnsButton />
        </GridToolbarContainer>
    );
}
export default function Camiones() {
    const [rows, setRows] = React.useState(camiones);
    const [open, setOpen] = React.useState(false);
    const [isEditMode, setIsEditMode] = React.useState(false);
    const [selectedRow, setSelectedRow] = React.useState<any>(null);
    const [editedRow, setEditedRow] = React.useState<any>(null);
    const [errorMessage, setErrorMessage] = React.useState("");

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
        setErrorMessage(""); // Limpiar mensaje de error al cerrar
    };

    const handleSave = () => {
        if (editedRow) {
            // Verificar si el valor ingresado cumple con los formatos "LLLNNN" o "LLNNNLL"
            if (!regex.test(editedRow.patente)) {
                setErrorMessage("Ingresaste mal la patente!");
                return; // Salir si la patente no es válida
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
        { field: "patente", headerName: "Patente", width: 150 },
        { field: "urlRTO", headerName: "URL RTO", width: 200 },
        {
            field: "urlPolizaSeguro",
            headerName: "URL Póliza de Seguro",
            width: 200,
        },
        { field: "urlRuta", headerName: "URL Ruta", width: 200 },
        {
            field: "edit",
            headerName: "Edit",
            width: 100,
            renderCell: (params) => (
                <SettingsIcon
                    onClick={() => handleOpen(params.row)}
                    style={{ cursor: "pointer", color: "#1976d2" }}
                />
            ),
        },
    ];

    return (
        <>
            <Box margin="10px" sx={{ height: "100%", width: "100%" }}>
                <DataGrid
                    rows={rows}
                    columns={columns}
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
        </>
    );
}
