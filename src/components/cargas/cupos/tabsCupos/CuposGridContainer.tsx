import React, { useState } from "react";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
} from "@mui/material";
import TurnoForm from "../../../forms/turnos/TurnoForm";
import TurnoGridRow from './TurnoGridRow';
import { TarjetaCupos } from '../TarjetaCupos';

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
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedTurno, setSelectedTurno] = useState<any>(null);

  // Definir los mismos fields y headerNames que CardMobile
  const fields = [
    "colaborador.nombre",
    "colaborador.cuil",
    "estado.nombre",
    "empresa.cuit",
    "tara.pesoNeto",
    "camion.patente",
    "acoplado.patente",
  ];
  const headerNames = [
    "Nombre",
    "Cuil",
    "Estado",
    "Cuit Empresa",
    "Tara",
    "Patente Camión",
    "Patente Acoplado",
  ];

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
                    {headerNames.map((header, idx) => (
                      <TableCell key={idx}>{header}</TableCell>
                    ))}
                    <TableCell>Estado</TableCell>
                    <TableCell>Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {cupo.turnos.map((turno) => (
                    <React.Fragment key={turno.id}>
                      <TurnoGridRow
                        turno={turno}
                        cupo={cupo}
                        refreshCupos={refreshCupos}
                        fields={fields}
                      />
                      {/* Si quieres mantener el collapse para detalles extra, puedes dejarlo aquí o quitarlo si no es necesario */}
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
            idCarga={undefined}
            fechaCupo={undefined}
            datos={cupos}
            setDatos={refreshCupos}
          />
        </DialogContent>
      </Dialog>
    </Box>
  );
};
