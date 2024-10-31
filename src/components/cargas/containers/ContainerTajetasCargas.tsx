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
} from "@mui/material";
import { BotonIcon } from "../../botones/IconButton";
import { AccessAlarmOutlined, MoreVert } from "@mui/icons-material";
import CrearCargaStepper from "../creadores/CrearCargaStepper";
import React from "react";
import ContainerProximosCupos from "./ContainterProximosCupos";
import ContainerDetalles from "./ContainerDetalles";
import ContainerMapa from "./ContainerMapa";
import ContainerInformacionCarga from "./ContainerInformacionCarga";

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
    const [pasoSeleccionado, setPasoSeleccionado] = useState<any>(null);
    const [provincia, setProvincia] = useState<string | null>(null);
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    useEffect(() => {
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
            })
            .catch((e) => {
                console.log(e);
                console.error("Error al obtener las cargas");
            });
    }, []);
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
    const handleCardClick = (carga: any) => {
        setCargaSeleccionada(carga);
    };

    const handleClickAbrirDialog = (paso: any) => {
        setPasoSeleccionado(paso);
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
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
                    maxHeight: "85vh",
                    marginTop: 1,
                }}
            >
                <Box
                    sx={{
                        flex: 1,
                        display: "flex",
                        flexDirection: "column",
                        gap: 2,
                        maxWidth: "35vw",
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
                            onClick={() => handleClickAbrirDialog(0)}
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
                                                            .provincia
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
                    {cargas.length > 0 ? (
                        cargas.map((carga, i) => (
                            <TarjetaCarga
                                onClick={() => handleCardClick(carga)}
                                key={i}
                                datosCarga={carga}
                                isSelected={carga.id === cargaSeleccionada?.id}
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
                    )}
                </Box>
                <Box
                    sx={{
                        maxWidth: "100%",
                        height: "84vh",
                        maxHeight: "1300px",
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
                            marginLeft: 5,
                            marginTop: 2,
                            display: "flex",
                            flexDirection: "row",
                            width: "100%",
                        }}
                    >
                        <Typography variant="h6" color="#90979f">
                            Id de Carga:
                        </Typography>
                        <Typography variant="h6">
                            {cargaSeleccionada?.id}
                        </Typography>
                    </Box>
                    <Divider sx={{ marginTop: 1 }} />
                    <Grid2>
                        <Box
                            sx={{
                                margin: 1,
                                display: "flex",
                                flexDirection: "row",
                                borderRadius: "16px",
                                height: "auto",
                                width: "100%",
                                flexWrap: "wrap",
                            }}
                        >
                            <Box
                                sx={{
                                    display: "flex",
                                    flexDirection: "column",
                                    flex: 3,
                                    marginRight: 0,
                                    marginLeft: 4,
                                }}
                            >
                                <ContainerMapa />
                            </Box>
                            <Box
                                sx={{
                                    marginRight: 4,
                                    display: "flex",
                                    flexDirection: "column",
                                    flex: 1,
                                    minWidth: 200,
                                    width: "100%",
                                    alignItems: "center",
                                    height: "100%",
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
                                marginBottom: 3,
                            }}
                        >
                            {/* Caja 1 */}
                            <Box
                                marginTop={0}
                                marginLeft={2}
                                marginBottom={1}
                                sx={{
                                    width: { xs: "100%", md: "50%" },
                                    maxWidth: "500px",
                                    height: "100%",
                                    display: "grid",
                                    gridTemplateColumns: "repeat(2, 1fr)",
                                    gridTemplateRows: "repeat(2, 1fr)",
                                    padding: 1,
                                }}
                            >
                                <ContainerInformacionCarga />
                            </Box>

                            {/* Caja 2 */}
                            <Box
                                sx={{
                                    display: "flex",
                                    flexDirection: "column",
                                    width: { xs: "100%", md: "50%" },
                                    height: "100%",
                                    marginLeft: 1,
                                    padding: 2,
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
                    <DialogTitle>Crear Nueva Carga</DialogTitle>
                    <DialogContent
                        sx={{ height: "80vh", alignContent: "center" }}
                    >
                        <CrearCargaStepper
                            datosCarga={cargaSeleccionada}
                            pasoSeleccionado={pasoSeleccionado}
                            handleCloseDialog={handleCloseDialog}
                        />
                    </DialogContent>
                </Dialog>
            </Box>
        </ContextoCargas.Provider>
    );
}
