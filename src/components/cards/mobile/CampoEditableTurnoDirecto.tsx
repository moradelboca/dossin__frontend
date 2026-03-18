import React, { useContext, useMemo, useState } from 'react';
import {
  Box,
  IconButton,
  TextField,
  Typography,
} from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import AutocompleteEmpresas from '../../forms/autocompletes/AutocompleteEmpresas';
import AutocompleteColaboradores from '../../forms/autocompletes/AutocompleteColaboradores';
import AutocompleteCamiones from '../../forms/autocompletes/AutocompleteCamiones';
import AutocompleteAcoplados from '../../forms/autocompletes/AutocompleteAcoplados';
import { ContextoGeneral } from '../../Contexto';

type PayloadKey =
  | 'cuitEmpresa'
  | 'cuilColaborador'
  | 'patenteCamion'
  | 'patenteAcoplado'
  | 'patenteAcopladoExtra'
  | 'kgTara'
  | 'kgBruto'
  | 'kgNeto'
  | 'kgCargados';

const MAP_LABEL_TO_PAYLOAD_KEY: Record<string, PayloadKey> = {
  'Empresa transportista': 'cuitEmpresa',
  Chofer: 'cuilColaborador',
  'Patente camión': 'patenteCamion',
  'Patente acoplado': 'patenteAcoplado',
  'Patente acoplado extra': 'patenteAcopladoExtra',
  'Kg tara': 'kgTara',
  'Kg bruto': 'kgBruto',
  'Kg neto': 'kgNeto',
  'Kg cargados': 'kgCargados',
};

interface CampoEditableTurnoDirectoProps {
  label: string;
  isMobile: boolean;
  valorDisplay: any;
  valorActual: any;
  valorCopiable?: any;
  empresas?: any[];
  ubicaciones?: any[];
  empresaSeleccionadaCuit?: string | null;
  copiedField: string | null;
  onCopy: (valor: string, label: string) => void;
  onStage: (patch: Partial<Record<PayloadKey, any>>) => void;
}

