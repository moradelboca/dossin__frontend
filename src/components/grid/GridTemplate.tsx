// src/components/grid/GridTemplate.tsx
import { Box, Typography, CircularProgress } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { esES } from "@mui/x-data-grid/locales";
import { EditToolbar } from "../botones/EditToolbar";

interface GridTemplateProps {
  titulo: string;
  rows: any[];
  columns: GridColDef[];
  loading: boolean;
  theme: any;
  getRowId: (row: any) => any;
  onAdd: () => void;
  entityName: string;
}

export function GridTemplate({
  titulo,
  rows,
  columns,
  loading,
  theme,
  getRowId,
  onAdd,
  entityName,
}: GridTemplateProps) {
  return (
    <Box
      sx={{
        backgroundColor: theme.colores.grisClaro,
        height: "91vh",
        width: "100%",
        p: 3,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Typography
        variant="h5"
        sx={{
          color: theme.colores.azul,
          fontWeight: "bold",
          mb: 2,
          fontSize: "2rem",
          ml: 1,
        }}
      >
        {titulo}
      </Typography>

      {loading ? (
        <Box
          flex={1}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <CircularProgress size={30} sx={{ p: 0.5 }} />
          <Typography variant="h5" sx={{ ml: 2 }}>
            Cargando...
          </Typography>
        </Box>
      ) : (
        <Box flex={1} sx={{ width: "100%" }}>
          <DataGrid
            rows={rows}
            columns={columns}
            getRowId={getRowId}
            localeText={esES.components.MuiDataGrid.defaultProps.localeText}
            sx={{
              "& .MuiDataGrid-columnHeader": {
                backgroundColor: theme.colores.grisClaro,
                color: theme.colores.grisOscuro,
              },
              border: "none",
              whiteSpace: "normal",
              wordBreak: "break-word",
            }}
            slots={{
              toolbar: props => (
                <EditToolbar setRows={function (): void {
                  throw new Error("Function not implemented.");
              } } setRowModesModel={function (): void {
                  throw new Error("Function not implemented.");
              } } {...props} onAdd={onAdd} name={entityName} />
              ),
            }}
          />
        </Box>
      )}
    </Box>
  );
}
