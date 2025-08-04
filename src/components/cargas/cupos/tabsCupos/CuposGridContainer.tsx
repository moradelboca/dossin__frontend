import React, { useState, useContext } from "react";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
  Menu,
  MenuItem,
  Checkbox,
  ListItemText,
  IconButton,
  Tooltip,
  DialogActions,
  Typography,
} from "@mui/material";
import TurnoForm from "../../../forms/turnos/TurnoForm";
import TurnoGridRow from './TurnoGridRow';
import { TarjetaCupos } from '../TarjetaCupos';
import FilterDialog from '../../../dialogs/tablas/FilterDialog';
import { exportarCSV, exportarPDF, exportarImagen } from '../../../../utils/exportUtils';
import FilterListIcon from '@mui/icons-material/FilterList';
import ViewColumnIcon from '@mui/icons-material/ViewColumn';
import SaveAltIcon from '@mui/icons-material/SaveAlt';
import ImageIcon from '@mui/icons-material/Image';
import { ContextoGeneral } from '../../../Contexto';
import { useAuth } from '../../../autenticacion/ContextoAuth';
import CancelIcon from '@mui/icons-material/Cancel';

interface Turno {
  id: number;
  colaborador: { nombre: string; apellido: string; cuil: number };
  empresa: { cuit: number; razonSocial: string; nombreFantasia: string };
  estado: { nombre: string };
  tara: { id: number; pesoNeto: number };
  camion: { patente: string };
  acoplado: { patente: string };
  acopladoExtra: { patente: string };
  numeroCP: number;
  kgCargados: number;
  kgDescargados: number;
  precioGrano: number;
  factura: { id: number; tipoFactura: { id: number; nombre: string } };
  NumOrdenDePago: number;
}

interface Cupo {
  carga: number;
  cupos: number;
  fecha: string;
  turnos: Turno[];
}

interface CuposGridContainerProps {
  cupos: Cupo[];
  refreshCupos: () => void;
}

// Definir todos los fields y headerNames posibles del endpoint /turnos
const fields = [
  "estado.nombre",
  "colaborador.nombre",
  "colaborador.apellido",
  "colaborador.cuil",
  "empresa.razonSocial",
  "empresa.cuit",
  "camion.patente",
  "acoplado.patente",
  "acopladoExtra.patente",
  "kgTara",
  "kgBruto",
  "kgNeto",
  "kgDescargados",
  "precioGrano",
  "factura",
  "numeroOrdenPago",
  "cartaDePorte.numeroCartaPorte",
  "cartaDePorte.CTG"
];
const headerNames = [
  "Estado",
  "Nombre",
  "Apellido",
  "CUIL Chofer",
  "Razon Social",
  "CUIT Empresa",
  "Patente Camión",
  "Patente Acoplado",
  "Patente Acoplado Extra",
  "Kg Tara",
  "Kg Bruto",
  "Kg Neto",
  "Kg Descargados",
  "Precio Grano",
  "Factura",
  "N° Orden Pago",
  "Carta de Porte",
  "CTG"
];

