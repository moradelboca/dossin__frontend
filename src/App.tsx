import { ContainerCargas } from "./components/cargas/containers/ContainerCargas";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Nav } from "./components/nav/Nav";
import ContainerInconvenientes from "./components/inconvenientes/ContainerInconvenientes";
import { ContainerCupos } from "./components/cargas/cupos/ContainerCupos";
import { CssBaseline } from "@mui/material";
import Box from "@mui/material/Box";
import { ContextoGeneral, ValoresContexto } from "./components/Contexto";
import Empresas from "./components/empresas/Empresas";
import Choferes from "./components/choferes/Choferes";
import TabCamiones from "./components/Camiones y acoplados/tabCamiones";
import { MapaMain } from "./components/mapa/MapaMain";
import Clima from "./components/clima/Clima";
import TarifaApp from "./components/calculadora/Calculadora";
import PaginaNoDisponible from "./components/inconvenientes/PaginaNoDisponible";
import RutasProtegidas from "./components/autenticacion/RutasProtegidas";
import { AuthProvider } from "./components/autenticacion/ContextoAuth";
import TablaUser from "./components/admin/TablaUser";

function App() {
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
                            <Nav />
                            <Box
                                sx={{
                                    marginTop: "65px",
                                    overflowX: "hidden",
                                    width: "100%",
                                }}
                            >
                                <Routes>
                                    <Route path="/" />
                                    <Route
                                        path="/cargas"
                                        element={<ContainerCargas />}
                                    />
                                    <Route
                                        path="/cargas/:idCarga"
                                        element={<ContainerCargas />}
                                    />
                                    <Route
                                        path="cargas/:idCarga/cupos"
                                        element={<ContainerCupos />}
                                    />
                                    <Route
                                        path="/choferes"
                                        element={
                                            <RutasProtegidas>
                                                <Choferes />
                                            </RutasProtegidas>
                                        }
                                    />
                                    <Route
                                        path="/ubicaciones"
                                        element={
                                            //<RutasProtegidas>
                                            <MapaMain />
                                            //</RutasProtegidas>
                                        }
                                    />
                                    <Route
                                        path="/empresas"
                                        element={
                                            //<RutasProtegidas>
                                            <Empresas />
                                            //</RutasProtegidas>
                                        }
                                    />
                                    <Route
                                        path="/camiones"
                                        element={
                                            //<RutasProtegidas>
                                            <TabCamiones />
                                            //</RutasProtegidas>
                                        }
                                    />
                                    <Route
                                        path="/inconvenientes"
                                        element={
                                            // <RutasProtegidas>
                                            <ContainerInconvenientes />
                                            //</RutasProtegidas>
                                        }
                                    />
                                    <Route
                                        path="/clima"
                                        element={
                                            // <RutasProtegidas>
                                            <Clima />
                                            // </RutasProtegidas>
                                        }
                                    />
                                    <Route
                                        path="/calculadora"
                                        element={<TarifaApp />}
                                    />
                                    <Route
                                        path="/admin"
                                        element={<TablaUser />}
                                    />
                                    <Route
                                        path="*"
                                        element={<PaginaNoDisponible />}
                                    />
                                </Routes>
                            </Box>
                        </CssBaseline>
                    </Box>
                </ContextoGeneral.Provider>
                <link
                    rel="stylesheet"
                    href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
                    integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
                    crossOrigin="anonymous"
                />
                <script
                    src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
                    integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo="
                    crossOrigin="anonymous"
                ></script>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;
