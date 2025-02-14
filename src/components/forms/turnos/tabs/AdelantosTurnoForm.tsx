// components/tabs/AdelantosTurnoForm.tsx
import React, { useState } from 'react';
import { Box, Tabs, Tab } from '@mui/material';
import AdelantoGasoilForm from './adelantosTabs/AdelantoGasoilForm';
import AdelantoEfectivoForm from './adelantosTabs/AdelantoEfectivoForm';

interface AdelantosTurnoFormProps {
  turnoId: number | string;
  initialAdelantoGasoil?: any;   // Puedes tiparlo según corresponda (por ejemplo, AdelantoGasoil)
  initialAdelantoEfectivo?: any; // Igual para el adelanto efectivo
  onSuccess: (updatedData: any) => void;
  onCancel: () => void;
}

const AdelantosTurnoForm: React.FC<AdelantosTurnoFormProps> = ({
  turnoId,
  initialAdelantoGasoil,
  initialAdelantoEfectivo,
  onSuccess,
  onCancel,
}) => {
  const [tabIndex, setTabIndex] = useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue);
  };

  return (
    <Box>
      <Tabs value={tabIndex} onChange={handleChange}>
        <Tab label="Gasoil" />
        <Tab label="Efectivo" />
      </Tabs>
      <Box sx={{ mt: 2 }}>
        {tabIndex === 0 && (
          <AdelantoGasoilForm
            turnoId={turnoId}
            initialAdelanto={initialAdelantoGasoil}
            onSuccess={onSuccess}
            onCancel={onCancel}
          />
        )}
        {tabIndex === 1 && (
          <AdelantoEfectivoForm
            turnoId={turnoId}
            initialAdelanto={initialAdelantoEfectivo}
            onSuccess={onSuccess}
            onCancel={onCancel}
          />
        )}
      </Box>
    </Box>
  );
};

export default AdelantosTurnoForm;
