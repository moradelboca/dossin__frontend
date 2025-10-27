import React, { useState, useContext, useMemo } from 'react';
import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Paper,
  Menu,
  MenuItem,
  IconButton,
  Tooltip,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SaveAltIcon from '@mui/icons-material/SaveAlt';
import ImageIcon from '@mui/icons-material/Image';
import { ContextoGeneral } from '../Contexto';
import { exportarCSV, exportarPDF, exportarImagen } from '../../utils/exportUtils';

interface ModoLiquidacionProps {
  turnos: any[];
  loading?: boolean;
}

interface EmpresaTurnos {
  cuit: string;
  razonSocial: string;
  turnos: any[];
  totales: {
    montoNeto: number;
    iva: number;
    montoBruto: number;
    retencion: number;
    descuentoBruto: number;
    adelanto: number;
    totalAPagar: number;
  };
}

export const ModoLiquidacion: React.FC<ModoLiquidacionProps> = ({ turnos, loading = false }) => {
  const { theme } = useContext(ContextoGeneral);
  const [anchorElExport, setAnchorElExport] = useState<null | HTMLElement>(null);

  // Función para calcular total de adelantos de un turno
  const calcularAdelantos = (turno: any): number => {
    let total = 0;
    
    // Adelantos de efectivo
    if (turno.adelantos?.adelantosEfvo && Array.isArray(turno.adelantos.adelantosEfvo)) {
      total += turno.adelantos.adelantosEfvo.reduce((sum: number, a: any) => sum + (parseFloat(a.montoAdelantado) || 0), 0);
    }
    
    // Adelantos de gasoil
    if (turno.adelantos?.adelantosGasoil && Array.isArray(turno.adelantos.adelantosGasoil)) {
      total += turno.adelantos.adelantosGasoil.reduce((sum: number, a: any) => sum + (parseFloat(a.cantLitros) * parseFloat(a.precio) || 0), 0);
    }
    
    return total;
  };

  // Agrupar turnos por empresa
  const empresasGrouped = useMemo(() => {
    const grouped = new Map<string, EmpresaTurnos>();

    turnos.forEach((turno) => {
      const cuit = turno.empresa?.cuit || 'Sin CUIT';
      const razonSocial = turno.empresa?.razonSocial || turno.empresa?.nombre || 'Sin Empresa';
      
      if (!grouped.has(cuit)) {
        grouped.set(cuit, {
          cuit,
          razonSocial,
          turnos: [],
          totales: {
            montoNeto: 0,
            iva: 0,
            montoBruto: 0,
            retencion: 0,
            descuentoBruto: 0,
            adelanto: 0,
            totalAPagar: 0,
          },
        });
      }

      const empresa = grouped.get(cuit)!;
      empresa.turnos.push(turno);

      // Sumar precios a totales
      if (turno.precios) {
        empresa.totales.montoNeto += parseFloat(turno.precios.montoNeto || '0');
        empresa.totales.iva += parseFloat(turno.precios.iva || '0');
        empresa.totales.montoBruto += parseFloat(turno.precios.montoBruto || '0');
        empresa.totales.retencion += parseFloat(turno.precios.retencion || '0');
        empresa.totales.descuentoBruto += parseFloat(turno.precios.descuentoBruto || '0');
        empresa.totales.adelanto += parseFloat(turno.precios.adelanto || '0');
        empresa.totales.totalAPagar += parseFloat(turno.precios.totalAPagar || '0');
      }
    });

    return Array.from(grouped.values());
  }, [turnos]);

  // Formatear moneda argentina
  const formatMoney = (value: any) => {
    if (typeof value !== 'number' && isNaN(Number(value))) return value;
    return Number(value).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const handleExport = (formato: 'csv' | 'pdf' | 'imagen') => {
    const datosExport: any[] = [];
    
    empresasGrouped.forEach((empresa) => {
      empresa.turnos.forEach((turno) => {
        const adelantos = calcularAdelantos(turno);
        datosExport.push({
          'Empresa': empresa.razonSocial,
          'CUIT': empresa.cuit,
          'Camionero': `${turno.colaborador?.nombre || ''} ${turno.colaborador?.apellido || ''}`.trim(),
          'Patente Camión': turno.camion?.patente || '',
          'Patente Acoplado': turno.acoplado?.patente || '',
          'CTG': turno.cartaDePorte?.CTG || '',
          'Adelantos': formatMoney(adelantos),
          'Kg Neto': turno.kgNeto || 0,
          'Kg Descargados': turno.kgDescargados || 0,
          'Monto Neto': formatMoney(turno.precios?.montoNeto || '0'),
          'IVA': formatMoney(turno.precios?.iva || '0'),
          'Monto Bruto': formatMoney(turno.precios?.montoBruto || '0'),
          'Retención': formatMoney(turno.precios?.retencion || '0'),
          'Descuento Bruto': formatMoney(turno.precios?.descuentoBruto || '0'),
          'Adelanto': formatMoney(turno.precios?.adelanto || '0'),
          'Total a Pagar': formatMoney(turno.precios?.totalAPagar || '0'),
        });
      });
      
      // Agregar totales por empresa
      datosExport.push({
        'Empresa': `TOTAL ${empresa.razonSocial}`,
        'CUIT': '',
        'Camionero': '',
        'Patente Camión': '',
        'Patente Acoplado': '',
        'CTG': '',
        'Adelantos': '',
        'Kg Neto': '',
        'Kg Descargados': '',
        'Monto Neto': formatMoney(empresa.totales.montoNeto),
        'IVA': formatMoney(empresa.totales.iva),
        'Monto Bruto': formatMoney(empresa.totales.montoBruto),
        'Retención': formatMoney(empresa.totales.retencion),
        'Descuento Bruto': formatMoney(empresa.totales.descuentoBruto),
        'Adelanto': formatMoney(empresa.totales.adelanto),
        'Total a Pagar': formatMoney(empresa.totales.totalAPagar),
      });
    });

    const headers = Object.keys(datosExport[0] || {});
    
    if (formato === 'csv') {
      exportarCSV(headers, datosExport, headers, 'liquidacion_turnos');
    }
    
    if (formato === 'pdf') {
      exportarPDF(headers, datosExport, headers, 'liquidacion_turnos', null);
    }
    
    if (formato === 'imagen') {
      exportarImagen(headers, datosExport, headers, 'liquidacion_turnos', null);
    }
    
    setAnchorElExport(null);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress sx={{ color: theme.colores.azul }} />
      </Box>
    );
  }

  if (empresasGrouped.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 8, color: theme.colores.gris || '#666' }}>
        <Typography variant="h6">No hay turnos para liquidar</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 2 }}>
      {/* Barra de herramientas */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'flex-end',
        mb: 2
      }}>
        <Tooltip title="Exportar">
          <IconButton
            size="small"
            onClick={(e) => setAnchorElExport(e.currentTarget)}
            sx={{ color: theme.colores.azul }}
          >
            <SaveAltIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Menú de exportación */}
      <Menu
        anchorEl={anchorElExport}
        open={Boolean(anchorElExport)}
        onClose={() => setAnchorElExport(null)}
      >
        <MenuItem onClick={() => handleExport('csv')}>
          <SaveAltIcon sx={{ mr: 1 }} /> Exportar CSV
        </MenuItem>
        <MenuItem onClick={() => handleExport('pdf')}>
          <SaveAltIcon sx={{ mr: 1 }} /> Exportar PDF
        </MenuItem>
        <MenuItem onClick={() => handleExport('imagen')}>
          <ImageIcon sx={{ mr: 1 }} /> Exportar Imagen
        </MenuItem>
      </Menu>

      {/* Lista de empresas */}
      {empresasGrouped.map((empresa, idx) => (
        <Accordion
          key={empresa.cuit}
          defaultExpanded={idx === 0}
          sx={{
            mb: 2,
            '&:before': {
              display: 'none',
            },
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          }}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            sx={{
              backgroundColor: `${theme.colores.azul}10`,
              '&:hover': {
                backgroundColor: `${theme.colores.azul}20`,
              },
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600, color: theme.colores.azul }}>
                  {empresa.razonSocial}
                </Typography>
                <Typography variant="body2" sx={{ color: theme.colores.gris }}>
                  CUIT: {empresa.cuit}
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'right', mr: 3 }}>
                <Typography variant="body2" sx={{ color: theme.colores.gris }}>
                  {empresa.turnos.length} turno{empresa.turnos.length !== 1 ? 's' : ''}
                </Typography>
                <Typography variant="h6" sx={{ color: theme.colores.azul, fontWeight: 600 }}>
                  ${formatMoney(empresa.totales.totalAPagar)}
                </Typography>
              </Box>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {/* Lista de turnos */}
              {empresa.turnos.map((turno, turnoIdx) => {
                const adelantos = calcularAdelantos(turno);
                return (
                  <Paper key={turnoIdx} sx={{ p: 2, border: `1px solid ${theme.colores.azul}30` }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1, color: theme.colores.azul }}>
                      Turno {turnoIdx + 1}
                    </Typography>
                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 2 }}>
                      <Box>
                        <Typography variant="body2" sx={{ color: theme.colores.gris }}>Camionero</Typography>
                        <Typography>
                          {turno.colaborador?.nombre} {turno.colaborador?.apellido}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" sx={{ color: theme.colores.gris }}>Patente Camión</Typography>
                        <Typography>{turno.camion?.patente || '-'}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" sx={{ color: theme.colores.gris }}>Patente Acoplado</Typography>
                        <Typography>{turno.acoplado?.patente || '-'}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" sx={{ color: theme.colores.gris }}>CTG</Typography>
                        <Typography>{turno.cartaDePorte?.CTG || '-'}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" sx={{ color: theme.colores.gris }}>Adelantos</Typography>
                        <Typography>${formatMoney(adelantos)}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" sx={{ color: theme.colores.gris }}>Kg Neto</Typography>
                        <Typography>{turno.kgNeto || 0}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" sx={{ color: theme.colores.gris }}>Kg Descargados</Typography>
                        <Typography>{turno.kgDescargados || 0}</Typography>
                      </Box>
                    </Box>
                    
                    {/* Precios */}
                    {turno.precios && (
                      <Box sx={{ mt: 2, pt: 2, borderTop: `1px solid ${theme.colores.azul}20` }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                          Precios
                        </Typography>
                        <TableContainer>
                          <Table size="small">
                            <TableBody>
                              <TableRow>
                                <TableCell sx={{ fontWeight: 600 }}>Monto Neto</TableCell>
                                <TableCell align="right">${formatMoney(turno.precios.montoNeto)}</TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell sx={{ fontWeight: 600 }}>IVA</TableCell>
                                <TableCell align="right">${formatMoney(turno.precios.iva)}</TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell sx={{ fontWeight: 600 }}>Monto Bruto</TableCell>
                                <TableCell align="right">${formatMoney(turno.precios.montoBruto)}</TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell sx={{ fontWeight: 600 }}>Retención</TableCell>
                                <TableCell align="right">${formatMoney(turno.precios.retencion)}</TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell sx={{ fontWeight: 600 }}>Descuento Bruto</TableCell>
                                <TableCell align="right">${formatMoney(turno.precios.descuentoBruto)}</TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell sx={{ fontWeight: 600 }}>Adelanto</TableCell>
                                <TableCell align="right">${formatMoney(turno.precios.adelanto)}</TableCell>
                              </TableRow>
                              <TableRow sx={{ backgroundColor: `${theme.colores.azul}10` }}>
                                <TableCell sx={{ fontWeight: 700 }}>Total a Pagar</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 700 }}>
                                  ${formatMoney(turno.precios.totalAPagar)}
                                </TableCell>
                              </TableRow>
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </Box>
                    )}
                  </Paper>
                );
              })}

              {/* Totales por empresa */}
              <Paper sx={{ p: 2, backgroundColor: `${theme.colores.azul}15`, mt: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: theme.colores.azul }}>
                  Totales por Empresa
                </Typography>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 700 }}>Concepto</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700 }}>Monto</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow>
                        <TableCell>Monto Neto</TableCell>
                        <TableCell align="right">${formatMoney(empresa.totales.montoNeto)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>IVA</TableCell>
                        <TableCell align="right">${formatMoney(empresa.totales.iva)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Monto Bruto</TableCell>
                        <TableCell align="right">${formatMoney(empresa.totales.montoBruto)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Retención</TableCell>
                        <TableCell align="right">${formatMoney(empresa.totales.retencion)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Descuento Bruto</TableCell>
                        <TableCell align="right">${formatMoney(empresa.totales.descuentoBruto)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Adelanto</TableCell>
                        <TableCell align="right">${formatMoney(empresa.totales.adelanto)}</TableCell>
                      </TableRow>
                      <TableRow sx={{ backgroundColor: theme.colores.azul }}>
                        <TableCell sx={{ fontWeight: 700, color: '#fff' }}>Total a Pagar</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700, color: '#fff' }}>
                          ${formatMoney(empresa.totales.totalAPagar)}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Box>
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
};

