import React, { useState, useEffect, useContext } from "react";
import { TextField, Button, Stack, Box, IconButton, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import useTaraHandler from "../../../hooks/turnos/useTaraHandler";
import { ContextoGeneral } from "../../../Contexto";

interface TaraFormProps {
  turnoId: string;
  initialTara?: {
    id?: string;
    pesoTara?: number;
    pesoBruto?: number;
  };
  onSuccess: (updatedData: any) => void;
  onCancel: () => void;
}

const TaraForm: React.FC<TaraFormProps> = ({
  turnoId,
  initialTara,
  onSuccess,
  onCancel,
}) => {
  const [pesoTara, setPesoTara] = useState<number | "">(initialTara?.pesoTara || "");
  const [pesoBruto, setPesoBruto] = useState<number | "">(initialTara?.pesoBruto || "");
  const [errors, setErrors] = useState<{ pesoTara?: string; pesoBruto?: string }>({});
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);  // Estado para manejar el diálogo de eliminación
  const { handleTaraSubmission, handleTaraDeletion } = useTaraHandler();
  const {theme} = useContext(ContextoGeneral);

  useEffect(() => {
    if (initialTara) {
      setPesoTara(initialTara.pesoTara || "");
      setPesoBruto(initialTara.pesoBruto || "");
    }
  }, [initialTara]);

  const validate = () => {
    const newErrors: { pesoTara?: string; pesoBruto?: string } = {};
    if (pesoTara === "") newErrors.pesoTara = "El peso tara es obligatorio";
    else if (Number(pesoTara) < 0) newErrors.pesoTara = "El peso no puede ser negativo";
    if (pesoBruto === "") newErrors.pesoBruto = "El peso bruto es obligatorio";
    else if (Number(pesoBruto) < 0) newErrors.pesoBruto = "El peso no puede ser negativo";
    if (pesoBruto !== "" && pesoTara !== "" && Number(pesoBruto) <= Number(pesoTara)) {
      newErrors.pesoBruto = "El peso bruto debe ser mayor que el peso tara";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      const result = await handleTaraSubmission(turnoId, {
        idTara: initialTara?.id,
        pesoTara: Number(pesoTara),
        pesoBruto: Number(pesoBruto),
      });
      onSuccess(result);
    } catch (error) {
      console.error("Error al procesar tara:", error);
    }
  };

  const handleOpenDeleteDialog = () => setOpenDeleteDialog(true);
  const handleCloseDeleteDialog = () => setOpenDeleteDialog(false);

  const handleDelete = async () => {
    if (initialTara?.id) {
      try {
        const result = await handleTaraDeletion(turnoId, initialTara.id);
        onSuccess(result);
      } catch (error) {
        console.error("Error al eliminar la Tara:", error);
      }
    }
    setOpenDeleteDialog(false);
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <TextField
        label="Peso Tara (kg)"
        type="number"
        value={pesoTara}
        onChange={(e) => setPesoTara(e.target.value ? Number(e.target.value) : "")}
        error={!!errors.pesoTara}
        helperText={errors.pesoTara}
        fullWidth
      />
      <TextField
        label="Peso Bruto (kg)"
        type="number"
        value={pesoBruto}
        onChange={(e) => setPesoBruto(e.target.value ? Number(e.target.value) : "")}
        error={!!errors.pesoBruto}
        helperText={errors.pesoBruto}
        fullWidth
      />
      <Stack direction="row" spacing={2} justifyContent="flex-end">
        <Button onClick={onCancel} color="error">Cancelar</Button>
        {/* Mostrar el botón de eliminar solo si existe una tara */}
        {initialTara?.id && (
          <IconButton onClick={handleOpenDeleteDialog} sx={{ color: "#d32f2f" }}>
            <DeleteOutlineIcon />
          </IconButton>
        )}
        <Button onClick={handleSubmit} sx={{color: theme.colores.azul}} >
          {initialTara?.id ? "Actualizar Tara" : "Crear Tara"}
        </Button>
      </Stack>
      
      {/* Diálogo de confirmación para eliminar la Tara */}
      <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Eliminar Tara</DialogTitle>
        <DialogContent>
          ¿Está seguro de que desea eliminar esta Tara?
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>No</Button>
          <Button onClick={handleDelete} color="error">Sí, eliminar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TaraForm;
