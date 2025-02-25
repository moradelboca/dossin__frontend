// components/tabs/AdelantoEfectivoForm.tsx
import React, { useState, useEffect, useContext } from 'react';
import { TextField, Button, Stack, Box, Autocomplete } from '@mui/material';
import { ContextoGeneral } from '../../../../Contexto';

interface TipoMedioPago {
  id: number;
  nombre: string;
}

export interface AdelantoEfectivo {
  id?: number;
  idTurnoDeCarga: number;
  idTipoMedioPago: number;
  montoAdelantado: number;
}

interface AdelantoEfectivoFormProps {
  turnoId: number | string;
  /** Si el turno ya tiene un adelanto efectivo creado, se puede pasar como initialAdelanto */
  initialAdelanto?: AdelantoEfectivo;
  onSuccess: (updatedData: any) => void;
  onCancel: () => void;
}

const AdelantoEfectivoForm: React.FC<AdelantoEfectivoFormProps> = ({
  turnoId,
  initialAdelanto,
  onSuccess,
  onCancel,
}) => {
  const { backendURL } = useContext(ContextoGeneral);
  const headers = {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
  };

  // Estado local para el adelanto efectivo
  const [adelanto, setAdelanto] = useState<AdelantoEfectivo | undefined>(initialAdelanto);
  const [tipoMedioPago, setTipoMedioPago] = useState<TipoMedioPago | null>(null);
  const [montoAdelantado, setMontoAdelantado] = useState<number | ''>(
    initialAdelanto?.montoAdelantado || ''
  );
  const [errors, setErrors] = useState<{ tipoMedioPago?: string; montoAdelantado?: string }>({});

  const [tiposMedioPagoOptions, setTiposMedioPagoOptions] = useState<TipoMedioPago[]>([]);

  // 1. Cargar las opciones para el autocomplete de tipos de medio de pago
  useEffect(() => {
    const fetchTiposMedioPago = async () => {
      try {
        const response = await fetch(`${backendURL}/adelantos/efectivo/tipos`, {
          method: 'GET',
          headers,
        });
        if (!response.ok) throw new Error('Error al obtener los tipos de medio de pago');
        const data = await response.json();
        setTiposMedioPagoOptions(data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchTiposMedioPago();
  }, [backendURL]);

  // 2. Si no se recibe un adelanto inicial, consultar el endpoint para ver si ya existe uno para el turno
  useEffect(() => {
    if (!initialAdelanto) {
      const fetchAdelanto = async () => {
        try {
          const response = await fetch(`${backendURL}/adelantos/efectivo`, {
            method: 'GET',
            headers,
          });
          if (!response.ok) throw new Error('Error al obtener los adelantos efectivos');
          const data = await response.json();
          // Buscamos el adelanto cuyo turno coincida
          const existingAdelanto = data.find(
            (item: any) => item.turnoDeCarga?.id === Number(turnoId)
          );
          if (existingAdelanto) {
            const transformed = transformAdelanto(existingAdelanto);
            setAdelanto(transformed);
            setMontoAdelantado(transformed.montoAdelantado);
          }
        } catch (error) {
          console.error(error);
        }
      };

      fetchAdelanto();
    }
  }, [backendURL, initialAdelanto, turnoId]);

  // 3. Una vez que se tienen las opciones y, si existe, el adelanto, se marca el tipo de medio de pago seleccionado
  useEffect(() => {
    if (adelanto && tiposMedioPagoOptions.length > 0) {
      const foundTipo = tiposMedioPagoOptions.find(
        (tipo) => tipo.id === adelanto.idTipoMedioPago
      );
      if (foundTipo) {
        setTipoMedioPago(foundTipo);
      }
    }
  }, [adelanto, tiposMedioPagoOptions]);

  const transformAdelanto = (record: any): AdelantoEfectivo => {
    return {
      id: record.id,
      idTurnoDeCarga: record.turnoDeCarga?.id,
      idTipoMedioPago: record.tipoMedioPago?.id,
      montoAdelantado: record.montoAdelantado,
    };
  };

  // Función de validación simple
  const validate = () => {
    const newErrors: { tipoMedioPago?: string; montoAdelantado?: string } = {};
    if (!tipoMedioPago) {
      newErrors.tipoMedioPago = 'El tipo de medio de pago es obligatorio';
    }
    if (montoAdelantado === '' || Number(montoAdelantado) <= 0) {
      newErrors.montoAdelantado =
        'El monto adelantado es obligatorio y debe ser mayor a 0';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Función para crear o actualizar el adelanto efectivo
  const handleSubmit = async () => {
    if (!validate()) return;
    if (!tipoMedioPago) return;
    if (!turnoId) {
      console.error("El id del turno no está definido");
      return;
    }

    const payload: AdelantoEfectivo = {
      idTurnoDeCarga: Number(turnoId),
      idTipoMedioPago: tipoMedioPago.id,
      montoAdelantado: Number(montoAdelantado),
    };

    try {
      let url = `${backendURL}/adelantos/efectivo`;
      let method = 'POST';

      // Si ya existe un adelanto, se actualiza mediante PUT
      if (adelanto && adelanto.id) {
        url = `${backendURL}/adelantos/efectivo/${adelanto.id}`;
        method = 'PUT';
      }

      const response = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        throw new Error(await response.text());
      }
      const data = await response.json();
      onSuccess(data);
    } catch (error) {
      console.error('Error al procesar el adelanto efectivo:', error);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Autocomplete
        options={tiposMedioPagoOptions}
        getOptionLabel={(option) => option.nombre}
        value={tipoMedioPago}
        onChange={(_event, newValue) => setTipoMedioPago(newValue)}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Tipo de Medio de Pago"
            error={!!errors.tipoMedioPago}
            helperText={errors.tipoMedioPago}
          />
        )}
      />
      <TextField
        label="Monto Adelantado"
        type="number"
        value={montoAdelantado}
        onChange={(e) =>
          setMontoAdelantado(e.target.value ? Number(e.target.value) : '')
        }
        error={!!errors.montoAdelantado}
        helperText={errors.montoAdelantado}
      />
      <Stack direction="row" spacing={2} justifyContent="flex-end">
        <Button onClick={onCancel}>Cancelar</Button>
        <Button onClick={handleSubmit} color="primary" variant="contained">
          {adelanto && adelanto.id ? 'Actualizar Adelanto' : 'Crear Adelanto'}
        </Button>
      </Stack>
    </Box>
  );
};

export default AdelantoEfectivoForm;
