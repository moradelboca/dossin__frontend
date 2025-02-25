/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useContext, useState, useEffect } from "react";
import {
  Button,
  Dialog,
  IconButton,
  Box,
  Typography,
  TextField,
} from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import DeleteEntidad from "../../dialogs/DeleteEntidad";
import useValidation from "../../hooks/useValidation";
import { ContextoGeneral } from "../../Contexto";
import AutocompleteEmpresas from "../autocompletes/AutocompleteEmpresas"; // Ajusta la ruta según corresponda
import { FormularioProps } from "../../../interfaces/FormularioProps";
//import { cargasContratoPruebas } from "./cargasContratoPruebas";

const ContratoForm: React.FC<FormularioProps> = ({
  seleccionado,
  datos,
  setDatos,
  handleClose,
}) => {
  // Si seleccionado es null, usamos un objeto vacío
  const safeSeleccionado = seleccionado || {};
  const { backendURL } = useContext(ContextoGeneral);
  const [openDialogDelete, setOpenDialogDelete] = useState(false);

  // Inicializamos los campos del contrato
  const {
    data,
    errors,
    validateAll,
    setData,
  } = useValidation(
    {
      titularCartaDePorte: "",
      destino: "",
      remitente: "",
      plantaProcedenciaRuca: "",
      destinoRuca: "",
      ...safeSeleccionado,
    },
    {
      titularCartaDePorte: (value) => (!value ? "Campo requerido" : null),
      destino: (value) => (!value ? "Campo requerido" : null),
      remitente: (value) => (!value ? "Campo requerido" : null),
      plantaProcedenciaRuca: (value) => (!value ? "Campo requerido" : null),
      destinoRuca: (value) => (!value ? "Campo requerido" : null),
    }
  );

  // Estado para almacenar las cargas
  const [cargas, setCargas] = useState<any[]>([]);
  
  useEffect(() => {
    // Verifica si existe el campo cargas en el objeto seleccionado
    if (safeSeleccionado.cargas) {
      // Suponiendo que safeSeleccionado.cargas es una cadena tipo "1, 3"
      const ids = safeSeleccionado.cargas.split(",").map((id: string) => id.trim());
      
      Promise.all(
        ids.map((id: any) =>
          fetch(`${backendURL}/cargas/${id}`)
            .then((response) => response.json())
        )
      )
        .then((cargasData) => {
          //DESPUES CAMBIAR

          setCargas(cargasData);
        })
        .catch((error) =>
          console.error("Error al cargar las cargas:", error)
        );
    } else {
      // Si no hay cargas, se resetea el estado a un array vacío
      setCargas([]);
    }
  }, [backendURL, safeSeleccionado.cargas]);


  const handleSubmit = () => {
    if (validateAll()) {
      const metodo = safeSeleccionado.id ? "PUT" : "POST";
      const url = safeSeleccionado.id
        ? `${backendURL}/contratos/${data.id || safeSeleccionado.id}`
        : `${backendURL}/contratos`;

      // Construcción del payload incluyendo los ids de las cargas
      const payload = {
        titularCartaDePorte: data.titularCartaDePorte,
        destino: data.destino,
        remitente: data.remitente,
        plantaProcedenciaRuca: data.plantaProcedenciaRuca,
        destinoRuca: data.destinoRuca,
        // Siempre enviamos las cargas ya que son parte del contrato
        idsCargas: cargas.length > 0 ? cargas.map((carga) => carga.id) : [],
      };

      fetch(url, {
        method: metodo,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
        .then((response) => {
          if (!response.ok) {
            return response.text().then((text) => {
              throw new Error(`Error ${response.status}: ${text}`);
            });
          }
          return response.json();
        })
        .then((newData) => {
          if (metodo === "POST") {
            setDatos([...datos, newData]);
          } else {
            const datosActualizados = datos.map((contrato: any) =>
              contrato.id === (data.id || safeSeleccionado.id) ? newData : contrato
            );
            setDatos(datosActualizados);
          }
        })
        .catch((error) =>
          console.error("Error al guardar el contrato: ", error.message)
        );
      handleClose();
    }
  };

  const handleClickDelete = () => setOpenDialogDelete(true);
  const handleCloseDialog = () => setOpenDialogDelete(false);

  // Función placeholder para editar una carga
  const handleEditCarga = (carga: any) => {
    // Aquí podrías abrir un modal o navegar a otro formulario para editar la carga.
    console.log("Editar carga:", carga);
  };

  return (
    <>
      <Typography variant="h6" mb={2}>
        {safeSeleccionado.id ? "Editar Contrato" : "Crear Contrato"}
      </Typography>

      <AutocompleteEmpresas
        value={data.titularCartaDePorte || null}
        onChange={(newValue) =>
          setData({ ...data, titularCartaDePorte: newValue })
        }
        error={!!errors.titularCartaDePorte}
        helperText={errors.titularCartaDePorte}
        labelText="Empresa Titular"
      />
      <AutocompleteEmpresas
        value={data.destino || null}
        onChange={(newValue) => setData({ ...data, destino: newValue })}
        error={!!errors.destino}
        helperText={errors.destino}
        labelText="Empresa Destino"
      />
      <AutocompleteEmpresas
        value={data.remitente || null}
        onChange={(newValue) => setData({ ...data, remitente: newValue })}
        error={!!errors.remitente}
        helperText={errors.remitente}
        labelText="Empresa Remitente"
      />
      <TextField
        label="Planta Procedencia Ruca"
        value={data.plantaProcedenciaRuca || ""}
        onChange={(e) =>
          setData({ ...data, plantaProcedenciaRuca: e.target.value })
        }
        error={!!errors.plantaProcedenciaRuca}
        helperText={errors.plantaProcedenciaRuca}
        fullWidth
        margin="normal"
      />
      <TextField
        label="Destino Ruca"
        value={data.destinoRuca || ""}
        onChange={(e) =>
          setData({ ...data, destinoRuca: e.target.value })
        }
        error={!!errors.destinoRuca}
        helperText={errors.destinoRuca}
        fullWidth
        margin="normal"
      />

      {/* Sección de listado de cargas */}
      <Box mt={4}>
        <Typography variant="h6" mb={2}>
          Cargas
        </Typography>
        {cargas.length === 0 ? (
          <Typography>No hay cargas registradas.</Typography>
        ) : (
          cargas.map((carga) => (
            <Box
              key={carga.id}
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              border="1px solid #ccc"
              borderRadius={1}
              p={1}
              mb={1}
            >
              <Box>
                <Typography>
                  <strong>ID:</strong> {carga.id}
                </Typography>
                <Typography>
                  <strong>Ubicación Carga:</strong>{" "}
                  {carga.ubicacionCarga?.nombre || "No disponible"}
                </Typography>
                <Typography>
                  <strong>Ubicación Descarga:</strong>{" "}
                  {carga.ubicacionDescarga?.nombre || "No disponible"}
                </Typography>
              </Box>
              <Button
                variant="contained"
                color="secondary"
                onClick={() => handleEditCarga(carga)}
              >
                Editar
              </Button>
            </Box>
          ))
        )}
      </Box>

      <Box display="flex" justifyContent="space-between" mt={2}>
        <Button onClick={handleClose} color="primary">
          Cancelar
        </Button>
        <Button onClick={handleSubmit} color="primary">
          Guardar
        </Button>
        {safeSeleccionado.id && (
          <IconButton onClick={handleClickDelete}>
            <DeleteOutlineIcon sx={{ fontSize: 20, color: "#d68384" }} />
          </IconButton>
        )}
      </Box>

      <Dialog open={openDialogDelete} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DeleteEntidad
          idEntidad={data.id || safeSeleccionado.id}
          endpointEntidad="contratos"
          handleCloseDialog={handleCloseDialog}
          handleClose={handleClose}
          datos={datos}
          setDatos={setDatos}
        />
      </Dialog>
    </>
  );
};

export default ContratoForm;
