import { ContainerCargas } from "./components/ContainerCargas";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Nav } from "./components/nav/Nav";
import ContainerInconvenientes from "./components/ContainerInconvenientes";
import { styled } from "@mui/material/styles";
import { CssBaseline } from "@mui/material";
import Box from "@mui/material/Box";

const Body = styled("body")({
    display: "flex",
});

function App() {
    return (
        <CssBaseline>
            <BrowserRouter>
                <Body>
                    <Nav />
                    <Box sx={{ marginTop: "85px" }}>
                        <Routes>
                            <Route
                                path="/"
                                element={<ContainerInconvenientes />}
                            />
                            <Route
                                path="/cargas"
                                element={<ContainerCargas />}
                            />
                        </Routes>
                    </Box>
                </Body>
            </BrowserRouter>
        </CssBaseline>
    );
}

export default App;
