import React, { useState } from 'react';
import Tooltip, { TooltipProps, tooltipClasses } from '@mui/material/Tooltip';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import InconvenienteForm from './forms/inconvenientes/InconvenienteForm';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import { ContextoGeneral } from './Contexto';
import { useLocation } from 'react-router-dom';
import { axiosGet } from '../lib/axiosConfig';

const StyledTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.text.primary,
    maxWidth: 320,
    fontSize: theme.typography.pxToRem(13),
    border: `1px solid ${theme.palette.divider}`,
    boxShadow: theme.shadows[2],
    padding: theme.spacing(1.5, 2),
    lineHeight: 1.6,
  },
}));

interface InfoTooltipSection {
  label?: string;
  items?: string[];
  text?: string;
}

interface InfoTooltipProps {
  title: string;
  sections?: (string | InfoTooltipSection)[];
  children?: React.ReactNode;
  iconSize?: 'small' | 'medium' | 'large';
  placement?: TooltipProps['placement'];
  contexto?: string;
}

const ASIGNADO_EMAIL = 'fabriciosolisw@gmail.com';

const InfoTooltip: React.FC<InfoTooltipProps> = ({
  title,
  sections = [],
  children,
  iconSize = 'small',
  placement = 'top',
  contexto = '',
}) => {
  const [open, setOpen] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const general = React.useContext(ContextoGeneral);
  const location = useLocation();
  const azul = general?.theme?.colores?.azul || '#1976d2';

  // Para pasar datos iniciales al formulario
  const [formData, setFormData] = useState<any[]>([]);

  const handleTooltipOpen = (e: React.MouseEvent) => {
    e.stopPropagation();
    setOpen(true);
  };

  const handleTooltipClose = () => {
    setOpen(false);
  };

  const handleOpenDialog = async () => {
    try {
      const usuarios = await axiosGet<any[]>(`auth/usuarios`, general?.authURL);
      const asignadoA = usuarios.find((u: any) => u.email === ASIGNADO_EMAIL);
      // Prellenar título con solo la información de la pantalla
      let titulo = `Pantalla: ${location.pathname}`;
      let descripcion = '';
      if (contexto) {
        descripcion = contexto;
      }
      setFormData([
        {
          titulo,
          descripcion,
          tipoInconveniente: '',
          urgencia: '',
          asignadoA: asignadoA || null,
        },
      ]);
      setOpen(false); // Cerrar tooltip al abrir el dialog
      setOpenDialog(true);
    } catch (e) {
      // Si hay error igual abrir el form sin asignadoA
      let titulo = `Pantalla: ${location.pathname}`;
      let descripcion = '';
      if (contexto) {
        descripcion = contexto;
      }
      setFormData([
        {
          titulo,
          descripcion,
          tipoInconveniente: '',
          urgencia: '',
          asignadoA: null,
        },
      ]);
      setOpen(false);
      setOpenDialog(true);
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  return (
    <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center' }}>
      <ClickAwayListener onClickAway={handleTooltipClose}>
        <div>
          <StyledTooltip
            title={
              <Box>
                <Typography variant="subtitle2" sx={{ color: azul, fontWeight: 600 }} gutterBottom>
                  {title}
                </Typography>
                {sections.map((section, idx) => {
                  if (typeof section === 'string') {
                    return (
                      <Typography variant="body2" gutterBottom key={idx}>
                        {section}
                      </Typography>
                    );
                  } else if (section.label && section.items) {
                    return (
                      <Box key={idx} mb={1}>
                        <Typography variant="body2" sx={{ fontWeight: 500 }} gutterBottom>
                          {section.label}:
                        </Typography>
                        <ul style={{ margin: 0, paddingLeft: 18 }}>
                          {section.items.map((item, i) => (
                            <li key={i} style={{ fontSize: 13, marginBottom: 2 }}>{item}</li>
                          ))}
                        </ul>
                      </Box>
                    );
                  } else if (section.text) {
                    return (
                      <Typography variant="body2" gutterBottom key={idx}>
                        {section.text}
                      </Typography>
                    );
                  }
                  return null;
                })}
                <Box mt={2} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                  <Typography variant="caption" color="text.secondary">
                    ¿Algo no funciona como esperabas?{' '}
                    <Link
                      component="button"
                      color="inherit"
                      underline="always"
                      sx={{ fontSize: 12, color: '#888' }}
                      onClick={handleOpenDialog}
                    >
                      Reportar inconveniente
                    </Link>
                  </Typography>
                </Box>
              </Box>
            }
            open={open}
            onClose={handleTooltipClose}
            disableFocusListener
            disableHoverListener
            disableTouchListener
            placement={placement}
          >
            <span onClick={handleTooltipOpen} style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center' }}>
              {children || <InfoOutlinedIcon color="action" fontSize={iconSize} />}
            </span>
          </StyledTooltip>
          <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
            <InconvenienteForm
              seleccionado={formData[0]}
              datos={[]}
              setDatos={() => {}}
              handleClose={handleCloseDialog}
            />
          </Dialog>
        </div>
      </ClickAwayListener>
    </Box>
  );
};

export default InfoTooltip; 