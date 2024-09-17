import React, { useState } from "react";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Avatar from "@mui/material/Avatar";
import Tooltip from "@mui/material/Tooltip";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Typography from "@mui/material/Typography";
import { styled } from "@mui/material/styles";

const CustomToolbar = styled(Toolbar)<{ ancho?: number; transicion: string }>(
    ({ ancho, transicion }) => ({
        justifyContent: "space-between",
        width: `calc(100% - ${ancho}px + 1px)`,
        background: "#D9D9D9",
        position: "fixed",
        top: 0,
        right: 0,
        height: "65px",
        zIndex: 1000,
        transition: transicion,
    })
);

interface NavbarProps {
    navAbierto: boolean;
    anchoAbierto: number;
    anchoCerrado: number;
    transicion: string;
}

export default function Navbar(props: NavbarProps) {
    const { navAbierto, anchoAbierto, anchoCerrado, transicion } = props;

    const [anchorMenuUsuario, setAnchorMenuUsuario] =
        useState<null | HTMLElement>(null);

    const handleClickAbrirMenuUsuario = (
        event: React.MouseEvent<HTMLElement>
    ) => {
        setAnchorMenuUsuario(event.currentTarget);
    };

    const handleClickCerrarMenuUsuario = () => {
        setAnchorMenuUsuario(null);
    };

    return (
        <>
            <CustomToolbar
                ancho={navAbierto ? anchoAbierto : anchoCerrado}
                transicion={transicion}
            >
                <img
                    src="/images/logo.png"
                    alt="Logo"
                    style={{ height: "40px" }}
                />
                <Tooltip title="Open settings">
                    <IconButton onClick={handleClickAbrirMenuUsuario}>
                        <Avatar
                            alt="Remy Sharp"
                            src="/static/images/avatar/2.jpg"
                        />
                    </IconButton>
                </Tooltip>
                <Menu
                    sx={{ mt: "45px" }}
                    id="menu-appbar"
                    anchorEl={anchorMenuUsuario}
                    anchorOrigin={{
                        vertical: "top",
                        horizontal: "right",
                    }}
                    keepMounted
                    transformOrigin={{
                        vertical: "top",
                        horizontal: "right",
                    }}
                    open={Boolean(anchorMenuUsuario)}
                    onClose={handleClickCerrarMenuUsuario}
                >
                    {["Logout"].map((setting) => (
                        <MenuItem
                            key={setting}
                            onClick={handleClickCerrarMenuUsuario}
                        >
                            <Typography sx={{ textAlign: "center" }}>
                                {setting}
                            </Typography>
                        </MenuItem>
                    ))}
                </Menu>
            </CustomToolbar>
        </>
    );
}
