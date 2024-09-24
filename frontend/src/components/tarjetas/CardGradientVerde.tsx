import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { CardActions } from "@mui/material";
import CardActionArea from "@mui/material/CardActionArea";
import Divider from "@mui/material/Divider";
import { styled } from "@mui/material/styles";
import Color from "color"; // v3.2.1
import { CustomButtom } from "./botones/CustomButtom";
import { useState } from "react";
import { CustomBotonCamion } from "./botones/CustomBotonCamion";

const defaultColor = "#d9d9d9"; // Gris claro

const StyledRoot = styled("div")<{ color?: string }>(() => ({
  position: "relative",
  borderRadius: "1rem",
  minWidth: 256,
  paddingTop: 0,
  "&:before": {
    transition: "0.2s",
    position: "absolute",
    width: "100%",
    height: "100%",
    content: '""',
    display: "block",
    borderRadius: "1rem",
    zIndex: 0,
    bottom: 0,
  },
  "&:hover": {
    "&:before": {
      bottom: -6,
    },
    "& .MuiAvatar-root": {
      transform: "scale(1.1)",
      boxShadow: "0 6px 20px 0 rgba(0,0,0,0.38)",
    },
  },
}));

const StyledContent = styled("div")<{ color?: string; gradientColor?: string }>(
  ({ gradientColor = defaultColor }) => ({
    position: "relative",
    maxWidth: 270,
    zIndex: 1,
    padding: "1rem 1.5rem 1.5rem",
    borderRadius: "1rem",
    boxShadow: `0 6px 16px 0 ${Color("#000000").fade(0.5)}`,
    "&:before": {
      content: '""',
      display: "block",
      position: "absolute",
      left: 0,
      top: 1,
      zIndex: 0,
      width: "100%",
      height: "100%",
      borderRadius: "1rem",
      background: `linear-gradient(160deg, #D9D9D9 55%, ${gradientColor} 100%)`,
    },
  })
);

const AvatarLogo = styled(Avatar)(() => ({
  transition: "0.3s",
  width: 56, // Mantiene el tamaño
  height: 56,
  backgroundColor: "rgba(0, 0, 0, 0.08)", // Fondo
  borderRadius: "4rem",
}));

const CardActionAreaActionArea = styled(CardActionArea)(() => ({
  borderRadius: 16,
  transition: "0.2s",
  "&:hover": {
    transform: "scale(1.1)",
  },
}));

const TypographyTitle = styled(Typography)(() => ({
  fontFamily: "Arial",
  fontSize: "1rem",
  color: "#163660",
  textTransform: "uppercase",
}));

const TypographySubtitle = styled(Typography)(() => ({
  fontFamily: "Arial",
  color: "#163660",
  opacity: 0.87,
  fontWeight: 500,
  fontSize: 14,
}));

const AvatarBox = styled(Box)(() => ({
  display: "flex",
  alignItems: "center",
}));

const ContentBox = styled(Box)(() => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
}));

const NameBox = styled(Box)(() => ({
  display: "flex",
  flexDirection: "column",
}));

const DividerBox = styled(Box)(() => ({
  marginTop: "1rem",
}));

interface TarjetaProps {
  titleNombre?: string;
  titleApellido?: string;
  textCuil?: string;
  imagen?: string;
  textCelular?: string;
  textCuitEmpresa?: string;
  textPatenteCamion?: string;
  textPatenteSemi1?: string;
  textPatenteSemi2?: string;
}

export function TarjetaChoferesCarga(props: TarjetaProps) {
  const [confirmado, setConfirmado] = useState(false);
  const handleClickConfirmar = () => {
    setConfirmado(true);
  };
  const {
    titleNombre,
    titleApellido,
    textCuil,
    textCelular,
    textCuitEmpresa,
    textPatenteCamion,
    textPatenteSemi1,
    textPatenteSemi2,
    imagen,
  } = props;

  return (
    <Box width="300px">
      <CardActionAreaActionArea>
        <StyledRoot>
          <StyledContent gradientColor={confirmado ? "#76D766" : "#A5A5A5"}>
            <Box position={"relative"} zIndex={1}>
              <ContentBox>
                <NameBox>
                  <TypographyTitle variant={"h1"}>
                    {titleNombre}
                  </TypographyTitle>
                  <TypographyTitle variant={"h2"}>
                    {titleApellido}
                  </TypographyTitle>
                </NameBox>
                <AvatarBox>
                  <AvatarLogo src={imagen} />
                </AvatarBox>
              </ContentBox>
              <DividerBox>
                <Divider sx={{ my: 1, bgcolor: "#163660" }} />
              </DividerBox>
              <TypographySubtitle>Cuil: {textCuil}</TypographySubtitle>
              <TypographySubtitle>Celular: {textCelular}</TypographySubtitle>
              <TypographySubtitle>
                Cuit Empresa: {textCuitEmpresa}
              </TypographySubtitle>
              <TypographySubtitle>
                Patente Camion: {textPatenteCamion}
              </TypographySubtitle>
              <TypographySubtitle>
                Patente Semi 1: {textPatenteSemi1}
              </TypographySubtitle>
              <TypographySubtitle>
                Patente Semi 2: {textPatenteSemi2}
              </TypographySubtitle>
              <CardActions>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-evenly",
                    width: "100%",
                  }}
                >
                  {/* Botón "Contactar" */}
                  <CustomButtom
                    title="Contactar"
                    onClick={() =>
                      window.open(`https://wa.me/${textCelular}`, "_blank")
                    }
                  />

                  {/* Botón "Confirmar", solo si no está confirmado */}
                  {!confirmado ? (
                    <CustomButtom
                      onClick={handleClickConfirmar}
                      title="Confirmar"
                    />
                  ) : null}
                </Box>
              </CardActions>
            </Box>
          </StyledContent>
        </StyledRoot>
      </CardActionAreaActionArea>
    </Box>
  );
}
