import * as React from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import { CardActions } from "@mui/material";
import { CustomButtom } from "./CustomButtom";
import { styled } from "@mui/material/styles";
import CardActionArea from "@mui/material/CardActionArea";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Avatar from "@mui/material/Avatar";

const CardActionAreaActionArea = styled(CardActionArea)(() => ({
  borderRadius: 16,
  transition: "0.2s",
  "&:hover": {
    transform: "scale(1.1)",
  },
}));

const StyledCard = styled(Card)(() => ({
  minWidth: 256,
  borderRadius: 16,
  boxShadow: "none",
  background: "#d9d9d9",
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

const CardContentContent = styled(CardContent)(({ color }) => ({
  backgroundColor: color,
  padding: "1rem 1.5rem 1.5rem",
  position: "relative",
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

const AvatarBox = styled(Avatar)(() => ({
  transition: "0.3s",
  width: 56, // Mantiene el tamaño del segundo código
  height: 56,
  backgroundColor: "rgba(0, 0, 0, 0.08)", // Fondo del segundo código
  borderRadius: "4rem",
}));

const ContentBox = styled(Box)(() => ({
  display: "flex",
  alignItems: "center", // Align items vertically in the center
  justifyContent: "space-between", // Distribute space between the name and avatar
}));

const NameBox = styled(Box)(() => ({
  display: "flex",
  flexDirection: "column",
}));

const DividerBox = styled(Box)(() => ({
  marginTop: "1rem", // Adjust the margin to push the divider down
}));

const CustomCard = ({
  color,
  imagen,
  titleNombre,
  titleApellido,
  textCuil,
  textCelular,
  textCuitEmpresa,
  textInconveniente,
}: {
  color: string;
  imagen?: string;
  titleNombre?: string;
  titleApellido?: string;
  textCuil?: string;
  textCelular?: string;
  textCuitEmpresa?: string;
  textInconveniente?: string;
}) => (
  <CardActionAreaActionArea>
    <StyledCard color={color}>
      <CardContentContent color={color}>
        <ContentBox>
          <NameBox>
            <TypographyTitle variant={"h1"}>{titleNombre}</TypographyTitle>
            <TypographyTitle variant={"h2"}>{titleApellido}</TypographyTitle>
          </NameBox>
          <AvatarBox>
            <Avatar
              src={imagen}
              sx={{
                width: 56,
                height: 56,
                backgroundColor: "rgba(0,0,0,0.08)",
              }}
            />
          </AvatarBox>
        </ContentBox>
        <DividerBox>
          <Divider sx={{ my: 1, bgcolor: "#163660" }} />
        </DividerBox>
        <TypographySubtitle>Cuil: {textCuil}</TypographySubtitle>
        <TypographySubtitle>Celular: {textCelular}</TypographySubtitle>
        <TypographySubtitle>Cuit Empresa: {textCuitEmpresa}</TypographySubtitle>
        <TypographySubtitle>
          Inconveniente: "{textInconveniente}"
        </TypographySubtitle>
        <CardActions>
          <Box
            sx={{ display: "flex", justifyContent: "center", width: "100%" }}
          >
            <CustomButtom title="Ver mas"></CustomButtom>
          </Box>
        </CardActions>
      </CardContentContent>
    </StyledCard>
  </CardActionAreaActionArea>
);

interface Props {
  children: React.ReactNode;
}

export default function CardInconvenientes(props: Props) {
  const { children } = props;
  return <Box>{children}</Box>;
}

interface CardBodyProps {
  titleNombre?: string;
  titleApellido?: string;
  textCuil?: string;
  imagen?: string;
  textCelular?: string;
  textCuitEmpresa?: string;
  textInconveniente?: string;
}

export function CardBodyIncon(props: CardBodyProps) {
  const {
    titleNombre,
    titleApellido,
    textCuil,
    imagen,
    textCelular,
    textCuitEmpresa,
    textInconveniente,
  } = props;
  return (
    <CustomCard
      color="#d9d9d9"
      titleNombre={titleNombre}
      titleApellido={titleApellido}
      textCuil={textCuil}
      textCelular={textCelular}
      textCuitEmpresa={textCuitEmpresa}
      textInconveniente={textInconveniente}
      imagen={imagen}
    />
  );
}
