// App.tsx
import { CssBaseline, useMediaQuery } from "@mui/material";
import Box from "@mui/material/Box";
import { useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Usuarios from "./components/admin/Usuarios";
import { AuthProvider } from "./components/autenticacion/ContextoAuth";
import RutasProtegidas from "./components/autenticacion/RutasProtegidas";
import TarifaApp from "./components/calculadora/Calculadora";
import TabCamiones from "./components/Camiones y acoplados/tabCamiones";
import { ContainerCargas } from "./components/cargas/containers/ContainerCargas";
import { ContainerCupos } from "./components/cargas/cupos/ContainerCupos";
import Choferes from "./components/choferes/Choferes";
import Clima from "./components/clima/Clima";
import { ContextoGeneral, ValoresContexto } from "./components/Contexto";
import Contratos from "./components/contratos/Contratos";
import Dashboard from "./components/dashboard/Dashboard";
import Empresas from "./components/empresas/Empresas";
import Inconvenientes from "./components/inconvenientes/Inconvenientes";
import PaginaNoDisponible from "./components/inconvenientes/PaginaNoDisponible";
import { MapaMain } from "./components/mapa/MapaMain";
import { Nav } from "./components/nav/Nav";

function App() {
  const [navAbierto, setNavAbierto] = useState(false);
  const anchoAbierto = 200;
  const anchoCerrado = 60;
  const isMobile = useMediaQuery("(max-width:768px)");

  return (
    <BrowserRouter>
      <AuthProvider>
        <ContextoGeneral.Provider value={ValoresContexto}>
          <Box
            sx={{
              display: "flex",
              height: "100vh",
              width: "100vw",
            }}
          >
            <CssBaseline>
              <Nav
                navAbierto={navAbierto}
                setNavAbierto={setNavAbierto}
                anchoAbierto={anchoAbierto}
                anchoCerrado={anchoCerrado}
              />
              <Box
                sx={{
                  marginTop: "65px",
                  marginLeft: isMobile ? 0 : `${anchoCerrado}px`,
                  width: isMobile ? "100%" : `calc(100% - ${anchoCerrado}px)`,
                  overflowX: "hidden",
                }}
              >
                <Routes>
                  <Route
                    path="/"
                    element={
                      <RutasProtegidas>
                        <Dashboard />
                      </RutasProtegidas>
                    }
                  />

                  <Route
                    path="/cargas"
                    element={
                      <RutasProtegidas allowedRoles={["Admin", "Logistica", "Pagos"]}>
                        <ContainerCargas />
                      </RutasProtegidas>
                    }
                  />

                  <Route
                    path="/cargas/:idCarga"
                    element={
                      <RutasProtegidas allowedRoles={["Admin", "Logistica", "Pagos"]}>
                        <ContainerCargas />
                      </RutasProtegidas>
                    }
                  />

                  <Route
                    path="cargas/:idCarga/cupos"
                    element={
                      <RutasProtegidas allowedRoles={["Admin", "Logistica", "Pagos"]}>
                        <ContainerCupos />
                      </RutasProtegidas>
                    }
                  />

                  <Route
                    path="/contratos"
                    element={
                      <RutasProtegidas allowedRoles={["Admin", "Logistica", "Pagos"]}>
                        <Contratos />
                      </RutasProtegidas>
                    }
                  />

                  <Route
                    path="/colaboradores"
                    element={
                      <RutasProtegidas allowedRoles={["Admin", "Logistica", "Pagos"]}>
                        <Choferes />
                      </RutasProtegidas>
                    }
                  />

                  <Route
                    path="/ubicaciones"
                    element={
                      <RutasProtegidas allowedRoles={["Admin", "Logistica", "Pagos"]}>
                        <MapaMain />
                      </RutasProtegidas>
                    }
                  />

                  <Route
                    path="/empresas"
                    element={
                      <RutasProtegidas allowedRoles={["Admin", "Logistica", "Pagos"]}>
                        <Empresas />
                      </RutasProtegidas>
                    }
                  />

                  <Route
                    path="/camiones"
                    element={
                      <RutasProtegidas allowedRoles={["Admin", "Logistica"]}>
                        <TabCamiones />
                      </RutasProtegidas>
                    }
                  />

                  <Route
                    path="/inconvenientes"
                    element={
                      <RutasProtegidas allowedRoles={["Admin", "Logistica"]}>
                        <Inconvenientes />
                      </RutasProtegidas>
                    }
                  />

                  <Route
                    path="/clima"
                    element={
                      <RutasProtegidas allowedRoles={["Admin", "Logistica"]}>
                        <Clima />
                      </RutasProtegidas>
                    }
                  />

                  <Route
                    path="/calculadora"
                    element={
                      <RutasProtegidas allowedRoles={["Admin", "Logistica"]}>
                        <TarifaApp />
                      </RutasProtegidas>
                    }
                  />

                  <Route
                    path="/admin"
                    element={
                      <RutasProtegidas allowedRoles={["Admin"]}>
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
            </CssBaseline>
          </Box>
        </ContextoGeneral.Provider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;