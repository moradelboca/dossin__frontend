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
    { label: "Home", ruta: "/", rolesPermitidos: ["Administrador"],icono: <GridView /> },
    // Items protegidos:
    { label: "Cargas", ruta: "/cargas", rolesPermitidos: ["Administrador", "Logistica", "Pagos"], icono: <ViewInAr /> },
    { label: "Contratos", ruta: "/contratos", rolesPermitidos: ["Administrador", "Logistica", "Pagos"], icono: <AssignmentOutlinedIcon /> },
    { label: "Choferes", ruta: "/colaboradores", rolesPermitidos: ["Administrador", "Logistica", "Pagos"], icono: <GroupsOutlined /> },
    { label: "Ubicaciones", ruta: "/ubicaciones", rolesPermitidos: ["Administrador", "Logistica"], icono: <AddLocationAltOutlined /> },
    { label: "Empresas", ruta: "/empresas", rolesPermitidos: ["Administrador", "Logistica", "Pagos"], icono: <DomainAddOutlined /> },
    { label: "Camiones", ruta: "/camiones", rolesPermitidos: ["Administrador", "Logistica"], icono: <LocalShippingOutlined /> },
    { label: "Inconvenientes", ruta: "/inconvenientes", rolesPermitidos: ["Administrador", "Logistica"], icono: <ErrorOutline /> },
    { label: "Clima", ruta: "/clima", rolesPermitidos: ["Administrador", "Logistica"], icono: <ThunderstormOutlinedIcon /> },
    { label: "Calculadora", ruta: "/calculadora", rolesPermitidos: ["Administrador", "Logistica"], icono: <CalculateOutlinedIcon /> },
    { label: "Administrador", ruta: "/admin", rolesPermitidos: ["Administrador"], icono: <AdminPanelSettingsOutlinedIcon /> },
  ];
  