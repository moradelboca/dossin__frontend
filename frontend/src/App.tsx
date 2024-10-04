import { ContainerCargas } from "./components/ContainerCargas";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Nav } from "./components/nav/Nav";
import ContainerInconvenientes from "./components/ContainerInconvenientes";
import { ContainerCupos } from "./components/ContainerCupos";
import { CssBaseline } from "@mui/material";
import Box from "@mui/material/Box";
import { ContextoGeneral, ValoresContexto } from "./components/Contexto";
import CrearCargaStepper from "./components/CrearCargaStepper";

function App() {
    return (
        <BrowserRouter>
            <ContextoGeneral.Provider value={ValoresContexto}>
                <Box sx={{ display: "flex", height: "100vh", width: "100vw" }}>
                    <CssBaseline>
                        <Nav />
                        <Box
                            sx={{
                                marginTop: "85px",
                                overflowX: "hidden",
                                width: "100%",
                            }}
                        >
                            <Routes>
                                <Route
                                    path="/"
                                    element={<ContainerInconvenientes />}
                                />
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
                                    path="cargas/crearCarga"
                                    element={<CrearCargaStepper />}
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
        </BrowserRouter>
    );
}

export default App;
