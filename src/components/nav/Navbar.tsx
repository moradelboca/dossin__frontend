import React, { useState } from "react";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Avatar from "@mui/material/Avatar";
import Tooltip from "@mui/material/Tooltip";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Typography from "@mui/material/Typography";
import { styled } from "@mui/material/styles";
import { Divider, ListItemIcon } from "@mui/material";
import { Logout, PersonAdd, Settings } from "@mui/icons-material";

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
                <Tooltip title="Ajustes">
                    <IconButton onClick={handleClickAbrirMenuUsuario}>
                        <Avatar sx={{ width: 32, height: 32 }}>M</Avatar>
                    </IconButton>
                </Tooltip>
                <Menu
                    anchorEl={anchorMenuUsuario}
                    id="account-menu"
                    open={Boolean(anchorMenuUsuario)}
                    onClose={handleClickCerrarMenuUsuario}
                    onClick={handleClickCerrarMenuUsuario}
                    slotProps={{
                        paper: {
                            elevation: 0,
                            sx: {
                                overflow: "visible",
                                filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
                                mt: 1.5,
                                "& .MuiAvatar-root": {
                                    width: 32,
                                    height: 32,
                                    ml: -0.5,
                                    mr: 1,
                                },
                                "&::before": {
                                    content: '""',
                                    display: "block",
                                    position: "absolute",
                                    top: 0,
                                    right: 14,
                                    width: 10,
                                    height: 10,
                                    bgcolor: "background.paper",
                                    transform: "translateY(-50%) rotate(45deg)",
                                    zIndex: 0,
                                },
                            },
                        },
                    }}
                    transformOrigin={{ horizontal: "right", vertical: "top" }}
                    anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
                >
                    <MenuItem onClick={handleClickCerrarMenuUsuario}>
                        <Avatar /> Perfil
                    </MenuItem>
                    <MenuItem onClick={handleClickCerrarMenuUsuario}>
                        <Avatar />
                        Mi cuenta
                    </MenuItem>
                    <Divider />
                    <MenuItem onClick={handleClickCerrarMenuUsuario}>
                        <ListItemIcon>
                            <PersonAdd fontSize="small" />
                        </ListItemIcon>
                        Agregar otra cuenta
                    </MenuItem>
                    <MenuItem onClick={handleClickCerrarMenuUsuario}>
                        <ListItemIcon>
                            <Settings fontSize="small" />
                        </ListItemIcon>
                        Ajustes
                    </MenuItem>
                    <MenuItem onClick={handleClickCerrarMenuUsuario}>
                        <ListItemIcon>
                            <Logout fontSize="small" />
                        </ListItemIcon>
                        Logout
                    </MenuItem>
                </Menu>
            </CustomToolbar>
        </>
    );
}
