import { useState, useEffect, useContext } from "react";
import { ContextoGeneral } from "../Contexto";

export const useDataFetch = (endpoint: string, entidad: string, usarPruebas: boolean) => {
  const { backendURL, pruebas } = useContext(ContextoGeneral);
  const [datos, setDatos] = useState<any[]>([]);
  const [estadoCarga, setEstadoCarga] = useState("Cargando");
  const apiURL = usarPruebas ? pruebas : backendURL;

  const refreshDatos = () => {
    fetch(`${apiURL}/${endpoint}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true",
      },
    })
      .then((response) => response.json())
      .then((data) => {
        setDatos(data);
        setEstadoCarga("Cargado");
      })
      .catch(() => {
        console.error(`Error al obtener ${entidad}`);
        setEstadoCarga("Error");
      });
  };

  useEffect(() => {
    refreshDatos();
  }, [endpoint, apiURL]);

  return { datos, estadoCarga, refreshDatos };
};
