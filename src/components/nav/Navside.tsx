import { styled } from "@mui/material/styles";
import Box from "@mui/material/Box";
import MuiDrawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import Divider from "@mui/material/Divider";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import { Link } from "react-router-dom";
import { ListItemButton } from "@mui/material";
import useMediaQuery from "@mui/material/useMediaQuery";
import { ProtectedComponent } from "../protectedComponent/ProtectedComponent";
import { navItems, NavItem } from "./itemsNav"; // Asegúrate de la ruta correcta
import Tooltip from '@mui/material/Tooltip';

const CustomMuiDrawer = styled(MuiDrawer)<{
  ancho?: number;
  transicion: string;
}>(({ ancho, transicion }) => ({
  width: ancho,
  flexShrink: 0,
  whiteSpace: "nowrap",
  boxSizing: "border-box",
  transition: transicion,
  position: "fixed",
  top: "65px", // Debajo del Navbar
  left: 0,
  height: "calc(100% - 65px)",
  zIndex: 1200,
  "& .MuiDrawer-paper": {
    width: ancho,
    transition: transicion,
    overflowX: "hidden",
    position: "fixed",
    top: "65px",
    left: 0,
    height: "calc(100% - 65px)",
    zIndex: 1200,
  },
}));

export default function Navside({
  navAbierto,
  anchoAbierto,
  anchoCerrado,
  transicion,
  onClose,
}: {
  navAbierto: boolean;
  anchoAbierto: number;
  anchoCerrado: number;
  transicion: string;
  onClose?: () => void;
}) {
  const isMobile = useMediaQuery("(max-width:768px)");
  const variant = isMobile ? "temporary" : "permanent";
  const drawerWidth = navAbierto ? anchoAbierto : anchoCerrado;

  return (
    <CustomMuiDrawer
      variant={variant}
      open={isMobile ? navAbierto : true}
      onClose={isMobile ? onClose : undefined}
      ModalProps={{ hideBackdrop: true }}
      ancho={drawerWidth}
      transicion={transicion}
    >
      <Box sx={{ background: "#163660", height: "100%" }}>
        <Divider sx={{ backgroundColor: "#fff", opacity: 0.3 }} />
        <List>
          {navItems.map((item: NavItem) => {
            const listItem = (
              <ListItem
                key={item.label}
                sx={{
                  margin: "5px 10px",
                  padding: "0px",
                  height: "35px",
                  width: navAbierto ? "auto" : "fit-content",
                  "&:active": { color: "#fff" },
                  "& .MuiTouchRipple-root span": { color: "#fff" },
                }}
                component={Link}
                to={item.ruta}
              >
                <Tooltip title={!navAbierto ? item.label : ""} placement="right" arrow>
                  <ListItemButton
                    sx={{
                      padding: navAbierto ? "0px 5px" : "5px",
                      borderRadius: "10px",
                    }}
                  >
                    <ListItemIcon sx={{ color: "#fff", minWidth: "unset" }}>
                      {item.icono}
                    </ListItemIcon>
                    {navAbierto && (
                      <ListItemText
                        primary={item.label}
                        sx={{ marginLeft: "10px", color: "#fff" }}
                      />
                    )}
                  </ListItemButton>
                </Tooltip>
              </ListItem>
            );

            // Si el item tiene roles definidos, lo envolvemos en ProtectedComponent
            if (item.rolesPermitidos) {
              return (
                <ProtectedComponent key={item.label} allowedRoles={item.rolesPermitidos}>
                  {listItem}
                </ProtectedComponent>
              );
            }

            // Si no tiene roles (por ejemplo "Home"), lo renderizamos normalmente
            return listItem;
          })}
        </List>
      </Box>
    </CustomMuiDrawer>
  );
}
