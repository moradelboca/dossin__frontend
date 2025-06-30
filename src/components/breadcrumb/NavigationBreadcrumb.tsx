import React, { useContext } from 'react';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { useNavigationHistory } from './NavigationHistoryContext';
import { Box, Paper } from '@mui/material';
import { ContextoGeneral } from '../Contexto';

// Opcional: función para mapear pathname a label legible
const pathToLabel = (pathname: string) => {
  // /cargas/:idCarga/cupos
  const matchCupos = pathname.match(/^\/cargas\/(\d+)\/cupos$/);
  if (matchCupos) return `Cupos de carga ${matchCupos[1]}`;
  // /cargas/:idCarga
  const matchCarga = pathname.match(/^\/cargas\/(\d+)$/);
  if (matchCarga) return `Carga ${matchCarga[1]}`;
  if (pathname === '/') return 'Dashboard';
  if (pathname.startsWith('/cargas')) return 'Cargas';
  if (pathname.startsWith('/empresas')) return 'Empresas';
  if (pathname.startsWith('/cupos')) return 'Cupos';
  if (pathname.startsWith('/contratos')) return 'Contratos';
  if (pathname.startsWith('/colaboradores')) return 'Colaboradores';
  if (pathname.startsWith('/ubicaciones')) return 'Ubicaciones';
  if (pathname.startsWith('/camiones')) return 'Camiones';
  if (pathname.startsWith('/inconvenientes')) return 'Inconvenientes';
  if (pathname.startsWith('/clima')) return 'Clima';
  if (pathname.startsWith('/calculadora')) return 'Calculadora';
  if (pathname.startsWith('/admin')) return 'Administrador';
  // Por defecto, mostrar el path
  return pathname.replace('/', '').charAt(0).toUpperCase() + pathname.slice(2);
};

export const NavigationBreadcrumb: React.FC = () => {
  const { history, currentIndex, goTo } = useNavigationHistory();
  const { theme } = useContext(ContextoGeneral);

  return (
    <Box sx={{ width: '100%', p: 1, background: 'transparent' }}>
      <Paper elevation={1} sx={{ p: 1.5, background: '#f7fafd', borderRadius: 2, display: 'inline-block', minWidth: 200 }}>
        <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} aria-label="breadcrumb">
          {history.map((entry, idx) => {
            if (idx === currentIndex) {
              return (
                <Typography style={{ color: theme.colores.azul }} key={entry.pathname + idx} fontWeight={600}>
                  {entry.label || pathToLabel(entry.pathname)}
                </Typography>
              );
            } else if (idx < currentIndex) {
              return (
                <Link
                  key={entry.pathname + idx}
                  color="inherit"
                  underline="hover"
                  sx={{ cursor: 'pointer' }}
                  onClick={() => goTo(idx)}
                >
                  {entry.label || pathToLabel(entry.pathname)}
                </Link>
              );
            } else {
              // Futuro
              return (
                <Link
                  key={entry.pathname + idx}
                  color="inherit"
                  underline="hover"
                  sx={{ cursor: 'pointer', color: '#b0b0b0', fontStyle: 'italic' }}
                  onClick={() => goTo(idx)}
                >
                  {entry.label || pathToLabel(entry.pathname)}
                </Link>
              );
            }
          })}
        </Breadcrumbs>
      </Paper>
    </Box>
  );
}; 