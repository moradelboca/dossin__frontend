// App.tsx 
import { CssBaseline, useMediaQuery, Button } from "@mui/material";
import Box from "@mui/material/Box";
import { useState, useContext } from "react";
import { BrowserRouter, Route, Routes, Navigate, useLocation } from "react-router-dom";
import Usuarios from "./components/admin/Usuarios";
import { AuthProvider, useAuth } from "./components/autenticacion/ContextoAuth";
import { NotificacionProvider } from "./components/Notificaciones/NotificacionSnackbar";
import RutasProtegidas from "./components/autenticacion/RutasProtegidas";
import TarifaApp from "./components/calculadora/Calculadora";
import TabCamiones from "./components/Camiones y acoplados/tabCamiones";
import { ContainerCargas } from "./components/cargas/containers/ContainerCargas";
import { ContainerCupos } from "./components/cargas/cupos/ContainerCupos";
import Choferes from "./components/choferes/Choferes";
import Clima from "./components/clima/Clima";
import { ContextoGeneral, ValoresContexto } from "./components/Contexto";
import Contratos from "./components/contratos/Contratos";
import ContratosComerciales from "./components/contratosComerciales/ContratosComerciales";
import Dashboard from "./components/dashboard/Dashboard";
import Empresas from "./components/empresas/Empresas";
import Inconvenientes from "./components/inconvenientes/Inconvenientes";
import PaginaNoDisponible from "./components/inconvenientes/PaginaNoDisponible";
import { MapaMain } from "./components/mapa/MapaMain";
import { Nav } from "./components/nav/Nav";
import WebSocketComponent from "./components/Websocket";
import PantallaLogin from "./components/login/PantallaLogin";
import Cookies from "js-cookie";
import { HelpBot } from './components/helpbot';
import { NavigationHistoryProvider } from './components/breadcrumb/NavigationHistoryContext';
import { NavigationBreadcrumb } from './components/breadcrumb/NavigationBreadcrumb';
import { BuscadorTurnoDialog } from './components/cargas/BuscadorTurnoDialog';
import Mensajes from './components/mensajes/Mensajes';

