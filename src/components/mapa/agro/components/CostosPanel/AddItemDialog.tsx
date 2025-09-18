import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    SelectChangeEvent,
    Autocomplete,
    Box,
    Button,
    Typography,
} from '@mui/material';
import { useState } from 'react';
import { useProductos } from '../../hooks/useProductos';
import { calcularPrecioPorQuintalUSD, CostoItem } from '../../utils/costosUtils';

interface AddItemDialogProps {
    open: boolean;
    onClose: () => void;
    onAddItem: (item: CostoItem) => void;
}

export function AddItemDialog({ open, onClose, onAddItem }: AddItemDialogProps) {
    const { nombres } = useProductos();
    
    const [newItem, setNewItem] = useState<Partial<CostoItem>>({
        nombre: '',
        tipo: 'insumo',
        categoria: '',
        cantidad: 1,
        unidad: 'ha',
        costoUnitario: 0,
        costoTotal: 0,
        fechaUso: new Date().toISOString().split('T')[0],
        fechaDesde: new Date().toISOString().split('T')[0],
        fechaHasta: new Date().toISOString().split('T')[0],
        ot: '',
        precioSoja: 0,
        monedaSoja: 'ARS',
        tipoCambio: 1000,
    });

    const handleAddItem = () => {
        if (newItem.nombre && newItem.costoTotal && newItem.costoTotal > 0) {
            const itemToAdd: CostoItem = {
                id: `new-${Date.now()}`,
                nombre: newItem.nombre,
                tipo: newItem.tipo!,
                categoria: newItem.categoria || 'Otros',
                cantidad: newItem.cantidad || 1,
                unidad: newItem.unidad || 'ha',
                costoUnitario: newItem.costoUnitario || 0,
                costoTotal: newItem.costoTotal,
                fechaUso: newItem.fechaUso,
                fechaDesde: newItem.fechaDesde,
                fechaHasta: newItem.fechaHasta,
                ot: newItem.ot,
                precioSoja: newItem.precioSoja,
                monedaSoja: newItem.monedaSoja,
                tipoCambio: newItem.tipoCambio,
            };

            onAddItem(itemToAdd);
            setNewItem({
                nombre: '',
                tipo: 'insumo',
                categoria: '',
                cantidad: 1,
                unidad: 'ha',
                costoUnitario: 0,
                costoTotal: 0,
                fechaUso: new Date().toISOString().split('T')[0],
                fechaDesde: new Date().toISOString().split('T')[0],
                fechaHasta: new Date().toISOString().split('T')[0],
                ot: '',
                precioSoja: 0,
                monedaSoja: 'ARS',
                tipoCambio: 1000,
            });
            onClose();
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Agregar Nuevo Item de Costo</DialogTitle>
            <DialogContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                    <Autocomplete
                        freeSolo
                        options={nombres}
                        value={newItem.nombre || ''}
                        onChange={(_, newValue) => {
                            setNewItem({ ...newItem, nombre: newValue || '' });
                        }}
                        onInputChange={(_, newInputValue) => {
                            setNewItem({ ...newItem, nombre: newInputValue });
                        }}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Nombre del Item"
                                fullWidth
                                placeholder="Buscar producto..."
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
                    
                    <FormControl fullWidth>
                        <InputLabel>Tipo</InputLabel>
                        <Select
                            value={newItem.tipo}
                            label="Tipo"
                            onChange={(e: SelectChangeEvent) => {
                                const tipo = e.target.value as any;
                                const updates: Partial<CostoItem> = { tipo };
                                
                                if (tipo === 'tierra') {
                                    updates.nombre = 'Alquiler de Tierra';
                                    updates.categoria = 'Tierra';
                                    updates.cantidad = 5.5;
                                    updates.unidad = 'qq/ha';
                                    updates.precioSoja = 250000; // Precio por tonelada en pesos
                                    updates.monedaSoja = 'ARS';
                                    updates.tipoCambio = 1000;
                                    updates.costoUnitario = 25000; // Precio por quintal (250000/10)
                                    updates.costoTotal = 5.5 * 25000;
                                } else if (tipo === 'insumo') {
                                    updates.unidad = 'ha';
                                    updates.cantidad = 1;
                                }
                                
                                setNewItem({ ...newItem, ...updates });
                            }}
                        >
                            <MenuItem value="insumo">Insumo</MenuItem>
                            <MenuItem value="labor">Labor</MenuItem>
                            <MenuItem value="costo">Costo</MenuItem>
                            <MenuItem value="tierra">Tierra</MenuItem>
                        </Select>
                    </FormControl>

                    <TextField
                        label="Categoría"
                        value={newItem.categoria}
                        onChange={(e) => setNewItem({ ...newItem, categoria: e.target.value })}
                        fullWidth
                    />

                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <TextField
                            label="Cantidad"
                            type="number"
                            value={newItem.cantidad}
                            onChange={(e) => setNewItem({ ...newItem, cantidad: parseFloat(e.target.value) || 0 })}
                            sx={{ flex: 1 }}
                        />
                        <TextField
                            label="Unidad"
                            value={newItem.unidad}
                            onChange={(e) => setNewItem({ ...newItem, unidad: e.target.value })}
                            sx={{ flex: 1 }}
                        />
                    </Box>

                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <TextField
                            label="Costo Unitario"
                            type="number"
                            value={newItem.costoUnitario}
                            onChange={(e) => {
                                const costoUnit = parseFloat(e.target.value) || 0;
                                const cantidad = newItem.cantidad || 1;
                                setNewItem({ 
                                    ...newItem, 
                                    costoUnitario: costoUnit,
                                    costoTotal: costoUnit * cantidad
                                });
                            }}
                            sx={{ flex: 1 }}
                        />
                        <TextField
                            label="Costo Total"
                            type="number"
                            value={newItem.costoTotal}
                            onChange={(e) => setNewItem({ ...newItem, costoTotal: parseFloat(e.target.value) || 0 })}
                            sx={{ flex: 1 }}
                        />
                    </Box>

                    {/* Campos de fecha según el tipo */}
                    {newItem.tipo === 'insumo' && (
                        <TextField
                            label="Fecha de Uso"
                            type="date"
                            value={newItem.fechaUso}
                            onChange={(e) => setNewItem({ ...newItem, fechaUso: e.target.value })}
                            InputLabelProps={{ shrink: true }}
                            fullWidth
                        />
                    )}

                    {newItem.tipo === 'labor' && (
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <TextField
                                label="Fecha de Inicio"
                                type="date"
                                value={newItem.fechaDesde}
                                onChange={(e) => setNewItem({ ...newItem, fechaDesde: e.target.value })}
                                InputLabelProps={{ shrink: true }}
                                sx={{ flex: 1 }}
                            />
                            <TextField
                                label="Fecha de Fin"
                                type="date"
                                value={newItem.fechaHasta}
                                onChange={(e) => setNewItem({ ...newItem, fechaHasta: e.target.value })}
                                InputLabelProps={{ shrink: true }}
                                sx={{ flex: 1 }}
                            />
                        </Box>
                    )}

                    {newItem.tipo === 'costo' && (
                        <TextField
                            label="Fecha de Realización"
                            type="date"
                            value={newItem.fechaUso}
                            onChange={(e) => setNewItem({ ...newItem, fechaUso: e.target.value })}
                            InputLabelProps={{ shrink: true }}
                            fullWidth
                        />
                    )}

                    {newItem.tipo === 'tierra' && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <Box sx={{ display: 'flex', gap: 2 }}>
                                <TextField
                                    label="Quintales por Hectárea"
                                    type="number"
                                    value={newItem.cantidad}
                                    onChange={(e) => {
                                        const quintales = parseFloat(e.target.value) || 0;
                                        const precioPorQuintalUSD = calcularPrecioPorQuintalUSD(
                                            newItem.precioSoja || 0, 
                                            newItem.monedaSoja || 'ARS', 
                                            newItem.tipoCambio || 1000
                                        );
                                        setNewItem({ 
                                            ...newItem, 
                                            cantidad: quintales,
                                            unidad: 'qq/ha',
                                            costoUnitario: precioPorQuintalUSD,
                                            costoTotal: quintales * precioPorQuintalUSD
                                        });
                                    }}
                                    sx={{ flex: 1 }}
                                    inputProps={{ step: 0.1, min: 0 }}
                                    placeholder="Ej: 5.5"
                                />
                                <TextField
                                    label={`Precio Soja (${newItem.monedaSoja === 'USD' ? 'USD' : '$'}/tn)`}
                                    type="number"
                                    value={newItem.precioSoja || 0}
                                    onChange={(e) => {
                                        const precioSoja = parseFloat(e.target.value) || 0;
                                        const precioPorQuintalUSD = calcularPrecioPorQuintalUSD(
                                            precioSoja, 
                                            newItem.monedaSoja || 'ARS', 
                                            newItem.tipoCambio || 1000
                                        );
                                        const quintales = newItem.cantidad || 0;
                                        setNewItem({ 
                                            ...newItem, 
                                            precioSoja: precioSoja,
                                            costoUnitario: precioPorQuintalUSD,
                                            costoTotal: quintales * precioPorQuintalUSD
                                        });
                                    }}
                                    sx={{ flex: 1 }}
                                    inputProps={{ step: 0.01, min: 0 }}
                                    placeholder={newItem.monedaSoja === 'USD' ? "Ej: 250" : "Ej: 250000"}
                                />
                            </Box>
                            <Box sx={{ display: 'flex', gap: 2 }}>
                                <FormControl sx={{ flex: 1 }}>
                                    <InputLabel>Moneda</InputLabel>
                                    <Select
                                        value={newItem.monedaSoja}
                                        label="Moneda"
                                        onChange={(e: SelectChangeEvent) => {
                                            const moneda = e.target.value as 'ARS' | 'USD';
                                            const precioPorQuintalUSD = calcularPrecioPorQuintalUSD(
                                                newItem.precioSoja || 0, 
                                                moneda, 
                                                newItem.tipoCambio || 1000
                                            );
                                            const quintales = newItem.cantidad || 0;
                                            setNewItem({ 
                                                ...newItem, 
                                                monedaSoja: moneda,
                                                costoUnitario: precioPorQuintalUSD,
                                                costoTotal: quintales * precioPorQuintalUSD
                                            });
                                        }}
                                    >
                                        <MenuItem value="ARS">Pesos (ARS)</MenuItem>
                                        <MenuItem value="USD">Dólares (USD)</MenuItem>
                                    </Select>
                                </FormControl>
                                <TextField
                                    label="Tipo de Cambio (USD/ARS)"
                                    type="number"
                                    value={newItem.tipoCambio || 0}
                                    onChange={(e) => {
                                        const tipoCambio = parseFloat(e.target.value) || 0;
                                        const precioPorQuintalUSD = calcularPrecioPorQuintalUSD(
                                            newItem.precioSoja || 0, 
                                            newItem.monedaSoja || 'ARS', 
                                            tipoCambio
                                        );
                                        const quintales = newItem.cantidad || 0;
                                        setNewItem({ 
                                            ...newItem, 
                                            tipoCambio: tipoCambio,
                                            costoUnitario: precioPorQuintalUSD,
                                            costoTotal: quintales * precioPorQuintalUSD
                                        });
                                    }}
                                    sx={{ flex: 1 }}
                                    inputProps={{ step: 0.01, min: 0 }}
                                    placeholder="Ej: 1000"
                                />
                            </Box>
                            <Box sx={{ 
                                p: 2, 
                                bgcolor: 'grey.50', 
                                borderRadius: 1,
                                border: '1px solid',
                                borderColor: 'grey.300'
                            }}>
                                <Typography variant="body2" color="text.secondary">
                                    <strong>Cálculo:</strong> {newItem.cantidad || 0} qq/ha × ${(newItem.costoUnitario || 0).toFixed(2)} USD/qq = ${(newItem.costoTotal || 0).toFixed(2)} USD/ha
                                </Typography>
                            </Box>
                        </Box>
                    )}

                    <TextField
                        label="Orden de Trabajo (OT)"
                        value={newItem.ot}
                        onChange={(e) => setNewItem({ ...newItem, ot: e.target.value })}
                        fullWidth
                        placeholder="Ej: OT-2024-001"
                    />
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancelar</Button>
                <Button onClick={handleAddItem} variant="contained">
                    Agregar
                </Button>
            </DialogActions>
        </Dialog>
    );
}
