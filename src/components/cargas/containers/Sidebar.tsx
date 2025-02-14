// Sidebar.tsx
import React from "react";
import { Box, CircularProgress, IconButton, Menu, MenuItem, TextField, Typography } from "@mui/material";
import { AccessAlarmOutlined, MoreVert } from "@mui/icons-material";
import { Autocomplete } from "@mui/material";
import { TarjetaCarga } from "../tarjetas/TarjetaCarga";
import { BotonIcon } from "../../botones/IconButton";

interface SidebarProps {
  cargas: any[];
  estadoCarga: string;
  provincia: string | null;
  onProvinciaChange: (event: any, value: any | null) => void;
  onMenuClick: (event: React.MouseEvent<HTMLElement>) => void;
  menuOpen: boolean;
  anchorEl: HTMLElement | null;
  onMenuClose: () => void;
  onCrearCarga: () => void;
  onCardClick: (carga: any) => void;
  cargaSeleccionada: any;
}

const Sidebar: React.FC<SidebarProps> = ({
  cargas,
  estadoCarga,
  provincia,
  onProvinciaChange,
  onMenuClick,
  menuOpen,
  anchorEl,
  onMenuClose,
  onCrearCarga,
  onCardClick,
  cargaSeleccionada,
}) => {
  const provincias = Array.from(
    new Set((Array.isArray(cargas) ? cargas : []).map(carga => carga.ubicacionCarga.localidad.provincia.nombre))
  );

  return (
    <Box sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 2, maxWidth: "26vw", overflowY: "auto", overflowX: "hidden", alignItems: "center" }}>
      <Box display="flex" flexDirection="row" gap={2} alignItems="center">
        <BotonIcon title="Quiero crear una nueva carga" icon={<AccessAlarmOutlined />} onClick={onCrearCarga} />
        <Box display="flex" flexDirection="row" gap={2} alignItems="center">
          <IconButton aria-label="more" aria-controls={menuOpen ? "menu" : undefined} aria-haspopup="true" onClick={onMenuClick}>
            <MoreVert />
          </IconButton>
          <Menu id="menu" anchorEl={anchorEl} open={menuOpen} onClose={onMenuClose} MenuListProps={{ "aria-labelledby": "menu-button" }} PaperProps={{ style: { maxHeight: 80 * 4.5, width: "40ch" } }}>
            <MenuItem>
              <Autocomplete
                disablePortal
                options={provincias.map(prov => ({ value: prov }))}
                value={provincia ? { value: provincia } : null}
                onChange={onProvinciaChange}
                renderInput={params => <TextField {...params} label="Provincia" />}
                sx={{ width: 300, mb: 2 }}
              />
            </MenuItem>
          </Menu>
        </Box>
      </Box>
      {estadoCarga === "Cargando" ? (
        <Box display="flex" flexDirection="row" width="100%" height="100%" justifyContent="center" alignItems="center" gap={3}>
          <CircularProgress sx={{ padding: "5px", width: "30px", height: "30px" }} />
          <Typography variant="h6"><b>Cargando...</b></Typography>
        </Box>
      ) : cargas.length > 0 ? (
        cargas.map((carga, i) => (
          <TarjetaCarga key={i} datosCarga={carga} isSelected={carga.id === cargaSeleccionada?.id} onClick={() => onCardClick(carga)} />
        ))
      ) : (
        <Typography variant="subtitle2" sx={{ margin: 2 }} color="#90979f">Parece ser que no hay cargas.</Typography>
      )}
    </Box>
  );
};

export default Sidebar;
