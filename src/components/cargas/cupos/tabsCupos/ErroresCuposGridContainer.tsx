// ErroresCuposGridContainer.tsx
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
import TurnoConErroresForm from "../../../forms/turnos/tabs/turnosConErrores/TurnoConErroresForm";
import useTransformarCampo from "../../../hooks/useTransformarCampo";

interface TurnoError {
  id: number;
  colaborador: { nombre: string; apellido: string; cuil: number };
  empresa: { cuit: number; razonSocial: string; nombreFantasia: string };
  idEstado: { id: number; nombre: string };
  tara: { id: number; pesoNeto: number };
  camion: { patente: string };
  acoplado: { patente: string };
  acopladoExtra: { patente: string };
  kgCargados: number;
  kgDescargados: number;
  numeroOrdenPago: number;
  fechaCreacion: string;
}

interface Cupo {
  carga: number;
  cupos: number;
  fecha: string;
  turnosConErrores: TurnoError[];
}

interface ErroresCuposGridContainerProps {
  cupos: Cupo[];
  idCarga: string | undefined;
  refreshCupos: () => void;
}

export const ErroresCuposGridContainer: React.FC<ErroresCuposGridContainerProps> = ({
  cupos,
  idCarga,
  refreshCupos,
}) => {
  const [openRows, setOpenRows] = useState<{ [key: number]: boolean }>({});
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedTurno, setSelectedTurno] = useState<any>(null);

  const transformarCampo = useTransformarCampo();

  const handleToggleRow = (id: number) => {
    setOpenRows((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleOpenDialog = (turno: any) => {
    setSelectedTurno(turno);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setSelectedTurno(null);
    setOpenDialog(false);
  };

  return (
    <Box m={3}>
      {Array.isArray(cupos) &&
        cupos.map((cupo, index) =>
          cupo.turnosConErrores && cupo.turnosConErrores.length > 0 ? (
            <Box key={index} mb={4} p={2}>
              {/* Resumen del cupo */}
              <Typography variant="h5" fontWeight="bold">{cupo.fecha}</Typography>

              {/* Tabla de turnos con errores */}
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>ID</TableCell>
                      <TableCell>CUIL Colaborador</TableCell>
                      <TableCell>CUIT Empresa</TableCell>
                      <TableCell>Patente Camión</TableCell>
                      <TableCell>Patente Acoplado</TableCell>
                      <TableCell>Patente Acoplado Extra</TableCell>
                      <TableCell />
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {cupo.turnosConErrores.map((turno) => (
                      <React.Fragment key={turno.id}>
                        <TableRow>
                          <TableCell>
                            {transformarCampo("id", turno)}
                          </TableCell>
                          <TableCell>
                            {transformarCampo("colaborador.cuil", turno)}
                          </TableCell>
                          <TableCell>
                            {transformarCampo("empresa.cuit", turno)}
                          </TableCell>
                          <TableCell>
                            {transformarCampo("camion.patente", turno)}
                          </TableCell>
                          <TableCell>
                            {transformarCampo("acoplado.patente", turno)}
                          </TableCell>
                          <TableCell>
                            {transformarCampo("acopladoExtra.patente", turno)}
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
                          <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={10}>
                            <Collapse in={openRows[turno.id]} timeout="auto" unmountOnExit>
                              <Box margin={2}>
                                <Box display="flex" alignItems="center">
                                  <Typography variant="body2" fontWeight="bold" mr={1}>
                                    Fecha Creación:
                                  </Typography>
                                  <Typography variant="body2">
                                    {transformarCampo("fechaCreacion", turno)}
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
                                {/* Agrega más detalles si es necesario */}
                                <Box display="flex" justifyContent="flex-start" mt={2}>
                                  <Button
                                    variant="contained"
                                    onClick={() => handleOpenDialog(turno)}
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
          ) : null
        )}

      {cupos.length === 0 && (
        <Box
          display="flex"
          flexDirection="row"
          width="100%"
          justifyContent="center"
          alignItems="center"
          gap={3}
        >
          <Typography variant="h5">
            <b>Al parecer no hay cupos.</b>
          </Typography>
        </Box>
      )}

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>Editar Turno con Error</DialogTitle>
        <DialogContent>
          <TurnoConErroresForm
            seleccionado={selectedTurno}
            datos={selectedTurno ? [selectedTurno] : []}
            setDatos={() => refreshCupos()}
            handleClose={handleCloseDialog} 
            idCarga={idCarga}/>
        </DialogContent>
      </Dialog>
    </Box>
  );
};
