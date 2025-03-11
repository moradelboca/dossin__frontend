import React, { useContext } from 'react';
import { Button, Box } from '@mui/material';
import { ContextoGeneral } from '../Contexto';

interface MainButtonProps {
  onClick: () => void;
  text: string;
  width?: string;
  backgroundColor?: string;
  textColor?: string;
  borderRadius?: string;
  hoverBackgroundColor?: string;
  padding?:string;
}

const MainButton: React.FC<MainButtonProps> = ({
  onClick,
  text,
  width = '100%',
  backgroundColor = '#fff',
  textColor,
  borderRadius = '8px',
  hoverBackgroundColor = backgroundColor, 
  padding = '6px 16px',
}) => {
    const { theme } = useContext(ContextoGeneral);
    const resolvedTextColor = textColor || theme.colores.azul;
  return (
    <Box display="flex" justifyContent="center" mb={2}>
      <Button
        onClick={onClick}
        sx={{
          backgroundColor: backgroundColor,
          color: resolvedTextColor,
          border: `1px solid ${textColor}`,
          textTransform: 'none',
          fontWeight: '500',
          width: width,
          padding: padding,
          borderRadius: borderRadius,
          '&:hover': {
            backgroundColor: hoverBackgroundColor,
            opacity: 0.8,
          },
        }}
      >
        {text}
      </Button>
    </Box>
  );
};

export default MainButton;
