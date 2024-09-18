import BasicButtons, { BotonIcon } from "./IconButton";
import { AccessAlarmOutlined } from "@mui/icons-material";
import { CarouselUbis } from "./CarouselUbis";

export function ContainerCargas() {
  return (
    <>
      <BotonIcon title="Ver más" icon={<AccessAlarmOutlined />} />
      <CarouselUbis />
    </>
  );
}
