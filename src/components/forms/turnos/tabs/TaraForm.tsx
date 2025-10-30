import React, { useState, useEffect, useContext } from "react";
import { TextField, Button, Box, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, useTheme, useMediaQuery } from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import useTaraHandler from "../../../hooks/turnos/useTaraHandler";
import { ContextoGeneral } from "../../../Contexto";
import MainButton from "../../../botones/MainButtom";

interface TaraFormProps {
  turnoId: string;
  initialTara?: {
    id?: string;
    pesoTara?: number;
    pesoBruto?: number;
  };
  turno?: any;
  onSuccess: (updatedData: any) => void;
  onCancel: () => void;
}

export const TaraForm: React.FC<Omit<TaraFormProps, 'initialTara'> & { initialTara?: { id?: string; pesoTara?: number } }> = ({
  turnoId,
  initialTara,
  turno,
  onSuccess,
  onCancel,
}) => {
  const [pesoTara, setPesoTara] = useState<number | "">(initialTara?.pesoTara || "");
  const [errors, setErrors] = useState<{ pesoTara?: string }>({});
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const { handleTaraSubmission, handleTaraDeletion } = useTaraHandler();
  const {theme, backendURL} = useContext(ContextoGeneral);
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

  useEffect(() => {
    if (initialTara) {
      setPesoTara(initialTara.pesoTara || "");
    }
  }, [initialTara]);

  const validate = () => {
    const newErrors: { pesoTara?: string } = {};
    if (pesoTara === "") newErrors.pesoTara = "El peso tara es obligatorio";
    else if (Number(pesoTara) < 0) newErrors.pesoTara = "El peso no puede ser negativo";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    try {
      const payload = {
        ...(turno || {}),
        kgTara: Number(pesoTara),
      };
      const result = await handleTaraSubmission(turnoId, payload);
      // PUT para cambiar a estado tarado (id 6)
      await fetch(`${backendURL}/turnos/${turnoId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idEstado: 6 }),
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
        onChange={(e) => {
          const newValue = e.target.value;
          if (/^\d{0,5}$/.test(newValue)) {
            setPesoTara(newValue === "" ? "" : Number(newValue));
          }
        }}
        inputProps={{ maxLength: 5 }}
        error={!!errors.pesoTara}
        helperText={errors.pesoTara}
        fullWidth
        sx={{ ...azulStyles, mt: 2 }}
      />
      <Box
        sx={{
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          gap: 1,
          justifyContent: "center",
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
          text={initialTara?.id ? 'Actualizar' : 'Crear'}
          backgroundColor={theme.colores.azul}
          textColor="#fff"
          width={isMobile ? '100%' : 'auto'}
          borderRadius="8px"
          hoverBackgroundColor={theme.colores.azulOscuro}
          divWidth={isMobile ? '100%' : 'auto'}
        />
        {/* Mostrar el botón de eliminar solo si existe una tara */}
        {initialTara?.id && (
          <IconButton onClick={handleOpenDeleteDialog}>
            <DeleteOutlineIcon sx={{ fontSize: 20, color: "#d68384" }} />
          </IconButton>
        )}
      </Box>
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

export const PesoBrutoForm: React.FC<Omit<TaraFormProps, 'initialTara'> & { initialTara?: { id?: string; pesoBruto?: number; pesoTara?: number } }> = ({
  turnoId,
  initialTara,
  turno,
  onSuccess,
  onCancel,
}) => {
  const [pesoBruto, setPesoBruto] = useState<number | "">(initialTara?.pesoBruto || "");
  const [errors, setErrors] = useState<{ pesoBruto?: string }>({});
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [diferenciaCalculada, setDiferenciaCalculada] = useState<number>(0);
  const [kgTaraActual, setKgTaraActual] = useState<number | null>(null);
  const { handleTaraSubmission } = useTaraHandler();
  const {theme, backendURL} = useContext(ContextoGeneral);
  const tema = useTheme();
  const isMobile = useMediaQuery(tema.breakpoints.down("sm"));

  // Obtener el kgTara actualizado del backend si no está en el turno
  useEffect(() => {
    const obtenerKgTara = async () => {
      // Si ya tenemos kgTara del turno, usarlo
      if (turno?.kgTara) {
        setKgTaraActual(turno.kgTara);
        return;
      }
      
      // Si no, buscar el turno actualizado del backend
      try {
        const response = await fetch(`${backendURL}/turnos/${turnoId}`, {
          headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
          },
        });
        if (response.ok) {
          const turnoActualizado = await response.json();
          const kgTara = turnoActualizado?.kgTara || turnoActualizado?.tara?.pesoTara || null;
          setKgTaraActual(kgTara);
        }
      } catch (error) {
        console.error("Error al obtener kgTara:", error);
      }
    };
    
    obtenerKgTara();
  }, [turnoId, backendURL, turno?.kgTara]);

  // Estilos para el borde azul al enfocar
  const azulStyles = {
    '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: theme.colores.azul,
    },
    '& .MuiInputLabel-root.Mui-focused': {
      color: theme.colores.azul,
    },
  };

  useEffect(() => {
    if (initialTara) {
      setPesoBruto(initialTara.pesoBruto || "");
    }
  }, [initialTara]);

  const validate = () => {
    const newErrors: { pesoBruto?: string } = {};
    if (pesoBruto === "") newErrors.pesoBruto = "El peso bruto es obligatorio";
    else if (Number(pesoBruto) < 0) newErrors.pesoBruto = "El peso no puede ser negativo";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleConfirmSubmit = async () => {
    try {
      const payload = {
        ...(turno || {}),
        kgBruto: Number(pesoBruto),
      };
      const result = await handleTaraSubmission(turnoId, payload);
      // PUT para cambiar a estado cargado (id 7)
      await fetch(`${backendURL}/turnos/${turnoId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idEstado: 7 }),
      });
      setOpenConfirmDialog(false);
      onSuccess(result);
    } catch (error) {
      console.error("Error al procesar peso bruto:", error);
      setOpenConfirmDialog(false);
    }
  };

  const handleSubmit = () => {
    if (!validate()) return;
    
    // Calcular la diferencia entre peso bruto y kg tara
    // Prioridad: kgTaraActual (del backend) > turno?.kgTara > turno?.tara?.pesoTara > initialTara?.pesoTara
    const kgTara = kgTaraActual !== null 
      ? kgTaraActual 
      : turno?.kgTara || turno?.tara?.pesoTara || initialTara?.pesoTara || 0;
    const diferencia = Number(pesoBruto) - kgTara;
    
    // Guardar la diferencia calculada para mostrarla en el diálogo
    setDiferenciaCalculada(diferencia);
    
    // Si la diferencia es menor a 27,000 kg, mostrar diálogo de confirmación
    if (diferencia < 27000) {
      setOpenConfirmDialog(true);
      return;
    }
    
    // Si la diferencia es >= 27,000 kg, proceder directamente
    handleConfirmSubmit();
  };

  const handleCloseConfirmDialog = () => {
    setOpenConfirmDialog(false);
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <TextField
        label="Peso Bruto (kg)"
        type="number"
        value={pesoBruto}
        onChange={(e) => {
          const newValue = e.target.value;
          if (/^\d{0,5}$/.test(newValue)) {
            setPesoBruto(newValue === "" ? "" : Number(newValue));
          }
        }}
        inputProps={{ maxLength: 5 }}
        error={!!errors.pesoBruto}
        helperText={errors.pesoBruto}
        fullWidth
        sx={{ ...azulStyles, mt: 2 }}
      />
      <Box
        sx={{
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          gap: 1,
          justifyContent: "center",
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
          text={initialTara?.id ? 'Actualizar' : 'Crear'}
          backgroundColor={theme.colores.azul}
          textColor="#fff"
          width={isMobile ? '100%' : 'auto'}
          borderRadius="8px"
          hoverBackgroundColor={theme.colores.azulOscuro}
          divWidth={isMobile ? '100%' : 'auto'}
        />
      </Box>
      {/* Diálogo de confirmación para diferencia menor a 27,000 kg */}
      <Dialog open={openConfirmDialog} onClose={handleCloseConfirmDialog} maxWidth="xs" fullWidth>
        <DialogTitle>Confirmar Carga de Peso Bruto</DialogTitle>
        <DialogContent>
          ¿Está seguro que está cargando los kg brutos? La diferencia con la tara es menor a 27.000 kg ({diferenciaCalculada.toLocaleString('es-AR')} kg) ¿Está seguro que quiere subirlos?
        </DialogContent>
        <DialogActions sx={{ padding: 2, gap: 1 }}>
          <MainButton
            onClick={handleCloseConfirmDialog}
            text="No"
            backgroundColor="transparent"
            textColor={theme.colores.azul}
            width="auto"
            borderRadius="8px"
            hoverBackgroundColor="rgba(22, 54, 96, 0.1)"
            divWidth="auto"
          />
          <MainButton
            onClick={handleConfirmSubmit}
            text="Sí"
            backgroundColor={theme.colores.azul}
            textColor="#fff"
            width="auto"
            borderRadius="8px"
            hoverBackgroundColor={theme.colores.azulOscuro}
            divWidth="auto"
          />
        </DialogActions>
      </Dialog>
    </Box>
  );
};

// export default TaraForm;
