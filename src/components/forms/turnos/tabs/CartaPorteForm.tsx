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
  Divider,
  Checkbox,
  FormControlLabel,
  Typography,
  CircularProgress,
} from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import useCartaPorteHandler from "../../../hooks/turnos/useCartaPorteHandler";
import { ContextoGeneral } from "../../../Contexto";
import MainButton from "../../../botones/MainButtom";
import { useNotificacion } from '../../../Notificaciones/NotificacionSnackbar';
import { 
  uploadFotoTurnoToSupabase, 
  saveFotoTurnoReference, 
  getFotosTurno,
  saveRemitoId,
  getRemitoId,
  deleteFotoTurno,
  deleteRemitoId
} from "../../../../lib/supabase";

interface CartaPorteFormProps {
  turnoId: string;
  initialData?: {
    numeroCartaPorte?: number;
    CTG?: number;
    segundaCartaPorte?: number;
    segundaCTG?: number;
    noLlevaCartaPorte?: boolean;
    idRemito?: string;
  };
  cuitTitular?: string;
  onSuccess: (updatedData: any) => void;
  onCancel: () => void;
}

const CartaPorteForm: React.FC<CartaPorteFormProps> = ({
  turnoId,
  initialData,
  cuitTitular,
  onSuccess,
  onCancel,
}) => {
  // Estados para los campos
  const [numeroCartaPorte, setNumeroCartaPorte] = useState<string>(
    initialData?.numeroCartaPorte !== undefined ? String(initialData.numeroCartaPorte).padStart(13, '0') : ""
  );
  const [ctg, setCtg] = useState<string>(
    initialData?.CTG !== undefined ? String(initialData.CTG) : ""
  );
  
  // Estados para la segunda carta de porte
  const [segundaCartaPorte, setSegundaCartaPorte] = useState<string>(
    initialData?.segundaCartaPorte !== undefined ? String(initialData.segundaCartaPorte).padStart(13, '0') : ""
  );
  const [segundaCTG, setSegundaCTG] = useState<string>(
    initialData?.segundaCTG !== undefined ? String(initialData.segundaCTG) : ""
  );
  const [mostrarSegundaCP, setMostrarSegundaCP] = useState<boolean>(
    initialData?.segundaCartaPorte !== undefined || initialData?.segundaCTG !== undefined
  );
  
  const [errors, setErrors] = useState<{ 
    numeroCartaPorte?: string; 
    ctg?: string;
    segundaCartaPorte?: string;
    segundaCTG?: string;
    idRemito?: string;
  }>({});
  
  // Estados para remito (cuando no lleva carta de porte)
  const [noLlevaCartaPorte, setNoLlevaCartaPorte] = useState<boolean>(
    initialData?.noLlevaCartaPorte || false
  );
  const [idRemito, setIdRemito] = useState<string>(
    initialData?.idRemito || ""
  );
  const [fotoRemito, setFotoRemito] = useState<File | null>(null);
  const [fotoRemitoPreview, setFotoRemitoPreview] = useState<string | null>(null);
  const [fotoRemitoPath, setFotoRemitoPath] = useState<string | null>(null);
  const [fotoRemitoUrl, setFotoRemitoUrl] = useState<string | null>(null);
  const [fotoRemitoLoading, setFotoRemitoLoading] = useState(false);
  
  // Estado para controlar el diálogo de eliminación
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  const { handleMultipleCartaPorteSubmission, handleCartaPorteDeletion } = useCartaPorteHandler();
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

  // Cargar datos existentes de remito y foto
  useEffect(() => {
    const cargarDatosRemito = async () => {
      try {
        if (!turnoId || turnoId.trim() === '') {
          return;
        }
        
        // Cargar ID del remito
        const remitoId = await getRemitoId(turnoId);
        if (remitoId) {
          setIdRemito(remitoId);
          setNoLlevaCartaPorte(true);
        }
        
        // Cargar foto del remito
        const fotos = await getFotosTurno(turnoId);
        const fotoRemitoExistente = fotos.find((f: any) => f.tipo_foto === 'remito');
        if (fotoRemitoExistente) {
          setFotoRemitoUrl(fotoRemitoExistente.url);
          setFotoRemitoPath(fotoRemitoExistente.path);
        }
      } catch (error) {
        console.error("Error al cargar datos de remito:", error);
      }
    };
    
    if (turnoId) {
      cargarDatosRemito();
    }
  }, [turnoId]);

  // Actualizar estados cuando cambie initialData
  useEffect(() => {
    setNumeroCartaPorte(
      initialData?.numeroCartaPorte !== undefined
        ? String(initialData.numeroCartaPorte)
        : ""
    );
    setCtg(
      initialData?.CTG !== undefined
        ? String(initialData.CTG)
        : ""
    );
    setSegundaCartaPorte(
      initialData?.segundaCartaPorte !== undefined
        ? String(initialData.segundaCartaPorte)
        : ""
    );
    setSegundaCTG(
      initialData?.segundaCTG !== undefined
        ? String(initialData.segundaCTG)
        : ""
    );
    setMostrarSegundaCP(
      initialData?.segundaCartaPorte !== undefined || initialData?.segundaCTG !== undefined
    );
    if (initialData?.noLlevaCartaPorte !== undefined) {
      setNoLlevaCartaPorte(initialData.noLlevaCartaPorte);
    }
    if (initialData?.idRemito) {
      setIdRemito(initialData.idRemito);
    }
  }, [initialData?.numeroCartaPorte, initialData?.CTG, initialData?.segundaCartaPorte, initialData?.segundaCTG, initialData?.noLlevaCartaPorte, initialData?.idRemito]);

  const isUpdate =
    initialData?.numeroCartaPorte !== undefined &&
    Number(numeroCartaPorte) === initialData.numeroCartaPorte;

  const validate = () => {
    const newErrors: { 
      numeroCartaPorte?: string; 
      ctg?: string;
      segundaCartaPorte?: string;
      segundaCTG?: string;
      idRemito?: string;
    } = {};
    
    // Si no lleva carta de porte, validar remito
    if (noLlevaCartaPorte) {
      if (!idRemito || idRemito.trim() === '') {
        newErrors.idRemito = "ID del remito es obligatorio cuando el turno no lleva carta de porte";
      }
    } else {
      // Validar primera carta de porte solo si lleva carta de porte
      if (!numeroCartaPorte) newErrors.numeroCartaPorte = "Número de Carta de Porte es obligatorio";
      else if (numeroCartaPorte.length > 13) newErrors.numeroCartaPorte = "Máximo 13 dígitos";
      
      if (!ctg) newErrors.ctg = "CTG es obligatorio";
      else if (String(ctg).length > 11) newErrors.ctg = "Máximo 11 dígitos";
      
      // Validar segunda carta de porte si está visible
      if (mostrarSegundaCP) {
        if (!segundaCartaPorte) newErrors.segundaCartaPorte = "Número de segunda Carta de Porte es obligatorio";
        else if (segundaCartaPorte.length > 13) newErrors.segundaCartaPorte = "Máximo 13 dígitos";
        
        if (!segundaCTG) newErrors.segundaCTG = "Segundo CTG es obligatorio";
        else if (String(segundaCTG).length > 11) newErrors.segundaCTG = "Máximo 11 dígitos";
        
        // Validar que no sean iguales
        if (numeroCartaPorte && segundaCartaPorte && numeroCartaPorte === segundaCartaPorte) {
          newErrors.segundaCartaPorte = "No puede ser igual a la primera Carta de Porte";
        }
        if (ctg && segundaCTG && ctg === segundaCTG) {
          newErrors.segundaCTG = "No puede ser igual al primer CTG";
        }
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFotoRemitoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar que sea una imagen
      if (!file.type.startsWith('image/')) {
        setErrors({ ...errors, idRemito: 'El archivo debe ser una imagen' });
        return;
      }
      
      setFotoRemito(file);
      setErrors({ ...errors, idRemito: undefined });
      
      // Crear preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setFotoRemitoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEliminarFotoRemito = async () => {
    try {
      if (fotoRemitoPath && turnoId && turnoId.trim() !== '') {
        await deleteFotoTurno(turnoId, 'remito');
      }
      setFotoRemito(null);
      setFotoRemitoPreview(null);
      setFotoRemitoPath(null);
      setFotoRemitoUrl(null);
    } catch (error) {
      console.error("Error al eliminar foto de remito:", error);
    }
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    
    try {
      // Si no lleva carta de porte, guardar remito y foto
      if (noLlevaCartaPorte) {
        // Guardar ID del remito
        if (idRemito && idRemito.trim() !== '') {
          await saveRemitoId(turnoId, idRemito);
        }
        
        // Subir foto del remito si hay una nueva
        if (fotoRemito) {
          setFotoRemitoLoading(true);
          const uploadResult = await uploadFotoTurnoToSupabase(
            fotoRemito,
            turnoId,
            'remito'
          );
          
          if (uploadResult) {
            await saveFotoTurnoReference(
              turnoId,
              'remito',
              uploadResult.path,
              uploadResult.url
            );
            setFotoRemitoPath(uploadResult.path);
            setFotoRemitoUrl(uploadResult.url);
          }
          setFotoRemitoLoading(false);
        }
        
        // Retornar datos del remito
        onSuccess({
          noLlevaCartaPorte: true,
          idRemito: idRemito.trim(),
        });
      } else {
        // Preparar las cartas de porte
        const cartasPorte = [
          {
            numeroCartaPorte: Number(numeroCartaPorte),
            CTG: Number(ctg),
            cuitTitular: cuitTitular,
          }
        ];

        // Agregar segunda carta de porte si existe
        if (mostrarSegundaCP && segundaCartaPorte && segundaCTG) {
          cartasPorte.push({
            numeroCartaPorte: Number(segundaCartaPorte),
            CTG: Number(segundaCTG),
            cuitTitular: cuitTitular,
          });
        }

        // Crear/actualizar todas las cartas de porte
        const results = await handleMultipleCartaPorteSubmission(
          turnoId,
          cartasPorte,
          isUpdate
        );

        // Eliminar remito si existía (ya que ahora lleva carta de porte)
        const remitoIdExistente = await getRemitoId(turnoId);
        if (remitoIdExistente) {
          // Eliminar ID del remito y foto si existe
          await deleteRemitoId(turnoId);
          const fotos = await getFotosTurno(turnoId);
          const fotoRemitoExistente = fotos.find((f: any) => f.tipo_foto === 'remito');
          if (fotoRemitoExistente) {
            await deleteFotoTurno(turnoId, 'remito');
          }
        }

        // Retornar ambas cartas de porte
        onSuccess({
          primeraCartaPorte: results[0],
          numeroCartaPorte: Number(numeroCartaPorte),
          CTG: Number(ctg),
          segundaCartaPorte: segundaCartaPorte ? Number(segundaCartaPorte) : undefined,
          segundaCTG: segundaCTG ? Number(segundaCTG) : undefined,
          noLlevaCartaPorte: false,
        });
      }
    } catch (error) {
      let mensaje = 'Error al procesar Carta de Porte';
      try {
        const parsed = JSON.parse((error as Error).message);
        if (parsed.mensaje) mensaje = parsed.mensaje;
      } catch {}
      showNotificacion(mensaje, 'error');
      console.error('Error al procesar Carta de Porte:', error);
      setFotoRemitoLoading(false);
    }
  };

  // Funciones para el diálogo de eliminación
  const handleOpenDeleteDialog = () => setOpenDeleteDialog(true);
  const handleCloseDeleteDialog = () => setOpenDeleteDialog(false);

  const handleMostrarSegundaCP = () => {
    setMostrarSegundaCP(true);
  };

  const handleOcultarSegundaCP = () => {
    setMostrarSegundaCP(false);
    setSegundaCartaPorte("");
    setSegundaCTG("");
    setErrors(prev => ({
      ...prev,
      segundaCartaPorte: undefined,
      segundaCTG: undefined
    }));
  };

  const handleDelete = async () => {
    if (!numeroCartaPorte) return;
    try {
      const result = await handleCartaPorteDeletion(Number(numeroCartaPorte));
      onSuccess(result); // Enviar el resultado de la eliminación
    } catch (error) {
      console.error("Error al eliminar la Carta de Porte:", error);
    }
    setOpenDeleteDialog(false);
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {/* Checkbox para indicar que no lleva carta de porte */}
      <FormControlLabel
        control={
          <Checkbox
            checked={noLlevaCartaPorte}
            onChange={(e) => {
              setNoLlevaCartaPorte(e.target.checked);
              if (e.target.checked) {
                // Limpiar campos de carta de porte
                setNumeroCartaPorte("");
                setCtg("");
                setSegundaCartaPorte("");
                setSegundaCTG("");
                setMostrarSegundaCP(false);
                setErrors({
                  ...errors,
                  numeroCartaPorte: undefined,
                  ctg: undefined,
                  segundaCartaPorte: undefined,
                  segundaCTG: undefined,
                });
              } else {
                // Limpiar campos de remito
                setIdRemito("");
                setFotoRemito(null);
                setFotoRemitoPreview(null);
                setErrors({
                  ...errors,
                  idRemito: undefined,
                });
              }
            }}
            sx={{
              color: theme.colores.azul,
              '&.Mui-checked': {
                color: theme.colores.azul,
              },
            }}
          />
        }
        label="El turno no lleva carta de porte"
        sx={{ mt: 2 }}
      />

      {/* Sección de Remito (cuando no lleva carta de porte) */}
      {noLlevaCartaPorte && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="ID del Remito"
            type="text"
            value={idRemito}
            onChange={(e) => setIdRemito(e.target.value)}
            error={!!errors.idRemito}
            helperText={errors.idRemito}
            fullWidth
            sx={azulStyles}
          />
          
          {/* Sección de foto del remito */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              Foto del Remito (opcional)
            </Typography>
            
            {/* Mostrar foto existente o preview de nueva */}
            {(fotoRemitoUrl || fotoRemitoPreview) && (
              <Box sx={{ position: 'relative', display: 'inline-block', width: '100%', maxWidth: 300 }}>
                <img 
                  src={fotoRemitoPreview || fotoRemitoUrl || ''} 
                  alt="Foto remito"
                  style={{ 
                    width: '100%', 
                    height: 200, 
                    objectFit: 'cover', 
                    borderRadius: '8px',
                    cursor: 'pointer'
                  }}
                />
                <IconButton 
                  size="small" 
                  onClick={handleEliminarFotoRemito}
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
            
            {/* Botón para adjuntar foto */}
            {!fotoRemitoPreview && !fotoRemitoUrl && (
              <Box>
                <input
                  accept="image/*"
                  style={{ display: 'none' }}
                  id="foto-remito-input"
                  type="file"
                  onChange={handleFotoRemitoChange}
                />
                <label htmlFor="foto-remito-input">
                  <Button
                    variant="outlined"
                    component="span"
                    fullWidth
                    sx={{
                      borderColor: theme.colores.azul,
                      color: theme.colores.azul,
                      textTransform: 'none',
                      '&:hover': {
                        borderColor: theme.colores.azulOscuro,
                        backgroundColor: 'rgba(22, 54, 96, 0.1)',
                      }
                    }}
                  >
                    Adjuntar Foto del Remito
                  </Button>
                </label>
              </Box>
            )}
          </Box>
        </Box>
      )}

      {/* Primera Carta de Porte (cuando lleva carta de porte) */}
      {!noLlevaCartaPorte && (
        <>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Número Carta de Porte"
              type="text"
              value={numeroCartaPorte}
              onChange={(e) => {
                const newValue = e.target.value;
                if (/^\d{0,13}$/.test(newValue)) {
                  setNumeroCartaPorte(newValue);
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
                  setCtg(newValue);
                }
              }}
              inputProps={{ maxLength: 11 }}
              error={!!errors.ctg}
              helperText={errors.ctg}
              fullWidth
              sx={azulStyles}
            />
          </Box>

          {/* Botón para asociar segunda carta de porte */}
          {!mostrarSegundaCP && (
            <Button
              onClick={handleMostrarSegundaCP}
              startIcon={<AddIcon />}
              sx={{
                color: theme.colores.azul,
                borderColor: theme.colores.azul,
                border: '1px solid',
                borderRadius: '8px',
                textTransform: 'none',
                fontWeight: 500,
                '&:hover': {
                  backgroundColor: 'rgba(22, 54, 96, 0.1)',
                  borderColor: theme.colores.azulOscuro,
                }
              }}
              variant="outlined"
            >
              Asociar otra carta de porte
            </Button>
          )}

          {/* Segunda Carta de Porte */}
          {mostrarSegundaCP && (
            <Box>
              <Divider sx={{ my: 2 }}>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1,
                  color: theme.colores.azul,
                  fontWeight: 500
                }}>
                  Segunda Carta de Porte
                  <IconButton 
                    onClick={handleOcultarSegundaCP}
                    size="small"
                    sx={{ color: '#d32f2f' }}
                  >
                    <DeleteOutlineIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Divider>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  label="Número Segunda Carta de Porte"
                  type="text"
                  value={segundaCartaPorte}
                  onChange={(e) => {
                    const newValue = e.target.value;
                    if (/^\d{0,13}$/.test(newValue)) {
                      setSegundaCartaPorte(newValue);
                    }
                  }}
                  inputProps={{ maxLength: 13 }}
                  error={!!errors.segundaCartaPorte}
                  helperText={errors.segundaCartaPorte}
                  fullWidth
                  sx={azulStyles}
                />
                <TextField
                  label="Segundo CTG"
                  type="text"
                  value={segundaCTG}
                  onChange={(e) => {
                    const newValue = e.target.value;
                    if (/^\d{0,11}$/.test(newValue)) {
                      setSegundaCTG(newValue);
                    }
                  }}
                  inputProps={{ maxLength: 11 }}
                  error={!!errors.segundaCTG}
                  helperText={errors.segundaCTG}
                  fullWidth
                  sx={azulStyles}
                />
              </Box>
            </Box>
          )}
        </>
      )}

      {/* Botones de acción */}
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
          disabled={fotoRemitoLoading}
        />
        {fotoRemitoLoading && (
          <CircularProgress size={24} sx={{ ml: 1 }} />
        )}

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