export const CuposGridContainer: React.FC<CuposGridContainerProps & { estadoCarga: string }> = ({
  cupos,
  refreshCupos,
  estadoCarga
}) => {
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedTurno, setSelectedTurno] = useState<any>(null);
  const { theme } = useContext(ContextoGeneral);
  const { user } = useAuth();
  const rolId = user?.rol?.id;
  
  // Columnas específicas para logística (incluyendo estado pero no seleccionada por defecto)
  const columnasLogistica = [
    "colaborador.nombre",
    "colaborador.apellido", 
    "colaborador.cuil",
    "empresa.razonSocial",
    "empresa.cuit",
    "camion.patente",
    "acoplado.patente",
    "acopladoExtra.patente",
    "estado.nombre"
  ];
  
  // Columnas por defecto para logística (sin estado)
  const columnasLogisticaPorDefecto = [
    "colaborador.nombre",
    "colaborador.apellido", 
    "colaborador.cuil",
    "empresa.razonSocial",
    "empresa.cuit",
    "camion.patente",
    "acoplado.patente",
    "acopladoExtra.patente"
  ];
  
  // Columnas por defecto para otros roles
  const columnasPorDefecto = [
    "colaborador.nombre",
    "colaborador.apellido",
    "colaborador.cuil",
    "empresa.razonSocial",
    "empresa.cuit",
    "camion.patente",
    "acoplado.patente",
    "kgNeto",
    "kgDescargados",
    "factura",
    "cartaDePorte.numeroCartaPorte",
  ];
  
  // Columnas seleccionadas para mostrar (por defecto las más relevantes)
  const [selectedColumns, setSelectedColumns] = useState(
    rolId === 4 ? columnasLogisticaPorDefecto : columnasPorDefecto
  );
  const [anchorElColumns, setAnchorElColumns] = useState<null | HTMLElement>(null);
  const [openFilterDialog, setOpenFilterDialog] = useState(false);
  // Para exportar varias tablas
  const [openExportDialog, setOpenExportDialog] = useState(false);
  const [selectedCupos, setSelectedCupos] = useState<number[]>([]);

  // Filtro de datos (simple, por columna)
  const [filteredTurnos, setFilteredTurnos] = useState<{ [fecha: string]: Turno[] }>({});
  const [originalTurnos, setOriginalTurnos] = useState<{ [fecha: string]: Turno[] }>({});

  React.useEffect(() => {
    // Inicializar turnos originales y filtrados
    const orig: { [fecha: string]: Turno[] } = {};
    cupos.forEach(cupo => {
      orig[cupo.fecha] = cupo.turnos;
    });
    setOriginalTurnos(orig);
    setFilteredTurnos(orig);
  }, [cupos]);

  const handleCloseDialog = () => {
    setSelectedTurno(null);
    setOpenDialog(false);
  };

  // --- Columnas ---
  const handleOpenColumns = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElColumns(event.currentTarget);
  };
  const handleCloseColumns = () => {
    setAnchorElColumns(null);
  };
  const handleToggleColumn = (field: string) => {
    setSelectedColumns(prev =>
      prev.includes(field) ? prev.filter(f => f !== field) : [...prev, field]
    );
  };

  // --- Filtros ---
  const handleOpenFilter = () => setOpenFilterDialog(true);
  const handleCloseFilter = () => setOpenFilterDialog(false);
  const handleApplyFilter = (filter: { column: string; operator: string; value: string }) => {
    // Filtrar todos los turnos de todos los cupos
    const nuevo: { [fecha: string]: Turno[] } = {};
    Object.entries(originalTurnos).forEach(([fecha, turnos]) => {
      nuevo[fecha] = turnos.filter(turno => {
        // Acceso seguro a campos anidados
        const val = filter.column.split('.').reduce<any>((acc, key) => acc && typeof acc === 'object' ? acc[key] : undefined, turno);
        if (filter.operator === 'contains') return String(val ?? '').toLowerCase().includes(filter.value.toLowerCase());
        if (filter.operator === 'equals') return String(val ?? '') === filter.value;
        if (filter.operator === 'does not contain') return !String(val ?? '').toLowerCase().includes(filter.value.toLowerCase());
        if (filter.operator === 'does not equal') return String(val ?? '') !== filter.value;
        if (filter.operator === 'starts with') return String(val ?? '').startsWith(filter.value);
        if (filter.operator === 'ends with') return String(val ?? '').endsWith(filter.value);
        if (filter.operator === 'is empty') return !val;
        if (filter.operator === 'is not empty') return !!val;
        return true;
      });
    });
    setFilteredTurnos(nuevo);
  };
  const handleUndoFilter = () => setFilteredTurnos(originalTurnos);

  // --- Exportar ---
  const handleOpenExport = () => setOpenExportDialog(true);
  const handleCloseExport = () => setOpenExportDialog(false);
  const handleToggleCupo = (idx: number) => {
    setSelectedCupos(prev => prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]);
  };
  const handleExport = async (formato: 'csv' | 'pdf' | 'imagen') => {
    // Sumar todos los turnos de los cupos seleccionados
    const turnosExport = selectedCupos.length > 0
      ? selectedCupos.flatMap(idx => cupos[idx]?.turnos || [])
      : cupos.flatMap(c => c.turnos);
    const exportFields = selectedColumns;
    const exportHeaders = exportFields.map(f => headerNames[fields.indexOf(f)]);
    
    if (formato === 'csv') {
      exportarCSV(exportHeaders, turnosExport, exportFields, 'turnos');
    }
    
    if (formato === 'pdf' || formato === 'imagen') {
      // Obtener datos de carga para el primer cupo
      let cargoData: any = null;
      
      if (cupos.length > 0) {
        const firstCupo = selectedCupos.length > 0 ? cupos[selectedCupos[0]] : cupos[0];
        
        try {
          // Obtener datos de la carga
          const backendURL = import.meta.env.VITE_BACKEND_URL || '';
          const cargaResponse = await fetch(`${backendURL}/cargas/${firstCupo.carga}`);
          if (cargaResponse.ok) {
            cargoData = await cargaResponse.json();
          }
        } catch (error) {
          console.error('Error fetching cargo data:', error);
        }
      }
      
      if (formato === 'pdf') {
        exportarPDF(exportHeaders, turnosExport, exportFields, 'turnos', cargoData);
      } else {
        exportarImagen(exportHeaders, turnosExport, exportFields, 'turnos', cargoData);
      }
    }
    
    handleCloseExport();
  };

 
  return (
    <Box m={3}>
      {/* Barra de botones y ayuda */}
      <Box display="flex" alignItems="center" gap={2} mb={2}>
        <Tooltip title="Filtrar">
          <IconButton
            onClick={handleOpenFilter}
            sx={{
              backgroundColor: '#fff',
              color: theme.colores.azul,
              border: `1px solid ${theme.colores.azul}`,
              borderRadius: '8px',
              p: 1.2,
              transition: 'background 0.2s',
              '&:hover': {
                backgroundColor: theme.colores.azul,
                color: '#fff',
              },
            }}
          >
            <FilterListIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Seleccionar columnas">
          <IconButton
            onClick={handleOpenColumns}
            sx={{
              backgroundColor: '#fff',
              color: theme.colores.azul,
              border: `1px solid ${theme.colores.azul}`,
              borderRadius: '8px',
              p: 1.2,
              transition: 'background 0.2s',
              '&:hover': {
                backgroundColor: theme.colores.azul,
                color: '#fff',
              },
            }}
          >
            <ViewColumnIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Exportar">
          <IconButton
            onClick={handleOpenExport}
            sx={{
              backgroundColor: '#fff',
              color: theme.colores.azul,
              border: `1px solid ${theme.colores.azul}`,
              borderRadius: '8px',
              p: 1.2,
              transition: 'background 0.2s',
              '&:hover': {
                backgroundColor: theme.colores.azul,
                color: '#fff',
              },
            }}
          >
            <SaveAltIcon />
          </IconButton>
        </Tooltip>
      </Box>
      {/* Menú de columnas */}
      <Menu anchorEl={anchorElColumns} open={Boolean(anchorElColumns)} onClose={handleCloseColumns}>
        {fields.map((field, idx) => {
          // Si es logística, solo mostrar las columnas disponibles para ese rol
          if (rolId === 4 && !columnasLogistica.includes(field)) {
            return null;
          }
          
          return (
            <MenuItem key={field} onClick={() => handleToggleColumn(field)}
              sx={{
                color: theme.colores.azul,
                borderRadius: '8px',
                '&.Mui-selected, &:hover': {
                  backgroundColor: theme.colores.azul,
                  color: '#fff',
                },
              }}
            >
              <Checkbox
                checked={selectedColumns.includes(field)}
                sx={{
                  color: theme.colores.azul,
                  '&.Mui-checked': {
                    color: theme.colores.azul,
                  },
                  '& .MuiSvgIcon-root': {
                    borderColor: theme.colores.azul,
                  },
                }}
              />
              <ListItemText primary={headerNames[idx]} />
            </MenuItem>
          );
        })}
      </Menu>
      {/* Diálogo de filtro */}
      <FilterDialog
        open={openFilterDialog}
        onClose={handleCloseFilter}
        onApplyFilter={handleApplyFilter}
        columns={rolId === 4 ? columnasLogistica : fields}
        headerNames={rolId === 4 ? columnasLogistica.map(f => headerNames[fields.indexOf(f)]) : headerNames}
        onUndoFilter={handleUndoFilter}
      />
      {/* Diálogo de exportar varias tablas */}
      <Dialog open={openExportDialog} onClose={handleCloseExport} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ color: theme.colores.azul }}>Exportar varias tablas</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={1}>
            {cupos.map((cupo, idx) => (
              <MenuItem key={cupo.fecha} onClick={() => handleToggleCupo(idx)}
                sx={{
                  color: theme.colores.azul,
                  borderRadius: '8px',
                  '&.Mui-selected, &:hover': {
                    backgroundColor: theme.colores.azul,
                    color: '#fff',
                  },
                }}
              >
                <Checkbox 
                  checked={selectedCupos.includes(idx)} 
                  sx={{ 
                    color: theme.colores.azul,
                    '&.Mui-checked': {
                      color: theme.colores.azul,
                    },
                    '&.MuiCheckbox-root': {
                      color: theme.colores.azul,
                    }
                  }} 
                />
                <ListItemText primary={`Fecha: ${cupo.fecha}`} />
              </MenuItem>
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => handleExport('csv')}
            variant="contained"
            sx={{
              backgroundColor: theme.colores.azul,
              color: '#fff',
              borderRadius: '8px',
              textTransform: 'none',
              fontWeight: 500,
              '&:hover': {
                backgroundColor: theme.colores.azulOscuro,
              },
            }}
          >
            Exportar CSV
          </Button>
          <Button
            onClick={() => handleExport('pdf')}
            variant="contained"
            sx={{
              backgroundColor: theme.colores.azul,
              color: '#fff',
              borderRadius: '8px',
              textTransform: 'none',
              fontWeight: 500,
              '&:hover': {
                backgroundColor: theme.colores.azulOscuro,
              },
            }}
          >
            Exportar PDF
          </Button>
          <Button
            onClick={() => handleExport('imagen')}
            variant="contained"
            startIcon={<ImageIcon />}
            sx={{
              backgroundColor: theme.colores.azul,
              color: '#fff',
              borderRadius: '8px',
              textTransform: 'none',
              fontWeight: 500,
              '&:hover': {
                backgroundColor: theme.colores.azulOscuro,
              },
            }}
          >
            Exportar Imagen
          </Button>
        </DialogActions>
      </Dialog>
      {/* Render de tablas */}
      {Array.isArray(cupos) &&
        cupos.map((cupo, index) => (
          <Box key={index} mb={4} p={2}>
            {/* Resumen del cupo */}
            <TarjetaCupos
              fecha={cupo.fecha}
              cuposDisponibles={cupo.cupos}
              cuposConfirmados={cupo.turnos.length}
              idCarga={cupo.carga}
              refreshCupos={refreshCupos}
              estaEnElGrid={true}
              cupos={[]}
            />
            {/* Tabla de turnos */}
            <Box sx={{ width: '100%', maxWidth: '90vw', overflowX: 'auto' }}>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      {selectedColumns.map((field) => (
                        <TableCell key={field}>{headerNames[fields.indexOf(field)]}</TableCell>
                      ))}
                      <TableCell>Acciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(filteredTurnos[cupo.fecha] || []).map((turno) => (
                      <React.Fragment key={turno.id}>
                        <TurnoGridRow
                          turno={turno}
                          cupo={cupo}
                          refreshCupos={refreshCupos}
                          fields={selectedColumns}
                        />
                      </React.Fragment>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </Box>
        ))}
      {cupos.length === 0 && estadoCarga === 'Cargado' && (
        <Box
          display={"flex"}
          flexDirection={"row"}
          width={"100%"}
          justifyContent={"center"}
          alignItems={"center"}
          gap={3}
        >
          <CancelIcon
            sx={{
              color: "red",
              borderRadius: "50%",
              padding: "5px",
              width: "50px",
              height: "50px",
            }}
          />
          <Typography variant="h5">
            <b>Al parecer no hay cupos.</b>
          </Typography>
        </Box>
      )}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>Editar Turno</DialogTitle>
        <DialogContent>
          <TurnoForm
            seleccionado={selectedTurno}
            handleClose={handleCloseDialog}
            idCarga={undefined}
            fechaCupo={undefined}
            datos={cupos}
            setDatos={refreshCupos}
          />
        </DialogContent>
      </Dialog>
    </Box>
  );
};
