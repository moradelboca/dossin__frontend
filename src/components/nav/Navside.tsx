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
import GridView from "@mui/icons-material/GridView";
import {
  ErrorOutline,
  ViewInAr,
  GroupsOutlined,
  AddLocationAltOutlined,
  DomainAddOutlined,
  LocalShippingOutlined,
} from "@mui/icons-material";
import ThunderstormOutlinedIcon from "@mui/icons-material/ThunderstormOutlined";
import CalculateOutlinedIcon from "@mui/icons-material/CalculateOutlined";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import useMediaQuery from "@mui/material/useMediaQuery";

interface NavsideProps {
  navAbierto: boolean;
  anchoAbierto: number;
  anchoCerrado: number;
  transicion: string;
  onClose?: () => void; // Para cerrar el Drawer en mobile
}

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

export default function Navside({ navAbierto, anchoAbierto, anchoCerrado, transicion, onClose }: NavsideProps) {
  // Detectamos si es mobile (<= 768px)
  const isMobile = useMediaQuery("(max-width:768px)");
  // En mobile, usamos Drawer "temporary"; en escritorio, "permanent"
  const variant = isMobile ? "temporary" : "permanent";
  // El ancho del Drawer se determina según el estado (abierto o cerrado)
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
        {[
          ["Home"],
          [
            "Cargas",
            "Contratos",
            "Choferes",
            "Ubicaciones",
            "Empresas",
            "Camiones",
            "Inconvenientes",
            "Clima",
            "Calculadora",
            "Admin",
          ],
        ].map((list, indexList) => (
          <Box key={indexList} sx={{ color: "#fff" }}>
            <Divider sx={{ backgroundColor: "#fff", opacity: 0.3 }} />
            <List>
              {list.map((text, indexText) => (
                <ListItem
                  key={text}
                  sx={{
                    margin: "5px 10px",
                    padding: "0px",
                    height: "35px",
                    width: navAbierto ? "auto" : "fit-content",
                    "&:active": { color: "#fff" },
                    "& .MuiTouchRipple-root span": { color: "#fff" },
                  }}
                  component={Link}
                  to={
                    indexList === 0
                      ? "/"
                      : [
                          "/cargas",
                          "/contratos",
                          "/colaboradores",
                          "/ubicaciones",
                          "/empresas",
                          "/camiones",
                          "/inconvenientes",
                          "/clima",
                          "/calculadora",
                          "/admin",
                        ][indexText]
                  }
                >
                  <ListItemButton
                    sx={{
                      padding: navAbierto ? "0px 5px" : "5px",
                      borderRadius: "10px",
                    }}
                  >
                    <ListItemIcon sx={{ color: "#fff", minWidth: "unset" }}>
                      {indexList === 0 ? <GridView /> : [
                        <ViewInAr key="viewinar" />,
                        <AssignmentOutlinedIcon key="assignment" />,
                        <GroupsOutlined key="groups" />,
                        <AddLocationAltOutlined key="addlocation" />,
                        <DomainAddOutlined key="domainadd" />,
                        <LocalShippingOutlined key="localshipping" />,
                        <ErrorOutline key="erroroutline" />,
                        <ThunderstormOutlinedIcon key="thunderstorm" />,
                        <CalculateOutlinedIcon key="calculate" />,
                        <AdminPanelSettingsOutlinedIcon key="adminpanel" />,
                      ][indexText]}
                    </ListItemIcon>
                    {navAbierto ? (
                      <ListItemText
                        primary={text}
                        sx={{ marginLeft: "10px", color: "#fff" }}
                      />
                    ) : null}
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Box>
        ))}
      </Box>
    </CustomMuiDrawer>
  );
}
