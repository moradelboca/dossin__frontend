import { createContext } from "react";

export const ValoresContexto = {
    backendURL: "http://localhost:3000/api",
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
