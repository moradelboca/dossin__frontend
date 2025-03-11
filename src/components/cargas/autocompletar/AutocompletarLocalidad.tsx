import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import { ContextoStepper } from "../creadores/CrearCargaStepper";
import { useContext, useState } from "react";

interface AutocompletarProps {
    title: string;
    ubicaciones: any[];
    filtro: string;
}

export default function AutocompletarLocalidad(props: AutocompletarProps) {
    const { datosNuevaCarga, datosSinCompletar } = useContext(ContextoStepper);
    const { title, ubicaciones, filtro } = props;
    const [ubicacionSeleccionada, setUbicacionSeleccionada] = useState<any>(
        (datosNuevaCarga as any)["nombreUbicacion" + filtro] || null
      );
      
      const seleccionarUbicacion = (_event: any, seleccionado: string | null) => {
        if (seleccionado) {
          const ubicacionesStrings = ubicaciones.map(
            (ubicacion) =>
              `${ubicacion.nombre}, ${ubicacion.provincia}, ${ubicacion.pais}`
          );
          const index = ubicacionesStrings.indexOf(seleccionado);
          const ubicacionesIds = ubicaciones.map((ubicacion) => ubicacion.id);
          (datosNuevaCarga as any)["idUbicacion" + filtro] = ubicacionesIds[index];
          (datosNuevaCarga as any)["nombreUbicacion" + filtro] = seleccionado;
          setUbicacionSeleccionada(seleccionado);
        }
      };

    return (
        <Autocomplete
            disablePortal
            options={ubicaciones
                .filter((ubicacion) => ubicacion.tipoUbicacion === filtro)
                .map((ubicacion) => {
                    return `${ubicacion.nombre}, ${ubicacion.provincia}, ${ubicacion.pais}`;
                })}
            sx={{ width: 300 }}
            value={ubicacionSeleccionada}
            defaultValue={ubicacionSeleccionada}
            onChange={seleccionarUbicacion}
            renderInput={(params) => (
                <TextField
                    {...params}
                    error={!ubicacionSeleccionada ? datosSinCompletar : false}
                    label={title}
                />
            )}
        />
    );
}
