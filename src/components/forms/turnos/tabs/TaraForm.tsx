import React, { useState, useEffect, useContext } from "react";
import { TextField, Button, Box, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, useTheme, useMediaQuery, Typography } from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
// import PhotoCameraIcon from "@mui/icons-material/PhotoCamera"; // Comentado temporalmente - botón de sacar foto deshabilitado
import CloseIcon from "@mui/icons-material/Close";
import useTaraHandler from "../../../hooks/turnos/useTaraHandler";
import { ContextoGeneral } from "../../../Contexto";
import MainButton from "../../../botones/MainButtom";
import { MedicionesCalidadForm } from "./MedicionesCalidadForm";
import { createMedicionesLote } from "../../../../lib/parametros-calidad-api";
import { axiosGet, axiosPut } from "../../../../lib/axiosConfig";
import { registrarCambioEstado } from "../../../../services/turnosEstadoHistorialService";
import { useAuth } from "../../../autenticacion/ContextoAuth";
import { uploadFotoTurnoToSupabase, saveFotoTurnoReference, getFotosTurno, deleteFotoTurno } from "../../../../lib/supabase";
import { CameraCaptureDialog } from '../../../camera/CameraCaptureDialog';
import AttachFileIcon from '@mui/icons-material/AttachFile';

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
  const [errors, setErrors] = useState<{ pesoTara?: string; fotoTara?: string }>({});
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [fotoTara, setFotoTara] = useState<File | null>(null);
  const [fotoTaraPreview, setFotoTaraPreview] = useState<string | null>(null);
  const [fotoTaraPath, setFotoTaraPath] = useState<string | null>(null);
  const [fotoTaraUrl, setFotoTaraUrl] = useState<string | null>(null);
  const [fotoTaraLoading, setFotoTaraLoading] = useState(false);
  const [openFotoDialog, setOpenFotoDialog] = useState(false);
  const [openCameraDialog, setOpenCameraDialog] = useState(false);
  const { handleTaraSubmission, handleTaraDeletion } = useTaraHandler();
  const {theme, backendURL} = useContext(ContextoGeneral);
  const { user } = useAuth();
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

  // Cargar foto existente al montar el componente
  useEffect(() => {
    const cargarFotoExistente = async () => {
      try {
        if (!turnoId || turnoId.trim() === '') {
          return;
        }
        const fotos = await getFotosTurno(turnoId);
        const fotoTaraExistente = fotos.find((f: any) => f.tipo_foto === 'tara');
        if (fotoTaraExistente) {
          setFotoTaraUrl(fotoTaraExistente.url);
          setFotoTaraPath(fotoTaraExistente.path);
        }
      } catch (error) {
        console.error("Error al cargar foto existente:", error);
      }
    };
    
    if (turnoId) {
      cargarFotoExistente();
    }
  }, [turnoId]);

  const handleFotoTaraChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar que sea una imagen
      if (!file.type.startsWith('image/')) {
        setErrors({ ...errors, fotoTara: 'El archivo debe ser una imagen' });
        return;
      }
      
      setFotoTara(file);
      setErrors({ ...errors, fotoTara: undefined });
      
      // Crear preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setFotoTaraPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCameraCapture = (file: File) => {
    // Validar que sea una imagen
    if (!file.type.startsWith('image/')) {
      setErrors({ ...errors, fotoTara: 'El archivo debe ser una imagen' });
      return;
    }
    
    setFotoTara(file);
    setErrors({ ...errors, fotoTara: undefined });
    
    // Crear preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setFotoTaraPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleEliminarFotoTara = async () => {
    try {
      if (fotoTaraPath && turnoId && turnoId.trim() !== '') {
        await deleteFotoTurno(turnoId, 'tara');
      }
      setFotoTara(null);
      setFotoTaraPreview(null);
      setFotoTaraPath(null);
      setFotoTaraUrl(null);
    } catch (error) {
      console.error("Error al eliminar foto:", error);
    }
  };

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
      // Subir foto si hay una nueva
      if (fotoTara) {
        if (!turnoId || turnoId.trim() === '') {
          throw new Error('ID de turno inválido');
        }
        
        setFotoTaraLoading(true);
        const uploadResult = await uploadFotoTurnoToSupabase(
          fotoTara,
          turnoId,
          'tara'
        );
        
        if (uploadResult) {
          // Guardar referencia en Supabase
          await saveFotoTurnoReference(
            turnoId,
            'tara',
            uploadResult.path,
            uploadResult.url
          );
          setFotoTaraPath(uploadResult.path);
          setFotoTaraUrl(uploadResult.url);
        }
        setFotoTaraLoading(false);
      }

      const payload = {
        ...(turno || {}),
        kgTara: Number(pesoTara),
      };
      const result = await handleTaraSubmission(turnoId, payload);
      
      // Obtener estado anterior antes de cambiar
      const estadoAnteriorId = turno?.estado?.id || null;
      
      // PUT para cambiar a estado tarado (id 6)
      await axiosPut(`turnos/${turnoId}`, { idEstado: 6 }, backendURL);
      
      // Registrar cambio de estado en historial (no bloqueante)
      if (estadoAnteriorId !== 6) {
        registrarCambioEstado(
          turnoId,
          estadoAnteriorId,
          6,
          user?.id,
          'Registro de tara'
        ).catch(() => {
          // Error silencioso - no debe afectar el flujo principal
        });
      }
      
      onSuccess(result);
    } catch (error) {
      console.error("Error al procesar tara:", error);
      setFotoTaraLoading(false);
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
      
      {/* Sección de foto */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        <Typography variant="body2" sx={{ fontWeight: 500 }}>
          Foto de Tara (opcional)
        </Typography>
        
        {/* Mostrar foto existente o preview de nueva */}
        {(fotoTaraUrl || fotoTaraPreview) && (
          <Box sx={{ position: 'relative', display: 'inline-block', width: '100%', maxWidth: 300 }}>
            <img 
              src={fotoTaraPreview || fotoTaraUrl || ''} 
              alt="Foto tara"
              style={{ 
                width: '100%', 
                height: 200, 
                objectFit: 'cover', 
                borderRadius: '8px',
                cursor: 'pointer'
              }}
              onClick={() => setOpenFotoDialog(true)}
            />
            <IconButton 
              size="small" 
              onClick={handleEliminarFotoTara}
              sx={{ 
                position: 'absolute', 
                top: 8, 
                right: 8,
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                '&:hover': { backgroundColor: 'rgba(255, 255, 255, 1)' }
              }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        )}
        
        {/* Botones para adjuntar o sacar foto */}
        {!fotoTaraPreview && !fotoTaraUrl && (
          <Box>
            {/* Botón para adjuntar archivo */}
            <input
              accept="image/*"
              style={{ display: 'none' }}
              id="foto-tara-input"
              type="file"
              onChange={handleFotoTaraChange}
            />
            <label htmlFor="foto-tara-input">
              <Button
                variant="outlined"
                component="span"
                startIcon={<AttachFileIcon />}
                fullWidth
                sx={{
                  borderColor: theme.colores.azul,
                  color: theme.colores.azul,
                  '&:hover': {
                    borderColor: theme.colores.azulOscuro,
                    backgroundColor: 'rgba(22, 54, 96, 0.05)'
                  }
                }}
              >
                Adjuntar
              </Button>
            </label>
            
            {/* Botón para sacar foto - COMENTADO TEMPORALMENTE */}
            {/* <Box sx={{ flex: 1 }}>
              <Button
                variant="outlined"
                onClick={() => setOpenCameraDialog(true)}
                startIcon={<PhotoCameraIcon />}
                fullWidth
                sx={{
                  borderColor: theme.colores.azul,
                  color: theme.colores.azul,
                  '&:hover': {
                    borderColor: theme.colores.azulOscuro,
                    backgroundColor: 'rgba(22, 54, 96, 0.05)'
                  }
                }}
              >
                Sacar
              </Button>
            </Box> */}
          </Box>
        )}
        
        {errors.fotoTara && (
          <Typography variant="caption" color="error">
            {errors.fotoTara}
          </Typography>
        )}
      </Box>
      
      {/* Dialog para ver foto ampliada */}
      <Dialog open={openFotoDialog} onClose={() => setOpenFotoDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Foto de Tara
          <IconButton
            onClick={() => setOpenFotoDialog(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <img 
            src={fotoTaraPreview || fotoTaraUrl || ''} 
            alt="Foto tara ampliada"
            style={{ width: '100%', height: 'auto' }}
          />
        </DialogContent>
      </Dialog>
      
      {/* Dialog de cámara */}
      <CameraCaptureDialog
        open={openCameraDialog}
        onClose={() => setOpenCameraDialog(false)}
        onCapture={handleCameraCapture}
        title="Tomar Foto de Tara"
        theme={theme}
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
          disabled={fotoTaraLoading}
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
  const [errors, setErrors] = useState<{ pesoBruto?: string; fotoBruto?: string; [key: string]: string | undefined }>({});
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [diferenciaCalculada, setDiferenciaCalculada] = useState<number>(0);
  const [kgTaraActual, setKgTaraActual] = useState<number | null>(null);
  const [mediciones, setMediciones] = useState<Record<number, number | ''>>({});
  const [fotoBruto, setFotoBruto] = useState<File | null>(null);
  const [fotoBrutoPreview, setFotoBrutoPreview] = useState<string | null>(null);
  const [fotoBrutoPath, setFotoBrutoPath] = useState<string | null>(null);
  const [fotoBrutoUrl, setFotoBrutoUrl] = useState<string | null>(null);
  const [fotoBrutoLoading, setFotoBrutoLoading] = useState(false);
  const [openFotoBrutoDialog, setOpenFotoBrutoDialog] = useState(false);
  const [openCameraDialog, setOpenCameraDialog] = useState(false);
  const { handleTaraSubmission } = useTaraHandler();
  const {theme, backendURL} = useContext(ContextoGeneral);
  const { user } = useAuth();
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
        const turnoActualizado = await axiosGet<any>(`turnos/${turnoId}`, backendURL);
        const kgTara = turnoActualizado?.kgTara || turnoActualizado?.tara?.pesoTara || null;
        setKgTaraActual(kgTara);
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

  // Cargar foto existente al montar el componente
  useEffect(() => {
    const cargarFotoExistente = async () => {
      try {
        if (!turnoId || turnoId.trim() === '') {
          return;
        }
        const fotos = await getFotosTurno(turnoId);
        const fotoBrutoExistente = fotos.find((f: any) => f.tipo_foto === 'bruto');
        if (fotoBrutoExistente) {
          setFotoBrutoUrl(fotoBrutoExistente.url);
          setFotoBrutoPath(fotoBrutoExistente.path);
        }
      } catch (error) {
        console.error("Error al cargar foto existente:", error);
      }
    };
    
    if (turnoId) {
      cargarFotoExistente();
    }
  }, [turnoId]);

  const handleFotoBrutoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar que sea una imagen
      if (!file.type.startsWith('image/')) {
        setErrors({ ...errors, fotoBruto: 'El archivo debe ser una imagen' });
        return;
      }
      
      setFotoBruto(file);
      setErrors({ ...errors, fotoBruto: undefined });
      
      // Crear preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setFotoBrutoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCameraCapture = (file: File) => {
    // Validar que sea una imagen
    if (!file.type.startsWith('image/')) {
      setErrors({ ...errors, fotoBruto: 'El archivo debe ser una imagen' });
      return;
    }
    
    setFotoBruto(file);
    setErrors({ ...errors, fotoBruto: undefined });
    
    // Crear preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setFotoBrutoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleEliminarFotoBruto = async () => {
    try {
      if (fotoBrutoPath && turnoId && turnoId.trim() !== '') {
        await deleteFotoTurno(turnoId, 'bruto');
      }
      setFotoBruto(null);
      setFotoBrutoPreview(null);
      setFotoBrutoPath(null);
      setFotoBrutoUrl(null);
    } catch (error) {
      console.error("Error al eliminar foto:", error);
    }
  };

  const validate = () => {
    const newErrors: { pesoBruto?: string } = {};
    if (pesoBruto === "") newErrors.pesoBruto = "El peso bruto es obligatorio";
    else if (Number(pesoBruto) < 0) newErrors.pesoBruto = "El peso no puede ser negativo";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleConfirmSubmit = async () => {
    try {
      // Subir foto si hay una nueva
      if (fotoBruto) {
        if (!turnoId || turnoId.trim() === '') {
          throw new Error('ID de turno inválido');
        }
        
        setFotoBrutoLoading(true);
        const uploadResult = await uploadFotoTurnoToSupabase(
          fotoBruto,
          turnoId,
          'bruto'
        );
        
        if (uploadResult) {
          // Guardar referencia en Supabase
          await saveFotoTurnoReference(
            turnoId,
            'bruto',
            uploadResult.path,
            uploadResult.url
          );
          setFotoBrutoPath(uploadResult.path);
          setFotoBrutoUrl(uploadResult.url);
        }
        setFotoBrutoLoading(false);
      }

      const payload = {
        kgBruto: Number(pesoBruto),
      };
      const result = await handleTaraSubmission(turnoId, payload);
      
      // Guardar mediciones de calidad si hay alguna
      const medicionesValidas = Object.entries(mediciones)
        .filter(([_, valor]) => valor !== '' && valor !== null && valor !== undefined)
        .map(([idParametro, valorMedido]) => ({
          idParametroCalidad: Number(idParametro),
          valorMedido: Number(valorMedido),
        }));

      if (medicionesValidas.length > 0) {
        try {
          await createMedicionesLote(turnoId, {
            etapaMedicion: 'carga',
            mediciones: medicionesValidas,
          });
        } catch (error) {
          console.error("Error al guardar mediciones de calidad:", error);
          // No bloqueamos el flujo si falla guardar las mediciones
        }
      }

      // Obtener estado anterior antes de cambiar
      const estadoAnteriorId = turno?.estado?.id || null;
      
      // PUT para cambiar a estado cargado (id 7)
      await axiosPut(`turnos/${turnoId}`, { idEstado: 7 }, backendURL);
      
      // Registrar cambio de estado en historial (no bloqueante)
      if (estadoAnteriorId !== 7) {
        registrarCambioEstado(
          turnoId,
          estadoAnteriorId,
          7,
          user?.id,
          'Registro de peso bruto'
        ).catch(() => {
          // Error silencioso - no debe afectar el flujo principal
        });
      }
      
      setOpenConfirmDialog(false);
      onSuccess(result);
    } catch (error) {
      console.error("Error al procesar peso bruto:", error);
      setOpenConfirmDialog(false);
      setFotoBrutoLoading(false);
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
      
      <MedicionesCalidadForm
        etapaMedicion="carga"
        mediciones={mediciones}
        onMedicionesChange={setMediciones}
        errors={Object.fromEntries(
          Object.entries(errors).map(([key, value]) => [key, value ?? ''])
        )}
      />
      
      {/* Sección de foto bruto */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        <Typography variant="body2" sx={{ fontWeight: 500 }}>
          Foto de Peso Bruto (opcional)
        </Typography>
        
        {/* Mostrar foto existente o preview de nueva */}
        {(fotoBrutoUrl || fotoBrutoPreview) && (
          <Box sx={{ position: 'relative', display: 'inline-block', width: '100%', maxWidth: 300 }}>
            <img 
              src={fotoBrutoPreview || fotoBrutoUrl || ''} 
              alt="Foto bruto"
              style={{ 
                width: '100%', 
                height: 200, 
                objectFit: 'cover', 
                borderRadius: '8px',
                cursor: 'pointer'
              }}
              onClick={() => setOpenFotoBrutoDialog(true)}
            />
            <IconButton 
              size="small" 
              onClick={handleEliminarFotoBruto}
              sx={{ 
                position: 'absolute', 
                top: 8, 
                right: 8,
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                '&:hover': { backgroundColor: 'rgba(255, 255, 255, 1)' }
              }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        )}
        
        {/* Botones para adjuntar o sacar foto */}
        {!fotoBrutoPreview && !fotoBrutoUrl && (
          <Box>
            {/* Botón para adjuntar archivo */}
            <input
              accept="image/*"
              style={{ display: 'none' }}
              id="foto-bruto-input"
              type="file"
              onChange={handleFotoBrutoChange}
            />
            <label htmlFor="foto-bruto-input">
              <Button
                variant="outlined"
                component="span"
                startIcon={<AttachFileIcon />}
                fullWidth
                sx={{
                  borderColor: theme.colores.azul,
                  color: theme.colores.azul,
                  '&:hover': {
                    borderColor: theme.colores.azulOscuro,
                    backgroundColor: 'rgba(22, 54, 96, 0.05)'
                  }
                }}
              >
                Adjuntar
              </Button>
            </label>
            
            {/* Botón para sacar foto - COMENTADO TEMPORALMENTE */}
            {/* <Box sx={{ flex: 1 }}>
              <Button
                variant="outlined"
                onClick={() => setOpenCameraDialog(true)}
                startIcon={<PhotoCameraIcon />}
                fullWidth
                sx={{
                  borderColor: theme.colores.azul,
                  color: theme.colores.azul,
                  '&:hover': {
                    borderColor: theme.colores.azulOscuro,
                    backgroundColor: 'rgba(22, 54, 96, 0.05)'
                  }
                }}
              >
                Sacar
              </Button>
            </Box> */}
          </Box>
        )}
        
        {errors.fotoBruto && (
          <Typography variant="caption" color="error">
            {errors.fotoBruto}
          </Typography>
        )}
      </Box>
      
      {/* Dialog para ver foto ampliada */}
      <Dialog open={openFotoBrutoDialog} onClose={() => setOpenFotoBrutoDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Foto de Peso Bruto
          <IconButton
            onClick={() => setOpenFotoBrutoDialog(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <img 
            src={fotoBrutoPreview || fotoBrutoUrl || ''} 
            alt="Foto bruto ampliada"
            style={{ width: '100%', height: 'auto' }}
          />
        </DialogContent>
      </Dialog>
      
      {/* Dialog de cámara */}
      <CameraCaptureDialog
        open={openCameraDialog}
        onClose={() => setOpenCameraDialog(false)}
        onCapture={handleCameraCapture}
        title="Tomar Foto de Peso Bruto"
        theme={theme}
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
          disabled={fotoBrutoLoading}
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
