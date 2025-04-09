// hooks/useCargas.ts
import { useState, useEffect } from "react";

const useCargas = (cargasString: string | undefined, backendURL: string) => {
  const [cargas, setCargas] = useState<any[]>([]);

  useEffect(() => {
    if (cargasString && cargasString !== "No especificado") {
      const ids = cargasString.split(",").map((id: string) => id.trim());
      Promise.all(
        ids.map((id) =>
          fetch(`${backendURL}/cargas/${id}`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "ngrok-skip-browser-warning": "true",
            },
          }).then((res) => res.json())
        )
      )
        .then(setCargas)
        .catch((error) => console.error("Error al cargar las cargas:", error));
    } else {
      setCargas([]);
    }
  }, [cargasString, backendURL]);

  return { cargas, setCargas };
};

export default useCargas;
