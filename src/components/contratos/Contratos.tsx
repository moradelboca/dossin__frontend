import { useContext, useEffect, useState } from "react";
import { ContextoGeneral } from "../Contexto";
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  Typography,
} from "@mui/material";
import { CustomButtom } from "../botones/CustomButtom";
import CardMobile from "../cards/mobile/CardMobile";
import ContratoForm from "../forms/contratos/ContratoForm";

export default function Choferes() {
  const { backendURL } = useContext(ContextoGeneral);
  const [contratos, setContratos] = useState<any[]>([]);
  const { theme } = useContext(ContextoGeneral);
  const [cargas, setCargas] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [seleccionado, setSeleccionado] = useState<any>(null);
  const [datos, setDatos] = useState<any[]>([]);

  const refreshContratos = () => {
    fetch(`${backendURL}/contratos`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true",
      },
    })
      .then((response) => response.json())
      .then((contratos) => {
        setContratos(contratos);
      })
      .catch(() => {
        console.error("Error al obtener los cupos disponibles");
      });

    fetch(`${backendURL}/cargas`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true",
      },
    })
      .then((response) => response.json())
      .then((cargas) => {
        setCargas(cargas);
      })
      .catch(() => {
        console.error("Error al obtener los cupos disponibles");
      });
  };
  useEffect(() => {
    refreshContratos();
  }, []);

  const handleOpenDialog = (item: any) => { setSeleccionado(item); setOpen(true); };
  const fields = ["cargamento.id"];
  const headerNames = ["Cargamento"];

  const renderCards = (cargas: any[]) => {
    return cargas?.map((carga, index) => (
      <CardMobile
        key={carga.id || index}
        item={carga}
        index={index}
        fields={fields}
        headerNames={headerNames}
        expandedCard={null}
        handleExpandClick={() => {}}
        handleOpenDialog={() => handleOpenDialog(carga)}
        tituloField="remitenteProductor.nombreFantasia"
        subtituloField="remitenteProductor.cuit"
        usarSinDesplegable={true}
      />
    ));
  };
  const handleClose = () => {
    setSeleccionado(null);
    setOpen(false);
    refreshContratos();
  };

  return (
    <Box p={2}>
      <Box sx={{ display: "flex", flexDirection: "column", mb: 2 }}>
        <Typography
          variant="h5"
          sx={{
            color: theme.colores.azul,
            fontWeight: "bold",
            fontSize: "2rem",
            ml: 1,
          }}
        >
          Contratos
        </Typography>
        <Box
          sx={{ display: "flex", justifyContent: "flex-end", mt: 1, mr: 3 }}
          onClick={() => setOpen(true)}
        >
          <Button sx={{ color: theme.colores.azul }}>Agregar contrato +</Button>
        </Box>
      </Box>

      {contratos.map((contrato) => (
        <Grid
          container
          direction="row"
          key={contrato.id}
          width={"90%"}
          flexWrap={"nowrap"}
          gap={5}
          marginLeft={"50px"}
          alignItems={"center"}
          justifyContent={"center"}
        >
          <Card sx={{ maxWidth: 300, minWidth: 300 }}>
            <CardContent>
              <Typography
                variant="h5"
                color={theme.colores.azul}
                textAlign="center"
              >
                {contrato.titularCartaDePorte?.razonSocial || "Sin titular"}
              </Typography>

              <Divider
                orientation="horizontal"
                flexItem
                sx={{ bgcolor: theme.colores.azul, my: 2 }}
              />

              <Grid
                container
                spacing="10px"
                justifyContent="center"
                padding="28px 0px"
              >
                <Grid item width="100%">
                  <Typography
                    variant="body1"
                    textAlign="center"
                    color={theme.colores.azul}
                  >
                    Destinatario:
                  </Typography>
                  <Typography
                    variant="h6"
                    textAlign="center"
                    color={theme.colores.azul}
                  >
                    {contrato.destinatario?.razonSocial || "Sin destinatario"}
                  </Typography>
                </Grid>
              </Grid>

              <Box display="flex" justifyContent="center" gap={2}>
                <CustomButtom
                  //onClick={() => }
                  title="Crear carga +"
                />
                <CustomButtom
                  onClick={() => handleOpenDialog(contrato)}
                  title="Editar contrato
                  "
                />
              </Box>
            </CardContent>
          </Card>
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
            {renderCards(cargas)}
          </Grid>
          <Dialog open={open} fullWidth maxWidth="md">
            <DialogTitle>asasa</DialogTitle>
            <DialogContent>
              <ContratoForm
                seleccionado={seleccionado}
                datos={datos}
                setDatos={setDatos}
                handleClose={handleClose}
              />
            </DialogContent>
          </Dialog>
          
        </Grid>
      ))}
    </Box>
  );
}
