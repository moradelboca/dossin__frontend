import React from 'react';
import { SnackbarProvider, VariantType, useSnackbar, SnackbarKey } from 'notistack';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';

// Componente para el botón de cierre
const SnackbarCloseButton = ({ snackbarId }: { snackbarId: SnackbarKey }) => {
  const { closeSnackbar } = useSnackbar();
  return (
    <IconButton
      size="small"
      color="inherit"
      onClick={() => closeSnackbar(snackbarId)}
    >
      <CloseIcon fontSize="small" />
    </IconButton>
  );
};

// Provider
export function NotificacionProvider({ children }: { children: React.ReactNode }) {
  return (
    <SnackbarProvider
      maxSnack={5}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      autoHideDuration={5000}
      action={(snackbarId) => <SnackbarCloseButton snackbarId={snackbarId} />}
    >
      {children}
    </SnackbarProvider>
  );
}

// Hook personalizado
export const useNotificacion = () => {
  const { enqueueSnackbar } = useSnackbar();
  return {
    showNotificacion: (mensaje: string, variant: VariantType = 'default') => {
      enqueueSnackbar(mensaje, { variant });
    },
  };
};