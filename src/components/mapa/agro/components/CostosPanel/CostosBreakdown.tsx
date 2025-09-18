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
    Accordion,
    AccordionSummary,
    AccordionDetails,
    IconButton,
    TextField,
} from '@mui/material';
import {
    ExpandMore,
    Edit,
    Save,
    Cancel,
    Delete,
} from '@mui/icons-material';
import { ContextoGeneral } from '../../../../Contexto';
import { useContext } from 'react';
import { getIconForTipo } from '../../utils/iconUtils';
import { useProductos } from '../../hooks/useProductos';
import { CostoItem } from '../../utils/costosUtils';

interface Categoria {
    nombre: string;
    tipo: string;
    total: number;
    porcentaje: number;
    items: CostoItem[];
}

interface CostosBreakdownProps {
    categorias: Categoria[];
    editingItem: string | null;
    editValues: { cantidad: number; costoUnitario: number; ot: string };
    onStartEdit: (item: CostoItem) => void;
    onSaveEdit: (itemId: string) => void;
    onCancelEdit: () => void;
    onDeleteItem: (itemId: string) => void;
    onEditValuesChange: (values: { cantidad: number; costoUnitario: number; ot: string }) => void;
}

export function CostosBreakdown({
    categorias,
    editingItem,
    editValues,
    onStartEdit,
    onSaveEdit,
    onCancelEdit,
    onDeleteItem,
    onEditValuesChange
}: CostosBreakdownProps) {
    const { theme } = useContext(ContextoGeneral);
    const { esReconocido } = useProductos();

    return (
        <>
            {categorias.map((categoria) => (
                <Accordion key={categoria.nombre} defaultExpanded sx={{ mb: 2 }}>
                    <AccordionSummary expandIcon={<ExpandMore />}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                {getIconForTipo(categoria.tipo)}
                                <Typography variant="h6">{categoria.nombre}</Typography>
                            </Box>
                            <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Typography variant="body1" color="text.secondary">
                                    {categoria.porcentaje.toFixed(1)}%
                                </Typography>
                                <Typography variant="h6" sx={{ color: theme.colores.azul }}>
                                    ${categoria.total.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} 
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    (${categoria.total.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} / ha)
                                </Typography>
                            </Box>
                        </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                        <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 400 }}>
                            <Table size="small" sx={{ minWidth: 1000 }}>
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ minWidth: 250 }}><strong>Item</strong></TableCell>
                                        <TableCell sx={{ minWidth: 100 }}><strong>Cantidad</strong></TableCell>
                                        <TableCell sx={{ minWidth: 100 }}><strong>Unidad</strong></TableCell>
                                        <TableCell sx={{ minWidth: 100 }}><strong>Costo Unit.</strong></TableCell>
                                        <TableCell sx={{ minWidth: 100 }}><strong>Por ha</strong></TableCell>
                                        <TableCell sx={{ minWidth: 100 }}><strong>OT</strong></TableCell>
                                        <TableCell sx={{ minWidth: 100 }}><strong>Acciones</strong></TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {categoria.items.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    {getIconForTipo(item.tipo)}
                                                    <Typography
                                                        sx={{
                                                            color: esReconocido(item.nombre) ? 'text.primary' : 'text.secondary',
                                                            fontStyle: esReconocido(item.nombre) ? 'normal' : 'italic'
                                                        }}
                                                    >
                                                        {item.nombre}
                                                    </Typography>
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                {editingItem === item.id ? (
                                                    <TextField
                                                        size="small"
                                                        type="number"
                                                        value={editValues.cantidad}
                                                        onChange={(e) => onEditValuesChange({
                                                            ...editValues,
                                                            cantidad: parseFloat(e.target.value) || 0
                                                        })}
                                                        sx={{ width: 80 }}
                                                        inputProps={{ step: 0.1, min: 0 }}
                                                    />
                                                ) : (
                                                    item.cantidad ? item.cantidad.toLocaleString('es-AR', { minimumFractionDigits: 1 }) : '-'
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {item.unidad || '-'}
                                            </TableCell>
                                            <TableCell>
                                                {editingItem === item.id ? (
                                                    <TextField
                                                        size="small"
                                                        type="number"
                                                        value={editValues.costoUnitario}
                                                        onChange={(e) => onEditValuesChange({
                                                            ...editValues,
                                                            costoUnitario: parseFloat(e.target.value) || 0
                                                        })}
                                                        sx={{ width: 100 }}
                                                        inputProps={{ step: 0.01, min: 0 }}
                                                    />
                                                ) : (
                                                    item.costoUnitario ? `$${item.costoUnitario.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '-'
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <strong>
                                                    {editingItem === item.id ? 
                                                        `$${(editValues.cantidad * editValues.costoUnitario).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` :
                                                        `$${item.costoTotal.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                                                    }
                                                </strong>
                                            </TableCell>
                                            <TableCell>
                                                {editingItem === item.id ? (
                                                    <TextField
                                                        size="small"
                                                        value={editValues.ot}
                                                        onChange={(e) => onEditValuesChange({
                                                            ...editValues,
                                                            ot: e.target.value
                                                        })}
                                                        sx={{ width: 80 }}
                                                        placeholder="OT"
                                                    />
                                                ) : (
                                                    item.ot || '-'
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', gap: 0.5 }}>
                                                    {editingItem === item.id ? (
                                                        <>
                                                            <IconButton 
                                                                size="small" 
                                                                onClick={() => onSaveEdit(item.id)}
                                                                sx={{ color: '#2e7d32' }}
                                                            >
                                                                <Save />
                                                            </IconButton>
                                                            <IconButton 
                                                                size="small" 
                                                                color="error"
                                                                onClick={onCancelEdit}
                                                            >
                                                                <Cancel />
                                                            </IconButton>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <IconButton 
                                                                size="small" 
                                                                onClick={() => onStartEdit(item)}
                                                                sx={{ color: theme.colores.azul }}
                                                            >
                                                                <Edit />
                                                            </IconButton>
                                                            <IconButton 
                                                                size="small" 
                                                                color="error"
                                                                onClick={() => onDeleteItem(item.id)}
                                                            >
                                                                <Delete />
                                                            </IconButton>
                                                        </>
                                                    )}
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </AccordionDetails>
                </Accordion>
            ))}
        </>
    );
}
