import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  CircularProgress,
  IconButton,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { getFotosTurno, deleteFotoTurno, uploadFotoTurnoToSupabase, saveFotoTurnoReference, getRemitoId } from '../../lib/supabase';
import { ContextoGeneral } from '../Contexto';
import { useAuth } from '../autenticacion/ContextoAuth';

interface FotosTurnoDialogProps {
  open: boolean;
  onClose: () => void;
  turnoId: string;
  turno?: any; // Información del turno para verificar si tiene CTG
}

export const FotosTurnoDialog: React.FC<FotosTurnoDialogProps> = ({
  open,
  onClose,
  turnoId,
  turno,
}) => {
  const { theme } = React.useContext(ContextoGeneral);
  const { user } = useAuth();
  const isAdmin = user?.rol?.id === 1;
  const [fotos, setFotos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [openFotoAmpliada, setOpenFotoAmpliada] = useState(false);
  const [fotoAmpliadaUrl, setFotoAmpliadaUrl] = useState<string | null>(null);
  const [fotoAmpliadaTitulo, setFotoAmpliadaTitulo] = useState<string>('');
  const [fotoTaraNueva, setFotoTaraNueva] = useState<File | null>(null);
  const [fotoBrutoNueva, setFotoBrutoNueva] = useState<File | null>(null);
  const [fotoRemitoNueva, setFotoRemitoNueva] = useState<File | null>(null);
  const [fotoTaraPreview, setFotoTaraPreview] = useState<string | null>(null);
  const [fotoBrutoPreview, setFotoBrutoPreview] = useState<string | null>(null);
  const [fotoRemitoPreview, setFotoRemitoPreview] = useState<string | null>(null);
  const [uploadingTara, setUploadingTara] = useState(false);
  const [uploadingBruto, setUploadingBruto] = useState(false);
  const [uploadingRemito, setUploadingRemito] = useState(false);
  const [deletingTara, setDeletingTara] = useState(false);
  const [deletingBruto, setDeletingBruto] = useState(false);
  const [deletingRemito, setDeletingRemito] = useState(false);
  const [tieneCTG, setTieneCTG] = useState<boolean>(false);
  const tema = useTheme();
  const isMobile = useMediaQuery(tema.breakpoints.down('sm'));
  
  // Verificar si el turno tiene CTG (carta de porte)
  useEffect(() => {
    const verificarCTG = async () => {
      if (turno) {
        // Verificar si tiene carta de porte asociada de diferentes formas
        const tieneCartaPorteArray = turno.cartaDePorte && Array.isArray(turno.cartaDePorte) && turno.cartaDePorte.length > 0;
        const tieneCartaPorteObjeto = turno.cartaDePorte && typeof turno.cartaDePorte === 'object' && !Array.isArray(turno.cartaDePorte) && turno.cartaDePorte.numeroCartaPorte;
        const tieneIdCartaPorte = turno.idCartaDePorte;
        const tieneRemito = await getRemitoId(turnoId);
        
        // Si tiene remito, no tiene CTG
        if (tieneRemito) {
          setTieneCTG(false);
        } else {
          // Si tiene alguna forma de carta de porte, tiene CTG
          setTieneCTG(!!(tieneCartaPorteArray || tieneCartaPorteObjeto || tieneIdCartaPorte));
        }
      } else {
        // Si no tenemos el turno completo, verificar si tiene remito
        try {
          const tieneRemito = await getRemitoId(turnoId);
          setTieneCTG(!tieneRemito);
        } catch (error) {
          // Por defecto asumimos que tiene CTG si no podemos verificar
          setTieneCTG(true);
        }
      }
    };
    
    if (open && turnoId) {
      verificarCTG();
    }
  }, [open, turnoId, turno]);

  useEffect(() => {
    if (open && turnoId) {
      cargarFotos();
    } else {
      setFotos([]);
    }
  }, [open, turnoId]);

  const cargarFotos = async () => {
    if (!turnoId || turnoId.trim() === '') {
      return;
    }
    
    setLoading(true);
    try {
      const fotosData = await getFotosTurno(turnoId);
      setFotos(fotosData || []);
    } catch (error) {
      console.error('Error al cargar fotos:', error);
      setFotos([]);
    } finally {
      setLoading(false);
    }
  };

  const handleVerFotoAmpliada = (url: string, tipo: string) => {
    setFotoAmpliadaUrl(url);
    const titulos: { [key: string]: string } = {
      'tara': 'Foto de Tara',
      'bruto': 'Foto de Peso Bruto',
      'remito': 'Foto del Remito'
    };
    setFotoAmpliadaTitulo(titulos[tipo] || 'Foto');
    setOpenFotoAmpliada(true);
  };

  const handleFotoTaraChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('El archivo debe ser una imagen');
        return;
      }
      setFotoTaraNueva(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFotoTaraPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFotoBrutoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('El archivo debe ser una imagen');
        return;
      }
      setFotoBrutoNueva(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFotoBrutoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFotoRemitoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('El archivo debe ser una imagen');
        return;
      }
      setFotoRemitoNueva(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFotoRemitoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEliminarFotoTara = async () => {
    if (!confirm('¿Está seguro que desea eliminar la foto de tara?')) {
      return;
    }
    setDeletingTara(true);
    try {
      await deleteFotoTurno(turnoId, 'tara');
      await cargarFotos();
      setFotoTaraNueva(null);
      setFotoTaraPreview(null);
    } catch (error) {
      console.error('Error al eliminar foto de tara:', error);
      alert('Error al eliminar la foto');
    } finally {
      setDeletingTara(false);
    }
  };

  const handleEliminarFotoBruto = async () => {
    if (!confirm('¿Está seguro que desea eliminar la foto de peso bruto?')) {
      return;
    }
    setDeletingBruto(true);
    try {
      await deleteFotoTurno(turnoId, 'bruto');
      await cargarFotos();
      setFotoBrutoNueva(null);
      setFotoBrutoPreview(null);
    } catch (error) {
      console.error('Error al eliminar foto de bruto:', error);
      alert('Error al eliminar la foto');
    } finally {
      setDeletingBruto(false);
    }
  };

  const handleEliminarFotoRemito = async () => {
    if (!confirm('¿Está seguro que desea eliminar la foto del remito?')) {
      return;
    }
    setDeletingRemito(true);
    try {
      await deleteFotoTurno(turnoId, 'remito');
      await cargarFotos();
      setFotoRemitoNueva(null);
      setFotoRemitoPreview(null);
    } catch (error) {
      console.error('Error al eliminar foto de remito:', error);
      alert('Error al eliminar la foto');
    } finally {
      setDeletingRemito(false);
    }
  };

  const handleSubirFotoTara = async () => {
    if (!fotoTaraNueva) return;
    
    setUploadingTara(true);
    try {
      const uploadResult = await uploadFotoTurnoToSupabase(
        fotoTaraNueva,
        turnoId,
        'tara'
      );
      
      if (uploadResult) {
        await saveFotoTurnoReference(
          turnoId,
          'tara',
          uploadResult.path,
          uploadResult.url
        );
        await cargarFotos();
        setFotoTaraNueva(null);
        setFotoTaraPreview(null);
      }
    } catch (error) {
      console.error('Error al subir foto de tara:', error);
      alert('Error al subir la foto');
    } finally {
      setUploadingTara(false);
    }
  };

  const handleSubirFotoBruto = async () => {
    if (!fotoBrutoNueva) return;
    
    setUploadingBruto(true);
    try {
      const uploadResult = await uploadFotoTurnoToSupabase(
        fotoBrutoNueva,
        turnoId,
        'bruto'
      );
      
      if (uploadResult) {
        await saveFotoTurnoReference(
          turnoId,
          'bruto',
          uploadResult.path,
          uploadResult.url
        );
        await cargarFotos();
        setFotoBrutoNueva(null);
        setFotoBrutoPreview(null);
      }
    } catch (error) {
      console.error('Error al subir foto de bruto:', error);
      alert('Error al subir la foto');
    } finally {
      setUploadingBruto(false);
    }
  };

  const handleSubirFotoRemito = async () => {
    if (!fotoRemitoNueva) return;
    
    setUploadingRemito(true);
    try {
      const uploadResult = await uploadFotoTurnoToSupabase(
        fotoRemitoNueva,
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
        await cargarFotos();
        setFotoRemitoNueva(null);
        setFotoRemitoPreview(null);
      }
    } catch (error) {
      console.error('Error al subir foto de remito:', error);
      alert('Error al subir la foto');
    } finally {
      setUploadingRemito(false);
    }
  };

  const fotoTara = fotos.find((f: any) => f.tipo_foto === 'tara');
  const fotoBruto = fotos.find((f: any) => f.tipo_foto === 'bruto');
  const fotoRemito = fotos.find((f: any) => f.tipo_foto === 'remito');
  
  // Mostrar tab de remito solo si no tiene CTG y el estado es >= 7 (Cargado)
  const estadoId = turno?.estado?.id;
  const mostrarRemito = !tieneCTG && estadoId && estadoId >= 7;

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Fotos del Turno</Typography>
            <IconButton onClick={onClose} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
              <CircularProgress />
            </Box>
          ) : fotos.length === 0 ? (
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
              minHeight={200}
              gap={2}
            >
              <PhotoCameraIcon sx={{ fontSize: 64, color: '#bdbdbd' }} />
              <Typography variant="body1" color="text.secondary">
                No hay fotos disponibles para este turno
              </Typography>
            </Box>
          ) : (
            <Box display="flex" flexDirection="column" gap={3} sx={{ mt: 1 }}>
              {/* Foto de Tara */}
              <Box>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, color: theme.colores.azul }}>
                    Foto de Tara
                  </Typography>
                  {isAdmin && fotoTara && (
                    <IconButton
                      onClick={handleEliminarFotoTara}
                      disabled={deletingTara}
                      size="small"
                      sx={{ color: '#d68384' }}
                    >
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  )}
                </Box>
                {fotoTara || fotoTaraPreview ? (
                  <Box
                    sx={{
                      position: 'relative',
                      width: '100%',
                      maxWidth: isMobile ? '100%' : 500,
                      margin: '0 auto',
                      cursor: 'pointer',
                      borderRadius: 2,
                      overflow: 'hidden',
                      border: `2px solid ${theme.colores.azul}`,
                      '&:hover': {
                        boxShadow: 4,
                      },
                    }}
                    onClick={() => {
                      if (fotoTara) {
                        handleVerFotoAmpliada(fotoTara.url, 'tara');
                      }
                    }}
                  >
                    <img
                      src={fotoTaraPreview || fotoTara?.url || ''}
                      alt="Foto de Tara"
                      style={{
                        width: '100%',
                        height: 'auto',
                        display: 'block',
                      }}
                    />
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', mb: 2 }}>
                    No disponible
                  </Typography>
                )}
                {isAdmin && (
                  <Box sx={{ mt: 2 }}>
                    <input
                      accept="image/*"
                      style={{ display: 'none' }}
                      id="foto-tara-reemplazar-input"
                      type="file"
                      onChange={handleFotoTaraChange}
                    />
                    <label htmlFor="foto-tara-reemplazar-input">
                      <Button
                        variant="outlined"
                        component="span"
                        startIcon={<PhotoCameraIcon />}
                        fullWidth={isMobile}
                        disabled={uploadingTara}
                        sx={{
                          borderColor: theme.colores.azul,
                          color: theme.colores.azul,
                          '&:hover': {
                            borderColor: theme.colores.azulOscuro,
                            backgroundColor: 'rgba(22, 54, 96, 0.05)'
                          }
                        }}
                      >
                        {fotoTara ? 'Reemplazar Foto' : 'Agregar Foto'}
                      </Button>
                    </label>
                    {fotoTaraNueva && (
                      <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                        <Button
                          variant="contained"
                          onClick={handleSubirFotoTara}
                          disabled={uploadingTara}
                          sx={{
                            backgroundColor: theme.colores.azul,
                            color: '#fff',
                            '&:hover': { backgroundColor: theme.colores.azulOscuro },
                            flex: 1
                          }}
                        >
                          {uploadingTara ? <CircularProgress size={20} /> : 'Subir'}
                        </Button>
                        <Button
                          variant="outlined"
                          onClick={() => {
                            setFotoTaraNueva(null);
                            setFotoTaraPreview(null);
                          }}
                          disabled={uploadingTara}
                          sx={{
                            borderColor: theme.colores.azul,
                            color: theme.colores.azul,
                          }}
                        >
                          Cancelar
                        </Button>
                      </Box>
                    )}
                  </Box>
                )}
              </Box>

              {/* Foto de Bruto */}
              <Box>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, color: theme.colores.azul }}>
                    Foto de Peso Bruto
                  </Typography>
                  {isAdmin && fotoBruto && (
                    <IconButton
                      onClick={handleEliminarFotoBruto}
                      disabled={deletingBruto}
                      size="small"
                      sx={{ color: '#d68384' }}
                    >
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  )}
                </Box>
                {fotoBruto || fotoBrutoPreview ? (
                  <Box
                    sx={{
                      position: 'relative',
                      width: '100%',
                      maxWidth: isMobile ? '100%' : 500,
                      margin: '0 auto',
                      cursor: 'pointer',
                      borderRadius: 2,
                      overflow: 'hidden',
                      border: `2px solid ${theme.colores.azul}`,
                      '&:hover': {
                        boxShadow: 4,
                      },
                    }}
                    onClick={() => {
                      if (fotoBruto) {
                        handleVerFotoAmpliada(fotoBruto.url, 'bruto');
                      }
                    }}
                  >
                    <img
                      src={fotoBrutoPreview || fotoBruto?.url || ''}
                      alt="Foto de Peso Bruto"
                      style={{
                        width: '100%',
                        height: 'auto',
                        display: 'block',
                      }}
                    />
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', mb: 2 }}>
                    No disponible
                  </Typography>
                )}
                {isAdmin && (
                  <Box sx={{ mt: 2 }}>
                    <input
                      accept="image/*"
                      style={{ display: 'none' }}
                      id="foto-bruto-reemplazar-input"
                      type="file"
                      onChange={handleFotoBrutoChange}
                    />
                    <label htmlFor="foto-bruto-reemplazar-input">
                      <Button
                        variant="outlined"
                        component="span"
                        startIcon={<PhotoCameraIcon />}
                        fullWidth={isMobile}
                        disabled={uploadingBruto}
                        sx={{
                          borderColor: theme.colores.azul,
                          color: theme.colores.azul,
                          '&:hover': {
                            borderColor: theme.colores.azulOscuro,
                            backgroundColor: 'rgba(22, 54, 96, 0.05)'
                          }
                        }}
                      >
                        {fotoBruto ? 'Reemplazar Foto' : 'Agregar Foto'}
                      </Button>
                    </label>
                    {fotoBrutoNueva && (
                      <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                        <Button
                          variant="contained"
                          onClick={handleSubirFotoBruto}
                          disabled={uploadingBruto}
                          sx={{
                            backgroundColor: theme.colores.azul,
                            color: '#fff',
                            '&:hover': { backgroundColor: theme.colores.azulOscuro },
                            flex: 1
                          }}
                        >
                          {uploadingBruto ? <CircularProgress size={20} /> : 'Subir'}
                        </Button>
                        <Button
                          variant="outlined"
                          onClick={() => {
                            setFotoBrutoNueva(null);
                            setFotoBrutoPreview(null);
                          }}
                          disabled={uploadingBruto}
                          sx={{
                            borderColor: theme.colores.azul,
                            color: theme.colores.azul,
                          }}
                        >
                          Cancelar
                        </Button>
                      </Box>
                    )}
                  </Box>
                )}
              </Box>

              {/* Foto de Remito (solo si no tiene CTG y estado >= Cargado) */}
              {mostrarRemito && (
                <Box>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, color: theme.colores.azul }}>
                      Foto del Remito
                    </Typography>
                    {isAdmin && fotoRemito && (
                      <IconButton
                        onClick={handleEliminarFotoRemito}
                        disabled={deletingRemito}
                        size="small"
                        sx={{ color: '#d68384' }}
                      >
                        <DeleteOutlineIcon fontSize="small" />
                      </IconButton>
                    )}
                  </Box>
                  {fotoRemito || fotoRemitoPreview ? (
                    <Box
                      sx={{
                        position: 'relative',
                        width: '100%',
                        maxWidth: isMobile ? '100%' : 500,
                        margin: '0 auto',
                        cursor: 'pointer',
                        borderRadius: 2,
                        overflow: 'hidden',
                        border: `2px solid ${theme.colores.azul}`,
                        '&:hover': {
                          boxShadow: 4,
                        },
                      }}
                      onClick={() => {
                        if (fotoRemito) {
                          handleVerFotoAmpliada(fotoRemito.url, 'remito');
                        }
                      }}
                    >
                      <img
                        src={fotoRemitoPreview || fotoRemito?.url || ''}
                        alt="Foto del Remito"
                        style={{
                          width: '100%',
                          height: 'auto',
                          display: 'block',
                        }}
                      />
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', mb: 2 }}>
                      No disponible
                    </Typography>
                  )}
                  {isAdmin && (
                    <Box sx={{ mt: 2 }}>
                      <input
                        accept="image/*"
                        style={{ display: 'none' }}
                        id="foto-remito-reemplazar-input"
                        type="file"
                        onChange={handleFotoRemitoChange}
                      />
                      <label htmlFor="foto-remito-reemplazar-input">
                        <Button
                          variant="outlined"
                          component="span"
                          startIcon={<PhotoCameraIcon />}
                          fullWidth={isMobile}
                          disabled={uploadingRemito}
                          sx={{
                            borderColor: theme.colores.azul,
                            color: theme.colores.azul,
                            '&:hover': {
                              borderColor: theme.colores.azulOscuro,
                              backgroundColor: 'rgba(22, 54, 96, 0.05)'
                            }
                          }}
                        >
                          {fotoRemito ? 'Reemplazar Foto' : 'Agregar Foto'}
                        </Button>
                      </label>
                      {fotoRemitoNueva && (
                        <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                          <Button
                            variant="contained"
                            onClick={handleSubirFotoRemito}
                            disabled={uploadingRemito}
                            sx={{
                              backgroundColor: theme.colores.azul,
                              color: '#fff',
                              '&:hover': { backgroundColor: theme.colores.azulOscuro },
                              flex: 1
                            }}
                          >
                            {uploadingRemito ? <CircularProgress size={20} /> : 'Subir'}
                          </Button>
                          <Button
                            variant="outlined"
                            onClick={() => {
                              setFotoRemitoNueva(null);
                              setFotoRemitoPreview(null);
                            }}
                            disabled={uploadingRemito}
                            sx={{
                              borderColor: theme.colores.azul,
                              color: theme.colores.azul,
                            }}
                          >
                            Cancelar
                          </Button>
                        </Box>
                      )}
                    </Box>
                  )}
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ padding: 2 }}>
          <Button
            onClick={onClose}
            variant="contained"
            sx={{
              backgroundColor: theme.colores.azul,
              color: '#fff',
              '&:hover': { backgroundColor: theme.colores.azulOscuro },
            }}
          >
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog para foto ampliada */}
      <Dialog
        open={openFotoAmpliada}
        onClose={() => setOpenFotoAmpliada(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">{fotoAmpliadaTitulo}</Typography>
            <IconButton onClick={() => setOpenFotoAmpliada(false)} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {fotoAmpliadaUrl && (
            <img
              src={fotoAmpliadaUrl}
              alt={fotoAmpliadaTitulo}
              style={{ width: '100%', height: 'auto' }}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

