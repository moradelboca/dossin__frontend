// Sidebar.tsx
import React, { useEffect, useState } from 'react';
import { Box, CircularProgress, Menu, MenuItem, TextField, Typography } from '@mui/material';
import { Autocomplete } from '@mui/material';
import { TarjetaCarga } from '../tarjetas/TarjetaCarga';
import SidebarBuscador from './SidebarBuscador';
import { useProvincias } from '../../hooks/cargas/useProvincias';

interface SidebarProps {
  cargas: any[];
  estadoCarga: string;
  provincia: number | null;
  onProvinciaChange: (value: number | null) => void;
  menuOpen: boolean;
  anchorEl: HTMLElement | null;
  onMenuClose: () => void;
  onCardClick: (carga: any) => void;
  cargaSeleccionada: any;
}

const Sidebar: React.FC<SidebarProps> = ({
  cargas,
  estadoCarga,
  provincia,
  onProvinciaChange,
  menuOpen,
  anchorEl,
  onMenuClose,
  onCardClick,
  cargaSeleccionada,
}) => {
  const [filteredCargas, setFilteredCargas] = useState<any[]>([]);
  const [currentFilter, setCurrentFilter] = useState<{ type: string; value: any }>({ type: '', value: '' });
  const { provinciasCarga, provinciasDescarga } = useProvincias(cargas);

  useEffect(() => {
    // Sort cargas by ID in descending order (highest to lowest)
    const sortedCargas = [...cargas].sort((a, b) => b.id - a.id);
    setFilteredCargas(sortedCargas);
    handleFilterChange('sin-filtro', null);
  }, [cargas]);
  
  const handleFilterChange = (filterType: string, filterValue: any) => {
    setCurrentFilter({ type: filterType, value: filterValue });
    
    let filtered = cargas;
    switch(filterType) {
      case 'id':
        filtered = cargas.filter(c => c.id.toString().includes(filterValue));
        break;
      case 'provincia-carga':
        filtered = cargas.filter(c => 
          c.ubicacionCarga.localidad.provincia.id === filterValue
        );
        break;
      case 'provincia-descarga':
        filtered = cargas.filter(c => 
          c.ubicacionDescarga?.localidad?.provincia?.id === filterValue
        );
        break;
      case 'cargamento':
        filtered = cargas.filter(c => c.cargamento.id === filterValue);
        break;
      case 'sin-filtro':
      default:
        filtered = cargas;
        break;
    }
    
    // Sort filtered results by ID in descending order (highest to lowest)
    const sortedFiltered = [...filtered].sort((a, b) => b.id - a.id);
    setFilteredCargas(sortedFiltered);
  };

  const provinciasOptions = provinciasCarga.map(p => ({
    id: p.id,
    nombre: p.nombre
  }));

  return (
    <Box sx={{ 
      flex: 1,
      display: "flex",
      flexDirection: "column",
      gap: 2,
      maxWidth: "26vw",
      overflowY: "auto",
      overflowX: "hidden",
    }}>
      <SidebarBuscador 
        onFilterChange={handleFilterChange}
        provinciasCarga={provinciasCarga}
        provinciasDescarga={provinciasDescarga}
      />
      
      <Menu
        id="menu"
        anchorEl={anchorEl}
        open={menuOpen}
        onClose={onMenuClose}
        MenuListProps={{ "aria-labelledby": "menu-button" }}
        PaperProps={{ 
          style: { 
            maxHeight: 80 * 4.5,
            width: "40ch",
            position: "fixed",
            top: "60px!important",
            left: "auto!important",
            right: "10px"
          } 
        }}
      >
        <MenuItem>
          <Autocomplete
            disablePortal
            options={provinciasOptions}
            getOptionLabel={(option) => option.nombre}
            value={provincia ? provinciasOptions.find(p => p.id === provincia) : null}
            onChange={(_, value) => onProvinciaChange(value?.id || null)}
            renderInput={(params) => <TextField {...params} label="Provincia" />}
            sx={{ width: 300, mb: 2 }}
          />
        </MenuItem>
      </Menu>

      {estadoCarga === "Cargando" ? (
        <Box display="flex" flexDirection="row" width="100%" height="100%" justifyContent="center" alignItems="center" gap={3}>
          <CircularProgress sx={{ padding: "5px", width: "30px", height: "30px" }} />
          <Typography variant="h6"><b>Cargando...</b></Typography>
        </Box>
      ) : filteredCargas.length > 0 ? (
        <Box sx={{ 
          width: "100%",
          display: "flex",
          flexDirection: "column",
          padding:"0 8px",
          gap: 2,
          pb: 2
        }}>
          {filteredCargas.map((carga) => (
            <TarjetaCarga 
              key={carga.id} 
              datosCarga={carga} 
              isSelected={carga.id === cargaSeleccionada?.id} 
              onClick={() => onCardClick(carga)} 
            />
          ))}
        </Box>
      ) : (
        <Typography variant="subtitle2" sx={{ margin: 2 }} color="#90979f">
          {currentFilter.type ? "No se encontraron resultados" : "Parece ser que no hay cargas."}
        </Typography>
      )}
    </Box>
  );
};

export default Sidebar;