function MainLayout({
  navAbierto,
  setNavAbierto,
  anchoAbierto,
  anchoCerrado,
  isMobile
}: {
  navAbierto: boolean;
  setNavAbierto: React.Dispatch<React.SetStateAction<boolean>>;
  anchoAbierto: number;
  anchoCerrado: number;
  isMobile: boolean;
}) {
  const { user } = useAuth();
  const { theme } = useContext(ContextoGeneral);
  const rolId = user?.rol?.id;
  const location = useLocation();
  const [openBuscadorTurno, setOpenBuscadorTurno] = useState(false);
  
  // Verificar si estamos en la pantalla de cargas (solo /cargas, no /cargas/:id ni /cargas/:id/cupos)
  const isInCargasScreen = location.pathname === '/cargas' || (location.pathname.startsWith('/cargas/') && !location.pathname.includes('/cupos'));

  return (
    <NavigationHistoryProvider>
      <WebSocketComponent />
      <Nav
        navAbierto={navAbierto}
        setNavAbierto={setNavAbierto}
        anchoAbierto={anchoAbierto}
        anchoCerrado={anchoCerrado}
      />
      <Box
        sx={{
          marginTop: "65px",
          marginLeft: rolId === 3 || isMobile ? 0 : `${anchoCerrado}px`,
          width: rolId === 3 || isMobile
            ? "100%"
            : `calc(100% - ${anchoCerrado}px)`,
          height: 'calc(100vh - 65px)',
          minHeight: 0,
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <NavigationBreadcrumb 
          rightContent={isInCargasScreen && (rolId === 1 || rolId === 2) ? (
            <Button
              variant="text"
              size="small"
              onClick={() => setOpenBuscadorTurno(true)}
              sx={{
                color: theme.colores.azul,
                textTransform: 'none',
                fontSize: '0.875rem',
                fontWeight: 400,
                opacity: 0.8,
                '&:hover': {
                  opacity: 1,
                  backgroundColor: 'transparent',
                  textDecoration: 'underline'
                }
              }}
            >
              Turbo-turno
            </Button>
          ) : undefined}
        />
        <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        <Routes>
          <Route
            path="/"
            element={
              <RutasProtegidas>
                {user?.rol?.id === 1 ? (
                  <Dashboard />
                ) : (
                  <Navigate to="/cargas" replace />
                )}
              </RutasProtegidas>
            }
          />
          <Route
            path="/cargas"
            element={
              <RutasProtegidas allowedRoles={[1, 2, 3, 4]}>
                <ContainerCargas />
              </RutasProtegidas>
            }
          />
          <Route
            path="/cargas/:idCarga"
            element={
              <RutasProtegidas allowedRoles={[1, 2, 3, 4]}>
                <ContainerCargas />
              </RutasProtegidas>
            }
          />
          <Route
            path="cargas/:idCarga/cupos"
            element={
              <RutasProtegidas allowedRoles={[1, 2, 3, 4]}>
                <ContainerCupos />
              </RutasProtegidas>
            }
          />
          <Route
            path="/contratos"
            element={
              <RutasProtegidas allowedRoles={[1, 2]}>
                <Contratos />
              </RutasProtegidas>
            }
          />
          <Route
            path="/contratos-comerciales"
            element={
              <RutasProtegidas allowedRoles={[1, 2]}>
                <ContratosComerciales />
              </RutasProtegidas>
            }
          />
          <Route
            path="/colaboradores"
            element={
              <RutasProtegidas allowedRoles={[1, 2, 4]}>
                <Choferes />
              </RutasProtegidas>
            }
          />
          <Route
            path="/ubicaciones"
            element={
              <RutasProtegidas allowedRoles={[1, 2, 4]}>
                <MapaMain />
              </RutasProtegidas>
            }
          />
          <Route
            path="/empresas"
            element={
              <RutasProtegidas allowedRoles={[1, 2, 4]}>
                <Empresas />
              </RutasProtegidas>
            }
          />
          <Route
            path="/camiones"
            element={
              <RutasProtegidas allowedRoles={[1, 2, 4]}>
                <TabCamiones />
              </RutasProtegidas>
            }
          />
          <Route
            path="/inconvenientes"
            element={
              <RutasProtegidas allowedRoles={[1, 2, 4]}>
                <Inconvenientes />
              </RutasProtegidas>
            }
          />
          <Route
            path="/mensajes"
            element={
              <RutasProtegidas allowedRoles={[1, 2, 3, 4]}>
                <Mensajes />
              </RutasProtegidas>
            }
          />
          <Route
            path="/clima"
            element={
              <RutasProtegidas allowedRoles={[1, 4]}>
                <Clima />
              </RutasProtegidas>
            }
          />
          <Route
            path="/calculadora"
            element={
              <RutasProtegidas allowedRoles={[1, 4]}>
                <TarifaApp />
              </RutasProtegidas>
            }
          />
          <Route
            path="/admin"
            element={
              <RutasProtegidas allowedRoles={[1]}>
                <Usuarios />
              </RutasProtegidas>
            }
          />
          <Route
            path="/no-autorizado"
            element={<PaginaNoDisponible />}
          />
          <Route
            path="*"
            element={
              <RutasProtegidas>
                <PaginaNoDisponible />
              </RutasProtegidas>
            }
          />
        </Routes>
      </Box>
      </Box>
      
      {/* Dialog de buscador de turnos */}
      <BuscadorTurnoDialog 
        open={openBuscadorTurno}
        onClose={() => setOpenBuscadorTurno(false)}
      />
    </NavigationHistoryProvider>
  );
}

function App() {
  const [navAbierto, setNavAbierto] = useState(false);
  const anchoAbierto = 200;
  const anchoCerrado = 60;
  const isMobile = useMediaQuery("(max-width:768px)");
  const accessToken = Cookies.get("accessToken");
  const { stage, theme } = useContext(ContextoGeneral);

  return (
      <BrowserRouter>
        <AuthProvider>
          <NotificacionProvider>
            <ContextoGeneral.Provider value={ValoresContexto}>
              <Box
                sx={{
                  display: "flex",
                  height: "100vh",
                  width: "100%",
                  overflowX: 'hidden',
                  background: theme.colores.grisClaro,
                }}
              >
                <CssBaseline>
                {(!accessToken && stage === "production") ? (
                    <Routes>
                      <Route path="/login" element={<PantallaLogin />} />
                      <Route
                        path="*"
                        element={<Navigate to="/login" replace />}
                      />
                    </Routes>
                  ) : (
                    <>
                    <MainLayout
                      navAbierto={navAbierto}
                      setNavAbierto={setNavAbierto}
                      anchoAbierto={anchoAbierto}
                      anchoCerrado={anchoCerrado}
                      isMobile={isMobile}
                      />
                    {!isMobile && <HelpBot />}
                    </>
                )}
                </CssBaseline>
              </Box>
            </ContextoGeneral.Provider>
          </NotificacionProvider>
        </AuthProvider>
      </BrowserRouter>
  );
}

export default App;
