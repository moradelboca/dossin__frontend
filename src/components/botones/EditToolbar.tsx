import { Box, Button } from "@mui/material";
import { GridToolbarColumnsButton, GridToolbarContainer, GridToolbarExport, GridToolbarFilterButton, GridToolbarQuickFilter } from "@mui/x-data-grid";
import { EditToolbarProps } from "../../interfaces/EditToolbarProps";
//import { PersonAddAlt } from "@mui/icons-material";
import { Add } from "@mui/icons-material";
import { useContext } from "react";
import { ContextoGeneral } from "../Contexto";
import { ProtectedComponent } from "../protectedComponent/ProtectedComponent";

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
                <ProtectedComponent allowedRoles={["Administrador"]}>
                    <GridToolbarExport
                        slotProps={{
                            button: {
                                sx: {
                                    color: theme.colores.azul,
                                },
                            },
                        }}
                    />
                </ProtectedComponent>
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