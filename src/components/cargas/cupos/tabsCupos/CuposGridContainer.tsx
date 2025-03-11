import React, { useState } from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Collapse,
  IconButton,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
} from "@mui/material";
import { KeyboardArrowDown, KeyboardArrowUp } from "@mui/icons-material";
import { TarjetaCupos } from "../TarjetaCupos";
import TurnoForm from "../../../forms/turnos/TurnoForm";
import useTransformarCampo from "../../../hooks/useTransformarCampo"; // Ajusta la ruta según corresponda

interface Turno {
  id: number;
  colaborador: { nombre: string; apellido: string; cuil: number };
  empresa: { cuit: number; razonSocial: string; nombreFantasia: string };
  estado: { nombre: string };
  tara: { id: number; pesoNeto: number };
  camion: { patente: string };
  acoplado: { patente: string };
  acopladoExtra: { patente: string };
  numeroCP: number;
  kgCargados: number;
  kgDescargados: number;
  precioGrano: number;
  factura: { id: number; tipoFactura: { id: number; nombre: string } };
  NumOrdenDePago: number;
}

interface Cupo {
  carga: number;
  cupos: number;
  fecha: string;
  turnos: Turno[];
}

interface CuposGridContainerProps {
  cupos: Cupo[];
  refreshCupos: () => void;
}

export const CuposGridContainer: React.FC<CuposGridContainerProps> = ({
  cupos,
  refreshCupos,
}) => {
  const [openRows, setOpenRows] = useState<{ [key: number]: boolean }>({});
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedTurno, setSelectedTurno] = useState<any>(null);
  const [selectedCupo, setSelectedCupo] = useState<any>(null);

  // Hook para transformar campos null o vacíos en "No especificado"
  const transformarCampo = useTransformarCampo();

  const handleToggleRow = (id: number) => {
    setOpenRows((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleOpenDialog = (turno: any, cupo: any) => {
    setSelectedTurno(turno);
    setSelectedCupo(cupo);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setSelectedTurno(null);
    setOpenDialog(false);
  };

  return (
    <Box m={3}>
      {Array.isArray(cupos) &&
        cupos.map((cupo, index) => (
          <Box key={index} mb={4} p={2}>
            {/* Resumen del cupo */}
            <TarjetaCupos
              fecha={cupo.fecha}
              cuposDisponibles={cupo.cupos}
              cuposConfirmados={cupo.turnos.length}
              idCarga={cupo.carga}
              refreshCupos={refreshCupos}
              estaEnElGrid={true} 
              cupos={[]}            
            />

            {/* Tabla de turnos */}
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Nombre</TableCell>
                    <TableCell>Cuil</TableCell>
                    <TableCell>Estado</TableCell>
                    <TableCell>Cuit Empresa</TableCell>
                    <TableCell>Tara</TableCell>
                    <TableCell>Patente Camión</TableCell>
                    <TableCell>Patente Acoplado</TableCell>
                    <TableCell />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {cupo.turnos.map((turno) => (
                    <React.Fragment key={turno.id}>
                      <TableRow>
                        <TableCell>
                          <Typography variant="body2">
                            {transformarCampo("colaborador.nombre", turno)}{" "}
                            {transformarCampo("colaborador.apellido", turno)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {transformarCampo("colaborador.cuil", turno)}
                        </TableCell>
                        <TableCell>
                          {transformarCampo("estado.nombre", turno)}
                        </TableCell>
                        <TableCell>
                          {transformarCampo("empresa.cuit", turno)}
                        </TableCell>
                        <TableCell>
                          {transformarCampo("tara.pesoNeto", turno)}
                        </TableCell>
                        <TableCell>
                          {transformarCampo("camion.patente", turno)}
                        </TableCell>
                        <TableCell>
                          {transformarCampo("acoplado.patente", turno)}
                        </TableCell>
                        <TableCell>
                          <IconButton
                            size="small"
                            onClick={() => handleToggleRow(turno.id)}
                          >
                            {openRows[turno.id] ? (
                              <KeyboardArrowUp />
                            ) : (
                              <KeyboardArrowDown />
                            )}
                          </IconButton>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell
                          style={{ paddingBottom: 0, paddingTop: 0 }}
                          colSpan={8}
                        >
                          <Collapse
                            in={openRows[turno.id]}
                            timeout="auto"
                            unmountOnExit
                          >
                            <Box margin={2}>
                              <Box display="flex" alignItems="center">
                                <Typography
                                  variant="body2"
                                  fontWeight="bold"
                                  mr={1}
                                >
                                  Patente Acoplado Extra:
                                </Typography>
                                <Typography variant="body2">
                                  {transformarCampo("acopladoExtra.patente", turno)}
                                </Typography>
                              </Box>

                              <Box display="flex" alignItems="center">
                                <Typography
                                  variant="body2"
                                  fontWeight="bold"
                                  mr={1}
                                >
                                  Número CP:
                                </Typography>
                                <Typography variant="body2">
                                  {transformarCampo("numeroCP", turno)}
                                </Typography>
                              </Box>

                              <Box display="flex" alignItems="center">
                                <Typography
                                  variant="body2"
                                  fontWeight="bold"
                                  mr={1}
                                >
                                  Kg Cargados:
                                </Typography>
                                <Typography variant="body2">
                                  {transformarCampo("kgCargados", turno)}
                                </Typography>
                              </Box>

                              <Box display="flex" alignItems="center">
                                <Typography
                                  variant="body2"
                                  fontWeight="bold"
                                  mr={1}
                                >
                                  Kg Descargados:
                                </Typography>
                                <Typography variant="body2">
                                  {transformarCampo("kgDescargados", turno)}
                                </Typography>
                              </Box>

                              <Box display="flex" alignItems="center">
                                <Typography
                                  variant="body2"
                                  fontWeight="bold"
                                  mr={1}
                                >
                                  Precio Grano:
                                </Typography>
                                <Typography variant="body2">
                                  {transformarCampo("precioGrano", turno)}
                                </Typography>
                              </Box>

                              <Box display="flex" alignItems="center">
                                <Typography
                                  variant="body2"
                                  fontWeight="bold"
                                  mr={1}
                                >
                                  Nro Orden de Pago:
                                </Typography>
                                <Typography variant="body2">
                                  {transformarCampo("NumOrdenDePago", turno)}
                                </Typography>
                              </Box>

                              {/* Botón para editar turno */}
                              <Box display="flex" justifyContent="flex-start" mt={2}>
                                <Button
                                  variant="contained"
                                  onClick={() => handleOpenDialog(turno, cupo)}
                                >
                                  Editar Turno
                                </Button>
                              </Box>
                            </Box>
                          </Collapse>
                        </TableCell>
                      </TableRow>
                    </React.Fragment>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        ))}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>Editar Turno</DialogTitle>
        <DialogContent>
          <TurnoForm
            seleccionado={selectedTurno}
            handleClose={handleCloseDialog}
            idCarga={selectedCupo?.carga}
            fechaCupo={selectedCupo?.fecha} // Se pasa la fecha del cupo
            datos={cupos}
            setDatos={refreshCupos}
          />
        </DialogContent>
      </Dialog>
    </Box>
  );
};
