/* eslint-disable @typescript-eslint/no-explicit-any */
import { PersonAddAlt } from "@mui/icons-material";
import BorderColorIcon from "@mui/icons-material/BorderColor";
import CancelIcon from "@mui/icons-material/Cancel";
import {
    Box,
    Button,
    CircularProgress,
    Dialog,
    DialogContent,
    DialogTitle,
    Typography,
} from "@mui/material";
import { DataGrid, GridColDef, GridRowModesModel, GridRowsProp, GridToolbarColumnsButton, GridToolbarContainer, GridToolbarExport, GridToolbarFilterButton, GridToolbarQuickFilter } from "@mui/x-data-grid";
import * as React from "react";
import { useEffect, useState } from "react";
import { ContextoGeneral } from "../Contexto";
import CreadorUser from "./CreadorUser";
import Avatar from "@mui/material/Avatar";

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
                    Agregar usuario
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

export default function TablaUser() {
    const [open, setOpen] = React.useState(false);
    const [userSeleccionado, setUserSeleccionado] = React.useState<any>(null);
    const { authURL, theme } = React.useContext(ContextoGeneral);
    const [users, setUsers] = React.useState<any[]>([]);
    const [estadoCarga, setEstadoCarga] = useState("Cargando");

    const refreshUsers = () => {
        fetch(`${authURL}/auth/usuarios`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "ngrok-skip-browser-warning": "true",
            },
            mode: "cors", // Asegúrate de configurar esto
          })
            .then((response) => response.json())
            .then((data) => {
                setUsers(data);
                setEstadoCarga("Cargado");
            })
            .catch(() =>
                console.error("Error al obtener los users disponibles")
            );
    };
    useEffect(() => {
        refreshUsers();
    }, []);

    const handleOpen = (user: any) => {
        if (user) {
            setUserSeleccionado(user);
        }
        setOpen(true);
    };
    const handleClose = () => {
        setOpen(false);
        setUserSeleccionado(null);
    };
    // A partir de aca definimos las columnas
    const fields = [
        "id",
        "email",
        "nombre",
        "apellido",
        "nombreDeUsuario",
        "imagen",
        "rolNombre",
        "activo",
    ];
    const headerNames = [
        "Id",
        "Email",
        "Nombre",
        "Apellido",
        "Nombre de usuario",
        "Imagen",
        "Rol",
        "Activo",
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
        ...(field === "imagen"
            ? {
                  renderCell: (params: any) => {
                    const imageUrl = typeof params.value === 'string' && params.value.startsWith("http") ? params.value : undefined;
                    const email = params.row.email || "";
                    return (
                      <Avatar
                        src={imageUrl}
                        alt={email}
                        imgProps={{ referrerPolicy: "no-referrer" }}
                        sx={{ bgcolor: imageUrl ? 'transparent' : theme.colores.azul }}
                      >
                        {!imageUrl && email ? email[0].toUpperCase() : null}
                      </Avatar>
                    );
                  },
              }
            : {}),
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
                    Usuarios
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
                    {estadoCarga === "Cargado" &&
                        (users.length > 0 ? (
                            <DataGrid
                                rows={users.map((user) => ({
                                    id: user.id || "No especificado",
                                    email: user.email || "No especificado",
                                    nombre: user?.nombre || "No especificado",
                                    apellido:
                                        user?.apellido || "No especificado",
                                    nombreDeUsuario:
                                        user?.nombreDeUsuario ||
                                        "No especificado",
                                    imagen: user?.imagen || "No especificado",
                                    rolNombre:
                                        user?.rol.nombre || "No especificado",
                                    rolId: user?.rol.id || "No especificado",
                                    activo: user.activo,
                                }))}
                                columns={columns}
                                getRowId={(row) => row.id}
                                sx={{
                                    "& .MuiDataGrid-columnHeader": {
                                        backgroundColor:
                                            theme.colores.grisClaro,
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
                        ) : (
                            <Box
                                display={"flex"}
                                flexDirection={"row"}
                                width={"100%"}
                                justifyContent={"center"}
                                alignItems={"center"}
                                gap={3}
                            >
                                <CancelIcon
                                    sx={{
                                        color: "red",
                                        borderRadius: "50%",
                                        padding: "5px",
                                        width: "50px",
                                        height: "50px",
                                    }}
                                />
                                <Typography variant="h5">
                                    <b>Al parecer no hay usuarios.</b>
                                </Typography>
                            </Box>
                        ))}
                    <Dialog open={open} onClose={handleClose}>
                        <DialogTitle>
                            {userSeleccionado
                                ? "Editar chofer"
                                : "Crear chofer"}
                        </DialogTitle>
                        <DialogContent>
                            <CreadorUser
                                userSeleccionado={userSeleccionado}
                                handleClose={handleClose}
                                users={users}
                                setUsers={setUsers}
                                refreshUsers={refreshUsers}
                            />
                        </DialogContent>
                    </Dialog>
                </Box>
            </Box>
        </>
    );
}
