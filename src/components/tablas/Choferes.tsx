import * as React from "react";
import { DataGrid, GridColDef, GridToolbarQuickFilter } from "@mui/x-data-grid";
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
import { GridRowsProp } from "@mui/x-data-grid";
import { GridRowModesModel } from "@mui/x-data-grid";
import { GridToolbarContainer } from "@mui/x-data-grid";
import { GridToolbarFilterButton } from "@mui/x-data-grid";
import { GridToolbarExport } from "@mui/x-data-grid";
import { GridToolbarColumnsButton } from "@mui/x-data-grid";
import BorderColorIcon from "@mui/icons-material/BorderColor";
import AutocompletarPais from "../cargas/autocompletar/AutocompletarPais";
import { PatternFormat } from "react-number-format";
import { ContextoGeneral } from "../Contexto";
import { PersonAddAlt } from "@mui/icons-material";

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
                    startIcon={<PersonAddAlt />}
                    onClick={onAdd}
                    sx={{ color: theme.colores.azul }}
                >
                    Agregar chofer
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
    const [open, setOpen] = React.useState(false);
    const [isEditMode, setIsEditMode] = React.useState(false);
    const [selectedRow, setSelectedRow] = React.useState<any>(null);
    const [editedRow, setEditedRow] = React.useState<any>(null);
    const { backendURL, theme } = React.useContext(ContextoGeneral);

    const [choferes, setchoferes] = React.useState<any[]>([]);

    React.useEffect(() => {
        fetch(`${backendURL}/choferes`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "ngrok-skip-browser-warning": "true",
            },
        })
            .then((response) => response.json())
            .then((data) => {
                setchoferes(data);
                const formattedData = data.map(
                    (item: {
                        cuil: any;
                        edad: any;
                        nombre: any;
                        urlInti: any;
                        idUbicacion: any;
                        apellido: any;
                        cuitEmpresa: any;
                        numeroCel: any;
                        urlConstanciaCbu: any;
                        urlConstanciaAfip: any;
                        email: any;
                    }) => ({
                        ...item,
                        cuil: item.cuil || "No especificado",
                        edad: item.edad || "No especificado",
                        nombre: item.nombre || "No especificado",
                        urlInti: item.urlInti || "No especificado",
                        idUbicacion: item.idUbicacion || "No especificado",
                        apellido: item.apellido || "No especificado",
                        cuitEmpresa: item.cuitEmpresa || "No especificado",
                        numeroCel: item.numeroCel || "No especificado",
                        urlConstanciaCbu:
                            item.urlConstanciaCbu || "No especificado",
                        urlConstanciaAfip:
                            item.urlConstanciaAfip || "No especificado",
                        email: item.email || "No especificado",
                    })
                );
                setRows(formattedData);
            })
            .catch(() =>
                console.error("Error al obtener las tiposAcoplados disponibles")
            );
    }, []);

    const [rows, setRows] = React.useState(choferes);

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
        {
            field: "cuil",
            headerName: "Cuil",
            flex: 1,
            renderHeader: () => (
                <strong style={{ color: theme.colores.grisOscuro }}>
                    Cuil
                </strong>
            ),
        },
        {
            field: "numeroCel",
            headerName: "Número Celular",
            flex: 1,
            renderHeader: () => (
                <strong style={{ color: theme.colores.grisOscuro }}>
                    Número Celular
                </strong>
            ),
        },
        {
            field: "nombre",
            headerName: "Nombre",
            flex: 1,
            renderHeader: () => (
                <strong style={{ color: theme.colores.grisOscuro }}>
                    Nombre
                </strong>
            ),
        },
        {
            field: "apellido",
            headerName: "Apellido",
            flex: 1,
            renderHeader: () => (
                <strong style={{ color: theme.colores.grisOscuro }}>
                    Apellido
                </strong>
            ),
        },
        {
            field: "edad",
            headerName: "Edad",
            flex: 1,
            renderHeader: () => (
                <strong style={{ color: theme.colores.grisOscuro }}>
                    Edad
                </strong>
            ),
        },
        {
            field: "cuitEmpresa",
            headerName: "Cuit Empresa",
            flex: 1,
            renderHeader: () => (
                <strong style={{ color: theme.colores.grisOscuro }}>
                    Cuit Empresa
                </strong>
            ),
        },
        {
            field: "urlInti",
            headerName: "URL Inti",
            flex: 1,
            renderHeader: () => (
                <strong style={{ color: theme.colores.grisOscuro }}>
                    URL Inti
                </strong>
            ),
        },
        {
            field: "idUbicacion",
            headerName: "ID Ubicacion",
            flex: 1,
            renderHeader: () => (
                <strong style={{ color: theme.colores.grisOscuro }}>
                    ID Ubicacion
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
                    height: "91vh",
                    width: "100%",
                    padding: 3,
                }}
            >
                <Typography
                    variant="h5"
                    component="div"
                    sx={{
                        color: theme.colores.azul,
                        fontWeight: "bold",
                        mb: 2,
                        fontSize: "2rem",
                        pb: 1,
                        marginLeft: 1,
                    }}
                >
                    Choferes
                </Typography>
                <Box margin="10px" sx={{ height: "90%", width: "100%" }}>
                    <DataGrid
                        rows={rows}
                        columns={columns}
                        getRowId={(row) => row.cuil}
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
                                <Stack
                                    width="400px"
                                    direction="row"
                                    spacing={2}
                                >
                                    <TextField
                                        margin="dense"
                                        label="Numero"
                                        name="numberformat"
                                        id="formatted-numberformat-input"
                                        fullWidth
                                        variant="outlined"
                                        slotProps={{
                                            input: {
                                                inputComponent:
                                                    NumeroFormat as any,
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
            </Box>
        </>
    );
}
