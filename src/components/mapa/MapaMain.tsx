import { useContext, useEffect, useState, useRef } from "react";
import {
    Box,
    Dialog,
    DialogTitle,
    Button,
    Autocomplete,
    TextField,
    IconButton,
} from "@mui/material";
import L from "leaflet";
import {
    MapContainer,
    TileLayer,
    Marker,
    LayersControl,
    Popup,
    useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { ContextoGeneral } from "../Contexto";
import AutocompletarUbicacionMapa from "../cargas/autocompletar/AutocompletarUbicacionMapa";
import { AddLocationAltOutlined, Search } from "@mui/icons-material";
import { CreadorUbicacion } from "./CreadorUbicacion";
import { LotesPanel } from "./agro";
import { ProtectedComponent } from "../protectedComponent/ProtectedComponent";
import { PlanificacionDialog } from "./agro/components/planificacion/PlanificacionDialog";
import React from "react";
import InfoTooltip from "../InfoTooltip";

const { BaseLayer, Overlay } = LayersControl;

const balanzaIcon = L.icon({
    iconUrl: "https://i.imgur.com/yFbV2Nx.png",
    iconSize: [45, 51],
    iconAnchor: [22, 51],
    popupAnchor: [0, -28],
});

const pinIcon = L.icon({
    iconUrl: "https://i.imgur.com/9Try738.png",
    iconSize: [45, 51],
    iconAnchor: [22, 51],
    popupAnchor: [0, -28],
});
const okIcon = L.icon({
    iconUrl: "https://i.imgur.com/GaUWXH5.png",
    iconSize: [45, 51],
    iconAnchor: [22, 51],
    popupAnchor: [0, -28],
});

// Componente para manejar el zoom
function ZoomToLocation({
    lat,
    lng,
}: {
    lat: number | undefined;
    lng: number | undefined;
}) {
    const map = useMap();

    useEffect(() => {
        if (lat !== undefined && lng !== undefined) {
            map.flyTo([lat, lng], 15);
        }
    }, [lat, lng, map]);
    return null;
}

// Hook personalizado para manejar la referencia del mapa
function useMapRef() {
    const [map, setMap] = useState<L.Map | null>(null);
    const mapRef = useRef<L.Map | null>(null);

    useEffect(() => {
        if (mapRef.current) {
            setMap(mapRef.current);
        }
    }, [mapRef.current]);

    return { map, mapRef };
}

export function MapaMain() {
    const [openDialog, setOpenDialog] = useState(false);
    const [showLotesPanel, setShowLotesPanel] = useState(false);
    const [showPlanificacionDialog, setShowPlanificacionDialog] = useState(false);
    const [loteSeleccionado, setLoteSeleccionado] = useState<any>(null);
    const { backendURL, theme } = useContext(ContextoGeneral);
    const [ubicaciones, setUbicaciones] = useState<any[]>([]);
    const [ubicacionSeleccionada, setUbicacionSeleccionada] =
        React.useState<any>(null);
    const { map, mapRef } = useMapRef();
    const [pinsVisible, setPinsVisible] = useState(true); // Estado para controlar la visibilidad de los pines

    const [tipoUbicacionSeleccionado, setTipoUbicacionSeleccionado] = useState<string>("Todas");
    const [estadoCarga, setEstadoCarga] = useState(true);
    const [tipoUbicacion, setTipoUbicacion] = useState<any[]>([]);

    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
const [showSearch, setShowSearch] = useState(false);

useEffect(() => {
  const handleResize = () => {
    setIsMobile(window.innerWidth < 768);
  };
  window.addEventListener('resize', handleResize);
  return () => window.removeEventListener('resize', handleResize);
}, []);

    const refreshUbicaciones = () => {
        fetch(`${backendURL}/ubicaciones`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "ngrok-skip-browser-warning": "true",
            },
        })
            .then((response) => response.json())
            .then((ubicaciones) => {
                setUbicaciones(ubicaciones);
                setEstadoCarga(false);
            })
            .catch(() =>
                console.error("Error al obtener las ubicaciones disponibles")
            );
    };

    // Cargar tipos de ubicación desde la base de datos
    const refreshTiposUbicacion = () => {
        fetch(`${backendURL}/ubicaciones/tiposUbicaciones`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "ngrok-skip-browser-warning": "true",
            },
        })
            .then((response) => response.json())
            .then((tipos) => {
                setTipoUbicacion(tipos);
            })
            .catch(() =>
                console.error("Error al obtener los tipos de ubicación")
            );
    };

    useEffect(() => {
        refreshUbicaciones();
        refreshTiposUbicacion();
    }, []);

    const handleMarkerClick = (ubicacion: any) => {
        if (ubicacion) {
            setUbicacionSeleccionada(ubicacion);
            
            // Solo mostrar el panel de lotes si la ubicación es de tipo Carga o Carga/Descarga
            const esUbicacionCarga = ubicacion?.tipoUbicacion?.nombre === "Carga" || 
                                     ubicacion?.tipoUbicacion?.nombre === "Carga/Descarga";
            
            if (esUbicacionCarga) {
                setShowLotesPanel(true);
            } else {
                setShowLotesPanel(false);
            }
        }
        setOpenDialog(true);
    };

    const handleUbicacionSelect = (ubicacion: any) => {
        setUbicacionSeleccionada(ubicacion);
        
        // Solo mostrar el panel de lotes si la ubicación es de tipo Carga o Carga/Descarga
        const esUbicacionCarga = ubicacion?.tipoUbicacion?.nombre === "Carga" || 
                                 ubicacion?.tipoUbicacion?.nombre === "Carga/Descarga";
        
        if (esUbicacionCarga) {
            setShowLotesPanel(true);
        } else {
            setShowLotesPanel(false);
        }
        
        setOpenDialog(false);
    };

    const handleClose = () => {
        setOpenDialog(false);
    };

    // Función para controlar la visibilidad de los pines del mapa
    const handleTogglePins = (show: boolean) => {
        setPinsVisible(show);
    };

    // Crear opciones para el autocomplete incluyendo "Todas"
    const tipoUbicacionOptions = [
        { id: 0, nombre: "Todas" },
        ...tipoUbicacion
    ];

    // Filtrar ubicaciones según el tipo seleccionado
    const ubicacionesFiltradas = ubicaciones.filter(ubicacion => {
        if (tipoUbicacionSeleccionado === "Todas") {
            return true; // Mostrar todas las ubicaciones
        }
        return ubicacion.tipoUbicacion?.nombre === tipoUbicacionSeleccionado;
    });

    // Estilos azul para focus
    const azulStyles = {
        '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: theme.colores.azul,
        },
        '& .MuiInputLabel-root.Mui-focused': {
            color: theme.colores.azul,
        },
    };

    return (
        <Box position="relative" sx={{ height: 'calc(100vh - 65px)', width: '100%', minHeight: 0, minWidth: 0, overflow: 'hidden' }}>
            {/* Controles */}
            <Box>
                {isMobile ? (
                    /* Vista Mobile */
                    <>
                        {/* Botón de búsqueda (mobile) */}
                        <IconButton
                            sx={{
                                backgroundColor: theme.colores.azul,
                                color: theme.colores.gris,
                                position: 'fixed',
                                left: 10,
                                bottom: 70, // ajustado para quedar arriba del botón de agregar
                                zIndex: 1001,
                                '&:hover': {
                                    backgroundColor: theme.colores.azulOscuro,
                                }
                            }}
                            onClick={() => setShowSearch(!showSearch)}
                        >
                            <Search />
                        </IconButton>
    
                        {showSearch && (
      <Box
        sx={{
          position: 'absolute',
          top: 60,
          right: 10,
          zIndex: 1001,
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          // 🎨 fondo azul + texto gris
          backgroundColor: "white",
          color: theme.colores.gris,
          padding: 2,
          borderRadius: 2,
          boxShadow: 3,
          minWidth: 220,
        }}
      >

        {/* Autocompletar (mantiene fondo blanco para inputs) */}
                                <AutocompletarUbicacionMapa
                            ubicaciones={ubicaciones}
                            title="Seleccioná una ubicación"
                            filtro={tipoUbicacionSeleccionado}
                            estadoCarga={estadoCarga}
                            setUbicacionSeleccionada={setUbicacionSeleccionada}
                            ubicacionSeleccionada={ubicacionSeleccionada}
                            handleMarkerClick={handleUbicacionSelect}
                            sx={{ width: 200, backgroundColor: 'white', borderRadius: 1 }}
                        />

        <Autocomplete
          options={tipoUbicacionOptions}
          getOptionLabel={(option) => option.nombre}
          value={tipoUbicacionOptions.find(tipo => tipo.nombre === tipoUbicacionSeleccionado) || tipoUbicacionOptions[0]}
          onChange={(_e, value) =>
            setTipoUbicacionSeleccionado(value?.nombre || 'Todas')
          }
          renderInput={(params) => (
            <TextField {...params} label="Filtrar por tipo" sx={azulStyles} />
          )}
          sx={{
            width: 200,
            backgroundColor: 'white',
            borderRadius: '6px',
            ...azulStyles,
          }}
        />
        {/* Botón Cerrar */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            size="small"
            variant="text"
            sx={{ color: "black" }}
            onClick={() => setShowSearch(false)}
          >
            Cerrar
          </Button>
        </Box>
      </Box>
    )}
    
                        {/* Botón Agregar (mobile) */}
                        <IconButton
                            sx={{
                                backgroundColor: theme.colores.azul,
                                color: theme.colores.gris,
                                position: 'fixed',
                                left: 10,
                                bottom: 10,
                                zIndex: 1001,
                                '&:hover': {
                                    backgroundColor: theme.colores.azulOscuro,
                                }
                            }}
                            onClick={() => {
                                setUbicacionSeleccionada(null);
                                handleMarkerClick(null);
                            }}
                        >
                            <AddLocationAltOutlined />
                        </IconButton>
                    </>
                ) : (
                    /* Vista Desktop */
                    <Box
                        width={"fit-content"}
                        height={"fit-content"}
                        sx={{
                            zIndex: 1000,
                            position: "absolute",
                            top: 10,
                            left: 80,
                            display: "flex",
                            gap: "10px",
                        }}
                    >
                        <AutocompletarUbicacionMapa
                            ubicaciones={ubicaciones}
                            title="Seleccioná una ubicación"
                            filtro={tipoUbicacionSeleccionado}
                            estadoCarga={estadoCarga}
                            setUbicacionSeleccionada={setUbicacionSeleccionada}
                            ubicacionSeleccionada={ubicacionSeleccionada}
                            handleMarkerClick={handleUbicacionSelect}
                        />
                        <Autocomplete
                            options={tipoUbicacionOptions}
                            getOptionLabel={(option) => option.nombre}
                            value={tipoUbicacionOptions.find(tipo => tipo.nombre === tipoUbicacionSeleccionado) || tipoUbicacionOptions[0]}
                            onChange={(_event, value) => {
                                setTipoUbicacionSeleccionado(value?.nombre || "Todas");
                            }}
                            renderInput={(params) => (
                                <TextField {...params} label="Tipo" sx={azulStyles} />
                            )}
                            sx={{
                                width: 100,
                                background: "white",
                                borderRadius: "6px",
                                ...azulStyles,
                            }}
                        />
                        <IconButton
                            sx={{
                                backgroundColor: theme.colores.azul,
                                color: theme.colores.gris,
                                width: "55px",
                                "&:hover": {
                                    backgroundColor: theme.colores.azulOscuro,
                                },
                            }}
                            onClick={() => {
                                setUbicacionSeleccionada(null);
                                handleMarkerClick(null);
                            }}
                        >
                            <AddLocationAltOutlined />
                        </IconButton>
                        <InfoTooltip
                            title="¿Cómo ingresar la URL de Google Maps y borrar ubicaciones?"
                            placement="right"
                            sections={[
                                "Al ingresar la URL de Google Maps, extraemos automáticamente la latitud y longitud del link. A veces puede fallar por cuestiones de Google. En esos casos, revisá que el pin esté bien ubicado en el mapa.",
                                "Normalmente funciona mejor hacer click al lado del pin en Google Maps (no sobre el pin), es decir, clickear un punto vacío cerca del lugar deseado.",
                                "Si no te deja borrar una ubicación, probablemente esté siendo usada en una carga."
                            ]}
                        />
                    </Box>
                )}
            </Box>

            {/* Mapa */}
            <MapContainer
                center={[-33.099765, -64.3654802]}
                zoom={5}
                scrollWheelZoom={false}
                style={{ height: "100%", width: "100%" }}
                ref={mapRef}
            >
                <ZoomToLocation
                    lat={ubicacionSeleccionada?.latitud}
                    lng={ubicacionSeleccionada?.longitud}
                />

                <LayersControl position="topright">
                    <BaseLayer checked name="CartoDB Positron">
                        <TileLayer
                            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                            subdomains="abcd"
                            maxZoom={20}
                        />
                    </BaseLayer>
                    <BaseLayer name="Esri WorldImagery">
                        <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" />
                    </BaseLayer>
                    <BaseLayer name="OpenStreetMap">
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    </BaseLayer>

                    {pinsVisible && ubicacionesFiltradas.map((ubi, index) => (
                        <Overlay
                            key={index}
                            checked
                            name={`Ubicación ${ubi.id}`}
                        >
                            <Marker
                                position={[ubi.latitud, ubi.longitud]}
                                icon={
                                    ubi.tipoUbicacion.nombre === "Balanza"
                                        ? balanzaIcon
                                        : ubi.tipoUbicacion.nombre === "Descarga"
                                        ? okIcon
                                        : pinIcon
                                }
                            >
                                <Popup>
                                    <strong>{ubi.nombre}</strong>
                                    <br />
                                    Provincia: {ubi.localidad.provincia.nombre}
                                    <br />
                                    País: {ubi.localidad.provincia.pais.nombre}
                                    <br />
                                    Tipo: {ubi.tipoUbicacion.nombre}
                                    <br />
                                    <Button
                                        size="small"
                                        sx={{ color: theme.colores.azul }}
                                        onClick={() => handleMarkerClick(ubi)}
                                    >
                                        Ver más
                                    </Button>
                                </Popup>
                            </Marker>
                        </Overlay>
                    ))}
                </LayersControl>
            </MapContainer>

            {/* Panel de lotes */}
            {showLotesPanel && (
                <ProtectedComponent allowedRoles={[1]}>
                    <LotesPanel
                        ubicacion={ubicacionSeleccionada}
                        map={map}
                        onClose={() => {
                            setShowLotesPanel(false);
                            setPinsVisible(true); // Restaurar pines cuando se cierra el panel
                        }}
                        onTogglePins={handleTogglePins}
                        onLoteClick={(lote: any) => {
                            setLoteSeleccionado(lote);
                            setShowPlanificacionDialog(true);
                            setShowLotesPanel(false);
                        }}
                    />
                </ProtectedComponent>
            )}

            {/* Dialog de planificación agrícola */}
            {showPlanificacionDialog && loteSeleccionado && (
                <PlanificacionDialog
                    open={showPlanificacionDialog}
                    onClose={() => {
                        setShowPlanificacionDialog(false);
                        setLoteSeleccionado(null);
                        setShowLotesPanel(true); // Volver al panel de lotes
                    }}
                    planificacion={loteSeleccionado.planificacion || {
                        campania: '2025/2026',
                        superficie: loteSeleccionado.superficie || 0,
                        estructura: [],
                        extras: []
                    }}
                    lote={loteSeleccionado}
                    ubicacion={ubicacionSeleccionada}
                    onPlanificacionUpdated={(updatedPlan) => {
                        // Actualizar el lote seleccionado con la nueva planificación
                        setLoteSeleccionado((prev: any) => prev ? {
                            ...prev,
                            planificacion: updatedPlan
                        } : null);
                    }}
                    onCampañaChange={(nuevaCampaña) => {
                        // Manejar cambio de campaña - por ahora solo loguear
                        console.log('Campaña cambiada a:', nuevaCampaña);
                        // En el futuro aquí se podría cargar una nueva planificación
                    }}
                />
            )}

            {/* Diálogo */}
            <Dialog open={openDialog} onClose={handleClose} maxWidth="xs" fullWidth>
                <DialogTitle>Detalles del Punto</DialogTitle>
                <CreadorUbicacion
                    handleClose={handleClose}
                    ubicaciones={ubicaciones}
                    setUbicaciones={setUbicaciones}
                    ubicacionSeleccionada={ubicacionSeleccionada}
                    refreshUbicaciones={refreshUbicaciones}
                />
            </Dialog>
        </Box>
    );

}