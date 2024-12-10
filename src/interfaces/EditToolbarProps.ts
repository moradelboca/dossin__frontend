import { GridRowsProp } from "@mui/x-data-grid";
import { GridRowModesModel } from "@mui/x-data-grid";

export interface EditToolbarProps {
    setRows: (newRows: (oldRows: GridRowsProp) => GridRowsProp) => void;
    setRowModesModel: (
        newModel: (oldModel: GridRowModesModel) => GridRowModesModel
    ) => void;
    onAdd: () => void; // Nueva prop para manejar el diálogo de agregar
    name?: string;
}