import Box from "@mui/material/Box";
import { createContext, useContext, useEffect, useState } from "react";
import { ContextoGeneral } from "../../Contexto";
import { TarjetaCarga } from "../tarjetas/TarjetaCarga";
import {
    Autocomplete,
    Dialog,
    DialogContent,
    DialogTitle,
    Divider,
    Grid2,
    IconButton,
    Typography,
    TextField,
    Menu,
    MenuItem,
    CircularProgress,
} from "@mui/material";
import { BotonIcon } from "../../botones/IconButton";
import { AccessAlarmOutlined, MoreVert } from "@mui/icons-material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import CrearCargaStepper from "../creadores/CrearCargaStepper";
import React from "react";
import ContainerProximosCupos from "./ContainterProximosCupos";
import ContainerDetalles from "./ContainerDetalles";
import ContainerMapa from "./ContainerMapa";
import ContainerInformacionCarga from "./ContainerInformacionCarga";
import DeleteCarga from "../creadores/DeleteCarga";

export const ContextoCargas = createContext<{
    cargaSeleccionada: Record<string, any>;
    setCargaSeleccionada: React.Dispatch<
        React.SetStateAction<Record<string, any>>
    >;
    handleClickAbrirDialog: (paso: any) => void;
    cupos: any[];
}>({
    cargaSeleccionada: {},
    setCargaSeleccionada: () => {},
    handleClickAbrirDialog: () => {},
    cupos: [],
});

