// components/tabs/FacturaForm.tsx
import React, { useState, useEffect, useContext } from 'react';
import { TextField, Button, Stack, Box, Autocomplete } from '@mui/material';
import useFacturaHandler from '../../../hooks/turnos/useFacturaHandler';
import { ContextoGeneral } from '../../../Contexto';

interface TipoFactura {
  id: number;
  nombre: string;
}

interface FacturaFormProps {
  turnoId: string;
  initialFactura?: {
    id?: string;
    tipoFactura?: TipoFactura;
    fecha?: string;
    valorIva?: number;
    total?: number;
  };
  onSuccess: (updatedData: any) => void;
  onCancel: () => void;
}

const FacturaForm: React.FC<FacturaFormProps> = ({
  turnoId,
  initialFactura,
  onSuccess,
  onCancel,
}) => {
  const { backendURL } = useContext(ContextoGeneral);
  
  const [tipoFactura, setTipoFactura] = useState<TipoFactura | null>(
    initialFactura?.tipoFactura || null
  );
  const [fecha, setFecha] = useState<string>(initialFactura?.fecha || '');
  const [valorIva, setValorIva] = useState<number | ''>(
    initialFactura?.valorIva ?? ''
  );
  const [total, setTotal] = useState<number | ''>(
    initialFactura?.total ?? ''
  );
  const [errors, setErrors] = useState<{
    tipoFactura?: string;
    fecha?: string;
    valorIva?: string;
    total?: string;
  }>({});
  const [tiposFacturaOptions, setTiposFacturaOptions] = useState<TipoFactura[]>([]);
  const { handleFacturaSubmission } = useFacturaHandler();

  const headers = {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
  };

  // Cargar los tipos de factura para el autocomplete
  useEffect(() => {
    const fetchTiposFactura = async () => {
      try {
        const response = await fetch(`${backendURL}/facturas/tipos`, {
          method: 'GET',
          headers: headers,
        });
        if (!response.ok) throw new Error('Error al obtener los tipos de factura');
        const data = await response.json();
        setTiposFacturaOptions(data);  // Asegúrate de que data tenga el formato adecuado
      } catch (error) {
        console.error(error);
      }
    };
    fetchTiposFactura();
  }, [backendURL]);

  // Actualiza el estado si cambia la factura inicial
  useEffect(() => {
    if (initialFactura) {
      setTipoFactura(initialFactura.tipoFactura || null);
      setFecha(initialFactura.fecha || '');
      setValorIva(initialFactura.valorIva ?? '');
      setTotal(initialFactura.total ?? '');
    }
  }, [initialFactura]);

  const validate = () => {
    const newErrors: {
      tipoFactura?: string;
      fecha?: string;
      valorIva?: string;
      total?: string;
    } = {};

    if (tipoFactura === null)
      newErrors.tipoFactura = 'El tipo de factura es obligatorio';
    if (!fecha) newErrors.fecha = 'La fecha es obligatoria';
    if (valorIva === '')
      newErrors.valorIva = 'El valor del IVA es obligatorio';
    else if (Number(valorIva) < 0)
      newErrors.valorIva = 'El valor del IVA no puede ser negativo';
    if (total === '')
      newErrors.total = 'El total es obligatorio';
    else if (Number(total) < 0)
      newErrors.total = 'El total no puede ser negativo';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    
    // Asegurar que tipoFactura no es null después de la validación
    if (!tipoFactura) {
      setErrors(prev => ({ ...prev, tipoFactura: 'El tipo de factura es obligatorio' }));
      return;
    }
  
    try {
      const result = await handleFacturaSubmission(turnoId, {
        idFactura: initialFactura?.id,
        tipoFactura: tipoFactura.id, // Ahora seguro que no es null
        fecha,
        valorIva: Number(valorIva),
        total: Number(total),
      });
      onSuccess(result);
    } catch (error) {
      console.error('Error al procesar la factura:', error);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Autocomplete
        options={tiposFacturaOptions}
        getOptionLabel={(option) => option.nombre}
        value={tipoFactura}  // Directamente el objeto
        onChange={(_event, newValue) => setTipoFactura(newValue)}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Tipo de Factura"
            error={!!errors.tipoFactura}
            helperText={errors.tipoFactura}
          />
        )}
      />
      <TextField
        label="Fecha"
        type="date"
        value={fecha}
        onChange={(e) => setFecha(e.target.value)}
        error={!!errors.fecha}
        helperText={errors.fecha}
        InputLabelProps={{
          shrink: true,
        }}
      />
      <TextField
        label="Valor IVA"
        type="number"
        value={valorIva}
        onChange={(e) =>
          setValorIva(e.target.value ? Number(e.target.value) : '')
        }
        error={!!errors.valorIva}
        helperText={errors.valorIva}
      />
      <TextField
        label="Total"
        type="number"
        value={total}
        onChange={(e) =>
          setTotal(e.target.value ? Number(e.target.value) : '')
        }
        error={!!errors.total}
        helperText={errors.total}
      />
      <Stack direction="row" spacing={2} justifyContent="flex-end">
        <Button onClick={onCancel}>Cancelar</Button>
        <Button onClick={handleSubmit} color="primary" variant="contained">
          {initialFactura?.id ? 'Actualizar Factura' : 'Crear Factura'}
        </Button>
      </Stack>
    </Box>
  );
};

export default FacturaForm;
