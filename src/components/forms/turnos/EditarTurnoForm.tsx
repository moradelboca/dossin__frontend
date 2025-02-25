import React, { useState } from "react";
import { Autocomplete, TextField, Box, Popper } from "@mui/material";
import DatosPrincipalesForm from "./tabs/DatosPrincipalesForm";
import TaraForm from "./tabs/TaraForm";
import CartaPorteForm from "./tabs/CartaPorteForm";
import OrdenPagoForm from "./tabs/OrdenPagoForm";
import GranosForm from "./tabs/GranosForm";
import FacturaForm from './tabs/FacturaForm';
import AdelantosTurnoForm from "./tabs/AdelantosTurnoForm";
import EstadoTurnoForm from "./tabs/EstadoTurnoForm";

interface EditarTurnoFormProps {
  seleccionado?: any;
  datos: any;
  setDatos: any;
  handleClose: () => void;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const EditarTurnoForm: React.FC<EditarTurnoFormProps> = ({
  seleccionado,
  datos,
  setDatos,
  handleClose,
}) => {
  const [activeTab, setActiveTab] = useState(0);
  console.log(seleccionado)
  // Se agrega la nueva pestaña "Adelantos" al listado
  const tabs = [
    "Datos Principales",
    "Estado",
    "Tara",
    "Factura",
    "Carta de Porte",
    "Granos",
    "Orden Pago",
    "Adelantos"
  ];

  const handleTabChange = (_event: any, newValue: string | null) => {
    if (newValue !== null) {
      const newIndex = tabs.indexOf(newValue);
      setActiveTab(newIndex);
    }
  };

  const CustomPopper = (props: any) => (
    <Popper
      {...props}
      placement="bottom-start"
      sx={{
        "& .MuiAutocomplete-listbox": {
          fontSize: "0.875rem",
          padding: 0,
          borderRadius: "8px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        },
        "& .MuiAutocomplete-option": {
          minHeight: "auto",
          padding: "8px 16px",
        },
      }}
    />
  );
  

  return (
    <Box sx={{ bgcolor: "background.paper", borderRadius: 2, p: 2 }}>
      <Box sx={{ display: "flex", justifyContent: "start", mb: 2 }}>
        <Autocomplete
          options={tabs}
          value={tabs[activeTab]}
          onChange={handleTabChange}
          disableClearable
          PopperComponent={CustomPopper}
          sx={{
            width: 300,
            "& .MuiAutocomplete-inputRoot": {
              padding: "4px 8px",
              marginLeft:"24px",
              borderRadius: "10px",
              backgroundColor: "background.paper",
              transition: "all 0.3s ease",
              "&:hover": {
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              },
              "&.Mui-focused": {
                boxShadow: "0 2px 12px rgba(0,0,0,0.15)",
                backgroundColor: "background.paper",
              },
            },
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              variant="outlined"
              InputProps={{
                ...params.InputProps,
                sx: {
                  fontSize: "0.9rem",
                  "&::placeholder": {
                    fontSize: "0.9rem",
                  },
                },
              }}
              InputLabelProps={{
                sx: {
                  fontSize: "0.9rem",
                  color: "text.secondary",
                  top: "-2px",
                  "&.Mui-focused": {
                    color: "primary.main",
                  },
                },
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  border: "1px solid",
                  borderColor: "divider",
                  "&:hover": {
                    borderColor: "primary.light",
                  },
                },
              }}
            />
          )}
        />
      </Box>

      {/* Sección Datos Principales */}
      <TabPanel value={activeTab} index={0}>
        <DatosPrincipalesForm
          seleccionado={seleccionado}
          datos={datos}
          setDatos={setDatos}
          handleClose={handleClose}
        />
      </TabPanel>

      <TabPanel value={activeTab} index={1}>
        <EstadoTurnoForm
          turnoId={seleccionado.id}
          initialEstado={seleccionado.estado} // Suponiendo que la estructura es { id, nombre }
          onSuccess={(updatedEstado) => {
            setDatos(
              datos.map((turno: any) =>
                turno.id === seleccionado.id ? { ...turno, estado: updatedEstado } : turno
              )
            );
            handleClose();
          }}
          onCancel={handleClose}
        />
      </TabPanel>

      {/* Sección Tara */}
      <TabPanel value={activeTab} index={2}>
        <TaraForm
          turnoId={seleccionado.id}
          initialTara={seleccionado.tara}
          onSuccess={(updatedTara) => {
            setDatos(
              datos.map((turno: any) =>
                turno.id === seleccionado.id
                  ? { ...turno, tara: updatedTara }
                  : turno
              )
            );
            handleClose();
          }}
          onCancel={handleClose}
        />
      </TabPanel>

      {/* Factura */}
      <TabPanel value={activeTab} index={3}>
        <FacturaForm
          turnoId={seleccionado.id}
          initialFactura={seleccionado.factura}
          onSuccess={(updatedFactura) => {
            setDatos(
              datos.map((turno: any) =>
                turno.id === seleccionado.id
                  ? { ...turno, factura: updatedFactura }
                  : turno
              )
            );
            handleClose();
          }}
          onCancel={handleClose}
        />
      </TabPanel>

      {/* Carta de Porte */}
      <TabPanel value={activeTab} index={4}>
        <CartaPorteForm
          turnoId={seleccionado.id}
          initialData={seleccionado.cartaDePorte}
          onSuccess={(updatedData) => {
            setDatos(
              datos.map((turno: any) =>
                turno.id === seleccionado.id
                  ? { ...turno, cartaPorte: updatedData }
                  : turno
              )
            );
            handleClose();
          }}
          onCancel={handleClose}
        />
      </TabPanel>

      {/* Granos */}
      <TabPanel value={activeTab} index={5}>
        <GranosForm
          turnoId={seleccionado.id}
          initialData={{
            kgCargados: seleccionado?.kgCargados,
            kgDescargados: seleccionado?.kgDescargados,
            precioGrano: seleccionado?.precioGrano,
          }}
          onSuccess={(updatedData) => {
            setDatos(
              datos.map((turno: any) =>
                turno.id === seleccionado.id
                  ? { ...turno, ...updatedData }
                  : turno
              )
            );
            handleClose();
          }}
          onCancel={handleClose}
        />
      </TabPanel>

      {/* Orden Pago */}
      <TabPanel value={activeTab} index={6}>
        <OrdenPagoForm
          turnoId={seleccionado.id}
          initialData={seleccionado.numeroOrdenPago}
          onSuccess={(updatedData) => {
            setDatos(
              datos.map((turno: any) =>
                turno.id === seleccionado.id
                  ? { ...turno, numeroOrdenPago: updatedData }
                  : turno
              )
            );
            handleClose();
          }}
          onCancel={handleClose}
        />
      </TabPanel>

      {/* Adelantos (nueva pestaña) */}
      <TabPanel value={activeTab} index={7}>
        <AdelantosTurnoForm
          turnoId={seleccionado.id} // debe tener el id correcto
          onSuccess={() => { handleClose(); }}
          onCancel={handleClose}
        />
      </TabPanel>
    </Box>
  );
};

export default EditarTurnoForm;
