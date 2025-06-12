/* eslint-disable @typescript-eslint/no-explicit-any */
import { useContext, useState } from "react";
import { ContextoGeneral } from "../Contexto";
import CardMobile from "../cards/mobile/CardMobile";
import { Box, Card, CardContent, Divider, Grid, Typography } from "@mui/material";
import { CustomButtom } from "../botones/CustomButtom";
import { DialogCarga } from "./DialogCarga";

interface ContratoItemProps {
    contrato: any;
    onEditContrato: (contrato: any) => void;
    refreshContratos: () => void;
  }
  
  export const ContratoItem = ({ contrato, onEditContrato, refreshContratos }: ContratoItemProps) => {
    const { theme } = useContext(ContextoGeneral);

    const [openCargaDialog, setOpenCargaDialog] = useState(false);
    const [selectedCarga, setSelectedCarga] = useState<any>(null);
  
    const handleOpenCargaDialog = (carga?: any) => {
      setSelectedCarga(carga || null);
      setOpenCargaDialog(true);
    };
  
    const fields = [
      
      "cantidadKm",
      "tarifa",
      "tipoTarifa.nombre",
      "cargamento.nombre"
    ];
    const headerNames = [
    
      "Kilómetros",
      "Tarifa",
      "Unidad",
      "Cargamento"
    ];
  
    const renderCards = () => {
        return (contrato.cargas || []).map((carga: any, index: number) => {
            // Título: nombre de la ubicación y provincia
            const ubicacion = carga.ubicacionCarga?.nombre || "No especificado";
            const provincia = carga.ubicacionCarga?.localidad?.provincia?.nombre || "No especificado";
            // Subtítulo: ubicación de descarga y provincia
            const ubicacionDescarga = carga.ubicacionDescarga?.nombre || "No especificado";
            const provinciaDescarga = carga.ubicacionDescarga?.localidad?.provincia?.nombre || "No especificado";
            const cargaConTitulo = {
                ...carga,
                tituloCustom: `${ubicacion} - ${provincia}`,
                subtituloCustom: `${ubicacionDescarga} - ${provinciaDescarga}`
            };
            return (
                <CardMobile
                    key={carga.id || index}
                    item={cargaConTitulo}
                    index={index}
                    fields={fields}
                    headerNames={headerNames}
                    expandedCard={null}
                    handleExpandClick={() => {}}
                    tituloField="tituloCustom"
                    subtituloField="subtituloCustom"
                    usarSinDesplegable={true}
                />
            );
        });
    };
  
    return (
      <Box
        display="flex"
        flexDirection="row"
        key={contrato.id}
        width={"90%"}
        gap={5}
        marginLeft={"50px"}
        alignItems={"flex-start"}
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
                <Typography variant="h6" textAlign="center" color={theme.colores. azul}>
                  {contrato.destinatario?.razonSocial || "Sin destinatario"}
                </Typography>
              </Grid>
            </Grid>

            <Box display="flex" justifyContent="center" gap={2}>
              <CustomButtom
                onClick={() => handleOpenCargaDialog()} // Sin parámetros
                title="Crear carga +"
              />
              <CustomButtom
                onClick={() => onEditContrato(contrato)}
                title="Editar contrato"
              />
            </Box>
          </CardContent>
        </Card>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            overflowX: 'auto',
            gap: '16px',
            padding: '0px',
            width: '80%',
            alignItems: 'flex-start',
            marginTop: "15px"
          }}
        >
          {renderCards()}
        </Box>

        <DialogCarga 
          open={openCargaDialog}
          onClose={() => {
            setOpenCargaDialog(false);
            refreshContratos();
          }}
          contrato={contrato}
          selectedCarga={selectedCarga}
          refreshContratos={refreshContratos}
        />
      </Box>
    );
  };