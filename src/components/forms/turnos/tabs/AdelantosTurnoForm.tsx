// components/tabs/AdelantosTurnoForm.tsx
import React, { useState, useContext } from "react";
import { Box, Tabs, Tab, Typography } from "@mui/material";
import AdelantoGasoilForm from "./adelantosTabs/AdelantoGasoilForm";
import AdelantoEfectivoForm from "./adelantosTabs/AdelantoEfectivoForm";
import { ContextoGeneral } from "../../../Contexto";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import IconButton from "@mui/material/IconButton";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";

interface AdelantosTurnoFormProps {
  turnoId: number | string;
  initialAdelantoGasoil?: any; // Puedes tiparlo según corresponda (por ejemplo, AdelantoGasoil)
  initialAdelantoEfectivo?: any; // Igual para el adelanto efectivo
  onSuccess: (updatedData: any) => void;
  onCancel: () => void;
  rolPermitido?: boolean;
  adelantos?: {
    adelantosEfvo?: any[];
    adelantosGasoil?: any[];
  };
}

const AdelantosTurnoForm: React.FC<AdelantosTurnoFormProps> = ({
  turnoId,
  initialAdelantoGasoil,
  initialAdelantoEfectivo,
  onSuccess,
  onCancel,
  rolPermitido = false,
  adelantos = {},
}) => {
  const [tabIndex, setTabIndex] = useState(0);
  const { theme } = useContext(ContextoGeneral);
  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue);
  };

  const tieneAdelantos =
    (adelantos.adelantosEfvo && adelantos.adelantosEfvo.length > 0) ||
    (adelantos.adelantosGasoil && adelantos.adelantosGasoil.length > 0);

  const [editAdelanto, setEditAdelanto] = useState<{ tipo: 'efvo' | 'gasoil'; data: any } | null>(null);
  const [deleteAdelanto, setDeleteAdelanto] = useState<{ tipo: 'efvo' | 'gasoil'; data: any } | null>(null);
  const [loading, setLoading] = useState(false);
  const [adelantosState, setAdelantosState] = useState(adelantos);

  // Refrescar adelantos tras editar/borrar
  const refreshAdelantos = async () => {
    try {
      setLoading(true);
      const backendURL = import.meta.env.VITE_BACKEND_URL || '';
      const [efvoRes, gasoilRes] = await Promise.all([
        fetch(`${backendURL}/adelantos/efectivo/${turnoId}`),
        fetch(`${backendURL}/adelantos/gasoil/${turnoId}`),
      ]);
      const efvo = efvoRes.ok ? await efvoRes.json() : [];
      const gasoil = gasoilRes.ok ? await gasoilRes.json() : [];
      setAdelantosState({ adelantosEfvo: efvo, adelantosGasoil: gasoil });
    } catch (e) {
      // opcional: mostrar error
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (tipo: 'efvo' | 'gasoil', data: any) => setEditAdelanto({ tipo, data });
  const handleDelete = (tipo: 'efvo' | 'gasoil', data: any) => setDeleteAdelanto({ tipo, data });
  const confirmDelete = async () => {
    if (!deleteAdelanto) return;
    setLoading(true);
    try {
      const backendURL = import.meta.env.VITE_BACKEND_URL || '';
      const url = `${backendURL}/adelantos/${deleteAdelanto.tipo === 'efvo' ? 'efectivo' : 'gasoil'}/${deleteAdelanto.data.id}`;
      await fetch(url, { method: 'DELETE', headers: { 'Content-Type': 'application/json' } });
      setDeleteAdelanto(null);
      await refreshAdelantos();
    } catch (e) {
      // opcional: mostrar error
    } finally {
      setLoading(false);
    }
  };

  if (!rolPermitido) {
    return (
      <Box sx={{ p: 3, textAlign: "center" }}>
        <Typography color="error">
          No tienes permisos para acceder a esta sección
        </Typography>
      </Box>
    );
  }
  return (
    <Box>
      <Tabs
        value={tabIndex}
        onChange={handleChange}
        sx={{
          color: theme.colores.azul,
          '& .MuiTab-root': {
            color: theme.colores.grisOscuro,
          },
          '& .Mui-selected': {
            color: theme.colores.azul + ' !important',
          },
          '& .MuiTabs-indicator': {
            backgroundColor: theme.colores.azul,
          },
        }}
      >
        <Tab label="Combustible" />
        <Tab label="Efectivo" />
        {tieneAdelantos && <Tab label="Adelantos hechos" />}
      </Tabs>

      <Box sx={{ mt: 2 }}>
        {tabIndex === 0 && (
          <AdelantoGasoilForm
            turnoId={turnoId}
            initialAdelanto={initialAdelantoGasoil}
            onSuccess={onSuccess}
            onCancel={onCancel}
          />
        )}
        {tabIndex === 1 && (
          <AdelantoEfectivoForm
            turnoId={turnoId}
            initialAdelanto={initialAdelantoEfectivo}
            onSuccess={onSuccess}
            onCancel={onCancel}
          />
        )}
        {tieneAdelantos && tabIndex === 2 && (
          <Box>
            {/* Aquí irá el contenido de Adelantos hechos */}
            {adelantosState.adelantosEfvo && adelantosState.adelantosEfvo.length > 0 && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>Efectivo</Typography>
                {adelantosState.adelantosEfvo.map((adelanto: any) => (
                  <Box key={adelanto.id} sx={{ display: 'flex', alignItems: 'center', mb: 1, p: 1, border: '1px solid #eee', borderRadius: 2 }}>
                    <Typography sx={{ flex: 1 }}>
                      Monto: ${adelanto.montoAdelantado} - Medio: {adelanto.tipoMedioPago?.nombre || 'Efectivo'}
                    </Typography>
                    <IconButton size="small" sx={{ color: theme.colores.azul, mr: 1 }} onClick={() => handleEdit('efvo', adelanto)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" sx={{ color: '#d68384' }} onClick={() => handleDelete('efvo', adelanto)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                ))}
              </Box>
            )}
            {adelantosState.adelantosGasoil && adelantosState.adelantosGasoil.length > 0 && (
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>Combustible</Typography>
                {adelantosState.adelantosGasoil.map((adelanto: any) => (
                  <Box key={adelanto.id} sx={{ display: 'flex', alignItems: 'center', mb: 1, p: 1, border: '1px solid #eee', borderRadius: 2 }}>
                    <Typography sx={{ flex: 1 }}>
                      Litros: {adelanto.cantLitros} - Combustible: {adelanto.tipoCombustible?.nombre || 'Gasoil'} - Precio: ${adelanto.precio}
                    </Typography>
                    <IconButton size="small" sx={{ color: theme.colores.azul, mr: 1 }} onClick={() => handleEdit('gasoil', adelanto)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" sx={{ color: '#d68384' }} onClick={() => handleDelete('gasoil', adelanto)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                ))}
              </Box>
            )}
            {/* Dialogo de edición */}
            <Dialog open={!!editAdelanto} onClose={() => setEditAdelanto(null)} maxWidth="xs" fullWidth>
              <DialogTitle>Editar adelanto</DialogTitle>
              <DialogContent>
                {editAdelanto?.tipo === 'efvo' ? (
                  <AdelantoEfectivoForm
                    turnoId={turnoId}
                    initialAdelanto={editAdelanto.data}
                    onSuccess={async () => {
                      setEditAdelanto(null);
                      await refreshAdelantos();
                    }}
                    onCancel={() => setEditAdelanto(null)}
                  />
                ) : editAdelanto?.tipo === 'gasoil' ? (
                  <AdelantoGasoilForm
                    turnoId={turnoId}
                    initialAdelanto={editAdelanto.data}
                    onSuccess={async () => {
                      setEditAdelanto(null);
                      await refreshAdelantos();
                    }}
                    onCancel={() => setEditAdelanto(null)}
                  />
                ) : null}
              </DialogContent>
            </Dialog>
            {/* Dialogo de confirmación de borrado */}
            <Dialog open={!!deleteAdelanto} onClose={() => setDeleteAdelanto(null)} maxWidth="xs" fullWidth>
              <DialogTitle>¿Eliminar adelanto?</DialogTitle>
              <DialogContent>
                <Typography>¿Seguro que deseas eliminar este adelanto?</Typography>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setDeleteAdelanto(null)} disabled={loading} sx={{ color: theme.colores.azul }}>
                  Cancelar
                </Button>
                <Button onClick={confirmDelete} color="error" disabled={loading}>Eliminar</Button>
              </DialogActions>
            </Dialog>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default AdelantosTurnoForm;
