import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";

interface AutocompletarProps {
    title: string;
    info: string[];
}

export default function Autocompletar(props: AutocompletarProps) {
    const { title, info } = props;
    return (
        <Autocomplete
            disablePortal
            options={info}
            sx={{ width: 300 }}
            renderInput={(params) => <TextField {...params} label={title} />}
        />
    );
}
