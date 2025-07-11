import DeleteIcon from "@mui/icons-material/Delete";
import {
  Autocomplete,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Popper,
  TextField,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { useAllowed } from "../../hooks/auth/useAllowed";
import useBorrarTurno from "../../hooks/borrado/useBorrarTurno";
import AdelantosTurnoForm from "./tabs/AdelantosTurnoForm";
import CartaPorteForm from "./tabs/CartaPorteForm";
import DatosPrincipalesForm from "./tabs/DatosPrincipalesForm";
import EstadoTurnoForm from "./tabs/EstadoTurnoForm";
import FacturaForm from "./tabs/FacturaForm";
import OrdenPagoForm from "./tabs/OrdenPagoForm";
import PesajeForm from "./tabs/PesajeForm";
import { TaraForm } from "./tabs/TaraForm";
import { useContext } from "react";
import { ContextoGeneral } from "../../Contexto";

const ROLES_PERMITIDOS_ADELANTOS = [1, 2];

interface EditarTurnoFormProps {
  seleccionado?: any;
  datos: any;
  setDatos: any;
  handleClose: () => void;
  tieneBitren?: boolean | null;
  acopladoExtraRequired?: boolean;
  estadoTurno?: string;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const tema = useTheme();
  const isMobile = useMediaQuery(tema.breakpoints.down("sm"));
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: (!isMobile ? 3 : 0) }}>{children}</Box>}
    </div>
  );
}

