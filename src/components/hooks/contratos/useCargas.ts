// hooks/useCargas.ts

import { useState, useEffect } from "react";

type Carga = any;

const useCargas = (
  cargasInput: string | Carga[] | undefined,
  backendURL: string
) => {
  const [cargas, setCargas] = useState<Carga[]>([]);

  useEffect(() => {
    // 1) Si ya es un array, lo usamos directamente
    if (Array.isArray(cargasInput)) {
      setCargas(cargasInput);
      return;
    }

    // 2) Si es un string válido, lo parseamos y hacemos fetch
    if (
      typeof cargasInput === "string" &&
      cargasInput.trim() !== "" &&
      cargasInput !== "No especificado"
    ) {
      const ids = cargasInput.split(",").map((id) => id.trim());
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
        .then((lista) => setCargas(lista))
        .catch((error) =>
          console.error("Error al cargar las cargas:", error)
        );
      return;
    }

    // 3) Cualquier otro caso (null, undefined, "No especificado", string vacío)
    setCargas([]);
  }, [cargasInput, backendURL]);

  return { cargas, setCargas };
};

export default useCargas;
