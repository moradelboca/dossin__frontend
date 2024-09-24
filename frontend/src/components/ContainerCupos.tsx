import { Box, Grid2 as Grid } from "@mui/material";
import { BotonIcon } from "./botones/IconButton";
import { AccessAlarmOutlined } from "@mui/icons-material";
import { TarjetaCupos } from "./tarjetas/TarjetaCupos";

export function ContainerCupos() {
  return (
    <>
      <Box display="flex" justifyContent="center" width="100%">
        <Grid
          container
          direction="column"
          alignItems="center"
          justifyContent="center"
          spacing={10}
          sx={{
            maxWidth: "100vw", // Máximo ancho relativo al tamaño de la pantalla (90% del ancho de la ventana)
            minWidth: "100vw", // Mínimo ancho relativo al tamaño de la pantalla (60% del ancho de la ventana)
            width: "100%",
          }}
        >
          <Grid>
            <BotonIcon
              title="Quiero crear un nuevo"
              icon={<AccessAlarmOutlined />}
            />
          </Grid>
          <Grid
            container
            direction="row"
            alignItems="flex-start"
            spacing={10}
            justifyContent="flex-start"
          >
            <TarjetaCupos
              fecha="11 de agosto"
              cuposDisponibles={5}
              cuposConfirmados={4}
            />
            <Grid container spacing={2}>
              <TarjetaCupos
                fecha="11 de agosto"
                cuposDisponibles={5}
                cuposConfirmados={4}
              />
              <TarjetaCupos
                fecha="11 de agosto"
                cuposDisponibles={5}
                cuposConfirmados={4}
              />
              <TarjetaCupos
                fecha="11 de agosto"
                cuposDisponibles={5}
                cuposConfirmados={4}
              />
            </Grid>
          </Grid>
        </Grid>
      </Box>
    </>
  );
}
