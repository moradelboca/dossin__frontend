import React, { useState, useEffect, useContext } from "react";
import {
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  Table,
  TableHead,
  TableBody,
  TableCell,
  TableRow,
  TableContainer,
  Paper,
  Divider,
  Box,
  CircularProgress,
  IconButton,
  Dialog,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { ContextoGeneral } from "../Contexto";
import CardMobile from "../cards/mobile/CardMobile";

const HistorialTurnos: React.FC = () => {
  const { dashboardURL } = useContext(ContextoGeneral);
  const [tabValue, setTabValue] = useState(0);

  // Estados para los turnos recientes (endpoint /turnos/fecha/)
  const [recentData, setRecentData] = useState<any>(null);
  const [loadingRecent, setLoadingRecent] = useState<boolean>(true);
  const [errorRecent, setErrorRecent] = useState<string | null>(null);

  // Estados para los turnos anteriores (endpoint /turnos)
  const [anterioresData, setAnterioresData] = useState<any[]>([]);
  const [loadingAnteriores, setLoadingAnteriores] = useState<boolean>(true);
  const [errorAnteriores, setErrorAnteriores] = useState<string | null>(null);

  // Estados para el diálogo y el turno seleccionado
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [selectedTurno, setSelectedTurno] = useState<any>(null);

  const fetchOptions = {
    headers: {
      "Content-Type": "application/json",
      "ngrok-skip-browser-warning": "true",
    },
  };

  useEffect(() => {
    // Fetch para turnos recientes
    fetch(`${dashboardURL}/turnos/fecha/`, fetchOptions)
      .then((res) => {
        if (!res.ok) {
          throw new Error("Error en la petición de turnos recientes");
        }
        return res.json();
      })
      .then((data) => {
        // Se espera que el response tenga la forma: { Fecha:"2025-02-06", Cantidad:0, Turnos: [] }
        setRecentData(data);
        setLoadingRecent(false);
      })
      .catch((err) => {
        console.error("Error al obtener turnos recientes:", err);
        setErrorRecent("No se pudieron cargar los turnos recientes.");
        setLoadingRecent(false);
      });

    // Fetch para turnos anteriores
    fetch(`${dashboardURL}/turnos`, fetchOptions)
      .then((res) => {
        if (!res.ok) {
          throw new Error("Error en la petición de turnos anteriores");
        }
        return res.json();
      })
      .then((data) => {
        setAnterioresData(data.turnos);
        setLoadingAnteriores(false);
      })
      .catch((err) => {
        console.error("Error al obtener turnos anteriores:", err);
        setErrorAnteriores("No se pudieron cargar los turnos anteriores.");
        setLoadingAnteriores(false);
      });
  }, [dashboardURL]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleOpenDialog = (turno: any) => {
    setSelectedTurno(turno);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedTurno(null);
  };

  // Arreglos con los campos y encabezados que se desean mostrar
  const fields = [
    "estado.nombre",
    "empresa.cuit",
    "tara.pesoNeto",
    "camion.patente",
    "acoplado.patente",
    "acopladoExtra.patente",
    "cartaDePorte.CTG",
    "kgCargados",
    "kgDescargados",
    "precioGrano",
    "numeroOrdenPago",
  ];

  const headerNames = [
    "Estado",
    "Camión",
    "Tara",
    "Patente Camion",
    "Patente Acoplado",
    "Patente Acoplado Extra",
    "CTG",
    "Kg Cargados",
    "Kg Descargados",
    "Precio Grano",
    "Nro Orden de Pago",
  ];

  // Función auxiliar para renderizar las filas de la tabla
  // En la columna de detalles se muestra un botón “+” que abre el diálogo
  const renderRows = (listaTurnos: any[]) => {
    return listaTurnos.map((turno) => (
      <TableRow key={turno.id}>
        <TableCell>{turno.id}</TableCell>
        <TableCell>{turno.estado ? turno.estado.nombre : "Sin estado"}</TableCell>
        <TableCell>
          <IconButton onClick={() => handleOpenDialog(turno)}>
            <AddIcon />
          </IconButton>
        </TableCell>
      </TableRow>
    ));
  };

  return (
    <>
      <Card sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
        <CardContent sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <Typography
            variant="h6"
            sx={{ textAlign: "center", fontWeight: "bold", mb: 2 }}
          >
            Historial de turnos
          </Typography>

          <Divider sx={{ mb: 2 }} />

          {/* Pestañas: "Recientes" y "Anteriores" */}
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
            sx={{ display: "flex", justifyContent: "space-between" }}
          >
            <Tab label="Recientes" sx={{ flex: 1 }} />
            <Tab label="Anteriores" sx={{ flex: 1 }} />
          </Tabs>

          {/* Contenido de cada pestaña */}
          <Box sx={{ 
            flex: 1, 
            overflow: "auto", 
            mt: 2,
            minHeight: 0, // Permite que el contenedor se reduzca
            maxHeight: '70vh', // Altura máxima relativa
            '& .MuiTableContainer-root': {
              maxHeight: '100%', // Hereda la altura máxima
              overflow: 'auto'
            }
          }}>
            {tabValue === 0 && (
              <>
                {loadingRecent ? (
                  <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
                    <CircularProgress />
                  </Box>
                ) : errorRecent ? (
                  <Typography color="error" sx={{ textAlign: "center" }}>
                    {errorRecent}
                  </Typography>
                ) : (
                  <TableContainer 
                    component={Paper}
                    sx={{
                      '& th': {
                        position: 'sticky',
                        top: 0,
                        backgroundColor: '#fff',
                        zIndex: 1,
                        boxShadow: '0 2px 2px -1px rgba(0,0,0,0.1)'
                      }
                    }}
                  >
                    <Table stickyHeader>
                      <TableHead>
                        <TableRow>
                          <TableCell>Turno</TableCell>
                          <TableCell>Estado</TableCell>
                          <TableCell>Detalles</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {recentData &&
                        recentData.Turnos &&
                        recentData.Turnos.length > 0 ? (
                          renderRows(recentData.Turnos)
                        ) : (
                          <TableRow>
                            <TableCell colSpan={3} sx={{ textAlign: "center" }}>
                              No hay turnos recientes.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </>
            )}

            {tabValue === 1 && (
              <>
                {loadingAnteriores ? (
                  <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
                    <CircularProgress />
                  </Box>
                ) : errorAnteriores ? (
                  <Typography color="error" sx={{ textAlign: "center" }}>
                    {errorAnteriores}
                  </Typography>
                ) : (
                  <TableContainer 
                    component={Paper}
                    sx={{
                      '& th': {
                        position: 'sticky',
                        top: 0,
                        backgroundColor: '#fff',
                        zIndex: 1,
                        boxShadow: '0 2px 2px -1px rgba(0,0,0,0.1)'
                      }
                    }}
                  >
                    <Table >
                      <TableHead>
                        <TableRow>
                          <TableCell>Turno</TableCell>
                          <TableCell>Estado</TableCell>
                          <TableCell>Detalles</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {anterioresData && anterioresData.length > 0 ? (
                          renderRows(anterioresData)
                        ) : (
                          <TableRow>
                            <TableCell colSpan={3} sx={{ textAlign: "center" }}>
                              No hay turnos anteriores.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Diálogo que muestra la CardMobile con la información completa del turno */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>Detalle del turno</DialogTitle>
        <DialogContent>
          {selectedTurno && (
            <CardMobile
              item={selectedTurno}
              index={0}
              fields={fields}
              headerNames={headerNames}
              expandedCard={null}
              handleExpandClick={() => {}}
              handleOpenDialog={() => {}}
              // Puedes ajustar estos campos según lo que desees mostrar en el encabezado
              tituloField="colaborador.nombre"
              subtituloField="colaborador.cuil"
              usarSinDesplegable={true}
              // Deshabilitamos el botón de "Editar" para solo mostrar información
              mostrarBotonEditar={false}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default HistorialTurnos;
