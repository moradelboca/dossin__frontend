// ErroresCuposCardsContainer.tsx
import { useState } from "react";
import {
  Box,
  Typography,
  Dialog,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import { Grid2 as Grid } from "@mui/material";
import CancelIcon from "@mui/icons-material/Cancel";
import CardMobile from "../../../cards/mobile/CardMobile";
import TurnoConErroresForm from "../../../forms/turnos/tabs/turnosConErrores/TurnoConErroresForm";

interface Props {
  cupos: any[];
  idCarga: string | undefined;
  refreshCupos: () => void;
}

export function ErroresCuposCardsContainer({ cupos, idCarga, refreshCupos }: Props) {
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedError, setSelectedError] = useState<any>(null);

  const handleOpenDialog = (error: any) => {
    setSelectedError(error);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setSelectedError(null);
    setOpenDialog(false);
  };

  const renderErrorCards = (errores: any[]) => {
    // Definimos los campos y nombres de cabecera para las cards de error
    const fields = [
        "idEstado.nombre",
        "cuilColaborador",
        "cuitEmpresa",
        "patenteCamion",
        "patenteAcoplado",
        "patenteAcopladoExtra",
        "kgCargados",
        "kgDescargados",
        "numeroOrdenPago",
      ];
      
      const headerNames = [
        "Estado",
        "CUIL Colaborador",
        "CUIT Empresa",
        "Patente Camión",
        "Patente Acoplado",
        "Patente Acoplado Extra",
        "Kg Cargados",
        "Kg Descargados",
        "Nro Orden de Pago",
      ];
      


    return errores.map((error, index) => (
      <CardMobile
        key={error.id || index}
        item={error}
        index={index}
        fields={fields}
        headerNames={headerNames}
        expandedCard={null}
        handleExpandClick={() => {}}
        handleOpenDialog={() => handleOpenDialog(error)}
        tituloField="fechaCreacion"
        usarSinDesplegable={true}
      />
    ));
  };

  return (
    <>
      {Array.isArray(cupos) &&
        cupos.map(
          (cupo, index) =>
            cupo.turnosConErrores &&
            cupo.turnosConErrores.length > 0 && (
              <Box key={index} marginBottom={4}>
                <Typography variant="h6" align="center" gutterBottom>
                  {cupo.fecha}
                </Typography>
                <Grid
                  container
                  spacing={2}
                  flexWrap="nowrap"
                  sx={{ overflowX: "auto", padding: "0 35px" }}
                  alignItems="center"
                >
                  {renderErrorCards(cupo.turnosConErrores)}
                </Grid>
              </Box>
            )
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
          <CancelIcon
            sx={{
              color: "red",
              borderRadius: "50%",
              padding: "5px",
              width: "50px",
              height: "50px",
            }}
          />
          <Typography variant="h5">
            <b>Al parecer no hay cupos.</b>
          </Typography>
        </Box>
      )}

        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
          <DialogTitle>
            {selectedError ? "Editar Turno con Error" : "Crear Turno con Error"}
          </DialogTitle>
          <DialogContent>
            <TurnoConErroresForm
              seleccionado={selectedError}
              datos={selectedError ? [selectedError] : []}
              setDatos={() => {
                refreshCupos();
              }}
              handleClose={handleCloseDialog}
              idCarga={idCarga}
            />
          </DialogContent>
        </Dialog>

    </>
  );
}