const EditarTurnoForm: React.FC<EditarTurnoFormProps> = ({
  seleccionado,
  datos,
  setDatos,
  handleClose,
  tieneBitren,
  acopladoExtraRequired = false,
  estadoTurno,
}) => {
  const isAllowed = useAllowed(ROLES_PERMITIDOS_ADELANTOS);
  const [activeTab, setActiveTab] = useState(0);
  const { borrarTurno } = useBorrarTurno();
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [filteredTabs, setFilteredTabs] = useState<string[]>([]);
  const { theme } = useContext(ContextoGeneral);

  console.log('EditarTurnoForm - seleccionado:', seleccionado);
  console.log('EditarTurnoForm - precioGrano:', seleccionado?.precioGrano);

  const tema = useTheme();
  const isMobile = useMediaQuery(tema.breakpoints.down("sm"));
  
  const estados = {
    validado: { nombre: "Validado", numero: 1 },
    autorizado: { nombre: "Autorizado", numero: 2 },
    tarado: { nombre: "Tarado", numero: 3 },
    cargado: { nombre: "Cargado", numero: 4 },
    enViaje: { nombre: "En Viaje", numero: 5 },
    descargado: { nombre: "Descargado", numero: 6 },
    facturado: { nombre: "Facturado", numero: 7 },
    pagado: { nombre: "Pagado", numero: 8 },
    adelanto: { nombre: "Adelantos", numero: 9 },
  };

  useEffect(() => {
    const newTabs = [seleccionado.estado.nombre]; // solo un tab dinámico basado en estado

    if (isAllowed) {
      newTabs.push("Adelantos");
    }

    setFilteredTabs(newTabs);

    if (activeTab >= newTabs.length) {
      setActiveTab(0);
    }
  }, [isAllowed, seleccionado]);

  const handleTabChange = (_event: any, newValue: string | null) => {
    if (newValue !== null) {
      const newIndex = filteredTabs.indexOf(newValue); // Usar filteredTabs actual
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

  // Función que se llama al confirmar la eliminación del turno
  const handleConfirmDelete = async () => {
    try {
      const confirmFacturaDeletion =
        seleccionado.factura !== null
          ? `¿Desea borrar también la factura ${seleccionado.factura.nroFactura} de la empresa ${seleccionado.empresa.cuit}?`
          : "¿Está seguro que desea eliminar este turno?";

      // Si el usuario confirma, proceder con la eliminación
      await borrarTurno(seleccionado, confirmFacturaDeletion === "Sí");

      // Actualizar el estado removiendo el turno eliminado
      setDatos((prevDatos: any[]) =>
        prevDatos.filter((turno) => turno.id !== seleccionado.id)
      );

      // Cierra el formulario
      handleClose();
    } catch (error) {
      console.error("No se pudo eliminar el turno:", error);
    }
  };
  const estadoActual = Object.values(estados).find(
    (estado) => estado.nombre === filteredTabs[activeTab]
  );

  const numeroEstadoActual = estadoActual ? estadoActual.numero : 0;
  return (
    <Box sx={{ bgcolor: "background.paper", borderRadius: 2, p: (!isMobile ? 2 : 0) }}>
      {/* Encabezado con Autocomplete y botón de eliminación (bote de basura rojo) */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Autocomplete
          options={filteredTabs}
          value={filteredTabs[activeTab]}
          onChange={handleTabChange}
          disableClearable
          PopperComponent={CustomPopper}
          sx={{
            width: 300,
            "& .MuiAutocomplete-inputRoot": {
              padding: "4px 8px",
              marginLeft:  (!isMobile ? "24px" : "0px"),
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

        {/* Botón de eliminación: ícono de bote de basura en rojo */}
        <IconButton
          onClick={() => setOpenDeleteDialog(true)}
          color="error"
          aria-label="eliminar turno"
        >
          <DeleteIcon fontSize="large" />
        </IconButton>
      </Box>

      {/* Diálogo de confirmación para eliminar el turno */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
      >
        <DialogTitle>Eliminar Turno</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {seleccionado.factura
              ? `¿Desea borrar también la factura ${seleccionado.factura.nroFactura} de la empresa ${seleccionado.empresa.cuit}?`
              : "¿Está seguro que desea eliminar este turno?"}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setOpenDeleteDialog(false)}
            sx={{ color: theme.colores.azul }}
          >
            Cancelar
          </Button>
          <Button onClick={handleConfirmDelete} color="error">
            Sí, borrar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Sección Datos Principales */}

      <TabPanel value={numeroEstadoActual} index={1}>
        <DatosPrincipalesForm
          seleccionado={seleccionado}
          datos={datos}
          setDatos={setDatos}
          handleClose={handleClose}
          tieneBitren={tieneBitren}
          acopladoExtraRequired={acopladoExtraRequired}
          estadoTurno={estadoTurno}
        />
      </TabPanel>

      {/* Sección Estado */}
      <TabPanel value={numeroEstadoActual} index={3}>
        <EstadoTurnoForm
          turnoId={seleccionado.id}
          initialEstado={seleccionado.estado}
          onSuccess={(updatedEstado) => {
            setDatos(
              datos.map((turno: any) =>
                turno.id === seleccionado.id
                  ? { ...turno, estado: updatedEstado }
                  : turno
              )
            );
            handleClose();
          }}
          onCancel={handleClose}
        />
      </TabPanel>

      {/* Sección Tara */}

      <TabPanel value={numeroEstadoActual} index={2}>
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
      <TabPanel value={numeroEstadoActual} index={4}>
        {seleccionado.id ? (
          <FacturaForm
            cuitEmpresa={seleccionado.empresa?.cuit}
            turnoId={seleccionado.id}
            initialFactura={seleccionado.factura}
            precioGrano={seleccionado.precioGrano}
            onSuccess={(updatedFactura) => {
              setDatos(
                datos.map((turno: any) =>
                  turno.id === seleccionado.id
                    ? { 
                        ...turno, 
                        factura: updatedFactura,
                        precioGrano: turno.precioGrano // Preserve the precioGrano value
                      }
                    : turno
                )
              );
              handleClose();
            }}
            onCancel={handleClose}
          />
        ) : (
          (() => {
            console.error('FacturaForm: seleccionado.id es undefined', seleccionado);
            return (
              <Box sx={{ color: 'error.main', p: 2 }}>
                <strong>Error:</strong> No se encontró el ID del turno. No se puede asociar la factura.<br/>
                <span style={{ fontSize: '0.9em' }}>Contacte a soporte si el problema persiste.</span>
              </Box>
            );
          })()
        )}
      </TabPanel>

      {/* Carta de Porte */}
      <TabPanel value={numeroEstadoActual} index={5}>
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

      {/* Pesaje */}
      <TabPanel value={numeroEstadoActual} index={6}>
        <PesajeForm
          turnoId={seleccionado.id}
          initialData={{
            kgDescargados: seleccionado?.kgDescargados
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
      <TabPanel value={numeroEstadoActual} index={7}>
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

      {/* Pestaña Adelantos condicional */}
      {filteredTabs.includes("Adelantos") && (
        <TabPanel value={numeroEstadoActual} index={9}>
          <AdelantosTurnoForm
            turnoId={seleccionado.id}
            onSuccess={handleClose}
            onCancel={handleClose}
            // Añadir validación de rol en el formulario mismo
            rolPermitido={isAllowed}
          />
        </TabPanel>
      )}
    </Box>
  );
};

export default EditarTurnoForm;