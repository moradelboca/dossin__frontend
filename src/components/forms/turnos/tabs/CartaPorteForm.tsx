import React, { useState, useEffect, useContext } from "react";
import {
  TextField,
  Button,
  Box,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import useCartaPorteHandler from "../../../hooks/turnos/useCartaPorteHandler";
import { ContextoGeneral } from "../../../Contexto";
import MainButton from "../../../botones/MainButtom";
import { useNotificacion } from '../../../Notificaciones/NotificacionSnackbar';

interface CartaPorteFormProps {
  turnoId: string;
  initialData?: {
    numeroCartaPorte?: number;
    CTG?: number;
  };
  onSuccess: (updatedData: any) => void;
  onCancel: () => void;
}

const CartaPorteForm: React.FC<CartaPorteFormProps> = ({
  turnoId,
  initialData,
  onSuccess,
  onCancel,
}) => {
  // Estados para los campos
  const [numeroCartaPorte, setNumeroCartaPorte] = useState<number | "">(
    initialData?.numeroCartaPorte || ""
  );
  const [ctg, setCtg] = useState<number | "">(
    initialData?.CTG || ""
  );
  const [errors, setErrors] = useState<{ numeroCartaPorte?: string; ctg?: string }>({});
  
  // Estado para controlar el diálogo de eliminación
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  const { handleCartaPorteSubmission, handleCartaPorteDeletion } = useCartaPorteHandler();
  const {theme} = useContext(ContextoGeneral);
  const { showNotificacion } = useNotificacion();
  
  const tema = useTheme();
  const isMobile = useMediaQuery(tema.breakpoints.down("sm"));

  // Estilos para el borde azul al enfocar
  const azulStyles = {
    '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: theme.colores.azul,
    },
    '& .MuiInputLabel-root.Mui-focused': {
      color: theme.colores.azul,
    },
  };

  // Actualizar estados cuando cambie initialData
  useEffect(() => {
    setNumeroCartaPorte(
      initialData?.numeroCartaPorte !== undefined
        ? initialData.numeroCartaPorte
        : ""
    );
    setCtg(
      initialData?.CTG !== undefined
        ? initialData.CTG
        : ""
    );
  }, [initialData?.numeroCartaPorte, initialData?.CTG]);

  const isUpdate =
    initialData?.numeroCartaPorte !== undefined &&
    Number(numeroCartaPorte) === initialData.numeroCartaPorte;

  const validate = () => {
    const newErrors: { numeroCartaPorte?: string; ctg?: string } = {};
    if (!numeroCartaPorte) newErrors.numeroCartaPorte = "Número de Carta de Porte es obligatorio";
    else if (String(numeroCartaPorte).length > 13) newErrors.numeroCartaPorte = "Máximo 13 dígitos";
    if (!ctg) newErrors.ctg = "CTG es obligatorio";
    else if (String(ctg).length > 11) newErrors.ctg = "Máximo 11 dígitos";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    handleCartaPorteSubmission(
      turnoId,
      {
        numeroCartaPorte: Number(numeroCartaPorte),
        CTG: Number(ctg),
      },
      isUpdate
    )
      .then((result) => onSuccess(result))
      .catch((error) => {
        let mensaje = 'Error al procesar Carta de Porte';
        try {
          const parsed = JSON.parse(error.message);
          if (parsed.mensaje) mensaje = parsed.mensaje;
        } catch {}
        showNotificacion(mensaje, 'error');
        console.error('Error al procesar Carta de Porte:', error);
      });
  };

  // Funciones para el diálogo de eliminación
  const handleOpenDeleteDialog = () => setOpenDeleteDialog(true);
  const handleCloseDeleteDialog = () => setOpenDeleteDialog(false);

  const handleDelete = async () => {
    if (!numeroCartaPorte) return;
    try {
      const result = await handleCartaPorteDeletion(numeroCartaPorte);
      onSuccess(result); // Enviar el resultado de la eliminación
    } catch (error) {
      console.error("Error al eliminar la Carta de Porte:", error);
    }
    setOpenDeleteDialog(false);
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <TextField
        label="Número Carta de Porte"
        type="text"
        value={numeroCartaPorte}
        onChange={(e) => {
          const newValue = e.target.value;
          if (/^\d{0,13}$/.test(newValue)) {
            setNumeroCartaPorte(newValue === "" ? "" : Number(newValue));
          }
        }}
        inputProps={{ maxLength: 13 }}
        error={!!errors.numeroCartaPorte}
        helperText={errors.numeroCartaPorte}
        fullWidth
        disabled={initialData?.numeroCartaPorte !== undefined}
        sx={{ ...azulStyles, mt: 2 }}
      />
      <TextField
        label="CTG"
        type="text"
        value={ctg}
        onChange={(e) => {
          const newValue = e.target.value;
          if (/^\d{0,11}$/.test(newValue)) {
            setCtg(newValue === "" ? "" : Number(newValue));
          }
        }}
        inputProps={{ maxLength: 11 }}
        error={!!errors.ctg}
        helperText={errors.ctg}
        fullWidth
        sx={azulStyles}
      />
      <Box
        sx={{
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          gap: 1,
          justifyContent: "flex-end",
          alignItems: "center",
          position: 'relative',
        }}
      >
        <MainButton
          onClick={onCancel}
          text="Cancelar"
          backgroundColor="transparent"
          textColor={theme.colores.azul}
          width={isMobile ? '100%' : 'auto'}
          borderRadius="8px"
          hoverBackgroundColor="rgba(22, 54, 96, 0.1)"
          divWidth={isMobile ? '100%' : 'auto'}
        />

        <MainButton
          onClick={handleSubmit}
          text={isUpdate ? 'Actualizar' : 'Crear'}
          backgroundColor={theme.colores.azul}
          textColor="#fff"
          width={isMobile ? '100%' : 'auto'}
          borderRadius="8px"
          hoverBackgroundColor={theme.colores.azulOscuro}
          divWidth={isMobile ? '100%' : 'auto'}
        />

        {initialData?.numeroCartaPorte !== undefined && (
          <IconButton onClick={handleOpenDeleteDialog} sx={{ color: "#d32f2f" }}>
            <DeleteOutlineIcon />
          </IconButton>
        )}
      </Box>
      <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Eliminar Carta de Porte</DialogTitle>
        <DialogContent>
          ¿Está seguro de que desea eliminar esta Carta de Porte?
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>No</Button>
          <Button onClick={handleDelete} color="error">Sí, eliminar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CartaPorteForm;
