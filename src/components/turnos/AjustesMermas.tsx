import React from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Divider,
  Alert,
} from '@mui/material';
import type { AjustesMermas as AjustesMermasType } from '../../types/parametros-calidad';

interface AjustesMermasProps {
  ajustesMermas?: AjustesMermasType | null;
}

export const AjustesMermas: React.FC<AjustesMermasProps> = ({ ajustesMermas }) => {
  if (!ajustesMermas || !ajustesMermas.detalle || ajustesMermas.detalle.length === 0) {
    return (
      <Box sx={{ mt: 2 }}>
        <Alert severity="info">
          No se aplicaron ajustes de mermas para este turno.
        </Alert>
      </Box>
    );
  }

  const montoTotal = ajustesMermas.montoTotal || 0;
  const esDescuento = montoTotal < 0;

  return (
    <Box sx={{ mt: 2 }}>
      <Divider sx={{ mb: 2 }} />
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
        Ajustes de Mermas
      </Typography>
      
      {ajustesMermas.mensaje && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {ajustesMermas.mensaje}
        </Typography>
      )}

      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell><strong>Parámetro</strong></TableCell>
              <TableCell align="right"><strong>Valor Medido</strong></TableCell>
              <TableCell align="right"><strong>Límite</strong></TableCell>
              <TableCell align="right"><strong>Diferencia</strong></TableCell>
              <TableCell align="right"><strong>Tipo</strong></TableCell>
              <TableCell align="right"><strong>Monto Ajuste</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {ajustesMermas.detalle.map((ajuste, index) => (
              <TableRow key={index}>
                <TableCell>
                  <Box>
                    <Typography variant="body2" fontWeight="medium">
                      {ajuste.nombreParametro}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {ajuste.etapaMedicion === 'carga' ? 'Carga' : 'Descarga'}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell align="right">{ajuste.valorMedido}</TableCell>
                <TableCell align="right">{ajuste.valorLimite}</TableCell>
                <TableCell align="right">
                  <Typography
                    variant="body2"
                    color={ajuste.diferencia > 0 ? 'error.main' : 'success.main'}
                  >
                    {ajuste.diferencia > 0 ? '+' : ''}{ajuste.diferencia}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="body2">
                    {ajuste.tipoAjuste === 'descuento' ? 'Descuento' : 'Bonificación'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {ajuste.tipoCalculo}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography
                    variant="body2"
                    fontWeight="bold"
                    color={esDescuento ? 'error.main' : 'success.main'}
                  >
                    {ajuste.montoAjuste < 0 ? '-' : '+'}${Math.abs(ajuste.montoAjuste).toFixed(2)}
                  </Typography>
                </TableCell>
              </TableRow>
            ))}
            <TableRow>
              <TableCell colSpan={5} align="right">
                <Typography variant="body1" fontWeight="bold">
                  Total Ajustes:
                </Typography>
              </TableCell>
              <TableCell align="right">
                <Typography
                  variant="body1"
                  fontWeight="bold"
                  color={esDescuento ? 'error.main' : 'success.main'}
                >
                  {montoTotal < 0 ? '-' : '+'}${Math.abs(montoTotal).toFixed(2)}
                </Typography>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      {ajustesMermas.detalle.length > 0 && (
        <Box sx={{ mt: 2 }}>
          {ajustesMermas.detalle.map((ajuste, index) => (
            <Box key={index} sx={{ mb: 1 }}>
              <Typography variant="caption" color="text.secondary">
                <strong>{ajuste.nombreParametro}:</strong> {ajuste.metodologia}
              </Typography>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
};


