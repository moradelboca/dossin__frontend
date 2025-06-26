import * as React from "react";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import Camiones from "./camiones/Camiones";
import Acoplados from "./acoplados/Acoplados";
import { ContextoGeneral } from "../Contexto";

export default function TabCamiones() {
    const [value, setValue] = React.useState("one");
    const { theme } = React.useContext(ContextoGeneral);

    const handleChange = (_event: React.SyntheticEvent, newValue: string) => {
        setValue(newValue);
    };
    return (
        <Box
            sx={{
                width: "100%",
                height: '100%',
                minHeight: 0,
                backgroundColor: theme.colores.grisClaro,
            }}
        >
            <Tabs
                value={value}
                onChange={handleChange}
                textColor="inherit"
                sx={{
                    "& .MuiTab-root": {
                        color: "gray",
                    },
                    "& .Mui-selected": {
                        color: theme.colores.azul,
                    },
                    "& .MuiTabs-indicator": {
                        backgroundColor: theme.colores.azul,
                    },
                }}
            >
                <Tab value="one" label="Camiones" />
                <Tab value="two" label="Acoplados" />
            </Tabs>
            <Box sx={{ padding: 2, height: '100%', minHeight: 0 }}>
                {value === "one" && <Camiones />}
                {value === "two" && <Acoplados />}
            </Box>
        </Box>
    );
}
