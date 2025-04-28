import React, { useState } from "react";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Avatar from "@mui/material/Avatar";
import Tooltip from "@mui/material/Tooltip";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { styled } from "@mui/material/styles";
import { ListItemIcon, Box } from "@mui/material";
import { Logout } from "@mui/icons-material";
import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import { useAuth } from "../autenticacion/ContextoAuth";

const CustomToolbar = styled(Toolbar)<{ transicion: string }>(
  ({ transicion }) => ({
    display: "flex",
    justifyContent: "space-between",
    width: "100%",
    background: "#D9D9D9",
    position: "fixed",
    top: 0,
    left: 0,
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
  handleClickToggleNav: () => void;
}

export default function Navbar(props: NavbarProps) {
  const { navAbierto, transicion, handleClickToggleNav } = props;
  const { user, logout } = useAuth();

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
      <CustomToolbar transicion={transicion}>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          {/* Botón hamburguesa para abrir/cerrar el Navside */}
          <IconButton
            onClick={handleClickToggleNav}
            sx={{ mr: 2, color: "#163660" }}
          >
            {navAbierto ? <ChevronLeftIcon /> : <MenuIcon />}
          </IconButton>
          <img
            src="https://i.imgur.com/nmMpZzl.png"
            alt="Logo"
            style={{ height: "40px" }}
          />
        </Box>
        <Tooltip title="Ajustes">
          <IconButton onClick={handleClickAbrirMenuUsuario}>
            <Avatar sx={{ width: 32, height: 32 }}>
              {user?.email[0].toUpperCase()}
            </Avatar>
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
          <MenuItem onClick={() => logout()}>
            <ListItemIcon>
              <Logout sx={{ color: "#163660" }} fontSize="small" />
            </ListItemIcon>
            Logout
          </MenuItem>
        </Menu>
      </CustomToolbar>
    </>
  );
}