export function ContainerTarjetasCargas() {
    const { backendURL } = useContext(ContextoGeneral);
    const [cargas, setCargas] = useState<any[]>([]);
    const [cargaSeleccionada, setCargaSeleccionada] = useState<any>(null);
    const [cupos, setCupos] = useState<any[]>([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [openDialogDelete, setOpenDialogDelete] = useState(false);
    const [pasoSeleccionado, setPasoSeleccionado] = useState<any>(null);
    const [creando, setCreando] = useState(false);
    const [provincia, setProvincia] = useState<string | null>(null);
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const [estadoCarga, setEstadoCarga] = useState("Cargando");

    const refreshCargas = () => {
        fetch(`${backendURL}/cargas`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "ngrok-skip-browser-warning": "true",
            },
        })
            .then((res) => res.json())
            .then((data) => {
                setCargas(data);
                setEstadoCarga("Cargado");
            })
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            .catch((_e) => {
                console.error("Error al obtener las cargas");
            });
    };
    useEffect(() => {
        if (cargaSeleccionada?.id) {
            fetch(`${backendURL}/cargas/${cargaSeleccionada.id}/cupos`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "ngrok-skip-browser-warning": "true",
                },
            })
                .then((response) => response.json())
                .then((cupos) => {
                    setCupos(cupos);
                })
                .catch(() => {
                    setCupos([]);
                    console.error("Error al obtener los cupos disponibles");
                });
        }
    }, [cargaSeleccionada]);
    useEffect(() => {
        if (cargas.length > 0 && cargaSeleccionada?.id) {
            const cargaActualizada = cargas.find(
                (carga) => carga.id === cargaSeleccionada.id
            );
            if (cargaActualizada) {
                setCargaSeleccionada(cargaActualizada);
            }
        }
    }, [cargas]);
    useEffect(() => {
        refreshCargas();
    }, []);
    const handleCardClick = (carga: any) => {
        setCargaSeleccionada(carga);
    };

    const handleClickAbrirDialog = (paso: any) => {
        setPasoSeleccionado(paso);
        setOpenDialog(true);
    };
    const handleCrearCarga = () => {
        setCreando(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setOpenDialogDelete(false);
    };

    const SeleccionarCarga = (_event: any, seleccionado: any | null) => {
        setProvincia(seleccionado?.value || null);
    };
    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };
    const handleClickDeleteCarga = () => {
        setOpenDialogDelete(true);
    };

    return (
        <ContextoCargas.Provider
            value={{
                cargaSeleccionada,
                setCargaSeleccionada,
                handleClickAbrirDialog,
                cupos,
            }}
        >
            <Box
                sx={{
                    p: 1,
                    width: "100%",
                    boxSizing: "border-box",
                    display: "flex",
                    flexDirection: "row",
                    gap: 1,
                    maxHeight: "100%",
                    height:"100%",
                    padding:"1.2rem",
                }}
            >
                <Box
                    sx={{
                        flex: 1,
                        display: "flex",
                        flexDirection: "column",
                        gap: 2,
                        maxWidth: "26vw",
                        overflowY: "auto",
                        overflowX: "hidden",
                        alignItems: "center",
                    }}
                >
                    <Box
                        display="flex"
                        flexDirection="row"
                        gap={2}
                        alignItems="center"
                    >
                        <BotonIcon
                            title="Quiero crear una nueva carga"
                            icon={<AccessAlarmOutlined />}
                            onClick={() => {
                                handleClickAbrirDialog(0);
                                handleCrearCarga();
                            }}
                        />
                        <Box
                            display="flex"
                            flexDirection="row"
                            gap={2}
                            alignItems="center"
                        >
                            <IconButton
                                aria-label="more"
                                aria-controls={open ? "menu" : undefined}
                                aria-haspopup="true"
                                onClick={handleClick}
                            >
                                <MoreVert />
                            </IconButton>

                            <Menu
                                id="menu"
                                anchorEl={anchorEl}
                                open={open}
                                onClose={handleClose}
                                MenuListProps={{
                                    "aria-labelledby": "menu-button",
                                }}
                                PaperProps={{
                                    style: {
                                        maxHeight: 80 * 4.5,
                                        width: "40ch",
                                    },
                                }}
                            >
                                <MenuItem>
                                    <Autocomplete
                                        disablePortal
                                        options={[
                                            ...new Set(
                                                cargas.map(
                                                    (carga) =>
                                                        carga.ubicacionCarga
                                                            .localidad.provincia
                                                            .nombre
                                                )
                                            ),
                                        ]}
                                        value={provincia || null}
                                        onChange={SeleccionarCarga}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label={"Provincia"}
                                            />
                                        )}
                                        sx={{ width: 300, mb: 2 }}
                                    />
                                </MenuItem>
                            </Menu>
                        </Box>
                    </Box>
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
                            <Typography variant="h6">
                                <b>Cargando...</b>
                            </Typography>
                        </Box>
                    )}
                    {estadoCarga === "Cargado" &&
                        (Array.isArray(cargas) && cargas.length > 0 ? (
                            cargas.map((carga, i) => (
                                <TarjetaCarga
                                    onClick={() => handleCardClick(carga)}
                                    key={i}
                                    datosCarga={carga}
                                    isSelected={
                                        carga.id === cargaSeleccionada?.id
                                    }
                                />
                            ))
                        ) : (
                            <Typography
                                variant="subtitle2"
                                sx={{
                                    marginLeft: 2,
                                    marginTop: 2,
                                    marginRight: 2,
                                }}
                                color="#90979f"
                            >
                                Parece ser que no hay cargas.
                            </Typography>
                        ))}
                </Box>
                <Box
                    sx={{
                        maxWidth: "100%",
                        height: "100%",
                        borderRadius: "16px",
                        flex: 1,
                        display: "flex",
                        flexDirection: "column",
                        backgroundColor: "#ffffff",
                        overflowY: "auto",
                        overflowX: "hidden",
                    }}
                >
                    <Box
                        sx={{
                            paddingLeft: "24px",
                            paddingTop: "12px",
                            paddingRight: "24px",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            width: "100%",
                            maxWidth: "100%",
                            flexWrap: "wrap",
                        }}
                    >
                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                            }}
                        >
                            <Typography variant="h6" color="#90979f">
                                Carga ID:
                            </Typography>
                            <Typography variant="h6">
                                {`#${cargaSeleccionada?.id || " " }`}
                            </Typography>
                        </Box>

                        <IconButton
                            disabled={!cargaSeleccionada}
                            onClick={() => handleClickDeleteCarga()}
                        >
                            <DeleteOutlineIcon
                                sx={{ fontSize: 20, color: "#d68384" }}
                            />
                        </IconButton>
                    </Box>

                    <Divider sx={{ marginTop: 1, marginBottom:"1rem" }} />
                    <Grid2 sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
                        <Box
                            sx={{
                                display: "flex",
                                flexDirection: "row",
                                borderRadius: "16px",
                                height: "60%",
                                width: "100%",
                                flexWrap: "wrap",
                                paddingLeft: "16px",
                                paddingRight: "16px",
                                gap:"0.5rem",
                            }}
                        >
                            <Box
                                sx={{
                                    display: "flex",
                                    flexDirection: "column",
                                    width:"60%",
                                    height:"100%",
                                }}
                            >
                                <ContainerMapa />
                            </Box>
                            <Box
                                sx={{
                                    display: "flex",
                                    flexDirection: "column",
                                    flex: 1,
                                    alignItems: "center",
                                    width:"40%",
                                    height:"100%",
                                }}
                            >
                                <ContainerProximosCupos />
                            </Box>
                        </Box>
                        <Box
                            sx={{
                                maxWidth: "100%",
                                borderRadius: "16px",
                                display: "flex",
                                flexDirection: { xs: "column", md: "row" },
                                backgroundColor: "#ffffff",
                                width:"100%",
                                height: "40%",
                                padding:"1rem",
                                gap: "0.5rem",
                            }}
                        >
                            {/* Caja 1 */}
                            <Box
                                marginTop={0}
                                sx={{
                                    width: { xs: "100%", md: "60%" },
                                    height: "100%",
                                    display: "flex",
                                    flexDirection:"column",
                                }}
                            >
                                <ContainerInformacionCarga />
                            </Box>

                            {/* Caja 2 */}
                            <Box
                                sx={{
                                    display: "flex",
                                    flexDirection: "column",
                                    width: { xs: "100%", md: "40%" },
                                    height: "100%",
                                }}
                            >
                                <ContainerDetalles />
                            </Box>
                        </Box>
                    </Grid2>
                </Box>
                <Dialog
                    open={openDialog}
                    onClose={handleCloseDialog}
                    maxWidth="lg"
                    fullWidth
                >
                    <DialogTitle>
                        {creando ? "Crear Nueva Carga" : "Modificando Carga"}
                    </DialogTitle>
                    <DialogContent
                        sx={{ height: "80vh", alignContent: "center" }}
                    >
                        <CrearCargaStepper
                            datosCarga={cargaSeleccionada}
                            pasoSeleccionado={pasoSeleccionado}
                            handleCloseDialog={handleCloseDialog}
                            creando={creando}
                            refreshCargas={refreshCargas}
                        />
                    </DialogContent>
                </Dialog>
                <Dialog
                    open={openDialogDelete}
                    onClose={handleCloseDialog}
                    maxWidth="sm"
                    fullWidth
                >
                    <DeleteCarga handleCloseDialog={handleCloseDialog} />
                </Dialog>
            </Box>
        </ContextoCargas.Provider>
    );
}
