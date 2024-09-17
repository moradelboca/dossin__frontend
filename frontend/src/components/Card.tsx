import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Typography from "@mui/material/Typography";
import { CardActions } from "@mui/material";
import { ReactNode } from "react";
import { CustomButtom } from "./CustomButtom";
import { styled } from "@mui/material/styles";
import CardActionArea from "@mui/material/CardActionArea";
import Grid from "@mui/material/Grid";
import Divider from "@mui/material/Divider";
import Color from "color";

const CardActionAreaActionArea = styled(CardActionArea)(() => ({
  borderRadius: 16,
  transition: "0.2s",
  "&:hover": {
    transform: "scale(1.1)",
  },
}));

const StyledCard = styled(Card)(({ color }) => ({
  minWidth: 256,
  borderRadius: 16,
  boxShadow: "none",
  "&:hover": {
    boxShadow: `0 6px 12px 0 ${Color(color).rotate(-12).darken(0.2).fade(0.5)}`,
  },
}));

const CardContentContent = styled(CardContent)(({ color }) => ({
  backgroundColor: color,
  padding: "1rem 1.5rem",
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
  marginBottom: "0.5rem", // Added margin for spacing between subtitles
}));

const CustomCard = ({
  color,
  imagen,
  title,
  title2,
  subtitle,
  subtitle2,
  subtitle3,
  subtitle4,
  subtitle5,
}: {
  color: string;
  imagen?: string;
  title?: string;
  title2?: string;
  subtitle?: string;
  subtitle2?: string;
  subtitle3?: string;
  subtitle4?: string;
  subtitle5?: string;
}) => (
  <CardActionAreaActionArea>
    <StyledCard color={color}>
      <CardMedia
        image={imagen}
        sx={{
          width: "100%",
          height: 0,
          paddingBottom: "50%",
          backgroundColor: "rgba(0,0,0,0.08)",
        }}
      />
      <CardContentContent color={color}>
        <TypographyTitle variant={"h1"}>{title}</TypographyTitle>
        <TypographyTitle variant={"h2"}>{title2}</TypographyTitle>
        <Divider sx={{ my: 2, bgcolor: "#163660", height: 1 }} />{" "}
        {/* Adjusted margin and height */}
        <TypographySubtitle>Tarifa: {subtitle}</TypographySubtitle>
        <TypographySubtitle>KM: {subtitle2}</TypographySubtitle>
        <TypographySubtitle>Tipo de Camiones: {subtitle3}</TypographySubtitle>
        <TypographySubtitle>Horarios de Carga: {subtitle4}</TypographySubtitle>
        <TypographySubtitle>
          Horarios de Descarga: {subtitle5}
        </TypographySubtitle>
        <CardActions>
          <CustomButtom title="Ver mas"></CustomButtom>
          <CustomButtom title="Modificar"></CustomButtom>
        </CardActions>
      </CardContentContent>
    </StyledCard>
  </CardActionAreaActionArea>
);

interface Props {
  children: ReactNode;
}
export default function CardUbicacion(props: Props) {
  const { children } = props;
  return <Grid>{children}</Grid>;
}

interface CardBodyProps {
  titleUbis?: string;
  titleFechas?: string;
  textTarifa?: string;
  imagen?: string;
  textKm?: string;
  textCamion?: string;
  textHrCarga?: string;
  textHrDescarga?: string;
}

export function CardBody(props: CardBodyProps) {
  const {
    titleUbis,
    textTarifa,
    imagen,
    titleFechas,
    textCamion,
    textKm,
    textHrCarga,
    textHrDescarga,
  } = props;
  return (
    <CustomCard
      color="#d9d9d9"
      title={titleUbis}
      title2={titleFechas}
      subtitle={textTarifa}
      subtitle2={textKm}
      subtitle3={textCamion}
      subtitle4={textHrCarga}
      subtitle5={textHrDescarga}
      imagen={imagen}
    />
  );
}
