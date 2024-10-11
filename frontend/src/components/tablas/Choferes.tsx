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
import { choferes } from "./listachoferes"; // Importar los datos de empresas.ts
import { GridRowsProp } from "@mui/x-data-grid";
import { GridRowModesModel } from "@mui/x-data-grid";
import { GridToolbarContainer } from "@mui/x-data-grid";
import { PersonAddAlt } from "@mui/icons-material";
import { GridToolbarFilterButton } from "@mui/x-data-grid";
import { GridToolbarExport } from "@mui/x-data-grid";
import { GridToolbarColumnsButton } from "@mui/x-data-grid";
import { NumericFormat, NumericFormatProps } from "react-number-format";
import AutocompletarPais from "../autocompletar/AutocompletarPais";
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
            <Button
                color="primary"
                startIcon={<PersonAddAlt />}
                onClick={onAdd}
            >
                Agregar chofer
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

const EdadFormat = React.forwardRef<any, CustomProps>(
    function EdadFortmat(props, ref) {
        const { onChange, ...other } = props;

        return (
            <PatternFormat
                {...other}
                getInputRef={ref}
                format="###"
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
export default function Choferes() {
    const [rows, setRows] = React.useState(choferes); // Usar los datos importados
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
        setIsEditMode(false);
    };

    const handleSave = () => {
        if (editedRow) {
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
            cuil: "",
            numeroCel: "",
            nombre: "",
            apellido: "",
            edad: 0,
            cuitEmpresa: "",
            urlInti: "",
            idUbicacion: "",
        });
        setIsEditMode(false);
        setOpen(true);
    };

    const columns: GridColDef[] = [
        { field: "cuil", headerName: "Cuil", width: 150 },
        { field: "numeroCel", headerName: "Número Celular", width: 150 },
        { field: "nombre", headerName: "Nombre", width: 150 },
        { field: "apellido", headerName: "Apellido", width: 150 },
        { field: "edad", headerName: "Edad", width: 130 },
        { field: "cuitEmpresa", headerName: "Cuit Empresa", width: 150 },
        { field: "urlInti", headerName: "URL Inti", width: 200 },
        { field: "idUbicacion", headerName: "ID Ubicacion", width: 130 },
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
                Choferes
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
                                label="Cuil"
                                name="numberformat"
                                id="formatted-numberformat-input"
                                fullWidth
                                variant="outlined"
                                slotProps={{
                                    input: {
                                        inputComponent: CuilFormat as any,
                                    },
                                }}
                                value={editedRow?.cuil || ""}
                                onChange={(e) =>
                                    setEditedRow({
                                        ...editedRow,
                                        cuil: e.target.value,
                                    })
                                }
                            />
                        </Stack>
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
                                            numerocel: e.target.value,
                                        })
                                    }
                                />
                            </Stack>
                        </Box>
                        <TextField
                            margin="dense"
                            label="Nombre"
                            type="text"
                            fullWidth
                            variant="outlined"
                            value={editedRow?.nombre || ""}
                            onChange={(e) =>
                                setEditedRow({
                                    ...editedRow,
                                    nombre: e.target.value,
                                })
                            }
                        />
                        <TextField
                            margin="dense"
                            label="Apellido"
                            type="text"
                            fullWidth
                            variant="outlined"
                            value={editedRow?.apellido || ""}
                            onChange={(e) =>
                                setEditedRow({
                                    ...editedRow,
                                    apellido: e.target.value,
                                })
                            }
                        />
                        <Stack direction="row" spacing={2}>
                            <TextField
                                margin="dense"
                                label="Edad"
                                name="numberformat"
                                id="formatted-numberformat-input"
                                fullWidth
                                variant="outlined"
                                slotProps={{
                                    input: {
                                        inputComponent: EdadFormat as any,
                                    },
                                }}
                                value={editedRow?.edad || ""}
                                onChange={(e) =>
                                    setEditedRow({
                                        ...editedRow,
                                        edad: e.target.value,
                                    })
                                }
                            />
                        </Stack>
                        <TextField
                            margin="dense"
                            label="Cuit Empresa"
                            type="text"
                            fullWidth
                            variant="outlined"
                            value={editedRow?.cuitEmpresa || ""}
                            onChange={(e) =>
                                setEditedRow({
                                    ...editedRow,
                                    cuitEmpresa: e.target.value,
                                })
                            }
                        />
                        <TextField
                            margin="dense"
                            label="URL Inti"
                            type="text"
                            fullWidth
                            variant="outlined"
                            value={editedRow?.urlInti || ""}
                            onChange={(e) =>
                                setEditedRow({
                                    ...editedRow,
                                    urlInti: e.target.value,
                                })
                            }
                        />
                        <TextField
                            margin="dense"
                            label="ID Ubicacion"
                            type="text"
                            fullWidth
                            variant="outlined"
                            value={editedRow?.idUbicacion || ""}
                            onChange={(e) =>
                                setEditedRow({
                                    ...editedRow,
                                    idUbicacion: e.target.value,
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
