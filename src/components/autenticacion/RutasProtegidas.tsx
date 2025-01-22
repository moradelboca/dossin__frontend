import React, { useEffect, useState } from "react";
import { useAuth } from "./ContextoAuth";
import { useLocation } from "react-router-dom";
import Cookies from "js-cookie";

interface ProtectedRouteProps {
    children: React.ReactNode;
}

const RutasProtegidas = ({ children }: ProtectedRouteProps) => {
    const { autenticado, setAutenticado } = useAuth();
    const [verificando, setVerificando] = useState(true);
    const location = useLocation();

    useEffect(() => {
        const verificarToken = async () => {
            setVerificando(true);
            console.log("VERIFICANDO TOKEN");
            const accessToken = Cookies.get("accessToken");
            if (accessToken) {
                console.log("Token verificado correctamente");
                console.log(Cookies.get("accessToken"));
                setAutenticado(true);
            } else {
                console.log("No se encontró token");
                setAutenticado(false);
            }
            setVerificando(false);
        };

        verificarToken();
    }, [location.pathname, setAutenticado]);

    if (verificando) {
        return <div>Cargando...</div>;
    }

    if (!autenticado) {
        window.open("https://auth.dossin.com.ar/auth/google", "_self");
        return null;
    }
    return <>{children}</>;
};

export default RutasProtegidas;
