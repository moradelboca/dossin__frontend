import Grid from "@mui/material/Grid2";
import { TarjetaChoferesCarga } from "./CardGradientVerde";

type Props = {};

export default function CardGridCupos({}: Props) {
  return (
    <Grid>
      <TarjetaChoferesCarga
        titleNombre="Jose Luis"
        titleApellido="Cuello"
        textCuil="20xxxxx"
        imagen="https://images.pexels.com/photos/20787/pexels-photo.jpg?auto=compress&cs=tinysrgb&h=350"
        textCelular="3522222"
        textCuitEmpresa="30xxxxxx"
        textPatenteCamion="AB123CD"
        textPatenteSemi1="ABC123"
        textPatenteSemi2="NULL"
      />
    </Grid>
  );
}
