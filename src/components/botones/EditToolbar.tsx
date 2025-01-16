import { GridToolbarQuickFilter } from "@mui/x-data-grid";
import { Box, Button} from "@mui/material";
import { EditToolbarProps } from "../../interfaces/EditToolbarProps";
import { GridToolbarContainer, GridToolbarFilterButton, GridToolbarExport, GridToolbarColumnsButton } from "@mui/x-data-grid";
//import { PersonAddAlt } from "@mui/icons-material";
import { useContext } from "react";
import { ContextoGeneral } from "../Contexto";
import { Add } from "@mui/icons-material";

// Ya no hace falta definir el EditToolbarProps en todos los archivos
export function EditToolbar(props: EditToolbarProps) {
    const { onAdd, name = " " } = props;
    const { theme } = useContext(ContextoGeneral);

    return (
        <GridToolbarContainer sx={{ marginBottom: 1 }}>
            <Box
                sx={{
                    flexGrow: 1,
                    display: "flex",
                    justifyContent: "flex-start",
                }}
            >
                <GridToolbarQuickFilter />
            </Box>
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "flex-end",
                    marginRight: 3,
                }}
            >
                <Button
                    startIcon={<Add />}
                    onClick={onAdd}
                    sx={{ color: theme.colores.azul }}
                >
                    Agregar {name}
                </Button>
                <GridToolbarFilterButton
                    slotProps={{
                        button: {
                            sx: {
                                color: theme.colores.azul,
                            },
                        },
                    }}
                />
                <GridToolbarExport
                    slotProps={{
                        button: {
                            sx: {
                                color: theme.colores.azul,
                            },
                        },
                    }}
                />
                <GridToolbarColumnsButton
                    slotProps={{
                        button: {
                            sx: {
                                color: theme.colores.azul,
                            },
                        },
                    }}
                />
            </Box>
        </GridToolbarContainer>
    );
}