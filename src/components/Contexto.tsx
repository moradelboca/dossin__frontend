import { createContext } from "react";

export const ValoresContexto = {
    backendURL: process.env.REACT_APP_BACKEND_URL || 'http://localhost:3000',
    theme: {
        colores: {
            texto: "#000",
            azul: "#163660",
            azulOscuro: "#0e213b",
            gris: "#D9D9D9",
        },
    },
};

export const ContextoGeneral = createContext({
    ...ValoresContexto,
});
