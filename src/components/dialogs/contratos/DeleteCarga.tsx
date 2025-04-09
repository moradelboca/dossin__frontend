// components/DeleteCarga.tsx
import React from "react";
import { Dialog, DialogTitle, DialogContent, Typography, Box, Button } from "@mui/material";

interface DeleteCargaProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const DeleteCarga: React.FC<DeleteCargaProps> = ({ open, onClose, onConfirm }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Confirmar eliminación</DialogTitle>
      <DialogContent>
        <Typography>¿Está seguro de que desea eliminar esta carga?</Typography>
      </DialogContent>
      <Box display="flex" justifyContent="flex-end" p={2} gap={2}>
        <Button onClick={onClose}>No</Button>
        <Button onClick={onConfirm} color="error" variant="contained">
          Sí
        </Button>
      </Box>
    </Dialog>
  );
};

export default DeleteCarga;
