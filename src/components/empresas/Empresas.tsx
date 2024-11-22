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
import { DomainAdd } from "@mui/icons-material";
import { GridToolbarFilterButton } from "@mui/x-data-grid";
import { GridToolbarExport } from "@mui/x-data-grid";
import { GridToolbarColumnsButton } from "@mui/x-data-grid";
import { ContextoGeneral } from "../Contexto";
import BorderColorIcon from "@mui/icons-material/BorderColor";
import { useEffect, useState } from "react";
import CreadorEmpresas from "./CreadorEmpresas";

interface EditToolbarProps {
    setRows: (newRows: (oldRows: GridRowsProp) => GridRowsProp) => void;
    setRowModesModel: (
        newModel: (oldModel: GridRowModesModel) => GridRowModesModel
    ) => void;
    onAdd: () => void;
}

function EditToolbar(props: EditToolbarProps) {
    const { theme } = React.useContext(ContextoGeneral);
    const { onAdd } = props;

    return (
        <GridToolbarContainer sx={{ marginBottom: 1 }}>
            <Box
                sx={{
                    flexGrow: 1,
                    display: "flex",
                    justifyContent: "flex-start",
                }}
            >
                <GridToolbarQuickFilter placeholder="Buscar..." />
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
                    localeText="Exportar"
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

export default function Empresas() {
    const [open, setOpen] = React.useState(false);
    const [empresaSeleccionada, setEmpresaSeleccionada] =
        React.useState<any>(null);
    const { backendURL, theme } = React.useContext(ContextoGeneral);
    const [empresas, setEmpresas] = React.useState<any[]>([]);
    const [estadoCarga, setEstadoCarga] = useState("Cargando");

    const refreshEmpresas = () => {
        fetch(`${backendURL}/empresastransportistas`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "ngrok-skip-browser-warning": "true",
            },
        })
            .then((response) => response.json())
            .then((data) => {
                setEmpresas(data);
                setEstadoCarga("Cargado");
            })
            .catch(() =>
                console.error("Error al obtener los choferes disponibles")
            );
    };
    useEffect(() => {
        refreshEmpresas();
    }, []);

    const handleOpen = (empresa: any) => {
        if (empresa) {
            setEmpresaSeleccionada(empresa);
        }
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setEmpresaSeleccionada(null);
    };

    // A partir de aca definimos las columnas
    const fields = [
        "cuit",
        "razonSocial",
        "nombreFantasia",
        "numeroCel",
        "idUbicacion",
        "urlConstanciaAfip",
        "urlConstanciaCbu",
        "email",
    ];
    const headerNames = [
        "Cuit",
        "Razon Social",
        "Nombre Fantasia",
        "Numero Cel",
        "Ubicacion",
        "URL Constancia Afip ",
        "URL Constancia Cbu",
        "Email",
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
                    Empresas
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
                            rows={empresas.map((empresa) => ({
                                cuit: empresa.cuit,
                                razonSocial:
                                    empresa.razonSocial || "No especificado",
                                nombreFantasia:
                                    empresa.nombreFantasia || "No especificado",
                                numeroCel:
                                    empresa.numeroCel || "No especificado",
                                idUbicacion:
                                    empresa.idUbicacion || "No especificado",
                                urlConstanciaAfip:
                                    empresa.urlConstanciaAfip ||
                                    "No especificado",
                                urlConstanciaCbu:
                                    empresa.urlConstanciaCbu ||
                                    "No especificado",
                                email: empresa.email || "No especificado",
                            }))}
                            columns={columns}
                            getRowId={(row) => row.cuit}
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
                            {empresaSeleccionada
                                ? "Editar empresa"
                                : "Crear empresa"}
                        </DialogTitle>
                        <DialogContent>
                            <CreadorEmpresas
                                empresaSeleccionada={empresaSeleccionada}
                                handleClose={handleClose}
                                empresas={empresas}
                                setEmpresas={setEmpresas}
                            />
                        </DialogContent>
                    </Dialog>
                </Box>
            </Box>
        </>
    );
}
