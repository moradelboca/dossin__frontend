import BasicButtons, { IconButtonWithLabel } from "./IconButton";
import { AccessAlarmOutlined } from "@mui/icons-material";
import { CenterAutoplay } from "./CarouselUbis";

export function ContainerCargas() {
    return (
        <>
            <BasicButtons>
                <IconButtonWithLabel
                    title="Ver más"
                    icon={<AccessAlarmOutlined />}
                />
            </BasicButtons>
            <CenterAutoplay />
        </>
    );
}
