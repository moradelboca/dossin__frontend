import { Box } from "@mui/material";
import Navbar from "./Navbar";
import Navside from "./Navside";
import { useState } from "react";

export function Nav() {
    const transicion = "width 0.3s ease-in-out";
    const anchoAbierto = 200;
    const anchoCerrado = 60;

    const [navAbierto, setNavAbierto] = useState(false);

    const handleClickToggleNav = () => {
        setNavAbierto(!navAbierto);
    };

    return (
        <Box sx={{ display: "flex" }}>
            <Navbar
                navAbierto={navAbierto}
                anchoAbierto={anchoAbierto}
                anchoCerrado={anchoCerrado}
                transicion={transicion}
            />
            <Navside
                navAbierto={navAbierto}
                handleClickToggleNav={handleClickToggleNav}
                anchoAbierto={anchoAbierto}
                anchoCerrado={anchoCerrado}
                transicion={transicion}
            />
        </Box>
    );
}
