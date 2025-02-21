// GridTemplate.tsx
import React from "react";
import { Box, Typography, CircularProgress } from "@mui/material";
import { DataGrid, GridColDef, GridRowModesModel, GridRowsProp } from "@mui/x-data-grid";
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
        padding: 3,
      }}
    >
      <Typography
        variant="h5"
        component="div"
        sx={{
          color: theme.colores.azul,
          fontWeight: "bold",
          mb: 2,
          fontSize: "2rem",
          pb: 1,
          marginLeft: 1,
        }}
      >
        {titulo}
      </Typography>
      <Box margin="10px" sx={{ height: "90%", width: "100%" }}>
        {loading ? (
          <Box
            display="flex"
            flexDirection="row"
            width="100%"
            height="100%"
            justifyContent="center"
            alignItems="center"
            gap={3}
          >
            <CircularProgress
              sx={{
                padding: "5px",
                width: "30px",
                height: "30px",
              }}
            />
            <Typography variant="h5">
              <b>Cargando...</b>
            </Typography>
          </Box>
        ) : (
          <DataGrid
            rows={rows}
            columns={columns}
            getRowId={getRowId}
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
              toolbar: (props) => (
                <EditToolbar setRows={function (newRows: (oldRows: GridRowsProp) => GridRowsProp): void {
                        throw new Error("Function not implemented.");
                    } } setRowModesModel={function (newModel: (oldModel: GridRowModesModel) => GridRowModesModel): void {
                        throw new Error("Function not implemented.");
                    } } {...props} onAdd={onAdd} name={entityName} />
              ),
            }}
          />
        )}
      </Box>
    </Box>
  );
}
