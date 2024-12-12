/* eslint-disable @typescript-eslint/no-explicit-any */

import { createContext, useState, useContext, ReactNode } from "react";

interface AuthContextProps {
    setAutenticado: any;
    autenticado: boolean;
    login: () => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [autenticado, setAutenticado] = useState(false);

    const login = () => setAutenticado(true);
    const logout = () => setAutenticado(false);

    return (
        <AuthContext.Provider
            value={{ autenticado, setAutenticado, login, logout }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth debe usarse dentro de un AuthProvider");
    }
    return context;
};
