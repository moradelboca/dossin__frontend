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
    rolesPermitidos?: string[];
    icono: JSX.Element;
  }
  
  export const navItems: NavItem[] = [
    // Este item es público, sin roles definidos.
    { label: "Home", ruta: "/", icono: <GridView /> },
    // Items protegidos:
    { label: "Cargas", ruta: "/cargas", rolesPermitidos: ["Admin", "Logistica", "Pagos"], icono: <ViewInAr /> },
    { label: "Contratos", ruta: "/contratos", rolesPermitidos: ["Admin", "Logistica", "Pagos"], icono: <AssignmentOutlinedIcon /> },
    { label: "Choferes", ruta: "/colaboradores", rolesPermitidos: ["Admin", "Logistica", "Pagos"], icono: <GroupsOutlined /> },
    { label: "Ubicaciones", ruta: "/ubicaciones", rolesPermitidos: ["Admin", "Logistica"], icono: <AddLocationAltOutlined /> },
    { label: "Empresas", ruta: "/empresas", rolesPermitidos: ["Admin", "Logistica", "Pagos"], icono: <DomainAddOutlined /> },
    { label: "Camiones", ruta: "/camiones", rolesPermitidos: ["Admin", "Logistica"], icono: <LocalShippingOutlined /> },
    { label: "Inconvenientes", ruta: "/inconvenientes", rolesPermitidos: ["Admin", "Logistica"], icono: <ErrorOutline /> },
    { label: "Clima", ruta: "/clima", rolesPermitidos: ["Admin", "Logistica"], icono: <ThunderstormOutlinedIcon /> },
    { label: "Calculadora", ruta: "/calculadora", rolesPermitidos: ["Admin", "Logistica"], icono: <CalculateOutlinedIcon /> },
    { label: "Admin", ruta: "/admin", rolesPermitidos: ["Admin"], icono: <AdminPanelSettingsOutlinedIcon /> },
  ];
  