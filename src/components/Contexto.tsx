import { createContext } from "react";

export const ValoresContexto = {
    backendURL:
        "https://db5e-2803-9800-988b-89d2-a0c9-5a23-7d9d-f7fb.ngrok-free.app/api",
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
