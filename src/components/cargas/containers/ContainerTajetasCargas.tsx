import Box from "@mui/material/Box";
import { useContext, useEffect, useState } from "react";
import { ContextoGeneral } from "../../Contexto";
import { TarjetaCarga } from "../tarjetas/TarjetaCarga";
import { Mapa2 } from "../Mapa2";
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
import { CustomButtom } from "../../botones/CustomButtom";
import { useNavigate } from "react-router-dom";
import AddIcon from "@mui/icons-material/Add";
import BorderColorIcon from "@mui/icons-material/BorderColor";
import React from "react";

export function ContainerTarjetasCargas() {
    const { backendURL } = useContext(ContextoGeneral);
    const [cargas, setCargas] = useState<any[]>([]);
    const [cargaSeleccionada, setCargaSeleccionada] = useState<any>(null);
    const [cupos, setCupos] = useState<any[]>([]);
    const [openDialog, setOpenDialog] = useState(false);
    const navigate = useNavigate();
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

    const handleClickVerCupos = () => {
        navigate(`/cargas/${cargaSeleccionada.id}/cupos`);
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
                {cargaSeleccionada ? (
                    <TarjetaCarga
                        onClick={() => handleCardClick(cargaSeleccionada)}
                        key={cargaSeleccionada.id}
                        datosCarga={cargaSeleccionada}
                        isSelected={true}
                    />
                ) : cargas.length > 0 ? (
                    cargas.map((carga, i) => (
                        <TarjetaCarga
                            onClick={() => handleCardClick(carga)}
                            key={i}
                            datosCarga={carga}
                            isSelected={false}
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
                                    disabled={!cargaSeleccionada}
                                    onClick={() => handleClickAbrirDialog(1)}
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
                                <IconButton
                                    disabled={!cargaSeleccionada}
                                    onClick={handleClickVerCupos}
                                >
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
                                {!cupos.length ? (
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
                                        disabled={!cargaSeleccionada}
                                        onClick={() =>
                                            handleClickAbrirDialog(3)
                                        }
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
                                        {cargaSeleccionada?.tipoTarifa.nombre}
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
                                        disabled={!cargaSeleccionada}
                                        onClick={() =>
                                            handleClickAbrirDialog(0)
                                        }
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
                                    <IconButton
                                        disabled={!cargaSeleccionada}
                                        onClick={handleClickVerCupos}
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
                                        disabled={!cargaSeleccionada}
                                        onClick={() =>
                                            handleClickAbrirDialog(2)
                                        }
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
                                        {cargaSeleccionada?.tiposAcoplados.map(
                                            (acoplado: any, index: any) => (
                                                <span key={index}>
                                                    {acoplado.nombre}
                                                    {index <
                                                        cargaSeleccionada
                                                            .tiposAcoplados
                                                            .length -
                                                            1 && ", "}
                                                </span>
                                            )
                                        )}
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
                                <IconButton
                                    disabled={!cargaSeleccionada}
                                    onClick={() => handleClickAbrirDialog(4)}
                                >
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
