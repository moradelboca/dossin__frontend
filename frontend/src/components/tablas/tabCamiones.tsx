import * as React from "react";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import Camiones from "./Camiones";
import Acoplados from "./Acoplados";

export default function TabCamiones() {
    const [value, setValue] = React.useState("one");

    const handleChange = (event: React.SyntheticEvent, newValue: string) => {
        setValue(newValue);
    };

    return (
        <Box sx={{ width: "100%", height: "80%" }}>
            <Tabs
                value={value}
                onChange={handleChange}
                sx={{
                    "& .MuiTab-root": {
                        color: "gray", // Color del texto cuando no está seleccionado
                    },
                    "& .Mui-selected": {
                        color: "#163660", // Color del texto cuando está seleccionado
                    },
                    "& .MuiTabs-indicator": {
                        backgroundColor: "#163660", // Color del indicador
                    },
                }}
                aria-label="secondary tabs example"
            >
                <Tab value="one" label="Camiones" />
                <Tab value="two" label="Acoplados" />
            </Tabs>
            <Box sx={{ padding: 2, height: "100%" }}>
                {value === "one" && <Camiones />}
                {value === "two" && <Acoplados />}
            </Box>
        </Box>
    );
}
