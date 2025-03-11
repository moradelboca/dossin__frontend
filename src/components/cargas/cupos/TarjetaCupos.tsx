import ClearSharpIcon from "@mui/icons-material/ClearSharp";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
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
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid2";
import { styled } from "@mui/material/styles";
import { useContext, useState } from "react";
import { CustomButtom } from "../../botones/CustomButtom";
import { ContextoGeneral } from "../../Contexto";
import DeleteCupo from "../creadores/DeleteCupo";
import TurnoForm from "../../forms/turnos/TurnoForm";

const StyledCaja = styled(Box)(() => ({
    minWidth: 180,
    minHeight: 170,
    maxHeight: 230,
    maxWidth: 230,
    background: "#ffffff",
    borderRadius: "20px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "column",
    transition: "0.2s",
    margin: 1,
    border: "1px solid #ccc",
    padding: "28px 12px",
    "&:hover": {
        transform: "scale(1.05)",
    },
}));

interface TarjetaProps {
    fecha?: string;
    cuposDisponibles: number;
    cuposConfirmados: number;
    idCarga: any;
    refreshCupos: () => void;
    cupos:any[];
}

export function TarjetaCupos(props: TarjetaProps & { estaEnElGrid?: boolean }) {
    const { idCarga, fecha, cuposDisponibles, cuposConfirmados, refreshCupos, estaEnElGrid, cupos } = props;
    const { theme } = useContext(ContextoGeneral);
    const [cuposDisponiblesEstado, setCuposDisponiblesEstado] = useState(cuposDisponibles);
    const [openDialog, setOpenDialog] = useState(false);
    const [openDialog2, setOpenDialog2] = useState(false);
    const [openDialogDelete, setOpenDialogDelete] = useState(false);
    
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
        const cupoDeCarga = { cupos: cuposDisponiblesEstado };
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

    const handleClickDeleteCarga = () => {
        setOpenDialogDelete(true);
    };

    const Dialogos = () => (
        <>
            <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="sm">
                <DialogContent>
                <Box
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    minHeight="200px"
                >
                    <TurnoForm
                      seleccionado={null}
                      handleClose={handleCloseDialog}
                      idCarga={idCarga}
                      fechaCupo={fecha}
                      datos={cupos}
                      setDatos={refreshCupos}
                    />
                </Box>
                </DialogContent>
            </Dialog>
            <Dialog open={openDialog2} onClose={handleCloseDialog} fullWidth maxWidth="sm">
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
                                    "&:hover": { backgroundColor: theme.colores.azulOscuro },
                                    borderRadius: "50px",
                                }}
                                variant="contained"
                                onClick={() => setCuposDisponiblesEstado(Math.max(0, cuposDisponiblesEstado - 1))}
                            >
                                -
                            </Button>
                            <TextField
                                value={cuposDisponiblesEstado}
                                InputProps={{ readOnly: true }}
                                variant="outlined"
                                sx={{ width: 100, textAlign: "center" }}
                            />
                            <Button
                                sx={{
                                    backgroundColor: theme.colores.azul,
                                    color: theme.colores.gris,
                                    width: "20px",
                                    "&:hover": { backgroundColor: theme.colores.azulOscuro },
                                    borderRadius: "50px",
                                }}
                                variant="contained"
                                onClick={() => setCuposDisponiblesEstado(cuposDisponiblesEstado + 1)}
                            >
                                +
                            </Button>
                        </Box>
                        <Box display="flex" justifyContent="center" gap={2}>
                            <Button
                                sx={{
                                    backgroundColor: theme.colores.azul,
                                    color: theme.colores.gris,
                                    "&:hover": { backgroundColor: theme.colores.azulOscuro },
                                }}
                                variant="contained"
                                onClick={handleSave}
                            >
                                Guardar
                            </Button>
                            <IconButton onClick={handleClickDeleteCarga}>
                                <DeleteOutlineIcon sx={{ fontSize: 20, color: "#d68384" }} />
                            </IconButton>
                        </Box>
                    </Box>
                </DialogContent>
            </Dialog>
            <Dialog open={openDialogDelete} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DeleteCupo
                  idCarga={idCarga}
                  handleCloseDialog={handleCloseDialog}
                  fecha={fecha}
                  refreshCupos={refreshCupos}
                  selectedCupo={cupos.find((cupo) => cupo.fecha === fecha)}
                />
            </Dialog>
        </>
    );
    
    if (estaEnElGrid) {
        return (
            <Box display="flex" flexDirection="column" alignItems="start" mb={2}>
                <Typography variant="h5" fontWeight="bold">{fecha}</Typography>
                <Box display="flex" alignItems="center">
                    <Typography variant="body2" fontWeight="bold" mr={1}>
                        Turnos Disponibles:
                    </Typography>
                    <Typography variant="body2">{cuposDisponiblesEstado}</Typography>
                </Box>
                <Box display="flex" alignItems="center">
                    <Typography variant="body2" fontWeight="bold" mr={1}>
                        Turnos Confirmados:
                    </Typography>
                    <Typography variant="body2">{cuposConfirmados}</Typography>
                </Box>
                <Box display="flex" gap={2} mt={2}>
                    {cuposDisponiblesEstado > 0 && (
                        <CustomButtom onClick={handleClickDialog} title="Crear turno" />
                    )}
                    <CustomButtom onClick={handleClick} title="Ver más" />
                </Box>
                {Dialogos()}
            </Box>
        );
    }
    
    // Modo tarjeta
    return (
        <>
            <StyledCaja>
                <Typography variant="h5" color="#163660">{fecha}</Typography>
                <Divider orientation="horizontal" flexItem sx={{ bgcolor: "#163660" }} />
                <Grid container spacing="10px" padding="28px 0px">
                    <Grid width="45%" alignItems="center">
                        <Typography variant="body1" textAlign="center" color="#163660">
                            Turnos Disponibles:
                        </Typography>
                        <Typography variant="h6" textAlign="center" color="#163660">
                            {cuposDisponiblesEstado}
                        </Typography>
                    </Grid>
                    <Grid width="45%" alignItems="center">
                        <Typography variant="body1" textAlign="center" color="#163660">
                            Turnos Confirmados:
                        </Typography>
                        <Typography variant="h6" textAlign="center" color="#163660">
                            {cuposConfirmados}
                        </Typography>
                    </Grid>
                </Grid>
                <Box display="flex" flexDirection="row" gap={2}>
                    {cuposDisponiblesEstado > 0 && (
                        <CustomButtom onClick={handleClickDialog} title="Crear turno" />
                    )}
                    <CustomButtom onClick={handleClick} title="Ver más" />
                </Box>
            </StyledCaja>
            {Dialogos()}
        </>
    );
    
}
