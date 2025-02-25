// components/tabs/AdelantoGasoilForm.tsx
import React, { useState, useEffect, useContext } from 'react';
import { TextField, Button, Stack, Box, Autocomplete } from '@mui/material';
import { ContextoGeneral } from '../../../../Contexto';

interface TipoCombustible {
  id: number;
  nombre: string;
}

export interface AdelantoGasoil {
  id?: number;
  idTurnoDeCarga: number;
  idTipoCombustible: number;
  cantLitros: number;
  precioLitros: number;
}

interface AdelantoGasoilFormProps {
  turnoId: number | string;
  initialAdelanto?: AdelantoGasoil;
  onSuccess: (updatedData: any) => void;
  onCancel: () => void;
}

const AdelantoGasoilForm: React.FC<AdelantoGasoilFormProps> = ({
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

  // Estado local para el adelanto (si existe)
  const [adelanto, setAdelanto] = useState<AdelantoGasoil | undefined>(initialAdelanto);
  const [tipoCombustible, setTipoCombustible] = useState<TipoCombustible | null>(null);
  const [cantLitros, setCantLitros] = useState<number | ''>(initialAdelanto?.cantLitros || '');
  const [precioLitros, setPrecioLitros] = useState<number | ''>(initialAdelanto?.precioLitros || '');
  const [errors, setErrors] = useState<{
    tipoCombustible?: string;
    cantLitros?: string;
    precioLitros?: string;
  }>({});

  const [tiposCombustibleOptions, setTiposCombustibleOptions] = useState<TipoCombustible[]>([]);

  // 1. Cargar las opciones para el autocomplete de tipos de combustible
  useEffect(() => {
    const fetchTiposCombustible = async () => {
      try {
        const response = await fetch(`${backendURL}/adelantos/gasoil/tipos`, {
          method: 'GET',
          headers,
        });
        if (!response.ok) throw new Error('Error al obtener los tipos de gasoil');
        const data = await response.json();
        setTiposCombustibleOptions(data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchTiposCombustible();
  }, [backendURL]);

  // 2. Si no se recibe un adelanto inicial, se consulta el endpoint para ver si ya existe uno para el turno
  useEffect(() => {
    if (!initialAdelanto) {
      const fetchAdelanto = async () => {
        try {
          const response = await fetch(`${backendURL}/adelantos/gasoil`, {
            method: 'GET',
            headers,
          });
          if (!response.ok) throw new Error('Error al obtener los adelantos de gasoil');
          const data = await response.json();
          // Buscamos el adelanto cuyo turno coincida
          const existingAdelanto = data.find(
            (item: any) => item.turnoDeCarga?.id === Number(turnoId)
          );
          if (existingAdelanto) {
            const transformed = transformAdelanto(existingAdelanto);
            setAdelanto(transformed);
            setCantLitros(transformed.cantLitros);
            setPrecioLitros(transformed.precioLitros);
          }
        } catch (error) {
          console.error(error);
        }
      };
  
      fetchAdelanto();
    }
  }, [backendURL, initialAdelanto, turnoId]);

  // 3. Una vez que se tengan las opciones y, si existe, el adelanto, se marca el tipo de combustible seleccionado
  useEffect(() => {
    if (adelanto && tiposCombustibleOptions.length > 0) {
      const foundTipo = tiposCombustibleOptions.find(
        (tipo) => tipo.id === adelanto.idTipoCombustible
      );
      if (foundTipo) {
        setTipoCombustible(foundTipo);
      }
    }
  }, [adelanto, tiposCombustibleOptions]);

  const transformAdelanto = (record: any): AdelantoGasoil => {
    return {
      id: record.id,
      idTurnoDeCarga: record.turnoDeCarga?.id,
      idTipoCombustible: record.tipoCombustible?.id,
      cantLitros: record.cantLitros,
      precioLitros: record.precio, // Si el backend lo llama 'precio'
    };
  };

  // Validación simple
  const validate = () => {
    const newErrors: {
      tipoCombustible?: string;
      cantLitros?: string;
      precioLitros?: string;
    } = {};

    if (!tipoCombustible) {
      newErrors.tipoCombustible = 'El tipo de combustible es obligatorio';
    }
    if (cantLitros === '' || Number(cantLitros) <= 0) {
      newErrors.cantLitros = 'La cantidad de litros es obligatoria y debe ser mayor a 0';
    }
    if (precioLitros === '' || Number(precioLitros) <= 0) {
      newErrors.precioLitros = 'El precio por litro es obligatorio y debe ser mayor a 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Función para crear o actualizar el adelanto
  const handleSubmit = async () => {
    if (!validate()) return;
    if (!tipoCombustible) return;
    
    if (!turnoId) {
      console.error("El id del turno no está definido");
      return;
    }
    
    const payload: AdelantoGasoil = {
      idTurnoDeCarga: Number(turnoId),
      idTipoCombustible: tipoCombustible.id,
      cantLitros: Number(cantLitros),
      precioLitros: Number(precioLitros),
    };
  
    try {
      let url = `${backendURL}/adelantos/gasoil`;
      let method = 'POST';
      
      // Si ya existe un adelanto, se actualiza mediante PUT
      if (adelanto && adelanto.id) {
        url = `${backendURL}/adelantos/gasoil/${adelanto.id}`;
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
      console.error('Error al procesar el adelanto de gasoil:', error);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Autocomplete
        options={tiposCombustibleOptions}
        getOptionLabel={(option) => option.nombre}
        value={tipoCombustible}
        onChange={(_event, newValue) => setTipoCombustible(newValue)}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Tipo de Combustible"
            error={!!errors.tipoCombustible}
            helperText={errors.tipoCombustible}
          />
        )}
      />
      <TextField
        label="Cantidad de Litros"
        type="number"
        value={cantLitros}
        onChange={(e) =>
          setCantLitros(e.target.value ? Number(e.target.value) : '')
        }
        error={!!errors.cantLitros}
        helperText={errors.cantLitros}
      />
      <TextField
        label="Precio por Litro"
        type="number"
        value={precioLitros}
        onChange={(e) =>
          setPrecioLitros(e.target.value ? Number(e.target.value) : '')
        }
        error={!!errors.precioLitros}
        helperText={errors.precioLitros}
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

export default AdelantoGasoilForm;
