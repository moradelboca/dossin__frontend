import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";

interface AutocompletarProps {
    title: string;
}

export default function Autocompletar(props: AutocompletarProps) {
    const { title } = props;
    return (
        <Autocomplete
            disablePortal
            options={["asdasd", "asdasd"]}
            sx={{ width: 300 }}
            renderInput={(params) => <TextField {...params} label={title} />}
        />
    );
}
