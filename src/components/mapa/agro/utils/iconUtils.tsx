import { 
    Work, 
    Inventory, 
    AttachMoney, 
    Agriculture, 
    Category 
} from '@mui/icons-material';

/**
 * Obtiene el icono correspondiente al tipo de item
 * @param tipo - Tipo de item ('labor', 'insumo', 'costo', 'tierra')
 * @returns Componente de icono de Material-UI
 */
export const getIconForTipo = (tipo: string) => {
    switch (tipo) {
        case 'labor': return <Work />;
        case 'insumo': return <Inventory />;
        case 'costo': return <AttachMoney />;
        case 'tierra': return <Agriculture />;
        default: return <Category />;
    }
};
