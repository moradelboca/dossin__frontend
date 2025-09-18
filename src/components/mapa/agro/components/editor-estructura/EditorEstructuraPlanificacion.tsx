import { useState, useContext, useEffect, useMemo, useCallback } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    IconButton,
    Box,
    Typography,
    Chip,
    SelectChangeEvent,
    Divider,
    Autocomplete,
    Checkbox,
    Tooltip,
    CircularProgress,
} from '@mui/material';
import {
    Add,
    Delete,
    Edit,
    Save,
    Cancel,
    Work,
    Inventory,
    Agriculture,
    Category,
    Settings,
    SaveAlt,
    SelectAll,
    ContentCopy,
} from '@mui/icons-material';
import { ContextoGeneral } from '../../../../Contexto';
import { ItemPlanificacion } from '../../../../../types/agro';
import { useProductos } from '../../hooks';
import { useEstructuraCultivo } from '../../hooks';
import { convertirItemsAItemsPlanificacion, convertirItemsAItemsEstructura, getNombreCultivo } from '../../utils/fechasUtils';

interface EditorEstructuraPlanificacionProps {
    open: boolean;
    onClose: () => void;
}

interface EstructuraMaestra {
    cultivo: number;
    nombre: string;
    items: ItemPlanificacion[];
}

interface ItemEditado extends ItemPlanificacion {
    editando?: boolean;
    fechaRelativa?: number;
    duracion?: number;
}

interface EditValues extends Partial<ItemPlanificacion> {
    fechaRelativa?: number;
    duracion?: number;
}

