import {
    Autocomplete,
    Box,
    Button,
    Dialog,
    IconButton,
    TextField,
  } from "@mui/material";
  import { useContext, useEffect, useState } from "react";
  import AutocompletarUbicacionLocalidad from "./AutocompletarUbicacionLocalidad";
  import { ContextoGeneral } from "../Contexto";
  import React from "react";
  import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
  import DeleteUbicacion from "./DeleteUbicaciones";
  
  interface Ubicacion {
    handleClose: any;
    ubicacionSeleccionada: any;
    ubicaciones: any[];
    setUbicaciones: any;
    refreshUbicaciones: any;
  }
  
  export function CreadorUbicacion(props: Ubicacion) {
    const { backendURL } = useContext(ContextoGeneral);
    const {
      handleClose,
      ubicacionSeleccionada,
      ubicaciones,
      setUbicaciones,
      refreshUbicaciones,
    } = props;
  
    const [tipoUbicacion, setTipoUbicacion] = useState<any[]>([]);
    const [openDialogDelete, setOpenDialogDelete] = useState(false);
    const [estadoCarga, setEstadoCarga] = useState(true);
    const [localidades, setLocalidades] = useState<any[]>([]);
  
    // Cargar ubicaciones, tipos y localidades
    useEffect(() => {
      fetch(`${backendURL}/ubicaciones`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
      })
        .then((response) => response.json())
        .then((ubicaciones) => {
          setUbicaciones(ubicaciones);
          setEstadoCarga(false);
        })
        .catch(() => console.error("Error al obtener las ubicaciones disponibles"));
    }, []);
  
    useEffect(() => {
      fetch(`${backendURL}/ubicaciones/tiposUbicaciones`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
      })
        .then((response) => response.json())
        .then((tipoUbicacion) => {
          setTipoUbicacion(tipoUbicacion);
          setEstadoCarga(false);
        })
        .catch(() => console.error("Error al obtener los tipos de ubicacion"));
    }, []);
  
    useEffect(() => {
      fetch(`${backendURL}/ubicaciones/localidades`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
      })
        .then((response) => response.json())
        .then((localidades) => {
          setLocalidades(localidades);
          setEstadoCarga(false);
        })
        .catch(() => console.error("Error al obtener las localidades"));
    }, []);
  
    // Inicializa el objeto de datos a partir de la ubicación seleccionada (si existe)
    const [datosNuevaUbicacion, setDatosNuevaUbicacion] = useState<any>({
      urlMaps: ubicacionSeleccionada?.urlMaps || "",
      nombre: ubicacionSeleccionada?.nombre || "",
      nombreLocalidad: ubicacionSeleccionada?.localidad?.nombre || "",
      idLocalidad: ubicacionSeleccionada?.localidad?.id || null,
      idTipoUbicacion: ubicacionSeleccionada?.tipoUbicacion?.id || null,
      nombreTipoUbicacion: ubicacionSeleccionada?.tipoUbicacion?.nombre || "",
      id: ubicacionSeleccionada?.id || null,
    });
  
    // Estado para el Autocomplete de tipo, usando el objeto completo
    const [selectedTipo, setSelectedTipo] = useState<any>(null);
  
    // Efecto para actualizar selectedTipo cuando se carguen las opciones o cambie el id
    useEffect(() => {
      if (datosNuevaUbicacion.idTipoUbicacion) {
        const tipoPreseleccionado = tipoUbicacion.find(
          (tipo) => tipo.id === datosNuevaUbicacion.idTipoUbicacion
        );
        setSelectedTipo(tipoPreseleccionado || null);
      }
    }, [tipoUbicacion, datosNuevaUbicacion.idTipoUbicacion]);
  
    const seleccionarURLMaps = (e: any) => {
      setDatosNuevaUbicacion({
        ...datosNuevaUbicacion,
        urlMaps: e.target.value,
      });
    };
  
    const setNombre = (e: React.ChangeEvent<HTMLInputElement>) => {
      setDatosNuevaUbicacion({
        ...datosNuevaUbicacion,
        nombre: e.target.value,
      });
    };
  
    // Actualiza el estado tanto del Autocomplete como del objeto de datos
    const seleccionarTipo = (_event: any, newValue: any | null) => {
      setSelectedTipo(newValue);
      if (newValue) {
        setDatosNuevaUbicacion({
          ...datosNuevaUbicacion,
          idTipoUbicacion: newValue.id,
          nombreTipoUbicacion: newValue.nombre,
        });
      } else {
        setDatosNuevaUbicacion({
          ...datosNuevaUbicacion,
          idTipoUbicacion: null,
          nombreTipoUbicacion: "",
        });
      }
    };
  
    const [errorUrl, setErrorUrl] = useState(false);
    const [errorTipo, setErrorTipo] = useState(false);
    const [errorLocalidad, setErrorLocalidad] = useState(false);
  
    // Expresión regular que obliga al formato:
    // https://maps.app.goo.gl/ seguido de una cadena alfanumérica
    const regexUrl = /^https:\/\/maps\.app\.goo\.gl\/[A-Za-z0-9]+$/;
  
    const handleSave = () => {
      if (!datosNuevaUbicacion) return;
  
      const validUrl = regexUrl.test(datosNuevaUbicacion.urlMaps);
      setErrorUrl(!validUrl);
  
      const validTipo = !!datosNuevaUbicacion.idTipoUbicacion;
      setErrorTipo(!validTipo);
  
      const validLocalidad = !!datosNuevaUbicacion.idLocalidad;
      setErrorLocalidad(!validLocalidad);
  
      if (!validUrl || !validTipo || !validLocalidad) return;
  
      const metodo = ubicacionSeleccionada ? "PUT" : "POST";
      const url = ubicacionSeleccionada
        ? `${backendURL}/ubicaciones/${datosNuevaUbicacion.id}`
        : `${backendURL}/ubicaciones`;
  
      fetch(url, {
        method: metodo,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datosNuevaUbicacion),
      })
        .then((response) => {
          if (!response.ok) {
            return response.text().then((text) => {
              throw new Error(text);
            });
          }
          return response.json();
        })
        .then((data) => {
          if (metodo === "POST") {
            setUbicaciones((prev: any) => [...prev, data]);
          } else {
            const index = ubicaciones.findIndex(
              (ubicacion: { id: any }) => ubicacion.id === datosNuevaUbicacion.id
            );
            if (index !== -1) {
              ubicaciones[index] = data;
              setUbicaciones([...ubicaciones]);
            }
          }
        })
        .catch((e) => console.error(e));
  
      handleClose();
    };
  
    const handleClickDeleteCarga = () => {
      setOpenDialogDelete(true);
    };
  
    const handleCloseDialog = () => {
      setOpenDialogDelete(false);
    };
  
    return (
      <>
        <Box
          display="flex"
          flexDirection="column"
          gap={2}
          alignContent={"center"}
          alignItems={"center"}
          marginTop={2}
          marginBottom={1}
          margin={3}
        >
          <TextField
            id="outlined-basic"
            label="URL Google Maps"
            variant="outlined"
            onChange={seleccionarURLMaps}
            error={errorUrl}
            value={datosNuevaUbicacion.urlMaps}
            inputProps={{ maxLength: 200 }}
            sx={{ width: 350 }}
          />
          <TextField
            id="outlined-basic"
            label="Nombre"
            variant="outlined"
            onChange={setNombre}
            value={datosNuevaUbicacion.nombre}
            inputProps={{ maxLength: 50 }}
            sx={{ width: 350 }}
          />
          <Autocomplete
            options={tipoUbicacion}
            getOptionLabel={(option) => option.nombre}
            value={selectedTipo}
            onChange={seleccionarTipo}
            renderInput={(params) => (
              <TextField {...params} label="Tipo" sx={{ width: 350 }} error={errorTipo} />
            )}
            sx={{
              width: 350,
              background: "white",
              borderRadius: "6px",
            }}
            loading={estadoCarga}
          />
          <AutocompletarUbicacionLocalidad
            localidades={localidades}
            title="Localidad"
            datosNuevaUbicacion={datosNuevaUbicacion}
            setDatosNuevaUbicacion={setDatosNuevaUbicacion}
            error={errorLocalidad}
            estadoCarga={estadoCarga}
          />
        </Box>
        <Box margin={2} sx={{ display: "flex", justifyContent: "flex-start" }}>
          <Button onClick={handleClose} color="primary">
            Cancelar
          </Button>
          <Button onClick={handleSave} color="primary">
            Guardar
          </Button>
          <IconButton onClick={() => handleClickDeleteCarga()}>
            <DeleteOutlineIcon sx={{ fontSize: 20, color: "#d68384" }} />
          </IconButton>
        </Box>
        <Dialog open={openDialogDelete} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DeleteUbicacion
            id={datosNuevaUbicacion.id}
            handleCloseDialog={handleCloseDialog}
            handleClose={handleClose}
            refreshUbicaciones={refreshUbicaciones}
          />
        </Dialog>
      </>
    );
  }
  