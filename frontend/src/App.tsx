import { ContainerCargas } from "./components/ContainerCargas";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Nav } from "./components/nav/Nav";
import ContainerInconvenientes from "./components/ContainerInconvenientes";
import { CssBaseline } from "@mui/material";
import Box from "@mui/material/Box";
import { ContextoGeneral, ValoresContexto } from "./components/Contexto";

function App() {
    return (
        <BrowserRouter>
            <ContextoGeneral.Provider value={ValoresContexto}>
                <Box sx={{ display: "flex", height: "100vh", width: "100vw" }}>
                    <CssBaseline>
                        <Nav />
                        <Box sx={{ marginTop: "85px", overflowX: "hidden" }}>
                            <Routes>
                                <Route
                                    path="/"
                                    element={<ContainerInconvenientes />}
                                />
                                <Route
                                    path="/cargas"
                                    element={<ContainerCargas />}
                                />
                                <Route path="/cargas/:idCarga" element={<ContainerCargas />} />
                            </Routes>
                        </Box>
                    </CssBaseline>
                </Box>
            </ContextoGeneral.Provider>
        </BrowserRouter>
    );
}

export default App;
