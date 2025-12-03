import { Box, Typography } from "@mui/material";
import Reloj from "../Reloj";
import { useState, useEffect, useContext } from "react";
import { ContextoGeneral } from "../../Contexto";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import AutocompletarUbicacion from "../autocompletar/AutocompletarUbicacion";
import { ContextoStepper } from "../creadores/CrearCargaStepper";
import Dialog from '@mui/material/Dialog';
import { CreadorUbicacion } from '../../mapa/CreadorUbicacion';
import { axiosGet } from "../../../lib/axiosConfig";

export default function SelectorDeUbicacion() {
    const { datosNuevaCarga, datosSinCompletar } = useContext(ContextoStepper);

    const { backendURL } = useContext(ContextoGeneral);
    const [ubicaciones, setUbicaciones] = useState<any[]>([]);
    const [requiereBalanza, setRequiereBalanza] = useState<boolean>(
        datosNuevaCarga["requiereBalanza"] ?? false
    );
    const [estadoCarga, setEstadoCarga] = useState(true);
    const [openCreador, setOpenCreador] = useState(false);

    useEffect(() => {
        axiosGet<any[]>('ubicaciones', backendURL)
            .then((ubicaciones) => {
                setUbicaciones(ubicaciones);
                setEstadoCarga(false);
            })
            .catch((error) =>
                console.error("Error al obtener las Ubicaciones disponibles: ", error)
            );
    }, [backendURL]);

    const refreshUbicaciones = () => {
        setEstadoCarga(true);
        axiosGet<any[]>('ubicaciones', backendURL)
            .then((ubicaciones) => {
                setUbicaciones(ubicaciones);
                setEstadoCarga(false);
            })
            .catch((error) =>
                console.error("Error al obtener las Ubicaciones disponibles: ", error)
            );
    };

    const handleAgregarUbicacion = () => setOpenCreador(true);
    const handleCloseCreador = () => setOpenCreador(false);

    return (
        <>
            <Box
                sx={{
                    width: '100%',
                    maxWidth: { xs: 400, sm: 800 },
                    mx: 'auto',
                    display: 'flex',
                    flexDirection: { xs: 'column', md: 'row' },
                    gap: 2,
                    alignItems: { xs: 'center', md: 'flex-start' },
                    justifyContent: 'center',
                }}
            >
                <Box
                    sx={{
                        display: { xs: 'block', md: 'flex' },
                        flexDirection: { md: 'row' },
                        gap: { xs: 0, md: 2 },
                        mx: 'auto',
                        alignItems: { md: 'flex-start' },
                        justifyContent: { md: 'center' },
                    }}
                >
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            border: '1px solid rgba(22, 54, 96, 0.6)',
                            borderRadius: '8px',
                            p: 2,
                            flex: 1,
                            minWidth: 0,
                            width: { xs: '100%', md: '50%' },
                            maxWidth: 400,
                            mx: 'auto',
                            mb: { xs: 2, md: 0 },
                        }}
                    >
                        <Box sx={{ width: '100%' }}>
                          <AutocompletarUbicacion
                              ubicaciones={ubicaciones}
                              title="Ubicación de Carga"
                              filtro="Carga"
                              estadoCarga={estadoCarga}
                              onAgregarUbicacion={handleAgregarUbicacion}
                          />
                        </Box>
                        <Box
                            sx={{
                                display: 'flex',
                                flexDirection: 'row',
                                gap: 2,
                                width: '100%',
                                mt: 1,
                                justifyContent: 'center',
                            }}
                        >
                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                                <Typography sx={{ whiteSpace: 'normal', wordBreak: 'break-word', fontSize: 14 }}>Inicio</Typography>
                                <Box sx={{ width: '100%' }}><Reloj filtro="horaInicioCarga" /></Box>
                            </Box>
                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                                <Typography sx={{ whiteSpace: 'normal', wordBreak: 'break-word', fontSize: 14 }}>Fin</Typography>
                                <Box sx={{ width: '100%' }}><Reloj filtro="horaFinCarga" /></Box>
                            </Box>
                        </Box>
                    </Box>
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            border: '1px solid rgba(22, 54, 96, 0.6)',
                            borderRadius: '8px',
                            p: 2,
                            flex: 1,
                            minWidth: 0,
                            width: { xs: '100%', md: '50%' },
                            maxWidth: 400,
                            mx: 'auto',
                            mt: { xs: 0, md: 0 },
                        }}
                    >
                        <Box sx={{ width: '100%' }}>
                          <AutocompletarUbicacion
                              ubicaciones={ubicaciones}
                              title="Ubicación de Descarga"
                              filtro="Descarga"
                              estadoCarga={estadoCarga}
                              onAgregarUbicacion={handleAgregarUbicacion}
                          />
                        </Box>
                        <Box
                            sx={{
                                display: 'flex',
                                flexDirection: 'row',
                                gap: 2,
                                width: '100%',
                                mt: 1,
                                justifyContent: 'center',
                            }}
                        >
                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                                <Typography sx={{ whiteSpace: 'normal', wordBreak: 'break-word', fontSize: 14 }}>Inicio</Typography>
                                <Box sx={{ width: '100%' }}><Reloj filtro="horaInicioDescarga" /></Box>
                            </Box>
                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                                <Typography sx={{ whiteSpace: 'normal', wordBreak: 'break-word', fontSize: 14 }}>Fin</Typography>
                                <Box sx={{ width: '100%' }}><Reloj filtro="horaFinDescarga" /></Box>
                            </Box>
                        </Box>
                    </Box>
                </Box>
            </Box>
            <FormControlLabel
                control={
                    <Checkbox
                        checked={requiereBalanza}
                        onChange={(e) => {
                            setRequiereBalanza(e.target.checked);
                            datosNuevaCarga["requiereBalanza"] =
                                e.target.checked;
                        }}
                        sx={{
                            color: "#163660",
                            "&.Mui-checked": {
                                color: "#163660",
                            },
                        }}
                    />
                }
                label="Requiere balanza"
                sx={{ mt: 2, mb: 1 }}
            />
            {requiereBalanza && (
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        border: '1px solid rgba(22, 54, 96, 0.6)',
                        borderRadius: '8px',
                        p: 2,
                        width: { xs: '100%', md: '50%' },
                        maxWidth: 400,
                        mt: 1,
                        mx: 'auto',
                    }}
                >
                    <Box sx={{ width: '100%' }}>
                      <AutocompletarUbicacion
                          ubicaciones={ubicaciones}
                          title="Ubicación de Balanza"
                          filtro="Balanza"
                          estadoCarga={estadoCarga}
                          onAgregarUbicacion={handleAgregarUbicacion}
                      />
                    </Box>
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'row',
                            gap: 2,
                            width: '100%',
                            mt: 1,
                            justifyContent: 'center',
                        }}
                    >
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                            <Typography sx={{ whiteSpace: 'normal', wordBreak: 'break-word', fontSize: 14 }}>Inicio</Typography>
                            <Box sx={{ width: '100%' }}><Reloj filtro="horaInicioBalanza" /></Box>
                        </Box>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                            <Typography sx={{ whiteSpace: 'normal', wordBreak: 'break-word', fontSize: 14 }}>Fin</Typography>
                            <Box sx={{ width: '100%' }}><Reloj filtro="horaFinBalanza" /></Box>
                        </Box>
                    </Box>
                </Box>
            )}
            {datosSinCompletar && (
                <Typography color="#ff3333">
                    Las horas de incio deben ser menores a las de fin.
                </Typography>
            )}
            <Dialog open={openCreador} onClose={handleCloseCreador} maxWidth="xs" fullWidth>
                <CreadorUbicacion
                    handleClose={() => {
                        handleCloseCreador();
                        refreshUbicaciones();
                    }}
                    ubicacionSeleccionada={null}
                    ubicaciones={ubicaciones}
                    setUbicaciones={setUbicaciones}
                    refreshUbicaciones={refreshUbicaciones}
                />
            </Dialog>
        </>
    );
}
