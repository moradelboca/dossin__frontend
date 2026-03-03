import React, { useState, useContext } from 'react';
import {
  Box,
  IconButton,
  Typography,
  Autocomplete,
  TextField,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import { ContextoGeneral } from '../../Contexto';
import AutocompleteEmpresas from '../../forms/autocompletes/AutocompleteEmpresas';
import { axiosGet } from '../../../lib/axiosConfig';
import type { TipoModificacionCampo } from '../../../types/turnos';

interface CampoEditableCartaPorteProps {
  label: string;
  valor: any;
  tipoModificacion: TipoModificacionCampo | null;
  isMobile: boolean;
  onCopy: (valor: string, label: string) => void;
  copiedField: string | null;
  onSave: (valor: any) => void;
  onCancel: () => void;
  empresas?: any[];
  ubicaciones?: any[];
}

const CampoEditableCartaPorte: React.FC<CampoEditableCartaPorteProps> = ({
  label,
  valor,
  tipoModificacion,
  isMobile,
  onCopy,
  copiedField,
  onSave,
  onCancel,
  empresas: _empresas = [],
  ubicaciones = [],
}) => {
  const { theme, backendURL } = useContext(ContextoGeneral);
  const tema = useTheme();
  useMediaQuery(tema.breakpoints.down('sm')); // reservado para uso futuro
  const [isEditing, setIsEditing] = useState(false);
  const [valorEditado, setValorEditado] = useState<any>(valor);
  const [empresaSeleccionada, setEmpresaSeleccionada] = useState<any>(null);
  const [ubicacionSeleccionada, setUbicacionSeleccionada] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Cargar empresa si el valor es un CUIT
  React.useEffect(() => {
    if (tipoModificacion?.entidad === 'Empresa' && valor && !isEditing) {
      axiosGet<any[]>(`empresas?cuit=${valor}`, backendURL)
        .then((data) => {
          if (data && data.length > 0) {
            setEmpresaSeleccionada(data[0]);
          }
        })
        .catch(() => {
          // Ignorar error
        });
    }
  }, [valor, tipoModificacion, backendURL, isEditing]);

  const handleEditClick = () => {
    setIsEditing(true);
    setValorEditado(valor);
    setError(null);
  };

  const handleSave = () => {
    // Validar campo obligatorio
    if (tipoModificacion && !tipoModificacion.nullable) {
      if (valorEditado === null || valorEditado === undefined || valorEditado === '') {
        setError('Este campo es obligatorio');
        return;
      }
    }

    let valorAGuardar = valorEditado;

    // Si es empresa, obtener el CUIT
    if (tipoModificacion?.entidad === 'Empresa' && empresaSeleccionada) {
      valorAGuardar = empresaSeleccionada.cuit;
    }

    // Si es ubicación, obtener el ID
    if (tipoModificacion?.entidad === 'Ubicacion' && ubicacionSeleccionada) {
      valorAGuardar = ubicacionSeleccionada.id;
    }

    onSave(valorAGuardar);
    setIsEditing(false);
    setError(null);
  };

  const handleCancel = () => {
    setValorEditado(valor);
    setEmpresaSeleccionada(null);
    setUbicacionSeleccionada(null);
    setIsEditing(false);
    setError(null);
    onCancel();
  };

  const renderCampoEdicion = () => {
    if (!tipoModificacion) return null;

    switch (tipoModificacion.entidad) {
      case 'Empresa':
        return (
          <AutocompleteEmpresas
            value={empresaSeleccionada?.cuit || valorEditado || null}
            onChange={(cuit) => {
              setValorEditado(cuit);
              setError(null);
            }}
            onChangeEmpresa={(empresa) => {
              setEmpresaSeleccionada(empresa);
            }}
            error={!!error}
            helperText={error}
            labelText={label}
            fullWidth
          />
        );

      case 'Ubicacion':
        return (
          <Autocomplete
            options={ubicaciones}
            getOptionLabel={(option) => {
              if (typeof option === 'string') return option;
              return `${option.nombre}, ${option.localidad?.nombre || ''}, ${option.localidad?.provincia?.nombre || ''}`;
            }}
            value={ubicacionSeleccionada || ubicaciones.find(u => u.id === valorEditado) || null}
            onChange={(_, newValue) => {
              setUbicacionSeleccionada(newValue);
              setValorEditado(newValue?.id || null);
              setError(null);
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label={label}
                error={!!error}
                helperText={error}
                fullWidth
                sx={{
                  '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: theme.colores.azul,
                  },
                }}
              />
            )}
          />
        );

      case 'Valor':
        return (
          <TextField
            type="number"
            label={label}
            value={valorEditado || ''}
            onChange={(e) => {
              setValorEditado(e.target.value ? Number(e.target.value) : null);
              setError(null);
            }}
            error={!!error}
            helperText={error}
            fullWidth
            sx={{
              '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: theme.colores.azul,
              },
            }}
          />
        );

      default:
        return null;
    }
  };

  const valorMostrar = valor && String(valor).trim() !== '' ? String(valor) : 'Dato no necesario';

  if (isMobile) {
    return (
      <Box sx={{ borderBottom: '1px solid #eee', pb: 1, mb: 1 }}>
        <Typography sx={{ fontWeight: 500, fontSize: 15 }}>{label}</Typography>
        {isEditing ? (
          <Box sx={{ mt: 1 }}>
            {renderCampoEdicion()}
            <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
              <IconButton
                size="small"
                onClick={handleSave}
                sx={{ color: theme.colores.azul }}
              >
                <CheckIcon />
              </IconButton>
              <IconButton
                size="small"
                onClick={handleCancel}
                sx={{ color: '#d32f2f' }}
              >
                <CloseIcon />
              </IconButton>
            </Box>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
            <Typography sx={{ flex: 1 }}>{valorMostrar}</Typography>
            <IconButton size="small" onClick={() => onCopy(String(valor), label)}>
              <ContentCopyIcon fontSize="small" />
            </IconButton>
            {tipoModificacion && (
              <IconButton
                size="small"
                onClick={handleEditClick}
                sx={{ color: theme.colores.azul }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            )}
            {copiedField === label && (
              <Typography sx={{ color: theme.colores.azul, fontSize: 12 }}>Copiado!</Typography>
            )}
          </Box>
        )}
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, borderBottom: '1px solid #eee', pb: 1 }}>
      <Typography sx={{ minWidth: 260, fontWeight: 500 }}>{label}</Typography>
      {isEditing ? (
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
          {renderCampoEdicion()}
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton
              size="small"
              onClick={handleSave}
              sx={{ color: theme.colores.azul }}
            >
              <CheckIcon />
            </IconButton>
            <IconButton
              size="small"
              onClick={handleCancel}
              sx={{ color: '#d32f2f' }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>
      ) : (
        <>
          <Typography sx={{ flex: 1 }}>{valorMostrar}</Typography>
          <IconButton size="small" onClick={() => onCopy(String(valor), label)}>
            <ContentCopyIcon fontSize="small" />
          </IconButton>
          {tipoModificacion && (
            <IconButton
              size="small"
              onClick={handleEditClick}
              sx={{ color: theme.colores.azul }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          )}
          {copiedField === label && (
            <Typography sx={{ color: theme.colores.azul, fontSize: 12, ml: 1 }}>Copiado!</Typography>
          )}
        </>
      )}
    </Box>
  );
};

export default CampoEditableCartaPorte;
