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
        height: '100%',
        width: '100%',
        p: 3,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        minHeight: 0,
        minWidth: 0,
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
        <Box flex={1} sx={{ 
          width: "100%",
          position: 'relative',
          minHeight: 0,
          height: '100%',
          overflow: 'auto',
          '& .MuiDataGrid-virtualScroller': {
            overflowX: 'scroll'
          }
        }}>
          <DataGrid
            rows={rows}
            columns={columns}
            getRowId={getRowId}
            localeText={esES.components.MuiDataGrid.defaultProps.localeText}
            sx={{
              height: '100%',
              minHeight: 0,
              "& .MuiDataGrid-columnHeader": {
                backgroundColor: theme.colores.grisClaro,
                color: theme.colores.grisOscuro,
              },
              border: "none",
              whiteSpace: "normal",
              wordBreak: "break-word",
              // Nuevos estilos
              '& .MuiDataGrid-virtualScroller': {
                overflowX: 'auto !important',
                maxWidth: '100% !important',
              },
              '& .MuiDataGrid-columnHeaders': {
                position: 'relative',
                overflow: 'visible !important',
                width: 'fit-content !important' // 6. Ancho header según contenido
              },
              '& .sticky-header-right': {
                position: 'sticky !important',
                right: 0,
                zIndex: 4,
                backgroundColor: `${theme.colores.grisClaro} !important`,
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: '-50px', // Reducir extensión del pseudoelemento
                  width: '60px', // Ancho suficiente para cubrir espacio
                  height: '100%',
                  backgroundColor: theme.colores.grisClaro,
                  zIndex: -1
                }
              },
              '& .sticky-cell-right': {
                position: 'sticky !important',
                right: 0,
                zIndex: 3,
                backgroundColor: `${theme.colores.grisClaro} !important`,
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: '-50px',
                  width: '200vw',
                  height: '100%',
                  backgroundColor: theme.colores.grisClaro,
                  zIndex: -1
                }
              },
            }}
            disableVirtualization={true}
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
