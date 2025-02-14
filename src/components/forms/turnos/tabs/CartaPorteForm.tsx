import React, { useState, useEffect } from 'react';
import { TextField, Button, Stack, Box } from '@mui/material';
import useCartaPorteHandler from '../../../hooks/turnos/useCartaPorteHandler';

interface CartaPorteFormProps {
  turnoId: string;
  // Suponemos que initialData.numeroCartaPorte es el valor guardado originalmente en el turno.
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
  onCancel 
}) => {
  // Estado local para el número y CTG, iniciados con los valores originales.
  const [numeroCartaPorte, setNumeroCartaPorte] = useState<number | ''>(
    initialData?.numeroCartaPorte || ''
  );
  const [ctg, setCtg] = useState<number | ''>(
    initialData?.CTG || ''
  );
  const [errors, setErrors] = useState<{ numeroCartaPorte?: string; ctg?: string }>({});
  const { handleCartaPorteSubmission } = useCartaPorteHandler();

  // Cada vez que initialData cambie, se actualizan los estados.
  useEffect(() => {
    setNumeroCartaPorte(
      initialData?.numeroCartaPorte !== undefined
        ? initialData.numeroCartaPorte
        : ''
    );
    setCtg(
      initialData?.CTG !== undefined
        ? initialData.CTG
        : ''
    );
  }, [initialData?.numeroCartaPorte, initialData?.CTG]);

  // Esta condición se recalcula en cada render
  // Si el valor actual es igual al valor original, se entiende que se quiere actualizar.
  const isUpdate =
    initialData?.numeroCartaPorte !== undefined &&
    Number(numeroCartaPorte) === initialData.numeroCartaPorte;

  const validate = () => {
    const newErrors: { numeroCartaPorte?: string; ctg?: string } = {};
    if (!numeroCartaPorte) newErrors.numeroCartaPorte = 'Número de Carta de Porte es obligatorio';
    if (!ctg) newErrors.ctg = 'CTG es obligatorio';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    // Se pasa isUpdate para que el hook sepa si usar PUT o POST.
    handleCartaPorteSubmission(
      turnoId,
      {
        numeroCartaPorte: Number(numeroCartaPorte),
        CTG: Number(ctg)
      },
      isUpdate
    )
      .then((result) => onSuccess(result))
      .catch((error) =>
        console.error('Error al procesar Carta de Porte:', error)
      );
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <TextField
        label="Número Carta de Porte"
        type="text"
        value={numeroCartaPorte}
        onChange={(e) => {
          const newValue = e.target.value;
          // Se aceptan solo valores numéricos
          if (/^\d*$/.test(newValue)) {
            setNumeroCartaPorte(newValue === '' ? '' : Number(newValue));
          }
        }}
        error={!!errors.numeroCartaPorte}
        helperText={errors.numeroCartaPorte}
        fullWidth
      />
      <TextField
        label="CTG"
        type="text"
        value={ctg}
        onChange={(e) => {
          const newValue = e.target.value;
          if (/^\d*$/.test(newValue)) {
            setCtg(newValue === '' ? '' : Number(newValue));
          }
        }}
        error={!!errors.ctg}
        helperText={errors.ctg}
        fullWidth
      />
      <Stack direction="row" spacing={2} justifyContent="flex-end">
        <Button onClick={onCancel}>Cancelar</Button>
        <Button 
          onClick={handleSubmit} 
          color="primary"
          variant="contained"
        >
          {isUpdate ? 'Actualizar Carta' : 'Crear Carta'}
        </Button>
      </Stack>
    </Box>
  );
};

export default CartaPorteForm;