export default function CampoEditableTurnoDirecto({
  label,
  isMobile,
  valorDisplay,
  valorActual,
  valorCopiable,
  empresaSeleccionadaCuit,
  copiedField,
  onCopy,
  onStage,
}: CampoEditableTurnoDirectoProps) {
  const { theme } = useContext(ContextoGeneral);

  const payloadKey = useMemo(() => MAP_LABEL_TO_PAYLOAD_KEY[label], [label]);
  const isNumeric = useMemo(() => {
    return (
      payloadKey === 'kgTara' ||
      payloadKey === 'kgBruto' ||
      payloadKey === 'kgNeto' ||
      payloadKey === 'kgCargados'
    );
  }, [payloadKey]);

  const [isEditing, setIsEditing] = useState(false);
  const [valorEditado, setValorEditado] = useState<any>(valorActual);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (!isEditing) setValorEditado(valorActual);
  }, [valorActual, isEditing]);

  const handleCancel = () => {
    setIsEditing(false);
    setError(null);
    setValorEditado(valorActual);
  };

  const handleSave = () => {
    if (!payloadKey) return;

    // Validaciones mínimas para kilos
    if (isNumeric) {
      if (valorEditado === '' || valorEditado === undefined) {
        setError('Este campo es obligatorio');
        return;
      }
      const num = Number(valorEditado);
      if (Number.isNaN(num)) {
        setError('Debe ser un número');
        return;
      }
      if (num < 0) {
        setError('El valor no puede ser negativo');
        return;
      }
    }

    const valorAGuardar =
      isNumeric ? Number(valorEditado) : valorEditado ?? null;

    onStage({ [payloadKey]: valorAGuardar } as any);
    setIsEditing(false);
    setError(null);
  };

  const valorMostrar = valorDisplay && String(valorDisplay).trim() !== '' ? valorDisplay : 'Dato no necesario';

  const renderEditor = () => {
    if (!payloadKey) return null;

    if (payloadKey === 'cuitEmpresa') {
      return (
        <AutocompleteEmpresas
          value={valorEditado ?? null}
          onChange={(v) => {
            setValorEditado(v);
            setError(null);
          }}
          rolEmpresa="Empresa Transportista"
          error={!!error}
          helperText={error}
          labelText="Empresa transportista"
          fullWidth
        />
      );
    }

    if (payloadKey === 'cuilColaborador') {
      return (
        <AutocompleteColaboradores
          value={valorEditado ?? null}
          onChange={(v) => {
            setValorEditado(v);
            setError(null);
          }}
          error={!!error}
          helperText={error}
          empresaSeleccionada={empresaSeleccionadaCuit}
          disabled={false}
        />
      );
    }

    if (payloadKey === 'patenteCamion') {
      return (
        <AutocompleteCamiones
          value={valorEditado ?? null}
          onChange={(v) => {
            setValorEditado(v);
            setError(null);
          }}
          error={!!error}
          helperText={error}
        />
      );
    }

    if (payloadKey === 'patenteAcoplado') {
      return (
        <AutocompleteAcoplados
          value={valorEditado ?? null}
          onChange={(v) => {
            setValorEditado(v);
            setError(null);
          }}
          error={!!error}
          helperText={error}
          tituloOpcional="Patente acoplado"
        />
      );
    }

    if (payloadKey === 'patenteAcopladoExtra') {
      return (
        <AutocompleteAcoplados
          value={valorEditado ?? null}
          onChange={(v) => {
            setValorEditado(v);
            setError(null);
          }}
          error={!!error}
          helperText={error}
          tituloOpcional="Patente acoplado extra"
        />
      );
    }

    if (isNumeric) {
      return (
        <TextField
          type="number"
          label={label}
          value={valorEditado ?? ''}
          onChange={(e) => {
            setValorEditado(e.target.value === '' ? '' : Number(e.target.value));
            setError(null);
          }}
          error={!!error}
          helperText={error}
          fullWidth
          sx={{
            '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: theme.colores.azul,
            },
            '& .MuiInputLabel-root.Mui-focused': {
              color: theme.colores.azul,
            },
          }}
        />
      );
    }

    return null;
  };

  if (isMobile) {
    return (
      <Box sx={{ borderBottom: '1px solid #eee', pb: 1, mb: 1 }}>
        <Typography sx={{ fontWeight: 500, fontSize: 15 }}>{label}</Typography>
        {isEditing ? (
          <Box sx={{ mt: 1 }}>
            {renderEditor()}
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
            <Typography sx={{ flex: 1 }}>
              {valorMostrar}
            </Typography>
            <IconButton
              size="small"
              onClick={() =>
                onCopy(String(valorCopiable ?? valorActual ?? ''), label)
              }
            >
              <ContentCopyIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => {
                setIsEditing(true);
                setError(null);
              }}
              sx={{ color: theme.colores.azul }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
            {copiedField === label && (
              <Typography sx={{ color: theme.colores.azul, fontSize: 12 }}>
                Copiado!
              </Typography>
            )}
          </Box>
        )}
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        borderBottom: '1px solid #eee',
        pb: 1,
      }}
    >
      <Typography sx={{ minWidth: 260, fontWeight: 500 }}>{label}</Typography>
      {isEditing ? (
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
          {renderEditor()}
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
          <IconButton
            size="small"
            onClick={() =>
              onCopy(String(valorCopiable ?? valorActual ?? ''), label)
            }
          >
            <ContentCopyIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => {
              setIsEditing(true);
              setError(null);
            }}
            sx={{ color: theme.colores.azul }}
          >
            <EditIcon fontSize="small" />
          </IconButton>
          {copiedField === label && (
            <Typography sx={{ color: theme.colores.azul, fontSize: 12, ml: 1 }}>
              Copiado!
            </Typography>
          )}
        </>
      )}
    </Box>
  );
}

