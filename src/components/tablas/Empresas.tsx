import * as React from "react";
import {
    DataGrid,
    GridColDef,
    GridRowModes,
    GridSlots,
    GridToolbar,
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
import { empresas } from "./listaempresas"; // Importar los datos de empresas.ts
import { GridRowsProp } from "@mui/x-data-grid";
import { GridRowModesModel } from "@mui/x-data-grid";
import { GridToolbarContainer } from "@mui/x-data-grid";
import { DomainAdd } from "@mui/icons-material";
import { GridToolbarFilterButton } from "@mui/x-data-grid";
import { GridToolbarExport } from "@mui/x-data-grid";
import { GridToolbarColumnsButton } from "@mui/x-data-grid";
import { PatternFormat } from "react-number-format";
import AutocompletarPais from "../autocompletar/AutocompletarPais";

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
            <Button color="primary" startIcon={<DomainAdd />} onClick={onAdd}>
                Agregar Empresa
            </Button>
            <GridToolbarFilterButton />
            <GridToolbarExport />
            <GridToolbarColumnsButton />
        </GridToolbarContainer>
    );
}
interface CustomProps {
    onChange: (event: { target: { name: string; value: string } }) => void;
    name: string;
}
const CuilFormat = React.forwardRef<any, CustomProps>(
    function CuilFormat(props, ref) {
        const { onChange, ...other } = props;

        return (
            <PatternFormat
                {...other}
                getInputRef={ref}
                format="##-########-#"
                mask="_" // Puedes personalizar la máscara que desees
                onValueChange={(values) => {
                    // Verifica si el valor es negativo
                    if (Number(values.value) < 0) {
                        return; // No hacer nada si el valor es negativo
                    }

                    onChange({
                        target: {
                            name: props.name,
                            value: values.value,
                        },
                    });
                }}
            />
        );
    }
);
const NumeroFormat = React.forwardRef<any, CustomProps>(
    function NumeroFormat(props, ref) {
        const { onChange, ...other } = props;

        return (
            <PatternFormat
                {...other}
                getInputRef={ref}
                format="##########"
                mask="_" // Puedes personalizar la máscara que desees
                onValueChange={(values) => {
                    // Verifica si el valor es negativo
                    if (Number(values.value) < 0) {
                        return; // No hacer nada si el valor es negativo
                    }

                    onChange({
                        target: {
                            name: props.name,
                            value: values.value,
                        },
                    });
                }}
            />
        );
    }
);

export default function Empresas() {
    const [rows, setRows] = React.useState(empresas); // Usar los datos importados
    const [open, setOpen] = React.useState(false);
    const [isEditMode, setIsEditMode] = React.useState(false);
    const [selectedRow, setSelectedRow] = React.useState<any>(null);
    const [editedRow, setEditedRow] = React.useState<any>(null);

    const handleOpen = (row: any) => {
        setSelectedRow(row);
        setEditedRow({ ...row }); // Hacer una copia de la fila seleccionada
        setIsEditMode(true);
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setIsEditMode(false); // Resetear el estado al cerrar
    };

    const handleSave = () => {
        if (isEditMode) {
            // Actualizar la fila en el estado
            setRows((prevRows) =>
                prevRows.map((row) =>
                    row.id === selectedRow.id ? editedRow : row
                )
            );
        } else {
            // Agregar nueva fila
            const newId = Math.max(...rows.map((row) => row.id)) + 1; // Generar un nuevo ID
            setRows((prevRows) => [...prevRows, { ...editedRow, id: newId }]);
        }
        handleClose();
    };

    const handleAddClick = () => {
        setEditedRow({
            cuit: "",
            razonSocial: "",
            nombreFantasia: "",
            idUbicacion: "",
            numeroCel: "",
            urlConstanciaAfip: "",
            urlConstanciaCbu: "",
            email: "",
        });
        setIsEditMode(false);
        setOpen(true);
    };

    const columns: GridColDef[] = [
        { field: "cuit", headerName: "Cuit", width: 150 },
        { field: "razonSocial", headerName: "Razon Social", width: 150 },
        { field: "nombreFantasia", headerName: "Nombre Fantasia", width: 150 },
        { field: "idUbicacion", headerName: "ID Ubicacion", width: 130 },
        { field: "numeroCel", headerName: "Número Celular", width: 150 },
        {
            field: "urlConstanciaAfip",
            headerName: "URL Constancia AFIP",
            width: 200,
        },
        {
            field: "urlConstanciaCbu",
            headerName: "URL Constancia CBU",
            width: 200,
        },
        { field: "email", headerName: "Email", width: 200 },
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
            <Typography variant="h5" component="div" sx={{ color: "#163660" }}>
                Empresas
            </Typography>
            <Box margin="10px" sx={{ height: "80%", width: "100%" }}>
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
                                label="Cuit"
                                name="numberformat"
                                id="formatted-numberformat-input"
                                fullWidth
                                variant="outlined"
                                slotProps={{
                                    input: {
                                        inputComponent: CuilFormat as any,
                                    },
                                }}
                                value={editedRow?.cuit || ""}
                                onChange={(e) =>
                                    setEditedRow({
                                        ...editedRow,
                                        cuit: e.target.value,
                                    })
                                }
                            />
                        </Stack>
                        <TextField
                            margin="dense"
                            label="Razon Social"
                            type="text"
                            fullWidth
                            variant="outlined"
                            value={editedRow?.razonSocial || ""}
                            onChange={(e) =>
                                setEditedRow({
                                    ...editedRow,
                                    razonSocial: e.target.value,
                                })
                            }
                        />
                        <TextField
                            margin="dense"
                            label="Nombre Fantasia"
                            type="text"
                            fullWidth
                            variant="outlined"
                            value={editedRow?.nombreFantasia || ""}
                            onChange={(e) =>
                                setEditedRow({
                                    ...editedRow,
                                    nombreFantasia: e.target.value,
                                })
                            }
                        />
                        <Box
                            display="flex"
                            flexDirection="row"
                            gap={2}
                            alignContent={"center"}
                            alignItems={"center"}
                            marginTop={2}
                            marginBottom={1}
                        >
                            <Box width={"100px"}>
                                <AutocompletarPais />
                            </Box>
                            <>-</>
                            <Stack width="400px" direction="row" spacing={2}>
                                <TextField
                                    margin="dense"
                                    label="Numero"
                                    name="numberformat"
                                    id="formatted-numberformat-input"
                                    fullWidth
                                    variant="outlined"
                                    slotProps={{
                                        input: {
                                            inputComponent: NumeroFormat as any,
                                        },
                                    }}
                                    value={editedRow?.numeroCel || ""}
                                    onChange={(e) =>
                                        setEditedRow({
                                            ...editedRow,
                                            numeroCel: e.target.value,
                                        })
                                    }
                                />
                            </Stack>
                        </Box>
                        <TextField
                            margin="dense"
                            label="Email"
                            type="email"
                            fullWidth
                            variant="outlined"
                            value={editedRow?.email || ""}
                            onChange={(e) =>
                                setEditedRow({
                                    ...editedRow,
                                    email: e.target.value,
                                })
                            }
                        />
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
