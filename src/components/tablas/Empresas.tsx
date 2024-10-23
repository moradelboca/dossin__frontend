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
import { empresas } from "./listaempresas";
import { GridRowsProp } from "@mui/x-data-grid";
import { GridRowModesModel } from "@mui/x-data-grid";
import { GridToolbarContainer } from "@mui/x-data-grid";
import { DomainAdd, Height } from "@mui/icons-material";
import { GridToolbarFilterButton } from "@mui/x-data-grid";
import { GridToolbarExport } from "@mui/x-data-grid";
import { GridToolbarColumnsButton } from "@mui/x-data-grid";
import { PatternFormat } from "react-number-format";
import AutocompletarPais from "../autocompletar/AutocompletarPais";
import { ContextoGeneral } from "../Contexto";
import BorderColorIcon from "@mui/icons-material/BorderColor";
import { GridToolbarQuickFilterProps } from "@mui/x-data-grid";

interface EditToolbarProps {
    setRows: (newRows: (oldRows: GridRowsProp) => GridRowsProp) => void;
    setRowModesModel: (
        newModel: (oldModel: GridRowModesModel) => GridRowModesModel
    ) => void;
    onAdd: () => void;
}

function EditToolbar(props: EditToolbarProps) {
    const { theme } = React.useContext(ContextoGeneral);
    const { setRows, setRowModesModel, onAdd } = props;

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
                    startIcon={<DomainAdd />}
                    onClick={onAdd}
                    sx={{ color: theme.colores.azul }}
                >
                    Agregar Empresa
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
const CuilFormat = React.forwardRef<any, CustomProps>(
    function CuilFormat(props, ref) {
        const { onChange, ...other } = props;

        return (
            <PatternFormat
                {...other}
                getInputRef={ref}
                format="##-########-#"
                mask="_"
                onValueChange={(values) => {
                    if (Number(values.value) < 0) {
                        return;
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
                mask="_"
                onValueChange={(values) => {
                    if (Number(values.value) < 0) {
                        return;
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
    const [rows, setRows] = React.useState(empresas);
    const [open, setOpen] = React.useState(false);
    const [isEditMode, setIsEditMode] = React.useState(false);
    const [selectedRow, setSelectedRow] = React.useState<any>(null);
    const [editedRow, setEditedRow] = React.useState<any>(null);
    const { theme } = React.useContext(ContextoGeneral);

    const handleOpen = (row: any) => {
        setSelectedRow(row);
        setEditedRow({ ...row });
        setIsEditMode(true);
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setIsEditMode(false);
    };

    const handleSave = () => {
        if (isEditMode) {
            setRows((prevRows) =>
                prevRows.map((row) =>
                    row.id === selectedRow.id ? editedRow : row
                )
            );
        } else {
            const newId = Math.max(...rows.map((row) => row.id)) + 1;
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
        {
            field: "cuit",
            headerName: "Cuit",
            flex: 1,
            renderHeader: () => (
                <strong style={{ color: theme.colores.grisOscuro }}>
                    Cuit
                </strong>
            ),
        },
        {
            field: "razonSocial",
            headerName: "Razon Social",
            flex: 1,
            renderHeader: () => (
                <strong style={{ color: theme.colores.grisOscuro }}>
                    Razon Social
                </strong>
            ),
        },
        {
            field: "nombreFantasia",
            headerName: "Nombre Fantasia",
            flex: 1,
            renderHeader: () => (
                <strong style={{ color: theme.colores.grisOscuro }}>
                    Nombre Fantasia
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
            field: "urlConstanciaAfip",
            headerName: "URL Constancia AFIP",
            flex: 1,
            renderHeader: () => (
                <strong style={{ color: theme.colores.grisOscuro }}>
                    URL Constancia AFIP
                </strong>
            ),
        },
        {
            field: "urlConstanciaCbu",
            headerName: "URL Constancia CBU",
            flex: 1,
            renderHeader: () => (
                <strong style={{ color: theme.colores.grisOscuro }}>
                    URL Constancia CBU
                </strong>
            ),
        },
        {
            field: "email",
            headerName: "Email",
            flex: 1,
            renderHeader: () => (
                <strong style={{ color: theme.colores.grisOscuro }}>
                    Email
                </strong>
            ),
        },
        {
            field: "edit",
            headerName: "Edit",
            width: 60,
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
                    width: "96vw",
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
                    Empresas
                </Typography>
                <Box margin="10px" sx={{ height: "90%", width: "100%" }}>
                    <DataGrid
                        rows={rows}
                        columns={columns}
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
            </Box>
        </>
    );
}
