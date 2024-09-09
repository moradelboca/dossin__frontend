import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import { ReactNode } from "react";

import { createTheme, ThemeProvider } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#163660",
      // light: will be calculated from palette.primary.main,
      // dark: will be calculated from palette.primary.main,
      // contrastText: will be calculated to contrast with palette.primary.main
    },
    secondary: {
      main: "#E0C2FF",
      light: "#F5EBFF",
      // dark: will be calculated from palette.secondary.main,
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

interface ButtonBodyProps {
  title?: string;
}
export function ButtonBody(props: ButtonBodyProps) {
  const { title } = props;
  return (
    <>
      <ThemeProvider theme={theme}>
        <Button variant="contained" color="primary">
          {title}
        </Button>
      </ThemeProvider>
    </>
  );
}
