import { useState } from 'react';
import { Box } from '@mui/material';
import { PlaneacionLote } from '../../../../../types/agro';
import { useCostos } from '../../hooks/useCostos';
import { CostoItem } from '../../utils/costosUtils';
import { CostosHeader } from './CostosHeader';
import { CostosBreakdown } from './CostosBreakdown';
import { AddItemDialog } from './AddItemDialog';
import { EmptyState } from './EmptyState';

interface CostosPanelProps {
    planificacion: PlaneacionLote;
    onUpdate: (planificacion: PlaneacionLote) => void;
}

export function CostosPanel({ planificacion, onUpdate }: CostosPanelProps) {
    const { categorias, costoPorHectarea, costoTotalReal } = useCostos(planificacion);
    
    const [openAddDialog, setOpenAddDialog] = useState(false);
    const [editingItem, setEditingItem] = useState<string | null>(null);
    const [editValues, setEditValues] = useState<{ cantidad: number; costoUnitario: number; ot: string }>({ 
        cantidad: 0, 
        costoUnitario: 0, 
        ot: '' 
    });

    const handleAddItem = (itemToAdd: CostoItem) => {
        // Agregar a extras
        const updatedPlanificacion = {
            ...planificacion,
            extras: [...(planificacion.extras || []), {
                id: itemToAdd.id,
                nombre: itemToAdd.nombre,
                clasificacion: itemToAdd.tipo === 'costo' ? 'insumo' : itemToAdd.tipo,
                precio: itemToAdd.costoUnitario || 0,
                cantidad: itemToAdd.cantidad,
                unidad: itemToAdd.unidad,
                fechaDeRealizacion: itemToAdd.tipo === 'labor' ? (itemToAdd.fechaDesde || new Date().toISOString().split('T')[0]) : (itemToAdd.fechaUso || new Date().toISOString().split('T')[0]),
                fechaHasta: itemToAdd.tipo === 'labor' ? itemToAdd.fechaHasta : undefined,
                ot: itemToAdd.ot,
                precioSoja: itemToAdd.precioSoja,
                monedaSoja: itemToAdd.monedaSoja,
                tipoCambio: itemToAdd.tipoCambio,
                custom: true,
            }]
        };

        onUpdate(updatedPlanificacion);
        setOpenAddDialog(false);
    };

    const handleDeleteItem = (itemId: string) => {
        // Remover de extras si es un item personalizado
        if (itemId.startsWith('extra-')) {
            const index = parseInt(itemId.split('-')[1]);
            const updatedExtras = [...(planificacion.extras || [])];
            updatedExtras.splice(index, 1);
            
            const updatedPlanificacion = {
                ...planificacion,
                extras: updatedExtras
            };
            
            onUpdate(updatedPlanificacion);
        } else {
            // Remover de la estructura principal (items por defecto)
            const updatedEstructura = planificacion.estructura?.filter((item: any) => item.id !== itemId) || [];
            
            const updatedPlanificacion = {
                ...planificacion,
                estructura: updatedEstructura
            };
            
            onUpdate(updatedPlanificacion);
        }
    };

    const handleStartEdit = (item: CostoItem) => {
        setEditingItem(item.id);
        setEditValues({
            cantidad: item.cantidad || 0,
            costoUnitario: item.costoUnitario || 0,
            ot: item.ot || ''
        });
    };

    const handleSaveEdit = (itemId: string) => {
        const newCostoTotal = editValues.cantidad * editValues.costoUnitario;
        
        // Actualizar en la estructura principal
        if (planificacion.estructura) {
            const updatedEstructura = planificacion.estructura.map((item: any) => {
                if (item.id === itemId) {
                    return {
                        ...item,
                        cantidad: editValues.cantidad,
                        precio: editValues.costoUnitario,
                        costoTotal: newCostoTotal,
                        ot: editValues.ot
                    };
                }
                return item;
            });

            const updatedPlanificacion = {
                ...planificacion,
                estructura: updatedEstructura
            };
            
            onUpdate(updatedPlanificacion);
        }

        // Actualizar en extras si es un item personalizado
        if (itemId.startsWith('extra-')) {
            const index = parseInt(itemId.split('-')[1]);
            const updatedExtras = [...(planificacion.extras || [])];
            if (updatedExtras[index]) {
                updatedExtras[index] = {
                    ...updatedExtras[index],
                    cantidad: editValues.cantidad,
                    precio: editValues.costoUnitario,
                    costoTotal: newCostoTotal,
                    ot: editValues.ot
                };
            }
            
            const updatedPlanificacion = {
                ...planificacion,
                extras: updatedExtras
            };
            
            onUpdate(updatedPlanificacion);
        }

        setEditingItem(null);
    };

    const handleCancelEdit = () => {
        setEditingItem(null);
        setEditValues({ cantidad: 0, costoUnitario: 0, ot: '' });
    };

    const handleExport = () => {
        // Crear CSV con los datos de costos
        const csvData = [
            ['Categoría', 'Tipo', 'Item', 'Cantidad', 'Unidad', 'Costo Unitario', 'Costo Total', 'OT', 'Porcentaje'],
            ...categorias.flatMap(cat => 
                cat.items.map(item => [
                    cat.nombre,
                    item.tipo,
                    item.nombre,
                    item.cantidad || '',
                    item.unidad || '',
                    item.costoUnitario || '',
                    item.costoTotal,
                    item.ot || '',
                    `${((item.costoTotal / costoPorHectarea) * 100).toFixed(1)}%`
                ])
            ),
            ['', '', 'TOTAL', '', '', '', costoTotalReal, '100%'],
            ['', '', 'Costo por ha', '', '', '', costoPorHectarea, '']
        ];

        const csvContent = csvData.map(row => row.join(',')).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `costos_${planificacion.campania}_${planificacion.idLote}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <Box>
            <CostosHeader 
                onAddItem={() => setOpenAddDialog(true)}
                onExport={handleExport}
            />

            {categorias.length === 0 ? (
                <EmptyState onAddItem={() => setOpenAddDialog(true)} />
            ) : (
                <>
                
                    <CostosBreakdown
                        categorias={categorias}
                        editingItem={editingItem}
                        editValues={editValues}
                        onStartEdit={handleStartEdit}
                        onSaveEdit={handleSaveEdit}
                        onCancelEdit={handleCancelEdit}
                        onDeleteItem={handleDeleteItem}
                        onEditValuesChange={setEditValues}
                    />
                </>
            )}

            <AddItemDialog
                open={openAddDialog}
                onClose={() => setOpenAddDialog(false)}
                onAddItem={handleAddItem}
            />
        </Box>
    );
}
