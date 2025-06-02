import {
  Box,
  Typography,
  Dialog,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import { Grid2 as Grid } from "@mui/material";
import { TarjetaCupos } from "../TarjetaCupos";
import CardMobile from "../../../cards/mobile/CardMobile";
import CancelIcon from "@mui/icons-material/Cancel";
import { useState } from "react";
import TurnoForm from "../../../forms/turnos/TurnoForm";

interface Props {
  cupos: any[];
  fields: string[];
  headerNames: string[];
  idCarga: string | undefined;
  refreshCupos: () => void;
}

export function CuposCardsContainer({
  cupos,
  fields,
  headerNames,
  idCarga,
  refreshCupos,
}: Props) {
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedTurno, setSelectedTurno] = useState<any>(null);
  const [selectedCupo, setSelectedCupo] = useState<any>(null);

  const handleOpenDialog = async (turno: any, cupo: any) => {
    setSelectedTurno(null);
    setSelectedCupo(cupo);
    setOpenDialog(true);
    try {
      const backendURL = import.meta.env.VITE_BACKEND_URL || '';
      const response = await fetch(`${backendURL}/cargas/${cupo.carga}/cupos/${cupo.fecha}/turnos/${turno.id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
      });
      const turnoDetalle = await response.json();
      setSelectedTurno(turnoDetalle);
    } catch (e) {
      setSelectedTurno(turno); // fallback a datos básicos
    }
  };

  const handleCloseDialog = () => {
    setSelectedTurno(null);
    setOpenDialog(false);
  };

  const renderCards = (turnos: any[], cupo: any) => {
    return turnos?.map((turno, index) => {
      const textoBoton =
        turno?.estado?.nombre === "Validado"
          ? "Validar turno"
          : turno?.estado?.nombre === "conErrores"
            ? "Corregir turno"
            : "";

      return (
        <CardMobile
          key={turno.id || index}
          item={turno}
          index={index}
          fields={fields}
          headerNames={headerNames}
          expandedCard={null}
          handleExpandClick={() => {}}
          handleOpenDialog={() => handleOpenDialog(turno, cupo)}
          tituloField="colaborador.nombre"
          subtituloField="colaborador.cuil"
          usarSinDesplegable={true}
          textoBoton={textoBoton}
          refreshCupos={refreshCupos}
          cupo={cupo}
        />
      );
    });
  };

  return (
    <>
      {Array.isArray(cupos) &&
        cupos.map((cupo, index) => (
          <Grid
            container
            direction="row"
            key={index}
            width={"90%"}
            spacing={5}
            flexWrap={"nowrap"}
            marginLeft={"50px"}
            alignItems={"center"}
            justifyContent={"center"}
          >
            <TarjetaCupos
              fecha={cupo.fecha}
              cuposDisponibles={cupo.cupos}
              cuposConfirmados={cupo.turnos?.length}
              idCarga={idCarga}
              refreshCupos={refreshCupos}
              cupos={cupos}
            />

            <Grid
              container
              spacing={5}
              flexWrap={"nowrap"}
              sx={{ overflowX: "scroll" }}
              width={"80%"}
              minHeight={"380px"}
              alignItems={"center"}
              padding={"35px"}
            >
              {renderCards(cupo.turnos, cupo)}
            </Grid>
          </Grid>
        ))}

      {cupos.length === 0 && (
        <Box
          display={"flex"}
          flexDirection={"row"}
          width={"100%"}
          justifyContent={"center"}
          alignItems={"center"}
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

      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedTurno ? "Editar Turno" : "Crear Turno"}
        </DialogTitle>
        <DialogContent>
          <TurnoForm
            seleccionado={selectedTurno}
            handleClose={handleCloseDialog}
            idCarga={idCarga}
            fechaCupo={selectedCupo?.fecha} // Pasar la fecha del cupo al formulario
            datos={cupos}
            setDatos={refreshCupos}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
