/* eslint-disable @typescript-eslint/no-explicit-any */
import { Dialog, DialogTitle, DialogContent, Box, Typography, CircularProgress } from "@mui/material";
import { GridColDef, DataGrid } from "@mui/x-data-grid";
import { useContext, useEffect, useState } from "react";
import { EditToolbar } from "../botones/EditToolbar";
import { ContextoGeneral } from "../Contexto";
import BorderColorIcon from "@mui/icons-material/BorderColor";
import CreadorEntidad from "../dialogs/CreadorEntidad";

export default function TablaTemplate({
    titulo,
    entidad,
    endpoint,
    fields,
    headerNames,
    FormularioCreador,
}: {
    titulo: string;
    entidad: string;
    endpoint: string;
    fields: string[];
    headerNames: string[];
    FormularioCreador: React.ComponentType<any>;
}) {
    const [open, setOpen] = useState(false);
    const [seleccionado, setSeleccionado] = useState<any>(null);
    const { backendURL, theme } = useContext(ContextoGeneral);
    const [datos, setDatos] = useState<any[]>([]);
    const [estadoCarga, setEstadoCarga] = useState("Cargando");

    // Hay que pasar el endpoint en los props
    // Hacerlo despues con axios
    
    const refreshDatos = () => {
        fetch(`${backendURL}/${endpoint}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "ngrok-skip-browser-warning": "true",
            },
        })
            .then((response) => response.json())
            .then((data) => {
                setDatos(data);
                setEstadoCarga("Cargado");
                
                //for (const elemento in data) {
                //    console.log(`${elemento}: ${JSON.stringify(data[elemento])}`);
                //}
                
            })
            .catch(() => console.error(`Error al obtener ${entidad}`));
    };
    
    useEffect(() => {
        refreshDatos();
    }, []);
    
   /*
    useEffect(() => {
        // Simula la obtención de los datos (reemplaza esto con la lógica real de carga)
        let fetchedDatos = [
            {
                "cuit": 30567890123,
                "razonSocial": "Transporte SRL",
                "nombreFantasia": "Transporte",
                "localidad": null,
                "numeroCel": "3511234567",
                "urlConstanciaAfip": null,
                "urlConstanciaCBU": null,
                "email": "test@test.com"
            },
            {
                "cuit": 30567890126,
                "razonSocial": "Movimiento SRL",
                "nombreFantasia": "JUJAS",
                "localidad": {
                    "nombre": "CABA",
                    "id": 1,
                    "provincia": {
                        "nombre": "Buenos Aires",
                        "id": 1,
                        "pais": {
                            "nombre": "Argentina",
                            "id": 1
                        }
                    }
                },
                "numeroCel": "3511234567",
                "urlConstanciaAfip": "https://youtube/",
                "urlConstanciaCBU": "https://www.twitch.tv/",
                "email": "jujassrl@gmail.com"
            }
        ];

        setDatos(fetchedDatos);  // Usa setDatos para actualizar el estado
        setEstadoCarga("Cargado");
    }, []);
    */

    const handleOpen = (item: any) => {
        if (item) {
            setSeleccionado(item);
        }
        setOpen(true);
    };

    const handleClose = () => {
        setSeleccionado(null);
        setOpen(false);
    };
    
    // Genera las columnas con los arrays de los props
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

    const transformarCampo = (field: string, value: any) => {
        if (field === "localidad" && value) {
            return `${value.nombre} / ${value.provincia?.nombre || "Sin provincia"}`;
        }
        return value || "No especificado";
    };

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
                    {titulo}
                </Typography>
                <Box margin="10px" sx={{ height: "90%", width: "100%" }}>
                    {estadoCarga === "Cargando" && (
                        <Box
                            display="flex"
                            flexDirection="row"
                            width="100%"
                            height="100%"
                            justifyContent="center"
                            alignItems="center"
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
                        rows={datos.map((item) => {
                            const datosNormalizado = { ...item };
                            fields.forEach((field) => {
                                datosNormalizado[field] = transformarCampo(field, item[field]);
                            });
                            return datosNormalizado;
                        })}
                        columns={columns}
                        getRowId={(row) => row[fields[0]]}
                        sx={{
                            "& .MuiDataGrid-columnHeader": {
                                backgroundColor: theme.colores.grisClaro,
                                color: theme.colores.grisOscuro,
                            },
                            border: "none",
                            whiteSpace: "normal",
                            wordBreak: "break-word",
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
                                    name= {entidad}                                    
                                    />
                                ),
                            }}
                        />
                    )}
                    <Dialog open={open} onClose={handleClose}>
                        <DialogTitle>
                            {seleccionado ? `Editar ${entidad}` : `Crear ${entidad}`}
                        </DialogTitle>
                        
                        <DialogContent>
                            <CreadorEntidad
                                seleccionado={seleccionado}
                                handleClose={handleClose}
                                datos={datos}
                                setDatos={setDatos}
                                nombreEntidad= {entidad}
                                Formulario={FormularioCreador}
                            ></CreadorEntidad>
                        </DialogContent>
                    </Dialog>
                </Box>
            </Box>
        </>
    );
}