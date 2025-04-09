// itemsNav.ts
import {
  AddLocationAltOutlined,
  DomainAddOutlined,
  ErrorOutline,
  GroupsOutlined,
  LocalShippingOutlined,
  ViewInAr,
} from "@mui/icons-material";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import CalculateOutlinedIcon from "@mui/icons-material/CalculateOutlined";
import GridView from "@mui/icons-material/GridView";
import ThunderstormOutlinedIcon from "@mui/icons-material/ThunderstormOutlined";
export interface NavItem {
    label: string;
    ruta: string;
    rolesPermitidos?: number[];
    icono: JSX.Element;
  }
  
  export const navItems: NavItem[] = [
    // Este item es público, sin roles definidos.
    { label: "Home", ruta: "/", rolesPermitidos: [1],icono: <GridView /> },
    // Items protegidos:
    { label: "Cargas", ruta: "/cargas", rolesPermitidos: [1, 2, 3], icono: <ViewInAr /> },
    { label: "Contratos", ruta: "/contratos", rolesPermitidos: [1, 2, 3], icono: <AssignmentOutlinedIcon /> },
    { label: "Choferes", ruta: "/colaboradores", rolesPermitidos: [1, 2, 3], icono: <GroupsOutlined /> },
    { label: "Ubicaciones", ruta: "/ubicaciones", rolesPermitidos: [1, 2], icono: <AddLocationAltOutlined /> },
    { label: "Empresas", ruta: "/empresas", rolesPermitidos: [1, 2, 3], icono: <DomainAddOutlined /> },
    { label: "Camiones", ruta: "/camiones", rolesPermitidos: [1, 2], icono: <LocalShippingOutlined /> },
    { label: "Inconvenientes", ruta: "/inconvenientes", rolesPermitidos: [1, 2], icono: <ErrorOutline /> },
    { label: "Clima", ruta: "/clima", rolesPermitidos: [1, 2], icono: <ThunderstormOutlinedIcon /> },
    { label: "Calculadora", ruta: "/calculadora", rolesPermitidos: [1, 2], icono: <CalculateOutlinedIcon /> },
    { label: "Administrador", ruta: "/admin", rolesPermitidos: [1], icono: <AdminPanelSettingsOutlinedIcon /> },
  ];
  