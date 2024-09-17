import { styled, Typography } from "@mui/material";
import Button from "@mui/material/Button";

const StyledBoton = styled(Button)(() => ({
  background: "#163660",
  textTransform: "none",
  color: "#ffffff",
}));

interface CustomButtomProps {
  title: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
}

export function CustomButtom(props: CustomButtomProps) {
  const { title, onClick } = props;

  function handleNotHandled() {
    alert("Esta funcion no esta disponible.");
  }

  return (
    <StyledBoton onClick={!onClick ? handleNotHandled : onClick}>
      {title}
    </StyledBoton>
  );
}
