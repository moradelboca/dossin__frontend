import { createContext } from "react";

export const ValoresContexto = {
    backendURL: import.meta.env.VITE_BACKEND_URL,
    theme: {
        colores: {
            texto: "#000",
            azul: "#163660",
            azulOscuro: "#0e213b",
            gris: "#D9D9D9",
            grisOscuro: "#5c5c5c",
            grisClaro: "#f6f6f6",
        },
    },
};

export const ContextoGeneral = createContext({
    ...ValoresContexto,
});
