import * as React from "react";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import { AlarmAddSharp } from "@mui/icons-material";

export default function ComboBox() {
    return (
        <Autocomplete
            disablePortal
            options={["asdasdsda"]}
            sx={{ width: 300 }}
            renderInput={(params) => <TextField {...params} label="Movie" />}
        />
    );
}