export function EditorEstructuraPlanificacion({ 
    open, 
    onClose
}: EditorEstructuraPlanificacionProps) {
    const { theme } = useContext(ContextoGeneral);
    const { nombres, esReconocido } = useProductos();
    const { estructuras, loading, cargarEstructuras, actualizarEstructura } = useEstructuraCultivo();
    
    // Opciones de unidades por defecto
    const unidadesPorDefecto = ['Litros', 'Kilos', 'Bolsas', 'Unidades'];
    
    // Función para verificar si una unidad es reconocida (está en las opciones por defecto)
    const esUnidadReconocida = (unidad: string) => {
        return unidadesPorDefecto.includes(unidad);
    };
    
    const [estructurasMaestras, setEstructurasMaestras] = useState<EstructuraMaestra[]>([]);
    const [cultivoSeleccionado, setCultivoSeleccionado] = useState<number | ''>('');
    const [items, setItems] = useState<ItemEditado[]>([]);
    const [editingItem, setEditingItem] = useState<string | null>(null);
    const [editValues, setEditValues] = useState<EditValues>({});
    
    // Estados para optimización
    const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    
    // Estados para edición inline
    const [editingCell, setEditingCell] = useState<{itemId: string, field: string} | null>(null);
    const [cellEditValue, setCellEditValue] = useState<string>('');

    // Función para actualizar solo el estado local (sin POST)
    const updateLocalState = useCallback((updatedItems: ItemEditado[]) => {
        setItems(updatedItems);
        setHasUnsavedChanges(true);
        
        // Actualizar la estructura maestra correspondiente solo localmente
        const updatedEstructuras = estructurasMaestras.map(estructura => {
            if (estructura.cultivo === cultivoSeleccionado) {
                const mappedItems = updatedItems.map(({ editando, fechaRelativa, duracion, ...item }) => {
                    return item;
                });
                return {
                    ...estructura,
                    items: mappedItems
                };
            }
            return estructura;
        });
        
        setEstructurasMaestras(updatedEstructuras);
    }, [cultivoSeleccionado, estructurasMaestras]);

    // Cargar estructuras cuando se abre el diálogo
    useEffect(() => {
        if (open) {
            cargarEstructuras();
        } else {
            // Resetear estado cuando se cierra el diálogo
            setCultivoSeleccionado('');
            setItems([]);
            setEditingItem(null);
            setEditValues({});
            setSelectedItems(new Set());
            setHasUnsavedChanges(false);
            setEditingCell(null);
            setCellEditValue('');
        }
    }, [open, cargarEstructuras]);

    // Convertir estructuras a formato maestro cuando cambien
    useEffect(() => {
        if (estructuras.length > 0) {
            const estructurasConvertidas = estructuras.map((estructura) => ({
                cultivo: estructura.cultivo,
                nombre: getNombreCultivo(estructura.cultivo),
                items: convertirItemsAItemsPlanificacion(estructura.items, '2024-10-01')
            }));
            
            setEstructurasMaestras(estructurasConvertidas);
            
            // Seleccionar el primer cultivo por defecto solo si no hay uno seleccionado
            if (estructurasConvertidas.length > 0 && cultivoSeleccionado === '') {
                setCultivoSeleccionado(estructurasConvertidas[0].cultivo);
            }
        }
    }, [estructuras]); // Removido cultivoSeleccionado de las dependencias

    // Cargar items del cultivo seleccionado
    useEffect(() => {
        if (cultivoSeleccionado && typeof cultivoSeleccionado === 'number') {
            const estructura = estructurasMaestras.find(e => e.cultivo === cultivoSeleccionado);
            if (estructura) {
                // Obtener la estructura original para tener acceso a fechaRelativa y duracion
                const estructuraOriginal = estructuras.find(e => e.cultivo === cultivoSeleccionado);
                if (estructuraOriginal) {
                    const itemsConCamposOriginales = estructura.items.map(item => {
                        const itemOriginal = estructuraOriginal.items.find(orig => orig.id === item.id);
                        return {
                            ...item,
                            editando: false,
                            fechaRelativa: itemOriginal?.fechaRelativa,
                            duracion: itemOriginal?.duracion
                        };
                    });
                    setItems(itemsConCamposOriginales);
                } else {
                    const itemsSinCampos = estructura.items.map(item => ({ ...item, editando: false }));
                    setItems(itemsSinCampos);
                }
            }
        } else {
            setItems([]);
        }
    }, [cultivoSeleccionado, estructuras]); // Removido estructurasMaestras de las dependencias

    const getIconForTipo = (tipo: string) => {
        switch (tipo) {
            case 'labor': return <Work />;
            case 'insumo': return <Inventory />;
            case 'tierra': return <Agriculture />;
            case 'estructura': return <Settings />;
            case 'costo': return <Category />;
            default: return <Category />;
        }
    };

    const getColorForTipo = (tipo: string) => {
        switch (tipo) {
            case 'labor': return 'primary';
            case 'insumo': return 'secondary';
            case 'tierra': return 'success';
            case 'estructura': return 'warning';
            case 'costo': return 'error';
            default: return 'default';
        }
    };

    const handleStartEdit = (item: ItemEditado) => {
        setEditingItem(item.id);
        setEditValues({
            nombre: item.nombre,
            clasificacion: item.clasificacion,
            precio: item.precio,
            cantidad: item.cantidad,
            unidad: item.unidad,
            fechaRelativa: item.fechaRelativa,
            duracion: item.duracion,
        });
    };

    const handleSaveEdit = useCallback((itemId: string) => {
        const updatedItems = items.map(item => {
            if (item.id === itemId) {
                return {
                    ...item,
                    ...editValues,
                    editando: false
                };
            }
            return item;
        });
        
        // Solo actualizar estado local, sin POST
        updateLocalState(updatedItems);
        setEditingItem(null);
        setEditValues({});
    }, [items, editValues, updateLocalState]);

    const handleCancelEdit = () => {
        setEditingItem(null);
        setEditValues({});
    };

    const handleDeleteItem = useCallback((itemId: string) => {
        const updatedItems = items.filter(item => item.id !== itemId);
        
        // Solo actualizar estado local, sin POST
        updateLocalState(updatedItems);
    }, [items, updateLocalState]);

    const handleAddItem = useCallback(() => {
        const newItem: ItemEditado = {
            id: `new-${Date.now()}`,
            nombre: 'Nuevo Item',
            clasificacion: 'insumo',
            precio: 0,
            cantidad: 1,
            unidad: 'ha',
            fechaDeRealizacion: new Date().toISOString().split('T')[0],
            fechaRelativa: 0,
            duracion: 1,
            editando: true
        };
        
        const updatedItems = [...items, newItem];
        
        // Solo actualizar estado local, sin POST
        updateLocalState(updatedItems);
        setEditingItem(newItem.id);
        setEditValues({
            nombre: newItem.nombre,
            clasificacion: newItem.clasificacion,
            precio: newItem.precio,
            cantidad: newItem.cantidad,
            unidad: newItem.unidad,
            fechaRelativa: newItem.fechaRelativa,
            duracion: newItem.duracion,
        });
    }, [items, updateLocalState]);

    // Funciones para edición en lote
    const handleSelectItem = useCallback((itemId: string) => {
        setSelectedItems(prev => {
            const newSet = new Set(prev);
            if (newSet.has(itemId)) {
                newSet.delete(itemId);
            } else {
                newSet.add(itemId);
            }
            return newSet;
        });
    }, []);

    const handleSelectAll = useCallback(() => {
        if (selectedItems.size === items.length) {
            setSelectedItems(new Set());
        } else {
            setSelectedItems(new Set(items.map(item => item.id)));
        }
    }, [selectedItems.size, items]);

    const handleBulkDelete = useCallback(() => {
        if (selectedItems.size === 0) return;
        
        const updatedItems = items.filter(item => !selectedItems.has(item.id));
        setSelectedItems(new Set());
        
        // Solo actualizar estado local, sin POST
        updateLocalState(updatedItems);
    }, [selectedItems, items, updateLocalState]);

    const handleDuplicateItem = useCallback((itemId: string) => {
        const itemToDuplicate = items.find(item => item.id === itemId);
        if (!itemToDuplicate) return;
        
        const duplicatedItem: ItemEditado = {
            ...itemToDuplicate,
            id: `new-${Date.now()}`,
            editando: false
        };
        
        const updatedItems = [...items, duplicatedItem];
        updateLocalState(updatedItems);
    }, [items, updateLocalState]);

    const handleBulkDuplicate = useCallback(() => {
        if (selectedItems.size === 0) return;
        
        const itemsToDuplicate = items.filter(item => selectedItems.has(item.id));
        const duplicatedItems: ItemEditado[] = itemsToDuplicate.map(item => ({
            ...item,
            id: `new-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            editando: false
        }));
        
        const updatedItems = [...items, ...duplicatedItems];
        setSelectedItems(new Set());
        updateLocalState(updatedItems);
    }, [selectedItems, items, updateLocalState]);

    // Funciones para edición inline
    const handleCellDoubleClick = useCallback((itemId: string, field: string, currentValue: any) => {
        setEditingCell({ itemId, field });
        setCellEditValue(String(currentValue || ''));
    }, []);

    const handleCellKeyDown = useCallback((e: React.KeyboardEvent, itemId: string, field: string) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleCellSave(itemId, field);
        } else if (e.key === 'Escape') {
            e.preventDefault();
            handleCellCancel();
        } else if (e.key === 'Tab') {
            e.preventDefault();
            handleCellSave(itemId, field);
            // Navegar al siguiente campo (implementación básica)
            const currentIndex = items.findIndex(item => item.id === itemId);
            if (currentIndex < items.length - 1) {
                const nextItem = items[currentIndex + 1];
                setEditingCell({ itemId: nextItem.id, field });
                setCellEditValue(String(nextItem[field as keyof ItemEditado] || ''));
            }
        }
    }, [items]);

    const handleCellSave = useCallback((itemId: string, field: string) => {
        const updatedItems = items.map(item => {
            if (item.id === itemId) {
                let newValue: any;
                
                if (field === 'cantidad' || field === 'precio' || field === 'duracion') {
                    newValue = parseFloat(cellEditValue) || 0;
                } else if (field === 'fechaRelativa') {
                    // Para fechaRelativa permitir valores negativos y manejar vacíos
                    const parsed = parseFloat(cellEditValue);
                    newValue = isNaN(parsed) ? 0 : parsed;
                } else if (field === 'clasificacion') {
                    newValue = cellEditValue as 'labor' | 'insumo' | 'tierra' | 'estructura' | 'costo';
                } else {
                    newValue = cellEditValue;
                }
                
                return {
                    ...item,
                    [field]: newValue
                };
            }
            return item;
        });
        
        // Solo actualizar estado local, sin POST
        updateLocalState(updatedItems);
        setEditingCell(null);
        setCellEditValue('');
    }, [items, cellEditValue, updateLocalState]);

    const handleCellCancel = useCallback(() => {
        setEditingCell(null);
        setCellEditValue('');
    }, []);

    const handleSaveAll = useCallback(async () => {
        try {
            if (!cultivoSeleccionado || typeof cultivoSeleccionado !== 'number') {
                alert('Por favor selecciona un cultivo antes de guardar');
                return;
            }
            
            setIsSaving(true);
            
            // Convertir los items editados de vuelta a estructura
            const itemsConFechasCalculadas = items.map(item => {
                const fechaSiembra = new Date('2024-10-01');
                const fechaInicio = new Date(fechaSiembra);
                fechaInicio.setDate(fechaInicio.getDate() + (item.fechaRelativa || 0));
                
                let fechaFin: Date;
                if (item.clasificacion === 'labor' && item.duracion) {
                    fechaFin = new Date(fechaInicio);
                    fechaFin.setDate(fechaFin.getDate() + item.duracion - 1);
                } else {
                    fechaFin = fechaInicio;
                }
                
                return {
                    ...item,
                    fechaDeRealizacion: fechaInicio.toISOString().split('T')[0],
                    fechaHasta: item.clasificacion === 'labor' ? fechaFin.toISOString().split('T')[0] : undefined
                };
            });
            
            const itemsActualizados = convertirItemsAItemsEstructura(itemsConFechasCalculadas, '2024-10-01');
            
            // Guardar usando el hook
            await actualizarEstructura(cultivoSeleccionado, itemsActualizados);
            setHasUnsavedChanges(false);
            
            // Recargar estructuras para sincronizar con la BD
            await cargarEstructuras();
            
            alert('Cambios guardados exitosamente');
            onClose();
        } catch (error) {
            console.error('Error guardando estructura:', error);
            alert(`Error inesperado al guardar los cambios: ${error instanceof Error ? error.message : 'Error desconocido'}`);
        } finally {
            setIsSaving(false);
        }
    }, [cultivoSeleccionado, items, actualizarEstructura, cargarEstructuras, onClose]);

    // Memoizar items ordenados para evitar re-cálculos innecesarios
    const itemsOrdenados = useMemo(() => {
        return items.sort((a, b) => {
            // Primero ordenar por fecha relativa
            const fechaA = a.fechaRelativa || 0;
            const fechaB = b.fechaRelativa || 0;
            
            if (fechaA !== fechaB) {
                return fechaA - fechaB;
            }
            
            // Si tienen la misma fecha relativa, ordenar por tipo: labor primero, luego insumo
            const tipoOrder = { 'labor': 1, 'insumo': 2, 'tierra': 3, 'estructura': 4, 'costo': 5 };
            const tipoA = tipoOrder[a.clasificacion as keyof typeof tipoOrder] || 6;
            const tipoB = tipoOrder[b.clasificacion as keyof typeof tipoOrder] || 6;
            
            return tipoA - tipoB;
        });
    }, [items]);





    const handleCultivoChange = (event: SelectChangeEvent<number | ''>) => {
        const nuevoCultivo = Number(event.target.value);
        setCultivoSeleccionado(nuevoCultivo);
        // Limpiar estado de edición al cambiar cultivo
        setEditingItem(null);
        setEditValues({});
    };



    return (
        <Dialog 
            open={open} 
            onClose={onClose} 
            maxWidth="lg" 
            fullWidth
            PaperProps={{
                sx: {
                    height: '90vh',
                    maxHeight: '90vh',
                    display: 'flex',
                    flexDirection: 'column'
                }
            }}
        >
            <DialogTitle sx={{ color: theme.colores.azul, flexShrink: 0 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Settings />
                    Editor de Estructuras Maestras
                </Box>
            </DialogTitle>
            <DialogContent sx={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', p: 0 }}>
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                        <Typography>Cargando estructuras...</Typography>
                    </Box>
                ) : (
                    <>
                        <Box sx={{ p: 3, flexShrink: 0 }}>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                Edita las estructuras de planificación que se aplicarán automáticamente a los nuevos lotes según el cultivo.
                            </Typography>
                    
                            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2, flexWrap: 'wrap' }}>
                                <FormControl size="small" sx={{ minWidth: 200 }}>
                                    <InputLabel>Cultivo</InputLabel>
                                    <Select<number | ''>
                                        value={cultivoSeleccionado}
                                        onChange={handleCultivoChange}
                                        label="Cultivo"
                                        displayEmpty
                                    >
                                        {estructurasMaestras.length === 0 ? (
                                            <MenuItem value="" disabled>
                                                No hay cultivos disponibles
                                            </MenuItem>
                                        ) : (
                                            estructurasMaestras.map((estructura) => (
                                                <MenuItem key={estructura.cultivo} value={estructura.cultivo}>
                                                    {estructura.nombre}
                                                </MenuItem>
                                            ))
                                        )}
                                    </Select>
                                </FormControl>
                                
                                <Button
                                    variant="contained"
                                    startIcon={<Add />}
                                    onClick={handleAddItem}
                                    size="small"
                                    disabled={!cultivoSeleccionado || typeof cultivoSeleccionado !== 'number'}
                                    sx={{
                                        backgroundColor: theme.colores.azul,
                                        '&:hover': { backgroundColor: theme.colores.azulOscuro }
                                    }}
                                >
                                    Agregar Item
                                </Button>

                                {/* Controles de edición en lote */}
                                {items.length > 0 && (
                                    <>
                                        <Button
                                            variant="outlined"
                                            startIcon={<SelectAll />}
                                            onClick={handleSelectAll}
                                            size="small"
                                            sx={{ color: theme.colores.azul }}
                                        >
                                            {selectedItems.size === items.length ? 'Deseleccionar Todo' : 'Seleccionar Todo'}
                                        </Button>

                                        {selectedItems.size > 0 && (
                                            <>
                                                <Button
                                                    variant="outlined"
                                                    startIcon={<ContentCopy />}
                                                    onClick={handleBulkDuplicate}
                                                    size="small"
                                                    sx={{ color: theme.colores.azul }}
                                                >
                                                    Duplicar ({selectedItems.size})
                                                </Button>
                                                <Button
                                                    variant="outlined"
                                                    startIcon={<Delete />}
                                                    onClick={handleBulkDelete}
                                                    size="small"
                                                    color="error"
                                                >
                                                    Eliminar ({selectedItems.size})
                                                </Button>
                                            </>
                                        )}
                                    </>
                                )}

                                {/* Indicador de cambios sin guardar */}
                                {hasUnsavedChanges && (
                                    <Typography variant="caption" color="warning.main" sx={{ ml: 2 }}>
                                        • Cambios sin guardar
                                    </Typography>
                                )}

                                {/* Indicador de guardado */}
                                {isSaving && (
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 2 }}>
                                        <CircularProgress size={16} />
                                        <Typography variant="caption" color="text.secondary">
                                            Guardando...
                                        </Typography>
                                    </Box>
                                )}
                            </Box>
                            
                            <Divider />
                        </Box>

                        <Box sx={{ flex: 1, overflow: 'hidden', px: 3, pb: 3 }}>
                            <TableContainer 
                                component={Paper} 
                                variant="outlined" 
                                sx={{ 
                                    height: '100%',
                                    overflow: 'auto',
                                    '&::-webkit-scrollbar': {
                                        width: '12px',
                                        height: '12px'
                                    },
                                    '&::-webkit-scrollbar-track': {
                                        backgroundColor: '#f1f1f1',
                                        borderRadius: '6px'
                                    },
                                    '&::-webkit-scrollbar-thumb': {
                                        backgroundColor: '#c1c1c1',
                                        borderRadius: '6px',
                                        '&:hover': {
                                            backgroundColor: '#a8a8a8'
                                        }
                                    }
                                }}
                            >
                                <Table size="small" sx={{ minWidth: 1200 }}>
                                    <TableHead sx={{ position: 'sticky', top: 0, backgroundColor: 'white', zIndex: 1 }}>
                                        <TableRow>
                                            <TableCell sx={{ minWidth: 50, width: 50 }}>
                                                <Checkbox
                                                    checked={selectedItems.size === items.length && items.length > 0}
                                                    indeterminate={selectedItems.size > 0 && selectedItems.size < items.length}
                                                    onChange={handleSelectAll}
                                                    size="small"
                                                />
                                            </TableCell>
                                            <TableCell sx={{ minWidth: 100 }}><strong>Tipo</strong></TableCell>
                                            <TableCell sx={{ minWidth: 250 }}><strong>Nombre</strong></TableCell>
                                            <TableCell sx={{ minWidth: 100 }}><strong>Cantidad</strong></TableCell>
                                            <TableCell sx={{ minWidth: 100 }}><strong>Unidad</strong></TableCell>
                                            <TableCell sx={{ minWidth: 100 }}><strong>Precio</strong></TableCell>
                                            <TableCell sx={{ minWidth: 120 }}><strong>Fecha Relativa</strong></TableCell>
                                            <TableCell sx={{ minWidth: 120 }}><strong>Duración</strong></TableCell>
                                            <TableCell sx={{ minWidth: 100 }}><strong>Acciones</strong></TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {itemsOrdenados.map((item) => (
                                            <TableRow key={item.id} selected={selectedItems.has(item.id)}>
                                                <TableCell>
                                                    <Checkbox
                                                        checked={selectedItems.has(item.id)}
                                                        onChange={() => handleSelectItem(item.id)}
                                                        size="small"
                                                        disabled={editingItem === item.id}
                                                    />
                                                </TableCell>
                                                <TableCell
                                                    onDoubleClick={() => handleCellDoubleClick(item.id, 'clasificacion', item.clasificacion)}
                                                    sx={{ 
                                                        cursor: 'pointer',
                                                        '&:hover': { backgroundColor: 'action.hover' }
                                                    }}
                                                >
                                                    {editingCell?.itemId === item.id && editingCell?.field === 'clasificacion' ? (
                                                        <FormControl size="small" sx={{ minWidth: 120 }}>
                                                            <Select
                                                                value={cellEditValue}
                                                                onChange={(e) => setCellEditValue(e.target.value)}
                                                                onKeyDown={(e) => handleCellKeyDown(e, item.id, 'clasificacion')}
                                                                onBlur={() => handleCellSave(item.id, 'clasificacion')}
                                                                autoFocus
                                                                displayEmpty
                                                            >
                                                                <MenuItem value="labor">Labor</MenuItem>
                                                                <MenuItem value="insumo">Insumo</MenuItem>
                                                                <MenuItem value="tierra">Tierra</MenuItem>
                                                                <MenuItem value="estructura">Estructura</MenuItem>
                                                                <MenuItem value="costo">Costo</MenuItem>
                                                            </Select>
                                                        </FormControl>
                                                    ) : (
                                                        <Chip
                                                            icon={getIconForTipo(item.clasificacion)}
                                                            label={item.clasificacion}
                                                            color={getColorForTipo(item.clasificacion)}
                                                            size="small"
                                                        />
                                                    )}
                                                </TableCell>
                                                <TableCell
                                                    onDoubleClick={() => handleCellDoubleClick(item.id, 'nombre', item.nombre)}
                                                    sx={{ 
                                                        cursor: 'pointer',
                                                        '&:hover': { backgroundColor: 'action.hover' }
                                                    }}
                                                >
                                                    {editingCell?.itemId === item.id && editingCell?.field === 'nombre' ? (
                                                        <Autocomplete
                                                            size="small"
                                                            freeSolo
                                                            options={nombres}
                                                            value={cellEditValue}
                                                            onChange={(_, newValue) => {
                                                                setCellEditValue(newValue || '');
                                                            }}
                                                            onInputChange={(_, newInputValue) => {
                                                                setCellEditValue(newInputValue);
                                                            }}
                                                            onKeyDown={(e) => handleCellKeyDown(e, item.id, 'nombre')}
                                                            onBlur={() => handleCellSave(item.id, 'nombre')}
                                                            renderInput={(params) => (
                                                                <TextField
                                                                    {...params}
                                                                    fullWidth
                                                                    placeholder="Nombre del producto"
                                                                    autoFocus
                                                                />
                                                            )}
                                                            renderOption={(props, option) => {
                                                                const { key, ...otherProps } = props;
                                                                return (
                                                                    <Box component="li" key={key} {...otherProps}>
                                                                        {option}
                                                                    </Box>
                                                                );
                                                            }}
                                                        />
                                                    ) : (
                                                        <Typography
                                                            sx={{
                                                                color: esReconocido(item.nombre) ? 'text.primary' : 'text.secondary',
                                                                fontStyle: esReconocido(item.nombre) ? 'normal' : 'italic'
                                                            }}
                                                        >
                                                            {item.nombre}
                                                        </Typography>
                                                    )}
                                                </TableCell>
                                                <TableCell
                                                    onDoubleClick={() => handleCellDoubleClick(item.id, 'cantidad', item.cantidad)}
                                                    sx={{ 
                                                        cursor: 'pointer',
                                                        '&:hover': { backgroundColor: 'action.hover' }
                                                    }}
                                                >
                                                    {editingCell?.itemId === item.id && editingCell?.field === 'cantidad' ? (
                                                        <TextField
                                                            size="small"
                                                            type="number"
                                                            value={cellEditValue}
                                                            onChange={(e) => setCellEditValue(e.target.value)}
                                                            onKeyDown={(e) => handleCellKeyDown(e, item.id, 'cantidad')}
                                                            onBlur={() => handleCellSave(item.id, 'cantidad')}
                                                            autoFocus
                                                            sx={{ width: 80 }}
                                                        />
                                                    ) : (
                                                        item.cantidad || '-'
                                                    )}
                                                </TableCell>
                                                <TableCell
                                                    onDoubleClick={() => handleCellDoubleClick(item.id, 'unidad', item.unidad)}
                                                    sx={{ 
                                                        cursor: 'pointer',
                                                        '&:hover': { backgroundColor: 'action.hover' }
                                                    }}
                                                >
                                                    {editingCell?.itemId === item.id && editingCell?.field === 'unidad' ? (
                                                        <Autocomplete
                                                            size="small"
                                                            freeSolo
                                                            options={unidadesPorDefecto}
                                                            value={cellEditValue}
                                                            onChange={(_, newValue) => {
                                                                setCellEditValue(newValue || '');
                                                            }}
                                                            onInputChange={(_, newInputValue) => {
                                                                setCellEditValue(newInputValue);
                                                            }}
                                                            onKeyDown={(e) => handleCellKeyDown(e, item.id, 'unidad')}
                                                            onBlur={() => handleCellSave(item.id, 'unidad')}
                                                            renderInput={(params) => (
                                                                <TextField
                                                                    {...params}
                                                                    placeholder="Unidad"
                                                                    autoFocus
                                                                    sx={{ width: 100 }}
                                                                />
                                                            )}
                                                            renderOption={(props, option) => {
                                                                const { key, ...otherProps } = props;
                                                                return (
                                                                    <Box component="li" key={key} {...otherProps}>
                                                                        {option}
                                                                    </Box>
                                                                );
                                                            }}
                                                        />
                                                    ) : (
                                                        <Typography
                                                            sx={{
                                                                color: esUnidadReconocida(item.unidad || '') ? 'text.primary' : 'text.secondary',
                                                                fontStyle: esUnidadReconocida(item.unidad || '') ? 'normal' : 'italic'
                                                            }}
                                                        >
                                                            {item.unidad || '-'}
                                                        </Typography>
                                                    )}
                                                </TableCell>
                                                <TableCell
                                                    onDoubleClick={() => handleCellDoubleClick(item.id, 'precio', item.precio)}
                                                    sx={{ 
                                                        cursor: 'pointer',
                                                        '&:hover': { backgroundColor: 'action.hover' }
                                                    }}
                                                >
                                                    {editingCell?.itemId === item.id && editingCell?.field === 'precio' ? (
                                                        <TextField
                                                            size="small"
                                                            type="number"
                                                            value={cellEditValue}
                                                            onChange={(e) => setCellEditValue(e.target.value)}
                                                            onKeyDown={(e) => handleCellKeyDown(e, item.id, 'precio')}
                                                            onBlur={() => handleCellSave(item.id, 'precio')}
                                                            autoFocus
                                                            sx={{ width: 100 }}
                                                        />
                                                    ) : (
                                                        `$${item.precio?.toLocaleString('es-AR', { minimumFractionDigits: 2 }) || '0.00'}`
                                                    )}
                                                </TableCell>
                                                <TableCell
                                                    onDoubleClick={() => handleCellDoubleClick(item.id, 'fechaRelativa', item.fechaRelativa)}
                                                    sx={{ 
                                                        cursor: 'pointer',
                                                        '&:hover': { backgroundColor: 'action.hover' }
                                                    }}
                                                >
                                                    {editingCell?.itemId === item.id && editingCell?.field === 'fechaRelativa' ? (
                                                        <TextField
                                                            size="small"
                                                            type="number"
                                                            value={cellEditValue}
                                                            onChange={(e) => setCellEditValue(e.target.value)}
                                                            onKeyDown={(e) => handleCellKeyDown(e, item.id, 'fechaRelativa')}
                                                            onBlur={() => handleCellSave(item.id, 'fechaRelativa')}
                                                            autoFocus
                                                            sx={{ width: 100 }}
                                                            helperText="días desde siembra"
                                                        />
                                                    ) : (
                                                        `${item.fechaRelativa || 0} días`
                                                    )}
                                                </TableCell>
                                                <TableCell
                                                    onDoubleClick={() => {
                                                        if (item.clasificacion === 'labor') {
                                                            handleCellDoubleClick(item.id, 'duracion', item.duracion);
                                                        }
                                                    }}
                                                    sx={{ 
                                                        cursor: item.clasificacion === 'labor' ? 'pointer' : 'default',
                                                        '&:hover': { 
                                                            backgroundColor: item.clasificacion === 'labor' ? 'action.hover' : 'transparent'
                                                        }
                                                    }}
                                                >
                                                    {editingCell?.itemId === item.id && editingCell?.field === 'duracion' ? (
                                                        <TextField
                                                            size="small"
                                                            type="number"
                                                            value={cellEditValue}
                                                            onChange={(e) => setCellEditValue(e.target.value)}
                                                            onKeyDown={(e) => handleCellKeyDown(e, item.id, 'duracion')}
                                                            onBlur={() => handleCellSave(item.id, 'duracion')}
                                                            autoFocus
                                                            sx={{ width: 100 }}
                                                            helperText="días"
                                                            inputProps={{ min: 1 }}
                                                        />
                                                    ) : (
                                                        item.clasificacion === 'labor' ? `${item.duracion || 1} días` : '-'
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                                                        {editingItem === item.id ? (
                                                            <>
                                                                <Tooltip title="Guardar cambios">
                                                                    <IconButton 
                                                                        size="small" 
                                                                        color="success"
                                                                        onClick={() => handleSaveEdit(item.id)}
                                                                    >
                                                                        <Save />
                                                                    </IconButton>
                                                                </Tooltip>
                                                                <Tooltip title="Cancelar edición">
                                                                    <IconButton 
                                                                        size="small" 
                                                                        onClick={handleCancelEdit}
                                                                        sx={{ color: theme.colores.azul }}
                                                                    >
                                                                        <Cancel />
                                                                    </IconButton>
                                                                </Tooltip>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Tooltip title="Editar item">
                                                                    <IconButton 
                                                                        size="small" 
                                                                        onClick={() => handleStartEdit(item)}
                                                                        sx={{ color: theme.colores.azul }}
                                                                        disabled={selectedItems.has(item.id)}
                                                                    >
                                                                        <Edit />
                                                                    </IconButton>
                                                                </Tooltip>
                                                                <Tooltip title="Duplicar item">
                                                                    <IconButton 
                                                                        size="small" 
                                                                        onClick={() => handleDuplicateItem(item.id)}
                                                                        sx={{ color: theme.colores.azul }}
                                                                        disabled={selectedItems.has(item.id)}
                                                                    >
                                                                        <ContentCopy />
                                                                    </IconButton>
                                                                </Tooltip>
                                                                <Tooltip title="Eliminar item">
                                                                    <IconButton 
                                                                        size="small" 
                                                                        color="error"
                                                                        onClick={() => handleDeleteItem(item.id)}
                                                                        disabled={selectedItems.has(item.id)}
                                                                    >
                                                                        <Delete />
                                                                    </IconButton>
                                                                </Tooltip>
                                                            </>
                                                        )}
                                                    </Box>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Box>
                    </>
                )}
            </DialogContent>
            <DialogActions sx={{ flexShrink: 0 }}>
                <Button 
                    onClick={onClose}
                    sx={{ color: theme.colores.azul }}
                    disabled={isSaving}
                >
                    Cancelar
                </Button>
                <Button 
                    onClick={handleSaveAll} 
                    variant="contained"
                    disabled={!cultivoSeleccionado || typeof cultivoSeleccionado !== 'number' || loading || isSaving}
                    startIcon={isSaving ? <CircularProgress size={16} /> : <SaveAlt />}
                    sx={{
                        backgroundColor: theme.colores.azul,
                        '&:hover': { backgroundColor: theme.colores.azulOscuro }
                    }}
                >
                    {isSaving ? 'Guardando...' : 'Guardar Cambios'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

