import { Grid2 as Grid } from "@mui/material";
import { CustomBotonCamion } from "./botones/CustomBotonCamion";

type Props = {};

export default function SelectorDeAcoplados({}: Props) {
  const botonesApretados: string[] = [];
  const titulos = [
    "Batea",
    "Semirremolque",
    "Sider",
    "Equipo",
    "Tolva",
    "Bitren",
    "Carreton",
    "Porta-Cont",
  ];
  const imagenes = [
    "https://i.imgur.com/KmmClLu.png",
    "https://i.imgur.com/fUnL2CF.png",
    "https://i.imgur.com/JFHczdM.png",
    "https://i.imgur.com/UMkk15q.png",
    "https://i.imgur.com/UbJRJjz.png",
    "https://i.imgur.com/3kZfptL.png",
    "https://i.imgur.com/rJXPRGw.png",
    "https://i.imgur.com/VNQNsnN.png",
  ];
  return (
    <Grid
      container
      sx={{
        maxWidth: 800,
        margin: "0 auto",
        justifyContent: "center",
        gap: "15px",
      }}
    >
      {titulos.map((titulo, indice) => (
        <CustomBotonCamion
          key={titulo}
          imageSrc={imagenes[indice]}
          title={titulo}
          array={botonesApretados}
        />
      ))}
    </Grid>
  );
}
