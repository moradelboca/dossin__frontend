import {
    Box,
    Button,
    Dialog,
    DialogContent,
    DialogTitle,
    IconButton,
    TextField,
    Typography,
} from "@mui/material";
import { CustomButtom } from "../../botones/CustomButtom";
import { styled } from "@mui/material/styles";
import Grid from "@mui/material/Grid2";
import Divider from "@mui/material/Divider";
import { useContext, useState } from "react";
import CreadorTurno from "../creadores/CreadorTurno";
import { ContextoGeneral } from "../../Contexto";
import ClearSharpIcon from "@mui/icons-material/ClearSharp";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import DeleteCupo from "../creadores/DeleteCupo";

const StyledCaja = styled(Box)(() => ({
    minWidth: 180,
    minHeight: 170,
    maxHeight: 230,
    maxWidth: 230,
    background: "#d9d9d9",
    borderRadius: "20px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "column",
    boxShadow: "0 6px 16px 0 #8d8c8c",
    transition: "0.2s",
    margin: 1,
    padding: "28px 12px",
    "&:hover": {
        background: "#b5b5b5",
        transform: "scale(1.1)",
    },
}));

interface TarjetaProps {
    fecha?: string;
    cuposDisponibles: number;
    cuposConfirmados: number;
    idCarga: any;
    refreshCupos: any;
}

export function TarjetaCupos(props: TarjetaProps) {
    const { idCarga, fecha, cuposDisponibles, cuposConfirmados, refreshCupos } =
        props;
    const { theme } = useContext(ContextoGeneral);
    const [cuposDisponiblesEstado, setCuposDisponiblesEstado] =
        useState(cuposDisponibles);

    const [openDialog, setOpenDialog] = useState(false);
    const [openDialog2, setOpenDialog2] = useState(false);
    const { backendURL } = useContext(ContextoGeneral);

    function handleClick() {
        setCuposDisponiblesEstado(cuposDisponiblesEstado);
        setOpenDialog2(true);
    }

    function handleClickDialog() {
        setOpenDialog(true);
    }

    function handleCloseDialog() {
        setOpenDialog(false);
        setOpenDialog2(false);
        setOpenDialogDelete(false);
    }
    function handleSave() {
        const cupoDeCarga = {
            cupos: cuposDisponiblesEstado,
        };
        fetch(`${backendURL}/cargas/${idCarga}/cupos/${fecha}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(cupoDeCarga),
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Error al crear la carga");
                }
                response.json();
            })
            .then(() => {
                setTimeout(() => {
                    handleCloseDialog();
                }, 2000);
                refreshCupos();
            })
            .catch(() => {});
        refreshCupos();
        handleCloseDialog();
    }
    const [openDialogDelete, setOpenDialogDelete] = useState(false);
    const handleClickDeleteCarga = () => {
        setOpenDialogDelete(true);
    };

    return (
        <>
            <StyledCaja>
                <Typography variant="h5" color="#163660">
                    {fecha}
                </Typography>
                <Divider
                    orientation="horizontal"
                    flexItem
                    sx={{ bgcolor: "#163660" }}
                />
                <Grid container spacing="10px" padding="28px 0px">
                    <Grid width="45%" alignItems="center">
                        <Typography
                            variant="body1"
                            textAlign="center"
                            color="#163660"
                        >
                            Cupos Disponibles:
                        </Typography>
                        <Typography
                            variant="h6"
                            textAlign="center"
                            color="#163660"
                        >
                            {cuposDisponiblesEstado}
                        </Typography>
                    </Grid>
                    <Grid width="45%" alignItems="center">
                        <Typography
                            variant="body1"
                            textAlign="center"
                            color="#163660"
                        >
                            Cupos Confirmados:
                        </Typography>
                        <Typography
                            variant="h6"
                            textAlign="center"
                            color="#163660"
                        >
                            {cuposConfirmados}
                        </Typography>
                    </Grid>
                </Grid>
                <Box display={"flex"} flexDirection={"row"} gap={2}>
                    <CustomButtom
                        onClick={handleClickDialog}
                        title="Crear turno"
                    />
                    <CustomButtom onClick={handleClick} title="Ver mas" />
                </Box>
            </StyledCaja>

            <CreadorTurno
                idCarga={idCarga}
                fecha={fecha}
                refreshCupos={refreshCupos}
                handleCloseDialog={handleCloseDialog}
                openDialog={openDialog}
                seleccionado={false}
            />

            <Dialog
                open={openDialog2}
                onClose={handleCloseDialog}
                fullWidth
                maxWidth="sm"
            >
                <ClearSharpIcon
                    onClick={handleCloseDialog}
                    sx={{
                        position: "absolute",
                        top: "10px",
                        right: "10px",
                        cursor: "pointer",
                        color: theme.colores.azul,
                    }}
                />
                <DialogTitle>Cupos Disponibles</DialogTitle>
                <DialogContent>
                    <Box
                        display="flex"
                        justifyContent="center"
                        alignItems="center"
                        flexDirection="column"
                        minHeight="200px"
                        gap={5}
                    >
                        <Box display="flex" alignItems="center" gap={1}>
                            <Button
                                sx={{
                                    backgroundColor: theme.colores.azul,
                                    color: theme.colores.gris,
                                    width: "20px",
                                    "&:hover": {
                                        backgroundColor:
                                            theme.colores.azulOscuro,
                                    },
                                    borderRadius: "50px",
                                }}
                                variant="contained"
                                onClick={() =>
                                    setCuposDisponiblesEstado(
                                        Math.max(0, cuposDisponiblesEstado - 1)
                                    )
                                }
                            >
                                -
                            </Button>
                            <TextField
                                value={cuposDisponiblesEstado}
                                InputProps={{
                                    readOnly: true,
                                }}
                                variant="outlined"
                                sx={{ width: 100, textAlign: "center" }}
                            />
                            <Button
                                sx={{
                                    backgroundColor: theme.colores.azul,
                                    color: theme.colores.gris,
                                    width: "20px",
                                    "&:hover": {
                                        backgroundColor:
                                            theme.colores.azulOscuro,
                                    },
                                    borderRadius: "50px",
                                }}
                                variant="contained"
                                onClick={() =>
                                    setCuposDisponiblesEstado(
                                        cuposDisponiblesEstado + 1
                                    )
                                }
                            >
                                +
                            </Button>
                        </Box>
                        <Box display="flex" justifyContent="center" gap={2}>
                            <Button
                                sx={{
                                    backgroundColor: theme.colores.azul,
                                    color: theme.colores.gris,
                                    "&:hover": {
                                        backgroundColor:
                                            theme.colores.azulOscuro,
                                    },
                                }}
                                variant="contained"
                                onClick={handleSave}
                            >
                                Guardar
                            </Button>
                            <IconButton
                                onClick={() => handleClickDeleteCarga()}
                            >
                                <DeleteOutlineIcon
                                    sx={{ fontSize: 20, color: "#d68384" }}
                                />
                            </IconButton>
                        </Box>
                    </Box>
                </DialogContent>
            </Dialog>
            <Dialog
                open={openDialogDelete}
                onClose={handleCloseDialog}
                maxWidth="sm"
                fullWidth
            >
                <DeleteCupo
                    idCarga={idCarga}
                    handleCloseDialog={handleCloseDialog}
                    fecha={fecha}
                    refreshCupos={refreshCupos}
                />
            </Dialog>
        </>
    );
}
