import BasicButtons, { IconButtonWithLabel } from "./IconButton";
import Sidenav, { NavBody } from "./Sidenav";
import { AccessAlarmOutlined } from "@mui/icons-material";
import { CenterAutoplay } from "./CarouselUbis";

export function ContainerCargas() {
  return (
    <Sidenav>
      <NavBody />
      <BasicButtons>
        <IconButtonWithLabel title="Ver más" icon={<AccessAlarmOutlined />} />
      </BasicButtons>
      <CenterAutoplay />
    </Sidenav>
  );
}
