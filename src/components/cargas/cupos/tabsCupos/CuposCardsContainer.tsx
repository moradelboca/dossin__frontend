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
  estadoCarga: string;
}

export function CuposCardsContainer({
  cupos,
  fields,
  headerNames,
  idCarga,
  refreshCupos,
  estadoCarga,
}: Props) {
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedTurno, setSelectedTurno] = useState<any>(null);

  const handleCloseDialog = () => {
    setSelectedTurno(null);
    setOpenDialog(false);
  };

  const renderCards = (turnos: any[], cupo: any) => {
    return turnos?.map((turno, index) => {
      const textoBoton = "Ver Detalle";

      return (
        <CardMobile
          key={turno.id || index}
          item={turno}
          index={index}
          fields={fields}
          headerNames={headerNames}
          expandedCard={null}
          handleExpandClick={() => {}}
          tituloField="nombreColaborador"
          subtituloField="nombreEmpresa"
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

      {cupos.length === 0 && estadoCarga === 'Cargado' && (
        <Box
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
          width="100%"
          minHeight="60vh"
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
            fechaCupo={undefined}
            datos={cupos}
            setDatos={refreshCupos}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
