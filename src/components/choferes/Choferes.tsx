import * as React from "react";
import { DataGrid, GridColDef, GridToolbarQuickFilter } from "@mui/x-data-grid";
import {
    Box,
    Button,
    CircularProgress,
    Dialog,
    DialogContent,
    DialogTitle,
    Typography,
} from "@mui/material";
import { GridRowsProp } from "@mui/x-data-grid";
import { GridRowModesModel } from "@mui/x-data-grid";
import { GridToolbarContainer } from "@mui/x-data-grid";
import { GridToolbarFilterButton } from "@mui/x-data-grid";
import { GridToolbarExport } from "@mui/x-data-grid";
import { GridToolbarColumnsButton } from "@mui/x-data-grid";
import BorderColorIcon from "@mui/icons-material/BorderColor";
import { ContextoGeneral } from "../Contexto";
import { PersonAddAlt } from "@mui/icons-material";
import { useEffect, useState } from "react";
import CreadorChoferes from "./CreadorChoferes";

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

export default function Choferes() {
    const [open, setOpen] = React.useState(false);
    const [choferSeleccionado, setChoferSeleccionado] =
        React.useState<any>(null);
    const { backendURL, theme } = React.useContext(ContextoGeneral);
    const [choferes, setChoferes] = React.useState<any[]>([]);
    const [estadoCarga, setEstadoCarga] = useState("Cargando");

    const refreshChoferes = () => {
        fetch(`${backendURL}/choferes`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "ngrok-skip-browser-warning": "true",
            },
        })
            .then((response) => response.json())
            .then((data) => {
                setChoferes(data);
                setEstadoCarga("Cargado");
            })
            .catch(() =>
                console.error("Error al obtener los choferes disponibles")
            );
    };
    useEffect(() => {
        refreshChoferes();
    }, []);

    const handleOpen = (chofer: any) => {
        if (chofer) {
            setChoferSeleccionado(chofer);
        }
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setChoferSeleccionado(null);
    };

    // A partir de aca definimos las columnas
    const fields = [
        "cuil",
        "numeroCel",
        "nombre",
        "apellido",
        "edad",
        "cuitEmpresa",
        "urlLINTI",
        "idUbicacion",
    ];
    const headerNames = [
        "Cuil",
        "Numero Celular",
        "Nombre",
        "Apellido",
        "Edad",
        "Cuit Empresa",
        "URL Linti",
        "Ubicacion",
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
                            rows={choferes.map((chofer) => ({
                                cuil: chofer.cuil,
                                numeroCel:
                                    chofer.numeroCel || "No especificado",
                                nombre: chofer.nombre || "No especificado",
                                apellido: chofer.apellido || "No especificado",
                                edad: chofer.edad || "No especificado",
                                cuitEmpresa:
                                    chofer.cuitEmpresa || "No especificado",
                                urlLINTI: chofer.urlLINTI || "No especificado",
                                idUbicacion:
                                    chofer.idUbicacion || "No especificado",
                            }))}
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
                                        onAdd={() => handleOpen(null)}
                                    />
                                ),
                            }}
                        />
                    )}
                    <Dialog open={open} onClose={handleClose}>
                        <DialogTitle>
                            {choferSeleccionado
                                ? "Editar chofer"
                                : "Crear chofer"}
                        </DialogTitle>
                        <DialogContent>
                            <CreadorChoferes
                                choferSeleccionado={choferSeleccionado}
                                handleClose={handleClose}
                                choferes={choferes}
                                setChoferes={setChoferes}
                            />
                        </DialogContent>
                    </Dialog>
                </Box>
            </Box>
        </>
    );
}
