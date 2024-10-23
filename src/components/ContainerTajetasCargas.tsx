import Box from "@mui/material/Box";
import { useContext, useEffect, useState } from "react";
import { ContextoGeneral } from "./Contexto";
import { TarjetaCarga } from "./tarjetas/TarjetaCarga";
import { Mapa2 } from "./Mapa2";
import {
    Button,
    Dialog,
    DialogContent,
    DialogTitle,
    Divider,
    Grid2,
    IconButton,
    Typography,
} from "@mui/material";
import { BotonIcon } from "./botones/IconButton";
import { AccessAlarmOutlined } from "@mui/icons-material";
import CrearCargaStepper from "./tarjetas/CrearCargaStepper";
import { CustomButtom } from "./botones/CustomButtom";
import { useNavigate } from "react-router-dom";
import AddIcon from "@mui/icons-material/Add";
import BorderColorIcon from "@mui/icons-material/BorderColor";

export function ContainerTarjetasCargas() {
    const { backendURL } = useContext(ContextoGeneral);
    const [cargas, setCargas] = useState<any[]>([]);
    const [cargaSeleccionada, setCargaSeleccionada] = useState<any>(null);
    const [cupos, setCupos] = useState<any[]>([]);
    const [openDialog, setOpenDialog] = useState(false);
    const navigate = useNavigate();
    const [pasoSeleccionado, setPasoSeleccionado] = useState<any>(null);

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
        console.log(cargaSeleccionada);
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
                    console.error("Error al obtener los cupos disponibles");
                });
        }
    }, [cargaSeleccionada]);
    const handleCardClick = (carga: any) => {
        setCargaSeleccionada(carga);
    };

    const handleClickCrearCarga = () => {
        setOpenDialog(true);
    };
    const handleClickEditarTarifa = () => {
        if (cargaSeleccionada) {
            setOpenDialog(true);
            setPasoSeleccionado(3);
        }
    };
    const handleClickEditarRecorrido = () => {
        if (cargaSeleccionada) {
            setOpenDialog(true);
            setPasoSeleccionado(1);
        }
    };
    const handleClickEditarDetalle = () => {
        if (cargaSeleccionada) {
            setOpenDialog(true);
            setPasoSeleccionado(4);
        }
    };
    const handleClickEditarKilometros = () => {
        if (cargaSeleccionada) {
            setOpenDialog(true);
            setPasoSeleccionado(2);
        }
    };
    const handleClickEditarTipoAcoplado = () => {
        if (cargaSeleccionada) {
            setOpenDialog(true);
            setPasoSeleccionado(2);
        }
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
    };

    const handleClickVerCupos = () => {
        navigate(`/cargas/${cargaSeleccionada.id}/cupos`);
    };
    const handleClickAbrirDialog = () => {
        navigate(`/cargas/${cargaSeleccionada.id}`);
    };

    return (
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
                <BotonIcon
                    onClick={handleClickCrearCarga}
                    title="Quiero crear una nueva carga"
                    icon={<AccessAlarmOutlined />}
                />
                {cargas.map((carga, i) => (
                    <TarjetaCarga
                        onClick={() => handleCardClick(carga)}
                        key={i}
                        datosCarga={carga}
                        isSelected={cargaSeleccionada?.id === carga.id}
                    />
                ))}
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
                    <CustomButtom
                        title="Ver Detalles"
                        onClick={handleClickAbrirDialog}
                    />
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
                            <Box
                                sx={{
                                    display: "flex",
                                    flexDirection: "row",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    width: "100%",
                                    marginRight: 3,
                                    margingBottom: 1,
                                }}
                            >
                                <Typography>Recorrido</Typography>
                                <IconButton
                                    onClick={handleClickEditarRecorrido}
                                >
                                    <BorderColorIcon sx={{ fontSize: 17 }} />
                                </IconButton>
                            </Box>
                            <Box
                                sx={{
                                    marginTop: 0,
                                }}
                            >
                                <Mapa2
                                    coordenadasBalanza={[
                                        cargaSeleccionada?.ubicacionBalanza
                                            ?.latitud,
                                        cargaSeleccionada?.ubicacionBalanza
                                            ?.longitud,
                                    ]}
                                    coordenadasCarga={[
                                        cargaSeleccionada?.ubicacionCarga
                                            .latitud,
                                        cargaSeleccionada?.ubicacionCarga
                                            .longitud,
                                    ]}
                                    coordenadasDescarga={[
                                        cargaSeleccionada?.ubicacionDescarga
                                            .latitud,
                                        cargaSeleccionada?.ubicacionDescarga
                                            .longitud,
                                    ]}
                                />
                            </Box>
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
                            <Box
                                sx={{
                                    display: "flex",
                                    flexDirection: "row",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    width: "100%",
                                }}
                            >
                                <Typography>Cupos</Typography>
                                <IconButton onClick={handleClickVerCupos}>
                                    <AddIcon />
                                </IconButton>
                            </Box>
                            <Box
                                sx={{
                                    width: "100%",
                                    display: "flex",
                                    flexDirection: "column",
                                    borderRadius: "16px",
                                    border: "1px solid #ccc",
                                    overflowY: "auto",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    flexGrow: 1,
                                    marginTop: 0,
                                    maxWidth: 300,
                                    maxHeight: 310,
                                    marginBottom: 1,
                                    minHeight: 275,
                                }}
                            >
                                {cupos.length === 0 ? (
                                    <Typography
                                        variant="subtitle2"
                                        sx={{
                                            marginLeft: 2,
                                            marginTop: 2,
                                            marginRight: 2,
                                        }}
                                        color="#90979f"
                                    >
                                        Parece ser que no hay cupos.
                                    </Typography>
                                ) : (
                                    cupos.slice(0, 3).map((cupo, i) => (
                                        <Box
                                            key={i}
                                            minWidth={200}
                                            sx={{
                                                marginBottom: 1,
                                                marginTop: 2,
                                            }}
                                        >
                                            <Typography
                                                variant="subtitle2"
                                                sx={{
                                                    marginLeft: 2,
                                                    marginRight: 2,
                                                }}
                                                color="#90979f"
                                            >
                                                Fecha: {cupo.fecha}
                                            </Typography>
                                            <Typography
                                                variant="subtitle2"
                                                sx={{
                                                    marginLeft: 2,
                                                    marginRight: 2,
                                                }}
                                                color="#90979f"
                                            >
                                                Cupos confirmados:{" "}
                                                {cupo.turnos.length} ⛟ 🗸
                                            </Typography>
                                            <Typography
                                                variant="subtitle2"
                                                sx={{
                                                    marginLeft: 2,
                                                    marginRight: 2,
                                                }}
                                                color="#90979f"
                                            >
                                                Cupos restantes: {cupo.cupos} ⛟
                                                ⏱︎
                                            </Typography>
                                        </Box>
                                    ))
                                )}
                            </Box>
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
                            {/* Tarifa */}
                            <Box
                                sx={{
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    flexDirection: "column",
                                    width: "100%",
                                    height: "100%",
                                }}
                            >
                                <Box
                                    sx={{
                                        display: "flex",
                                        flexDirection: "row",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        width: "100%",
                                    }}
                                >
                                    <Typography>Tarifa</Typography>
                                    <IconButton
                                        onClick={handleClickEditarTarifa}
                                    >
                                        <BorderColorIcon
                                            sx={{ fontSize: 17 }}
                                        />
                                    </IconButton>
                                </Box>
                                <Box
                                    sx={{
                                        border: "1px solid #ccc",
                                        borderRadius: "16px",
                                        padding: 2,
                                        width: "100%",
                                        textAlign: "left",
                                    }}
                                >
                                    <Typography
                                        variant="subtitle2"
                                        sx={{ marginLeft: 2 }}
                                        color="#90979f"
                                        minHeight={22}
                                    >
                                        ${cargaSeleccionada?.tarifa} /
                                        {cargaSeleccionada?.tipoTarifa}
                                        {cargaSeleccionada?.incluyeIva === 1
                                            ? "+IVA"
                                            : ""}
                                    </Typography>
                                </Box>
                            </Box>

                            {/* Kilómetros */}
                            <Box
                                sx={{
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    flexDirection: "column",
                                    width: "100%",
                                    height: "100%",
                                    marginLeft: 2,
                                }}
                            >
                                <Box
                                    sx={{
                                        display: "flex",
                                        flexDirection: "row",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        width: "100%",
                                    }}
                                >
                                    <Typography>Kilometros</Typography>
                                    <IconButton
                                        onClick={handleClickEditarKilometros}
                                    >
                                        <BorderColorIcon
                                            sx={{ fontSize: 17 }}
                                        />
                                    </IconButton>
                                </Box>
                                <Box
                                    sx={{
                                        border: "1px solid #ccc",
                                        borderRadius: "16px",
                                        padding: 2,
                                        width: "100%",
                                        textAlign: "left",
                                    }}
                                >
                                    <Typography
                                        variant="subtitle2"
                                        sx={{ marginLeft: 2 }}
                                        color="#90979f"
                                        minHeight={22}
                                    >
                                        {cargaSeleccionada?.cantidadKm}
                                    </Typography>
                                </Box>
                            </Box>

                            {/* Cupos creados */}
                            <Box
                                sx={{
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    flexDirection: "column",
                                    width: "100%",
                                    height: "100%",
                                }}
                            >
                                <Box
                                    sx={{
                                        display: "flex",
                                        flexDirection: "row",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        width: "100%",
                                    }}
                                >
                                    <Typography>Cupos creados</Typography>
                                    <IconButton onClick={handleClickVerCupos}>
                                        <BorderColorIcon
                                            sx={{ fontSize: 17 }}
                                        />
                                    </IconButton>
                                </Box>
                                <Box
                                    sx={{
                                        border: "1px solid #ccc",
                                        borderRadius: "16px",
                                        padding: 2,
                                        width: "100%",
                                        textAlign: "left",
                                    }}
                                >
                                    <Typography
                                        variant="subtitle2"
                                        sx={{ marginLeft: 2 }}
                                        color="#90979f"
                                        minHeight={22}
                                    >
                                        {cupos.length}
                                    </Typography>
                                </Box>
                            </Box>

                            {/* Tipos de camiones */}
                            <Box
                                sx={{
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    flexDirection: "column",
                                    width: "100%",
                                    height: "100%",
                                    marginLeft: 2,
                                }}
                            >
                                <Box
                                    sx={{
                                        display: "flex",
                                        flexDirection: "row",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        width: "100%",
                                    }}
                                >
                                    <Typography>Tipo de acoplado</Typography>
                                    <IconButton
                                        onClick={handleClickEditarTipoAcoplado}
                                    >
                                        <BorderColorIcon
                                            sx={{ fontSize: 17 }}
                                        />
                                    </IconButton>
                                </Box>
                                <Box
                                    sx={{
                                        border: "1px solid #ccc",
                                        borderRadius: "16px",
                                        padding: 2,
                                        width: "100%",
                                        textAlign: "left",
                                    }}
                                >
                                    <Typography
                                        variant="subtitle2"
                                        sx={{ marginLeft: 2 }}
                                        color="#90979f"
                                        minHeight={22}
                                    >
                                        {cargaSeleccionada?.tiposAcoplados}
                                    </Typography>
                                </Box>
                            </Box>
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
                            <Box
                                sx={{
                                    display: "flex",
                                    flexDirection: "row",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    width: "100%",
                                }}
                            >
                                <Typography>Detalles</Typography>
                                <IconButton onClick={handleClickEditarDetalle}>
                                    <BorderColorIcon sx={{ fontSize: 17 }} />
                                </IconButton>
                            </Box>
                            <Box
                                sx={{
                                    border: "1px solid #ccc",
                                    borderRadius: "16px",
                                    padding: 2,
                                    width: "100%",
                                    height: "100%",
                                    maxHeight: "145px",
                                    textAlign: "left",
                                    boxSizing: "border-box",
                                    display: "flex",
                                    flexDirection: "column",
                                    justifyContent: "space-between",
                                    minHeight: 125,
                                }}
                            >
                                <Typography
                                    variant="subtitle2"
                                    sx={{ marginLeft: 2 }}
                                    color="#90979f"
                                >
                                    {cargaSeleccionada?.descripcion}
                                </Typography>
                            </Box>
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
                <DialogContent sx={{ height: "80vh", alignContent: "center" }}>
                    <CrearCargaStepper
                        datosCarga={cargaSeleccionada}
                        pasoSeleccionado={pasoSeleccionado}
                        handleCloseDialog={handleCloseDialog}
                    />
                </DialogContent>
            </Dialog>
        </Box>
    );
}
