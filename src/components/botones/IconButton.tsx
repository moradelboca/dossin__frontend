import Stack from "@mui/material/Stack";
//import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import { ReactNode } from "react";
import { createTheme, ThemeProvider } from "@mui/material/styles";
//import { Icon } from "@mui/material"; // Importa el componente Icon o el ícono específico que quieras usar

const theme = createTheme({
    palette: {
        primary: {
            main: "#163660",
        },
        secondary: {
            main: "#E0C2FF",
            light: "#F5EBFF",
            contrastText: "#47008F",
        },
    },
});

interface Props {
    children: ReactNode;
}

export default function BasicButtons(props: Props) {
    const { children } = props;
    return (
        <Stack spacing={2} direction="row">
            {children}
        </Stack>
    );
}

interface IconButtonWithLabelProps {
    title?: string;
    icon?: ReactNode;
    onClick?: () => void;
    open?: boolean;
    disabled?: boolean;
}

export function BotonIcon(props: IconButtonWithLabelProps) {
    const { title, icon, onClick, open, disabled } = props;

    return (
        <ThemeProvider theme={theme}>
            <Button
                variant="contained"
                color="primary"
                startIcon={icon}
                onClick={onClick}
                disabled={disabled}
                sx={{  ...(open && { display: "none" }) }}
            >
                {title}
            </Button>
        </ThemeProvider>
    );
}
